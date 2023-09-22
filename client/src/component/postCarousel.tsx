import React, { useState } from 'react';

interface PostCarouselProps {
    medias: string[]; 
}

const PostCarousel: React.FC<PostCarouselProps> = ({ medias }) => {
    if (!medias || medias.length === 0) {
      return <div></div>;
    }

    if (medias.length === 1) {
    return medias[0].endsWith('.mkv') || medias[0].endsWith('.mp4') ? (
      <video controls width="100" height="100">
        <source src={medias[0]} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    ) : (
      <img
        src={medias[0]}
        alt={`Media 1`}
        style={{ width: '100%', height: '100%', display: 'block' }}
      />
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  const handlePrev = () => {
    setCurrentIndex(prevIndex => (prevIndex === 0 ? medias.length - 1 : prevIndex - 1));
  };  

  const handleNext = () => {
    setCurrentIndex(prevIndex => (prevIndex === medias.length - 1 ? 0 : prevIndex + 1));
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block', width: '100%' }}>
      <div
        onClick={handlePrev}
        style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          fontSize: '24px',
          backgroundColor: 'var(--hover)',
          padding: '3px 10px',
          borderRadius: '50%',
          marginLeft: '10px',
          transition: 'background-color 0.3s ease-in-out'
        }}
      >
        &#60;
      </div>
      {medias[currentIndex].endsWith('.mkv') || medias[currentIndex].endsWith('.mp4') ? (
        <video controls width="100%" height="100%">
          <source src={medias[currentIndex]} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <img
          src={medias[currentIndex]}
          alt={`Media ${currentIndex + 1}`}
          style={{ width: '100%', height: '100%', display: 'block' }}
        />
      )}
      <div
        onClick={handleNext}
        style={{
          position: 'absolute',
          top: '50%',
          right: '0',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          fontSize: '24px',
          backgroundColor: 'var(--hover)',
          padding: '3px 10px',
          borderRadius: '50%',
          marginRight: '10px',
          transition: 'background-color 0.3s ease-in-out'
        }}
      >
        &#62;
      </div>
    </div>
  );
};

export default PostCarousel;