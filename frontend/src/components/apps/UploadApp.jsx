
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { uploadsAPI } from '../../services/api';

const UploadApp = ({ onUploadSuccess }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    version: '1.0.0',
    platform: 'android',
    bundleId: '',
    minOsVersion: '',
    appFile: null
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Auto-detect platform based on file extension
      const fileName = file.name.toLowerCase();
      let platform = formData.platform;
      
      if (fileName.endsWith('.apk')) {
        platform = 'android';
      } else if (fileName.endsWith('.ipa')) {
        platform = 'ios';
      }

      setFormData(prev => ({
        ...prev,
        appFile: file,
        platform: platform
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    setError('');
    setSuccess('');
    setProgress(0);

    // Basic validation
    if (!formData.appFile) {
      setError('Please select an app file');
      setUploading(false);
      return;
    }

    if (!formData.name || !formData.bundleId) {
      setError('App name and bundle ID are required');
      setUploading(false);
      return;
    }

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('appFile', formData.appFile);
      uploadFormData.append('name', formData.name);
      uploadFormData.append('description', formData.description);
      uploadFormData.append('version', formData.version);
      uploadFormData.append('platform', formData.platform);
      uploadFormData.append('bundleId', formData.bundleId);
      uploadFormData.append('minOsVersion', formData.minOsVersion || (formData.platform === 'ios' ? '14.0' : '8.0'));

      console.log('📤 Starting upload...');
      console.log('Token in localStorage:', localStorage.getItem('token'));
      console.log('FormData entries:');
      for (let pair of uploadFormData.entries()) {
        console.log(pair[0] + ': ', pair[1]);
      }

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await uploadsAPI.uploadApp(uploadFormData);
      
      clearInterval(progressInterval);
      setProgress(100);
      
      console.log('✅ Upload successful:', response.data);
      
      setSuccess('App uploaded successfully!');
      setFormData({
        name: '',
        description: '',
        version: '1.0.0',
        platform: 'android',
        bundleId: '',
        minOsVersion: '',
        appFile: null
      });

      // Clear file input
      document.getElementById('appFile').value = '';

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess(response.data.data);
      }

      // Reset form after success
      setTimeout(() => {
        setSuccess('');
        setProgress(0);
      }, 3000);

    } catch (error) {
      console.error('❌ Upload error:', error);
      console.error('Error response:', error.response);
      setError(error.response?.data?.message || 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  const getPlatformIcon = (platform) => {
    return platform === 'ios' ? '📱' : '🤖';
  };

  return (
    <div className="upload-container">
      <h2>Upload New App</h2>
      <p>Logged in as: {user?.email}</p>
      
      <form onSubmit={handleSubmit} className="upload-form">
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
        
        {success && (
          <div className="success-message">
            {success}
          </div>
        )}

        {/* File Upload */}
        <div className="form-group">
          <label>App File (.apk or .ipa):</label>
          <input
            type="file"
            id="appFile"
            onChange={handleFileChange}
            accept=".apk,.ipa"
            required
            disabled={uploading}
          />
          {formData.appFile && (
            <div className="file-info">
              <strong>Selected:</strong> {formData.appFile.name} 
              <span className="platform-badge">
                {getPlatformIcon(formData.platform)} {formData.platform.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        {/* App Details */}
        <div className="form-group">
          <label>App Name:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="My Awesome App"
            required
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label>Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your app..."
            rows="3"
            disabled={uploading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Version:</label>
            <input
              type="text"
              name="version"
              value={formData.version}
              onChange={handleInputChange}
              placeholder="1.0.0"
              required
              disabled={uploading}
            />
          </div>

          <div className="form-group">
            <label>Platform:</label>
            <select
              name="platform"
              value={formData.platform}
              onChange={handleInputChange}
              disabled={uploading}
            >
              <option value="android">Android</option>
              <option value="ios">iOS</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>
            {formData.platform === 'ios' ? 'Bundle ID:' : 'Package Name:'}
          </label>
          <input
            type="text"
            name="bundleId"
            value={formData.bundleId}
            onChange={handleInputChange}
            placeholder={formData.platform === 'ios' ? 'com.company.appname' : 'com.company.appname'}
            required
            disabled={uploading}
          />
        </div>

        <div className="form-group">
          <label>Minimum OS Version:</label>
          <input
            type="text"
            name="minOsVersion"
            value={formData.minOsVersion}
            onChange={handleInputChange}
            placeholder={formData.platform === 'ios' ? '14.0' : '8.0'}
            disabled={uploading}
          />
        </div>

        {/* Progress Bar */}
        {uploading && (
          <div className="progress-container">
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="progress-text">{progress}%</div>
          </div>
        )}

        <button 
          type="submit" 
          disabled={uploading}
          className="upload-btn"
        >
          {uploading ? 'Uploading...' : 'Upload App'}
        </button>
      </form>
    </div>
  );
};

export default UploadApp;

