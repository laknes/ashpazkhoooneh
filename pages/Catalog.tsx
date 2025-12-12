
import React, { useState, useMemo, useEffect } from 'react';
import { Product, Category } from '../types';
import { db } from '../services/db';
import { ProductCard } from '../components/ProductCard';
import { Filter, SlidersHorizontal } from 'lucide-react';

interface CatalogProps {
  onProductClick: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  wishlist: number[];
  onToggleWishlist: (id: number) => void;
}

const Catalog: React.FC<CatalogProps> = ({ onProductClick, onAddToCart, wishlist, onToggleWishlist }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [priceRange, setPriceRange] = useState<number>(20000000);
  const [sortBy, setSortBy] = useState<string>('newest');

  // Load data from DB on mount
  useEffect(() => {
    setProducts(db.products.getAll());
    setCategories(db.categories.getAll());
  }, []);

  const filteredProducts = useMemo(() => {
    // 1. Filter
    let result = products.filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesPrice = p.price <= priceRange;
        return matchesCategory && matchesPrice;
    });

    // 2. Sort
    switch (sortBy) {
        case 'cheapest':
            result.sort((a, b) => a.price - b.price);
            break;
        case 'expensive':
            result.sort((a, b) => b.price - a.price);
            break;
        case 'rating':
            result.sort((a, b) => b.rating - a.rating);
            break;
        case 'reviews':
            result.sort((a, b) => b.reviews - a.reviews);
            break;
        case 'newest':
        default:
            result.sort((a, b) => b.id - a.id); // Assuming higher ID is newer
            break;
    }

    return result;
  }, [products, selectedCategory, priceRange, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar Filters - Glassmorphism */}
        <div className="w-full md:w-64 space-y-8">
            <div className="bg-white/70 backdrop-blur-lg border border-white/40 p-6 rounded-xl shadow-sm sticky top-24">
                <div className="flex items-center mb-4 text-gray-800">
                    <Filter size={20} className="ml-2 text-primary" />
                    <h3 className="font-bold text-lg">فیلترها</h3>
                </div>
                
                <div className="space-y-4">
                    <div>
                        <h4 className="font-medium text-sm text-gray-600 mb-2">دسته‌بندی</h4>
                        <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar pl-2">
                            <label className="flex items-center cursor-pointer hover:bg-white/50 p-1 rounded transition-colors">
                                <input 
                                    type="radio" 
                                    name="category" 
                                    className="form-radio text-primary focus:ring-primary h-4 w-4"
                                    checked={selectedCategory === 'all'}
                                    onChange={() => setSelectedCategory('all')}
                                />
                                <span className="mr-2 text-sm text-gray-700">همه محصولات</span>
                            </label>
                            {categories.map(cat => (
                                <label key={cat.id} className="flex items-center cursor-pointer hover:bg-white/50 p-1 rounded transition-colors">
                                    <input 
                                        type="radio" 
                                        name="category" 
                                        className="form-radio text-primary focus:ring-primary h-4 w-4"
                                        checked={selectedCategory === cat.name}
                                        onChange={() => setSelectedCategory(cat.name)}
                                    />
                                    <span className="mr-2 text-sm text-gray-700">{cat.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-200/50">
                        <h4 className="font-medium text-sm text-gray-600 mb-2">محدوده قیمت</h4>
                        <input 
                            type="range" 
                            min="0" 
                            max="20000000" 
                            step="500000"
                            value={priceRange}
                            onChange={(e) => setPriceRange(Number(e.target.value))}
                            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                        />
                        <div className="flex justify-between text-xs text-gray-500 mt-2">
                            <span>۰ تومان</span>
                            <span>{new Intl.NumberFormat('fa-IR').format(priceRange)} تومان</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 bg-white/70 backdrop-blur-lg border border-white/40 p-4 rounded-xl shadow-sm gap-4">
                <span className="text-gray-600 font-medium text-sm">
                    نمایش {filteredProducts.length} محصول
                </span>
                <div className="flex items-center">
                    <SlidersHorizontal size={18} className="ml-2 text-gray-500" />
                    <select 
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="form-select border-none text-sm text-gray-700 focus:ring-0 cursor-pointer bg-transparent outline-none py-1"
                    >
                        <option value="newest">جدیدترین</option>
                        <option value="rating">محبوب‌ترین (امتیاز)</option>
                        <option value="reviews">بیشترین نظر</option>
                        <option value="cheapest">ارزان‌ترین</option>
                        <option value="expensive">گران‌ترین</option>
                    </select>
                </div>
            </div>

            <div 
                key={`${selectedCategory}-${sortBy}`}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
            >
                {filteredProducts.map((product, index) => (
                    <div 
                        key={product.id} 
                        className="animate-fadeInUp h-full"
                        style={{ animationDelay: `${index * 100}ms`, animationFillMode: 'both' }}
                    >
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

            {filteredProducts.length === 0 && (
                <div className="text-center py-20 bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-gray-300">
                    <div className="text-4xl mb-4">🔍</div>
                    <p className="text-gray-500 text-lg font-medium">محصولی با این مشخصات یافت نشد.</p>
                    <button 
                        onClick={() => {setSelectedCategory('all'); setPriceRange(20000000);}}
                        className="mt-4 text-primary hover:text-orange-600 text-sm font-bold"
                    >
                        پاک کردن فیلترها
                    </button>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Catalog;
