import React, { useEffect, useState } from 'react';
import api from '../../api';

const PetList = ({ onEditRequest, refreshTrigger }) => {
  const [pets, setPets] = useState([]);

  const fetchPets = async () => {
    try {
      const response = await api.get('/api/pets'); // 내가 등록한 동물만 조회
      setPets(response.data);
    } catch (error) {
      console.error("반려동물 목록 로드 실패", error);
    }
  };

  useEffect(() => {
    fetchPets();
  }, [refreshTrigger]);

  const handleDelete = async (id) => {
    if (window.confirm('정말 삭제하시겠습니까?')) {
      try {
        await api.delete(`/api/pets/${id}`);
        fetchPets();
      } catch (error) {
        alert('삭제 실패');
      }
    }
  };

  return (
    <div style={{ marginTop: '20px' }}>
      <h4>🏠 내 반려동물 목록</h4>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        {pets.map(pet => (
          <div key={pet.id} style={{ border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
            <strong>{pet.name}</strong> [{pet.breed}]
            <p>{pet.age}살 / {pet.gender === 'MALE' ? '수컷' : '암컷'}</p>
            <p>{pet.image}</p>
            <p>{pet.caution}</p>
            <button onClick={() => onEditRequest(pet)}>수정</button>
            <button onClick={() => handleDelete(pet.id)} style={{ color: 'red' }}>삭제</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PetList;