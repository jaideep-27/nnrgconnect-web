import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Creates a connection with a target user.
 * @param {string} targetUserId The ID of the user to connect with.
 * @param {string} token The authentication token.
 * @returns {Promise<object>} The new connection object or success message.
 */
export const createConnectionAPI = async (targetUserId, token) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/connections`, 
      { targetUserId }, 
      {
        headers: { 'Authorization': `Bearer ${token}` },
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating connection:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to create connection');
  }
};

/**
 * Fetches the connections for the current logged-in user.
 * @param {string} token The authentication token.
 * @returns {Promise<Array<object>>} A list of connection objects, where each contains the other user's details.
 */
export const getMyConnectionsAPI = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/connections/me`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching connections:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch connections');
  }
};

/**
 * Checks the connection status with a target user.
 * @param {string} targetUserId The ID of the target user.
 * @param {string} token The authentication token.
 * @returns {Promise<object>} An object like { connected: true/false, connectionId?, connectedAt? }.
 */
export const checkConnectionStatusAPI = async (targetUserId, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/connections/status/${targetUserId}`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error checking connection status:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to check connection status');
  }
};

// Function to check connection status for multiple users at once
export const checkBulkConnectionStatusAPI = async (userIds, token) => {
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  if (!userIds || userIds.length === 0) {
    return {}; // Return an empty map if there are no IDs to check
  }
  try {
    const response = await fetch('/api/connections/status/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ userIds }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Error checking bulk status: ${response.statusText}`);
    }
    return data;
  } catch (error) {
    console.error('Error in checkBulkConnectionStatusAPI:', error);
    throw error;
  }
}; 