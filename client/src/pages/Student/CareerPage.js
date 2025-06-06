import React, { useState } from 'react';
import { marked } from 'marked';
import { analyzeResumeAPI, getCareerTipsAPI } from '../../services/careerService';
import { useAuth } from '../../contexts/AuthContext';
import './CareerPage.css';

const CareerPage = () => {
  const { token, isAuthenticated } = useAuth();

  // Resume Reviewer State
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeSuggestions, setResumeSuggestions] = useState('');
  const [resumeLoading, setResumeLoading] = useState(false);
  const [resumeError, setResumeError] = useState('');

  // Career Tips State
  const [interests, setInterests] = useState('');
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
    if (!isAuthenticated || !token) {
      setResumeError('You must be logged in to use this feature.');
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
    if (!isAuthenticated || !token) {
      setTipsError('You must be logged in to use this feature.');
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

  // Helper function to sanitize and parse markdown
  const getMarkdownText = (text) => {
    if (!text) return null;
    // Basic sanitization (optional, as source is trusted but good practice)
    // For more robust sanitization, consider DOMPurify if dealing with user-generated markdown
    const rawMarkup = marked.parse(text);
    return { __html: rawMarkup };
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
            <div dangerouslySetInnerHTML={getMarkdownText(resumeSuggestions)} />
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
              placeholder="e.g., Software Engineering, Data Science"
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
              placeholder="e.g., Student, Intern"
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
              placeholder="e.g., Entry-level, 1-2 years"
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
            <div dangerouslySetInnerHTML={getMarkdownText(careerTips)} />
          </div>
        )}
      </section>
    </div>
  );
};

export default CareerPage; 