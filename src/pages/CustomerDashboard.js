// src/pages/CustomerDashboard.js
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './CustomerDashboard.css';

const CustomerDashboard = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [customerIdInput, setCustomerIdInput] = useState('');
  const [showInputForm, setShowInputForm] = useState(true);
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchOrders = async (customerId) => {
    if (!customerId) {
      setError("Please enter a valid customer ID");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const apiUrl = `https://foodwebsite-4tj7.onrender.com/api/orders/customer/${customerId}`;
      console.log('Fetching orders with customer ID:', customerId);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${context.token}`
        }
      });
      
      console.log('API Response Status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to fetch orders (Status ${response.status})`);
      }
      
      const data = await response.json();
      console.log('API Response Data:', data);
      setOrders(data);
      setShowInputForm(false);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(error.message || 'Failed to load orders. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrders(customerIdInput);
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const response = await fetch(
        `https://foodwebsite-4tj7.onrender.com/api/orders/${orderId}/cancel`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${context.token}`
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel order');
      }

      // Update local state
      setOrders(orders.map(order => 
        order.orderId === orderId 
          ? { ...order, status: 'CANCELLED', cancellable: false } 
          : order
      ));
      
      alert('Order cancelled successfully!');
    } catch (error) {
      console.error('Error cancelling order:', error);
      alert(error.message || 'Failed to cancel order. Please try again.');
    }
  };

  const formatStatus = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (showInputForm) {
    return (
      <div className="customer-dashboard">
        <h2>View Your Orders</h2>
        <div className="customer-id-form">
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="customerId">Enter Customer ID:</label>
              <input
                type="text"
                id="customerId"
                value={customerIdInput}
                onChange={(e) => setCustomerIdInput(e.target.value)}
                placeholder="e.g. 2"
                required
              />
            </div>
            <button type="submit" className="btn primary-btn">
              View Orders
            </button>
          </form>
          
          {error && (
            <div className="error-message">
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="customer-dashboard">
        <h2>Your Orders</h2>
        <div className="error-message">
          <p>{error}</p>
          <div className="action-buttons">
            <button 
              className="btn primary-btn"
              onClick={() => setShowInputForm(true)}
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="customer-dashboard">
      <div className="dashboard-header">
        <h2>Your Orders</h2>
        <button 
          className="btn secondary-btn"
          onClick={() => setShowInputForm(true)}
        >
          Change Customer ID
        </button>
      </div>
      
      {orders.length === 0 ? (
        <div className="no-orders">
          <p>No orders found for this customer ID.</p>
          <button 
            className="btn primary-btn"
            onClick={() => setShowInputForm(true)}
          >
            Try Another ID
          </button>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.orderId} className="order-card">
              <div className="order-header">
                <h3>Order #{order.orderId}</h3>
                <span className={`status-badge ${order.status.toLowerCase()}`}>
                  {formatStatus(order.status)}
                </span>
              </div>
              
              <div className="order-details">
                <p><strong>Restaurant:</strong> {order.restaurantName}</p>
                <p><strong>Placed at:</strong> {new Date(order.orderTime).toLocaleString()}</p>
                <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                <p><strong>Delivery Address:</strong> {order.deliveryAddress || 'Not specified'}</p>
                
                {order.cancellationDeadline && order.status === 'PLACED' && (
                  <p>
                    <strong>Cancellation Deadline:</strong> 
                    {new Date(order.cancellationDeadline).toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                  </p>
                )}
              </div>
              
              {order.cancellable && order.status === 'PLACED' && (
                <button 
                  className="cancel-btn"
                  onClick={() => cancelOrder(order.orderId)}
                >
                  Cancel Order
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomerDashboard;