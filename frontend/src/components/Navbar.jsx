// src/components/Navbar.jsx - COMPLETELY FIXED VERSION
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleMyBookings = () => {
    // ✅ FIXED: Use a more reliable approach
    navigate('/profile?tab=bookings');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  const handleProfile = () => {
    navigate('/profile?tab=profile');
    setIsMenuOpen(false);
    setIsDropdownOpen(false);
  };

  // ✅ FIXED: Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.user-profile-trigger') && 
          !event.target.closest('.profile-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ FIXED: Close dropdown when route changes
  React.useEffect(() => {
    setIsDropdownOpen(false);
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="navbar">
      <div className="nav-container">
        {/* Brand */}
        <div className="nav-brand">
          <Link to="/" className="brand-link" onClick={() => setIsMenuOpen(false)}>
            <span className="brand-icon"></span>
            <span className="brand-text">CarRental</span>
          </Link>
        </div>

        {/* Hamburger (mobile) */}
        <button 
          className={`menu-toggle ${isMenuOpen ? 'active' : ''}`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* Links */}
        <div className={`nav-links ${isMenuOpen ? 'nav-links-active' : ''}`}>
          <Link to="/" className="nav-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
          <Link to="/cars" className="nav-link" onClick={() => setIsMenuOpen(false)}>Cars</Link>

          {isAuthenticated ? (
            <div className="user-menu">
              {/* Admin link only if ROLE_ADMIN */}
              {user && (user.roles?.includes('ROLE_ADMIN') || user.roles?.some(role =>
                typeof role === 'object' ? role.name === 'ROLE_ADMIN' : role === 'ROLE_ADMIN'
              )) && (
                <Link to="/admin" className="nav-link admin-link" onClick={() => setIsMenuOpen(false)}>
                  Admin
                </Link>
              )}

              {/* Profile dropdown */}
              <div className="user-profile-container">
                <div 
                  className="user-profile-trigger"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <div className="user-avatar">
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="username">{user?.username}</span>
                  <span className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>▼</span>
                </div>

                {isDropdownOpen && (
                  <div className="profile-dropdown">
                    <button 
                      className="dropdown-item"
                      onClick={handleProfile}
                    >
                      👤 Profile
                    </button>
                    <button 
                      className="dropdown-item" 
                      onClick={handleMyBookings}
                    >
                      📋 My Bookings
                    </button>
                    <div className="dropdown-divider"></div>
                    <button 
                      className="dropdown-item logout-btn" 
                      onClick={handleLogout}
                    >
                      🚪 Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="auth-buttons">
              <Link to="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Login</Link>
              <Link to="/signup" className="btn-signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;