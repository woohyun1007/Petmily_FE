import React, { useState, useEffect } from "react";
import api from "../../api";

const PetForm = ({ petToEdit, onSaveSuccess }) => {
  const [petData, setPetData] = useState({
    name: "",
    type: "DOG", // DOG, CAT, ETC 등
    breed: "",
    age: "",
    image: "",
    caution: "",
    gender: "MALE",
  });

  // 수정 모드일 경우 기존 데이터 채워넣기
  useEffect(() => {
    if (petToEdit) {
      setPetData({
        name: petToEdit.name || "",
        type: petToEdit.type || "DOG",
        breed: petToEdit.breed || "",
        age: petToEdit.age || "",
        image: petToEdit.image || "",
        caution: petToEdit.caution || "",
        gender: petToEdit.gender || "MALE",
      });
    } else {
      setPetData({
        name: "",
        type: "DOG",
        breed: "",
        age: "",
        image: "",
        caution: "",
        gender: "MALE",
      });
    }
  }, [petToEdit]);

  const handleChange = (e) => {
    setPetData({ ...petData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (petData.breed == '') {
        petData.breed = petData.type;
      }
      if (petToEdit) {
        // 수정 (PATCH)
        await api.patch(`/api/pets/${petToEdit.id}`, petData);
        alert("수정되었습니다.");
      } else {
        // 등록 (POST)
        await api.post("/api/pets", petData);
        alert("등록되었습니다.");
      }
      onSaveSuccess(); // 목록 새로고침
      setPetData({
        name: "",
        type: "DOG",
        breed: "",
        age: "",
        image: "",
        caution: "",
        gender: "MALE",
      });
    } catch (error) {
      alert("오류 발생: " + error.response?.data?.message);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{ border: "1px solid #ddd", padding: "15px", borderRadius: "8px" }}
    >
      <h4>{petToEdit ? "🐾 반려동물 수정 " : "🐾 새 반려동물 등록"}</h4>
      <input
        name="name"
        placeholder="이름"
        value={petData.name}
        onChange={handleChange}
        required
      />
      <select name="type" value={petData.type} onChange={handleChange}>
        <option value="DOG">강아지</option>
        <option value="CAT">고양이</option>
        <option value="ETC">기타</option>
      </select>
      <input
        name="breed"
        placeholder="품종(예: 말티즈)"
        value={petData.breed}
        onChange={handleChange}
      />
      <input
        name="age"
        type="number"
        placeholder="나이"
        value={petData.age}
        onChange={handleChange}
      />
      <input
        name="image"
        placeholder="사진"
        value={petData.image}
        onChange={handleChange}
      />
      <input
        name="caution"
        placeholder="주의사항"
        value={petData.caution}
        onChange={handleChange}
      />
      <select name="gender" value={petData.gender} onChange={handleChange}>
        <option value="MALE">수컷</option>
        <option value="FEMALE">암컷</option>
      </select>
      <button type="submit">{petToEdit ? "수정 완료" : "등록하기"}</button>
      {petToEdit && (
        <button
          type="button"
          onClick={() => onSaveSuccess()}
          style={{ marginLeft: "10px" }}
        >
          취소
        </button>
      )}
    </form>
  );
};

export default PetForm;
