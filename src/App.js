import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import RestaurantSignup from './pages/RestaurantSignup';
import RestaurantDashboard from './pages/RestaurantDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminCategoryManagement from './pages/AdminCategoryManagement';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AuthContext from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import './App.css';
import CategoryPage from './pages/CategoryPage';
import CartPage from './pages/CartPage';
import RestaurantPage from './pages/RestaurantPage'; 
import CheckoutPage from './pages/CheckoutPage';

// Set base URL for API
axios.defaults.baseURL = 'https://foodwebsite-4tj7.onrender.com';

function App() {
  const [auth, setAuth] = useState({
    token: localStorage.getItem('token'),
    role: localStorage.getItem('role'),
    userId: localStorage.getItem('userId'),
    name: localStorage.getItem('name'),
    initialized: false
  });

  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const response = await axios.get('/api/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          login(token, response.data.role, response.data.userId, response.data.name);
        } catch (error) {
          logout();
        }
      }
      setAuth(prev => ({ ...prev, initialized: true }));
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const categoriesRes = await axios.get('/api/categories');
        setCategories(categoriesRes.data);
        
        const restaurantsRes = await axios.get('/api/restaurants/all');
        setRestaurants(restaurantsRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const login = (token, role, userId, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('name', name);
    setAuth({ token, role, userId, name, initialized: true });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setAuth({ token: null, role: null, userId: null, name: null, initialized: true });
  };

  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, error => Promise.reject(error));

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
    };
  }, []);

  if (!auth.initialized) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Initializing application...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ 
      ...auth, 
      login, 
      logout,
      categories,
      restaurants,
      setCategories,
      setRestaurants
    }}>
      <CartProvider>
        <Router>
          <div className="app">
            <Navbar />
            <div className="content">
              {loading ? (
                <div className="loading-screen">
                  <div className="spinner"></div>
                  <p>Loading delicious food...</p>
                </div>
              ) : (
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/restaurant/signup" element={<RestaurantSignup />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/restaurant/:restaurantId" element={<RestaurantPage />} />
                  
                  {/* Add Checkout Page Route */}
                  <Route 
                    path="/checkout" 
                    element={
                      auth.token && auth.role === 'customer' ? 
                      <CheckoutPage /> : 
                      <Navigate to="/login" state={{ from: '/checkout' }} replace />
                    } 
                  />
                  
                  <Route 
                    path="/customer/dashboard" 
                    element={
                      auth.token && auth.role === 'customer' ? 
                      <CustomerDashboard /> : 
                      <Navigate to="/login" state={{ from: '/customer/dashboard' }} replace />
                    } 
                  />
                  <Route 
                    path="/restaurant/dashboard" 
                    element={
                      auth.token && auth.role === 'restaurant' ? 
                      <RestaurantDashboard /> : 
                      <Navigate to="/login" state={{ from: '/restaurant/dashboard' }} replace />
                    } 
                  />
                  <Route 
                    path="/admin/categories" 
                    element={
                      auth.token && auth.role === 'admin' ? 
                      <AdminCategoryManagement /> : 
                      <Navigate to="/login" state={{ from: '/admin/categories' }} replace />
                    } 
                  />
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              )}
            </div>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthContext.Provider>
  );
}

export default App;