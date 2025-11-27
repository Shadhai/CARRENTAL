import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI, bookingAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useLocation, useSearchParams, Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user, updateUser, isAdmin } = useAuth();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [userData, setUserData] = useState({
    username: '', email: '', firstName: '', lastName: '', 
    phone: '', address: '', driverLicense: ''
  });
  const [originalData, setOriginalData] = useState({});
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [pendingRequest, setPendingRequest] = useState(null);

  // ✅ FIXED: Handle URL parameter for active tab
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['profile', 'bookings', 'preferences'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab('profile');
    }
  }, [searchParams]);

  // ✅ FIXED: Update URL when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  // ✅ FIXED: Check for pending edit requests
  useEffect(() => {
    const pending = localStorage.getItem(`profile_edit_request_${user?.id}`);
    if (pending) {
      setPendingRequest(JSON.parse(pending));
    }
  }, [user?.id]);

  useEffect(() => {
    if (user) {
      const userData = {
        username: user.username || '',
        email: user.email || '',
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        address: user.address || '',
        driverLicense: user.driverLicense || ''
      };
      setUserData(userData);
      setOriginalData(userData);
    }
    if (activeTab === 'bookings') {
      fetchUserBookings();
    }
  }, [user, activeTab]);

  // ✅ FIXED: Complete booking functions
  const calculateTotalDays = (start, end) => {
    if (!start || !end) return 0;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffTime = Math.abs(endDate - startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateTotalPrice = (booking) => {
    if (!booking.car) return 0;
    const days = calculateTotalDays(booking.startDate, booking.endDate);
    const dailyPrice = booking.car.pricePerDay || booking.car.price || 0;
    return days * dailyPrice;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const cancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    
    try {
      await bookingAPI.cancelBooking(bookingId);
      toast.success('Booking cancelled successfully');
      fetchUserBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  const fetchUserBookings = async () => {
    try {
      setLoading(true);
      const response = await bookingAPI.getMyBookings();
      
      console.log('📋 Bookings API response:', response);
      
      let bookingsData = [];
      if (response.data && Array.isArray(response.data)) {
        bookingsData = response.data;
      } else if (response.data && response.data.data) {
        bookingsData = response.data.data;
      } else {
        bookingsData = response.data || [];
      }
      
      setBookings(bookingsData);
      console.log('✅ Bookings loaded:', bookingsData);
      
    } catch (error) {
      console.error('❌ Error fetching bookings:', error);
      toast.error('Failed to load bookings');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // ✅ FIXED: Add missing handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      if (isAdmin) {
        // Admin can edit directly
        await userAPI.updateProfile(user.id, userData);
        updateUser(userData);
        setEditMode(false);
        toast.success('Profile updated successfully!');
      } else {
        // Regular users submit edit request
        const editRequest = {
          userId: user.id,
          requestedChanges: userData,
          originalData: originalData,
          timestamp: new Date().toISOString(),
          status: 'pending'
        };

        // Save to localStorage (in real app, send to backend)
        localStorage.setItem(`profile_edit_request_${user.id}`, JSON.stringify(editRequest));
        setPendingRequest(editRequest);
        
        setEditMode(false);
        toast.info('Profile edit request submitted. Admin approval required.');
        
        // Simulate notification to admin
        simulateAdminNotification(editRequest);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const simulateAdminNotification = (request) => {
    console.log('Admin Notification: Profile edit request pending', request);
    
    const adminNotifications = JSON.parse(localStorage.getItem('admin_notifications') || '[]');
    adminNotifications.push({
      type: 'profile_edit_request',
      data: request,
      timestamp: new Date().toISOString(),
      read: false
    });
    localStorage.setItem('admin_notifications', JSON.stringify(adminNotifications));
  };

  const cancelEditRequest = () => {
    localStorage.removeItem(`profile_edit_request_${user.id}`);
    setPendingRequest(null);
    setUserData(originalData);
    setEditMode(false);
    toast.info('Edit request cancelled.');
  };

  return (
    <div className="profile-page">
      <div className="profile-header">
        <div className="profile-avatar">
          <div className="avatar-circle">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
        <div className="profile-info">
          <h1>{user?.username || 'User'}</h1>
          <p>{user?.email || 'No email provided'}</p>
          <div className="member-since">
            Member since {new Date().getFullYear()}
          </div>
        </div>
      </div>

      {/* Pending Request Banner */}
      {pendingRequest && (
        <div className="pending-request-banner">
          <div className="banner-content">
            <span>⏳ Profile edit request pending admin approval</span>
            <button 
              onClick={cancelEditRequest}
              className="btn-cancel-request"
            >
              Cancel Request
            </button>
          </div>
        </div>
      )}

      <div className="profile-tabs">
        <button 
          className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => handleTabChange('profile')}
        >
          👤 Profile
        </button>
        <button 
          className={`tab-button ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => handleTabChange('bookings')}
        >
          📋 My Bookings {bookings.length > 0 && `(${bookings.length})`}
        </button>
        <button 
          className={`tab-button ${activeTab === 'preferences' ? 'active' : ''}`}
          onClick={() => handleTabChange('preferences')}
        >
          ⚙️ Preferences
        </button>
      </div>

      <div className="profile-content">
        {activeTab === 'profile' && (
          <div className="profile-section">
            <div className="section-header">
              <h2>Personal Information</h2>
              
              {!editMode ? (
                <div className="header-actions">
                  {isAdmin && (
                    <span className="admin-badge">Admin Mode</span>
                  )}
                  {!pendingRequest && (
                    <button 
                      className="btn-edit"
                      onClick={() => setEditMode(true)}
                    >
                      ✏️ Edit Profile
                    </button>
                  )}
                </div>
              ) : (
                <div className="edit-actions">
                  <button 
                    className="btn-cancel"
                    onClick={() => {
                      setEditMode(false);
                      setUserData(originalData);
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="btn-save"
                    onClick={handleSaveProfile}
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : isAdmin ? 'Save Changes' : 'Submit for Approval'}
                  </button>
                </div>
              )}
            </div>

            {!isAdmin && (
              <div className="edit-notice">
                <p>📋 Note: Profile changes require admin approval. Your request will be processed within 24 hours.</p>
              </div>
            )}

            <form className="profile-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    name="email"
                    value={userData.email}
                    onChange={handleInputChange}
                    disabled={!editMode}
                  />
                </div>
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={userData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="Enter your first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={userData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="Enter your last name"
                  />
                </div>
                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={userData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Driver's License Number</label>
                  <input
                    type="text"
                    name="driverLicense"
                    value={userData.driverLicense}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="Enter your driver's license number"
                  />
                </div>
                <div className="form-group full-width">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={userData.address}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    placeholder="Enter your full address"
                    rows="3"
                  />
                </div>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bookings-section">
            <h2>Your Bookings</h2>
            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading your bookings...</p>
              </div>
            ) : bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No bookings yet</h3>
                <p>Start your journey by booking your first car!</p>
                <Link to="/cars" className="btn-primary">Browse Cars</Link>
              </div>
            ) : (
              <div className="bookings-grid">
                {bookings.map(booking => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-header">
                      <div className="booking-id">Booking #{booking.id}</div>
                      <span className={`booking-status ${(booking.status?.toLowerCase() || 'confirmed')}`}>
                        {booking.status || 'CONFIRMED'}
                      </span>
                    </div>
                    
                    <div className="booking-details">
                      <div className="car-info">
                        <div className="car-image">
                          <img 
                            src={booking.car?.imageUrl || booking.car?.images?.[0] || '/default-car.jpg'} 
                            alt={booking.car?.model || 'Car image'}
                            onError={(e) => {
                              e.target.src = '/default-car.jpg';
                            }}
                          />
                        </div>
                        <div className="car-details">
                          <h4>{booking.car?.brand || booking.car?.make} {booking.car?.model}</h4>
                          <p>{booking.car?.year} • {booking.car?.color}</p>
                          <p className="car-price">${booking.car?.pricePerDay || booking.car?.price}/day</p>
                        </div>
                      </div>
                      
                      <div className="booking-dates">
                        <div className="date-group">
                          <label>Pick-up</label>
                          <span>{formatDate(booking.startDate)}</span>
                        </div>
                        <div className="date-group">
                          <label>Drop-off</label>
                          <span>{formatDate(booking.endDate)}</span>
                        </div>
                        <div className="date-group">
                          <label>Duration</label>
                          <span>{calculateTotalDays(booking.startDate, booking.endDate)} days</span>
                        </div>
                      </div>
                      
                      <div className="booking-total">
                        <label>Total Amount</label>
                        <span className="total-price">${calculateTotalPrice(booking)}</span>
                      </div>
                    </div>
                    
                    <div className="booking-actions">
                      {booking.status !== 'CANCELLED' && new Date(booking.startDate) > new Date() && (
                        <button 
                          className="btn-cancel-booking"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Booking
                        </button>
                      )}
                      <button className="btn-view-details">
                        View Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'preferences' && (
          <div className="preferences-section">
            <h2>Preferences & Settings</h2>
            <div className="preferences-grid">
              <div className="preference-card">
                <h3>🔔 Notification Preferences</h3>
                <div className="preference-options">
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Booking confirmations</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" defaultChecked />
                    <span>Reminders before pickup</span>
                  </label>
                  <label className="checkbox-label">
                    <input type="checkbox" />
                    <span>Special offers and promotions</span>
                  </label>
                </div>
              </div>
              
              <div className="preference-card">
                <h3>🚗 Rental Preferences</h3>
                <div className="preference-options">
                  <div className="select-group">
                    <label>Preferred Car Type</label>
                    <select>
                      <option>Any</option>
                      <option>Economy</option>
                      <option>Compact</option>
                      <option>SUV</option>
                      <option>Luxury</option>
                    </select>
                  </div>
                  <div className="select-group">
                    <label>Default Transmission</label>
                    <select>
                      <option>Any</option>
                      <option>Automatic</option>
                      <option>Manual</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="preference-card">
                <h3>⚡ Quick Actions</h3>
                <div className="quick-actions">
                  <button className="btn-secondary">Change Password</button>
                  <button className="btn-secondary">Download Rental History</button>
                  <button className="btn-secondary">Contact Support</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;