import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useNavigationGuard from '../../hooks/useNavigationGuard';
import api from '../../api';

const MyInfoUpdate = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState({
    loginId: '',
    nickname: '',
    email: ''
  });
  const [loading, setLoading] = useState(true);
  const [isDirty, setIsDirty] = useState(false);

  useNavigationGuard(isDirty, "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?");


  // 1. 현재 로그인한 사용자의 정보 불러오기
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await api.get('/api/users');
        setUser(response.data);
        setIsDirty(false);
        setLoading(false);
      } catch (error) {
        alert('사용자 정보를 불러오는데 실패했습니다.');
        navigate('/');
      }
    };
    fetchUserData();
  }, [navigate]);

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prev => ({
      ...prev,
      [name]: value
    }));
    setIsDirty(true);
  };

  // 2. 수정한 정보 저장하기
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // 닉네임만 변경 가능하게 한다면 { nickname: user.nickname } 형태로 전송
      await api.patch('/api/users', user);
      alert('정보가 성공적으로 변경되었습니다.');
      setIsDirty(false);
      navigate('/myinfo'); // 마이페이지 메인으로 이동
    } catch (error) {
      alert('변경 실패: ' + (error.response?.data?.message || '오류가 발생했습니다.'));
    }
  };

  if (loading) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '0 auto' }}>
      <h2>👤 내 정보 수정</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label>아이디</label>
          <input 
            type="text"
            name="loginId" 
            value={user.loginId}
            onChange={handleChange} 
            style={{ width: '100%', backgroundColor: '#f0f0f0' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>이메일</label>
          <input 
            type="email" 
            name="email"
            value={user.email} 
            onChange={handleChange}
            style={{ width: '100%' }}
            required
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label>닉네임</label>
          <input 
            type="text" 
            name="nickname"
            value={user.nickname} 
            onChange={handleChange}
            style={{ width: '100%' }}
            required
          />
        </div>

        <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none' }}>
          저장하기
        </button>
        <button type="button" onClick={() => { setIsDirty(false); navigate(-1); }} style={{ width: '100%', marginTop: '5px', padding: '10px' }}>
          취소
        </button>
      </form>
    </div>
  );
};

export default MyInfoUpdate;