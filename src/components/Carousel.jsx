import React, { useState, useEffect, useRef } from 'react';
import { PRODUCTS, CAROUSEL_SLIDES } from '../data/products';

const Carousel = ({ onProductClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const intervalRef = useRef(null);

  const slides = CAROUSEL_SLIDES.map(slide => ({ ...slide, product: PRODUCTS.find(p => p.id === slide.productId) }));

  useEffect(() => {
    if (isPlaying && slides.length) {
      intervalRef.current = setInterval(() => setCurrentIndex(prev => (prev + 1) % slides.length), 5000);
    }
    return () => clearInterval(intervalRef.current);
  }, [isPlaying, slides.length]);

  const goToSlide = (index) => {
    setCurrentIndex((index + slides.length) % slides.length);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      if (isPlaying) intervalRef.current = setInterval(() => setCurrentIndex(prev => (prev + 1) % slides.length), 5000);
    }
  };

  const formatPrice = (value) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  if (!slides.length) return null;

  return (
    <div className="carousel" onMouseEnter={() => setIsPlaying(false)} onMouseLeave={() => setIsPlaying(true)}>
      <div className="carousel-track" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
        {slides.map((slide, idx) => (
          <div key={idx} className="carousel-slide">
            <div className="slide-bg" style={{ background: `linear-gradient(135deg, ${slide.colorA}, ${slide.colorB})` }}></div>
            <div className="slide-content-wrapper">
              <div className="slide-content">
                <div className="slide-tag">{slide.tag}</div>
                <h2>{slide.product?.name}</h2>
                <p>{slide.product?.desc.substring(0, 100)}...</p>
                <div className="slide-price">a partir de {formatPrice(slide.product?.price || 0)}</div>
                <button className="btn-primary" onClick={() => onProductClick(slide.productId)}>Comprar Agora →</button>
              </div>
              <div className="slide-image">
                <img src={slide.product?.image} alt={slide.product?.name} onError={(e) => e.target.src = 'https://placehold.co/400x400/1a1a1a/e8ff00?text=📦'} />
              </div>
            </div>
          </div>
        ))}
      </div>
      <button className="carousel-btn prev" onClick={() => goToSlide(currentIndex - 1)}>❮</button>
      <button className="carousel-btn next" onClick={() => goToSlide(currentIndex + 1)}>❯</button>
      <div className="carousel-dots">
        {slides.map((_, idx) => (
          <button key={idx} className={`dot ${idx === currentIndex ? 'active' : ''}`} onClick={() => goToSlide(idx)} />
        ))}
      </div>
    </div>
  );
};

export default Carousel;