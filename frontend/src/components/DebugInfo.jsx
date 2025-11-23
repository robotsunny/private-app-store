import React from 'react';
import { useAuth } from '../context/AuthContext';

const DebugInfo = () => {
  const { user } = useAuth();
  
  return (
    <div style={{
      background: '#ffeb3b', 
      padding: '10px', 
      margin: '10px',
      border: '2px solid #ff9800',
      borderRadius: '5px',
      fontSize: '14px'
    }}>
      <h4>🔍 DEBUG INFO:</h4>
      <p><strong>User State:</strong> {JSON.stringify(user)}</p>
      <p><strong>Token in Storage:</strong> {localStorage.getItem('token') ? 'YES' : 'NO'}</p>
      <p><strong>Current Time:</strong> {new Date().toLocaleTimeString()}</p>
    </div>
  );
};

export default DebugInfo;
