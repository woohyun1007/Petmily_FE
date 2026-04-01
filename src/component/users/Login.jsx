import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import api from "../../api";
import { useAuth } from "../../context/AuthContext";
import { applyAuthState, persistAuthSession } from "../../utils/auth";
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
  const apiBaseUrl = api.defaults.baseURL || "http://localhost:8080";
  const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const kakaoRedirectUri =
    import.meta.env.VITE_KAKAO_REDIRECT_URI ||
    `${apiBaseUrl}/api/auth/kakao/callback`;
  const kakaoLoginUrl =
    import.meta.env.VITE_KAKAO_LOGIN_URL ||
    (kakaoRestApiKey
      ? `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestApiKey}&redirect_uri=${encodeURIComponent(
          kakaoRedirectUri
        )}&response_type=code&scope=profile_nickname`
      : "");

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post("/api/auth/login", loginData);

      const { id, nickname, tokenInfo } = response.data;

      if (tokenInfo && tokenInfo.accessToken) {
        const session = persistAuthSession({ id, nickname, tokenInfo });
        applyAuthState({ setIsLogin, setUserId }, session);
        alert(`${nickname}님, 환영합니다!`);
        navigate("/");
      }
    } catch (error) {
      alert(
        "로그인 실패: " +
          (error.response?.data?.message ||
            "아이디 또는 비밀번호를 확인하세요.")
      );
    }
  };

  const handleKakaoLogin = () => {
    if (!kakaoLoginUrl) {
      alert("카카오 로그인 URL이 비어있습니다. .env에 VITE_KAKAO_REST_API_KEY를 설정해주세요.");
      return;
    }
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
