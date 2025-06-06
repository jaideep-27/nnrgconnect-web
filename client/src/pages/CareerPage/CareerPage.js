import React, { useState, useContext } from 'react'; // Assuming useContext for auth
import { analyzeResumeAPI, getCareerTipsAPI } from '../../services/careerService';
// import { AuthContext } from '../../contexts/AuthContext'; // Example: adjust to your actual AuthContext path
import './CareerPage.css';

// Placeholder for AuthContext - replace with your actual context or token retrieval mechanism
const AuthContext = React.createContext(null);
// A simple hook placeholder if you use one, if not, get token directly via useContext(AuthContext)
const useAuth = () => useContext(AuthContext);

const CareerPage = () => {
  // If you don't use an AuthContext provider like this, ensure 'token' is retrieved correctly.
  // For this example, we'll mock a token if AuthContext is not set up for it.
  let authContextToken = null;
  try {
      const auth = useAuth(); // This might throw if AuthContext.Provider is not an ancestor
      authContextToken = auth ? auth.token : null;
  } catch (e) {
      console.warn("AuthContext not found, using mock token. Please integrate your auth token.");
  }
  const token = authContextToken || 'mock-token-replace-with-real-one'; // FALLBACK - REMOVE IN PRODUCTION

  // Resume Reviewer State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSuggestions, setResumeSuggestions] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Career Tips State
  const [interests, setInterests] = useState(''); // Comma-separated string for simplicity
  const [currentRole, setCurrentRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [careerTips, setCareerTips] = useState('');
  const [tipsLoading, setTipsLoading] = useState(false);
  const [tipsError, setTipsError] = useState('');

  const handleFileChange = (event) => {
    setResumeFile(event.target.files[0]);
    setResumeSuggestions('');
    setResumeError('');
  };

  const handleResumeSubmit = async (event) => {
    event.preventDefault();
    if (!resumeFile) {
      setResumeError('Please select a PDF file to upload.');
      return;
    }
    if (!token) {
      setResumeError('Authentication token not found. Please log in.');
      return;
    }

    const formData = new FormData();
    formData.append('resume', resumeFile);

    setResumeLoading(true);
    setResumeError('');
    setResumeSuggestions('');

    try {
      const data = await analyzeResumeAPI(formData, token);
      setResumeSuggestions(data.suggestions);
    } catch (error) {
      setResumeError(error.message || 'Failed to analyze resume. Please try again.');
    } finally {
      setResumeLoading(false);
    }
  };

  const handleTipsSubmit = async (event) => {
    event.preventDefault();
    if (!interests.trim()) {
      setTipsError('Please enter your career interests.');
      return;
    }
    if (!token) {
      setTipsError('Authentication token not found. Please log in.');
      return;
    }

    const payload = {
      interests: interests.split(',').map(interest => interest.trim()).filter(i => i),
      currentRole: currentRole.trim(),
      experienceLevel: experienceLevel.trim(),
    };

    setTipsLoading(true);
    setTipsError('');
    setCareerTips('');

    try {
      const data = await getCareerTipsAPI(payload, token);
      setCareerTips(data.tips);
    } catch (error) {
      setTipsError(error.message || 'Failed to fetch career tips. Please try again.');
    } finally {
      setTipsLoading(false);
    }
  };

  return (
    <div className="career-page-container">
      <h1>Career Guidance Hub</h1>

      {/* Resume Reviewer Section */}
      <section className="career-section resume-reviewer">
        <h2>AI Resume Reviewer</h2>
        <p>Upload your resume (PDF format, max 5MB) to get AI-powered feedback and suggestions.</p>
        <form onSubmit={handleResumeSubmit}>
          <div className="form-group">
            <label htmlFor="resumeFile">Upload PDF Resume:</label>
            <input 
              type="file" 
              id="resumeFile" 
              accept=".pdf" 
              onChange={handleFileChange} 
              disabled={resumeLoading}
            />
          </div>
          <button type="submit" disabled={resumeLoading || !resumeFile}>
            {resumeLoading ? 'Analyzing...' : 'Analyze Resume'}
          </button>
          {resumeError && <p className="error-message">{resumeError}</p>}
        </form>
        {resumeSuggestions && (
          <div className="results-box">
            <h3>Resume Suggestions:</h3>
            <pre>{resumeSuggestions}</pre>
          </div>
        )}
      </section>

      {/* Career Tips Section */}
      <section className="career-section career-tips">
        <h2>Personalized Career Tips</h2>
        <p>Tell us about your interests and get AI-generated career advice.</p>
        <form onSubmit={handleTipsSubmit}>
          <div className="form-group">
            <label htmlFor="interests">Career Interests (comma-separated):</label>
            <input 
              type="text" 
              id="interests" 
              value={interests} 
              onChange={(e) => setInterests(e.target.value)} 
              placeholder="e.g., Software Engineering, Data Science, Product Management"
              disabled={tipsLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentRole">Current Role (Optional):</label>
            <input 
              type="text" 
              id="currentRole" 
              value={currentRole} 
              onChange={(e) => setCurrentRole(e.target.value)} 
              placeholder="e.g., Student, Junior Developer"
              disabled={tipsLoading}
            />
          </div>
          <div className="form-group">
            <label htmlFor="experienceLevel">Experience Level (Optional):</label>
            <input 
              type="text" 
              id="experienceLevel" 
              value={experienceLevel} 
              onChange={(e) => setExperienceLevel(e.target.value)} 
              placeholder="e.g., Entry-level, 2 years, Senior"
              disabled={tipsLoading}
            />
          </div>
          <button type="submit" disabled={tipsLoading || !interests.trim()}>
            {tipsLoading ? 'Fetching Tips...' : 'Get Career Tips'}
          </button>
          {tipsError && <p className="error-message">{tipsError}</p>}
        </form>
        {careerTips && (
          <div className="results-box">
            <h3>Career Advice:</h3>
            <pre>{careerTips}</pre>
          </div>
        )}
      </section>
    </div>
  );
};

export default CareerPage; 