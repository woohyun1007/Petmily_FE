import axios from "axios";

const CSRF_COOKIE_NAME = "XSRF-TOKEN";
const CSRF_HEADER_NAME = "X-XSRF-TOKEN";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const CSRF_ENDPOINT = "/api/auth/csrf";
const DEFAULT_CSRF_TTL_MS = 30 * 60 * 1000;
const CSRF_EXPIRY_SKEW_MS = 30 * 1000;

let cachedCsrfToken = null;
let cachedCsrfHeaderName = CSRF_HEADER_NAME;
let cachedCsrfExpiresAt = 0;
let csrfFetchPromise = null;

const csrfApi = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
});

const isSafeMethod = (method = "get") =>
  ["get", "head", "options", "trace"].includes(method.toLowerCase());

const isCsrfBootstrapRequest = (url = "") => url.includes(CSRF_ENDPOINT);

const readCookie = (name) => {
  if (typeof document === "undefined") return null;

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")
    .slice(1)
    .join("=");

  return value ? decodeURIComponent(value) : null;
};

const getHeader = (headers, name) => {
  if (!headers) return null;
  if (typeof headers.get === "function") return headers.get(name);
  return headers[name] || headers[name.toLowerCase()] || null;
};

const setHeader = (headers, name, value) => {
  if (typeof headers.set === "function") {
    headers.set(name, value);
  } else {
    headers[name] = value;
  }
};

export const getApiErrorMessage = (
  error,
  fallback = "요청 처리 중 오류가 발생했습니다.",
) => {
  const data = error?.response?.data;

  if (!data) {
    return error?.message || fallback;
  }

  if (typeof data === "string") {
    return data || fallback;
  }

  if (data.message) {
    return data.message;
  }

  if (data.error) {
    return data.error;
  }

  if (data.detail) {
    return data.detail;
  }

  if (Array.isArray(data.errors) && data.errors.length > 0) {
    const firstError = data.errors[0];
    return firstError?.message || firstError?.defaultMessage || fallback;
  }

  if (data.errors && typeof data.errors === "object") {
    const firstError = Object.values(data.errors)[0];
    return Array.isArray(firstError) ? firstError[0] : firstError || fallback;
  }

  return fallback;
};

const extractCsrf = (response) => {
  const data = response.data || {};
  const token =
    data.token ||
    data.csrfToken ||
    data._csrf?.token ||
    getHeader(response.headers, CSRF_HEADER_NAME) ||
    readCookie(CSRF_COOKIE_NAME);
  const headerName =
    data.headerName ||
    data.csrfHeaderName ||
    data._csrf?.headerName ||
    CSRF_HEADER_NAME;
  const expiresAt =
    data.expiresAt ||
    data.csrfExpiresAt ||
    data._csrf?.expiresAt ||
    null;
  const expiresIn =
    data.expiresIn ||
    data.expiresInSeconds ||
    data.maxAge ||
    data.maxAgeSeconds ||
    data._csrf?.expiresIn ||
    null;

  if (!token) return null;

  let expiresAtMs = Date.now() + DEFAULT_CSRF_TTL_MS;

  if (expiresAt) {
    const parsedExpiresAt = new Date(expiresAt).getTime();
    if (!Number.isNaN(parsedExpiresAt)) {
      expiresAtMs = parsedExpiresAt;
    }
  } else if (expiresIn) {
    const parsedExpiresIn = Number(expiresIn);
    if (!Number.isNaN(parsedExpiresIn)) {
      expiresAtMs = Date.now() + parsedExpiresIn * 1000;
    }
  }

  return {
    token: decodeURIComponent(token),
    headerName,
    expiresAt: expiresAtMs - CSRF_EXPIRY_SKEW_MS,
  };
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  xsrfCookieName: CSRF_COOKIE_NAME,
  xsrfHeaderName: CSRF_HEADER_NAME,
});

const rememberCsrf = (csrf) => {
  cachedCsrfToken = csrf.token;
  cachedCsrfHeaderName = csrf.headerName;
  cachedCsrfExpiresAt = csrf.expiresAt;
  return csrf;
};

const fetchCsrfFromServer = async () => {
  const response = await csrfApi.get(CSRF_ENDPOINT);
  const csrf = extractCsrf(response);

  return csrf?.token ? rememberCsrf(csrf) : null;
};

const getCachedCsrf = () => {
  const cookieToken = readCookie(CSRF_COOKIE_NAME);

  if (
    cachedCsrfToken &&
    cookieToken === cachedCsrfToken &&
    Date.now() < cachedCsrfExpiresAt
  ) {
    return { token: cachedCsrfToken, headerName: cachedCsrfHeaderName };
  }

  if (cookieToken && cookieToken !== cachedCsrfToken) {
    return rememberCsrf({
      token: cookieToken,
      headerName: CSRF_HEADER_NAME,
      expiresAt: Date.now() + DEFAULT_CSRF_TTL_MS - CSRF_EXPIRY_SKEW_MS,
    });
  }

  return null;
};

const getCsrfToken = async () => {
  const cached = getCachedCsrf();
  if (cached) return cached;

  if (!csrfFetchPromise) {
    csrfFetchPromise = fetchCsrfFromServer().finally(() => {
      csrfFetchPromise = null;
    });
  }

  return csrfFetchPromise;
};

export const ensureCsrfToken = async () => {
  clearCsrfToken();
  return getCsrfToken();
};

export const clearCsrfToken = () => {
  cachedCsrfToken = null;
  cachedCsrfHeaderName = CSRF_HEADER_NAME;
  cachedCsrfExpiresAt = 0;
  csrfFetchPromise = null;
};

api.interceptors.request.use(
  async (config) => {
    config.withCredentials = true;

    const method = (config.method || "get").toLowerCase();
    const requestUrl = config.url || "";
    const shouldAttachCsrf =
      !isSafeMethod(method) && !isCsrfBootstrapRequest(requestUrl);

    if (shouldAttachCsrf) {
      const csrf = await getCsrfToken();

      if (csrf?.token) {
        config.headers = axios.AxiosHeaders.from(config.headers || {});
        setHeader(config.headers, csrf.headerName, csrf.token);
      } else {
        return Promise.reject(
          new Error("CSRF token was not issued by the server."),
        );
      }
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const method = (originalRequest?.method || "get").toLowerCase();
    const requestUrl = originalRequest?.url || "";
    const isAuthEndpoint =
      requestUrl.includes("/api/auth/reissue") ||
      requestUrl.includes("/api/auth/login") ||
      requestUrl.includes("/api/auth/logout");

    if (
      status === 403 &&
      originalRequest &&
      !originalRequest._csrfRetry &&
      !isSafeMethod(method) &&
      !isCsrfBootstrapRequest(requestUrl)
    ) {
      originalRequest._csrfRetry = true;

      try {
        await ensureCsrfToken();
        return api(originalRequest);
      } catch (csrfError) {
        return Promise.reject(csrfError);
      }
    }

    if (status === 401 || (status === 403 && isSafeMethod(method))) {
      if (!originalRequest || originalRequest._authRetry || isAuthEndpoint) {
        return Promise.reject(error);
      }

      originalRequest._authRetry = true;

      try {
        await ensureCsrfToken();
        await api.post("/api/auth/reissue", {});
        return api(originalRequest);
      } catch (reissueError) {
        localStorage.removeItem("userId");
        localStorage.removeItem("nickname");
        return Promise.reject(reissueError);
      }
    }

    return Promise.reject(error);
  },
);

export default api;
