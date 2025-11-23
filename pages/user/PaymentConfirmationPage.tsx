import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Booking } from '../../types';
import { CheckCircleIcon } from '../../components/Icons';
import { supabase } from '../../lib/supabaseClient';

const PaymentConfirmationPage = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                setLoading(false);
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*')
                    .eq('id', bookingId)
                    .single();
                
                if (error) throw error;
                setBooking(data as Booking);
            } catch (error) {
                console.error("Failed to fetch booking details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    if(loading) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <p className="animate-pulse">Loading confirmation...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-lg w-full bg-white p-10 rounded-2xl shadow-2xl text-center">
                <CheckCircleIcon className="mx-auto h-20 w-20 text-green-500" />
                <h1 className="mt-6 text-3xl font-extrabold text-dark">
                    Payment Successful!
                </h1>
                <p className="mt-2 text-lg text-gray-600">
                    Thank you for using ZippKar. Your payment has been processed.
                </p>
                
                {booking && (
                    <div className="mt-8 text-left rounded-lg bg-gray-50 p-6 border border-gray-200">
                        <h3 className="text-lg font-bold text-dark">Receipt Details</h3>
                        <div className="mt-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Booking ID:</span>
                                <span className="font-mono text-sm">{booking.id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Service:</span>
                                <span className="font-medium">{booking.issueType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Date Paid:</span>
                                <span className="font-medium">{new Date(booking.updatedAt).toLocaleString()}</span>
                            </div>
                            <div className="border-t border-gray-200 my-2"></div>
                            <div className="flex justify-between text-dark font-bold text-xl">
                                <span>Total Paid:</span>
                                <span>₹{booking.price}</span>
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-10">
                    <Link
                        to="/dashboard"
                        className="inline-block w-full max-w-xs bg-accent text-white font-bold py-3 px-6 rounded-2xl hover:bg-blue-700 transition-all duration-300"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PaymentConfirmationPage;