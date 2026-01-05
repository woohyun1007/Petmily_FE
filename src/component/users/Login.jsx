import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Login = ({onLoginSuccess}) => {
  const [loginData, setLoginData] = useState({
    loginId: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 서버의 로그인 엔드포인트로 요청 (보통 /login 또는 /api/login)
      const response = await api.post('/api/login', loginData);
      
      // 서버가 토큰을 'token'이라는 이름으로 준다고 가정
      const token = response.data.token; 
      
      if (token) {
        localStorage.setItem('token', token); // 브라우저에 토큰 저장
        
        if (onLoginSuccess) {
          onLoginSuccess();
          alert('로그인 성공!');
          navigate('/');
        }
      }
    } catch (error) {
      alert('로그인 실패: ' + (error.response?.data?.message || '아이디 또는 비밀번호를 확인하세요.'));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>로그인</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input name="loginId" placeholder="아이디" onChange={handleChange} />
        <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
        <button type="submit">로그인</button>
      </form>
    </div>
  );
};

export default Login;