import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

  return (
    <div className="flex items-center gap-1 bg-white bg-opacity-90 px-2 py-1 rounded">
      <div className="flex text-yellow-400">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} size={14} />
        ))}
        
        {hasHalfStar && <FaStarHalfAlt size={14} />}
        
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} size={14} />
        ))}
      </div>
      <span className="text-xs text-gray-600 ml-1">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default RatingStars;