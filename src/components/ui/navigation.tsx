import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X } from 'lucide-react';
import { GoogleButton } from './google-button';
import { useAuth } from '../../contexts/AuthContext';

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const NavLink: React.FC<NavLinkProps> = ({ to, children, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === to;

  return (
    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
      <Link
        to={to}
        onClick={onClick}
        className={`px-3 py-2 rounded-md text-sm font-medium ${
          isActive ? "bg-gray-900 text-white" : "text-gray-300 hover:bg-gray-700 hover:text-white"
        }`}
      >
        {children}
      </Link>
    </motion.div>
  );
};

export const Navigation: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { currentUser, signInWithGoogle, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleAuthClick = async () => {
    try {
      if (!currentUser) {
        await signInWithGoogle();
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsDropdownOpen(false);
      navigate('/');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <nav className="bg-gray-800 fixed w-full z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/" className="text-white text-lg font-bold">
                Community Service Tracker
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <NavLink to="/">Home</NavLink>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/activities">Activities</NavLink>
                <NavLink to="/options">Options</NavLink>
                <NavLink to="/profile">Profile</NavLink>
                {isAdmin && <NavLink to="/admin">Admin</NavLink>}
              </div>
            </div>
          </div>
          
          <div className="hidden md:flex items-center">
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-3 px-4 py-2 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-8 w-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                      <span className="text-gray-600">
                        {(currentUser.displayName || currentUser.email || '?')[0].toUpperCase()}
                      </span>
                    </div>
                  )}
                  <span>{currentUser.displayName || currentUser.email}</span>
                </button>
                
                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Profile
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <GoogleButton 
                onClick={handleAuthClick}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Sign in with College Email
              </GoogleButton>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {currentUser ? (
                <>
                  <NavLink to="/" onClick={() => setIsOpen(false)}>Home</NavLink>
                  <NavLink to="/dashboard" onClick={() => setIsOpen(false)}>Dashboard</NavLink>
                  <NavLink to="/activities" onClick={() => setIsOpen(false)}>Activities</NavLink>
                  <NavLink to="/options" onClick={() => setIsOpen(false)}>Options</NavLink>
                  <NavLink to="/profile" onClick={() => setIsOpen(false)}>Profile</NavLink>
                  {isAdmin && <NavLink to="/admin" onClick={() => setIsOpen(false)}>Admin</NavLink>}
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <GoogleButton 
                  onClick={handleAuthClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                >
                  Sign in with College Email
                </GoogleButton>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};
