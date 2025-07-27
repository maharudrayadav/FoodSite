import React, { createContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const [name, setName] = useState(localStorage.getItem('name'));

  const login = (newToken, newRole, newUserId, newName) => {
    setToken(newToken);
    setRole(newRole);
    setUserId(newUserId);
    setName(newName);

    localStorage.setItem('token', newToken);
    localStorage.setItem('role', newRole);
    localStorage.setItem('userId', newUserId);
    localStorage.setItem('name', newName);
  };

  const logout = () => {
    setToken(null);
    setRole(null);
    setUserId(null);
    setName(null);
    localStorage.clear();
  };

  return (
    <AuthContext.Provider value={{ token, role, userId, name, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
