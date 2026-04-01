import React, { useState, useEffect, useRef } from "react";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import api from "../../api";
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
    "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?"
  );

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
      alert("오류 발생: " + error.response?.data?.message);
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
      <SubTitle>{petToEdit ? "🐾 반려동물 수정" : "🐾 새 반려동물 등록"}</SubTitle>
      <Form onSubmit={handleSubmit}>
      <PreviewWrap>
        {preview && (
          <PreviewImage
            src={preview}
            alt="미리보기"
          />
        )}
        <Input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          ref={fileInputRef}
          style={{ marginTop: "10px" }}
        />
      </PreviewWrap>

      <Input
        name="name"
        placeholder="이름"
        value={petData.name}
        onChange={handleChange}
        required
      />
      <Select name="type" value={petData.type} onChange={handleChange}>
        <option value="DOG">강아지</option>
        <option value="CAT">고양이</option>
        <option value="ETC">기타</option>
      </Select>
      <Input
        name="breed"
        placeholder="품종(예: 말티즈)"
        value={petData.breed}
        onChange={handleChange}
      />
      <Input
        name="age"
        type="number"
        placeholder="나이"
        value={petData.age}
        onChange={handleChange}
      />
      <Input
        name="caution"
        placeholder="주의사항"
        value={petData.caution}
        onChange={handleChange}
      />
      <Select name="gender" value={petData.gender} onChange={handleChange}>
        <option value="MALE">수컷</option>
        <option value="FEMALE">암컷</option>
      </Select>
      <HelperText>프로필 이미지는 JPG/PNG 형식을 권장합니다.</HelperText>

      <Row>
        <Button type="submit" style={{ width: "auto" }}>
          {petToEdit ? "수정 완료" : "등록하기"}
        </Button>
        {petToEdit && (
          <Button
            type="button"
            onClick={handleCancel}
            variant="secondary"
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
