import './App.css'
import React, { useState, userEffect } from 'react';
import Signup from './component/Signup'
import MyInfo from './component/MyInfo'
import Login from './component/Login';
import PostCreate from './component/PostCreate';
import PostList from './component/PostList';

function App() {

  const [isLogin, setIsLogin] = useState(!!localStorage.getItem('token'));
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePostSuccess = () => {
    setRefreshKey(prev => prev +1);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLogin(false);
  };

  return (
    <div>
      <h1>Petmily 프로젝트</h1>
      {!isLogin ? (
        <>
          <Signup/>
          <hr />
          <Login onLoginSuccess = {() => setIsLogin(true)}/>
        </>
      ) : (
        <>
          <p>환영합니다!</p>
          <button onClick={() => {handleLogout}}>
            로그아웃
          </button>
          <hr/>
          <MyInfo/>
          <hr/>
          <PostCreate onPostSuccess={handlePostSuccess} />
          <hr/>
          <PostList key={refreshKey} />
        </>
      )}
    </div>
  );
}

export default App
