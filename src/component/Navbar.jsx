import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ isLogin }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        alert('로그아웃 되었습니다.');
        window.location.reload();
    };

    return (
        <nav style={{ display: 'flex', gap: '20px', padding: '20px 0', borderBottom: '1px solid #ccc' }}>
            <Link to = "/">홈</Link>
            {isLogin ? (
                <>
                    <Link to = "/post/create">글쓰기</Link>
                    <Link to = "/myinfo">내 정보</Link>
                    <Link to = "/pets">반려동물 관리</Link>
                    <button onClick={handleLogout}>로그아웃</button>   
                </>
            ) : (
                <>
                    <Link to = "/signup">회원가입</Link>
                    <Link to = "/login">로그인</Link>   
                </>
            )}
        </nav>
    );
};

export default Navbar;