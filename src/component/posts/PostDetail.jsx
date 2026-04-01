import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import CommentSection from "./CommentSection";
import { Button, Card, HelperText, PageContainer, Row, SubTitle } from "../../styles/ui";

const Meta = styled(Row)`
  gap: 8px;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 14px;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    font-size: 12px;
    gap: 6px;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  margin: 14px 0;
`;

const Content = styled.div`
  min-height: 200px;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.textSoft};

  @media (max-width: 640px) {
    min-height: 140px;
    font-size: 14px;
  }
`;

const PetThumb = styled.img`
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.colors.border};

  @media (max-width: 640px) {
    width: 84px;
    height: 84px;
  }
`;

const PostDetail = () => {
  const { id } = useParams(); // URL에서 post id 추출
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const { isLogin, userId } = useAuth();
  const isCareCategory =
    post?.category === "CARE_REQUEST" || post?.category === "CARE_OFFER";
  const isCareRequest = post?.category === "CARE_REQUEST";

  const getPriceUnitText = (unit) => {
    switch (unit) {
      case "PER_HOUR":
        return "시급";
      case "PER_DAY":
        return "일급";
      default:
        return "가격";
    }
  };

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
        navigate(-1);
      } catch (error) {
        alert("삭제 권한이 없거나 오류가 발생했습니다.");
      }
    }
  };

  if (!post) return <PageContainer>로딩 중...</PageContainer>;

  return (
    <PageContainer>
      <Card>
      <SubTitle>{post.title}</SubTitle>
      <Meta>
        <span><strong>작성자:</strong> {post.writerNickname}</span>
        <span>|</span>
        <span><strong>조회수:</strong> {post.viewCount}</span>
      </Meta>
      <Divider />
      <Content>{post.content}</Content>
      <Divider />
      {isCareCategory && (
        <>
          <HelperText>
            <strong>지역:</strong> {post.region || "미설정"} |{" "}
            <strong>{getPriceUnitText(post.priceUnit)}:</strong> {post.price ? `${post.price.toLocaleString()}원` : "미정"}
          </HelperText>
          <Divider />
        </>
      )}

      {isCareRequest && (
        <>
          <HelperText style={{ marginBottom: "8px", fontSize: "14px", color: "#111827", fontWeight: 700 }}>
            반려동물 정보
          </HelperText>
          {post.petImageUrl ? (
            <PetThumb
              src={`http://localhost:8080${post.petImageUrl}`}
              alt="반려동물"
            />
          ) : (
            <HelperText>No Image</HelperText>
          )}
          <HelperText style={{ marginTop: "8px" }}>이름: {post.petName || "-"}</HelperText>
          <Divider />
        </>
      )}

      <Button onClick={() => navigate(-1)} variant="secondary" style={{ width: "auto" }}>
        목록으로
      </Button>

      {/* 본인 글일 때만 수정/삭제 버튼 노출 (백엔드에서도 검증 필요) */}
      {isLogin && Number(userId) === Number(post.writerId) && (
        <Row style={{ marginTop: "10px" }}>
          <Button onClick={() => navigate(`/posts/update/${id}`)} style={{ width: "auto" }}>
            수정
          </Button>
          <Button
            onClick={handleDelete}
            variant="danger"
            style={{ width: "auto" }}
          >
            삭제
          </Button>
        </Row>
      )}
      <CommentSection postId={id} currentUserId={userId} />
    </Card>
    </PageContainer>
  );
};

export default PostDetail;
