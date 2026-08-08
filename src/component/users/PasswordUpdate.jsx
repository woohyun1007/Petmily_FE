import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { ensureCsrfToken, getApiErrorMessage } from "../../api";
import { useAuth } from "../../context/AuthContext";

const PasswordUpdate = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // 입력값 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 2. 수정한 정보 저장하기
  const handleSubmit = async (e) => {
    e.preventDefault();
    // 유효성 검사
    if (passwordData.currentPassword.trim().length === 0) {
      alert("현재 비밀번호를 입력해주세요.");
      return;
    }
    if (passwordData.currentPassword === passwordData.newPassword) {
      alert("새 비밀번호는 현재 비밀번호와 달라야 합니다.");
      return;
    }
    if (passwordData.newPassword.trim().length < 8 || !/(?=.*[a-zA-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(passwordData.newPassword)) {
      alert("새 비밀번호는 8자 이상, 영문, 숫자, 특수문자를 포함해야 합니다.");
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await ensureCsrfToken();
      await api.patch("/api/users/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      await logout();
      navigate("/login");
    } catch (error) {
      alert(`변경 실패: ${getApiErrorMessage(error)}`);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
      <h2>🔐 비밀번호 변경</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "15px" }}>
          <label>현재 비밀번호</label>
          <input
            type="password"
            name="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            style={{ width: "100%" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>새 비밀번호</label>
          <input
            type="password"
            name="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            style={{ width: "100%" }}
            required
          />
        </div>

        <div style={{ marginBottom: "15px" }}>
          <label>새 비밀번호 확인</label>
          <input
            type="password"
            name="confirmPassword"
            value={passwordData.confirmPassword}
            onChange={handleChange}
            style={{ width: "100%" }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
          }}
        >
          저장하기
        </button>
        <button
          type="button"
          onClick={() => navigate(-1)}
          style={{ width: "100%", marginTop: "5px", padding: "10px" }}
        >
          취소
        </button>
      </form>
    </div>
  );
};

export default PasswordUpdate;
