// // src/pages/CarDetail.jsx
// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate, Link } from 'react-router-dom';
// import { toast } from 'react-toastify';
// import axios from 'axios';

// const CarDetail = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const [car, setCar] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState('');

//   useEffect(() => {
//     const fetchCar = async () => {
//       try {
//         setLoading(true);
//         const response = await axios.get(`http://localhost:8081/api/cars/${id}`);
//         setCar(response.data.data);
//         setError('');
//       } catch (err) {
//         console.error('Error fetching car:', err);
//         setError('Car not found or failed to load car details');
//         toast.error('Failed to load car details');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (id) {
//       fetchCar();
//     }
//   }, [id]);

//   const handleBookNow = () => {
//     navigate('/booking', { state: { selectedCar: car } });
//   };

//   if (loading) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="flex justify-center items-center h-64">
//           <div className="text-xl">Loading car details...</div>
//         </div>
//       </div>
//     );
//   }

//   if (error || !car) {
//     return (
//       <div className="container mx-auto px-4 py-8">
//         <div className="text-center">
//           <h1 className="text-2xl font-bold text-red-600 mb-4">Car Not Found</h1>
//           <p className="text-gray-600 mb-4">The car you're looking for doesn't exist or has been removed.</p>
//           <Link to="/cars" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700">
//             Back to Cars
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8">
//       {/* Breadcrumb */}
//       <nav className="mb-6">
//         <Link to="/cars" className="text-blue-600 hover:text-blue-800">
//           ← Back to Cars
//         </Link>
//       </nav>

//       <div className="bg-white rounded-lg shadow-lg overflow-hidden">
//         <div className="md:flex">
//           {/* Car Image */}
//           <div className="md:w-1/2">
//             {car.imageUrl ? (
//               <img
//                 src={`http://localhost:8080${car.imageUrl}`}
//                 alt={`${car.make} ${car.model}`}
//                 className="w-full h-64 md:h-full object-cover"
//                 onError={(e) => {
//                   e.target.src = 'https://via.placeholder.com/400x300?text=No+Image+Available';
//                 }}
//               />
//             ) : (
//               <div className="w-full h-64 md:h-full bg-gray-200 flex items-center justify-center">
//                 <span className="text-gray-500">No Image Available</span>
//               </div>
//             )}
//           </div>

//           {/* Car Details */}
//           <div className="md:w-1/2 p-6">
//             <h1 className="text-3xl font-bold text-gray-900 mb-2">
//               {car.make} {car.model}
//             </h1>
            
//             <div className="mb-4">
//               <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
//                 car.available 
//                   ? 'bg-green-100 text-green-800' 
//                   : 'bg-red-100 text-red-800'
//               }`}>
//                 {car.available ? 'Available' : 'Not Available'}
//               </span>
//             </div>

//             <div className="space-y-3 mb-6">
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Type:</span>
//                 <span className="font-semibold capitalize">{car.type}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Price per day:</span>
//                 <span className="font-semibold text-2xl text-green-600">
//                   ${car.pricePerDay}
//                 </span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Make:</span>
//                 <span className="font-semibold">{car.make}</span>
//               </div>
              
//               <div className="flex justify-between">
//                 <span className="text-gray-600">Model:</span>
//                 <span className="font-semibold">{car.model}</span>
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="space-y-3">
//               <button
//                 onClick={handleBookNow}
//                 disabled={!car.available}
//                 className={`w-full py-3 px-4 rounded-lg font-semibold ${
//                   car.available
//                     ? 'bg-blue-600 text-white hover:bg-blue-700'
//                     : 'bg-gray-400 text-gray-200 cursor-not-allowed'
//                 }`}
//               >
//                 {car.available ? 'Book Now' : 'Not Available'}
//               </button>
              
//               <Link
//                 to="/cars"
//                 className="block w-full text-center py-2 px-4 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
//               >
//                 View Other Cars
//               </Link>
//             </div>
//           </div>
//         </div>

