import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiMonitor, FiShield, FiUsers, FiUser, FiLogOut, FiMenu, FiX, FiHome, FiFileText, FiSettings } = FiIcons;

function Header() {
  const { user, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const getHomePathByRole = () => {
    if (!user) return '/';
    switch (userRole) {
      case 'admin': return '/admin';
      case 'tech': return '/tech';
      default: return '/dashboard';
    }
  };

  const navItems = user ? [
    { path: getHomePathByRole(), icon: FiHome, label: 'Home' },
    { path: '/documents', icon: FiFileText, label: 'Documents' },
    ...(userRole === 'admin' ? [{ path: '/admin/settings', icon: FiSettings, label: 'Settings' }] : []),
  ] : [];

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-3 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <SafeIcon icon={FiMonitor} className="text-white text-2xl" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">TechSolutions Pro</h1>
              <p className="text-sm text-gray-600">Professional IT Services</p>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!user ? (
              <>
                <div className="flex items-center space-x-2 text-gray-600">
                  <SafeIcon icon={FiShield} className="text-green-500" />
                  <span className="text-sm font-medium">Secure & Compliant</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-600">
                  <SafeIcon icon={FiUsers} className="text-blue-500" />
                  <span className="text-sm font-medium">24/7 Support</span>
                </div>
                <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                >
                  Register
                </Link>
              </>
            ) : (
              <>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  >
                    <SafeIcon icon={item.icon} className="text-blue-500" />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="flex items-center space-x-3 ml-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="text-sm" />
                    </div>
                    <span className="text-sm font-medium text-gray-800">{userRole}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-red-600 transition-colors duration-200 flex items-center space-x-1"
                  >
                    <SafeIcon icon={FiLogOut} />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors duration-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <SafeIcon icon={isMenuOpen ? FiX : FiMenu} className="text-2xl" />
          </button>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            transition={{ duration: 0.3 }}
            className="md:hidden mt-4 border-t pt-4"
          >
            {!user ? (
              <div className="flex flex-col space-y-4">
                <Link 
                  to="/login"
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SafeIcon icon={FiUser} />
                  <span>Login</span>
                </Link>
                <Link 
                  to="/register"
                  className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <SafeIcon icon={FiUsers} />
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <SafeIcon icon={item.icon} />
                    <span>{item.label}</span>
                  </Link>
                ))}
                <div className="pt-2 border-t border-gray-200">
                  <div className="flex items-center space-x-2 text-gray-700 mb-4">
                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                      <SafeIcon icon={FiUser} className="text-sm" />
                    </div>
                    <span className="font-medium capitalize">{userRole}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 text-red-600 hover:text-red-800 transition-colors duration-200"
                  >
                    <SafeIcon icon={FiLogOut} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </header>
  );
}

export default Header;