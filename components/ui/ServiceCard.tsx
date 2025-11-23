import React from 'react';

interface ServiceItemProps {
  title: string;
  items: string[];
  price: string;
  icon: React.ReactNode;
  onBookNow: () => void;
}

const ServiceCard: React.FC<ServiceItemProps> = ({ title, items, price, icon, onBookNow }) => {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden transform hover:-translate-y-2 transition-transform duration-300 flex flex-col h-full">
      <div className="p-6 border-l-8 border-primary">
        <div className="flex items-center mb-4">
          <div className="bg-accent text-white p-3 rounded-full mr-4">
            {icon}
          </div>
          <h3 className="text-2xl font-bold text-dark">{title}</h3>
        </div>
        <p className="text-gray-600 mb-6">Quick help when you need it most.</p>
        <ul className="space-y-2 text-gray-700">
          {items.map((item, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-auto p-6 bg-gray-50 flex justify-between items-center">
        <div>
          <span className="text-gray-600">Starting</span>
          <p className="text-2xl font-bold text-dark">₹{price}</p>
        </div>
        <button onClick={onBookNow} className="bg-primary text-dark font-bold py-3 px-6 rounded-2xl hover:bg-yellow-500 transition-colors duration-300 text-center">
          Book Now
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;