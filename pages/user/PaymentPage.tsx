import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotification } from '../../context/NotificationContext';
import { Booking, PaymentStatus } from '../../types';
import { CreditCardIcon, WrenchIcon, ZapIcon } from '../../components/Icons';
import { supabase } from '../../lib/supabaseClient';

const PaymentPage = () => {
    const { bookingId } = useParams<{ bookingId: string }>();
    const navigate = useNavigate();
    const { addNotification } = useNotification();

    const [booking, setBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentProcessing, setPaymentProcessing] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            if (!bookingId) {
                addNotification('No booking ID provided.', 'error');
                navigate('/dashboard');
                return;
            }
            try {
                const { data, error } = await supabase
                    .from('bookings')
                    .select('*, garage:garages(*)')
                    .eq('id', bookingId)
                    .single();

                if (error) throw error;
                if (data) {
                    setBooking(data as Booking);
                } else {
                    throw new Error('Booking not found.');
                }
            } catch (error: any) {
                addNotification(`Error fetching booking: ${error.message}`, 'error');
                navigate('/dashboard');
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, navigate, addNotification]);

    const handlePayment = async () => {
        setPaymentProcessing(true);
        // Simulate payment API call
        try {
            const { error } = await supabase
                .from('bookings')
                .update({ payment_status: PaymentStatus.PAID, updated_at: new Date() })
                .eq('id', bookingId);
            
            if (error) throw error;
            
            addNotification('Payment successful!', 'success');
            navigate(`/payment/success/${bookingId}`);

        } catch(error: any) {
            addNotification(`Payment failed: ${error.message}`, 'error');
        } finally {
            setPaymentProcessing(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p className="animate-pulse">Loading booking details...</p></div>;
    }
    
    if (!booking) {
        return <div className="min-h-screen bg-gray-100 flex items-center justify-center"><p>Could not load booking details.</p></div>;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-2xl">
                <div>
                    <ZapIcon className="mx-auto h-12 w-auto text-primary" />
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-dark">
                        Complete Your Payment
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Securely pay for your ZippKar service.
                    </p>
                </div>
                
                <div className="rounded-lg bg-gray-50 p-6 border border-gray-200">
                    <h3 className="text-lg font-bold text-dark">Order Summary</h3>
                    <div className="mt-4 space-y-3">
                        <div className="flex justify-between items-center text-gray-700">
                            <span className="flex items-center"><WrenchIcon className="w-4 h-4 mr-2 text-gray-400" /> Service Type</span>
                            <span className="font-medium">{booking.issueType}</span>
                        </div>
                         <div className="flex justify-between items-center text-gray-700">
                            <span>Garage</span>
                            <span className="font-medium">{booking.garage?.name}</span>
                        </div>
                        <div className="border-t border-gray-200 my-2"></div>
                        <div className="flex justify-between items-center text-dark">
                            <span className="text-xl font-bold">Total Amount</span>
                            <span className="text-2xl font-extrabold">₹{booking.price}</span>
                        </div>
                    </div>
                </div>

                {/* Mock Payment Form */}
                <div className="mt-8">
                     <h3 className="text-lg font-bold text-dark mb-4">Payment Method</h3>
                     <div className="border border-accent bg-blue-50 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center">
                           <CreditCardIcon className="w-8 h-8 text-accent mr-4"/>
                           <div>
                                <p className="font-bold">Credit / Debit Card</p>
                                <p className="text-sm text-gray-600">**** **** **** 1234</p>
                           </div>
                        </div>
                        <a href="#" className="text-sm font-medium text-accent hover:text-blue-700">Change</a>
                     </div>
                </div>

                <div className="mt-6">
                    <button
                        onClick={handlePayment}
                        disabled={paymentProcessing}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-lg font-bold rounded-2xl text-dark bg-primary hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                    >
                        {paymentProcessing ? 'Processing...' : `Pay ₹${booking.price}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;