import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './RestaurantDashboard.css';

const RestaurantDashboard = () => {
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [menuItem, setMenuItem] = useState({
    name: '',
    description: '',
    price: '',
    file: null
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showIdPopup, setShowIdPopup] = useState(true);
  const [restaurantId, setRestaurantId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch restaurant details when ID is submitted
  const fetchRestaurant = async () => {
    try {
      setLoading(true);
      setErrorMessage('');
      
      const response = await fetch(`https://foodwebsite-4tj7.onrender.com/api/restaurants/${restaurantId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to load restaurant: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Normalize API response to consistent naming
      const normalizedData = {
        ...data,
        categoryId: data.category_id || data.categoryId,
        imageUrl: data.imageId || data.image_url || data.imageUrl
      };

      if (!normalizedData || !normalizedData.name) {
        throw new Error('Invalid restaurant data received from server');
      }
      
      setRestaurant(normalizedData);
      setShowIdPopup(false);
    } catch (error) {
      console.error('Restaurant fetch error:', error);
      setErrorMessage(error.message || 'Failed to load restaurant data. Please check the ID and try again.');
      setShowIdPopup(true);
    } finally {
      setLoading(false);
    }
  };

  const handleIdSubmit = (e) => {
    e.preventDefault();
    if (!restaurantId.trim()) {
      setErrorMessage('Please enter a valid restaurant ID');
      return;
    }
    fetchRestaurant();
  };

  const handleAddMenuItem = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setIsSubmitting(true);
    
    // Validate required fields with better checks
    if (!menuItem.name.trim() || menuItem.price === '' || !menuItem.file) {
      setErrorMessage('Please fill all required fields (Name, Price, and Image)');
      setIsSubmitting(false);
      return;
    }

    // Validate price format
    const priceValue = parseFloat(menuItem.price);
    if (priceValue <= 0) {
      setErrorMessage('Price must be greater than 0');
      setIsSubmitting(false);
      return;
    }

    if (!restaurant || !restaurant.categoryId) {
      setErrorMessage('Restaurant information is incomplete. Please reload the page.');
      setIsSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', menuItem.name.trim());
      formData.append('description', menuItem.description.trim());
      formData.append('price', priceValue.toString());
      formData.append('restaurantId', restaurantId);
      formData.append('categoryId', restaurant.categoryId);
      formData.append('file', menuItem.file);

      // Log form data for debugging
      console.log('Form data entries:');
      for (const [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch('https://foodwebsite-4tj7.onrender.com/api/menu-items', {
        method: 'POST',
        body: formData
      });

      const responseText = await response.text();
      console.log('API response:', responseText);
      
      if (!response.ok) {
        throw new Error(`Server error: ${response.status} - ${responseText}`);
      }

      // Try to parse JSON if possible
      try {
        const data = JSON.parse(responseText);
        setSuccessMessage(data.message || 'Menu item added successfully!');
      } catch {
        setSuccessMessage('Menu item added successfully!');
      }

      // Reset form
      setMenuItem({ name: '', description: '', price: '', file: null });
      const fileInput = document.getElementById('fileInput');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Menu item submission error:', error);
      setErrorMessage(error.message || 'Failed to add menu item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e) => {
    setErrorMessage(''); // Clear previous errors
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validate file type only (removed size validation)
      if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
        setErrorMessage('Please select a valid image file (JPEG or PNG)');
        e.target.value = ''; // Reset file input
        return;
      }
      
      // REMOVED FILE SIZE VALIDATION - API ACCEPTS UP TO 100MB
      setMenuItem({...menuItem, file});
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMenuItem({...menuItem, [name]: value});
  };

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading restaurant data...</p>
      </div>
    );
  }

  if (showIdPopup) {
    return (
      <div className="popup-overlay">
        <div className="id-popup">
          <div className="popup-header">
            <h2>Enter Restaurant ID</h2>
            <p>Please provide your restaurant ID to access the dashboard</p>
          </div>
          
          {errorMessage && <div className="error-message">{errorMessage}</div>}
          
          <form onSubmit={handleIdSubmit} className="id-form">
            <div className="form-group">
              <label>Restaurant ID *</label>
              <input
                type="text"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                required
                placeholder="Enter restaurant ID"
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn cancel-btn"
                onClick={() => navigate('/')}
              >
                Cancel
              </button>
              <button type="submit" className="btn submit-btn">
                Continue
              </button>
            </div>
          </form>
          
          <div className="api-info">
            <p>API Endpoint: <code>https://foodwebsite-4tj7.onrender.com/api/restaurants/ID</code></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="restaurant-dashboard">
      <div className="dashboard-header">
        <h1>{restaurant?.name || 'Restaurant'} Dashboard</h1>
        <p>Manage your restaurant menu and profile</p>
      </div>

      {restaurant && (
        <>
          <div className="restaurant-info-compact">
            <div className="restaurant-image">
              <img 
                src={restaurant.imageUrl} 
                alt={restaurant.name}
                width={100}
                height={100}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/100?text=Image+Missing';
                }}
              />
            </div>
            <div className="restaurant-details">
              <h3>{restaurant.name}</h3>
              <p className="restaurant-id">ID: {restaurant.id || restaurantId}</p>
              <p>{restaurant.physicalAddress}</p>
              <p>{restaurant.phone} | {restaurant.email}</p>
            </div>
          </div>

          <div className="add-menu-section">
            <h2>Add New Menu Item</h2>
            {successMessage && <div className="success-message">{successMessage}</div>}
            {errorMessage && <div className="error-message">{errorMessage}</div>}
            
            <form onSubmit={handleAddMenuItem} className="menu-form" noValidate>
              <div className="form-group">
                <label>Item Name *</label>
                <input
                  type="text"
                  name="name"
                  value={menuItem.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter item name"
                  maxLength={100}
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={menuItem.description}
                  onChange={handleInputChange}
                  placeholder="Enter item description"
                  maxLength={255}
                />
              </div>
              
              <div className="form-group">
                <label>Price ($) *</label>
                <input
                  type="number"
                  name="price"
                  value={menuItem.price}
                  onChange={handleInputChange}
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="Enter price"
                />
              </div>
              
              <div className="form-group">
                <label>Item Image (Required) *</label>
                <input
                  id="fileInput"
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  accept="image/jpeg, image/png"
                  required
                />
                {/* Updated file hint without size restriction */}
                <p className="file-hint">JPG/PNG (100x100px recommended)</p>
              </div>
              
              <button 
                type="submit" 
                className="btn add-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="spinner mini-spinner"></span>
                    Adding...
                  </>
                ) : (
                  "Add Menu Item"
                )}
              </button>
            </form>
          </div>

          <div className="api-info">
            <p>Menu Item API: <code>POST https://foodwebsite-4tj7.onrender.com/api/menu-items</code></p>
            <p>Parameters: name, description, price, restaurantId, categoryId, file</p>
          </div>
        </>
      )}
    </div>
  );
};

export default RestaurantDashboard;