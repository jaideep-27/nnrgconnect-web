import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Context
import { useAuth } from './contexts/AuthContext';

// Layout
import MainLayout from './components/Layout/MainLayout';
import ScrollToTop from './components/common/ScrollToTop';
import LoadingState from './components/LoadingState';

// Auth Pages
import SignInPage from './pages/Auth/SignInPage';
import SignUpPage from './pages/Auth/SignUpPage';

// Student Pages
import HomePage from './pages/Student/HomePage';
import SearchPage from './pages/Student/SearchPage';
import CareerPage from './pages/Student/CareerPage';
import ProfilePage from './pages/Student/ProfilePage';
import CommunityPage from './pages/Student/CommunityPage';

// Admin Pages
import PendingRequestsPage from './pages/Admin/PendingRequestsPage';

// Higher-Order Component for protected routes
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingState fullScreen message="Loading..." />;
  return isAuthenticated ? children : <Navigate to="/signin" replace />;
};

// Higher-Order Component for admin routes
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingState fullScreen message="Loading..." />;
  return isAuthenticated && isAdmin ? children : <Navigate to="/" replace />;
};

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/signin" element={<SignInPage />} />
        <Route path="/signup" element={<SignUpPage />} />

        {/* Protected Student Routes */}
        <Route path="/" element={<ProtectedRoute><MainLayout><HomePage /></MainLayout></ProtectedRoute>} />
        <Route path="/search" element={<ProtectedRoute><MainLayout><SearchPage /></MainLayout></ProtectedRoute>} />
        <Route path="/career" element={<ProtectedRoute><MainLayout><CareerPage /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><MainLayout><ProfilePage /></MainLayout></ProtectedRoute>} />
        <Route path="/community" element={<ProtectedRoute><MainLayout><CommunityPage /></MainLayout></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route 
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <MainLayout>
                <PendingRequestsPage /> 
              </MainLayout>
            </AdminRoute>
          }
        />
        {/* If you need a separate dashboard page later, you can re-add it 
            and have PendingRequestsPage on its own route like /admin/pending-requests 
        */}

        {/* Fallback for unknown routes */}
        <Route path="*" element={<Navigate to="/signin" replace />} />
      </Routes>
    </Router>
  );
}

export default App;