import React, { useState } from 'react';
import { StarIcon } from '../Icons';

interface StarRatingProps {
  count?: number;
  rating: number;
  onRatingChange?: (rating: number) => void;
  color?: {
    filled: string;
    unfilled: string;
  };
  isInteractive?: boolean;
}

const StarRating: React.FC<StarRatingProps> = ({
  count = 5,
  rating,
  onRatingChange,
  color = { filled: 'text-yellow-400', unfilled: 'text-gray-300' },
  isInteractive = true,
}) => {
  const [hoverRating, setHoverRating] = useState(0);

  const handleMouseEnter = (index: number) => {
    if (isInteractive) setHoverRating(index);
  };

  const handleMouseLeave = () => {
    if (isInteractive) setHoverRating(0);
  };

  const handleClick = (index: number) => {
    if (isInteractive && onRatingChange) onRatingChange(index);
  };

  const stars = Array.from({ length: count }, (_, i) => i + 1);

  return (
    <div className={`flex items-center ${!isInteractive ? 'cursor-default' : ''}`}>
      {stars.map((starIndex) => {
        const isFilled = (hoverRating || rating) >= starIndex;
        return (
          <div
            key={starIndex}
            className={`${isInteractive ? 'cursor-pointer transform transition-transform hover:scale-125' : ''}`}
            onMouseEnter={() => handleMouseEnter(starIndex)}
            onMouseLeave={handleMouseLeave}
            onClick={() => handleClick(starIndex)}
          >
            <StarIcon className={`w-8 h-8 ${isFilled ? color.filled : color.unfilled}`} filled={isFilled} />
          </div>
        );
      })}
    </div>
  );
};

export default StarRating;
