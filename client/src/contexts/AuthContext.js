import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios'; // We'll use axios for API calls

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

// Define the base URL for your API. Adjust if your server runs elsewhere.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('userToken')); // Persist token
  const [loading, setLoading] = useState(true); // For initial auth check
  const [isAdmin, setIsAdmin] = useState(false);

  // Configure axios to include the token in headers for all requests
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('userToken', token);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('userToken');
    }
  }, [token]);

  // Effect to load user on initial app load if token exists
  useEffect(() => {
    const verifyUser = async () => {
      if (token) {
        try {
          // You might want to have a dedicated /me endpoint that verifies token and returns user
          // For now, we assume token presence means user *might* be valid, actual check on protected routes
          // Or, better, call a /api/users/me endpoint here
          const response = await axios.get(`${API_BASE_URL}/users/me`);
          setCurrentUser(response.data);
          setIsAdmin(response.data.isAdmin || false);
        } catch (error) {
          console.error('Failed to verify token or fetch user', error);
          setToken(null); // Invalid token, clear it
          setCurrentUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };
    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signin`, { email, password });
      const { token: userToken, user } = response.data;
      setToken(userToken);
      setCurrentUser(user);
      setIsAdmin(user.isAdmin || false);
      setLoading(false);
      // On success, return a success object
      return { success: true, user };
    } catch (error) {
      setLoading(false);
      const errorMessage = (error.response && error.response.data && error.response.data.message)
        ? error.response.data.message
        : 'An unknown error occurred during login.';
      console.error('Login failed:', errorMessage);
      // On failure, return a failure object with the message
      return { success: false, message: errorMessage };
    }
  };

  const signup = async (formDataObject) => {
    // formDataObject should be a FormData instance for multipart/form-data
    setLoading(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/signup`, formDataObject, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setLoading(false);
      return response.data; // Return success message or data
    } catch (error) {
      setLoading(false);
      // Construct a new error with the specific message from the backend
      const errorMessage = (error.response && error.response.data && error.response.data.message)
        ? error.response.data.message
        : 'An unknown error occurred during signup.';
      console.error('Signup failed:', errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setToken(null);
    setIsAdmin(false);
    // No need to call backend for logout if using JWT, just clear client-side token
  };

  const value = {
    currentUser,
    token,
    isAdmin,
    loading,
    login,
    signup,
    logout,
    isAuthenticated: !!currentUser, // Derived state: true if currentUser is not null
    setCurrentUser, // Expose setCurrentUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Render children only after initial loading check */}
    </AuthContext.Provider>
  );
}; 