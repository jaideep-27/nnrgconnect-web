import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth
import './AuthPages.css'; // Shared styles for auth pages
import logo from '../../assets/logo.png'; // Import the logo

const SignUpPage = () => {
  const { signup } = useAuth(); // Use signup from AuthContext
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { fullName, email, phoneNumber, rollNumber, password, confirmPassword, collegeIdCardImage, branch, academicYear } = formData;
    if (!fullName || !email || !phoneNumber || !rollNumber || !password || !confirmPassword || !collegeIdCardImage || !branch || !academicYear) {
      setError('Please fill in all fields and upload your ID card.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
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
      const response = await signup(dataToSubmit); // Use signup from AuthContext
      setSuccess(response.message || 'Registration successful! Please wait for admin approval.');
      setError('');
      // Clear form on success
      setFormData({
        fullName: '', email: '', phoneNumber: '', rollNumber: '', branch: '', academicYear: '',
        password: '', confirmPassword: '', collegeIdCardImage: null
      });
      // Optionally clear the file input visually
      const fileInput = document.getElementById('collegeIdCardImage');
      if(fileInput) fileInput.value = null;
      
      // User sees the success message. No automatic navigation for now.
      // setTimeout(() => { navigate('/signin'); }, 3000); // Optional: redirect after a delay

    } catch (err) {
      setError(err.message || 'Failed to sign up. Please try again.');
      setSuccess('');
      console.error('Sign Up error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-form-wrapper">
        <img src={logo} alt="NNRG Connect Logo" className="auth-logo" />
        <h2>Create Account</h2>
        <form onSubmit={handleSubmit}>
          {error && <p className="auth-message auth-error">{error}</p>}
          {success && <p className="auth-message auth-success">{success}</p>}
          
          <div className="auth-input-group">
            <label htmlFor="fullName">Full Name</label>
            <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="auth-input-group">
            <label htmlFor="phoneNumber">Phone Number</label>
            <input type="tel" name="phoneNumber" id="phoneNumber" value={formData.phoneNumber} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="auth-input-group">
            <label htmlFor="rollNumber">Roll Number</label>
            <input type="text" name="rollNumber" id="rollNumber" value={formData.rollNumber} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="auth-input-group">
            <label htmlFor="branch">Branch</label>
            <select name="branch" id="branch" value={formData.branch} onChange={handleChange} required disabled={loading}>
              <option value="" disabled>Select your branch</option>
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
            <label htmlFor="academicYear">Academic Year (e.g., 2021-2025)</label>
            <input type="text" name="academicYear" id="academicYear" value={formData.academicYear} onChange={handleChange} required disabled={loading} placeholder="YYYY-YYYY"/>
          </div>
          <div className="auth-input-group">
            <label htmlFor="password">Password</label>
            <input type="password" name="password" id="password" value={formData.password} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input type="password" name="confirmPassword" id="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required disabled={loading} />
          </div>
          <div className="auth-input-group">
            <label htmlFor="collegeIdCardImage">Upload College ID Card</label>
            <input type="file" name="collegeIdCardImage" id="collegeIdCardImage" onChange={handleChange} accept="image/*" required disabled={loading} />
          </div>
          
          <button type="submit" className="auth-button btn btn-primary" disabled={loading}>
            {loading ? 'Submitting...' : 'Send for Approval'}
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