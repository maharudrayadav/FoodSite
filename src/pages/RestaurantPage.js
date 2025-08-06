import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import './RestaurantPage.css';

const RestaurantPage = () => {
  const { restaurantId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch restaurant data
        const restaurantRes = await axios.get(`/api/restaurants/${restaurantId}`);
        setRestaurant(restaurantRes.data);
        
        // Fetch menu items
        const menuRes = await axios.get(`/api/menu-items?restaurantId=${restaurantId}`);
        setMenuItems(menuRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [restaurantId]);

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading restaurant menu...</p>
      </div>
    );
  }

  return (
    <div className="restaurant-page">
      {restaurant && (
        <div className="restaurant-header">
          <img 
            src={restaurant.imageId} 
            alt={restaurant.name} 
            className="restaurant-hero-image"
          />
          <div className="restaurant-info">
            <h1>{restaurant.name}</h1>
            <p>{restaurant.description}</p>
            <div className="restaurant-meta">
              <span>📍 {restaurant.physicalAddress}</span>
              <span>📞 {restaurant.phone}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="menu-section">
        <h2>Menu</h2>
        <div className="menu-items-grid">
          {menuItems.map(item => (
            <div key={item.itemId} className="menu-item-card">
              <img 
                src={item.imageId} 
                alt={item.name} 
                className="menu-item-image"
              />
              <div className="menu-item-details">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <p className="price">${item.price.toFixed(2)}</p>
                <div className="item-actions">
                  <button 
                    onClick={() => addToCart(item)}
                    className="btn primary-btn"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RestaurantPage;