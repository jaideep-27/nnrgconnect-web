import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api'; // Adjust if your API URL is different

/**
 * Analyzes the uploaded resume PDF.
 * @param {FormData} formData The form data containing the resume file.
 * @param {string} token The authentication token for the user.
 * @returns {Promise<object>} The analysis suggestions.
 */
export const analyzeResumeAPI = async (formData, token) => {
  try {
    const response = await axios.post(`${API_URL}/career/analyze-resume`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing resume:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to analyze resume');
  }
};

/**
 * Fetches career tips based on user interests and profile.
 * @param {object} payload The data containing interests, currentRole, and experienceLevel.
 *   - interests: {string[]} - Array of user interests.
 *   - currentRole: {string} (optional) - User's current role.
 *   - experienceLevel: {string} (optional) - User's experience level.
 * @param {string} token The authentication token for the user.
 * @returns {Promise<object>} The career tips.
 */
export const getCareerTipsAPI = async (payload, token) => {
  try {
    const response = await axios.post(`${API_URL}/career/get-tips`, payload, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching career tips:', error.response ? error.response.data : error.message);
    throw error.response ? error.response.data : new Error('Failed to fetch career tips');
  }
}; 