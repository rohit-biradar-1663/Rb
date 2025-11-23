import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { MapPinIcon, ClockIcon, StarIcon } from '../../components/Icons';
import { BookingStatus, PaymentStatus, Garage } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';

declare const google: any;

const serviceTypes = [
    'Emergency Services',
    'Doorstep Services',
    'Garage Experience',
    'General Servicing'
];

const timeSlots = [
    '09:00 AM - 11:00 AM',
    '11:00 AM - 01:00 PM',
    '02:00 PM - 04:00 PM',
    '04:00 PM - 06:00 PM',
];

const BookServicePage = () => {
    const { serviceType: serviceTypeParam } = useParams<{ serviceType: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotification();
    const { user } = useAuth();
    
    const [step, setStep] = useState<'details' | 'selectGarage'>('details');
    const [garages, setGarages] = useState<(Garage & { eta: string })[]>([]);
    const [selectedGarage, setSelectedGarage] = useState<Garage | null>(null);

    const [formData, setFormData] = useState({
        fullName: '',
        mobileNumber: '',
        brandName: '',
        model: '',
        bikeNumber: '',
        serviceType: '',
        preferredSlot: '',
        preferredDate: '',
        location: '',
        issueDescription: ''
    });

    const [loadingGarages, setLoadingGarages] = useState(false);
    const [bookingInProgress, setBookingInProgress] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);

    useEffect(() => {
        if (serviceTypeParam) {
            const decodedService = decodeURIComponent(serviceTypeParam);
            const foundService = serviceTypes.find(s => s.toLowerCase().includes(decodedService.toLowerCase()));
            setFormData(prev => ({ ...prev, serviceType: foundService || '' }));
        }
        if (user) {
            setFormData(prev => ({ 
                ...prev, 
                fullName: user.user_metadata?.full_name || '',
            }));
        }
    }, [serviceTypeParam, user]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUseMyLocation = () => {
        setLocationLoading(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const geocoder = new google.maps.Geocoder();
                    geocoder.geocode({ location: { lat: latitude, lng: longitude } }, (results: any, status: any) => {
                        if (status === 'OK' && results?.[0]) {
                            setFormData(prev => ({ ...prev, location: results[0].formatted_address }));
                            addNotification('Location fetched successfully!', 'success');
                        } else {
                            addNotification('Failed to find address for your location.', 'error');
                        }
                        setLocationLoading(false);
                    });
                },
                (error) => {
                    addNotification(`Error getting location: ${error.message}`, 'error');
                    setLocationLoading(false);
                }
            );
        } else {
            addNotification('Geolocation is not supported by your browser.', 'error');
            setLocationLoading(false);
        }
    };

    const handleFindGarages = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoadingGarages(true);
        try {
            const { data, error } = await supabase.from('garages').select('*');
            if (error) throw error;

            const garagesWithEta = data.map(g => ({
                ...g,
                eta: `${Math.floor(Math.random() * 15) + 15}-${Math.floor(Math.random() * 10) + 30} min`
            }));
            setGarages(garagesWithEta);
            setStep('selectGarage');
        } catch (error: any) {
            addNotification(`Failed to fetch garages: ${error.message}`, 'error');
        } finally {
            setLoadingGarages(false);
        }
    };

    const handleConfirmBooking = async () => {
        if (!user) {
            addNotification('You must be logged in to book a service.', 'error');
            navigate('/login/user');
            return;
        }
        if (!selectedGarage) {
            addNotification('Please select a garage to confirm your booking.', 'warning');
            return;
        }

        setBookingInProgress(true);

        try {
            const bookingData = {
                user_id: user.id,
                garage_id: selectedGarage.id,
                issue_type: formData.serviceType || 'General Service',
                status: BookingStatus.REQUESTED,
                price: Math.floor(Math.random() * (500 - 200 + 1) + 200),
                payment_status: PaymentStatus.UNPAID,
                // Add other relevant form data to your booking table as needed
            };
            
            const { error } = await supabase.from('bookings').insert([bookingData]);
            
            if (error) throw error;
            
            addNotification(`Booking sent to ${selectedGarage.name}!`, 'success');
            navigate('/dashboard');

        } catch (error: any) {
             addNotification(`Booking failed: ${error.message}`, 'error');
        } finally {
            setBookingInProgress(false);
        }
    };

    return (
        <div className="bg-gray-100 min-h-[calc(100vh-80px)] py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-dark">Book Service</h1>
                    <p className="mt-2 text-lg text-gray-600">
                        {step === 'details'
                            ? 'Please fill in the details to find nearby mechanics.'
                            : 'Select a garage to complete your booking.'}
                    </p>
                </div>

                <div className="mt-10 bg-white p-8 rounded-2xl shadow-2xl transition-all duration-500">
                    {step === 'details' && (
                        <form onSubmit={handleFindGarages} className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <div className="md:col-span-2 font-bold text-lg text-accent border-b pb-2 mb-2">Personal Details</div>
                            <div>
                                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
                                <input type="text" name="fullName" id="fullName" value={formData.fullName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="e.g. Dhanaraj Biradar" />
                            </div>
                            <div>
                                <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700">Mobile Number</label>
                                <input type="tel" name="mobileNumber" id="mobileNumber" value={formData.mobileNumber} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="e.g. 9876543210" />
                            </div>

                            <div className="md:col-span-2 font-bold text-lg text-accent border-b pb-2 mb-2 mt-4">Bike Details</div>
                            <div>
                                <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">Brand Name</label>
                                <input type="text" name="brandName" id="brandName" value={formData.brandName} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="e.g. Hero, Honda" />
                            </div>
                            <div>
                                <label htmlFor="model" className="block text-sm font-medium text-gray-700">Model</label>
                                <input type="text" name="model" id="model" value={formData.model} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="e.g. Splendor Plus" />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="bikeNumber" className="block text-sm font-medium text-gray-700">Bike Number</label>
                                <input type="text" name="bikeNumber" id="bikeNumber" value={formData.bikeNumber} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="e.g. MH14 XY 1234" />
                            </div>

                            <div className="md:col-span-2 font-bold text-lg text-accent border-b pb-2 mb-2 mt-4">Service Details</div>
                            <div>
                                <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">Service Type</label>
                                <select id="serviceType" name="serviceType" value={formData.serviceType} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md">
                                    <option value="">Select Service</option>
                                    {serviceTypes.map(type => <option key={type} value={type}>{type}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-700">Preferred Date</label>
                                <input type="date" name="preferredDate" id="preferredDate" value={formData.preferredDate} onChange={handleInputChange} required className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" min={new Date().toISOString().split("T")[0]} />
                            </div>
                             <div className="md:col-span-2">
                                <label htmlFor="preferredSlot" className="block text-sm font-medium text-gray-700">Preferred Slot</label>
                                <select id="preferredSlot" name="preferredSlot" value={formData.preferredSlot} onChange={handleInputChange} required className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md">
                                    <option value="">Select Slot</option>
                                    {timeSlots.map(slot => <option key={slot} value={slot}>{slot}</option>)}
                                </select>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                                 <div className="relative">
                                    <textarea name="location" id="location" rows={3} value={formData.location} onChange={handleInputChange} required className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="Enter address or use location detection"></textarea>
                                    <button type="button" onClick={handleUseMyLocation} disabled={locationLoading} className="absolute top-2 right-2 inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-accent hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50">
                                        <MapPinIcon className="-ml-0.5 mr-2 h-4 w-4" />
                                        {locationLoading ? 'Fetching...' : 'Use My Location'}
                                    </button>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="issueDescription" className="block text-sm font-medium text-gray-700">Issue Description</label>
                                <textarea id="issueDescription" name="issueDescription" rows={4} value={formData.issueDescription} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-accent focus:border-accent" placeholder="Describe the issue with your bike (e.g. engine noise, oil leak)"></textarea>
                            </div>
                            
                            <div className="md:col-span-2 text-center mt-6">
                                <button type="submit" disabled={loadingGarages} className="w-full max-w-xs inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-lg font-bold rounded-2xl text-dark bg-primary hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50">
                                    {loadingGarages ? 'Finding Garages...' : 'Find Garages'}
                                </button>
                            </div>
                        </form>
                    )}

                    {step === 'selectGarage' && (
                        <div>
                            <h2 className="text-2xl font-bold text-dark mb-6 text-center">Available Garages Nearby</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                {garages.map(garage => (
                                    <div
                                        key={garage.id}
                                        onClick={() => setSelectedGarage(garage)}
                                        className={`p-4 border-2 rounded-xl cursor-pointer transition-all duration-200 ${selectedGarage?.id === garage.id ? 'border-accent bg-blue-50 ring-2 ring-accent' : 'border-gray-200 hover:border-accent hover:bg-gray-50'}`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-dark">{garage.name}</h3>
                                            <div className="flex items-center space-x-1">
                                                <StarIcon className="w-5 h-5 text-yellow-400" filled />
                                                <span className="font-bold text-dark">{garage.averageRating}</span>
                                            </div>
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2 space-y-1">
                                            <p className="flex items-center"><MapPinIcon className="w-4 h-4 mr-2 text-gray-400" /> {garage.location}</p>
                                            <p className="flex items-center"><ClockIcon className="w-4 h-4 mr-2 text-gray-400" /> Est. Arrival: <span className="font-semibold ml-1">{garage.eta}</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4 mt-8">
                                <button
                                    onClick={() => { setStep('details'); setSelectedGarage(null); }}
                                    className="w-full sm:w-auto bg-gray-200 text-dark font-bold py-3 px-8 rounded-2xl hover:bg-gray-300 transition-colors"
                                >
                                    Back
                                </button>
                                <button
                                    onClick={handleConfirmBooking}
                                    disabled={!selectedGarage || bookingInProgress}
                                    className="w-full sm:w-auto inline-flex justify-center py-3 px-8 border border-transparent shadow-sm text-lg font-bold rounded-2xl text-dark bg-primary hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                                >
                                    {bookingInProgress ? 'Booking...' : 'Confirm Booking'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default BookServicePage;