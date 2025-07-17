import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTour } from './TourContext';
import ScheduleModal from './ScheduleModal';
import RoomEditModal from './RoomEditModal';
import { apiFetch } from './api';
import { FaBuilding, FaDoorOpen, FaLock, FaLightbulb, FaRegLightbulb, FaUserFriends, FaSearch, FaClock, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { RiCalendar2Fill } from 'react-icons/ri';

function RoomCard({ room, onUpdate, onSchedule, onEdit, onDelete }) {
  const { user, token } = useAuth();
  const [occupancyInput, setOccupancyInput] = useState(room.occupancy);
  const isBusy = room.occupancy > 0 || !!room.batch_name;
  const cardStatusClass = isBusy ? 'occupied' : 'vacant';
  const canModify = user && (user.role === 'admin' || user.role === 'teacher');
  const isAdmin = user && user.role === 'admin';

  useEffect(() => { setOccupancyInput(room.occupancy); }, [room.occupancy]);

  const handleToggleLight = () => {
    if (!canModify) return;
    apiFetch(`http://127.0.0.1:5000/api/rooms/${room.id}/toggle-light`, { method: 'POST' }, token)
      .then(onUpdate).catch(err => console.error(err.message));
  };

  const handleSetOccupancy = (newOccupancy) => {
    if (!canModify) return;
    const value = Math.max(0, newOccupancy);
    if (value === room.occupancy) return;
    apiFetch(`http://127.0.0.1:5000/api/rooms/${room.id}/set-occupancy`, {
      method: 'POST', body: JSON.stringify({ occupancy: value }),
    }, token).then(onUpdate).catch(err => console.error(err.message));
  };
  
  const handleInputChange = (e) => setOccupancyInput(parseInt(e.target.value, 10) || 0);

  return (
    <div className={`room-card ${cardStatusClass}`}>
      <div className="room-header">
        <h3 className="room-name">{room.name}</h3>
        {isAdmin && <button className="schedule-button" onClick={() => onSchedule(room)} title="Set Schedule"><RiCalendar2Fill /></button>}
      </div>
      
      {room.batch_name && room.timing && (
        <div className="schedule-info"><p><FaClock /> {room.timing}</p><p>{room.batch_name}</p></div>
      )}
      <div className="room-details">
        <p><FaBuilding /> Branch: <span>{room.branch}</span></p>
        <p><FaUserFriends /> Occupancy: <span>{room.occupancy}</span></p>
        <p>{room.is_locked ? <FaLock /> : <FaDoorOpen />} Status: <span>{room.is_locked ? 'Locked' : 'Unlocked'}</span></p>
      </div>
      
      {canModify && (
        <div className="room-controls">
          <div className="occupancy-controls">
            <label>Set Occupancy</label>
            <div><button onClick={() => handleSetOccupancy(occupancyInput - 1)}>-</button><input type="number" value={occupancyInput} onChange={handleInputChange} onBlur={() => handleSetOccupancy(occupancyInput)} /><button onClick={() => handleSetOccupancy(occupancyInput + 1)}>+</button></div>
          </div>
          <div className="light-controls">
            <label>Lights</label>
            <div className="toggle-switch" onClick={handleToggleLight}><input type="checkbox" checked={room.lights_on} readOnly /><span className="slider">{room.lights_on ? <FaLightbulb /> : <FaRegLightbulb />}</span></div>
          </div>
        </div>
      )}
      {isAdmin && (
        <div className="card-admin-actions">
          <button className="card-action-button edit" onClick={() => onEdit(room)}><FaEdit /> Edit</button>
          <button className="card-action-button delete" onClick={() => onDelete(room.id)}><FaTrash /> Delete</button>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [rooms, setRooms] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [schedulingRoom, setSchedulingRoom] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { user, token } = useAuth();
  const { startTour } = useTour();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => {
    const tourTimeout = setTimeout(() => { startTour(); }, 500);
    return () => clearTimeout(tourTimeout);
  }, [startTour]);

  useEffect(() => {
    if (token) {
      apiFetch('http://127.0.0.1:5000/api/rooms', {}, token)
        .then(data => { setRooms(data); setError(null); })
        .catch(err => { setError(err.message); });
    }
  }, [token]);

  const handleRoomUpdate = (updatedRoom) => {
    setRooms(currentRooms => currentRooms.map(room => (room.id === updatedRoom.id ? updatedRoom : room)));
  };

  const handleOpenAddModal = () => { setEditingRoom(null); setIsEditModalOpen(true); };
  const handleOpenEditModal = (room) => { setEditingRoom(room); setIsEditModalOpen(true); };
  const handleCloseEditModal = () => { setIsEditModalOpen(false); setEditingRoom(null); };

  const handleSaveRoom = (savedRoom) => {
    const exists = rooms.some(r => r.id === savedRoom.id);
    if (exists) {
      handleRoomUpdate(savedRoom);
    } else {
      setRooms([...rooms, savedRoom]);
    }
  };

  const handleDeleteRoom = async (roomId) => {
    if (!window.confirm("Are you sure you want to permanently delete this room?")) return;
    try {
      await apiFetch(`http://127.0.0.1:5000/api/rooms/${roomId}`, { method: 'DELETE' }, token);
      setRooms(currentRooms => currentRooms.filter(r => r.id !== roomId));
    } catch (err) {
      setError(err.message);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const searchTerms = searchQuery.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (searchTerms.length === 0) return true;
    return searchTerms.every(term => {
      switch (term) {
        case 'occupied': return room.occupancy > 0 || !!room.batch_name;
        case 'vacant': return room.occupancy === 0 && !room.batch_name;
        case 'locked': return room.is_locked;
        case 'unlocked': return !room.is_locked;
        default: return room.name.toLowerCase().includes(term) || room.branch.toLowerCase().includes(term);
      }
    });
  });

  return (
    <>
      {schedulingRoom && ( <ScheduleModal room={schedulingRoom} onClose={() => setSchedulingRoom(null)} onUpdate={handleRoomUpdate} /> )}
      {isEditModalOpen && ( <RoomEditModal room={editingRoom} onClose={handleCloseEditModal} onSave={handleSaveRoom} /> )}
      <div className="page-content">
        <div className="dashboard-header">
          <h2 className="page-title">Classroom Dashboard</h2>
          <div className="header-actions">
            <div className="search-container"><FaSearch className="search-icon" /><input type="text" placeholder="Search by name, branch, status..." className="search-bar" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} /></div>
            {isAdmin && <button className="add-room-button" onClick={handleOpenAddModal}><FaPlus /> Add New Room</button>}
          </div>
        </div>
        {error && <div className="error-message">{error}</div>}
        {!error && filteredRooms.length > 0 && (
          <div className="dashboard-grid">
            {filteredRooms.map((room, index) => (
              <div key={room.id} className="room-card-wrapper" style={{ animationDelay: `${index * 50}ms` }}>
                <RoomCard room={room} onUpdate={handleRoomUpdate} onSchedule={setSchedulingRoom} onEdit={handleOpenEditModal} onDelete={handleDeleteRoom} />
              </div>
            ))}
          </div>
        )}
        {!error && filteredRooms.length === 0 && (
          <div className="no-results-message"><h3>No classrooms found</h3><p>Your search query did not match any rooms.</p></div>
        )}
      </div>
    </>
  );
}