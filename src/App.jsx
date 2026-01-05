import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, userEffect } from 'react';
import Navbar from './component/Navbar';
import Signup from './component/users/Signup';
import MyInfo from './component/users/MyInfo';
import Login from './component/users/Login';
import PostCreate from './component/posts/PostCreate';
import PostList from './component/posts/PostList';
import PetManagement from './component/pets/PetManagement';
import PostDetail from './component/posts/PostDetail';
import PostUpdate from './component/posts/PostUpdate';
import MyInfoUpdate from './component/users/MyInfoUpdate';
import PasswordUpdate from './component/users/PasswordUpdate';

function App() {

  const [isLogin, setIsLogin] = useState(!!localStorage.getItem('token'));
  const handleLoginSuccess = () => {
    setIsLogin(true);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* 모든 페이지에 공통으로 보일 상단 바 */}
      <Navbar isLogin={isLogin} />

      <Routes>
        {/* 메인 페이지: 게시글 목록 */}
        <Route path="/" element={<PostList />} />

        {/* 회원가입 & 로그인: 로그인 안 된 사용자만 접근 */}
        <Route path="/signup" element={!isLogin ? <Signup /> : <Navigate to="/login" />} />
        <Route path="/login" element={!isLogin ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />} />

        {/* 내 정보 & 글쓰기: 로그인한 사용자 전용 */}
        <Route path="/myinfo" element={isLogin ? <MyInfo /> : <Navigate to="/login" />} />
        <Route path="/pets" element={isLogin ? <PetManagement /> : <Navigate to="/login" />} />
        <Route path="/myinfo/update" element={<MyInfoUpdate />} />
        <Route path="/myinfo/passwordupdate" element={<PasswordUpdate />} />

        
        {/* 글쓰기 */}
        <Route path="/post/:id" element={<PostDetail />} />   {/* 게시글 단건 조회 */}
        <Route path="/post/update/:id" element={isLogin ? <PostUpdate /> : <Navigate to="/login" />} />
        <Route path="/post/create" element={isLogin ? <PostCreate /> : <Navigate to="/login" />} />

        {/* 404 페이지 처리 (선택) */}
        <Route path="*" element={<div>페이지를 찾을 수 없습니다.</div>} />
      </Routes>
    </div>
  );
}

export default App
