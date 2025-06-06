import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

/**
 * Updates the current user's profile information.
 * @param {FormData} formData The form data containing profile fields and potentially a profilePicture file.
 * @param {string} token The authentication token for the user.
 * @returns {Promise<object>} The updated user profile data.
 */
export const updateUserProfileAPI = async (formData, token) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/users/me/profile`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error updating user profile:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to update profile');
  }
};

/**
 * Gets the current user's profile information.
 * This might be redundant if AuthContext already fetches and provides this, 
 * but can be useful for explicit re-fetching.
 * @param {string} token The authentication token.
 * @returns {Promise<object>} The user profile data.
 */
export const getCurrentUserProfileAPI = async (token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/me`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching user profile:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch profile');
  }
};

/**
 * Searches for users based on query and type (name/rollNumber).
 * @param {object} params - The search parameters.
 * @param {string} params.query - The search query.
 * @param {string} params.type - The search type ('name' or 'rollNumber').
 * @param {string} token - The authentication token.
 * @returns {Promise<Array<object>>} A list of user objects.
 */
export const searchUsersAPI = async ({ query, type }, token) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/search`, {
      params: { query, type },
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error searching users:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to search users');
  }
};

// Function to get suggested users
export const getSuggestedUsersAPI = async (token) => {
  if (!token) {
    throw new Error('Authentication token not found.');
  }
  try {
    const response = await fetch('/api/users/suggested', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || `Error fetching suggested users: ${response.statusText}`);
    }
    return data;
  } catch (error) {
    console.error('Error in getSuggestedUsersAPI:', error);
    throw error; // Re-throw to be caught by the calling component
  }
}; 