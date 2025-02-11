import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Home } from './pages/Home';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/profile';  // Updated to lowercase
import { Admin } from './pages/Admin';
import { Options } from './pages/Options';

export const AppRoutes = () => {
  const { currentUser, isFirstTimeUser } = useAuth();

  return (
    <Routes>
      <Route path="/" element={currentUser ? <Navigate to="/dashboard" replace /> : <Home />} />
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            {isFirstTimeUser ? <Navigate to="/options" replace /> : <Dashboard />}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/options" 
        element={
          <ProtectedRoute>
            <Options />
          </ProtectedRoute>
        } 
      />
      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />
      <Route path="/admin" element={
        <ProtectedRoute requireAdmin>
          <Admin />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
