import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { ensureCsrfToken, getApiErrorMessage } from "../../api";
import { useAuth } from "../../context/AuthContext";
import { completeAuthSession } from "../../utils/auth";
import { Card, HelperText, PageContainer, Title } from "../../styles/ui";

const KakaoCallback = () => {
  const navigate = useNavigate();
  const { setIsLogin, setUserId } = useAuth();
  const [message, setMessage] = useState("카카오 로그인 정보를 확인하는 중...");

  useEffect(() => {
    const completeKakaoLogin = async () => {
      try {
        const response = await api.get("/api/auth");
        completeAuthSession({ setIsLogin, setUserId }, response.data || {});
        await ensureCsrfToken();
        navigate("/", { replace: true });
      } catch (error) {
        setMessage(
          getApiErrorMessage(
            error,
            "카카오 로그인 완료 정보를 가져오지 못했습니다. 백엔드 리다이렉트 설정을 확인해주세요.",
          ),
        );
      } finally {
        sessionStorage.removeItem("oauthLoginInProgress");
      }
    };

    completeKakaoLogin();
  }, [navigate, setIsLogin, setUserId]);

  return (
    <PageContainer>
      <Card style={{ maxWidth: "480px", margin: "0 auto" }}>
        <Title>카카오 로그인</Title>
        <HelperText style={{ fontSize: "14px", marginTop: 0 }}>{message}</HelperText>
      </Card>
    </PageContainer>
  );
};

export default KakaoCallback;
