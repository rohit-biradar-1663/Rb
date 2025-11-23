import React from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from '../../components/ui/ServiceCard';
import { ZapIcon, WrenchIcon, MapPinIcon } from '../../components/Icons';

const ServicesPage = () => {
  const navigate = useNavigate();

  const handleBookNow = (serviceTitle: string) => {
    navigate(`/book-service/${encodeURIComponent(serviceTitle)}`);
  };
    
  const services = [
    {
      title: 'Emergency Services',
      items: [
        'Bike Breakdown Assistance', 'Chain Break Fix', 'Puncture Repair',
        'Fuel Delivery', 'Battery Jumpstart / Replacement', 'Tyre Replacement',
        'Minor On-Spot Repairs', 'Emergency Inspection', 'Others (Custom Requests)'
      ],
      price: '199',
      icon: <ZapIcon className="w-6 h-6" />
    },
    {
      title: 'Doorstep Services',
      items: [
        'General Servicing', 'Oil & Filter Change', 'Brake Services',
        'Chain & Sprocket Check', 'Air Filter Cleaning', 'Electrical Checkup',
        'Bike Wash & Polish', 'Clutch & Cable Adjustment', 'Others (Custom Requests)'
      ],
      price: '299',
      icon: <MapPinIcon className="w-6 h-6" />
    },
    {
      title: 'Garage Experience',
      items: [
        'Advanced Diagnostics', 'Engine Overhaul', 'Suspension Repair',
        'Accidental Repairs', 'Complete Bike Restoration', 'Paint Touch-Up / Coating',
        'Parts Replacement', 'Emission Check (PUC)', 'Others (Custom Requests)'
      ],
      price: '399',
      icon: <WrenchIcon className="w-6 h-6" />
    },
  ];

  return (
    <div className="bg-gray-100 py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-dark">Our Service Offerings</h1>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">Whatever your bike needs, we've got you covered. From emergency fixes to comprehensive servicing, choose the plan that's right for you.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {services.map((service, index) => (
            <ServiceCard 
              key={index} 
              {...service} 
              onBookNow={() => handleBookNow(service.title)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ServicesPage;