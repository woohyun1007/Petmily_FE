import React, { useEffect, useState } from "react";
import styled from "styled-components";
import api from "../../api";
import { useLocation, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import { Button, Card, Input, PageContainer, Row, Select, Title } from "../../styles/ui";

const Toolbar = styled(Row)`
  justify-content: space-between;
  margin-bottom: 14px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }
`;

const ControlGroup = styled(Row)`
  @media (max-width: 900px) {
    width: 100%;
  }
`;

const SearchForm = styled.form`
  display: flex;
  gap: 6px;
  align-items: center;

  @media (max-width: 900px) {
    width: 100%;
  }

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const TableScroll = styled.div`
  width: 100%;
  overflow-x: auto;
`;

const ListTable = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
  table-layout: fixed;

  th, td {
    padding: 10px;
    border-bottom: 1px solid #eef2f7;
    font-size: 14px;
  }

  th {
    border-bottom: 2px solid #e2e8f0;
    background: #f8fafc;
    color: #475569;
    font-weight: 700;
  }

  tbody tr {
    cursor: pointer;
    transition: background-color 0.14s ease;
  }

  tbody tr:hover {
    background: #f8fafc;
  }
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  flex-wrap: wrap;
`;

const PostList = ({ category }) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(0);
  const [searchInput, setSearchInput] = useState("");

  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const currentPage = parseInt(queryParams.get("page") || "0");
  const keyword = queryParams.get("keyword") || "";

  const sort = queryParams.get("sort") || "modifiedAt,desc";
  const status = queryParams.get("status") || "ALL";
  const isCareCategory =
    category === "CARE_REQUEST" || category === "CARE_OFFER";

  dayjs.extend(relativeTime);
  dayjs.locale("ko");

  const formatData = (dateString) => {
    return dayjs(dateString).format("YYYY.MM.DD HH:mm");
  };

  const getPriceUnitText = (unit) => {
    switch (unit) {
      case "PER_HOUR":
        return "시급";
      case "PER_DAY":
        return "일급";
      default:
        return "";
    }
  };

  const handlePageChange = (newPage) => {
    navigate(`/posts?category=${category}&page=${newPage}`);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    queryParams.set(name, value);
    queryParams.set("page", "0"); // 조건이 바뀔때 첫페이지로 리셋
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    queryParams.set("keyword", searchInput);
    queryParams.set("page", "0");
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  const handleResetSearch = () => {
    setSearchInput("");
    queryParams.delete("keyword");
    queryParams.set("page", "0");
    navigate(`${location.pathname}?${queryParams.toString()}`);
  };

  useEffect(() => {
    if (category) {
      fetchPost();
    }
  }, [category, location.search]);

  const fetchPost = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/api/posts`, {
        params: {
          category: category,
          page: currentPage,
          size: 10,
          sort: sort,
          status: status,
          keyword: keyword,
        },
      });
      setPosts(response.data.content || []);
      setTotalPages(response.data.page.totalPages || 0);
    } catch (error) {
      console.error("게시글 로딩 실패: ", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && posts.length === 0) return <PageContainer>게시글을 불러오는 중...</PageContainer>;

  return (
    <PageContainer>
      <Card>
      <Title>
        {category === "QNA"
          ? "QnA"
          : category === "COMMUNITY"
          ? "자유게시판"
          : category === "CARE_REQUEST"
          ? "구인게시판"
          : category === "CARE_OFFER"
          ? "구직게시판"
          : category}
      </Title>
      <Toolbar>
        <ControlGroup>
          <Select name="sort" value={sort} onChange={handleFilterChange} style={{ width: "auto" }}>
            <option value="modifiedAt,desc">최신순</option>
            <option value="viewCount,desc">조회수순</option>
            {isCareCategory && (
              <>
                <option value="price,asc">가격 낮은순</option>
                <option value="price,desc">가격 높은순</option>
              </>
            )}
          </Select>
          {isCareCategory && (
            <Button
              onClick={() => navigate(`/posts/map?category=${category}`)}
              style={{ width: "auto", backgroundColor: "#0ea5e9" }}
            >
              🗺️ 지도보기
            </Button>
          )}
        </ControlGroup>

        {/* 검색창 */}
        <SearchForm onSubmit={handleSearch}>
          <Input
            type="text"
            placeholder="제목이나 내용 검색"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            style={{ width: "240px", maxWidth: "100%" }}
          />
          <Button type="submit" style={{ width: "auto" }}>
            검색
          </Button>
        </SearchForm>

        {isCareCategory && (
          <Select name="status" value={status} onChange={handleFilterChange} style={{ width: "auto" }}>
            <option value={"ALL"}>전체</option>
            <option value={"WAITING"}>모집중</option>
            <option value={"COMPLETED"}>완료</option>
          </Select>
        )}
      </Toolbar>
      {keyword && (
        <div>
          <strong>"{keyword}"</strong> 로 검색한 결과입니다.
          <Button
            type="button"
            onClick={handleResetSearch}
            variant="secondary"
            style={{ width: "auto", marginLeft: "8px", padding: "6px 10px" }}
          >
            검색 초기화
          </Button>
        </div>
      )}
      <TableScroll>
        <ListTable>
          <thead>
            <tr>
              <th>제목</th>
              <th>내용</th>
              {isCareCategory && (
                <>
                  <th>금액</th>
                  <th>상태</th>
                </>
              )}
              <th>작성자</th>
              <th>최근 수정일</th>
              <th>조회수</th>
            </tr>
          </thead>
          <tbody>
            {posts.length === 0 ? (
              <tr>
                <td
                  colSpan={isCareCategory ? 7 : 5}
                  style={{ textAlign: "center", padding: "24px", color: "#64748b" }}
                >
                  등록된 게시글이 없습니다.
                </td>
              </tr>
            ) : (
              posts.map((post) => (
                <tr
                  key={post.id}
                  style={{ textAlign: "center" }}
                  onClick={() => navigate(`/post/${post.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      navigate(`/post/${post.id}`);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <td
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    {post.title}
                  </td>
                  <td
                    style={{
                      textAlign: "left",
                      padding: "10px",
                    }}
                  >
                    {post.content}
                  </td>
                  {isCareCategory && (
                    <>
                      <td>
                        {post.price
                          ? `${getPriceUnitText(post.priceUnit)} : ${post.price.toLocaleString()}원`
                          : "미정"}
                      </td>
                      <td>{post.status}</td>
                    </>
                  )}
                  <td>{post.writerNickname}</td>
                  <td>{formatData(post.modifiedAt)}</td>
                  <td>{post.viewCount}</td>
                </tr>
              ))
            )}
          </tbody>
        </ListTable>
      </TableScroll>

      {/*페이지 UI*/}
      {posts.length > 0 && (
        <Pagination>
          <Button
            disabled={currentPage === 0}
            onClick={() => handlePageChange(currentPage - 1)}
            variant="secondary"
            style={{ width: "auto" }}
          >
            이전
          </Button>

          {[...Array(totalPages)].map((_, i) => (
            <Button
              key={i}
              onClick={() => handlePageChange(i)}
              style={{
                width: "auto",
                backgroundColor: currentPage === i ? "#16a34a" : "#94a3b8",
              }}
            >
              {i + 1}
            </Button>
          ))}

          <Button
            disabled={currentPage >= totalPages - 1}
            onClick={() => handlePageChange(currentPage + 1)}
            variant="secondary"
            style={{ width: "auto" }}
          >
            다음
          </Button>
        </Pagination>
      )}
      </Card>
    </PageContainer>
  );
};
export default PostList;
