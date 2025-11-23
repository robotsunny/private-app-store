
import React, { createContext, useState, useContext, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔧 AuthProvider initialized, token exists:', !!token);
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      console.log('🔄 Login attempt:', email);
      const response = await authAPI.login({ email, password });
      console.log('✅ Login API response:', response.data);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      console.log('✅ User state updated to:', userData);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Login failed' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      console.log('🔄 Registration attempt:', email);
      const response = await authAPI.register({ name, email, password });
      console.log('✅ Registration API response:', response.data);
      
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      setUser(userData);
      console.log('✅ User state updated to:', userData);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    console.log('🔄 Logging out...');
    localStorage.removeItem('token');
    setUser(null);
    console.log('✅ Logout complete');
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
