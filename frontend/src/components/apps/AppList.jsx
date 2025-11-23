
import React, { useState, useEffect } from 'react';
import { appsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AppList = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    loadApps();
  }, []);

  const loadApps = async () => {
    try {
      const response = await appsAPI.getAll();
      setApps(response.data.data);
    } catch (err) {
      setError('Failed to load apps');
      console.error('Error loading apps:', err);
    } finally {
      setLoading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    return platform === 'ios' ? '📱' : '🤖';
  };

  if (loading) return <div className="loading">Loading apps...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app-list-container">
      <h2>Welcome back, {user?.name}!</h2>
      <p>Available Apps</p>
      
      <div className="apps-grid">
        {apps.map((app) => (
          <div key={app.id} className="app-card">
            <div className="app-icon">
              {getPlatformIcon(app.platform)}
            </div>
            <div className="app-info">
              <h3>{app.name}</h3>
              <p className="app-platform">
                {app.platform.toUpperCase()} • v{app.version}
              </p>
              <p className="app-description">
                {app.description || 'No description available'}
              </p>
              <button className="download-btn">
                Download
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppList;
