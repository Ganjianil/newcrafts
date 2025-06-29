import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Photos.css';

const Photos = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [deletingPhotos, setDeletingPhotos] = useState(new Set());
  const [clearingAll, setClearingAll] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState(null);

  useEffect(() => {
    fetchPhotos();
  }, []);

  const fetchPhotos = async () => {
    try {
      const response = await axios.get('http://localhost:10406/photos');
      setPhotos(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(urls);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      alert('Please select at least one photo to upload');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    
    selectedFiles.forEach((file) => {
      formData.append('photos', file);
    });

    try {
      await axios.post('http://localhost:10406/photos', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      alert('Photos uploaded successfully!');
      setSelectedFiles([]);
      setPreviewUrls([]);
      fetchPhotos();
      
      // Reset file input
      const fileInput = document.getElementById('photo-input');
      if (fileInput) fileInput.value = '';
      
    } catch (error) {
      console.error('Error uploading photos:', error);
      alert('Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    setDeletingPhotos(prev => new Set(prev).add(photoId));
    
    try {
      await axios.delete(`http://localhost:10406/photos/${photoId}`);
      setPhotos(prevPhotos => prevPhotos.filter(photo => photo.id !== photoId));
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo');
    } finally {
      setDeletingPhotos(prev => {
        const newSet = new Set(prev);
        newSet.delete(photoId);
        return newSet;
      });
    }
  };

  const handleDeleteAllPhotos = async () => {
    if (!window.confirm('Are you sure you want to delete ALL photos? This action cannot be undone.')) {
      return;
    }

    setClearingAll(true);
    
    try {
      await axios.delete('http://localhost:10406/photos');
      setPhotos([]);
      alert('All photos deleted successfully!');
    } catch (error) {
      console.error('Error deleting all photos:', error);
      alert('Failed to delete all photos');
    } finally {
      setClearingAll(false);
    }
  };

  const clearPreviews = () => {
    setSelectedFiles([]);
    setPreviewUrls([]);
    const fileInput = document.getElementById('photo-input');
    if (fileInput) fileInput.value = '';
  };

  const openPhotoModal = (photo) => {
    setSelectedPhoto(photo);
  };

  const closePhotoModal = () => {
    setSelectedPhoto(null);
  };

  if (loading) {
    return (
      <div className="photos-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading photos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="photos-container">
      <div className="photos-header">
        <h2>Photo Gallery Management</h2>
        <p>Upload, view, and manage your photo gallery</p>
      </div>

      {/* Upload Section */}
      <div className="upload-section">
        <h3>Upload New Photos</h3>
        <div className="upload-area">
          <input
            type="file"
            id="photo-input"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="file-input"
          />
          <label htmlFor="photo-input" className="file-input-label">
            <span className="upload-icon">📷</span>
            <span>Choose Photos</span>
          </label>
          
          {selectedFiles.length > 0 && (
            <div className="selected-files-info">
              <p>{selectedFiles.length} photo(s) selected</p>
            </div>
          )}
        </div>

        {/* Preview Section */}
        {previewUrls.length > 0 && (
          <div className="preview-section">
            <h4>Preview</h4>
            <div className="preview-grid">
              {previewUrls.map((url, index) => (
                <div key={index} className="preview-item">
                  <img src={url} alt={`Preview ${index + 1}`} />
                  <div className="preview-info">
                    <span>{selectedFiles[index].name}</span>
                    <span>{(selectedFiles[index].size / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="preview-actions">
              <button onClick={clearPreviews} className="clear-btn">
                Clear Selection
              </button>
              <button 
                onClick={handleUpload} 
                disabled={uploading}
                className="upload-btn"
              >
                {uploading ? (
                  <>
                    <span className="loading-spinner small"></span>
                    Uploading...
                  </>
                ) : (
                  'Upload Photos'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Photos Gallery */}
      <div className="gallery-section">
        <div className="gallery-header">
          <h3>Photo Gallery ({photos.length} photos)</h3>
          {photos.length > 0 && (
            <button
              onClick={handleDeleteAllPhotos}
              disabled={clearingAll}
              className="delete-all-btn"
            >
              {clearingAll ? 'Deleting...' : 'Delete All Photos'}
            </button>
          )}
        </div>

        {photos.length === 0 ? (
          <div className="empty-gallery">
            <div className="empty-icon">📷</div>
            <h4>No photos uploaded yet</h4>
            <p>Upload your first photos using the form above</p>
          </div>
        ) : (
          <div className="photos-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="photo-card">
                <div className="photo-image" onClick={() => openPhotoModal(photo)}>
                  <img
                    src={`http://localhost:10406/${photo.image_path}`}
                    alt={photo.original_name || 'Photo'}
                    loading="lazy"
                  />
                  <div className="photo-overlay">
                    <span className="view-icon">👁️</span>
                  </div>
                </div>
                
                <div className="photo-info">
                  <div className="photo-details">
                    <h4>{photo.original_name || 'Untitled'}</h4>
                    <p className="upload-date">
                      {new Date(photo.upload_date).toLocaleDateString()}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => handleDeletePhoto(photo.id)}
                    disabled={deletingPhotos.has(photo.id)}
                    className="delete-photo-btn"
                  >
                    {deletingPhotos.has(photo.id) ? '⏳' : '🗑️'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Photo Modal */}
      {selectedPhoto && (
        <div className="photo-modal" onClick={closePhotoModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closePhotoModal}>
              ✕
            </button>
            <img
              src={`http://localhost:10406/${selectedPhoto.image_path}`}
              alt={selectedPhoto.original_name || 'Photo'}
            />
            <div className="modal-info">
              <h3>{selectedPhoto.original_name || 'Untitled'}</h3>
              <p>Uploaded: {new Date(selectedPhoto.upload_date).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Photos;
