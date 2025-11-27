// import React, { useState, useEffect } from 'react';
// import { Link } from 'react-router-dom';
// import { carAPI } from '../services/api';
// import { useAuth } from '../context/AuthContext';

// const CarList = () => {
//   const [cars, setCars] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterType, setFilterType] = useState('');
//   const { isAuthenticated } = useAuth();

//   useEffect(() => {
//     fetchCars();
//   }, []);

//   const fetchCars = async () => {
//     try {
//       const response = await carAPI.getAllCars();
//       if (response.data && Array.isArray(response.data)) {
//         setCars(response.data);
//       } else if (response.data && response.data.data) {
//         setCars(response.data.data);
//       } else {
//         setError('Unexpected response format');
//       }
//     } catch (error) {
//       setError('Failed to fetch cars');
//       console.error('Error fetching cars:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredCars = cars.filter(car => {
//     const matchesSearch = car.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          car.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          car.make?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesType = !filterType || car.type?.toLowerCase() === filterType.toLowerCase();
//     return matchesSearch && matchesType;
//   });

//   const carTypes = [...new Set(cars.map(car => car.type).filter(Boolean))];

//   if (loading) return (
//     <div className="loading-container">
//       <div className="spinner"></div>
//       <p>Loading cars...</p>
//     </div>
//   );

//   if (error) return (
//     <div className="error-container">
//       <div className="error-message">{error}</div>
//       <button onClick={fetchCars} className="btn-retry">Retry</button>
//     </div>
//   );

//   return (
//     <div className="car-list-page">
//       <div className="container">
//         <div className="page-header">
//           <h1>Available Cars</h1>
//           <p>Choose from our wide selection of vehicles</p>
//         </div>

//         {/* Search and Filter */}
//         <div className="search-filter">
//           <div className="search-box">
//             <input
//               type="text"
//               placeholder="Search cars..."
//               value={searchTerm}
//               onChange={(e) => setSearchTerm(e.target.value)}
//             />
//             <span>🔍</span>
//           </div>
//           <select 
//             value={filterType} 
//             onChange={(e) => setFilterType(e.target.value)}
//           >
//             <option value="">All Types</option>
//             {carTypes.map(type => (
//               <option key={type} value={type}>{type}</option>
//             ))}
//           </select>
//         </div>

