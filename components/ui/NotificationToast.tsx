import React, { useEffect, useState } from 'react';
import { XIcon } from '../Icons';

interface NotificationToastProps {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  onClose: () => void;
}

const typeStyles = {
  info: 'bg-accent',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

const NotificationToast: React.FC<NotificationToastProps> = ({ message, type, onClose }) => {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setExiting(true);
      setTimeout(onClose, 300); // Wait for exit animation
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  const handleClose = () => {
    setExiting(true);
    setTimeout(onClose, 300);
  };
  
  return (
    <div
      className={`w-full ${typeStyles[type]} text-white rounded-xl shadow-lg p-4 flex items-start justify-between transition-all duration-300 transform ${exiting ? 'opacity-0 translate-x-full' : 'opacity-100 translate-x-0'}`}
    >
      <p className="flex-grow pr-4 text-sm font-medium">{message}</p>
      <button onClick={handleClose} className="flex-shrink-0 -mr-1 -mt-1 p-1 rounded-full hover:bg-white/20 transition-colors">
        <XIcon className="w-5 h-5" />
      </button>
    </div>
  );
};

export default NotificationToast;
