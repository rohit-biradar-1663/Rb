import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MenuIcon, XIcon, ChevronDownIcon, UserIcon, LogOutIcon } from '../Icons';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { useNotification } from '../../context/NotificationContext';

const Header = () => {
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const { addNotification } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoginDropdownOpen, setIsLoginDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const loginDropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'About', path: '/about' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'FAQ', path: '/faq' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (loginDropdownRef.current && !loginDropdownRef.current.contains(event.target as Node)) {
        setIsLoginDropdownOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      addNotification(`Error logging out: ${error.message}`, 'error');
    } else {
      addNotification('You have been logged out.', 'success');
      setIsProfileDropdownOpen(false);
      navigate('/');
    }
  };

  const LoggedOutMenu = () => (
    <div className="relative" ref={loginDropdownRef}>
      <button
        onClick={() => setIsLoginDropdownOpen(!isLoginDropdownOpen)}
        className="flex items-center text-gray-700 hover:bg-primary hover:text-dark px-3 py-2 rounded-md text-md font-medium transition-colors duration-300"
      >
        <span>Login</span>
        <ChevronDownIcon className={`w-5 h-5 ml-1 transition-transform duration-200 ${isLoginDropdownOpen ? 'rotate-180' : ''}`} />
      </button>
      {isLoginDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
          <Link to="/login/user" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsLoginDropdownOpen(false)}>User Login</Link>
          <Link to="/login/garage" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsLoginDropdownOpen(false)}>Garage Login</Link>
          <Link to="/login/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsLoginDropdownOpen(false)}>Admin Login</Link>
        </div>
      )}
    </div>
  );

  const LoggedInMenu = () => (
    <div className="relative" ref={profileDropdownRef}>
      <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center justify-center w-10 h-10 bg-gray-200 rounded-full text-gray-600 hover:bg-primary transition-colors">
        <UserIcon className="w-6 h-6" />
      </button>
      {isProfileDropdownOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
            <div className="px-4 py-3 border-b">
                <p className="text-sm text-gray-900 font-semibold truncate">{user?.user_metadata?.full_name || 'User'}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>
          <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileDropdownOpen(false)}>My Dashboard</Link>
          <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setIsProfileDropdownOpen(false)}>My Profile</Link>
          <button onClick={handleLogout} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
            <LogOutIcon className="w-4 h-4 mr-2"/>
            Logout
          </button>
        </div>
      )}
    </div>
  );


  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex-shrink-0">
            <Link to="/" className="text-3xl font-extrabold text-primary">ZippKar</Link>
          </div>
          <nav className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link key={link.name} to={link.path} className="text-gray-700 hover:bg-primary hover:text-dark px-3 py-2 rounded-md text-md font-medium transition-colors duration-300">
                  {link.name}
                </Link>
              ))}
              {session ? <LoggedInMenu /> : <LoggedOutMenu />}
            </div>
          </nav>
          <div className="-mr-2 flex md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="bg-gray-100 inline-flex items-center justify-center p-2 rounded-md text-accent hover:text-white hover:bg-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link key={link.name} to={link.path} className="text-gray-700 hover:bg-primary hover:text-dark block px-3 py-2 rounded-md text-base font-medium transition-colors duration-300">
                {link.name}
              </Link>
            ))}
            <div className="border-t border-gray-200 my-2"></div>
            {session ? (
                 <>
                    <Link to="/profile" className="text-gray-700 hover:bg-primary hover:text-dark block px-3 py-2 rounded-md text-base font-medium">My Profile</Link>
                    <button onClick={() => { handleLogout(); setIsMenuOpen(false); }} className="w-full text-left text-red-600 hover:bg-primary hover:text-dark block px-3 py-2 rounded-md text-base font-medium">Logout</button>
                </>
            ) : (
                <>
                    <Link to="/login/user" className="text-gray-700 hover:bg-primary hover:text-dark block px-3 py-2 rounded-md text-base font-medium">User Login</Link>
                    <Link to="/login/garage" className="text-gray-700 hover:bg-primary hover:text-dark block px-3 py-2 rounded-md text-base font-medium">Garage Login</Link>
                    <Link to="/login/admin" className="text-gray-700 hover:bg-primary hover:text-dark block px-3 py-2 rounded-md text-base font-medium">Admin Login</Link>
                </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;