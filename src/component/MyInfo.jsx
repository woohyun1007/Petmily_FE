import React, { useEffect, useState } from 'react';
import api from '../api';

const MyInfo = () => {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await api.get('/api/users');
        setUserInfo(response.data);
      } catch (error) {
        console.error("데이터를 가져오는데 실패했습니다.", error);
      }
    };
    fetchInfo();
  }, []);

  if (!userInfo) return <div>정보를 불러오는 중...</div>;

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', marginTop: '20px' }}>
      <h3>내 정보</h3>
      <p>아이디: {userInfo.loginId}</p>
      <p>이름: {userInfo.username}</p>
      <p>이메일: {userInfo.email}</p>
    </div>
  );
};

export default MyInfo;