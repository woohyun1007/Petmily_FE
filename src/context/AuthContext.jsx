import React, { createContext, useContext, useState, useEffect } from "react";
import api, { clearCsrfToken, ensureCsrfToken } from "../api";
import { persistAuthSession } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const OAUTH_PENDING_KEY = "oauthLoginInProgress";
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const checkAuth = async () => {
    const currentUserId = localStorage.getItem("userId");
    const isOauthPending =
      sessionStorage.getItem(OAUTH_PENDING_KEY) === "true";

    if (!currentUserId && !isOauthPending) {
      setIsLogin(false);
      setUserId(null);
      setLoading(false);
      return;
    }

    try {
      const response = await api.get("/api/auth");
      const session = persistAuthSession(response.data || {});
      setIsLogin(true);
      if (session.userId !== null && session.userId !== undefined) {
        setUserId(Number(session.userId));
      } else if (currentUserId) {
        setUserId(Number(currentUserId));
      }
      // console.log("인증 성공");
    } catch (error) {
      const status = error.response?.status;
      setIsLogin(false);
      setUserId(null);
      localStorage.removeItem("userId");
      localStorage.removeItem("nickname");
      if (status === 401 || status === 403) {
        console.log("미인증 상태");
      } else {
        console.error("인증 확인 실패", error);
      }
    } finally {
      if (isOauthPending) {
        sessionStorage.removeItem(OAUTH_PENDING_KEY);
      }
      setLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        await ensureCsrfToken();
      } catch (error) {
        console.warn("CSRF 초기 발급 실패", error);
      }

      await checkAuth();
    };

    initializeAuth();
  }, []);

  // 로그아웃 함수도 여기서 한 번에 관리
  const logout = async () => {
    let kakaoLogoutUrl = null;

    try {
      await ensureCsrfToken();
      const response = await api.delete("/api/auth/logout");
      kakaoLogoutUrl = response.data?.kakaoLogoutUrl || null;
    } catch (error) {
      console.error("로그아웃 중 오류 발생: ", error);
    }

    // 클라이언트에 저장된 세션 관련 정보 정리
    localStorage.clear();
    clearCsrfToken();
    // CSRF 부트스트랩 허용 플래그(있다면) 제거
    try {
      sessionStorage.removeItem("csrfBootstrapAllowed");
      sessionStorage.removeItem("oauthLoginInProgress");
    } catch {
      // ignore
    }
    setIsLogin(false);
    setUserId(null);
    window.location.href = kakaoLogoutUrl || "/";
  };

  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin, userId, setUserId, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
