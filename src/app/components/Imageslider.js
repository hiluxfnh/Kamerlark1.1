'use client';
import { useState, useEffect } from "react";

const slideStyles = {
  position: "relative",
  width: "100%",
  height: "100%",
  borderRadius: "10px",
  backgroundSize: "cover",
  backgroundPosition: "center",
  overflow: "hidden", // Ensure text doesn't overflow outside the slide
};

const textOverlayStyles = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  color: "#fff",
  fontFamily: "Arial, sans-serif",
  textAlign: "center",
};

const titleStyle = {
  fontSize: "3rem",
  fontWeight: "bold",
  margin: "0",
  color: "#fff",
 
};

const subtitleStyle = {
  fontSize: "1.2rem",
  fontWeight: "normal",
  margin: "5px 0",
};

const rightArrowStyles = {
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  right: "32px",
  fontSize: "45px",
  color: "#fff",
  zIndex: 1,
  cursor: "pointer",
};

const leftArrowStyles = {
  position: "absolute",
  top: "50%",
  transform: "translate(0, -50%)",
  left: "32px",
  fontSize: "45px",
  color: "#fff",
  zIndex: 1,
  cursor: "pointer",
};

const sliderStyles = {
  position: "relative",
  height: "100%",
};

const dashesContainerStyles = {
  display: "flex",
  justifyContent: "center",
  marginTop: "15px", // Add some space between text and navigation dots
};

const dashStyle = {
    width: "9px",
    height: "9px",
    borderRadius: "50%",
    margin: "0 5px",
    cursor: "pointer",
    backgroundColor: "#999",

};

const activeDashStyle = {
  ...dashStyle,
  color: "#fff",
  fontWeight: "bold",
  backgroundColor: "#000",

};

const ImageSlider = ({ slides }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    let intervalId;

    if (autoScroll) {
      intervalId = setInterval(() => {
        const isLastSlide = currentIndex === slides.length - 1;
        const newIndex = isLastSlide ? 0 : currentIndex + 1;
        setCurrentIndex(newIndex);
      }, 3000);
    }

    return () => clearInterval(intervalId);
  }, [autoScroll, currentIndex, slides]);

  const stopAutoScroll = () => {
    setAutoScroll(false);
  };

  const startAutoScroll = () => {
    setAutoScroll(true);
  };

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

  const goToSlide = (slideIndex) => {
    setCurrentIndex(slideIndex);
  };

  const slideStylesWidthBackground = {
    ...slideStyles,
    backgroundImage: `url(${slides[currentIndex].url})`,
  };

  return (
    <div
      style={sliderStyles}
      onMouseEnter={stopAutoScroll}
      onMouseLeave={startAutoScroll}
    >
      <div>
        <div onClick={goToPrevious} style={leftArrowStyles}>
          ❰
        </div>
        <div onClick={goToNext} style={rightArrowStyles}>
          ❱
        </div>
      </div>
      <div style={slideStylesWidthBackground}>
        <div style={textOverlayStyles}>
          <p style={titleStyle}>{slides[currentIndex].title}</p>
          <p style={subtitleStyle}>{slides[currentIndex].alt}</p>
        </div>
      </div>
      <div style={dashesContainerStyles}>
        {slides.map((slide, slideIndex) => (
          <div
            style={currentIndex === slideIndex ? activeDashStyle : dashStyle}
            key={slideIndex}
            onClick={() => goToSlide(slideIndex)}
          >
            
          </div>
        ))}
      </div>
    </div>
  );
};

export default ImageSlider;