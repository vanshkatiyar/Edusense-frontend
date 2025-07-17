import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { FaUserPlus, FaTrash, FaShieldAlt, FaUsers } from 'react-icons/fa';

// A single row in the user table
function UserRow({ user, onRoleChange, onDelete, currentUser }) {
  const [selectedRole, setSelectedRole] = useState(user.role);

  const handleSelectChange = (e) => {
    setSelectedRole(e.target.value);
    onRoleChange(user.id, e.target.value);
  };

  // Prevent admin from deleting or changing their own role in the list
  const isCurrentUser = currentUser.id === user.id;

  return (
    <tr>
      <td>{user.id}</td>
      <td>{user.email}</td>
      <td>{user.phone || 'N/A'}</td>
      <td>
        <select 
          className="role-select" 
          value={selectedRole} 
          onChange={handleSelectChange}
          disabled={isCurrentUser} 
        >
          <option value="student">Student</option>
          <option value="teacher">Teacher</option>
          <option value="admin">Admin</option>
        </select>
      </td>
      <td className="action-cell">
        <button 
          onClick={() => onDelete(user.id)} 
          className="action-button delete"
          disabled={isCurrentUser} 
        >
          Delete
        </button>
      </td>
    </tr>
  );
}

// The main Admin Panel component
export default function Admin() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const [newUser, setNewUser] = useState({ email: '', phone: '', password: '', role: 'student' });
  const { user: currentUser, token } = useAuth();

  const apiFetch = async (url, options = {}) => {
    const headers = { 'Content-Type': 'application/json', ...options.headers, Authorization: `Bearer ${token}` };
    const response = await fetch(url, { ...options, headers });
    const data = await response.json();
    if (!response.ok) throw new Error(data.msg || 'An API error occurred');
    return data;
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await apiFetch('http://127.0.0.1:5000/api/users');
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch users if we have a token
    if (token) {
        fetchUsers();
    }
  }, [token]);

  const handleInputChange = (e) => {
    setNewUser({ ...newUser, [e.target.name]: e.target.value });
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!newUser.password || newUser.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    try {
      const addedUser = await apiFetch('http://127.0.0.1:5000/api/users', {
        method: 'POST', 
        body: JSON.stringify(newUser)
      });
      setUsers([...users, addedUser]);
      setSuccess(`User ${addedUser.email} created successfully!`);
      setNewUser({ email: '', phone: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.message);
    }
  };
  
  const handleRoleChange = async (userId, newRole) => {
    setError(''); setSuccess('');
    try {
      const updatedUser = await apiFetch(`http://127.0.0.1:5000/api/users/${userId}/role`, {
        method: 'PUT', 
        body: JSON.stringify({ role: newRole })
      });
      setUsers(users.map(u => (u.id === userId ? updatedUser : u)));
      setSuccess(`Role updated for ${updatedUser.email}.`);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure? This action cannot be undone.")) return;
    setError(''); setSuccess('');
    try {
      const response = await apiFetch(`http://127.0.0.1:5000/api/users/${userId}`, { method: 'DELETE' });
      setUsers(users.filter(u => u.id !== userId));
      setSuccess(response.msg);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="page-content">
      <h2 className="page-title">Admin Panel</h2>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}
      
      <div className="admin-section add-user-form">
        <h3><FaUserPlus /> Add New User</h3>
        <form onSubmit={handleAddUser}>
          <input type="email" name="email" value={newUser.email} onChange={handleInputChange} placeholder="Email Address" required />
          <input type="text" name="phone" value={newUser.phone} onChange={handleInputChange} placeholder="Phone (Optional)" />
          <input type="password" name="password" value={newUser.password} onChange={handleInputChange} placeholder="Password" required />
          <select name="role" value={newUser.role} onChange={handleInputChange}>
            <option value="student">Student</option>
            <option value="teacher">Teacher</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit">Add User</button>
        </form>
      </div>

      <div className="admin-section">
        <h3><FaUsers /> Manage Existing Users</h3>
        <div className="admin-table-container">
          <table>
            <thead>
              <tr><th>ID</th><th>Email</th><th>Phone</th><th>Role</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {users.map(user => (
                <UserRow key={user.id} user={user} onRoleChange={handleRoleChange} onDelete={handleDeleteUser} currentUser={currentUser} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}