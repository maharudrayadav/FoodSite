// src/pages/AdminCategoryManagement.js
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './AdminCategoryManagement.css';

const AdminCategoryManagement = () => {
  const { token, logout, categories, setCategories } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData(prev => ({ ...prev, file }));
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccessMessage('');
    
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('file', formData.file);
      formPayload.append('width', '150');
      formPayload.append('height', '150');
      
      const response = await axios.post('/api/categories', formPayload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setSuccessMessage(`Category "${formData.name}" added successfully!`);
      setCategories([...categories, response.data]);
      
      // Reset form
      setFormData({ name: '', file: null });
      setPreviewUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`/api/categories/${categoryId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setCategories(categories.filter(cat => cat.categoryId !== categoryId));
        setSuccessMessage('Category deleted successfully!');
      } catch (err) {
        setError('Failed to delete category');
      }
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Admin Dashboard</h1>
        <p>Manage food categories and platform settings</p>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="admin-content">
        <div className="category-form-section">
          <div className="form-card">
            <h2>Add New Category</h2>
            
            {error && <div className="error-message">{error}</div>}
            {successMessage && <div className="success-message">{successMessage}</div>}
            
            <form onSubmit={handleSubmit} className="category-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Indian Cuisine"
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Category Image * (150x150px)</label>
                <div className="file-upload">
                  <label className="upload-btn">
                    {formData.file ? formData.file.name : 'Select an image file'}
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleFileChange} 
                      required
                      hidden
                    />
                  </label>
                </div>
              </div>
              
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Category preview" />
                </div>
              )}
              
              <button 
                type="submit" 
                className="submit-btn"
                disabled={uploading}
              >
                {uploading ? 'Adding Category...' : 'Add Category'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="categories-list-section">
          <h2>Existing Categories</h2>
          <div className="categories-grid">
            {categories.map(category => (
              <div key={category.categoryId} className="category-card">
                <div className="category-image">
                  <img src={category.imageId} alt={category.name} />
                </div>
                <div className="category-info">
                  <h3>{category.name}</h3>
                  <p>ID: {category.categoryId}</p>
                  <div className="category-actions">
                    <button 
                      className="delete-btn"
                      onClick={() => handleDelete(category.categoryId)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategoryManagement;