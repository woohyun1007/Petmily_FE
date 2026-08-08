import React, { useEffect, useState } from "react";
import api, { clearCsrfToken, getApiErrorMessage } from "../../api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { Button, Card, HelperText, PageContainer, Row, Title } from "../../styles/ui";

const MyInfo = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();
  const { setIsLogin, setUserId } = useAuth();

  useEffect(() => {
    const fetchInfo = async () => {
      try {
        const response = await api.get("/api/users");
        setUserInfo(response.data);
      } catch (error) {
        console.error("데이터를 가져오는데 실패했습니다.", error);
        setErrorMessage(
          getApiErrorMessage(error, "내 정보를 불러오지 못했습니다."),
        );
      }
    };
    fetchInfo();
  }, []);

  const handleDeleteUser = async () => {
    const confirmed = window.confirm(
      "회원 탈퇴 시 계정과 작성한 정보가 삭제됩니다. 정말 탈퇴하시겠습니까?",
    );

    if (!confirmed) return;

    const finalConfirmed = window.confirm(
      "이 작업은 되돌릴 수 없습니다. 그래도 회원 탈퇴를 진행할까요?",
    );

    if (!finalConfirmed) return;

    setIsDeleting(true);
    setErrorMessage("");

    try {
      await api.delete("/api/users");
      localStorage.clear();
      clearCsrfToken();
      sessionStorage.removeItem("csrfBootstrapAllowed");
      sessionStorage.removeItem("oauthLoginInProgress");
      setIsLogin(false);
      setUserId(null);
      alert("회원 탈퇴가 완료되었습니다.");
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, "회원 탈퇴에 실패했습니다."));
      alert(`회원 탈퇴 실패: ${getApiErrorMessage(error, "회원 탈퇴에 실패했습니다.")}`);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!userInfo) {
    return (
      <PageContainer>
        <Card>
          <Title>내 정보</Title>
          <HelperText danger={!!errorMessage}>
            {errorMessage || "정보를 불러오는 중..."}
          </HelperText>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Card>
      <Title>내 정보</Title>
      {errorMessage && (
        <HelperText danger style={{ marginBottom: "10px", fontSize: "14px" }}>
          {errorMessage}
        </HelperText>
      )}
      <p>아이디: {userInfo.loginId}</p>
      <p>이름: {userInfo.nickname}</p>
      <p>이메일: {userInfo.email}</p>
      <Row style={{ marginTop: "10px" }}>
      <Button onClick={() => navigate("/myinfo/update")} style={{ width: "auto" }}>
        수정
      </Button>
      {userInfo.password && (
        <Button
          onClick={() => navigate("/myinfo/passwordupdate")}
          variant="secondary"
          style={{ width: "auto" }}
        >
          비밀번호 변경
        </Button>
      )}
      <Button
        onClick={handleDeleteUser}
        variant="danger"
        disabled={isDeleting}
        style={{ width: "auto", marginLeft: "auto" }}
      >
        {isDeleting ? "탈퇴 처리 중..." : "회원 탈퇴"}
      </Button>
      </Row>
      </Card>
    </PageContainer>
  );
};

export default MyInfo;
