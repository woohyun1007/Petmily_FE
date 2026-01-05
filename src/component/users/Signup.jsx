import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const Signup = () => {
  const [formData, setFormData] = useState({
    loginId: '',
    password: '',
    email: '',
    username: '',
    roles: 'OWNER',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/users', formData);
      alert('회원가입 성공!');
      navigate('/');
    } catch (error) {
      alert('실패: ' + (error.response?.data?.message || '서버 에러'));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>회원가입</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '300px' }}>
        <input name="loginId" placeholder="아이디" onChange={handleChange} />
        <input name="password" type="password" placeholder="비밀번호" onChange={handleChange} />
        <input name="email" type="email" placeholder="이메일" onChange={handleChange} />
        <input name="nickname" placeholder="이름" onChange={handleChange} />
        <select name="roles" placeholder="역할" value={formData.roles} onChange={handleChange}>
        <option value="OWNER">OWNER</option>
        <option value="SITTER">SITTER</option>
      </select>
        <button type="submit">가입하기</button>
      </form>
    </div>
  );
};

export default Signup;