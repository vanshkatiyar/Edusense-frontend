import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { apiFetch } from './api';
import { FaPlus, FaEdit } from 'react-icons/fa';

export default function RoomEditModal({ room, onClose, onSave }) {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();
  const isEditing = !!room;

  useEffect(() => {
    if (isEditing) {
      setName(room.name);
      setBranch(room.branch);
    }
  }, [room, isEditing]);

  const handleSave = async () => {
    setError('');
    if (!name || !branch) {
      setError('Room Name and Branch are required.');
      return;
    }
    
    const url = isEditing ? `http://127.0.0.1:5000/api/rooms/${room.id}` : 'http://127.0.0.1:5000/api/rooms';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const savedRoom = await apiFetch(url, {
        method: method,
        body: JSON.stringify({ name, branch })
      }, token);
      onSave(savedRoom);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <>
      <div className="modal-overlay" onClick={onClose}></div>
      <div className="modal-content">
        <div className="modal-header">
          <h3>{isEditing ? <FaEdit /> : <FaPlus />} {isEditing ? 'Edit Room' : 'Add New Room'}</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <label htmlFor="roomName">Room Name</label>
          <input id="roomName" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., AIRO101" />
        </div>
        <div className="input-group">
          <label htmlFor="branch">Branch</label>
          <input id="branch" type="text" value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g., Artificial Intelligence" />
        </div>
        <div className="modal-actions">
          <button className="modal-button clear" onClick={onClose}>Cancel</button>
          <button className="modal-button save" onClick={handleSave}>Save Changes</button>
        </div>
      </div>
    </>
  );
}