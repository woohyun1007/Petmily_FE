import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import api from "../../api";
import {
  Button,
  Card,
  Form,
  Input,
  PageContainer,
  Select,
  Title,
} from "../../styles/ui";

const Signup = () => {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    email: "",
    nickname: "",
    roles: "OWNER",
  });

  const [isDirty, setIsDirty] = useState(false);
  const allowNavigateRef = useRef(false);
  const navigate = useNavigate();

  useNavigationGuard(
    isDirty,
    allowNavigateRef,
    "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?"
  );

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setIsDirty(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/users", formData);
      alert("회원가입 성공!");
      setIsDirty(false);
      allowNavigateRef.current = true;
      navigate("/");
    } catch (error) {
      alert("실패: " + (error.response?.data?.message || "서버 에러"));
    }
  };

  return (
    <PageContainer>
      <Card style={{ maxWidth: "460px", margin: "0 auto" }}>
        <Title>회원가입</Title>
        <Form onSubmit={handleSubmit}>
          <Input name="loginId" placeholder="아이디" onChange={handleChange} />
          <Input
            name="password"
            type="password"
            placeholder="비밀번호"
            onChange={handleChange}
          />
          <Input
            name="email"
            type="email"
            placeholder="이메일"
            onChange={handleChange}
          />
          <Input name="nickname" placeholder="닉네임" onChange={handleChange} />
          <Select name="roles" value={formData.roles} onChange={handleChange}>
            <option value="OWNER">OWNER</option>
            <option value="SITTER">SITTER</option>
          </Select>
          <Button type="submit">가입하기</Button>
        </Form>
      </Card>
    </PageContainer>
  );
};

export default Signup;