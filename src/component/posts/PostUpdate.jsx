import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../../api";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import LocationAuthModal from "../common/LocationAuthModal";
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

const LocationRow = styled(Row)`
  @media (max-width: 640px) {
    align-items: stretch;

    & > * {
      width: 100%;
      margin-left: 0 !important;
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

const PostUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUserId = Number(localStorage.getItem("userId"));
  const allowNavigateRef = useRef(false);
  const [post, setPost] = useState({
    title: "",
    content: "",
    category: "",
    province: "",
    city: "",
    district: "",
    latitude: null,
    longitude: null,
    priceUnit: "PER_HOUR",
    price: "",
    petId: "",
  });
  const [pets, setPets] = useState([]);
  const [showLocationAuthModal, setShowLocationAuthModal] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useNavigationGuard(
    isDirty,
    allowNavigateRef,
    "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?"
  );

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await api.get(`/api/posts/${id}`);
        const data = response.data;
        const regionParts = data.region ? data.region.split(" ") : [];

        if (Number(data.writerId) !== currentUserId) {
          alert("수정 권한이 없습니다.");
          navigate(-1);
          return;
        }

        setPost({
          ...data,
          province: data.province || regionParts[0] || "",
          city: data.city || regionParts[1] || "",
          district: data.district || regionParts.slice(2).join(" ") || "",
          priceUnit: data.priceUnit || "PER_HOUR",
          price: data.price ?? "",
          petId: data.petId || "",
        });
        setIsDirty(false);
      } catch (error) {
        alert("게시글 정보를 불러올 수 없습니다.");
        navigate("/");
      }
    };
    fetchPost();
  }, [id, currentUserId, navigate]);

  useEffect(() => {
    if (post.category !== "CARE_REQUEST") return;
    const fetchPets = async () => {
      try {
        const response = await api.get("/api/pets");
        setPets(response.data || []);
      } catch (error) {
        console.error("반려동물 목록 로딩 실패:", error);
      }
    };
    fetchPets();
  }, [post.category]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPost({ ...post, [name]: value });
    setIsDirty(true);
  };

  const handleLocationAuth = (lat, lng, province, city, district) => {
    setPost({ ...post, latitude: lat, longitude: lng, province, city, district });
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      if (
        window.confirm(
          "작성 중인 내용이 있습니다. 저장하지 않고 나가시겠습니까?"
        )
      ) {
        setIsDirty(false);
        allowNavigateRef.current = true;
        navigate(-1);
      }
    } else {
      allowNavigateRef.current = true;
      navigate(-1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사
    if (post.title.trim().length < 2) {
      alert("제목은 최소 2글자 이상 입력해주세요.");
      return;
    }
    if (post.content.trim().length > 100) {
      alert("내용은 최대 100글자 입니다.");
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
      const postData = {
        ...post,
        region:
          post.category === "CARE_REQUEST" || post.category === "CARE_OFFER"
            ? `${post.province} ${post.city} ${post.district}`
            : post.region,
      };

      await api.patch(`/api/posts/${id}`, postData);
      alert("수정되었습니다.");
      setIsDirty(false);
      allowNavigateRef.current = true;
      navigate(`/post/${id}`); // 수정 후 상세 페이지로 이동
    } catch (error) {
      alert(
        "수정 실패: " + (error.response?.data?.message || "권한이 없습니다.")
      );
    }
  };

  return (
    <PageContainer>
      <Card>
      <SubTitle>📝 게시글 수정</SubTitle>
      <Form onSubmit={handleSubmit}>
        <Select value={post.category || ""} disabled>
          <option value="CARE_REQUEST">돌봄이구인</option>
          <option value="CARE_OFFER">돌봄이구직</option>
          <option value="COMMUNITY">자유게시판</option>
          <option value="QNA">Q&A</option>
        </Select>

        <Input
          name="title"
          value={post.title}
          onChange={handleChange}
          required
        />

        <ContentField>
          <TextArea
            name="content"
            value={post.content}
            onChange={handleChange}
            rows="8"
            maxLength="100"
            required
            style={{ paddingBottom: "25px" }}
          />
          <Counter>{post.content?.length || 0} / 100</Counter>
        </ContentField>

        {(post.category === "CARE_REQUEST" || post.category === "CARE_OFFER") && (
          <CareSection>
            <LocationRow>
              <HelperText style={{ margin: 0, fontSize: "14px", color: "#111827", fontWeight: 700 }}>
                지역: {post.province && post.city && post.district ? `${post.province} ${post.city} ${post.district}` : "지역을 설정하세요"}
              </HelperText>
              <Button
                type="button"
                onClick={() => setShowLocationAuthModal(true)}
                style={{ width: "auto", marginLeft: "auto", backgroundColor: "#f59e0b" }}
              >
                📍 위치 인증
              </Button>
            </LocationRow>
            <Select name="priceUnit" value={post.priceUnit} onChange={handleChange}>
              <option value="PER_HOUR">시급</option>
              <option value="PER_DAY">일급</option>
            </Select>
            <Input
              name="price"
              type="number"
              placeholder="가격을 입력하세요"
              value={post.price}
              onChange={handleChange}
            />

            {post.category === "CARE_REQUEST" && (
              <div>
                <Select name="petId" value={post.petId || ""} onChange={handleChange}>
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
          </CareSection>
        )}

        <ActionRow>
          <Button type="submit" style={{ width: "auto", backgroundColor: "#16a34a" }}>
            수정 완료
          </Button>
          <Button type="button" onClick={handleCancel} variant="secondary" style={{ width: "auto" }}>
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

export default PostUpdate;