//         {/* Cars Grid */}
//         <div className="cars-grid">
//           {filteredCars.length === 0 ? (
//             <div className="no-results">
//               <p>No cars found matching your criteria.</p>
//               <button 
//                 onClick={() => { setSearchTerm(''); setFilterType(''); }}
//                 className="btn-clear"
//               >
//                 Clear Filters
//               </button>
//             </div>
//           ) : (
//             filteredCars.map(car => (
//               <div key={car.id} className="car-card">
//                 <div className="car-image">
//                   <img 
//                     src={car.imageUrl || "https://via.placeholder.com/300x200/cccccc/666666?text=Car+Image"} 
//                     alt={`${car.brand || car.make} ${car.model}`}
//                   />
//                   {!car.available && <div className="booked-badge">Booked</div>}
//                 </div>
//                 <div className="car-content">
//                   <h3>{car.brand || car.make} {car.model}</h3>
//                   <p className="car-type">{car.type}</p>
//                   <div className="car-details">
//                     <span>⛽ {car.fuelType}</span>
//                     <span>👥 {car.seats} seats</span>
//                     <span>⚙️ {car.transmission}</span>
//                   </div>
//                   <div className="car-price">
//                     <strong>${car.pricePerDay}/day</strong>
//                   </div>
//                   <div className="car-actions">
//                     <Link to={`/cars/${car.id}`} className="btn-details">
//                       View Details
//                     </Link>
//                     {isAuthenticated && car.available && (
//                       <Link to={`/bookings?carId=${car.id}`} className="btn-book">
//                         Book Now
//                       </Link>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CarList;
// src/pages/CarList.jsx// src/pages/CarList.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './CarList.css';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all, available, unavailable
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCars = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await axios.get('http://localhost:8081/api/cars', {
          timeout: 10000,
        });
        
        if (response.data && response.data.data) {
          setCars(response.data.data);
          toast.success(`Loaded ${response.data.data.length} cars successfully!`);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (err) {
        console.error('Error fetching cars:', err);
        let errorMessage = 'Failed to load cars';
        
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please ensure backend is running on port 8081.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Cars endpoint not found';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchCars();
  }, []);

  // Safe filtering function - handles null/undefined values
  const filteredCars = cars.filter(car => {
    // Handle filter
    const matchesFilter = filter === 'all' || 
                         (filter === 'available' && car.available) ||
                         (filter === 'unavailable' && !car.available);
    
    // Handle search - safely check for null/undefined values
    const safeMake = car.make ? car.make.toLowerCase() : '';
    const safeModel = car.model ? car.model.toLowerCase() : '';
    const safeType = car.type ? car.type.toLowerCase() : '';
    const safeSearchTerm = searchTerm.toLowerCase();
    
    const matchesSearch = safeMake.includes(safeSearchTerm) ||
                         safeModel.includes(safeSearchTerm) ||
                         safeType.includes(safeSearchTerm);
    
    return matchesFilter && matchesSearch;
  });

  const handleRetry = () => {
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="car-list-loading">
        <div className="car-list-loading-content">
          <div className="car-list-loading-spinner"></div>
          <p className="car-list-loading-text">Loading Available Cars</p>
          <p className="car-list-loading-subtext">Finding the perfect rides for you...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="car-list-error">
        <div className="car-list-error-content">
          <div className="car-list-error-emoji">🚗</div>
          <h1 className="car-list-error-title">Unable to Load Cars</h1>
          <p className="car-list-error-message">{error}</p>
          
          <div className="car-list-error-actions">
            <button onClick={handleRetry} className="car-list-retry-btn">
              🔄 Try Again
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="car-list-back-btn"
            >
              ↻ Reload Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="car-list-container">
      {/* Header Section */}
      <div className="car-list-header">
        <h1 className="car-list-title">Explore Our Fleet</h1>
        <p className="car-list-subtitle">
          Discover the perfect car for your journey from our premium collection
        </p>
      </div>

      {/* Search and Filter Section */}
      <div className="car-list-controls">
        <div className="car-list-search">
          <input
            type="text"
            placeholder="Search by make, model, or type..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="car-list-search-input"
          />
          <span className="car-list-search-icon">🔍</span>
        </div>

        <div className="car-list-filters">
          <button
            onClick={() => setFilter('all')}
            className={`car-list-filter-btn ${filter === 'all' ? 'active' : ''}`}
          >
            All Cars ({cars.length})
          </button>
          <button
            onClick={() => setFilter('available')}
            className={`car-list-filter-btn ${filter === 'available' ? 'active' : ''}`}
          >
            Available ({cars.filter(c => c.available).length})
          </button>
          <button
            onClick={() => setFilter('unavailable')}
            className={`car-list-filter-btn ${filter === 'unavailable' ? 'active' : ''}`}
          >
            Booked ({cars.filter(c => !c.available).length})
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="car-list-results">
        <p>
          Showing {filteredCars.length} of {cars.length} cars
          {searchTerm && ` for "${searchTerm}"`}
        </p>
      </div>

      {/* Cars Grid */}
      {filteredCars.length === 0 ? (
        <div className="car-list-empty">
          <div className="car-list-empty-emoji">🔍</div>
          <h2 className="car-list-empty-title">No Cars Found</h2>
          <p className="car-list-empty-message">
            {searchTerm 
              ? `No cars found matching "${searchTerm}". Try a different search term.`
              : `No ${filter === 'available' ? 'available' : filter === 'unavailable' ? 'booked' : ''} cars found.`
            }
          </p>
          <button 
            onClick={() => { setSearchTerm(''); setFilter('all'); }}
            className="car-list-empty-btn"
          >
            Show All Cars
          </button>
        </div>
      ) : (
        <div className="car-list-grid">
          {filteredCars.map((car) => (
            <div key={car.id} className="car-list-card">
              {/* Image Section */}
              <div className="car-list-image-container">
                {car.imageUrl ? (
                  <img
                    src={`http://localhost:8081${car.imageUrl}`}
                    alt={`${car.make || 'Car'} ${car.model || ''}`}
                    className="car-list-image"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
                    }}
                  />
                ) : (
                  <div className="car-list-image-placeholder">
                    <span>🚗</span>
                    <p>No Image Available</p>
                  </div>
                )}
                
                {/* Availability Badge */}
                <div className={`car-list-availability-badge ${
                  car.available ? 'available' : 'unavailable'
                }`}>
                  {car.available ? 'Available' : 'Booked'}
                </div>

                {/* Quick Action Overlay */}
                <div className="car-list-card-overlay">
                  <Link 
                    to={`/cars/${car.id}`} 
                    className="car-list-view-details-btn"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              {/* Content Section */}
              <div className="car-list-content">
                <div className="car-list-header-info">
                  <h3 className="car-list-name">
                    {car.make || 'Unknown Make'} {car.model || 'Unknown Model'}
                  </h3>
                  <span className="car-list-type">{car.type || 'Unknown Type'}</span>
                </div>

                <div className="car-list-features">
                  <div className="car-list-feature">
                    <span className="car-list-feature-icon">⛽</span>
                    <span>Fuel Efficient</span>
                  </div>
                  <div className="car-list-feature">
                    <span className="car-list-feature-icon">🎵</span>
                    <span>Premium Sound</span>
                  </div>
                  <div className="car-list-feature">
                    <span className="car-list-feature-icon">🛡️</span>
                    <span>Full Insurance</span>
                  </div>
                </div>

                <div className="car-list-price-section">
                  <div className="car-list-price">
                    <span className="car-list-price-amount">
                      ${car.pricePerDay || '0'}
                    </span>
                    <span className="car-list-price-period">/ day</span>
                  </div>
                  <Link 
                    to={`/cars/${car.id}`} 
                    className="car-list-book-btn"
                  >
                    {car.available ? 'Book Now' : 'View Details'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="car-list-footer">
        <p>Need help choosing? <Link to="/contact" className="car-list-footer-link">Contact our team</Link></p>
      </div>
    </div>
  );
};

export default CarList;