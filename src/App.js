import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
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
import './App.css';
import AdminCategories from './pages/AdminCategories';

// Set base URL for API
axios.defaults.baseURL = 'https://foodwebsite-jtu2.onrender.com';

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
  const [lastRefresh, setLastRefresh] = useState(Date.now());

  // Initialize auth state
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
    
    // Listen for storage events to sync tabs
    const handleStorageChange = (event) => {
      if (event.key === 'token' || event.key === 'role') {
        window.location.reload();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Memoized data fetching functions
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesRes = await axios.get('/api/categories', {
        params: { timestamp: lastRefresh },
        headers: { 'Cache-Control': 'no-cache' }
      });
      setCategories(categoriesRes.data);
      return true;
    } catch (error) {
      console.error('Error fetching categories:', error);
      return false;
    }
  }, [lastRefresh]);

  const fetchRestaurants = useCallback(async () => {
    try {
      const restaurantsRes = await axios.get('/api/restaurants/all', {
        params: { timestamp: lastRefresh },
        headers: { 'Cache-Control': 'no-cache' }
      });
      setRestaurants(restaurantsRes.data);
      return true;
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      return false;
    }
  }, [lastRefresh]);

  // Fetch data on initial load and refresh
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        await Promise.all([fetchCategories(), fetchRestaurants()]);
      } catch (error) {
        if (error.response?.status === 401) {
          logout();
        }
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchCategories, fetchRestaurants]);

  const login = (token, role, userId, name) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', role);
    localStorage.setItem('userId', userId);
    localStorage.setItem('name', name);
    setAuth({ token, role, userId, name, initialized: true });
    refreshData(); // Refresh data on login
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    localStorage.removeItem('name');
    setAuth({ token: null, role: null, userId: null, name: null, initialized: true });
    refreshData(); // Refresh data on logout
  };

  // Refresh function for child components
  const refreshData = () => {
    setLastRefresh(Date.now());
  };

  // Set up axios interceptors
  useEffect(() => {
    const requestInterceptor = axios.interceptors.request.use(config => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      // Add cache-busting parameter to GET requests
      if (config.method === 'get') {
        config.params = {
          ...config.params,
          timestamp: Date.now()
        };
      }
      return config;
    }, error => Promise.reject(error));

    const responseInterceptor = axios.interceptors.response.use(
      response => response,
      error => {
        if (error.response?.status === 401) {
          logout();
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axios.interceptors.request.eject(requestInterceptor);
      axios.interceptors.response.eject(responseInterceptor);
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
      refreshData
    }}>
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
    </AuthContext.Provider>
  );
}

export default App;
