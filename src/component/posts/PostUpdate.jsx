import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api';

const PostUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useEffect(() => {
    // 기존 데이터 불러오기
    api.get(`/api/posts/${id}`).then(res => {
      setTitle(res.data.title);
      setContent(res.data.content);
    });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.patch(`/api/posts/${id}`, { title, content });
      alert('수정되었습니다.');
      navigate(`/post/${id}`); // 수정 후 상세 페이지로 이동
    } catch (error) {
      alert('수정 실패: ' + (error.response?.data?.message || '권한이 없습니다.'));
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>📝 게시글 수정</h2>
      <form onSubmit={handleSubmit}>
        <input 
          style={{ width: '100%', marginBottom: '10px' }}
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          required 
        />
        <textarea 
          style={{ width: '100%', height: '300px' }}
          value={content} 
          onChange={(e) => setContent(e.target.value)} 
          required 
        />
        <button type="submit">수정 완료</button>
        <button type="button" onClick={() => navigate(-1)}>취소</button>
      </form>
    </div>
  );
};

export default PostUpdate;