import React, { useEffect, useState } from 'react';
import api from '../api';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // 백엔드에서 페이징 처리된 데이터를 가져옵니다. (기본 0페이지, 10개)
        const response = await api.get('/api/posts?page=0&size=10');
        // Spring Data Page 객체는 content 안에 실제 리스트가 들어있습니다.
        setPosts(response.data.content || []);
      } catch (error) {
        console.error("게시글 로딩 실패:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div>게시글을 불러오는 중...</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>🐾 커뮤니티 게시글</h2>
      {posts.length === 0 ? (
        <p>등록된 게시글이 없습니다.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ccc' }}>
              <th>카테고리</th>
              <th>제목</th>
              <th>작성자</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} style={{ borderBottom: '1px solid #eee', textAlign: 'center' }}>
                <td>{post.category}</td>
                <td style={{ textAlign: 'left', padding: '10px', cursor: 'pointer' }}>
                  {post.title}
                </td>
                <td>{post.authorName}</td>
                <td>{post.viewCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default PostList;