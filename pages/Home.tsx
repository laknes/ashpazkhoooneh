
import React, { useState, useEffect } from 'react';
import { Truck, ShieldCheck, Clock, ArrowLeft } from 'lucide-react';
import { Product, ViewState, Category, HeroSlide } from '../types';
import { db } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import SEO from '../components/SEO';

interface HomeProps {
  onChangeView: (view: ViewState) => void;
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
  onCategorySelect?: (category: string) => void;
}

const Home: React.FC<HomeProps> = ({ onChangeView, onProductClick, onAddToCart, wishlist, onToggleWishlist, onCategorySelect }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [bestSellers, setBestSellers] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  // SEO settings state
  const [seoSettings, setSeoSettings] = useState({
      title: 'آشپزخونه',
      desc: '',
      keywords: '',
      url: ''
  });

  useEffect(() => {
    const fetchData = async () => {
        try {
            const allProducts = await db.products.getAll();
            setFeaturedProducts(allProducts.slice(0, 4));
            
            const best = await db.products.getBestSellers();
            setBestSellers(best);
            
            const cats = await db.categories.getAll();
            setCategories(cats);
            
            const settings = await db.settings.get();
            if (settings) {
                setHeroSlides(settings.heroSlides || []);
                setSeoSettings({
                    title: settings.seo.defaultTitle,
                    desc: settings.seo.defaultDescription,
                    keywords: settings.seo.defaultKeywords,
                    url: settings.seo.siteUrl
                });
            }
        } catch (error) {
            console.error("Error loading home data:", error);
        } finally {
            setLoading(false);
        }
    };
    
    fetchData();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
      if (onCategorySelect) {
          onCategorySelect(categoryName);
      } else {
          onChangeView('CATALOG');
      }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="space-y-12 md:space-y-16 pb-12">
      <SEO 
        title="لوازم لوکس خانه و آشپزخانه"
        description={seoSettings.desc}
        keywords={seoSettings.keywords}
        type="website"
      />

      {/* 3D Hero Slider */}
      <section>
        <HeroSlider slides={heroSlides} onChangeView={onChangeView} />
      </section>

      {/* Features - Glassmorphism - Responsive Margin */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:-mt-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
            <div className="flex items-center p-4 md:p-6 glass-card rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="p-3 bg-orange-100/80 text-primary rounded-full ml-4 backdrop-blur-sm flex-shrink-0">
                    <Truck size={28} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-base md:text-lg">ارسال سریع</h3>
                    <p className="text-gray-500 text-xs md:text-sm">تحویل ۲۴ ساعته در تهران</p>
                </div>
            </div>
            <div className="flex items-center p-4 md:p-6 glass-card rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="p-3 bg-orange-100/80 text-primary rounded-full ml-4 backdrop-blur-sm flex-shrink-0">
                    <ShieldCheck size={28} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-base md:text-lg">ضمانت اصالت</h3>
                    <p className="text-gray-500 text-xs md:text-sm">تضمین بازگشت وجه ۷ روزه</p>
                </div>
            </div>
            <div className="flex items-center p-4 md:p-6 glass-card rounded-xl hover:-translate-y-1 hover:shadow-xl transition-all">
                <div className="p-3 bg-orange-100/80 text-primary rounded-full ml-4 backdrop-blur-sm flex-shrink-0">
                    <Clock size={28} className="md:w-8 md:h-8" />
                </div>
                <div>
                    <h3 className="font-bold text-base md:text-lg">پشتیبانی ۲۴/۷</h3>
                    <p className="text-gray-500 text-xs md:text-sm">پاسخگویی در تمام ساعات</p>
                </div>
            </div>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-xl md:text-2xl font-bold mb-6 md:mb-8 text-gray-800 border-r-4 border-primary pr-3">دسته‌بندی‌ها</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">
            {categories.map(cat => (
                <div 
                    key={cat.id} 
                    onClick={() => handleCategoryClick(cat.name)}
                    className="group cursor-pointer flex flex-col items-center"
                >
                    <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white/50 shadow-md group-hover:shadow-xl group-hover:border-orange-100 transition-all duration-300 mb-3 group-hover:-translate-y-2 bg-white/30 backdrop-blur-sm">
                      {cat.image ? (
                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-white/50 flex items-center justify-center text-4xl text-gray-400">
                           {cat.icon || '📦'}
                        </div>
                      )}
                    </div>
                    <h3 className="font-bold text-gray-700 group-hover:text-primary transition-colors text-center text-xs md:text-base">{cat.name}</h3>
                </div>
            ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-6 md:mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-gray-800 border-r-4 border-primary pr-3">جدیدترین محصولات</h2>
            <button 
                onClick={() => onChangeView('CATALOG')}
                className="text-primary hover:text-orange-700 font-medium flex items-center group transition-colors text-sm md:text-base"
            >
                مشاهده همه <ArrowLeft size={16} className="mr-1 group-hover:mr-2 transition-all" />
            </button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map(product => (
                <div key={product.id} className="h-full">
                    <ProductCard 
                        product={product} 
                        onClick={onProductClick}
                        onAddToCart={onAddToCart}
                        isWishlisted={wishlist.includes(product.id)}
                        onToggleWishlist={() => onToggleWishlist(product.id)}
                    />
                </div>
            ))}
        </div>
      </section>

      {/* Best Sellers Section */}
      <section className="bg-orange-50/50 backdrop-blur-sm py-12 md:py-16 border-y border-orange-100/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-xl md:text-2xl font-black text-gray-900 border-r-4 border-gray-900 pr-3 mb-2">پرفروش‌ترین‌های ماه</h2>
                    <p className="text-gray-500 text-xs md:text-sm hidden sm:block">محصولاتی که بیشترین رضایت خریداران را داشته‌اند</p>
                </div>
                <button 
                    onClick={() => onChangeView('CATALOG')}
                    className="text-gray-900 hover:text-primary font-medium flex items-center group transition-colors text-sm md:text-base"
                >
                    مشاهده لیست کامل <ArrowLeft size={16} className="mr-1 group-hover:mr-2 transition-all" />
                </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {bestSellers.map((product, idx) => (
                    <div key={product.id} className="transform transition-transform duration-500 hover:-translate-y-2 h-full flex flex-col">
                        <div className="flex-1">
                            <ProductCard 
                                product={product} 
                                onClick={onProductClick}
                                onAddToCart={onAddToCart}
                                isWishlisted={wishlist.includes(product.id)}
                                onToggleWishlist={() => onToggleWishlist(product.id)}
                            />
                        </div>
                        <div className="mt-4 flex justify-center">
                            <span className="bg-gray-900/90 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md backdrop-blur-md">
                                رتبه {idx + 1} فروش
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
