import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../api";

const PostDetail = () => {
  const { id } = useParams(); // URL에서 post id 추출
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const isLogin = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/api/posts/${id}`);
        setPost(response.data);
      } catch (error) {
        alert("게시글을 불러올 수 없습니다.");
        navigate("/");
      }
    };
    fetchPost();
  }, [id, navigate]);

  const handleDelete = async () => {
    if (window.confirm("정말 삭제하시겠습니까?")) {
      try {
        await api.delete(`/api/posts/${id}`);
        alert("삭제되었습니다.");
        navigate("/"); // 삭제 후 목록으로 이동
      } catch (error) {
        alert("삭제 권한이 없거나 오류가 발생했습니다.");
      }
    }
  };

  if (!post) return <div>로딩 중...</div>;

  return (
    <div style={{ padding: "20px", border: "1px solid #ddd" }}>
      <h3>{post.title}</h3>
      <p>
        <strong>작성자:</strong> {post.writerNickname} |
        <strong>조회수:</strong> {post.viewCount}
      </p>
      <hr />
      <div style={{ minHeight: "200px", whiteSpace: "pre-wrap" }}>
        {post.content}
      </div>
      <hr />
      <p>
        <strong>지역:</strong> {post.region} | <strong>가격: </strong>
        {post.price}
      </p>
      <hr />
      <p>
        <strong>반려동물 정보</strong>
      </p>
      <p>이름: {post.petName} | 사진: {post.petImage}</p>
      <hr />
      <button onClick={() => navigate("/")}>목록으로</button>

      {/* 본인 글일 때만 수정/삭제 버튼 노출 (백엔드에서도 검증 필요) */}
      <div style={{ marginTop: "10px" }}>
        <button onClick={() => navigate(`/post/update/${id}`)}>수정</button>
        <button
          onClick={handleDelete}
          style={{ color: "red", marginLeft: "10px" }}
        >
          삭제
        </button>
      </div>
    </div>
  );
};

export default PostDetail;
