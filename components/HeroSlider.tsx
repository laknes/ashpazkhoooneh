
import React, { useState, useEffect } from 'react';
import { HeroSlide, ViewState } from '../types';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';

interface HeroSliderProps {
  slides: HeroSlide[];
  onChangeView: (view: ViewState) => void;
}

const HeroSlider: React.FC<HeroSliderProps> = ({ slides, onChangeView }) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Auto-play
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const nextSlide = () => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  if (!slides.length) return null;

  return (
    <div className="relative h-[400px] md:h-[600px] w-full overflow-hidden bg-gray-900 perspective-[1000px] flex items-center justify-center transition-all duration-300">
      {/* Background with blur */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl transition-all duration-1000"
        style={{ backgroundImage: `url('${slides[activeIndex].image}')` }}
      ></div>
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-gray-900/50"></div>

      {/* 3D Slides Container */}
      <div className="relative w-full max-w-7xl mx-auto h-[250px] md:h-[400px] flex items-center justify-center [transform-style:preserve-3d]">
        {slides.map((slide, index) => {
          // Calculate position relative to active slide
          let offset = (index - activeIndex);
          // Handle wrap-around logic for smoother infinite feel visually (simplified here)
          if (offset < -1 * Math.floor(slides.length / 2)) offset += slides.length;
          if (offset > Math.floor(slides.length / 2)) offset -= slides.length;

          const isActive = offset === 0;
          const isPrev = offset === -1;
          const isNext = offset === 1;
          const isVisible = Math.abs(offset) <= 1; // Only show prev, current, next mainly

          return (
            <div
              key={slide.id}
              className={`absolute top-0 w-[85%] md:w-[60%] lg:w-[50%] h-full transition-all duration-700 ease-in-out cursor-pointer ${
                isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'
              }`}
              style={{
                transform: `
                  translateX(${offset * 60}%) 
                  scale(${isActive ? 1 : 0.8}) 
                  perspective(1000px) 
                  rotateY(${offset * -25}deg)
                  translateZ(${isActive ? 0 : -200}px)
                `,
                zIndex: isActive ? 50 : 40 - Math.abs(offset),
              }}
              onClick={() => setActiveIndex(index)}
            >
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl group border-2 md:border-4 border-white/10">
                <img 
                  src={slide.image} 
                  alt={slide.title} 
                  className="w-full h-full object-cover" 
                />
                
                {/* Content Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6 md:p-12 text-center transition-opacity duration-500 ${isActive ? 'opacity-100' : 'opacity-0'}`}>
                    <h2 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-4 drop-shadow-lg translate-y-0 transition-transform duration-700 delay-100 leading-tight">
                        {slide.title}
                    </h2>
                    <p className="text-gray-200 text-xs md:text-lg mb-4 md:mb-8 max-w-2xl mx-auto drop-shadow-md line-clamp-2 md:line-clamp-none">
                        {slide.subtitle}
                    </p>
                    <div className="flex justify-center">
                        <button 
                            onClick={(e) => { e.stopPropagation(); onChangeView('CATALOG'); }}
                            className="bg-primary hover:bg-orange-600 text-white px-5 py-2 md:px-8 md:py-3 rounded-full font-bold text-sm md:text-lg transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 flex items-center"
                        >
                            مشاهده محصولات
                            <ArrowLeft className="mr-2 w-4 h-4 md:w-6 md:h-6" />
                        </button>
                    </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <button 
        onClick={prevSlide}
        className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all z-50 hover:scale-110 active:scale-95"
      >
        <ChevronRight size={24} className="md:w-8 md:h-8" />
      </button>
      <button 
        onClick={nextSlide}
        className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 p-2 md:p-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full text-white transition-all z-50 hover:scale-110 active:scale-95"
      >
        <ChevronLeft size={24} className="md:w-8 md:h-8" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 flex space-x-2 space-x-reverse z-50">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveIndex(index)}
            className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-300 ${
              activeIndex === index ? 'bg-primary w-6 md:w-8' : 'bg-white/50 hover:bg-white'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
