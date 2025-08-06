import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './AdminCategories.css';

const AdminCategories = () => {
  const { token, logout, categories, setCategories } = useContext(AuthContext);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    file: null
  });
  const [previewUrl, setPreviewUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setFormData({...formData, file});
    
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const formPayload = new FormData();
      formPayload.append('name', formData.name);
      formPayload.append('file', formData.file);
      formPayload.append('width', '40');
      formPayload.append('height', '40');
      
      const response = await axios.post('/api/categories', formPayload, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setCategories([...categories, response.data]);
      setFormData({ name: '', file: null });
      setPreviewUrl('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add category');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      try {
        await axios.delete(`https://foodwebsite-4tj7.onrender.com/api/categories/${categoryId}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setCategories(categories.filter(cat => cat._id !== categoryId));
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to delete category');
      }
    }
  };

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Category Management</h1>
        <button onClick={() => logout()} className="logout-btn">Logout</button>
      </div>

      <div className="admin-content">
        <div className="category-form">
          <h2>Add New Category</h2>
          {error && <div className="error-message">{error}</div>}
          
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Category Image (150×150px)</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
              />
              {previewUrl && (
                <div className="image-preview">
                  <img src={previewUrl} alt="Preview" />
                </div>
              )}
            </div>
            
            <button type="submit" disabled={loading}>
              {loading ? 'Uploading...' : 'Add Category'}
            </button>
          </form>
        </div>

        <div className="categories-list">
          <h2>Existing Categories</h2>
          {categories.length === 0 ? (
            <p>No categories found</p>
          ) : (
            <div className="category-grid">
              {categories.map(category => (
                <div key={category._id} className="category-card">
                  <img src={category.imageId} alt={category.name} />
                  <h3>{category.name}</h3>
                  <button 
                    onClick={() => handleDelete(category._id)}
                    className="delete-btn"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;