import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Booking, BookingStatus, PaymentStatus, Review } from '../../types';
import ReviewModal from '../../components/modals/ReviewModal';
import { useNotification } from '../../context/NotificationContext';
import { MapPinIcon, StarIcon, WrenchIcon, ClockIcon, ZapIcon } from '../../components/Icons';
import { supabase } from '../../lib/supabaseClient';
import { useAuth } from '../../context/AuthContext';

const getStatusPill = (status: BookingStatus) => {
    switch(status) {
        case BookingStatus.REQUESTED:
            return <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Requested</span>;
        case BookingStatus.ACCEPTED:
            return <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Accepted</span>;
        case BookingStatus.ON_WAY:
            return <span className="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded-full">On The Way</span>;
        case BookingStatus.ARRIVED:
            return <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Arrived</span>;
        case BookingStatus.COMPLETED:
            return <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Completed</span>;
        case BookingStatus.CANCELLED:
            return <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Cancelled</span>;
        default:
            return <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded-full">Unknown</span>;
    }
}

const UserDashboardPage = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [selectedBookingForReview, setSelectedBookingForReview] = useState<Booking | null>(null);
  const { addNotification } = useNotification();
  const { user } = useAuth();

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) {
        setLoading(false);
        addNotification('You must be logged in to view your dashboard.', 'warning');
        return;
      }
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            garage:garages(*),
            review:reviews(*)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        if (data) {
          const formattedBookings = data.map((b: any) => ({
            ...b,
            createdAt: new Date(b.created_at),
            updatedAt: new Date(b.updated_at),
            review: b.review?.length > 0 ? b.review[0] : null,
          }));
          setBookings(formattedBookings as Booking[]);
        }
      } catch (error: any) {
        console.error("Error fetching bookings:", error);
        addNotification(`Error fetching bookings: ${error.message}`, 'error');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [addNotification, user]);

  const activeBookings = bookings.filter(b => 
    b.status !== BookingStatus.COMPLETED && b.status !== BookingStatus.CANCELLED
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const pastBookings = bookings.filter(b => 
    b.status === BookingStatus.COMPLETED || b.status === BookingStatus.CANCELLED
  ).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  
  const handleOpenReviewModal = (booking: Booking) => {
    setSelectedBookingForReview(booking);
    setIsReviewModalOpen(true);
  };
  
  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
    setSelectedBookingForReview(null);
  };

  const handleReviewSubmit = async (bookingId: string, rating: number, comment: string) => {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking || !user) return;

    try {
        const newReview: Omit<Review, 'id' | 'createdAt'> = {
            bookingId,
            userId: user.id,
            garageId: booking.garageId,
            rating,
            comment,
        };
        
        const { data, error } = await supabase.from('reviews').insert([newReview]).select();
        
        if (error) throw error;
        
        const createdReview = data[0];

        const updatedBookings = bookings.map(b => 
            b.id === bookingId ? { ...b, review: createdReview as any } : b
        );
        
        setBookings(updatedBookings);
        addNotification('Thank you for your review!', 'success');
        handleCloseReviewModal();

    } catch (error: any) {
        console.error('Error submitting review:', error);
        addNotification(`Error submitting review: ${error.message}`, 'error');
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: BookingStatus.CANCELLED, updated_at: new Date() })
                .eq('id', bookingId);
            
            if (error) throw error;
            
            const updatedBookings = bookings.map(b => 
                b.id === bookingId 
                ? { ...b, status: BookingStatus.CANCELLED, updatedAt: new Date() } 
                : b
            );
            setBookings(updatedBookings);
            addNotification('Booking cancelled successfully.', 'success');
        } catch(error: any) {
            addNotification(`Failed to cancel booking: ${error.message}`, 'error');
        }
    }
  };
  
  if (loading) {
    return (
      <div className="bg-gray-100 min-h-[calc(100vh-80px)] p-8 flex justify-center items-center">
        <p className="text-xl text-gray-600 animate-pulse">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-[calc(100vh-80px)] p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
                <h1 className="text-4xl font-extrabold text-dark">My Dashboard</h1>
                <p className="mt-1 text-lg text-gray-500">Welcome back! Here's an overview of your activity.</p>
            </div>
            <Link to="/services" className="bg-primary text-dark font-bold py-3 px-6 rounded-2xl text-lg hover:bg-yellow-500 transition-all duration-300 transform hover:scale-105 shadow-lg whitespace-nowrap">
                Book a New Service
            </Link>
        </div>

        {/* Active Bookings */}
        <section>
          <h2 className="text-2xl font-bold text-dark mb-4">Active Bookings</h2>
          {activeBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeBookings.map(booking => (
                <div key={booking.id} className="bg-white rounded-2xl shadow-lg p-6 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                            <h3 className="text-xl font-bold text-dark">{booking.issueType}</h3>
                            {getStatusPill(booking.status)}
                        </div>
                        <p className="text-gray-500 text-sm mt-1">
                            Booked on {new Date(booking.createdAt).toLocaleString()}
                        </p>
                        <div className="mt-4 border-t border-gray-100 pt-4 space-y-2">
                            <p className="flex items-center text-gray-700">
                                <WrenchIcon className="w-5 h-5 mr-3 text-gray-400"/>
                                <span className='font-medium'>{booking.garage?.name}</span>
                            </p>
                            <p className="flex items-center text-gray-700">
                                <MapPinIcon className="w-5 h-5 mr-3 text-gray-400"/>
                                {booking.garage?.location}
                            </p>
                            {(booking.status === BookingStatus.ACCEPTED || booking.status === BookingStatus.ON_WAY || booking.status === BookingStatus.REQUESTED) && (
                                <p className="flex items-center text-green-600 font-semibold pt-1">
                                    <ClockIcon className="w-5 h-5 mr-3"/>
                                    {booking.status === BookingStatus.ON_WAY ? 'Estimated Arrival: ~15 minutes' : 'Awaiting mechanic confirmation'}
                                </p>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 flex justify-between items-center">
                        <p className="text-2xl font-bold text-dark">₹{booking.price}</p>
                         <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleCancelBooking(booking.id)}
                                className="text-red-600 font-bold py-2 px-4 rounded-xl hover:bg-red-50 transition-colors text-sm">
                                Cancel
                            </button>
                            <button 
                                onClick={() => addNotification('Contact feature coming soon!', 'info')}
                                className="bg-white border border-gray-300 text-gray-700 font-bold py-2 px-4 rounded-xl hover:bg-gray-50 transition-colors text-sm">
                                Contact
                            </button>
                            <Link to={`/track/${booking.id}`} className="bg-accent text-white font-bold py-2 px-6 rounded-xl hover:bg-blue-700 transition-colors text-sm">
                                Track Mechanic
                            </Link>
                        </div>
                    </div>
                </div>
              ))}
            </div>
          ) : (
             <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-200">
                <ZapIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-dark">No Active Bookings</h3>
                <p className="mt-1 text-sm text-gray-500">All your current service requests will appear here.</p>
             </div>
          )}
        </section>

        {/* Past Bookings */}
        <section className="mt-12">
          <h2 className="text-2xl font-bold text-dark mb-4">Booking History</h2>
           {pastBookings.length > 0 ? (
            <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Garage</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {pastBookings.map((booking, index) => (
                            <tr key={booking.id} className={index % 2 !== 0 ? 'bg-gray-50' : ''}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{new Date(booking.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark font-medium">{booking.issueType}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{booking.garage?.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{getStatusPill(booking.status)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-dark font-semibold">₹{booking.price}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                                    {booking.status === BookingStatus.COMPLETED && booking.paymentStatus === PaymentStatus.UNPAID && (
                                        <Link to={`/payment/${booking.id}`} className="bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-green-200 transition-colors">
                                            Pay Now
                                        </Link>
                                    )}
                                    {booking.status === BookingStatus.COMPLETED && booking.paymentStatus === PaymentStatus.PAID && !booking.review && (
                                        <button onClick={() => handleOpenReviewModal(booking)} className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-3 py-1 rounded-full hover:bg-yellow-200 transition-colors">
                                            Rate Service
                                        </button>
                                    )}
                                    {booking.status === BookingStatus.COMPLETED && booking.paymentStatus === PaymentStatus.PAID && booking.review && (
                                        <div className="flex items-center justify-end text-yellow-500 font-bold">
                                            {booking.review.rating} <StarIcon className="w-4 h-4 ml-1"/>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 text-center border-2 border-dashed border-gray-200">
                <ClockIcon className="mx-auto h-12 w-12 text-gray-300" />
                <h3 className="mt-4 text-lg font-medium text-dark">No Booking History</h3>
                <p className="mt-1 text-sm text-gray-500">Completed or cancelled services will be shown here.</p>
            </div>
          )}
        </section>

        <ReviewModal 
          isOpen={isReviewModalOpen}
          onClose={handleCloseReviewModal}
          onSubmit={handleReviewSubmit}
          booking={selectedBookingForReview}
        />
      </div>
    </div>
  );
};

export default UserDashboardPage;