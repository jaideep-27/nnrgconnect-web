import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  AiOutlineHome,
  AiOutlineSearch,
  AiOutlineTool,
  AiOutlineUser,
  AiOutlineTeam
} from 'react-icons/ai'; // Using Ai icons from react-icons
import { RiAdminLine } from 'react-icons/ri'; // Import admin icon
import './BottomNavBar.css';
import { useAuth } from '../../contexts/AuthContext'; // Import useAuth

const BottomNavBar = () => {
  const { currentUser } = useAuth(); // Get currentUser from AuthContext

  return (
    <nav className="bottom-nav-bar">
      <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"} end>
        <AiOutlineHome size={24} />
        <span>Home</span>
      </NavLink>
      <NavLink to="/search" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <AiOutlineSearch size={24} />
        <span>Search</span>
      </NavLink>
      
      {/* Conditional Admin Dashboard Link */}
      {currentUser && currentUser.isAdmin && (
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
          <RiAdminLine size={24} />
          <span>Admin</span>
        </NavLink>
      )}

      <NavLink to="/community" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <AiOutlineTeam size={24} />
        <span>Community</span>
      </NavLink>

      <NavLink to="/career" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <AiOutlineTool size={24} />
        <span>Career</span>
      </NavLink>
      <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
        <AiOutlineUser size={24} />
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default BottomNavBar; 