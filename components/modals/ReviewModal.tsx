import React, { useState } from 'react';
import { Booking } from '../../types';
import StarRating from '../ui/StarRating';

interface ReviewModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingId: string, rating: number, comment: string) => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ booking, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  if (!isOpen || !booking) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rating > 0) {
      onSubmit(booking.id, rating, comment);
      setRating(0);
      setComment('');
    } else {
      alert("Please provide a rating.");
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-dark mb-2">Leave a Review</h2>
        <p className="text-gray-600 mb-4">How was your experience with <span className="font-semibold">{booking.garage?.name}</span> for the <span className="font-semibold">{booking.issueType}</span> service?</p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6 flex justify-center">
            <StarRating rating={rating} onRatingChange={setRating} />
          </div>
          
          <div className="mb-6">
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Add a comment (optional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="block w-full shadow-sm sm:text-sm focus:ring-accent focus:border-accent border border-gray-300 rounded-md py-2 px-3"
              placeholder="Tell us more about your experience..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-200 text-dark font-bold py-2 px-6 rounded-2xl hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-primary text-dark font-bold py-2 px-6 rounded-2xl hover:bg-yellow-500 transition-colors"
            >
              Submit Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;
