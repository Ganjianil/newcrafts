import React from 'react';

const DiscountBadge = ({ originalPrice, currentPrice }) => {
  if (!originalPrice || !currentPrice || originalPrice <= currentPrice) {
    return null;
  }

  const discountPercentage = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  return (
    <div className="discount-badge">
      -{discountPercentage}% OFF
    </div>
  );
};

export default DiscountBadge;