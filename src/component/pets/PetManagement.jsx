import React, { useState } from 'react';
import PetForm from './PetForm';
import PetList from './PetList';

const PetManagement = () => {
  const [petToEdit, setPetToEdit] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleSaveSuccess = () => {
    setPetToEdit(null);
    setRefreshKey(prev => prev + 1);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>🦴 반려동물 관리</h2>
      <PetForm petToEdit={petToEdit} onSaveSuccess={handleSaveSuccess} />
      <PetList onEditRequest={(pet) => setPetToEdit(pet)} refreshTrigger={refreshKey} />
    </div>
  );
};

export default PetManagement;