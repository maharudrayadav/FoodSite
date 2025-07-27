import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './Login.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'customer'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Admin login (local check only)
      if (formData.role === 'admin') {
        if (formData.email === 'admin@12' && formData.password === 'admin123') {
          login('admin-token', 'admin', 'admin-id', 'Admin');
          navigate('/admin/categories');
          return;
        } else {
          setError('Invalid admin credentials');
          return;
        }
      }

      // API call for customer or restaurant
      let endpoint;
      if (formData.role === 'customer') {
        endpoint = '/api/customers/login';
      } else {
        endpoint = '/api/restaurants/login';
      }

      const response = await axios.post(endpoint, {
        email: formData.email,
        password: formData.password
      });

      const { token, userId, name } = response.data;
      
      login(token, formData.role, userId, name);
      
      // Redirect based on role
      if (formData.role === 'customer') {
        navigate('/customer/dashboard');
      } else if (formData.role === 'restaurant') {
        navigate('/restaurant/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>Login to FoodExpress</h2>
            <p>Access your account to order food or manage your restaurant</p>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Select Account Type</label>
              <select 
                name="role" 
                value={formData.role} 
                onChange={handleChange}
                className="form-control"
              >
                <option value="customer">Customer</option>
                <option value="restaurant">Restaurant Owner</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                placeholder="your@email.com"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                placeholder="Enter your password"
                required
              />
            </div>
            
            <button 
              type="submit" 
              className="btn login-btn"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Login to Account'}
            </button>
            
            {formData.role !== 'admin' && (
              <div className="login-footer">
                <p>Don't have an account? 
                  {formData.role === 'customer' ? (
                    <Link to="/signup"> Create Customer Account</Link>
                  ) : (
                    <Link to="/restaurant/signup"> Register Your Restaurant</Link>
                  )}
                </p>
              </div>
            )}
          </form>
        </div>
        
        <div className="login-image">
          <div className="image-overlay">
            <h3>Delicious Food Awaits</h3>
            <p>Login to explore hundreds of restaurants and cuisines</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
