import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './PhotoGallery.css';
import { useNavigate } from 'react-router-dom';

const PhotoGallery = () => {
const [photos, setPhotos] = useState([]);
const [loading, setLoading] = useState(true);
const [currentIndex, setCurrentIndex] = useState(0);
const [isAutoPlaying, setIsAutoPlaying] = useState(true);
const navigate = useNavigate();

useEffect(() => {
fetchPhotos();
}, []);

useEffect(() => {
if (isAutoPlaying && photos.length > 0) {
const interval = setInterval(() => {
setCurrentIndex(prevIndex =>
prevIndex === photos.length - 1 ? 0 : prevIndex + 1
);
}, 3000); // Auto-scroll every 3 seconds
return () => clearInterval(interval);
}
}, [isAutoPlaying, photos.length]);

const fetchPhotos = async () => {
try {
const response = await axios.get("https://newcrafts.onrender.com//viewphotos");
setPhotos(response.data);
setLoading(false);
} catch (error) {
console.error('Error fetching photos:', error);
setLoading(false);
}
};

const goToNext = () => {
setCurrentIndex(prevIndex =>
prevIndex === photos.length - 1 ? 0 : prevIndex + 1
);
};

const goToPrevious = () => {
setCurrentIndex(prevIndex =>
prevIndex === 0 ? photos.length - 1 : prevIndex - 1
);
};

const goToSlide = (index) => {
setCurrentIndex(index);
};

const toggleAutoPlay = () => {
setIsAutoPlaying(!isAutoPlaying);
};

const handleViewAllPhotos = () => {
navigate('/viewgallery');
};

if (loading) {
return (
<div className="photo-gallery-container">
<div className="gallery-loading">
<div className="loading-spinner"></div>
<p>Loading photos...</p>
</div>
</div>
);
}

if (photos.length === 0) {
return null; // Don't show anything if no photos
}

// Show only first 5 photos for desktop, all for mobile carousel
const displayPhotos = photos.slice(0, 5);
const visiblePhotos = window.innerWidth <= 768 ? photos : displayPhotos;

return (
  <div className="photo-gallery-container">
    <div className="gallery-header">
      <h2>Photo Gallery</h2>
      <p>Discover our latest moments</p>
    </div>

    {/* Desktop View - Grid with 5 photos */}
    <div className="desktop-gallery">
      <div className="photos-grid-home">
        {displayPhotos.map((photo, index) => (
          <div
            key={photo.id}
            className={`photo-item ${index === 0 ? "featured" : ""}`}
            onClick={handleViewAllPhotos}
          >
            <img
              src={`https://newcrafts.onrender.com/${photo.image_path}`}
              alt={photo.original_name || "Photo"}
              loading="lazy"
            />
            <div className="photo-overlay">
              <h4>{photo.original_name || "Untitled"}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Mobile View - Carousel */}
    <div className="mobile-gallery">
      <div className="carousel-container">
        <div className="carousel-header">
          <div className="carousel-controls">
            <button
              onClick={toggleAutoPlay}
              className={`auto-play-btn ${isAutoPlaying ? "active" : ""}`}
            >
              {isAutoPlaying ? "⏸️" : "▶️"}
            </button>
            <span className="photo-counter">
              {currentIndex + 1} / {visiblePhotos.length}
            </span>
          </div>
        </div>

        <div className="carousel-wrapper">
          <button
            onClick={goToPrevious}
            className="carousel-btn prev-btn"
            disabled={visiblePhotos.length <= 1}
          >
            ‹
          </button>

          <div className="carousel-track">
            <div
              className="carousel-slides"
              style={{
                transform: `translateX(-${currentIndex * 100}%)`,
                transition: "transform 0.5s ease-in-out",
              }}
            >
              {visiblePhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="carousel-slide"
                  onClick={handleViewAllPhotos}
                >
                  <img
                    src={`https://newcrafts.onrender.com/${photo.image_path}`}
                    alt={photo.original_name || "Photo"}
                  />
                  <div className="slide-info">
                    <h4>{photo.original_name || "Untitled"}</h4>
                    <p>{new Date(photo.upload_date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={goToNext}
            className="carousel-btn next-btn"
            disabled={visiblePhotos.length <= 1}
          >
            ›
          </button>
        </div>

        {/* Dots indicator */}
        <div className="carousel-dots">
          {visiblePhotos.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`dot ${index === currentIndex ? "active" : ""}`}
            />
          ))}
        </div>
      </div>
    </div>

    {/* View All Photos Link */}
    {photos.length > 5 && (
      <div className="view-all-section">
        <button className="view-all-btn" onClick={handleViewAllPhotos}>
          View All Photos ({photos.length})
        </button>
      </div>
    )}
  </div>
);
};

export default PhotoGallery;
