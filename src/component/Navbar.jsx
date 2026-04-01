import { Link } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../context/AuthContext";
import api from "../api";

const Nav = styled.nav`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.lg};
  background: rgba(255, 255, 255, 0.88);
  backdrop-filter: blur(10px);
  box-shadow: ${({ theme }) => theme.shadow.md};
  position: sticky;
  top: 10px;
  z-index: 20;

  @media (max-width: 640px) {
    position: static;
    gap: 8px;
    padding: 8px;
  }
`;

const Brand = styled(Link)`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.gradients.hero};
  color: #fff;
  font-size: 14px;
  font-weight: 800;
  letter-spacing: -0.01em;
`;

const NavLink = styled(Link)`
  padding: 8px 12px;
  border-radius: ${({ theme }) => theme.radius.pill};
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 14px;
  font-weight: 600;
  border: 1px solid transparent;

  &:hover {
    background: #eef2ff;
    border-color: #dbe4ff;
    color: ${({ theme }) => theme.colors.primary};
  }
`;

const LogoutButton = styled.button`
  margin-left: auto;
  padding: 8px 12px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radius.pill};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.danger};
  font-size: 14px;
  font-weight: 700;
  box-shadow: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.danger};
    background: #fff1f2;
  }

  @media (max-width: 640px) {
    margin-left: 0;
    width: 100%;
  }
`;

const Navbar = () => {
  const { isLogin, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.delete("/api/auth/logout");
      alert("로그아웃 되었습니다.");
    } catch (error) {
      console.error("로그아웃 중 오류 발생: ", error);
    } finally {
      logout();
    }
  };

  return (
    <Nav>
      <Brand to="/">🐾 Petmily</Brand>
      {isLogin ? (
        <>
          <NavLink to="/posts/create">글쓰기</NavLink>
          <NavLink to="/posts?category=CARE_REQUEST">돌봄이구인</NavLink>
          <NavLink to="/posts?category=CARE_OFFER">돌봄이구직</NavLink>
          <NavLink to="/posts?category=COMMUNITY">자유게시판</NavLink>
          <NavLink to="/posts?category=QnA">QnA</NavLink>
          <NavLink to="/myinfo">내 정보</NavLink>
          <NavLink to="/pets">반려동물 관리</NavLink>
          <LogoutButton onClick={handleLogout}>로그아웃</LogoutButton>
        </>
      ) : (
        <>
          <NavLink to="/signup">회원가입</NavLink>
          <NavLink to="/login">로그인</NavLink>
        </>
      )}
    </Nav>
  );
};

export default Navbar;
