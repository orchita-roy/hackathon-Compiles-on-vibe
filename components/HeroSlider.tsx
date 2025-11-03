import React, { useState, useEffect } from 'react';

const images = [
  'https://assets.advocacyincubator.org/uploads/HTN_Bangladesh_Providers-at-community-clinic_2023.jpg',
  'https://extranet.who.int/uhcpartnership/sites/default/files/inline-images/8-CHCP-health-check-up-kid-768x576.jpg',
  'https://www.undp.org/sites/g/files/zskgke326/files/styles/scaled_image_large/public/2022-09/UNDP%20BD%20Acc%20lab.jpg',
  'https://idrc-crdi.ca/sites/default/files/styles/opengraph_image/public/search-bangladesh.jpg',
];

const HeroSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds

    return () => clearTimeout(timer);
  }, [currentIndex]);

  return (
    <div className="absolute inset-0 w-full h-full">
      {images.map((image, index) => (
        <div
          key={index}
          className="absolute inset-0 w-full h-full bg-cover bg-center transition-opacity duration-1000 ease-in-out"
          style={{ 
            backgroundImage: `url(${image})`,
            opacity: index === currentIndex ? 1 : 0,
          }}
        />
      ))}
      <div className="absolute inset-0 bg-black/40"></div> {/* Dark overlay for readability */}
    </div>
  );
};

export default HeroSlider;
