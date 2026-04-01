// PostPage.jsx (PostList를 사용하는 페이지 컴포넌트)
import { useLocation } from "react-router-dom";
import PostList from "./PostList";

const PostPage = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const category = queryParams.get("category"); // 주소창에서 category 추출

  // key 값에 category를 넣으면, 카테고리가 바뀔 때마다 
  // PostList 컴포넌트가 아예 새로 생성되면서 useEffect가 확실히 실행됩니다.
  return <PostList key={category} category={category} />;
};
export default PostPage;