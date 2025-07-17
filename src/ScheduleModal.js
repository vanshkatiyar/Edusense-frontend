import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { RiCalendar2Fill } from 'react-icons/ri';

export default function ScheduleModal({ room, onClose, onUpdate }) {
  const [batchName, setBatchName] = useState(room.batch_name || '');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [error, setError] = useState('');
  const { token } = useAuth();

  const handleSave = async () => {
    setError('');
    if (!batchName || !startTime || !endTime) {
      setError('All fields are required to set a schedule.');
      return;
    }
    if (startTime >= endTime) {
      setError('End time must be after start time.');
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:5000/api/rooms/${room.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ batch_name: batchName, start_time: startTime, end_time: endTime })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to save schedule');
      onUpdate(data);
      onClose();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleClear = async () => {
    setError('');
    try {
      const response = await fetch(`http://127.0.0.1:5000/api/rooms/${room.id}/schedule`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({})
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.msg || 'Failed to clear schedule');
      onUpdate(data);
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
          <h3><RiCalendar2Fill /> Schedule Class for {room.name}</h3>
        </div>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <label htmlFor="batchName">Batch Name</label>
          <input id="batchName" type="text" value={batchName} onChange={(e) => setBatchName(e.target.value)} placeholder="e.g., CS-A 2024" />
        </div>
        <div className="time-inputs">
          <div className="input-group">
            <label htmlFor="startTime">Start Time</label>
            <input id="startTime" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="input-group">
            <label htmlFor="endTime">End Time</label>
            <input id="endTime" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>
        <div className="modal-actions">
          <button className="modal-button clear" onClick={handleClear}>Clear Schedule</button>
          <button className="modal-button save" onClick={handleSave}>Save Schedule</button>
        </div>
      </div>
    </>
  );
}