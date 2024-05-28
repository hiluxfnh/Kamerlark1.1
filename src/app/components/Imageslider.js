import React, { useState, useEffect } from 'react';
import styles from '../styles/slider.module.css';

const ImageSlider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? slides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === slides.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  useEffect(() => {
    const timer = setInterval(goToNext, 5000); // Change slide every 5 seconds
    return () => clearInterval(timer); // Clean up the interval on unmount
  }, [currentIndex]);

  return (
    <div className={styles.slider}>
      <div className={styles.arrowLeft} onClick={goToPrevious}>
        ❰
      </div>
      <div className={styles.slide} style={{ backgroundImage: `url(${slides[currentIndex].url})` }}>
        <div className={styles.content}>
          <h2>{slides[currentIndex].title}</h2>
          <p>{slides[currentIndex].description}</p>
        </div>
      </div>
      <div className={styles.arrowRight} onClick={goToNext}>
        ❱
      </div>
    </div>
  );
};

export default ImageSlider;
