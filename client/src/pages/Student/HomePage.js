import React from 'react';
// import { AuthContext } from '../../contexts/AuthContext'; // Old import
import { useAuth } from '../../contexts/AuthContext'; // Corrected: Import useAuth
import { Link } from 'react-router-dom'; // Import Link
import './HomePage.css'; // We'll create this for specific HomePage styles

const HomePage = () => {
  // const { currentUser } = useContext(AuthContext); // Old way of getting context
  const { currentUser } = useAuth(); // Corrected: Use the useAuth hook

  return (
    <div className="home-page-container">
      {/* Hero Section */}
      <header className="home-hero-section">
        <div className="hero-content">
          <h1>Welcome to NNRG Connect!</h1>
          <p className="hero-subtitle">
            Your central hub for connecting, growing, and succeeding at NNRG College.
          </p>
          {currentUser && (
            <p className="hero-user-greeting">
              Hello, {currentUser.fullName.split(' ')[0]}! Let's make today productive.
            </p>
          )}
        </div>
      </header>

      {/* About Section */}
      <section className="home-about-section">
        <h2>What is NNRG Connect?</h2>
        <p>
          NNRG Connect is a dedicated platform for the students of NNRG College. Our mission is to foster a vibrant community by enabling students to connect with peers, access valuable career resources, stay updated on college events, and build a strong professional network that lasts beyond graduation.
        </p>
      </section>

      {/* Key Features Section */}
      <section className="home-features-section">
        <h2>Key Features</h2>
        <div className="features-grid">
          <div className="feature-card">
            <i className="feature-icon fas fa-users"></i> {/* Example icon, requires Font Awesome */}
            <h3>Connect & Network</h3>
            <p>Find and connect with fellow students, alumni, and faculty. Expand your network and build meaningful relationships.</p>
            <Link to="/student/search" className="feature-link">Explore Connections</Link>
          </div>
          <div className="feature-card">
            <i className="feature-icon fas fa-user-circle"></i> {/* Example icon */}
            <h3>Build Your Profile</h3>
            <p>Showcase your skills, projects, and aspirations. Let your profile be your digital handshake to the NNRG community.</p>
            <Link to="/student/profile" className="feature-link">Go to Your Profile</Link>
          </div>
          <div className="feature-card">
            <i className="feature-icon fas fa-briefcase"></i> {/* Example icon */}
            <h3>Unlock Career Opportunities</h3>
            <p>Access career resources, get resume insights (coming soon!), and discover opportunities tailored for NNRG students.</p>
            <Link to="/student/career" className="feature-link">Visit Career Page</Link>
          </div>
          <div className="feature-card">
            <i className="feature-icon fas fa-bullhorn"></i> {/* Example icon */}
            <h3>Stay Updated</h3>
            <p>Get the latest news, event announcements, and important updates directly from NNRG College and various student clubs.</p>
            {/* <Link to="/student/announcements" className="feature-link">View Announcements</Link> */}
            <p><em>(Announcements feature coming soon)</em></p>
          </div>
        </div>
      </section>

      {/* Call to Action or Footer Note (Optional) */}
      <footer className="home-footer-note">
        <p>We are constantly working to improve NNRG Connect. Your feedback is valuable!</p>
      </footer>
    </div>
  );
};

export default HomePage; 