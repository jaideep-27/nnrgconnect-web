import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import './AuthPages.css'; // Shared styles for auth pages
import logo from '../../assets/logo.png'; // Import the logo
import LoadingSpinner from '../../components/LoadingSpinner';

const SignUpPage = () => {
  const { signup } = useAuth(); // Use signup from AuthContext
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    rollNumber: '',
    branch: '',
    academicYear: '',
    password: '',
    confirmPassword: '',
    collegeIdCardImage: null,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false); // Local loading state for form submission

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "collegeIdCardImage") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
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

    const { fullName, email, phoneNumber, rollNumber, password, confirmPassword, collegeIdCardImage, branch, academicYear } = formData;
    
    // Validation
    if (!fullName || !email || !phoneNumber || !rollNumber || !password || !confirmPassword || !collegeIdCardImage || !branch || !academicYear) {
      setError('Please fill in all fields and upload your ID card.');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    if (!/^\d{10}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit phone number.');
      return;
    }

    setLoading(true);

    const dataToSubmit = new FormData();
    dataToSubmit.append('fullName', fullName);
    dataToSubmit.append('email', email);
    dataToSubmit.append('phoneNumber', phoneNumber);
    dataToSubmit.append('rollNumber', rollNumber);
    dataToSubmit.append('branch', branch);
    dataToSubmit.append('academicYear', academicYear);
    dataToSubmit.append('password', password);
    dataToSubmit.append('collegeIdCardImage', collegeIdCardImage);

    try {
      await signup(dataToSubmit);
      setSuccess('Registration successful! Your account is pending admin approval. You will be notified once approved.');
      setError('');
      
      // Clear form on success
      setFormData({
        fullName: '', 
        email: '', 
        phoneNumber: '', 
        rollNumber: '', 
        branch: '', 
        academicYear: '',
        password: '', 
        confirmPassword: '', 
        collegeIdCardImage: null
      });
      
      // Clear file input
      const fileInput = document.getElementById('collegeIdCardImage');
      if(fileInput) fileInput.value = null;
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
      setSuccess('');
      console.error('Sign Up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <img src={logo} alt="NNRG Connect Logo" className="auth-logo" />
        <h2>Create Account</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="auth-input-group">
            <label htmlFor="fullName">Full Name</label>
            <input 
              type="text" 
              name="fullName" 
              id="fullName" 
              value={formData.fullName} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Enter your full name"
              className={error && error.toLowerCase().includes('name') ? 'auth-input-error' : ''}
            />
          </div>
          
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
            <label htmlFor="phoneNumber">Phone Number</label>
            <input 
              type="tel" 
              name="phoneNumber" 
              id="phoneNumber" 
              value={formData.phoneNumber} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Enter your 10-digit phone number"
              className={error && error.toLowerCase().includes('phone') ? 'auth-input-error' : ''}
            />
          </div>
          
          <div className="auth-input-group">
            <label htmlFor="rollNumber">Roll Number</label>
            <input 
              type="text" 
              name="rollNumber" 
              id="rollNumber" 
              value={formData.rollNumber} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Enter your roll number"
              className={error && error.toLowerCase().includes('roll') ? 'auth-input-error' : ''}
            />
          </div>
          
          <div className="auth-input-group">
            <label htmlFor="branch">Branch</label>
            <select 
              name="branch" 
              id="branch" 
              value={formData.branch} 
              onChange={handleChange} 
              required 
              disabled={loading}
              className={error && error.toLowerCase().includes('branch') ? 'auth-input-error' : ''}
            >
              <option value="">Select your branch</option>
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="CSE (AI & ML)">CSE (AI & ML)</option>
              <option value="CSE (Data Science)">CSE (Data Science)</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
              <option value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>
          
          <div className="auth-input-group">
            <label htmlFor="academicYear">Academic Year</label>
            <input 
              type="text" 
              name="academicYear" 
              id="academicYear" 
              value={formData.academicYear} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="e.g., 2021-2025"
              className={error && error.toLowerCase().includes('year') ? 'auth-input-error' : ''}
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
          
          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword" 
              id="confirmPassword" 
              value={formData.confirmPassword} 
              onChange={handleChange} 
              required 
              disabled={loading}
              placeholder="Confirm your password"
              className={error && error.toLowerCase().includes('confirm') ? 'auth-input-error' : ''}
            />
          </div>
          
          <div className="auth-input-group">
            <label htmlFor="collegeIdCardImage">Upload College ID Card</label>
            <input 
              type="file" 
              name="collegeIdCardImage" 
              id="collegeIdCardImage" 
              onChange={handleChange} 
              accept="image/*" 
              required 
              disabled={loading}
              className={error && error.toLowerCase().includes('id card') ? 'auth-input-error' : ''}
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="auth-message auth-error">
              <div>
                <strong>Error:</strong> {error}
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
            {loading ? <LoadingSpinner size="small" /> : 'Send for Approval'}
          </button>
        </form>
        
        <p className="auth-redirect-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
  );
};

export default SignUpPage;