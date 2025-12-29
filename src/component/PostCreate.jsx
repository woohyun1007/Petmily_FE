import React, { useState } from 'react';
import api from '../api';

const PostCreate = ({ onPostSuccess }) => {
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    category: 'FREE', // 기본값
    status: 'PUBLIC',
    petId: null // 반려동물 선택 기능은 추후 추가
  });

  const handleChange = (e) => {
    setPostData({ ...postData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/posts', postData);
      alert('게시글이 등록되었습니다!');
      setPostData({ title: '', content: '', category: 'FREE', status: 'PUBLIC', petId: null });
      if (onPostSuccess) onPostSuccess(); // 목록 새로고침을 위한 콜백
    } catch (error) {
      alert('등록 실패: ' + (error.response?.data?.message || '에러 발생'));
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h3>📝 새 글 작성</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <select name="category" onChange={handleChange} value={postData.category}>
          <option value="FREE">자유게시판</option>
          <option value="ADOPTION">입양공고</option>
          <option value="SHOW">반려동물 자랑</option>
        </select>
        <input name="title" placeholder="제목을 입력하세요" value={postData.title} onChange={handleChange} required />
        <textarea name="content" placeholder="내용을 입력하세요" value={postData.content} onChange={handleChange} rows="5" required />
        <button type="submit" style={{ backgroundColor: '#4CAF50', color: 'white', padding: '10px' }}>등록하기</button>
      </form>
    </div>
  );
};

export default PostCreate;