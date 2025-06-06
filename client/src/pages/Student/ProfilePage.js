import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { updateUserProfileAPI } from '../../services/userService'; // Import the new service
import { getMyConnectionsAPI } from '../../services/connectionService'; // Import connection service
import './ProfilePage.css';

// Placeholder for a generic User icon if no profile picture is available
const DefaultUserIcon = () => (
  <svg className="profile-default-icon" viewBox="0 0 24 24">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const ProfilePage = () => {
  const { currentUser, loading: authLoading, logout, token, setCurrentUser } = useAuth();
  const navigate = useNavigate();

  // Form state
  const [profilePictureFile, setProfilePictureFile] = useState(null);
  const [profilePicturePreview, setProfilePicturePreview] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [emailDisplay, setEmailDisplay] = useState(true);
  const [contactDisplay, setContactDisplay] = useState(true);

  // Update operation state
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');

  // Connections state
  const [connectionsList, setConnectionsList] = useState([]);
  const [connectionsLoading, setConnectionsLoading] = useState(false);
  const [connectionsError, setConnectionsError] = useState('');

  useEffect(() => {
    if (currentUser) {
      setLinkedin(currentUser.linkedinProfileUrl || '');
      setEmailDisplay(currentUser.displayEmail !== undefined ? currentUser.displayEmail : true);
      setContactDisplay(currentUser.displayContactNumber !== undefined ? currentUser.displayContactNumber : true);
      
      // Robust URL construction for profile picture
      if (currentUser.profilePictureUrl) {
        const baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5001';
        // Ensure no double slashes and path starts with a slash if not already
        const picturePath = currentUser.profilePictureUrl.startsWith('/') ? currentUser.profilePictureUrl : `/${currentUser.profilePictureUrl}`;
        setProfilePicturePreview(`${baseUrl}${picturePath}`);
      } else {
        setProfilePicturePreview('');
      }
    }
  }, [currentUser]);

  // Effect to fetch connections
  useEffect(() => {
    const fetchConnections = async () => {
      if (token && currentUser) { // Ensure token and user are available
        setConnectionsLoading(true);
        setConnectionsError('');
        try {
          const connections = await getMyConnectionsAPI(token);
          console.log('Fetched Connections Data:', connections);
          setConnectionsList(connections || []); // Ensure it's an array
        } catch (error) {
          setConnectionsError(error.message || 'Failed to load connections.');
          console.error("Failed to fetch connections:", error);
        } finally {
          setConnectionsLoading(false);
        }
      }
    };
    fetchConnections();
  }, [token, currentUser]); // Re-fetch if token or currentUser changes

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfilePictureFile(file);
      setProfilePicturePreview(URL.createObjectURL(file));
      setUpdateSuccess(''); // Clear previous success message
      setUpdateError('');
    }
  };

  const handleProfileUpdate = async (event) => {
    event.preventDefault();
    if (!token) {
      setUpdateError('Authentication error. Please log in again.');
      return;
    }

    setUpdateLoading(true);
    setUpdateError('');
    setUpdateSuccess('');

    const formData = new FormData();
    if (profilePictureFile) {
      formData.append('profilePicture', profilePictureFile);
    }
    formData.append('linkedinProfileUrl', linkedin);
    formData.append('displayEmail', emailDisplay);
    formData.append('displayContactNumber', contactDisplay);

    try {
      const updatedUserData = await updateUserProfileAPI(formData, token);
      setCurrentUser(updatedUserData); // Update global user state
      setUpdateSuccess('Profile updated successfully!');
      setProfilePictureFile(null); // Clear file input after successful upload
       // Preview will be updated by useEffect based on new currentUser.profilePictureUrl
    } catch (error) {
      setUpdateError(error.message || 'Failed to update profile. Please try again.');
    } finally {
      setUpdateLoading(false);
    }
  };
  
  const handleLogout = () => {
    logout();
    navigate('/signin', { replace: true });
  };

  if (authLoading) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  if (!currentUser) {
    return <div className="profile-error">Could not load user profile. You might not be logged in.</div>;
  }

  return (
    <div className="profile-container">
      <h2 className="profile-header">My Profile</h2>
      
      <form onSubmit={handleProfileUpdate} className="profile-edit-form">
        <div className="profile-picture-section">
          <label htmlFor="profilePictureInput" className="profile-picture-label">
            {profilePicturePreview ? (
              <img src={profilePicturePreview} alt="Profile Preview" className="profile-picture-img" />
            ) : (
              <DefaultUserIcon />
            )}
            <span>Change Photo</span>
          </label>
          <input 
            type="file" 
            id="profilePictureInput"
            accept="image/*" 
            onChange={handleFileChange}
            style={{ display: 'none' }} 
          />
        </div>

        <div className="form-group">
          <label htmlFor="linkedin">LinkedIn Profile URL:</label>
          <input 
            type="url" 
            id="linkedin" 
            value={linkedin} 
            onChange={(e) => setLinkedin(e.target.value)} 
            placeholder="https://linkedin.com/in/yourprofile"
          />
        </div>

        <div className="form-group-inline">
          <label htmlFor="emailDisplay">Display Email to Others:</label>
          <input 
            type="checkbox" 
            id="emailDisplay" 
            checked={emailDisplay} 
            onChange={(e) => setEmailDisplay(e.target.checked)} 
          />
        </div>

        <div className="form-group-inline">
          <label htmlFor="contactDisplay">Display Contact Number to Others:</label>
          <input 
            type="checkbox" 
            id="contactDisplay" 
            checked={contactDisplay} 
            onChange={(e) => setContactDisplay(e.target.checked)} 
          />
        </div>
        
        {updateError && <p className="error-message update-error">{updateError}</p>}
        {updateSuccess && <p className="success-message update-success">{updateSuccess}</p>}

        <button type="submit" className="profile-save-button" disabled={updateLoading}>
          {updateLoading ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="profile-card">
        <div className="profile-info-grid">
          <div className="profile-info-item">
            <strong>Full Name:</strong> <span>{currentUser.fullName}</span>
          </div>
          <div className="profile-info-item">
            <strong>Email:</strong> <span>{currentUser.email} {currentUser.displayEmail === false && "(Hidden from others)"}</span>
          </div>
          <div className="profile-info-item">
            <strong>Phone Number:</strong> <span>{currentUser.phoneNumber} {currentUser.displayContactNumber === false && "(Hidden from others)"}</span>
          </div>
          <div className="profile-info-item">
            <strong>Roll Number:</strong> <span>{currentUser.rollNumber}</span>
          </div>
        </div>
        {/* Connections Section */}
        <div className="connections-section">
          <h3 className="connections-header">Your Connections</h3>
          {connectionsLoading && <p>Loading connections...</p>}
          {connectionsError && <p className="error-message">{connectionsError}</p>}
          {!connectionsLoading && !connectionsError && connectionsList.length === 0 && (
            <p>You haven't made any connections yet.</p>
          )}
          {!connectionsLoading && !connectionsError && connectionsList.length > 0 && (
            <ul className="connections-list">
              {connectionsList.map(connection => {
                const connectedUser = connection.user;
                
                if (!connectedUser) {
                  console.warn('Skipping rendering of a connection due to missing user data:', connection);
                  return null;
                }

                return (
                  <li key={connectedUser._id} className="connection-item">
                    <span className="connection-name">
                      {connectedUser.fullName || 'Name not available'}
                    </span>
                    {/* Display Roll Number if available */}
                    {connectedUser.rollNumber && (
                      <span className="connection-rollno">
                        Roll No: {connectedUser.rollNumber}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button onClick={handleLogout} className="profile-logout-button">
          Logout
        </button>
      </div>
    </div>
  );
};

export default ProfilePage; 