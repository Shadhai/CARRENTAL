import React, { useState, useEffect } from 'react';
import { bookingAPI, carAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import './Booking.css';

const Booking = () => {
  const [cars, setCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [calculatedCost, setCalculatedCost] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Helper functions
  const calculateTotalDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const calculateCost = () => {
    if (!selectedCar || !startDate || !endDate) {
      setCalculatedCost(0);
      return 0;
    }
    
    const selectedCarData = cars.find(car => car.id === parseInt(selectedCar));
    if (!selectedCarData) {
      setCalculatedCost(0);
      return 0;
    }
    
    const days = calculateTotalDays();
    const dailyPrice = selectedCarData.pricePerDay || 0;
    const totalCost = days * dailyPrice;
    
    setCalculatedCost(totalCost);
    return totalCost;
  };

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error('Please login to book a car');
      navigate('/login');
      return;
    }
    
    fetchAvailableCars();
  }, [isAuthenticated, navigate]);

  // Auto-calculate cost when dates or car change
  useEffect(() => {
    calculateCost();
  }, [selectedCar, startDate, endDate]);

  // Check if car was pre-selected from CarDetail page
  useEffect(() => {
    if (location.state?.selectedCar) {
      const car = location.state.selectedCar;
      setSelectedCar(car.id.toString());
      toast.info(`Pre-selected: ${car.make} ${car.model}`);
    }
  }, [location.state]);

  const fetchAvailableCars = async () => {
    try {
      setLoading(true);
      const response = await carAPI.getAvailableCars();
      
      let carsData = [];
      if (response.data && Array.isArray(response.data)) {
        carsData = response.data;
      } else if (response.data && response.data.data) {
        carsData = response.data.data;
      } else {
        carsData = response.data || [];
      }
      
      // Filter only available cars
      const availableCars = carsData
        .filter(car => car.available !== false)
        .map(car => ({
          id: car.id || 0,
          make: car.make || 'Unknown Make',
          model: car.model || 'Unknown Model',
          type: car.type || 'Unknown Type',
          pricePerDay: car.pricePerDay || 0,
          available: car.available !== undefined ? car.available : true,
          imageUrl: car.imageUrl || null
        }));
      
      setCars(availableCars);
    } catch (error) {
      console.error('Error fetching cars:', error);
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        logout();
        navigate('/login');
      } else {
        toast.error('Failed to fetch available cars');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validation
      if (!selectedCar || !startDate || !endDate) {
        setError('Please fill all fields');
        return;
      }

      const start = new Date(startDate);
      const end = new Date(endDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (start < today) {
        setError('Start date cannot be in the past');
        return;
      }

      if (start >= end) {
        setError('End date must be after start date');
        return;
      }

      const bookingData = {
        carId: parseInt(selectedCar),
        startDate: startDate,
        endDate: endDate
      };

      console.log('Creating booking with data:', bookingData);
      
      await bookingAPI.createBooking(bookingData);
      
      toast.success('Booking created successfully!');
      
      // Reset form
      setSelectedCar('');
      setStartDate('');
      setEndDate('');
      setCalculatedCost(0);
      
      // Redirect to bookings page
      navigate('/my-bookings');
      
    } catch (error) {
      console.error('Booking error:', error);
      
      if (error.response?.status === 401) {
        setError('Authentication failed. Please try logging in again.');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else if (error.message) {
        setError(error.message);
      } else {
        setError('Failed to create booking. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getSelectedCarDetails = () => {
    if (!selectedCar) return null;
    return cars.find(car => car.id === parseInt(selectedCar));
  };

  const selectedCarDetails = getSelectedCarDetails();
  const totalDays = calculateTotalDays();

  if (!isAuthenticated) {
    return (
      <div className="auth-required">
        <h2>Authentication Required</h2>
        <p>Please login to book a car.</p>
        <button onClick={() => navigate('/login')} className="btn-primary">
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <div className="booking-container">
      <div className="booking-header">
        <h2>Book a Car</h2>
        <div className="user-info">
          <p>Welcome, <strong>{user?.username}</strong></p>
        </div>
      </div>
      
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}
      
      <div className="booking-content">
        <form onSubmit={handleSubmit} className="booking-form">
          <div className="form-group">
            <label htmlFor="carSelect">Select Car:</label>
            <select
              id="carSelect"
              value={selectedCar}
              onChange={(e) => setSelectedCar(e.target.value)}
              required
              disabled={loading || cars.length === 0}
            >
              <option value="">{cars.length === 0 ? 'No cars available' : 'Select a car'}</option>
              {cars.map(car => (
                <option key={car.id} value={car.id}>
                  {car.make} {car.model} - ${car.pricePerDay}/day
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="startDate">Start Date:</label>
            <input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              required
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="endDate">End Date:</label>
            <input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              min={startDate || new Date().toISOString().split('T')[0]}
              required
              disabled={loading}
            />
          </div>

          {/* Cost Calculation Display */}
          {(selectedCar && startDate && endDate) && (
            <div className="cost-summary">
              <h4>Booking Summary</h4>
              <div className="cost-breakdown">
                <div className="cost-item">
                  <span>Daily Rate:</span>
                  <span>${selectedCarDetails?.pricePerDay}/day</span>
                </div>
                <div className="cost-item">
                  <span>Rental Period:</span>
                  <span>{totalDays} days</span>
                </div>
                <div className="cost-item total">
                  <span>Total Cost:</span>
                  <span>${calculatedCost}</span>
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || cars.length === 0 || !selectedCar || !startDate || !endDate}
            className={`btn-book ${loading ? 'loading' : ''}`}
          >
            {loading ? (
              <>
                <div className="spinner-small"></div>
                Booking...
              </>
            ) : (
              'Confirm Booking'
            )}
          </button>
        </form>

        {/* Selected Car Preview */}
        {selectedCarDetails && (
          <div className="car-preview">
            <h3>Selected Car</h3>
            <div className="preview-card">
              {selectedCarDetails.imageUrl ? (
                <img
                  src={`http://localhost:8081${selectedCarDetails.imageUrl}`}
                  alt={`${selectedCarDetails.make} ${selectedCarDetails.model}`}
                  className="preview-image"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                  }}
                />
              ) : (
                <div className="preview-image-placeholder">
                  <span>🚗</span>
                  <p>No Image Available</p>
                </div>
              )}
              <div className="preview-details">
                <h4>{selectedCarDetails.make} {selectedCarDetails.model}</h4>
                <p className="car-type">{selectedCarDetails.type}</p>
                <p className="car-price">${selectedCarDetails.pricePerDay}/day</p>
                <div className={`availability-badge ${selectedCarDetails.available ? 'available' : 'unavailable'}`}>
                  {selectedCarDetails.available ? 'Available' : 'Not Available'}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;