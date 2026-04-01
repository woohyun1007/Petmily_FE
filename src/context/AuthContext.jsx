import React, { createContext, useContext, useState, useEffect } from "react";
import api from "../api";
import { persistAuthSession } from "../utils/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLogin, setIsLogin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);

  const checkAuth = async () => {
    const token = localStorage.getItem("accessToken");
    const currentUserId = localStorage.getItem("userId");

    if (!token) {
      setIsLogin(false);
      setUserId(null);
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
      console.log("인증 성공");
    } catch (error) {
      setIsLogin(false);
      setUserId(null);
      console.error("인증 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  // 로그아웃 함수도 여기서 한 번에 관리
  const logout = () => {
    localStorage.clear();
    setIsLogin(false);
    setUserId(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ isLogin, setIsLogin, userId, setUserId, loading, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
