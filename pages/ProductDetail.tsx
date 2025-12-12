
import React, { useState, useMemo } from 'react';
import { ArrowRight, Star, ShoppingCart, Truck, Shield, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { formatPrice } from '../constants';
import { generateChefResponse } from '../services/geminiService';
import { db } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import SEO from '../components/SEO';

interface ProductDetailProps {
  product: Product;
  onBack: () => void;
  onAddToCart: (product: Product) => void;
  onProductClick: (product: Product) => void;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

const ProductDetail: React.FC<ProductDetailProps> = ({ 
  product, 
  onBack, 
  onAddToCart, 
  onProductClick, 
  wishlist, 
  onToggleWishlist, 
  onLoadingStateChange 
}) => {
  const [activeTab, setActiveTab] = useState<'desc' | 'features'>('desc');
  const [aiAdvice, setAiAdvice] = useState<string>('');
  const [loadingAi, setLoadingAi] = useState(false);

  const handleAskAi = async () => {
    setLoadingAi(true);
    if (onLoadingStateChange) onLoadingStateChange(true);
    
    const features = product.features ? product.features.join(', ') : '';
    const query = `آیا محصول "${product.name}" با ویژگی‌های "${features}" برای یک آشپزخانه خانگی مناسب است؟ مزایا و معایب آن چیست؟`;
    
    try {
      const response = await generateChefResponse(query);
      setAiAdvice(response);
    } catch (error) {
      console.error(error);
      setAiAdvice("متاسفانه در ارتباط با هوش مصنوعی خطایی رخ داد.");
    } finally {
      setLoadingAi(false);
      if (onLoadingStateChange) onLoadingStateChange(false);
    }
  };

  const relatedProducts = useMemo(() => {
    const allProducts = db.products.getAll();
    return allProducts
      .filter(p => p.category === product.category && p.id !== product.id)
      .slice(0, 4);
  }, [product]);

  // JSON-LD Schema for Product
  const productSchema = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": product.name,
    "image": product.image,
    "description": product.metaDescription || product.description,
    "sku": product.id,
    "brand": {
      "@type": "Brand",
      "name": "Ashpazkhoneh" // Could be dynamic if brand field existed
    },
    "offers": {
      "@type": "Offer",
      "url": window.location.href,
      "priceCurrency": "IRR",
      "price": product.price,
      "priceValidUntil": "2025-12-31", // Example
      "itemCondition": "https://schema.org/NewCondition",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.reviews
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      <SEO 
        title={product.metaTitle || product.name}
        description={product.metaDescription || product.description.substring(0, 160)}
        keywords={product.metaKeywords || product.category}
        image={product.image}
        type="product"
        jsonLd={productSchema}
      />

      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-primary mb-4 md:mb-6 transition-colors group text-sm md:text-base"
      >
        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
        بازگشت به لیست
      </button>

      {/* Main Glassmorphism Container */}
      <div className="bg-white/70 backdrop-blur-xl border border-white/50 rounded-2xl shadow-sm overflow-hidden mb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            {/* Image Section */}
            <div className="p-4 md:p-8 flex items-center justify-center bg-white/40">
                <img 
                    src={product.image} 
                    alt={product.name} 
                    className="max-w-full max-h-[300px] md:max-h-[500px] object-contain drop-shadow-lg transition-all duration-500 hover:scale-105 hover:drop-shadow-2xl mix-blend-multiply" 
                />
            </div>

            {/* Info Section */}
            <div className="p-4 md:p-8 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <span className="bg-orange-100/80 backdrop-blur-sm text-primary px-3 py-1 rounded-full text-xs md:text-sm font-medium">
                        {product.category}
                    </span>
                    <div className="flex items-center text-yellow-400 font-bold">
                        <span className="text-gray-700 ml-2 text-sm">{product.rating}</span>
                        <Star fill="currentColor" size={16} />
                    </div>
                </div>

                <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-4 leading-tight">{product.name}</h1>
                
                <div className="flex items-center mb-6">
                    <span className="text-2xl md:text-3xl font-bold text-primary ml-4">
                        {formatPrice(product.price)}
                    </span>
                    {product.oldPrice && (
                        <span className="text-lg md:text-xl text-gray-400 line-through decoration-red-500">
                            {formatPrice(product.oldPrice)}
                        </span>
                    )}
                </div>

                <div className="prose prose-sm text-gray-600 mb-8 max-w-none text-justify">
                    <p>{product.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="flex items-center text-xs md:text-sm text-gray-600 bg-white/50 border border-white/60 p-3 rounded-lg hover:bg-orange-50/50 transition-colors">
                        <Truck size={18} className="ml-2 text-primary" />
                        ارسال رایگان تهران
                    </div>
                    <div className="flex items-center text-xs md:text-sm text-gray-600 bg-white/50 border border-white/60 p-3 rounded-lg hover:bg-orange-50/50 transition-colors">
                        <Shield size={18} className="ml-2 text-primary" />
                        ۱۸ ماه گارانتی
                    </div>
                </div>

                <div className="mt-auto space-y-4">
                    <button 
                        onClick={() => onAddToCart(product)}
                        className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl shadow-orange-200 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 flex justify-center items-center"
                    >
                        <ShoppingCart className="ml-2" />
                        افزودن به سبد خرید
                    </button>

                    {/* AI Section */}
                    <div className="border border-indigo-100 bg-indigo-50/50 backdrop-blur-sm rounded-xl p-4 transition-colors hover:border-indigo-200">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-bold text-indigo-900 flex items-center text-sm md:text-base">
                                <Sparkles size={18} className="ml-2 text-indigo-600" />
                                نظر هوش مصنوعی
                            </h3>
                            {!aiAdvice && (
                                <button 
                                    onClick={handleAskAi}
                                    disabled={loadingAi}
                                    className="text-xs bg-indigo-600 text-white px-3 py-1 rounded-full hover:bg-indigo-700 disabled:opacity-50 transition-all duration-200 hover:scale-105 active:scale-95"
                                >
                                    {loadingAi ? 'در حال تحلیل...' : 'پرسیدن نظر'}
                                </button>
                            )}
                        </div>
                        
                        {aiAdvice && (
                            <p className="text-sm text-indigo-800 leading-relaxed animate-in fade-in bg-white/80 p-3 rounded-lg border border-indigo-100">
                                {aiAdvice}
                            </p>
                        )}
                        {!aiAdvice && !loadingAi && (
                            <p className="text-xs text-indigo-400">
                                برای دریافت تحلیل تخصصی درباره این محصول کلیک کنید.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 animate-in slide-in-from-bottom-10 duration-700">
            <h2 className="text-xl md:text-2xl font-bold mb-6 text-gray-800 border-r-4 border-primary pr-3">محصولات مشابه</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map(p => (
                    <ProductCard 
                        key={p.id} 
                        product={p} 
                        onAddToCart={onAddToCart} 
                        onClick={onProductClick}
                        isWishlisted={wishlist.includes(p.id)}
                        onToggleWishlist={() => onToggleWishlist(p.id)}
                    />
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
