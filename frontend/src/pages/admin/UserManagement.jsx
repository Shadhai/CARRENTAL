// src/pages/admin/UserManagement.jsx
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roles: ['user']
  });

  const { user: currentUser } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getAllUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'roles') {
      const updatedRoles = checked 
        ? [...formData.roles, value]
        : formData.roles.filter(role => role !== value);
      setFormData(prev => ({ ...prev, roles: updatedRoles }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);

      const userData = { ...formData };
      if (editingUser && !userData.password) {
        delete userData.password; // Don't update password if not provided
      }

      // For demo purposes - in real app, you'd have proper API endpoints
      if (editingUser) {
        // Update user logic
        toast.success('User updated successfully!');
      } else {
        // Create user logic
        toast.success('User created successfully!');
      }

      setShowModal(false);
      setEditingUser(null);
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: ['user']
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.response?.data?.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    setFormData({
      username: user.username || '',
      email: user.email || '',
      password: '', // Don't fill password for security
      roles: Array.isArray(user.roles) 
        ? user.roles.map(role => typeof role === 'object' ? role.name : role)
        : (user.roles || ['user'])
    });
    setShowModal(true);
  };

  const handleDelete = async (userId) => {
    if (userId === currentUser?.id) {
      toast.error('You cannot delete your own account');
      return;
    }

    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await userAPI.deleteUser(userId);
        toast.success('User deleted successfully!');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const resetForm = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      password: '',
      roles: ['user']
    });
  };

  const getRoleDisplayName = (roles) => {
    if (!roles) return 'User';
    if (Array.isArray(roles)) {
      return roles.map(role => typeof role === 'object' ? role.name : role)
                 .join(', ');
    }
    return roles;
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>User Management</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add New User
        </button>
      </div>

      {loading && !users.length ? (
        <div className="loading">Loading users...</div>
      ) : (
        <div className="table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Roles</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleDisplayName(user.roles)}</td>
                  <td>
                    <span className={`status-badge ${user.active !== false ? 'active' : 'inactive'}`}>
                      {user.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-secondary btn-sm"
                        onClick={() => handleEdit(user)}
                        disabled={user.id === currentUser?.id}
                      >
                        Edit
                      </button>
                      <button 
                        className="btn-danger btn-sm"
                        onClick={() => handleDelete(user.id)}
                        disabled={user.id === currentUser?.id}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingUser ? 'Edit User' : 'Add New User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    disabled={!!editingUser}
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>
                    {editingUser ? 'New Password' : 'Password *'}
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!editingUser}
                    placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                  />
                </div>
                <div className="form-group full-width">
                  <label>Roles</label>
                  <div className="checkbox-group">
                    <label>
                      <input
                        type="checkbox"
                        name="roles"
                        value="user"
                        checked={formData.roles.includes('user')}
                        onChange={handleInputChange}
                      />
                      User
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="roles"
                        value="admin"
                        checked={formData.roles.includes('admin')}
                        onChange={handleInputChange}
                      />
                      Admin
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        name="roles"
                        value="moderator"
                        checked={formData.roles.includes('moderator')}
                        onChange={handleInputChange}
                      />
                      Moderator
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingUser ? 'Update User' : 'Add User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;