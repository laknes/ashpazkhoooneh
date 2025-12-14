
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ShoppingCart, Star, Heart, Maximize2, X, Eye, Truck, CheckCircle, ImageOff } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../constants';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onClick: (product: Product) => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onClick, 
  isWishlisted, 
  onToggleWishlist 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  // Prevent background scroll when modals are open
  useEffect(() => {
    if (showModal || showQuickView) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showModal, showQuickView]);

  // Handlers
  const handleWishlistClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist();
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Trigger visual feedback
    setIsAdding(true);
    setTimeout(() => setIsAdding(false), 1000);

    onAddToCart(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowQuickView(true);
  };

  const handleZoomClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowModal(true);
  };

  const handleCardClick = () => {
    onClick(product);
  };

  // Helper to optimize image URLs (especially for Unsplash)
  const getOptimizedImageUrl = (url: string, width = 400) => {
    if (!url || imgError) return 'https://placehold.co/400x400/f3f4f6/9ca3af?text=No+Image'; // Fallback
    if (url.includes('images.unsplash.com')) {
      const separator = url.includes('?') ? '&' : '?';
      let newUrl = url;
      if (!newUrl.includes('auto=format')) newUrl += `${separator}auto=format`;
      if (!newUrl.includes('q=')) newUrl += `&q=80`;
      if (!newUrl.includes('w=')) newUrl += `&w=${width}`;
      return newUrl;
    }
    return url;
  };

  const displayImage = getOptimizedImageUrl(product.image);

  return (
    <>
      {/* Main Card Container - Using standardized glass-card class */}
      <div 
        className="group relative flex flex-col h-full glass-card rounded-2xl cursor-pointer overflow-hidden isolate hover:shadow-2xl hover:-translate-y-1"
        onClick={handleCardClick}
      >
        {/* Image Section */}
        <div className="relative aspect-square overflow-hidden bg-white/40 p-4 flex items-center justify-center">
          {imgError ? (
              <div className="text-gray-300 flex flex-col items-center">
                  <ImageOff size={48} className="mb-2 opacity-50"/>
                  <span className="text-xs font-medium">تصویر موجود نیست</span>
              </div>
          ) : (
              <>
                {!isImageLoaded && (
                  <div className="absolute inset-0 bg-gray-100 animate-pulse m-4 rounded-xl" />
                )}
                <img 
                  src={displayImage} 
                  alt={product.name} 
                  loading="lazy"
                  decoding="async"
                  width="400"
                  height="400"
                  className={`w-full h-full object-contain object-center transition-all duration-700 group-hover:scale-105 mix-blend-multiply ${
                    isImageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-sm scale-95'
                  }`}
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setImgError(true)}
                />
              </>
          )}
          
          {/* Top Left: Wishlist Button */}
          {/* Mobile: Always visible (opacity-100). Desktop: Visible on hover (md:opacity-0 md:group-hover:opacity-100) */}
          <button
            onClick={handleWishlistClick}
            className={`absolute top-2 left-2 z-20 p-2 rounded-full shadow-md transition-all duration-300 md:hover:scale-110 active:scale-90 
              ${isWishlisted 
                ? 'bg-white text-red-500 opacity-100' 
                : 'bg-white/80 backdrop-blur-sm text-gray-400 hover:text-red-500 hover:bg-white opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-[-10px] md:group-hover:translate-y-0'
              }`}
            title={isWishlisted ? "حذف از علاقه‌مندی‌ها" : "افزودن به علاقه‌مندی‌ها"}
          >
            <Heart size={20} className={isWishlisted ? 'fill-current' : ''} />
          </button>

          {/* Top Right: Discount Badge */}
          {product.oldPrice && (
            <div className="absolute top-2 right-2 z-10 bg-[#dc2626]/90 backdrop-blur-sm text-white text-[10px] md:text-sm font-bold px-2 md:px-3 py-1 rounded-lg shadow-md">
              تخفیف ویژه
            </div>
          )}

          {/* Center: Quick View Button (Desktop Only mainly, but accessible on touch if clicked carefully, keeping hidden on small mobile to avoid clutter) */}
          <button
            onClick={handleQuickViewClick}
            className="hidden md:flex absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2 items-center gap-2 bg-white/80 backdrop-blur-md text-gray-800 px-4 py-2 rounded-full font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-105 hover:bg-white translate-y-4 group-hover:translate-y-[-50%]"
          >
            <Eye size={18} className="text-[#FF6A00]" />
            <span className="text-sm">مشاهده سریع</span>
          </button>

          {/* Bottom Right: Zoom Button */}
          <button
            onClick={handleZoomClick}
            className="absolute bottom-2 right-2 z-20 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-sm text-gray-500 hover:text-[#FF6A00] transition-all duration-300 md:hover:scale-110 shadow-sm opacity-100 md:opacity-0 md:group-hover:opacity-100 md:translate-y-2 md:group-hover:translate-y-0"
            title="بزرگنمایی تصویر"
          >
            <Maximize2 size={18} />
          </button>
        </div>
        
        {/* Content Section */}
        <div className="flex flex-col flex-grow p-4 relative z-10">
          {/* Category & Rating */}
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] md:text-xs text-gray-600 bg-white/60 px-2 py-1 rounded-full backdrop-blur-sm border border-white/50">
              {product.category}
            </span>
            <div className="flex items-center text-yellow-500 text-xs font-bold drop-shadow-sm">
              <span className="text-gray-500 ml-1 text-[10px]">({product.reviews})</span>
              {product.rating} <Star size={12} fill="currentColor" className="mr-1" />
            </div>
          </div>

          {/* Product Name */}
          <h3 className="font-bold text-gray-800 text-sm md:text-base mb-2 line-clamp-1 group-hover:text-[#FF6A00] transition-colors">
            {product.name}
          </h3>
          
          {/* Footer: Price & Actions */}
          <div className="flex items-end justify-between mt-auto pt-3 border-t border-gray-200/50">
            <div className="flex flex-col">
              {product.oldPrice && (
                <span className="text-[10px] md:text-xs text-gray-400 line-through mb-0.5">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
              <span className="text-sm md:text-lg font-black text-gray-900">
                {formatPrice(product.price)}
              </span>
            </div>
            
            <div className="flex items-center gap-2 relative">
              <button 
                onClick={handleAddToCart}
                className="bg-[#FF6A00] hover:bg-orange-600 text-white p-2 md:p-2.5 rounded-xl shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center relative overflow-hidden z-20"
                aria-label="افزودن به سبد خرید"
              >
                <ShoppingCart size={18} />
                {isAdding && (
                  <span className="absolute inset-0 flex items-center justify-center animate-ping text-white/50">
                     <ShoppingCart size={18} />
                  </span>
                )}
              </button>
              {/* Flying Particle */}
              {isAdding && (
                  <div className="absolute right-0 bottom-full mb-2 pointer-events-none animate-bounce text-[#FF6A00] opacity-0 transition-opacity duration-1000 z-30" style={{ animation: 'ping 0.8s cubic-bezier(0, 0, 0.2, 1) infinite, slideUp 0.8s ease-out' }}>
                       <ShoppingCart size={20} className="fill-current"/>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
            0% { transform: translateY(0) scale(0.8); opacity: 1; }
            100% { transform: translateY(-40px) scale(1.2); opacity: 0; }
        }
      `}</style>

      {/* --- MODALS (Rendered via Portal) --- */}

      {/* Zoom Modal */}
      {showModal && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/60 backdrop-blur-md p-4 animate-in fade-in duration-300"
          onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
        >
          <button 
            className="absolute top-4 left-4 z-[10000] text-white hover:text-red-500 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors backdrop-blur-lg border border-white/10"
            onClick={(e) => { e.stopPropagation(); setShowModal(false); }}
          >
            <X size={32} />
          </button>
          <img 
            src={getOptimizedImageUrl(product.image, 1200)} 
            alt={product.name} 
            loading="lazy"
            className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()} 
            onError={(e) => {
               e.currentTarget.src = "https://placehold.co/800x800/f3f4f6/9ca3af?text=Image+Not+Found";
            }}
          />
        </div>,
        document.body
      )}

      {/* Quick View Modal */}
      {showQuickView && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-gray-900/40 backdrop-blur-md p-4 animate-in fade-in duration-200"
          onClick={(e) => { e.stopPropagation(); setShowQuickView(false); }}
        >
          <div 
            className="glass-card rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative animate-in zoom-in-95 slide-in-from-bottom-5 duration-300 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Close Button */}
            <div className="absolute top-4 left-4 z-50">
              <button 
                className="bg-white/60 backdrop-blur-md hover:bg-red-50 text-gray-500 hover:text-red-500 rounded-full p-2 transition-colors shadow-md border border-white/50"
                onClick={() => setShowQuickView(false)}
              >
                <X size={24} />
              </button>
            </div>

            <div className="overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 h-full">
                {/* Image */}
                <div className="bg-white/40 p-8 flex items-center justify-center min-h-[300px]">
                  <img 
                    src={getOptimizedImageUrl(product.image, 800)} 
                    alt={product.name} 
                    loading="lazy"
                    className="max-w-full max-h-[400px] object-contain drop-shadow-xl mix-blend-multiply"
                    onError={(e) => {
                        e.currentTarget.src = "https://placehold.co/600x400/f3f4f6/9ca3af?text=No+Image";
                    }}
                  />
                </div>

                {/* Details */}
                <div className="p-6 md:p-8 flex flex-col">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="bg-orange-100/80 text-[#FF6A00] text-xs font-bold px-2 py-1 rounded-full backdrop-blur-sm">
                        {product.category}
                      </span>
                      <div className="flex items-center text-yellow-500 text-xs font-bold">
                        <span className="text-gray-500 ml-1">({product.reviews} نظر)</span>
                        {product.rating} <Star size={14} fill="currentColor" className="mr-1" />
                      </div>
                    </div>

                    <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-4 leading-tight">
                      {product.name}
                    </h2>
                    
                    <div className="flex items-center mb-6">
                      <span className="text-2xl font-bold text-[#FF6A00] ml-3">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && (
                        <span className="text-lg text-gray-400 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed mb-6 line-clamp-4">
                      {product.description}
                    </p>

                    <div className="space-y-2 mb-8 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Truck size={16} className="ml-2 text-[#FF6A00]" />
                        ارسال سریع و رایگان در تهران
                      </div>
                      <div className="flex items-center">
                        <CheckCircle size={16} className="ml-2 text-[#FF6A00]" />
                        ضمانت اصالت و سلامت فیزیکی کالا
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200/50 flex gap-3 mt-auto">
                    <button 
                      onClick={() => {
                        onAddToCart(product);
                        setShowQuickView(false);
                      }}
                      className="flex-[2] bg-[#FF6A00] hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:shadow-orange-500/50 transition-all active:scale-95 flex items-center justify-center"
                    >
                      <ShoppingCart size={20} className="ml-2" />
                      افزودن به سبد
                    </button>

                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWishlist();
                      }}
                      className={`flex-none px-4 rounded-xl border transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center ${
                        isWishlisted 
                          ? 'bg-red-50 border-red-200 text-red-500' 
                          : 'bg-white/60 border-gray-200 text-gray-400 hover:text-red-500 hover:border-red-200'
                      }`}
                    >
                      <Heart size={22} className={isWishlisted ? 'fill-current' : ''} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
