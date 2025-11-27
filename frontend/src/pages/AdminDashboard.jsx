import React, { useState, useEffect } from 'react';
import { userAPI, carAPI, bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './admin/AdminDashboard.css';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [cars, setCars] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    username: '', email: '', password: '', roles: ['ROLE_USER'],
    brand: '', model: '', year: new Date().getFullYear(),
    pricePerDay: '', color: '', available: true,
    features: '', imageUrl: '', imageSource: 'url', imageFile: null
  });

  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  // ✅ FIXED: Enhanced admin check
  const userIsAdmin = isAdmin || (user?.roles?.some(role => {
    const roleName = typeof role === 'object' ? role.name || role.authority : role;
    return roleName === 'ROLE_ADMIN' || roleName === 'ADMIN';
  }));

  useEffect(() => {
    if (userIsAdmin && activeTab) {
      fetchDataForTab(activeTab);
    }
  }, [activeTab, userIsAdmin]);

  const fetchDataForTab = async (tab) => {
    if (!userIsAdmin) {
      console.error('❌ Access denied: User is not admin');
      return;
    }

    setLoading(true);
    try {
      let response;
      
      switch (tab) {
        case 'users':
          response = await userAPI.getAllUsers();
          break;
        case 'cars':
          response = await carAPI.getAllCars();
          break;
        case 'bookings':
          response = await bookingAPI.getAllBookings();
          break;
        default:
          return;
      }
      
      let data = response.data?.data || response.data || response;
      
      if (Array.isArray(data)) {
        switch (tab) {
          case 'users':
            setUsers(data);
            break;
          case 'cars':
            setCars(data);
            break;
          case 'bookings':
            setBookings(data);
            break;
        }
        toast.success(`Loaded ${tab} successfully`);
      } else {
        console.warn(`Unexpected data format for ${tab}:`, data);
        toast.error(`Failed to load ${tab}`);
      }
      
    } catch (error) {
      console.error(`Error fetching ${tab}:`, error);
      if (error.response?.status === 401) {
        toast.error('Authentication failed. Please login again.');
        logout();
      } else {
        toast.error(`Failed to load ${tab}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const displayRoles = (roles) => {
    if (!roles) return 'ROLE_USER';
    
    if (Array.isArray(roles)) {
      return roles.map(role => {
        if (typeof role === 'object') {
          return role.name || role.authority || 'ROLE_USER';
        }
        return role;
      }).join(', ');
    }
    
    return roles;
  };

  // User Management Functions
  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await userAPI.deleteUser(userId);
      toast.success('User deleted successfully');
      fetchDataForTab('users');
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleUserEdit = (user = null) => {
    setEditingItem(user);
    if (user) {
      setFormData({
        username: user.username || '',
        email: user.email || '',
        password: '',
        roles: Array.isArray(user.roles) 
          ? user.roles.map(role => typeof role === 'object' ? role.name : role)
          : [user.roles || 'ROLE_USER'],
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '',
        color: '',
        available: true,
        features: '',
        imageUrl: ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: ['ROLE_USER'],
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '',
        color: '',
        available: true,
        features: '',
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  // Car Management Functions
  const deleteCar = async (carId) => {
    if (!window.confirm('Are you sure you want to delete this car?')) return;
    
    try {
      await carAPI.deleteCar(carId);
      toast.success('Car deleted successfully');
      fetchDataForTab('cars');
    } catch (error) {
      console.error('Error deleting car:', error);
      toast.error('Failed to delete car');
    }
  };

  const handleCarEdit = (car = null) => {
    setEditingItem(car);
    if (car) {
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: ['ROLE_USER'],
        brand: car.brand || car.make || '',
        model: car.model || '',
        year: car.year || new Date().getFullYear(),
        pricePerDay: car.pricePerDay || car.price || '',
        color: car.color || '',
        available: car.available !== false,
        features: Array.isArray(car.features) ? car.features.join(', ') : (car.features || ''),
        imageUrl: car.imageUrl || car.images?.[0] || ''
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        roles: ['ROLE_USER'],
        brand: '',
        model: '',
        year: new Date().getFullYear(),
        pricePerDay: '',
        color: '',
        available: true,
        features: '',
        imageUrl: ''
      });
    }
    setShowModal(true);
  };

  const handleToggleAvailability = async (car) => {
    try {
      await carAPI.toggleCarAvailability(car.id);
      toast.success(`Car ${car.available ? 'marked as unavailable' : 'marked as available'}`);
      fetchDataForTab('cars');
    } catch (error) {
      console.error('Error updating car availability:', error);
      toast.error('Failed to update availability');
    }
  };

  // Booking Management Functions
  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchDataForTab('bookings');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  // ✅ FIXED: Add missing handleInputChange function
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
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (activeTab === 'users') {
        const userData = {
          username: formData.username,
          email: formData.email,
          roles: formData.roles
        };

        if (formData.password) {
          userData.password = formData.password;
        }

        if (editingItem) {
          await userAPI.updateUser(editingItem.id, userData);
          toast.success('User updated successfully!');
        } else {
          if (!formData.password) {
            toast.error('Password is required for new users');
            setLoading(false);
            return;
          }
          await userAPI.createUser(userData);
          toast.success('User created successfully!');
        }

      } else if (activeTab === 'cars') {
        const carData = {
          brand: formData.brand,
          model: formData.model,
          year: parseInt(formData.year),
          pricePerDay: parseFloat(formData.pricePerDay),
          color: formData.color,
          available: formData.available,
          features: formData.features.split(',').map(f => f.trim()).filter(f => f)
        };

        // Handle image upload
        if (formData.imageSource === 'url') {
          carData.imageUrl = formData.imageUrl;

          if (editingItem) {
            await carAPI.updateCar(editingItem.id, carData);
            toast.success('Car updated successfully!');
          } else {
            await carAPI.createCar(carData);
            toast.success('Car created successfully!');
          }
        } else if (formData.imageFile) {
          const formDataToSend = new FormData();
          Object.keys(carData).forEach((key) => {
            formDataToSend.append(key, carData[key]);
          });
          formDataToSend.append('image', formData.imageFile);

          if (editingItem) {
            await carAPI.updateCar(editingItem.id, formDataToSend);
            toast.success('Car updated successfully!');
          } else {
            await carAPI.createCar(formDataToSend);
            toast.success('Car created successfully!');
          }
        } else {
          toast.error('Please provide an image (URL or upload)');
          setLoading(false);
          return;
        }
      }

      setShowModal(false);
      setEditingItem(null);
      fetchDataForTab(activeTab);
      
    } catch (error) {
      console.error('Error saving data:', error);
      toast.error('Failed to save data');
    } finally {
      setLoading(false);
    }
  };

  // Authentication Check
  if (!isAuthenticated) {
    return (
      <div className="error-container">
        <h2>Authentication Required</h2>
        <p>Please login to access the admin dashboard.</p>
      </div>
    );
  }

  if (!userIsAdmin) {
    return (
      <div className="error-container">
        <h2>Access Denied</h2>
        <p>You need administrator privileges to access this page.</p>
        <p>Current user: {user?.username}</p>
        <p>Your roles: {displayRoles(user?.roles)}</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h2>Admin Dashboard</h2>
        <div className="user-info">
          <span>Welcome, {user?.username} (Admin)</span>
          <br />
          <small>Roles: {displayRoles(user?.roles)}</small>
        </div>
      </div>
      
      <div className="admin-tabs">
        <button 
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
        >
          Users ({users.length})
        </button>
        <button 
          className={activeTab === 'cars' ? 'active' : ''}
          onClick={() => setActiveTab('cars')}
        >
          Cars ({cars.length})
        </button>
        <button 
          className={activeTab === 'bookings' ? 'active' : ''}
          onClick={() => setActiveTab('bookings')}
        >
          Bookings ({bookings.length})
        </button>
      </div>

      <div className="admin-actions">
        {(activeTab === 'users' || activeTab === 'cars') && (
          <button className="btn-primary" onClick={() => activeTab === 'users' ? handleUserEdit() : handleCarEdit()}>
            Add New {activeTab.slice(0, -1)}
          </button>
        )}
      </div>

      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading {activeTab}...</p>
        </div>
      )}

 

      {!loading && activeTab === 'users' && (
        <div className="admin-section">
          <h3>Users Management</h3>
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
                {users.map(userItem => (
                  <tr key={userItem.id}>
                    <td>{userItem.id}</td>
                    <td>{userItem.username}</td>
                    <td>{userItem.email}</td>
                    <td>{displayRoles(userItem.roles)}</td>
                    <td>
                      <span className={`status-badge ${userItem.active !== false ? 'active' : 'inactive'}`}>
                        {userItem.active !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => handleUserEdit(userItem)}
                          disabled={userItem.id === user?.id}
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => deleteUser(userItem.id)}
                          className="btn-danger btn-sm"
                          disabled={userItem.id === user?.id || displayRoles(userItem.roles).includes('ADMIN')}
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
        </div>
      )}

      {!loading && activeTab === 'cars' && (
        <div className="admin-section">
          <h3>Cars Management</h3>
          <div className="table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Year</th>
                  <th>Price/Day</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {cars.map(car => (
                  <tr key={car.id}>
                    <td>
                      <img 
                        src={car.imageUrl || car.images?.[0] || '/default-car.jpg'} 
                        alt={`${car.brand} ${car.model}`}
                        className="car-image"
                        onError={(e) => {
                          e.target.src = '/default-car.jpg';
                        }}
                      />
                    </td>
                    <td>{car.brand || car.make}</td>
                    <td>{car.model}</td>
                    <td>{car.year}</td>
                    <td>${car.pricePerDay || car.price}</td>
                    <td>
                      <span className={`status-badge ${car.available ? 'available' : 'unavailable'}`}>
                        {car.available ? 'Available' : 'Unavailable'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-secondary btn-sm"
                          onClick={() => handleCarEdit(car)}
                        >
                          Edit
                        </button>
                        <button 
                          className={`btn-warning btn-sm`}
                          onClick={() => handleToggleAvailability(car)}
                        >
                          {car.available ? 'Make Unavailable' : 'Make Available'}
                        </button>
                        <button 
                          className="btn-danger btn-sm"
                          onClick={() => deleteCar(car.id)}
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
        </div>
      )}

      {!loading && activeTab === 'bookings' && (
        <div className="admin-section">
          <h3>Bookings Management</h3>
          {bookings.length === 0 ? (
            <div className="no-data">
              <p>No bookings found.</p>
            </div>
          ) : (
            <div className="table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Car</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Total Price</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(booking => (
                    <tr key={booking.id}>
                      <td>{booking.id}</td>
                      <td>{booking.user?.username || `User ${booking.userId}`}</td>
                      <td>{booking.car?.brand} {booking.car?.model}</td>
                      <td>{new Date(booking.startDate).toLocaleDateString()}</td>
                      <td>{new Date(booking.endDate).toLocaleDateString()}</td>
                      <td>${booking.totalPrice || 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${booking.status?.toLowerCase() === 'cancelled' ? 'unavailable' : 'available'}`}>
                          {booking.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td>
                        <button 
                          onClick={() => cancelBooking(booking.id)}
                          className="btn-warning btn-sm"
                          disabled={booking.status === 'CANCELLED'}
                        >
                          {booking.status === 'CANCELLED' ? 'Cancelled' : 'Cancel'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal for Add/Edit */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{editingItem ? `Edit ${activeTab.slice(0, -1)}` : `Add New ${activeTab.slice(0, -1)}`}</h3>
            <form onSubmit={handleSubmit}>
              {activeTab === 'users' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Username *</label>
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      disabled={!!editingItem}
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
                      {editingItem ? 'New Password' : 'Password *'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required={!editingItem}
                      placeholder={editingItem ? 'Leave blank to keep current password' : ''}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Roles</label>
                    <div className="checkbox-group">
                      <label>
                        <input
                          type="checkbox"
                          name="roles"
                          value="ROLE_USER"
                          checked={formData.roles.includes('ROLE_USER')}
                          onChange={handleInputChange}
                        />
                        User
                      </label>
                      <label>
                        <input
                          type="checkbox"
                          name="roles"
                          value="ROLE_ADMIN"
                          checked={formData.roles.includes('ROLE_ADMIN')}
                          onChange={handleInputChange}
                        />
                        Admin
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'cars' && (
                <div className="form-grid">
                  <div className="form-group">
                    <label>Brand *</label>
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Year *</label>
                    <input
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1900"
                      max="2030"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Price per Day ($) *</label>
                    <input
                      type="number"
                      name="pricePerDay"
                      value={formData.pricePerDay}
                      onChange={handleInputChange}
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Color</label>
                    <input
                      type="text"
                      name="color"
                      value={formData.color}
                      onChange={handleInputChange}
                    />
                  </div>
                 <div className="form-group full-width">
  <label>Image Source</label>
  <div className="image-source-toggle">
    <label>
      <input
        type="radio"
        name="imageSource"
        value="url"
        checked={formData.imageSource === 'url'}
        onChange={(e) =>
          setFormData({
            ...formData,
            imageSource: e.target.value,
            imageFile: null
          })
        }
      />
      URL
    </label>
    <label>
      <input
        type="radio"
        name="imageSource"
        value="local"
        checked={formData.imageSource === 'local'}
        onChange={(e) =>
          setFormData({
            ...formData,
            imageSource: e.target.value,
            imageUrl: ''
          })
        }
      />
      Upload File
    </label>
  </div>
</div>

{formData.imageSource === 'url' ? (
  <div className="form-group full-width">
    <label>Image URL</label>
    <input
      type="url"
      name="imageUrl"
      value={formData.imageUrl}
      onChange={handleInputChange}
      placeholder="https://example.com/car-image.jpg"
    />
    {formData.imageUrl && (
      <div className="image-preview">
        <img
          src={formData.imageUrl}
          alt="Preview"
          onError={(e) => (e.target.style.display = 'none')}
        />
      </div>
    )}
  </div>
) : (
  <div className="form-group full-width">
    <label>Upload Image</label>
    <input
      type="file"
      accept="image/*"
      onChange={(e) => {
        const file = e.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
            setFormData({
              ...formData,
              imageFile: file,
              imageUrl: event.target.result // base64 preview
            });
          };
          reader.readAsDataURL(file);
        }
      }}
    />
    {formData.imageUrl && formData.imageFile && (
      <div className="image-preview">
        <img src={formData.imageUrl} alt="Preview" />
        <small>File: {formData.imageFile.name}</small>
      </div>
    )}
  </div>
)}

                  <div className="form-group full-width">
                    <label>Features (comma separated)</label>
                    <input
                      type="text"
                      name="features"
                      value={formData.features}
                      onChange={handleInputChange}
                      placeholder="GPS, Bluetooth, Air Conditioning"
                    />
                  </div>
                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        name="available"
                        checked={formData.available}
                        onChange={handleInputChange}
                      />
                      Available for booking
                    </label>
                  </div>
                </div>
              )}
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary"
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : (editingItem ? 'Update' : 'Add')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;