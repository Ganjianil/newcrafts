import React from "react";
import "./Location.css";

const Location = () => {
  return (
    <section className="location-section">
      <div className="container">
        <h2>Our Location</h2>
        <div className="location-content">
          <div className="location-info">
            <h3>Visit Our Store</h3>
            <div className="address">
              <p>
                <strong>Nadhini Brass and Metals</strong>
              </p>
              <p>
                Chilkanagar, Near Uppal Cricket Stadium, Uppal shop no:21-113/4,
                Hyderabad, Telangana
              </p>
              <p>Uppal, Hyderabad</p>
              <p>Telangana - 500036</p>
              <p>India</p>
            </div>
            <div className="contact-info">
              <p>
                <strong>Phone:</strong> +91 8099624478
              </p>
              <p>
                <strong>Email:</strong> danojusreekanth@gmail.com
              </p>
            </div>
            <div className="business-hours">
              <h4>Business Hours</h4>
              <p>Monday - Saturday: 9:00 AM - 7:00 PM</p>
              <p>Sunday: 10:00 AM - 5:00 PM</p>
            </div>
          </div>
          <div className="map-placeholder">
            <div className="map-container">
              <iframe
                title="Nadhini Brass and Metals Map"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3806.537916153234!2d78.567!3d17.423!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb99e3f3f3f3f3%3A0x123456789abcdef!2sChilkanagar%2C%20Uppal%2C%20Hyderabad%2C%20Telangana%20500036!5e0!3m2!1sen!2sin!4v1234567890"
                width="100%"
                height="300"
                style={{ border: 0, borderRadius: "8px", marginTop: "1rem" }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>

              <p>Uppal, Hyderabad</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Location;
