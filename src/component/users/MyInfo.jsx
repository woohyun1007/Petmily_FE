import React, { useEffect, useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const MyInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const navigate = useNavigate();

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
      <p>이름: {userInfo.nickname}</p>
      <p>이메일: {userInfo.email}</p>
      <div style={{ marginTop: '10px' }}>
      <button onClick={() => navigate(`/myinfo/update`)}>수정</button>
      <button onClick={() => navigate(`/myinfo/passwordupdate`)}>비밀번호 변경</button>

      </div>
    </div>
  );
};

export default MyInfo;