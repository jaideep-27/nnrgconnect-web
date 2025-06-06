import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './PendingRequestsPage.css'; // CSS for styling

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const PendingRequestsPage = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState(''); // For errors specific to approve/reject actions
  const [actionSuccess, setActionSuccess] = useState(''); // For success messages from actions

  const fetchPendingUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get(`${API_BASE_URL}/admin/pending-requests`);
      setPendingUsers(response.data);
    } catch (err) {
      console.error('Error fetching pending users:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending sign-up requests.');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchPendingUsers();
  }, [fetchPendingUsers]);

  const handleAction = async (userId, actionType) => {
    setActionError('');
    setActionSuccess('');
    setLoading(true); // Use general loading or a specific one for the item
    try {
      const response = await axios.put(`${API_BASE_URL}/admin/${actionType}/${userId}`);
      setActionSuccess(response.data.message || `User ${actionType}d successfully.`);
      // Refresh list
      fetchPendingUsers(); 
    } catch (err) {
      console.error(`Error ${actionType}ing user:`, err);
      setActionError(err.response?.data?.message || `Failed to ${actionType} user.`);
      setLoading(false); // Ensure loading is false if action fails and list isn't re-fetched in that path
    }
    // setLoading(false) will be called by fetchPendingUsers if successful
  };

  if (loading && pendingUsers.length === 0) {
    return <div className="pending-requests-loading">Loading pending requests...</div>;
  }

  if (error) {
    return <div className="pending-requests-error">Error: {error}</div>;
  }

  return (
    <div className="pending-requests-container">
      <h2 className="pending-requests-header">Pending Sign-Up Approvals</h2>
      
      {actionError && <p className="pending-requests-error">{actionError}</p>}
      {actionSuccess && <p className="auth-message auth-success">{actionSuccess}</p>}

      {pendingUsers.length === 0 && !loading && (
        <p className="pending-requests-empty">No pending sign-up requests at the moment.</p>
      )}

      {pendingUsers.length > 0 && (
        <div className="pending-requests-table-wrapper">
          <table className="pending-requests-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Roll Number</th>
                <th>Phone</th>
                <th>ID Card</th>
                <th>Submitted</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(user => (
                <tr key={user._id}>
                  <td>{user.fullName}</td>
                  <td>{user.email}</td>
                  <td>{user.rollNumber}</td>
                  <td>{user.phoneNumber}</td>
                  <td>
                    {user.collegeIdCardImage ? (
                      <a 
                        href={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.collegeIdCardImage}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        <img src={`${process.env.REACT_APP_API_URL || 'http://localhost:5001'}${user.collegeIdCardImage}`} alt="ID Card" className="id-card-image-thumbnail" />
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleAction(user._id, 'approve')} 
                      className="btn btn-primary action-button" 
                      disabled={loading}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleAction(user._id, 'reject')} 
                      className="btn btn-danger action-button" 
                      disabled={loading}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingRequestsPage; 