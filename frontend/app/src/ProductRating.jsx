import React from "react";
import "./ProductRating.css";

const ProductRating = ({ rating = 0, reviews = 0, showReviews = true }) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < fullStars) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>
      );
    } else if (i === fullStars && hasHalfStar) {
      stars.push(
        <span key={i} className="star half">
          ★
        </span>
      );
    } else {
      stars.push(
        <span key={i} className="star empty">
          ★
        </span>
      );
    }
  }

  return (
    <div className="product-rating">
      <div className="stars">{stars}</div>
      {showReviews && (
        <span className="reviews-count">
          {reviews} {reviews === 1 ? "review" : "reviews"}
        </span>
      )}
    </div>
  );
};

export default ProductRating;
