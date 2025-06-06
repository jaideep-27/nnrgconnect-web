import React from 'react';
import BottomNavBar from './BottomNavBar';
import './MainLayout.css'; // Styles for MainLayout
import logo from '../../assets/logo.png'; // Import the logo

const Header = () => (
  <header className="main-app-header">
    <img src={logo} alt="NNRG Connect Logo" className="header-logo" />
    <span className="header-title">NNRG Connect</span>
  </header>
);

const MainLayout = ({ children }) => {
  return (
    <div className="main-layout">
      <Header />
      <main className="main-content">
        {children}
      </main>
      <BottomNavBar />
    </div>
  );
};

export default MainLayout; 