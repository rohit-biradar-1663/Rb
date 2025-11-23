
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {

  const handlePlaceholderClick = (event: React.MouseEvent<HTMLAnchorElement>, featureName: string) => {
    event.preventDefault();
    console.log(`${featureName} link clicked. To be implemented.`);
  };

  return (
    <footer className="bg-primary text-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Tagline */}
          <div className="col-span-1 md:col-span-1">
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">ZippKar</h2>
            <p className="mt-4 text-gray-700">
              Never get stuck again — help is always a tap away.
            </p>
          </div>
          
          {/* Company Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Company</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/about" className="text-base text-gray-600 hover:text-accent transition-colors">About Us</Link></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, 'Careers')} className="text-base text-gray-600 hover:text-accent transition-colors">Careers</a></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, 'Blog')} className="text-base text-gray-600 hover:text-accent transition-colors">Blog</a></li>
            </ul>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Quick Links</h3>
            <ul className="mt-4 space-y-4">
              <li><Link to="/" className="text-base text-gray-600 hover:text-accent transition-colors">Home</Link></li>
              <li><Link to="/services" className="text-base text-gray-600 hover:text-accent transition-colors">Services</Link></li>
              <li><Link to="/contact" className="text-base text-gray-600 hover:text-accent transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="text-base text-gray-600 hover:text-accent transition-colors">FAQ</Link></li>
              <li><a href="#" onClick={(e) => handlePlaceholderClick(e, 'Privacy Policy')} className="text-base text-gray-600 hover:text-accent transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
          
          {/* Connect Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Connect</h3>
            <ul className="mt-4 space-y-4">
              <li><a href="mailto:support@zippkar.com" className="text-base text-gray-600 hover:text-accent transition-colors">support@zippkar.com</a></li>
              <li><a href="tel:+916361757959" className="text-base text-gray-600 hover:text-accent transition-colors">+91-63617-57959</a></li>
            </ul>
          </div>
        </div>
        
        {/* Copyright */}
        <div className="mt-12 border-t border-gray-900/10 pt-8 text-center">
          <p className="text-sm text-gray-600">&copy; 2025 ZippKar Technologies. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
