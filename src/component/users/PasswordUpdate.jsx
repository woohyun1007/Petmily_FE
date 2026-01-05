import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

const PasswordUpdate = () => {
  const navigate = useNavigate();
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
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert("새 비밀번호가 일치하지 않습니다.");
      return;
    }
    try {
      await api.patch("/api/users/password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      alert("비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.");
      localStorage.removeItem("token"); // 비밀번호 변경 후 로그아웃 처리
      // navigate 대신 window.location.href를 쓰면 앱의 모든 메모리 상태가 초기화됩니다.
      window.location.href = "/login";
    } catch (error) {
      alert(
        "변경 실패: " +
          (error.response?.data?.message || "오류가 발생했습니다.")
      );
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
