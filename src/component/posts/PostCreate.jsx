import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import LocationAuthModal from "../common/LocationAuthModal";
import api from "../../api";
import {
  Button,
  Card,
  Form,
  HelperText,
  Input,
  PageContainer,
  Row,
  Select,
  SubTitle,
  TextArea,
} from "../../styles/ui";

const ContentField = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
`;

const Counter = styled.div`
  position: absolute;
  bottom: 10px;
  right: 10px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const CareSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border-radius: ${({ theme }) => theme.radius.md};
  background: #f8fafc;
  border: 1px solid ${({ theme }) => theme.colors.border};
`;

const FlexGrow = styled.div`
  flex: 1;
`;

const LocationRow = styled(Row)`
  @media (max-width: 640px) {
    align-items: stretch;

    & > * {
      width: 100%;
    }
  }
`;

const ActionRow = styled(Row)`
  @media (max-width: 640px) {
    flex-direction: column;

    & > button {
      width: 100% !important;
    }
  }
`;

const PostCreate = ({ onPostSuccess }) => {
  const [post, setPost] = useState({
    title: "",
    content: "",
    province: "",
    city: "",
    district: "",
    latitude: null,
    longitude: null,
    priceUnit: "PER_HOUR",
    price: "",
    category: "CARE_REQUEST",
    status: "WAITING",
    petId: "",
  });

  const [pets, setPets] = useState([]);
  const [isDirty, setIsDirty] = useState(false);
  const [showLocationAuthModal, setShowLocationAuthModal] = useState(false);
  const allowNavigateRef = useRef(false);
  const navigate = useNavigate();

  useNavigationGuard(
    isDirty,
    allowNavigateRef,
    "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?"
  );

  useEffect(() => {
    if (allowNavigateRef.current && !isDirty) {
      allowNavigateRef.current = false;
    }
  }, [isDirty]);


  useEffect(() => {
    const fetchPets = async () => {
      try {
        const response = await api.get("/api/pets");
        setPets(response.data);
      } catch (error) {
        console.error("반려동물 목록 로딩 실패: ", error);
      }
    };
    fetchPets();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost({ ...post, [name]: value });
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("작성 중인 내용이 사라집니다. 돌아가시겠습니까?")) {
        setIsDirty(false);
        allowNavigateRef.current = true;
        navigate(-1);
      }
    } else {
      navigate(-1);
    }
  };

  const handleLocationAuth = (lat, lng, province, city, district) => {
    setPost({ ...post, latitude: lat, longitude: lng, province, city, district });
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!post.title || post.title.trim().length < 2) {
      alert("제목은 최소 2글자 이상 입력해주세요.");
      return;
    }
    if (!post.content) {
      alert("내용을 입력해주세요.");
      return;
    } else if (post.content.trim().length > 100) {
      alert("내용은 100자 이하입니다.");
      return;
    }
    if (post.category === "CARE_REQUEST" || post.category === "CARE_OFFER") {
      if (!post.province || !post.city || !post.district) {
        alert("위치 인증을 먼저 진행해주세요.");
        return;
      }
      if (!post.price) {
        alert("가격을 정확히 입력해주세요.");
        return;
      }
      if (post.category === "CARE_REQUEST" && !post.petId) {
        alert("반려동물을 선택해주세요.");
        return;
      }
    }
    try {
      const postData = { ...post, region: `${post.province} ${post.city} ${post.district}` };
      await api.post("/api/posts", postData);
      alert("게시글이 등록되었습니다!");
      if (onPostSuccess) onPostSuccess(); // 목록 새로고침을 위한 콜백
      setIsDirty(false);
      allowNavigateRef.current = true;
      navigate(`/posts?category=${post.category}`);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "등록 중 오류가 발생했습니다.";
      alert(`등록 실패: ${errorMessage}`);
    }
  };

  return (
    <PageContainer>
      <Card>
      <SubTitle>📝 새 글 작성</SubTitle>
      <Form onSubmit={handleSubmit}>
        <Select name="category" onChange={handleChange} value={post.category}>
          <option value="CARE_REQUEST">돌봄이구인</option>
          <option value="CARE_OFFER">돌봄이구직</option>
          <option value="COMMUNITY">자유게시판</option>
          <option value="QNA">Q&A</option>
        </Select>
        {/* 공통 입력창(제목, 내용) */}
        <Input
          name="title"
          placeholder="제목을 입력하세요"
          value={post.title}
          onChange={handleChange}
        />
        <ContentField>
          <TextArea
            name="content"
            placeholder="내용을 입력하세요 (최대 100자)"
            value={post.content}
            onChange={handleChange}
            rows="5"
            maxLength="100" // 브라우저 차원에서 100자 이상 입력 차단
            required
            style={{ paddingBottom: "25px" }} // 글자수 표시와 겹치지 않게 하단 여백 추가
          />
          <Counter>
            {post.content.length} / 100
          </Counter>
        </ContentField>
        {/* 돌봄이구인 or 구직 일때만 보이는 입력창 */}
        {(post.category === "CARE_REQUEST" ||
          post.category === "CARE_OFFER") && (
          <CareSection>
            <LocationRow>
              <FlexGrow>
                <HelperText style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#111827" }}>
                  지역: {post.province && post.city && post.district ? `${post.province} ${post.city} ${post.district}` : "지역을 설정하세요"}
                </HelperText>
              </FlexGrow>
              <Button
                type="button"
                onClick={() => setShowLocationAuthModal(true)}
                style={{ whiteSpace: "nowrap", backgroundColor: "#f59e0b" }}
              >
                📍 위치 인증
              </Button>
            </LocationRow>
            <div>
            <Select
              name="priceUnit"
              value={post.priceUnit}
              onChange={handleChange}
              style={{ flex: 1, padding: "8px" }}>
                <option value={"PER_HOUR"}>시급</option>
                <option value={"PER_DAY"}>일급</option>
            </Select>
            <TextArea
              name="price"
              type="number"
              placeholder="가격을 입력하세요"
              value={post.price}
              onChange={handleChange}
              rows="1"
            />
            </div>
          </CareSection>
        )}
        {post.category === "CARE_REQUEST" && (
          <div>
            <Select name="petId" value={post.petId} onChange={handleChange}>
              <option value="">-- 반려동물 선택 --</option>
              {pets.map((pet) => (
                <option key={pet.id} value={pet.id}>
                  {pet.name} ({pet.type})
                </option>
              ))}
            </Select>
            {pets.length === 0 && (
              <HelperText danger>
                * 등록된 반려동물이 없습니다. 마이페이지에서 먼저 등록해주세요.
              </HelperText>
            )}
          </div>
        )}
        <ActionRow>
          <Button
            type="submit"
            style={{ backgroundColor: "#16a34a", width: "auto" }}
          >
            등록하기
          </Button>
          <Button
            type="button"
            onClick={handleCancel}
            variant="danger"
            style={{ width: "auto" }}
          >
            취소
          </Button>
        </ActionRow>
      </Form>

      <LocationAuthModal
        isOpen={showLocationAuthModal}
        onClose={() => setShowLocationAuthModal(false)}
        onConfirm={handleLocationAuth}
      />
    </Card>
    </PageContainer>
  );
};

export default PostCreate;
