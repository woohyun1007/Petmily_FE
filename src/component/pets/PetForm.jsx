import React, { useState, useEffect, useRef } from "react";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import api, { getApiErrorMessage } from "../../api";
import styled from "styled-components";
import {
  Button,
  Card,
  Form,
  HelperText,
  Input,
  Row,
  Select,
  SubTitle,
} from "../../styles/ui";

const PreviewWrap = styled.div`
  margin-bottom: 15px;
  text-align: center;
`;

const PreviewImage = styled.img`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #eef2f7;
`;

const FieldGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FieldLabel = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  text-align: left;
`;

const RequiredMark = styled.span`
  color: #dc2626;
  margin-left: 4px;
`;

const PetForm = ({ petToEdit, onSaveSuccess }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [petData, setPetData] = useState({
    name: "",
    type: "DOG", // DOG, CAT, ETC 등
    breed: "",
    age: "",
    caution: "",
    gender: "MALE",
    imageUrl: "",
  });
  const [isDirty, setIsDirty] = useState(false);
  const fileInputRef = useRef(null);
  const allowNavigateRef = useRef(false);

  useNavigationGuard(
    isDirty,
    allowNavigateRef,
    "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?",
  );

  const resetForm = () => {
    setPetData({
      name: "",
      type: "DOG",
      breed: "",
      age: "",
      caution: "",
      gender: "MALE",
      imageUrl: "",
    });
    setFile(null);
    setPreview("");
    setIsDirty(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) {
      return url;
    }
    return `http://localhost:8080${url}`;
  };

  // 수정 모드일 경우 기존 데이터 채워넣기
  useEffect(() => {
    if (petToEdit) {
      setPetData({
        name: petToEdit.name || "",
        type: petToEdit.type || "DOG",
        breed: petToEdit.breed || "",
        age: petToEdit.age || "",
        caution: petToEdit.caution || "",
        gender: petToEdit.gender || "MALE",
        imageUrl: petToEdit.imageUrl || "",
      });
      setFile(null);
      setPreview(resolveImageUrl(petToEdit.imageUrl));
      setIsDirty(false);
    } else {
      resetForm();
    }
  }, [petToEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPetData({ ...petData, [name]: value });
    setIsDirty(true);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setIsDirty(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사
    if (petData.name.trim().length > 10) {
      alert("이름은 10글자 이하로 입력해주세요.");
      return;
    }
    if (!petData.type) {
      alert("개체를 선택해주세요.");
      return;
    }
    if (isNaN(petData.age) || Number(petData.age) < 0) {
      alert("나이는 0세 이상이어야 합니다.");
      return; 
    }
    if (petData.imageUrl === "" && !file) {
      alert("이미지를 등록해주세요.");
      return;
    }
    if (petData.caution.length > 100) {
      alert("주의사항은 100글자 이하로 입력해주세요.");
      return;
    }

    const formData = new FormData();

    formData.append("name", petData.name);
    formData.append("type", petData.type);
    formData.append("breed", petData.breed || petData.type);

    if (petData.age !== "") {
      formData.append("age", Number(petData.age));
    }

    formData.append("caution", petData.caution);
    formData.append("gender", petData.gender);

    if (file) {
      formData.append("image", file);
    }

    try {
      const url = petToEdit ? `/api/pets/${petToEdit.id}` : "/api/pets";
      const method = petToEdit ? "patch" : "post";

      await api[method](url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert(petToEdit ? "수정되었습니다." : "등록되었습니다.");
      resetForm();
      allowNavigateRef.current = true;
      onSaveSuccess(); // 목록 새로고침
    } catch (error) {
      alert(`오류 발생: ${getApiErrorMessage(error)}`);
      console.error(error);
    }
  };

  const handleCancel = () => {
    if (
      isDirty &&
      !window.confirm("작성 중인 내용이 사라집니다. 취소하시겠습니까?")
    ) {
      return; // 사용자가 '취소'를 누르면 여기서 중단
    }
    setIsDirty(false);
    allowNavigateRef.current = true;
    onSaveSuccess(); // 목록으로 돌아가거나 폼 닫기
  };

  return (
    <Card>
      <SubTitle>
        {petToEdit ? "🐾 반려동물 수정" : "🐾 새 반려동물 등록"}
      </SubTitle>
      <Form onSubmit={handleSubmit}>
        <HelperText>* 표시는 필수 입력 항목입니다.</HelperText>
        <FieldGroup>
          <FieldLabel htmlFor="pet-image">
            이미지<RequiredMark>*</RequiredMark>
            <HelperText>프로필 이미지는 JPG/PNG 형식을 권장합니다.</HelperText>
          </FieldLabel>
          <PreviewWrap>
            {preview && <PreviewImage src={preview} alt="미리보기" />}
            <Input
              id="pet-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              style={{ marginTop: "10px" }}
            />
          </PreviewWrap>
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="pet-name">
            이름<RequiredMark>*</RequiredMark>
          </FieldLabel>
          <Input
            id="pet-name"
            name="name"
            placeholder="ex) 뽀삐"
            value={petData.name}
            onChange={handleChange}
            required
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="pet-type">
            종류<RequiredMark>*</RequiredMark>
          </FieldLabel>
          <Select
            id="pet-type"
            name="type"
            value={petData.type}
            onChange={handleChange}
          >
            <option value="DOG">강아지</option>
            <option value="CAT">고양이</option>
            <option value="ETC">기타</option>
          </Select>
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="pet-breed">품종</FieldLabel>
          <Input
            id="pet-breed"
            name="breed"
            placeholder="ex) 말티즈"
            value={petData.breed}
            onChange={handleChange}
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="pet-age">
            나이<RequiredMark>*</RequiredMark>
          </FieldLabel>
          <Input
            id="pet-age"
            name="age"
            type="number"
            placeholder="나이"
            value={petData.age}
            onChange={handleChange}
            min="0"
            required
          />
        </FieldGroup>

        <FieldGroup>
          <FieldLabel htmlFor="pet-caution">주의사항</FieldLabel>
          <Input
            id="pet-caution"
            name="caution"
            placeholder="주의사항"
            value={petData.caution}
            onChange={handleChange}
          />
        </FieldGroup>
        <FieldGroup>
          <FieldLabel htmlFor="pet-gender">성별<RequiredMark>*</RequiredMark></FieldLabel>
          <Select
            id="pet-gender"
            name="gender"
            value={petData.gender}
            onChange={handleChange}
          >
            <option value="MALE">남</option>
            <option value="FEMALE">여</option>
          </Select>
        </FieldGroup>

        <Row>
          <Button type="submit" style={{ width: "auto" }}>
            {petToEdit ? "수정 완료" : "등록하기"}
          </Button>
          {petToEdit && (
            <Button
              type="button"
              onClick={handleCancel}
              style={{ width: "auto" }}
            >
              취소
            </Button>
          )}
        </Row>
      </Form>
    </Card>
  );
};

export default PetForm;
