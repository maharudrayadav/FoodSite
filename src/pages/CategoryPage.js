// src/pages/CategoryPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './CategoryPage.css';

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const context = useContext(AuthContext);
  const token = context?.token;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch(
          `https://foodwebsite-4tj7.onrender.com/api/menu-items?categoryId=${categoryId}`
        );
        const data = await response.json();
        setMenuItems(data);
      } catch (error) {
        console.error('Error fetching menu items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMenuItems();
  }, [categoryId]);

  const handleBuyClick = (item) => {
    if (!token) {
      navigate('/login');
      return;
    }
    
    // Navigate to checkout page with item data
    navigate('/checkout', { state: { item } });
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="category-page">
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
                  onClick={() => handleBuyClick(item)}
                  className="btn primary-btn"
                >
                  Buy Now
                </button>
                <Link 
                  to={`/restaurant/${item.restaurantId}`} 
                  className="btn secondary-btn"
                >
                  View Restaurant
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryPage;