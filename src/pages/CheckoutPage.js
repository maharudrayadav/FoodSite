// src/pages/CheckoutPage.js
import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './CheckoutPage.css';

const CheckoutPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const context = useContext(AuthContext);
  const token = context?.token;
  const userName = context?.name;
  
  // Get selected item from location state
  const selectedItem = location.state?.item;
  
  const [orderDetails, setOrderDetails] = useState({
    name: userName || '',
    phone: '',
    street: '',
    city: '',
    state: '',
    postalCode: ''
  });
  
  const [orderStatus, setOrderStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if no item selected
  useEffect(() => {
    if (!selectedItem) {
      navigate('/');
    }
  }, [selectedItem, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderDetails(prev => ({ ...prev, [name]: value }));
  };

  const placeOrder = async () => {
    if (!selectedItem) return;
    
    setLoading(true);
    try {
      const response = await fetch('https://foodwebsite-4tj7.onrender.com/api/orders/place', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...orderDetails,
          items: [{ menuItemId: selectedItem.itemId, quantity: 1 }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to place order');
      }

      const data = await response.json();
      setOrderStatus({
        success: true,
        orderId: data.orderId,
        customerId: data.customerId,
        cancellationDeadline: data.cancellationDeadline
      });
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate(`/customer-dashboard/${data.customerId}`);
      }, 3000);
      
    } catch (error) {
      setOrderStatus({
        success: false,
        message: error.message || 'Failed to place order'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!selectedItem) {
    return (
      <div className="checkout-page">
        <div className="checkout-content">
          <h2>Item Not Selected</h2>
          <p>Please go back and select an item to checkout.</p>
          <Link to="/" className="btn primary-btn">Back to Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-content">
        <div className="checkout-header">
          <h2>Checkout: {selectedItem.name}</h2>
          <div className="item-preview">
            <img 
              src={selectedItem.imageId} 
              alt={selectedItem.name} 
              className="preview-image"
            />
            <div className="preview-details">
              <p><strong>Price:</strong> ${selectedItem.price.toFixed(2)}</p>
              <p><strong>Description:</strong> {selectedItem.description}</p>
            </div>
          </div>
        </div>
        
        {orderStatus ? (
          orderStatus.success ? (
            <div className="order-success">
              <h3>Order Placed Successfully!</h3>
              <p>Order ID: {orderStatus.orderId}</p>
              <p>Customer ID: {orderStatus.customerId}</p>
              <p>You can cancel until: {new Date(orderStatus.cancellationDeadline).toLocaleTimeString()}</p>
              <p>Redirecting to dashboard...</p>
            </div>
          ) : (
            <div className="order-error">
              <h3>Error: {orderStatus.message}</h3>
              <button 
                className="btn secondary-btn"
                onClick={() => setOrderStatus(null)}
              >
                Try Again
              </button>
            </div>
          )
        ) : (
          <>
            <div className="form-section">
              <h3>Delivery Information</h3>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  name="name"
                  value={orderDetails.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Phone</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={orderDetails.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Street Address</label>
                <input 
                  type="text" 
                  name="street"
                  value={orderDetails.street}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="address-group">
                <div className="form-group city-group">
                  <label>City</label>
                  <input 
                    type="text" 
                    name="city"
                    value={orderDetails.city}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group state-group">
                  <label>State</label>
                  <input 
                    type="text" 
                    name="state"
                    value={orderDetails.state}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="form-group zip-group">
                  <label>Postal Code</label>
                  <input 
                    type="text" 
                    name="postalCode"
                    value={orderDetails.postalCode}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>
            </div>
            
            <div className="checkout-actions">
              <button 
                className="btn primary-btn"
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Confirm Order'}
              </button>
              <Link 
                to={`/category/${selectedItem.categoryId}`} 
                className="btn secondary-btn"
              >
                Cancel
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default CheckoutPage;