import React, { useState } from 'react';
// import { Link } from 'react-router-dom'; // Link might not be needed if card is not clickable to full profile
import { useAuth } from '../../contexts/AuthContext';
import { createConnectionAPI } from '../../services/connectionService';
import './UserCard.css';

// Placeholder for a generic User icon (can be shared or moved to a common place)
const DefaultUserIcon = () => (
  <svg className="user-card-default-icon" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const UserCard = ({ user, isInitiallyConnected }) => {
  const { token, currentUser } = useAuth();
  const [isConnected, setIsConnected] = useState(isInitiallyConnected);
  const [connectionLoading, setConnectionLoading] = useState(false);
  const [connectionError, setConnectionError] = useState('');

  const handleConnect = async () => {
    if (!user || !user._id || !token) {
      setConnectionError('User data or authentication token is missing.');
      return;
    }
    if (currentUser && currentUser._id === user._id) {
      setConnectionError("Cannot connect with yourself.");
      return;
    }

    setConnectionLoading(true);
    setConnectionError('');
    try {
      await createConnectionAPI(user._id, token);
      setIsConnected(true);
    } catch (err) {
      setConnectionError(err.message || 'Failed to connect.');
      // If connection already exists (409), UI should reflect it from initial check or update here
      if (err.message && err.message.toLowerCase().includes('already exists')) {
        setIsConnected(true);
      }
    } finally {
      setConnectionLoading(false);
    }
  };

  if (!user) return null;

  const profilePictureUrl = user.profilePictureUrl
    ? `${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.profilePictureUrl}`
    : null;

  // Do not show connect button for the current user's own card (if it could appear in a list)
  const isOwnProfile = currentUser && currentUser._id === user._id;

  return (
    <div className="user-card">
      <div className="user-card-header">
        {profilePictureUrl ? (
          <img src={profilePictureUrl} alt={`${user.fullName}'s profile`} className="user-card-avatar" />
        ) : (
          <DefaultUserIcon />
        )}
        <div className="user-card-name-roll">
          <h3 className="user-card-name">{user.fullName}</h3>
          {user.rollNumber && <p className="user-card-roll">Roll: {user.rollNumber}</p>}
        </div>
      </div>
      <div className="user-card-info">
        {user.branch && (
          <div className="user-card-info-item">
            <span className="info-item-label">Branch:</span>
            <span className="info-item-value">{user.branch}</span>
          </div>
        )}
        {user.academicYear && (
          <div className="user-card-info-item">
            <span className="info-item-label">Year:</span>
            <span className="info-item-value">{user.academicYear}</span>
          </div>
        )}
      </div>
      <div className="user-card-body">
        {user.linkedinProfileUrl && (
          <p className="user-card-linkedin">
            <a href={user.linkedinProfileUrl} target="_blank" rel="noopener noreferrer">
              LinkedIn Profile
            </a>
          </p>
        )}
        {user.email && (
          <p className="user-card-email">Email: {user.email}</p>
        )}
        {user.phoneNumber && (
          <p className="user-card-phone">Phone: {user.phoneNumber}</p>
        )}
        {!user.email && !user.phoneNumber && !user.linkedinProfileUrl && (
          <p className="user-card-no-contact">Contact information hidden or not provided.</p>
        )}
      </div>
      {!isOwnProfile && (
        <div className="user-card-footer">
          {isConnected ? (
            <button className="connect-button connected" disabled>Connected</button>
          ) : (
            <button
              onClick={handleConnect}
              className="connect-button"
              disabled={connectionLoading}
            >
              {connectionLoading ? 'Connecting...' : 'Connect'}
            </button>
          )}
          {connectionError && <p className="connection-error-message">{connectionError}</p>}
        </div>
      )}
    </div>
  );
};

export default UserCard; 