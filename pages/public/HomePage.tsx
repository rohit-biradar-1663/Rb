
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MapPinIcon, StarIcon, WrenchIcon, ZapIcon } from '../../components/Icons';
import ServiceCard from '../../components/ui/ServiceCard';

const services = [
  {
    title: 'Emergency Services',
    items: ['Puncture Repair', 'Fuel Delivery', 'Battery Jumpstart'],
    price: '199',
    icon: <ZapIcon className="w-6 h-6" />,
  },
  {
    title: 'Doorstep Services',
    items: ['General Servicing', 'Oil & Filter Change', 'Brake Services'],
    price: '299',
    icon: <MapPinIcon className="w-6 h-6" />,
  },
  {
    title: 'Garage Experience',
    items: ['Advanced Diagnostics', 'Engine Overhaul', 'Accidental Repairs'],
    price: '399',
    icon: <WrenchIcon className="w-6 h-6" />,
  },
];

const testimonials = [
  {
    quote: "ZippKar was a lifesaver! My bike broke down late at night and they had a mechanic with me in 20 minutes. Super-fast and professional.",
    name: 'Narendra Mule',
    location: 'Bangalore',
    rating: 5,
  },
  {
    quote: "Transparent pricing and great service. The mechanic knew exactly what was wrong and fixed it on the spot. Highly recommended!",
    name: 'Dhanaraj Biradar',
    location: 'Kothrud Pune',
    rating: 5,
  },
   {
    quote: "Booking a general service through the app was so convenient. They came to my home, did a great job, and the price was very reasonable.",
    name: 'Rahul Bharamshetty',
    location: 'Mumbai',
    rating: 4,
  },
];

const features = [
    {
        name: '24/7 Availability',
        description: 'Day or night, rain or shine, our network of mechanics is always ready to help you.',
        icon: ZapIcon,
    },
    {
        name: 'Live Tracking',
        description: 'Know exactly when help will arrive with real-time tracking of your mechanic.',
        icon: MapPinIcon,
    },
    {
        name: 'Verified Mechanics',
        description: 'All our garage partners are vetted and trained to provide you with the best service.',
        icon: WrenchIcon,
    },
];

const HomePage = () => {
  const navigate = useNavigate();

  const handleBookNow = (serviceTitle: string) => {
    navigate(`/book-service/${encodeURIComponent(serviceTitle)}`);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative bg-gray-900 text-white">
        <img
          src="https://images.unsplash.com/photo-1558981403-c5f9899a28bc?q=80&w=2070&auto=format&fit=crop&ixlib-rb-4.0.3"
          alt="Motorbike rider on a scenic road"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="relative container mx-auto px-6 lg:px-8 py-32 sm:py-48 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">
            Bike Trouble? We're on it.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-300">
            Never get stuck again. ZippKar provides fast, reliable roadside assistance for your two-wheeler, anytime, anywhere.
          </p>
          <div className="mt-10">
            <Link
              to="/services"
              className="bg-primary text-dark font-bold py-4 px-10 rounded-2xl text-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Get Help Now
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base font-semibold leading-7 text-accent">Why ZippKar?</h2>
            <p className="mt-2 text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
              Peace of Mind on Two Wheels
            </p>
            <p className="mt-6 max-w-2xl mx-auto text-lg leading-8 text-gray-600">
              We're more than just a service; we're your reliable partner on the road.
            </p>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
            {features.map((feature) => (
              <div key={feature.name} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-accent text-white">
                  <feature.icon className="h-6 w-6" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-7 text-dark">{feature.name}</h3>
                <p className="mt-2 text-base leading-7 text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-dark">Services We Offer</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              From emergency breakdowns to routine check-ups, we have a solution for every need.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {services.map((service, index) => (
              <ServiceCard key={index} {...service} onBookNow={() => handleBookNow(service.title)} />
            ))}
          </div>
           <div className="text-center mt-12">
                <Link to="/services" className="text-accent font-semibold hover:text-blue-700">
                    View All Services &rarr;
                </Link>
            </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-primary bg-opacity-20">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-4xl font-extrabold tracking-tight text-dark sm:text-5xl">
              Trusted by Riders Like You
            </h2>
          </div>
          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                <div className="flex items-center mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i}>
                      <StarIcon className={`w-5 h-5 ${i < testimonial.rating ? 'text-yellow-400' : 'text-gray-300'}`} filled={i < testimonial.rating} />
                    </div>
                  ))}
                </div>
                <p className="text-gray-700 italic">"{testimonial.quote}"</p>
                <p className="mt-4 font-bold text-dark">{testimonial.name}</p>
                <p className="text-sm text-gray-500">{testimonial.location}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="bg-dark text-white">
        <div className="container mx-auto px-6 lg:px-8 py-20 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Ready to Ride Worry-Free?</h2>
            <p className="mt-4 text-lg text-gray-300">Join thousands of riders who trust ZippKar for their roadside needs.</p>
            <div className="mt-8">
                <Link to="/login/user" className="bg-primary text-dark font-bold py-4 px-10 rounded-2xl text-lg hover:bg-yellow-500 transition-all duration-300">
                    Sign Up Now
                </Link>
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;