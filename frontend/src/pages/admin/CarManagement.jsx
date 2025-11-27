// src/pages/admin/CarManagement.jsx
import React, { useState, useEffect } from 'react';
import { carAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const CarManagement = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCar, setEditingCar] = useState(null);
  const [formData, setFormData] = useState({
    brand: '',
    model: '',
    year: '',
    pricePerDay: '',
    color: '',
    available: true,
    features: '',
    imageUrl: ''
  });

  const { user } = useAuth();

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      setLoading(true);
      const response = await carAPI.getAllCars();
      setCars(response.data || []);
    } catch (error) {
      console.error('Error fetching cars:', error);
      toast.error('Failed to fetch cars');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const carData = {
        ...formData,
        year: parseInt(formData.year),
        pricePerDay: parseFloat(formData.pricePerDay),
        features: formData.features.split(',').map(f => f.trim()).filter(f => f)
      };

      if (editingCar) {
        await carAPI.updateCar(editingCar.id, carData);
        toast.success('Car updated successfully!');
      } else {
        await carAPI.createCar(carData);
        toast.success('Car created successfully!');
      }

      setShowModal(false);
      setEditingCar(null);
      setFormData({
        brand: '',
        model: '',
        year: '',
        pricePerDay: '',
        color: '',
        available: true,
        features: '',
        imageUrl: ''
      });
      fetchCars();
    } catch (error) {
      console.error('Error saving car:', error);
      toast.error(error.response?.data?.message || 'Failed to save car');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (car) => {
    setEditingCar(car);
    setFormData({
      brand: car.brand || car.make || '',
      model: car.model || '',
      year: car.year || '',
      pricePerDay: car.pricePerDay || car.price || '',
      color: car.color || '',
      available: car.available !== false,
      features: Array.isArray(car.features) ? car.features.join(', ') : '',
      imageUrl: car.imageUrl || car.images?.[0] || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (carId) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await carAPI.deleteCar(carId);
        toast.success('Car deleted successfully!');
        fetchCars();
      } catch (error) {
        console.error('Error deleting car:', error);
        toast.error('Failed to delete car');
      }
    }
  };

  const handleToggleAvailability = async (car) => {
    try {
      await carAPI.updateCar(car.id, {
        ...car,
        available: !car.available
      });
      toast.success(`Car ${!car.available ? 'marked as available' : 'marked as unavailable'}`);
      fetchCars();
    } catch (error) {
      console.error('Error updating car availability:', error);
      toast.error('Failed to update availability');
    }
  };

  const resetForm = () => {
    setEditingCar(null);
    setFormData({
      brand: '',
      model: '',
      year: '',
      pricePerDay: '',
      color: '',
      available: true,
      features: '',
      imageUrl: ''
    });
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h2>Car Management</h2>
        <button 
          className="btn-primary"
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
        >
          Add New Car
        </button>
      </div>

      {loading && !cars.length ? (
        <div className="loading">Loading cars...</div>
      ) : (
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
                        onClick={() => handleEdit(car)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`btn-warning btn-sm ${car.available ? 'make-unavailable' : 'make-available'}`}
                        onClick={() => handleToggleAvailability(car)}
                      >
                        {car.available ? 'Make Unavailable' : 'Make Available'}
                      </button>
                      <button 
                        className="btn-danger btn-sm"
                        onClick={() => handleDelete(car.id)}
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
            <h3>{editingCar ? 'Edit Car' : 'Add New Car'}</h3>
            <form onSubmit={handleSubmit}>
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
                <div className="form-group">
                  <label>Image URL</label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleInputChange}
                    placeholder="https://example.com/car-image.jpg"
                  />
                </div>
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
                  {loading ? 'Saving...' : (editingCar ? 'Update Car' : 'Add Car')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CarManagement;