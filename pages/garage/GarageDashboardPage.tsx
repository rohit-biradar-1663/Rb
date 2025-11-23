import React, { useState, useEffect, useCallback } from 'react';
import { Booking, BookingStatus, Garage, PaymentStatus, Review } from '../../types';
import { useNotification } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabaseClient';
import { ClockIcon, DollarSignIcon, StarIcon, WrenchIcon, CheckIcon, XIcon } from '../../components/Icons';

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

const GarageDashboardPage = () => {
    const { user } = useAuth();
    const { addNotification } = useNotification();
    const [garage, setGarage] = useState<Garage | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState("");

    const fetchGarageData = useCallback(async () => {
        if (!user) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            // 1. Get the garage profile linked to the logged-in user
            const { data: garageData, error: garageError } = await supabase
                .from('garages')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (garageError) {
                // Gracefully handle the "no rows found" error.
                if (garageError.code === 'PGRST116') {
                    addNotification('Garage profile not found for this user.', 'error');
                    setLoading(false); // Stop loading indicator
                    return; // Exit the function
                }
                // For any other database error, re-throw it to be caught by the main catch block.
                throw garageError;
            }

            if (!garageData) throw new Error("Garage profile data is missing.");
            setGarage(garageData as Garage);

            // 2. Get all bookings for this garage
            const { data: bookingsData, error: bookingsError } = await supabase
                .from('bookings')
                .select('*, user:profiles(*), review:reviews(*)')
                .eq('garage_id', garageData.id);

            if (bookingsError) throw bookingsError;
            
            const formattedBookings = bookingsData.map((b: any) => ({
              ...b,
              createdAt: new Date(b.created_at),
              updatedAt: new Date(b.updated_at),
              user: b.user ? { ...b.user, name: b.user.full_name } : { name: 'N/A' }, // map full_name
              review: b.review?.length > 0 ? b.review[0] : null,
            }));

            setBookings(formattedBookings as Booking[]);

        } catch (error: any) {
            addNotification(`Error loading dashboard: ${error.message}`, 'error');
        } finally {
            setLoading(false);
        }
    }, [user, addNotification]);

    useEffect(() => {
        fetchGarageData();
    }, [fetchGarageData]);

    const updateBookingStatus = async (bookingId: string, status: BookingStatus) => {
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ status: status, updated_at: new Date().toISOString() })
                .eq('id', bookingId);
            
            if (error) throw error;
            
            // Optimistic UI update
            const updatedBookings = bookings.map(b => 
                b.id === bookingId ? { ...b, status, updatedAt: new Date() } : b
            );
            setBookings(updatedBookings);
            addNotification(`Booking status updated to ${status}.`, 'success');

        } catch (error: any) {
            addNotification(`Failed to update status: ${error.message}`, 'error');
        }
    };

    const handlePayoutRequest = (balance: number) => {
        if (balance > 0) {
            addNotification(`Payout request for ₹${balance.toLocaleString()} submitted.`, 'success');
            // In a real app, this would create a payout record and update the balance
        } else {
            addNotification('No balance available for payout.', 'info');
        }
    };

    const handleResponseSubmit = async (reviewId: string) => {
        if (!user || !responseText.trim()) return;
        try {
            const { error } = await supabase
                .from('reviews')
                .update({ garage_response: responseText })
                .eq('id', reviewId);

            if (error) throw error;

            const updatedBookings = bookings.map(b => {
                if (b.review?.id === reviewId) {
                    return { ...b, review: { ...b.review, garageResponse: responseText } };
                }
                return b;
            });
            setBookings(updatedBookings as Booking[]);
            addNotification('Response submitted successfully!', 'success');
            setRespondingTo(null);
            setResponseText("");

        } catch (error: any) {
            addNotification(`Failed to submit response: ${error.message}`, 'error');
        }
    };
    
    // --- Real-time Data Calculations ---
    const completedAndPaidBookings = bookings.filter(b => b.status === BookingStatus.COMPLETED && b.paymentStatus === PaymentStatus.PAID);
    const totalEarnings = completedAndPaidBookings.reduce((sum, b) => sum + b.price, 0);

    const completedJobsCount = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

    const allReviews = bookings.map(b => b.review).filter((r): r is Review => !!r);
    const totalRating = allReviews.reduce((sum, r) => sum + r.rating, 0);
    const averageRatingValue = allReviews.length > 0 ? (totalRating / allReviews.length).toFixed(1) : 'N/A';

    const currentBalance = totalEarnings * (1 - (garage?.commission || 0));

    const kpiData = [
        { title: 'Total Earnings', value: `₹${totalEarnings.toLocaleString()}`, icon: <DollarSignIcon className="w-8 h-8"/> },
        { title: 'Completed Jobs', value: completedJobsCount, icon: <WrenchIcon className="w-8 h-8"/> },
        { title: 'Average Rating', value: `${averageRatingValue}`, icon: <StarIcon className="w-8 h-8"/> },
        { title: 'Current Balance', value: `₹${Math.round(currentBalance).toLocaleString()}`, icon: <DollarSignIcon className="w-8 h-8"/> },
    ];
    
    const newRequests = bookings.filter(b => b.status === BookingStatus.REQUESTED);
    const activeJobs = bookings.filter(b => [BookingStatus.ACCEPTED, BookingStatus.ON_WAY, BookingStatus.ARRIVED].includes(b.status));
    const jobHistory = bookings.filter(b => [BookingStatus.COMPLETED, BookingStatus.CANCELLED].includes(b.status)).sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const reviews = bookings
        .filter(booking => booking.review)
        .map(booking => ({
            ...(booking.review!),
            user: booking.user!,
            issueType: booking.issueType
        }))
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());


    if (loading) return (
      <div className="bg-gray-100 min-h-screen p-8 flex justify-center items-center">
        <p className="text-xl text-gray-600 animate-pulse">Loading dashboard...</p>
      </div>
    );

    if (!user || !garage) return (
      <div className="bg-gray-100 min-h-screen p-8 flex justify-center items-center">
        <p className="text-xl text-gray-600">Please log in as a Garage Partner to view this page.</p>
      </div>
    );
    
    return (
      <div className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-extrabold text-dark">Garage Dashboard</h1>
            <p className="mt-1 text-lg text-gray-500">Welcome back, {garage.name}!</p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <div key={index} className="bg-white p-6 rounded-2xl shadow-lg flex items-center justify-between">
                <div>
                  <h3 className="text-gray-500 text-sm font-medium uppercase">{kpi.title}</h3>
                  <p className="text-3xl font-bold text-dark mt-2">{kpi.value}</p>
                </div>
                <div className="bg-accent text-white p-4 rounded-full">
                  {kpi.icon}
                </div>
              </div>
            ))}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* New Requests */}
              <div>
                <h2 className="text-2xl font-bold text-dark mb-4">New Requests</h2>
                {newRequests.length > 0 ? (
                  <div className="space-y-4">
                    {newRequests.map(booking => (
                      <div key={booking.id} className="bg-white p-4 rounded-xl shadow-md transition-shadow hover:shadow-lg">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                          <div>
                            <p className="font-bold text-dark">{booking.issueType}</p>
                            <p className="text-sm text-gray-600">From: {booking.user?.name}</p>
                          </div>
                          <div className="flex items-center space-x-2 mt-2 sm:mt-0">
                            <button onClick={() => updateBookingStatus(booking.id, BookingStatus.ACCEPTED)} className="p-2 bg-green-100 text-green-700 rounded-full hover:bg-green-200 transition-colors" aria-label="Accept Job">
                                <CheckIcon className="w-5 h-5"/>
                            </button>
                            <button onClick={() => updateBookingStatus(booking.id, BookingStatus.CANCELLED)} className="p-2 bg-red-100 text-red-700 rounded-full hover:bg-red-200 transition-colors" aria-label="Decline Job">
                                <XIcon className="w-5 h-5"/>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : <div className="text-gray-500 bg-white p-6 rounded-xl shadow-md text-center">No new job requests at the moment.</div>}
              </div>

              {/* Active Jobs */}
              <div>
                <h2 className="text-2xl font-bold text-dark mb-4">Active Jobs</h2>
                {activeJobs.length > 0 ? (
                  <div className="bg-white rounded-xl shadow-md p-4 space-y-4">
                    {activeJobs.map(booking => (
                        <div key={booking.id} className="py-2">
                            <p className="font-bold text-dark">{booking.issueType} for {booking.user?.name}</p>
                            <div className="flex items-center justify-between mt-2">
                                {getStatusPill(booking.status)}
                                <div className="space-x-2">
                                    {booking.status === BookingStatus.ACCEPTED && <button onClick={() => updateBookingStatus(booking.id, BookingStatus.ON_WAY)} className="text-xs font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full hover:bg-blue-200 transition-colors">Mark On Way</button>}
                                    {booking.status === BookingStatus.ON_WAY && <button onClick={() => updateBookingStatus(booking.id, BookingStatus.ARRIVED)} className="text-xs font-semibold bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">Mark Arrived</button>}
                                    {booking.status === BookingStatus.ARRIVED && <button onClick={() => updateBookingStatus(booking.id, BookingStatus.COMPLETED)} className="text-xs font-semibold bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition-colors">Complete Job</button>}
                                </div>
                            </div>
                        </div>
                    ))}
                  </div>
                ) : <div className="text-gray-500 bg-white p-6 rounded-xl shadow-md text-center">No active jobs right now.</div>}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-8">
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-dark mb-4">Quick Actions</h2>
                    <button onClick={() => handlePayoutRequest(Math.round(currentBalance))} className="w-full bg-primary text-dark font-bold py-3 px-6 rounded-2xl hover:bg-yellow-500 transition-colors duration-300">
                        Request Payout (₹{Math.round(currentBalance).toLocaleString()})
                    </button>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-dark mb-4">Customer Reviews</h2>
                    {reviews.length > 0 ? (
                        <ul className="space-y-4">
                            {reviews.slice(0, 3).map(review => (
                                <li key={review.id} className="border-b border-gray-100 pb-3 last:border-b-0 last:pb-0">
                                    <div className="flex items-center mb-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <StarIcon key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} filled={i < review.rating}/>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-700 italic">"{review.comment}"</p>
                                    <p className="text-xs text-gray-500 mt-2 text-right">- {review.user.name} for {review.issueType}</p>
                                    
                                    {review.garageResponse ? (
                                        <div className="mt-3 ml-4 p-2 bg-gray-50 rounded-md border-l-2 border-primary">
                                            <p className="text-xs font-bold text-dark">Your Response:</p>
                                            <p className="text-xs text-gray-600 italic">{review.garageResponse}</p>
                                        </div>
                                    ) : (
                                        <div className="mt-3 text-right">
                                            {respondingTo === review.id ? (
                                                <div className="mt-2 text-left">
                                                    <textarea 
                                                        value={responseText} 
                                                        onChange={(e) => setResponseText(e.target.value)} 
                                                        rows={2} 
                                                        className="w-full text-xs p-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
                                                        placeholder="Write a public response..."
                                                    />
                                                    <div className="flex justify-end space-x-2 mt-1">
                                                        <button onClick={() => setRespondingTo(null)} className="text-xs font-semibold text-gray-600 px-2 py-1 rounded-md hover:bg-gray-100">Cancel</button>
                                                        <button onClick={() => handleResponseSubmit(review.id)} className="text-xs font-semibold bg-accent text-white px-3 py-1 rounded-md hover:bg-blue-700">Submit</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                 <button onClick={() => { setRespondingTo(review.id); setResponseText(''); }} className="text-xs font-semibold text-accent hover:text-blue-700">
                                                    Respond
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No reviews yet.</p>
                    )}
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg">
                    <h2 className="text-2xl font-bold text-dark mb-4">Job History</h2>
                    <ul className="divide-y divide-gray-200">
                        {jobHistory.length > 0 ? jobHistory.slice(0, 5).map(job => (
                            <li key={job.id} className="py-3">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm font-medium text-dark">{job.issueType}</p>
                                    {getStatusPill(job.status)}
                                </div>
                                <p className="text-xs text-gray-500">on {new Date(job.updatedAt).toLocaleDateString()}</p>
                            </li>
                        )) : <p className="text-sm text-gray-500 text-center py-4">No completed jobs yet.</p>}
                    </ul>
                </div>
            </div>
          </div>

        </div>
      </div>
    );
};

export default GarageDashboardPage;