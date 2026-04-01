import { Routes, Route, Navigate } from "react-router-dom";
import React from "react";
import styled from "styled-components";
import Navbar from "./component/Navbar";
import Home from "./component/Home";
import Signup from "./component/users/Signup";
import MyInfo from "./component/users/MyInfo";
import Login from "./component/users/Login";
import KakaoCallback from "./component/users/KakaoCallback";
import PostCreate from "./component/posts/PostCreate";
import PostUpdate from "./component/posts/PostUpdate";
import PostPage from "./component/posts/PostPage";
import PetManagement from "./component/pets/PetManagement";
import PostDetail from "./component/posts/PostDetail";
import PostMap from "./component/posts/PostMap";
import MyInfoUpdate from "./component/users/MyInfoUpdate";
import PasswordUpdate from "./component/users/PasswordUpdate";
import { useAuth } from "./context/AuthContext";

const AppShell = styled.div`
  max-width: ${({ theme }) => theme.layout.maxWidth};
  margin: 0 auto;
  padding: 14px 12px 20px;

  @media (max-width: 720px) {
    padding: 10px 8px 14px;
  }
`;

const StatusCard = styled.div`
  margin-top: 60px;
  padding: 24px;
  border-radius: ${({ theme }) => theme.radius.lg};
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.border};
  box-shadow: ${({ theme }) => theme.shadow.sm};
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;

function App() {
  const { isLogin, loading } = useAuth();

  if (loading) {
    return <StatusCard>인증 확인 중...</StatusCard>;
  }

  return (
    <AppShell>
      {/* 모든 페이지에 공통으로 보일 상단 바 */}
      <Navbar />

      <Routes>
        {/* 메인 페이지: 게시글 목록 */}
        <Route path="/" element={<Home />} />
        <Route path="/posts" element={<PostPage />} />
        {/* 회원가입 & 로그인: 로그인 안 된 사용자만 접근 */}
        <Route
          path="/signup"
          element={!isLogin ? <Signup /> : <Navigate to="/" replace />}
        />
        <Route
          path="/login"
          element={!isLogin ? <Login /> : <Navigate to="/" replace />}
        />
        <Route path="/auth/kakao/callback" element={<KakaoCallback />} />
        {/* 내 정보 & 글쓰기: 로그인한 사용자 전용 */}
        <Route
          path="/myinfo"
          element={isLogin ? <MyInfo /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/pets"
          element={
            isLogin ? <PetManagement /> : <Navigate to="/login" replace />
          }
        />
        <Route
          path="/myinfo/update"
          element={isLogin ? <MyInfoUpdate /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/myinfo/passwordupdate"
          element={isLogin ? <PasswordUpdate /> : <Navigate to="/login" replace />}
        />
        {/* 글쓰기 */}
        <Route path="/post/:id" element={<PostDetail />} />
        {/* 게시글 단건 조회 */}
        <Route
          path="/posts/update/:id"
          element={isLogin ? <PostUpdate /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/posts/create"
          element={isLogin ? <PostCreate /> : <Navigate to="/login" replace />}
        />
        <Route path="/posts/map" element={<PostMap />} />
        {/* 404 페이지 처리 (선택) */}
        <Route path="*" element={<StatusCard>페이지를 찾을 수 없습니다.</StatusCard>} />
      </Routes>
    </AppShell>
  );
}

export default App;
