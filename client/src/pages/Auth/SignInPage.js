import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import './AuthPages.css'; // Shared styles for auth pages
import logo from '../../assets/logo.png'; // Import the logo
import LoadingSpinner from '../../components/LoadingSpinner';

const SignInPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth(); // Use login from AuthContext
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 5000); // Clear error after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear messages when user starts typing
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleCloseError = () => setError('');
  const handleCloseSuccess = () => setSuccess('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    // Basic validation
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields.');
      return;
    }

    // Email format validation
    if (!formData.email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    
    setLoading(true);
    setAttempts(prev => prev + 1);
    
    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        setSuccess('Sign in successful! Redirecting...');
        // Clear any previous errors
        setError('');
        // Reset attempts on successful login
        setAttempts(0);
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/');
        }, 1000);
      } else {
        // Handle specific error cases
        let errorMessage = result.message;
        
        if (result.message.includes('Password incorrect')) {
          errorMessage = 'The password you entered is incorrect. Please try again.';
        } else if (result.message.includes('User not found')) {
          errorMessage = 'No account found with this email address.';
        } else if (result.message.includes('not yet approved')) {
          errorMessage = 'Your account is pending approval. Please wait for admin verification.';
        }
        
        setError(errorMessage);
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again later.');
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <img src={logo} alt="NNRG Connect Logo" className="auth-logo" />
        <h2>Sign In</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <input 
              type="email" 
              name="email" 
              id="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Enter your email"
              className={error && error.toLowerCase().includes('email') ? 'auth-input-error' : ''}
            />
          </div>
          
          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input 
              type="password" 
              name="password" 
              id="password" 
              value={formData.password} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Enter your password"
              className={error && error.toLowerCase().includes('password') ? 'auth-input-error' : ''}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="auth-message auth-error">
              <div>
                <strong>Error:</strong> {error}
                {attempts >= 3 && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.95em' }}>
                    If you've forgotten your password, please contact the administrator.
                  </div>
                )}
              </div>
              <button className="auth-message-close" onClick={handleCloseError} aria-label="Close error message">&times;</button>
            </div>
          )}
          {/* Success Message */}
          {success && (
            <div className="auth-message auth-success">
              <div>
                <strong>Success:</strong> {success}
              </div>
              <button className="auth-message-close" onClick={handleCloseSuccess} aria-label="Close success message">&times;</button>
            </div>
          )}
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={loading}
          >
            {loading ? <LoadingSpinner size="small" /> : 'Sign In'}
          </button>
        </form>
        
        <p className="auth-redirect-link">
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </div>
    </div>
  );
};

export default SignInPage; 