//         {/* Additional Information */}
//         <div className="p-6 border-t border-gray-200">
//           <h2 className="text-xl font-semibold mb-4">Car Information</h2>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <div>
//               <h3 className="font-semibold text-gray-700">Features</h3>
//               <ul className="mt-2 space-y-1 text-gray-600">
//                 <li>• Air Conditioning</li>
//                 <li>• Automatic Transmission</li>
//                 <li>• Bluetooth Connectivity</li>
//                 <li>• GPS Navigation</li>
//               </ul>
//             </div>
//             <div>
//               <h3 className="font-semibold text-gray-700">Requirements</h3>
//               <ul className="mt-2 space-y-1 text-gray-600">
//                 <li>• Valid Driver's License</li>
//                 <li>• Credit Card for Security Deposit</li>
//                 <li>• Minimum Age: 21 years</li>
//               </ul>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default CarDetail;
// src/pages/CarDetail.jsx
// src/pages/CarDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import './CarDetail.css';

const CarDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Add timeout to prevent hanging requests
        const response = await axios.get(`http://localhost:8081/api/cars/${id}`, {
          timeout: 10000, // 10 second timeout
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (response.data && response.data.data) {
          setCar(response.data.data);
          toast.success('Car details loaded successfully!');
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (err) {
        console.error('Error fetching car:', err);
        
        let errorMessage = 'Failed to load car details';
        
        if (err.code === 'ECONNREFUSED') {
          errorMessage = 'Cannot connect to server. Please make sure the backend is running on port 8081.';
        } else if (err.code === 'NETWORK_ERROR') {
          errorMessage = 'Network error. Please check your internet connection.';
        } else if (err.code === 'TIMEOUT') {
          errorMessage = 'Request timeout. Server is taking too long to respond.';
        } else if (err.response?.status === 404) {
          errorMessage = 'Car not found. It may have been removed.';
        } else if (err.response?.status === 500) {
          errorMessage = 'Server error. Please try again later.';
        }
        
        setError(errorMessage);
        toast.error(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchCar();
    }
  }, [id, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  const handleBookNow = () => {
    if (car && car.available) {
      navigate('/booking', { state: { selectedCar: car } });
    } else {
      toast.error('This car is currently not available for booking');
    }
  };

  // Enhanced loading component with progress
  if (loading) {
    return (
      <div className="car-detail-loading">
        <div className="car-detail-loading-content">
          <div className="car-detail-loading-spinner">
            <div className="car-detail-loading-spinner-inner"></div>
            <div className="car-detail-loading-pulse"></div>
          </div>
          <p className="car-detail-loading-text">Loading Car Details</p>
          <p className="car-detail-loading-subtext">
            Fetching information for car #{id}...
          </p>
          <div className="car-detail-loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    );
  }

  // Enhanced error component with retry option
  if (error || !car) {
    return (
      <div className="car-detail-error">
        <div className="car-detail-error-content">
          <div className="car-detail-error-emoji">⚠️</div>
          <h1 className="car-detail-error-title">Unable to Load Car</h1>
          <p className="car-detail-error-message">{error}</p>
          
          <div className="car-detail-error-actions">
            <button 
              onClick={handleRetry}
              className="car-detail-retry-btn"
            >
              🔄 Try Again
            </button>
            <Link to="/cars" className="car-detail-back-link">
              ← Back to All Cars
            </Link>
          </div>
          
          <div className="car-detail-error-tips">
            <h3>Quick Tips:</h3>
            <ul>
              <li>Ensure backend server is running on port 8081</li>
              <li>Check if the car ID exists in the database</li>
              <li>Verify your internet connection</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="car-detail-container">
      <div className="max-w-6xl mx-auto px-4">
        {/* Rest of your car detail JSX remains the same */}
        <nav className="mb-8">
          <Link to="/cars" className="car-detail-back-link">
            ← Back to Cars
          </Link>
        </nav>

        <div className="car-detail-card">
          {/* ... your existing car detail content ... */}
          <div className="car-detail-image-container">
            {car.imageUrl ? (
              <img
                src={`http://localhost:8080${car.imageUrl}`}
                alt={`${car.make} ${car.model}`}
                className="car-detail-image"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1170&q=80';
                }}
              />
            ) : (
              <div className="car-detail-image-placeholder">
                <span>No Image Available</span>
              </div>
            )}
            <div className={`car-detail-availability-badge ${
              car.available ? 'car-detail-available' : 'car-detail-unavailable'
            }`}>
              {car.available ? 'Available' : 'Not Available'}
            </div>
          </div>

          <div className="car-detail-content">
            <div className="space-y-6">
              <div>
                <h1 className="car-detail-title">
                  {car.make} {car.model}
                </h1>
                <p className="car-detail-subtitle">{car.type}</p>
              </div>

              <div className="car-detail-price-container">
                <div className="car-detail-price">
                  ${car.pricePerDay}
                  <span className="car-detail-price-period">/ day</span>
                </div>
                <p className="car-detail-price-note">All inclusive pricing</p>
              </div>

              <div className="car-detail-features-grid">
                <div className="car-detail-feature-card">
                  <div className="car-detail-feature-emoji">🚗</div>
                  <p className="car-detail-feature-text">{car.type}</p>
                </div>
                <div className="car-detail-feature-card">
                  <div className="car-detail-feature-emoji">⛽</div>
                  <p className="car-detail-feature-text">Fuel Efficient</p>
                </div>
                <div className="car-detail-feature-card">
                  <div className="car-detail-feature-emoji">🎵</div>
                  <p className="car-detail-feature-text">Premium Sound</p>
                </div>
                <div className="car-detail-feature-card">
                  <div className="car-detail-feature-emoji">🛡️</div>
                  <p className="car-detail-feature-text">Full Insurance</p>
                </div>
              </div>

              <div className="car-detail-actions">
                <button
                  onClick={handleBookNow}
                  disabled={!car.available}
                  className="car-detail-book-btn"
                >
                  {car.available ? 'Book This Car' : 'Not Available'}
                </button>
                
                <Link to="/cars" className="car-detail-back-btn">
                  View Other Cars
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="car-detail-info-section">
          <h2 className="car-detail-info-title">Car Details</h2>
          <div className="car-detail-info-grid">
            <div>
              <h3 className="car-detail-info-list-title">Features</h3>
              <ul className="car-detail-info-list">
                <li className="car-detail-info-item">
                  <span className="car-detail-info-bullet"></span>
                  Air Conditioning
                </li>
                <li className="car-detail-info-item">
                  <span className="car-detail-info-bullet"></span>
                  Bluetooth
                </li>
                <li className="car-detail-info-item">
                  <span className="car-detail-info-bullet"></span>
                  GPS Navigation
                </li>
                <li className="car-detail-info-item">
                  <span className="car-detail-info-bullet"></span>
                  Automatic Transmission
                </li>
              </ul>
            </div>

            <div>
              <h3 className="car-detail-info-list-title">Specifications</h3>
              <div className="car-detail-info-list">
                <div className="car-detail-spec-item">
                  <span>Make:</span>
                  <span className="car-detail-spec-value">{car.make}</span>
                </div>
                <div className="car-detail-spec-item">
                  <span>Model:</span>
                  <span className="car-detail-spec-value">{car.model}</span>
                </div>
                <div className="car-detail-spec-item">
                  <span>Type:</span>
                  <span className="car-detail-spec-value">{car.type}</span>
                </div>
                <div className="car-detail-spec-item">
                  <span>Seats:</span>
                  <span className="car-detail-spec-value">5</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="car-detail-info-list-title">Requirements</h3>
              <ul className="car-detail-info-list">
                <li className="car-detail-info-item">
                  <span className="car-detail-info-check">✓</span>
                  Valid Driver's License
                </li>
                <li className="car-detail-info-item">
                  <span className="car-detail-info-check">✓</span>
                  Credit Card Required
                </li>
                <li className="car-detail-info-item">
                  <span className="car-detail-info-check">✓</span>
                  Minimum Age: 21
                </li>
                <li className="car-detail-info-item">
                  <span className="car-detail-info-check">✓</span>
                  24/7 Support
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarDetail;