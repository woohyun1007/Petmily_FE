import { clearCsrfToken } from "../api";

export const persistAuthSession = (payload = {}) => {
  const rawUserId = payload.userId || payload.id || payload.memberId || null;
  const nickname = payload.nickname || payload.name || payload.username || "";

  if (rawUserId !== null && rawUserId !== undefined && rawUserId !== "") {
    localStorage.setItem("userId", String(rawUserId));
  }

  if (nickname) {
    localStorage.setItem("nickname", nickname);
  }

  return {
    userId:
      rawUserId !== null && rawUserId !== undefined && rawUserId !== ""
        ? Number(rawUserId)
        : null,
    nickname,
  };
};

export const applyAuthState = ({ setIsLogin, setUserId }, session = {}) => {
  setIsLogin(true);
  if (session.userId !== null && session.userId !== undefined) {
    setUserId(Number(session.userId));
  }
};

export const completeAuthSession = (authHandlers, payload = {}) => {
  const session = persistAuthSession(payload);
  applyAuthState(authHandlers, session);
  clearCsrfToken();
  return session;
};

export const readAuthFromUrl = (search = "", hash = "") => {
  const searchParams = new URLSearchParams(search);
  const hashParams = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : hash);

  const get = (key) => searchParams.get(key) || hashParams.get(key);

  return {
    accessToken: get("accessToken"),
    refreshToken: get("refreshToken"),
    userId: get("userId") || get("id"),
    nickname: get("nickname"),
    code: get("code"),
    error: get("error"),
  };
};
