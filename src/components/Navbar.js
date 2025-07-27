// src/components/Navbar.js
import React, { useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import AuthContext from '../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { token, role, name, logout } = useContext(AuthContext);
  const location = useLocation();

  // Hide navbar on auth pages
  if (['/login', '/signup', '/restaurant/signup'].includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="logo">FoodExpress</Link>
        
        <div className="nav-links">
          <Link to="/">Home</Link>
          
          {token ? (
            <>
              {role === 'customer' && <Link to="/customer/dashboard">Dashboard</Link>}
              {role === 'restaurant' && <Link to="/restaurant/dashboard">Dashboard</Link>}
              {role === 'admin' && <Link to="/admin/categories">Admin Panel</Link>}
              
              <div className="user-info">
                <span>Welcome, {name}</span>
                <button onClick={logout} className="logout-btn">Logout</button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/signup" className="signup-btn">Sign Up</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;