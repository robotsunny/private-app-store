
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    console.log('Logout button clicked');
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="container">
        <h1>Private App Store</h1>
        <nav>
          {user ? (
            <div className="user-menu">
              <span>Welcome, {user.name}</span>
              <button onClick={handleLogout} className="logout-btn">
                Logout
              </button>
            </div>
          ) : (
            <div className="auth-links">
              <a href="/login">Login</a>
              <a href="/register">Register</a>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
