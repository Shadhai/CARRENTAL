// src/pages/Home.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { carAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const [featuredCars, setFeaturedCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    fetchFeaturedCars();
  }, []);

  const fetchFeaturedCars = async () => {
    try {
      const response = await carAPI.getAllCars();
      if (response.data && Array.isArray(response.data)) {
        setFeaturedCars(response.data.slice(0, 6));
      } else if (response.data && response.data.data) {
        setFeaturedCars(response.data.data.slice(0, 6));
      } else {
        setError('Unexpected response format');
      }
    } catch (err) {
      setError('Failed to load featured cars');
      console.error('Error fetching cars:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Welcome to CarRental</h1>
              <p className="hero-description">
                Discover the perfect car for your journey. Choose from our wide selection of 
                premium vehicles at competitive prices.
              </p>
              <div className="hero-buttons">
                <Link to="/cars" className="btn btn-primary">
                  Browse All Cars
                </Link>
                {!isAuthenticated && (
                  <Link to="/signup" className="btn btn-secondary">
                    Get Started
                  </Link>
                )}
              </div>
            </div>
            <div className="hero-image">
              <div className="image-placeholder">
                <span>🚗 Premium Cars</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose CarRental?</h2>
            <p>We offer the best car rental experience</p>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🚗</div>
              <h3>Wide Selection</h3>
              <p>Choose from economy cars to luxury vehicles for every need and budget.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Best Prices</h3>
              <p>Competitive pricing with no hidden fees. Price match guarantee.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📞</div>
              <h3>24/7 Support</h3>
              <p>Round-the-clock customer support to assist you anytime, anywhere.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Cars Section */}
      <section className="featured-cars-section">
        <div className="container">
          <div className="section-header">
            <div className="section-title-row">
              <div>
                <h2>Featured Cars</h2>
                <p>Most popular choices among our customers</p>
              </div>
              <Link to="/cars" className="btn btn-outline">
                View All Cars
              </Link>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Loading cars...</p>
            </div>
          ) : (
            <div className="cars-grid">
              {featuredCars.length > 0 ? (
                featuredCars.map((car) => (
                  <div key={car.id} className="car-card">
                    <div className="car-image">
                      <img 
                        src={car.imageUrl || "/default-car.jpg"} 
                        alt={`${car.brand || car.make} ${car.model}`}
                        onError={(e) => {
                          e.target.src = "https://www.bing.com/images/search?view=detailV2&ccid=MNRIqm6B&id=2E9F69DA80BE1D105D9555563C272028D45FCB06&thid=OIP.MNRIqm6B4kkJcOph38V5lgHaE6&mediaurl=https%3a%2f%2fcdni.autocarindia.com%2fExtraImages%2f20240517123310_Branded+Content+Camry+Web.003.jpeg&exph=795&expw=1200&q=toyota+camry&FORM=IRPRST&ck=0A699CCA511F402E3699B1C1B9578FFF&selectedIndex=1&itb=0";
                        }}
                      />
                    </div>
                    <div className="car-content">
                      <h3>{car.brand || car.make} {car.model}</h3>
                      <p className="car-details">{car.type} • {car.fuelType} • {car.seats} Seats</p>
                      <div className="car-features">
                        <span>⚙️ {car.transmission}</span>
                        {car.hasAC && <span>❄️ AC</span>}
                      </div>
                      <div className="car-footer">
                        <span className="car-price">${car.pricePerDay}/day</span>
                        <Link to={`/cars/${car.id}`} className="btn btn-primary btn-small">
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-cars">
                  <p>No cars available at the moment.</p>
                  <Link to="/cars" className="btn btn-primary">
                    Browse Cars
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">
            <h2>Ready to Start Your Journey?</h2>
            <p>Book your perfect car today and enjoy the ride</p>
            <div className="cta-buttons">
              {!isAuthenticated ? (
                <>
                  <Link to="/signup" className="btn btn-light">
                    Sign Up Now
                  </Link>
                  <Link to="/login" className="btn btn-outline-light">
                    Login
                  </Link>
                </>
              ) : (
                <Link to="/cars" className="btn btn-light">
                  Book a Car
                </Link>
              )}
              <Link to="/cars" className="btn btn-outline-light">
                Browse Cars
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}