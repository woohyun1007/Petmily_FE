import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080", // Spring Boot 서버 주소
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true
});

// 요청 인터셉터: 서버로 요청을 보내기 직전 실행
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 : 서버로부터 응답을 받은 후, 컴포넌트의 catch문으로 가기 직전 실행
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    console.log("인터셉터 에러 감지:", error.response?.status);

    if (error.response.status === 401 || error.response.status === 403) {
      if (originalRequest._retry) {
        return Promise.reject(error);
      }
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) throw new Error("No refresh Token");

        const res = await axios.post("http://localhost:8080/api/auth/reissue", {
          refreshToken: refreshToken,
        });


        const newAccessToken = res.data.tokenInfo.accessToken;
        const newRefreshToken = res.data.tokenInfo.refreshToken;

        if (newAccessToken) {
          localStorage.setItem("accessToken", newAccessToken);
          console.log("Access Token 갱신 완료");

          if (newRefreshToken) {
            localStorage.setItem("refreshToken", newRefreshToken);
            console.log("refresh Token 갱신 완료");
          }

          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          console.log("재요청을 보냅니다.");
          return api(originalRequest);
        }
      } catch (reissueError) {
        console.error("리프레시 실패", reissueError);
        localStorage.clear();
        return Promise.reject(reissueError);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
