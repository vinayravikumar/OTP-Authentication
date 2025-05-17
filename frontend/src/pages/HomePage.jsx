import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './HomePage.css';

const carouselImages = [
  {
    src: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    caption: 'Secure & Fast Authentication',
  },
  {
    src: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=800&q=80',
    caption: 'Easy OTP Verification',
  },
  {
    src: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=800&q=80',
    caption: 'Modern User Experience',
  },
];

const cards = [
  {
    icon: '🔒',
    title: 'Security',
    desc: 'Your data is protected with industry-leading security standards.'
  },
  {
    icon: '⚡',
    title: 'Speed',
    desc: 'Instant OTP delivery and verification for a seamless experience.'
  },
  {
    icon: '💡',
    title: 'Simplicity',
    desc: 'A clean, intuitive interface that anyone can use.'
  },
];

const HomePage = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Protect the page: redirect if not authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % carouselImages.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-root">
      <nav className="navbar">
        <div className="navbar-content">
          <div className="navbar-logo">OTP Auth App</div>
          <div className="navbar-links">
            <a href="/home">Home</a>
            <a href="#features">Features</a>
            <a href="#contact">Contact</a>
          </div>
        </div>
      </nav>
      <div className="welcome-message">
        <h1>Welcome to OTP Auth App!</h1>
        <p>Your secure and simple authentication solution.</p>
      </div>
      <div className="carousel">
        {carouselImages.map((img, idx) => (
          <div
            className={`carousel-slide${idx === current ? ' active' : ''}`}
            key={idx}
            style={{ backgroundImage: `url(${img.src})` }}
          >
            <div className="carousel-caption">{img.caption}</div>
          </div>
        ))}
        <div className="carousel-dots">
          {carouselImages.map((_, idx) => (
            <span
              key={idx}
              className={idx === current ? 'dot active' : 'dot'}
              onClick={() => setCurrent(idx)}
            />
          ))}
        </div>
      </div>
      <div className="cards-section" id="features">
        {cards.map((card, idx) => (
          <div className="feature-card" key={idx}>
            <div className="card-icon">{card.icon}</div>
            <div className="card-title">{card.title}</div>
            <div className="card-desc">{card.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HomePage; 