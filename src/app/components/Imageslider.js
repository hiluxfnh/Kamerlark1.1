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
      <div className={styles.slide} style={{ backgroundImage: `url(${slides[currentIndex].url})` }}>
        <div className={`${styles.content} w-256`}>
          <h2 className='text-4xl font-bold'>{slides[currentIndex].title}</h2>
          <p className='text-base my-4 w-1/2'>{slides[currentIndex].description}</p>
          <div className='mt-10 relative'>
          <input type="text" placeholder="Search Location for accommodation..." className="w-256 p-3 border border-gray-300 rounded-lg outline-none" />
          <button className='p-2 px-5 rounded-md bg-cyan-950 text-white shadow-lg font-sans absolute right-1 top-1'>EXPLORE NOW</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageSlider;
