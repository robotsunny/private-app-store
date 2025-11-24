
import React, { useState, useEffect } from 'react';
import { appsAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import UploadApp from './UploadApp';

const AppList = () => {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpload, setShowUpload] = useState(false);
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

  const handleUploadSuccess = (newApp) => {
    setApps(prev => [newApp, ...prev]);
    setShowUpload(false);
    loadApps();
  };

  const getPlatformIcon = (platform) => {
    return platform === 'ios' ? '📱' : '🤖';
  };

  const handleDownload = async (app) => {
    try {
      console.log('Downloading:', app.name);
      alert(`Download would start for: ${app.name}\n\nIn a real implementation, this would download the ${app.platform.toUpperCase()} file.`);
    } catch (error) {
      console.error('Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  if (loading) return <div className="loading">Loading apps...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="app-list-container">
      <div className="app-list-header">
        <div>
          <h2>Welcome back, {user?.name}!</h2>
          <p>
            {user?.role === 'admin' ? '👑 Admin Dashboard' : '📱 App Store'}
            {` • Available Apps (${apps.length})`}
          </p>
          {user?.role === 'admin' && (
            <p className="admin-notice">You have administrator privileges</p>
          )}
        </div>
        
        {/* Show upload button ONLY for admins */}
        {user?.role === 'admin' && (
          <button 
            onClick={() => setShowUpload(!showUpload)}
            className="upload-toggle-btn"
          >
            {showUpload ? 'Cancel Upload' : '+ Upload New App'}
          </button>
        )}
      </div>

      {/* Show upload form ONLY for admins */}
      {showUpload && user?.role === 'admin' && (
        <UploadApp onUploadSuccess={handleUploadSuccess} />
      )}

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
                {app.fileSize && <span> • {app.fileSize} MB</span>}
              </p>
              <p className="app-description">
                {app.description || 'No description available'}
              </p>
              <p className="app-bundle">
                <strong>Bundle ID:</strong> {app.bundleId}
              </p>
              <button 
                onClick={() => handleDownload(app)}
                className="download-btn"
              >
                📥 Download {app.platform === 'ios' ? 'IPA' : 'APK'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {apps.length === 0 && (
        <div className="empty-state">
          <h3>No apps available</h3>
          <p>
            {user?.role === 'admin' 
              ? 'Upload the first app to get started!' 
              : 'No apps are currently available. Please check back later.'
            }
          </p>
          {user?.role === 'admin' && (
            <button 
              onClick={() => setShowUpload(true)}
              className="upload-toggle-btn"
            >
              + Upload Your First App
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default AppList;

