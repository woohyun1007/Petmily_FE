import React, { useState, useEffect } from "react";
import useNavigationGuard from "../../hooks/useNavigationGuard";
import api, { getApiErrorMessage } from "../../api";

const CommentSection = ({ postId, currentUserId }) => {
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  useNavigationGuard(isDirty, "작성 중인 댓글이 있습니다. 정말 이동하시겠습니까?");

  const fetchComments = async () => {
    try {
      const response = await api.get(`/api/posts/${postId}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error("댓글 로딩 실패", error);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [postId]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/api/posts/${postId}/comments`, { content });
      alert("댓글 등록되었습니다.");
      setContent("");
      setIsDirty(false);
      fetchComments();
    } catch (error) {
      alert(`댓글 등록 실패: ${getApiErrorMessage(error, "댓글 등록에 실패했습니다.")}`);
    }
  };

  const handleUpdate = async (commentId) => {
    try {
      if (!window.confirm("수정하시겠습니까?")) return;
      await api.patch(`/api/posts/${postId}/comments/${commentId}`, {
        content: editContent,
      });
      alert("댓글 수정되었습니다.");
      setEditingId(null);
      setEditContent("");
      setIsDirty(false);
      fetchComments();
    } catch (error) {
      alert(`댓글 수정 실패: ${getApiErrorMessage(error, "댓글 수정에 실패했습니다.")}`);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await api.delete(`/api/posts/${postId}/comments/${commentId}`);
      alert("댓글 삭제되었습니다.");
      fetchComments();
      } catch (error) {
        alert(`댓글 삭제 실패: ${getApiErrorMessage(error, "삭제 권한이 없거나 실패했습니다.")}`);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm("작성 중인 내용이 사라집니다. 돌아가시겠습니까?")) {
        setEditingId(null);        setIsDirty(false);      }
    } else {
      setEditingId(null);
    }
  };

  return (
    <div style={containerStyle}>
      <h4>💬 댓글 {comments.length}</h4>

      {/* 댓글 입력창 */}
      <form onSubmit={handleCreate} style={formStyle}>
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsDirty(true);
          }}
          placeholder="따뜻한 댓글을 남겨주세요."
          style={inputStyle}
        />
        <button type="submit" style={buttonStyle}>
          등록
        </button>
      </form>

      {/* 댓글 리스트 */}
      <div>
        {comments.map((comment) => (
          <div key={comment.id} style={commentItemStyle}>
            <div style={commentHeaderStyle}>
              <strong>{comment.nickname}</strong>
              <span style={dateStyle}>
                {new Date(comment.createdAt).toLocaleString()}
              </span>
            </div>
            <p style={contentStyle}>{comment.content}</p>
            {editingId === comment.id ? (
              <div>
                <textarea
                  value={editContent}
                  onChange={(e) => {
                    setEditContent(e.target.value);
                    setIsDirty(true);
                  }}
                  style={inputStyle}
                />
                <button onClick={() => handleUpdate(comment.id)}>저장</button>
                <button onClick={() => handleCancel()}>취소</button>
              </div>
            ) : (
              <div>
                {currentUserId === comment.writerId && (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      수정
                    </button>
                    <button onClick={() => handleDelete(comment.id)}>
                      삭제
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const containerStyle = {
  marginTop: "40px",
  padding: "20px",
  background: "#f9f9f9",
  borderRadius: "8px",
};
const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: "10px",
  marginBottom: "30px",
};
const inputStyle = {
  padding: "12px",
  borderRadius: "5px",
  border: "1px solid #ddd",
  minHeight: "80px",
  resize: "none",
};
const buttonStyle = {
  alignSelf: "flex-end",
  padding: "8px 20px",
  backgroundColor: "#4A90E2",
  color: "#fff",
  border: "none",
  borderRadius: "5px",
  cursor: "pointer",
};
const commentItemStyle = {
  padding: "15px 0",
  borderBottom: "1px solid #eee",
  position: "relative",
};
const commentHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "5px",
};
const dateStyle = { fontSize: "12px", color: "#999" };
const contentStyle = { margin: "5px 0", lineHeight: "1.5" };
export default CommentSection;
