import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api, { ensureCsrfToken, getApiErrorMessage } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { completeAuthSession } from "../../utils/auth";
import {
  Button,
  Card,
  Form,
  HelperText,
  Input,
  PageContainer,
  Title,
} from "../../styles/ui";

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin: 4px 0;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;

  &::before,
  &::after {
    content: "";
    flex: 1;
    height: 1px;
    background: ${({ theme }) => theme.colors.border};
  }
`;

const KakaoButton = styled.button`
  width: 100%;
  border: none;
  border-radius: ${({ theme }) => theme.radius.md};
  padding: 12px 14px;
  font-weight: 800;
  color: #191600;
  background: #fee500;
  box-shadow: 0 8px 18px rgba(254, 229, 0, 0.28);

  &:hover {
    transform: translateY(-1px);
    opacity: 0.98;
  }
`;

const Login = () => {
  const [loginData, setLoginData] = useState({
    loginId: "",
    password: "",
  });
  const navigate = useNavigate();
  const { setIsLogin, setUserId } = useAuth();
  const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const kakaoRedirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestApiKey}&redirect_uri=${encodeURIComponent(
          kakaoRedirectUri
        )}&response_type=code&scope=profile_nickname, account_email`;

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/auth/login", loginData);

      const authResponse = await api.get("/api/auth");
      const session = completeAuthSession(
        { setIsLogin, setUserId },
        authResponse.data || {},
      );
      await ensureCsrfToken();
      alert(`${session.nickname || "회원"}님, 환영합니다!`);
      navigate("/");
    } catch (error) {
      alert(
        `로그인 실패: ${getApiErrorMessage(
          error,
          "아이디 또는 비밀번호를 확인하세요.",
        )}`,
      );
    }
  };

  const handleKakaoLogin = () => {
    sessionStorage.setItem("oauthLoginInProgress", "true");
    // GET 요청과 동일한 방식으로 카카오 로그인 URL로 이동
    window.location.href = kakaoLoginUrl;
  };

  return (
    <PageContainer>
      <Card style={{ maxWidth: "420px", margin: "0 auto" }}>
        <Title>로그인</Title>
        <Form onSubmit={handleSubmit}>
          <Input name="loginId" placeholder="아이디" onChange={handleChange} />
          <Input
          name="password"
          type="password"
          placeholder="비밀번호"
          onChange={handleChange}
        />
          <Button type="submit">로그인</Button>
        </Form>
        <Divider>또는</Divider>
        <KakaoButton type="button" onClick={handleKakaoLogin}>
          카카오로 시작하기
        </KakaoButton>
      </Card>
    </PageContainer>
  );
};

export default Login;
