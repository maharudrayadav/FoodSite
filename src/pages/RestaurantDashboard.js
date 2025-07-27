import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const { name, restaurants } = useContext(AuthContext);

  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {name}</h1>
        <p>Manage your restaurant profile and menu</p>
      </div>

      <div className="dashboard-content">
        <div className="restaurant-info">
          <h2>Your Restaurant Information</h2>
          {restaurants.length > 0 && (
            <div className="restaurant-card">
              <div className="restaurant-image">
                <img 
                  src={restaurants[0].imageId || 'https://via.placeholder.com/200'} 
                  alt={restaurants[0].name} 
                />
              </div>
              <div className="restaurant-details">
                <h3>{restaurants[0].name}</h3>
                <p>{restaurants[0].description}</p>
                <p><strong>Address:</strong> {restaurants[0].physicalAddress}</p>
                <p><strong>Phone:</strong> {restaurants[0].phone}</p>
                <p><strong>Email:</strong> {restaurants[0].email}</p>
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <Link to="/restaurant/menu" className="action-btn">
            Manage Menu
          </Link>
          <Link to="/restaurant/orders" className="action-btn">
            View Orders
          </Link>
          <Link to="/restaurant/settings" className="action-btn">
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RestaurantDashboard;