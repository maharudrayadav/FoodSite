import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import axios from 'axios';
import './RestaurantSignup.css';

const RestaurantSignup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    physicalAddress: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    categoryId: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { categories, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, file }));
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (!formData.file) {
      setError('Please upload a restaurant image');
      return;
    }
    
    setLoading(true);
    
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('description', formData.description);
      formPayload.append('physicalAddress', formData.physicalAddress);
      formPayload.append('phone', formData.phone);
      formPayload.append('email', formData.email);
      formPayload.append('password', formData.password);
      formPayload.append('categoryId', formData.categoryId);
      formPayload.append('file', formData.file);
      formPayload.append('width', '70');
      formPayload.append('height', '70');
      
      const response = await axios.post('/api/restaurants/signup', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { token, userId, name } = response.data;
      
      login(token, 'restaurant', userId, name);
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/restaurant/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="restaurant-signup-page">
      <div className="restaurant-signup-container">
        <div className="restaurant-signup-card">
          <div className="restaurant-signup-header">
            <h2>Register Your Restaurant</h2>
            <p>Join our platform to reach thousands of hungry customers</p>
          </div>
          
          {success ? (
            <div className="success-message">
              <h3>Registration Successful!</h3>
              <p>Your restaurant has been registered successfully. Redirecting to your dashboard...</p>
            </div>
          ) : (
            <>
              {error && <div className="error-message">{error}</div>}
              
              <form onSubmit={handleSubmit} className="restaurant-signup-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Restaurant Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Gourmet Paradise"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Category *</label>
                    <select 
                      name="categoryId" 
                      value={formData.categoryId} 
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category.categoryId} value={category.categoryId}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe your restaurant..."
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Physical Address *</label>
                  <input
                    type="text"
                    name="physicalAddress"
                    value={formData.physicalAddress}
                    onChange={handleChange}
                    placeholder="123 Main Street"
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Phone Number *</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="1234567890"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Email Address *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="restaurant@email.com"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Password *</label>
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label>Confirm Password *</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Confirm password"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Restaurant Image * (200x200px)</label>
                  <div className="image-upload-section">
                    <div className="file-upload">
                      <label className="upload-btn">
                        {formData.file ? formData.file.name : 'Choose image file'}
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileChange} 
                          required
                          hidden
                        />
                      </label>
                    </div>
                    
                    {previewUrl && (
                      <div className="image-preview">
                        <img src={previewUrl} alt="Restaurant preview" />
                      </div>
                    )}
                  </div>
                </div>
                
                <button 
                  type="submit" 
                  className="btn signup-btn"
                  disabled={loading}
                >
                  {loading ? 'Registering Restaurant...' : 'Register Restaurant'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RestaurantSignup;