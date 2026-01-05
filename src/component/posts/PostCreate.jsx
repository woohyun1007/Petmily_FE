import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api';

const PostCreate = ({ onPostSuccess }) => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    region: '',
    price: '',
    category: '', // 기본값
    status: 'WAITING',
    petName: ''
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/posts', postData);
      alert('게시글이 등록되었습니다!');
      setPostData({ title: '', content: '', region: '', price: '', category: 'CAREREQUEST', status: 'WAITING', petName: null });
      if (onPostSuccess) onPostSuccess(); // 목록 새로고침을 위한 콜백
      navigate('/');
    } catch (error) {
      alert('등록 실패: ' + (error.response?.data?.message || '에러 발생'));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📝 새 글 작성</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select name="category" onChange={handleChange} value={postData.category}>
          <option value="CAREREQUEST">돌봄이구인</option>
          <option value="CAREOFFER">돌봄이구직</option>
          <option value="QnA">QnA</option>
          <option value="FREE">자유게시판</option>
        </select>
        <input name="title" placeholder="제목을 입력하세요" value={postData.title} onChange={handleChange} required />
        <textarea name="content" placeholder="내용을 입력하세요" value={postData.content} onChange={handleChange} rows="5" required />
        <textarea name="region" placeholder="지역을 입력하세요" value={postData.region} onChange={handleChange} />
        <textarea name="price" placeholder="가격을 입력하세요" value={postData.price} onChange={handleChange} />
        <textarea name="petName" placeholder="반려동물을 등록하세요" value={postData.petName} onChange={handleChange} />
        <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px' }}>등록하기</button>
      </form>
    </div>
  );
};

export default PostCreate;