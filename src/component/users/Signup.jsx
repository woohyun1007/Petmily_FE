import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import api, { getApiErrorMessage } from "../../api";
import {
  Button,
  Card,
  Form,
  HelperText,
  Input,
  PageContainer,
  Row,
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

const Signup = () => {
  const [formData, setFormData] = useState({
    loginId: "",
    password: "",
    passwordConfirm: "",
    email: "",
    nickname: "",
  });
  const [verificationCode, setVerificationCode] = useState("");
  const [verifiedEmail, setVerifiedEmail] = useState("");
  const [verificationMessage, setVerificationMessage] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verifyingCode, setVerifyingCode] = useState(false);

  const [isDirty, setIsDirty] = useState(false);
  const allowNavigateRef = useRef(false);
  const navigate = useNavigate();
  const kakaoRestApiKey = import.meta.env.VITE_KAKAO_REST_API_KEY;
  const kakaoRedirectUri = import.meta.env.VITE_KAKAO_REDIRECT_URI;
  const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${kakaoRestApiKey}&redirect_uri=${encodeURIComponent(
    kakaoRedirectUri,
  )}&response_type=code&scope=profile_nickname, account_email`;

  useNavigationGuard(
    isDirty,
    allowNavigateRef,
    "작성 중인 내용이 사라집니다. 정말 이동하시겠습니까?"
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (name === "email" && value !== verifiedEmail) {
      setVerifiedEmail("");
      setVerificationCode("");
      setVerificationMessage("");
    }
    setIsDirty(true);
  };

  const handleSendVerificationCode = async () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    setSendingCode(true);
    setVerificationMessage("");

    try {
      const response = await api.post("/api/auth/email/send", {
        email: formData.email,
      });
      setVerifiedEmail("");
      setVerificationCode("");
      setVerificationMessage(
        response.data?.message || "인증번호를 전송했습니다.",
      );
    } catch (error) {
      setVerificationMessage("");
      alert(`인증번호 전송 실패: ${getApiErrorMessage(error, "인증번호를 전송하지 못했습니다.")}`);
    } finally {
      setSendingCode(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert("유효한 이메일 주소를 입력해주세요.");
      return;
    }
    if (!/^\d{6}$/.test(verificationCode)) {
      alert("인증번호는 6자리 숫자로 입력해주세요.");
      return;
    }

    setVerifyingCode(true);
    setVerificationMessage("");

    try {
      const response = await api.post("/api/auth/email/verify", {
        email: formData.email,
        code: verificationCode,
      });
      setVerifiedEmail(formData.email);
      setVerificationMessage(
        response.data?.message || "이메일 인증이 완료되었습니다.",
      );
    } catch (error) {
      setVerifiedEmail("");
      setVerificationMessage("");
      alert(`이메일 인증 실패: ${getApiErrorMessage(error, "인증번호가 올바르지 않거나 만료되었습니다.")}`);
    } finally {
      setVerifyingCode(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사
    if (formData.loginId.trim().length < 2 || formData.loginId.trim().length > 20) {
      alert("아이디는 2글자 이상 20글자 이하로 입력해주세요.");
      return;
    }
    if (formData.password.trim().length < 8 || !/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(formData.password)) {
      alert("비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }
    if (formData.password !== formData.passwordConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      alert("유효한 이메일 주소를 입력해주세요.");
      return;
    }
    if (verifiedEmail !== formData.email) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }
    if (formData.nickname.trim().length < 2 || formData.nickname.trim().length > 10) {
      alert("닉네임은 최소 2글자 이상 10글자 이하로 입력해주세요.");
      return;
    }

    try {
      await api.post("/api/users", formData);
      alert("회원가입 성공!");
      setIsDirty(false);
      allowNavigateRef.current = true;
      navigate("/");
    } catch (error) {
      alert(`실패: ${getApiErrorMessage(error, "서버 에러")}`);
    }
  };

  const handleKakaoSignup = () => {
    allowNavigateRef.current = true;
    sessionStorage.setItem("oauthLoginInProgress", "true");
    window.location.href = kakaoLoginUrl;
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
            name="passwordConfirm"
            type="password"
            placeholder="비밀번호 재입력"
            onChange={handleChange}
          />
          <Input
            name="email"
            type="email"
            placeholder="이메일"
            value={formData.email}
            onChange={handleChange}
          />
          <Row>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSendVerificationCode}
              disabled={sendingCode || verifiedEmail === formData.email}
              style={{ width: "auto" }}
            >
              {sendingCode ? "전송 중..." : "인증번호 전송"}
            </Button>
            {verifiedEmail === formData.email && (
              <HelperText style={{ color: "#16a34a", fontSize: "13px" }}>
                이메일 인증 완료
              </HelperText>
            )}
          </Row>
          <Row>
            <Input
              name="verificationCode"
              inputMode="numeric"
              maxLength={6}
              placeholder="인증번호 6자리"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, ""));
                setIsDirty(true);
              }}
              disabled={verifiedEmail === formData.email}
              style={{ flex: 1 }}
            />
            <Button
              type="button"
              onClick={handleVerifyCode}
              disabled={verifyingCode || verifiedEmail === formData.email}
              style={{ width: "auto" }}
            >
              {verifyingCode ? "확인 중..." : "인증 확인"}
            </Button>
          </Row>
          {verificationMessage && (
            <HelperText
              style={{
                color: verifiedEmail === formData.email ? "#16a34a" : "#64748b",
                fontSize: "13px",
              }}
            >
              {verificationMessage}
            </HelperText>
          )}
          <Input name="nickname" placeholder="닉네임" onChange={handleChange} />
          <Button type="submit">가입하기</Button>
        </Form>
        <Divider>또는</Divider>
        <KakaoButton type="button" onClick={handleKakaoSignup}>
          카카오로 시작하기
        </KakaoButton>
      </Card>
    </PageContainer>
  );
};

export default Signup;
