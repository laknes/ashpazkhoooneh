
import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Menu, X, Search, Sparkles, User as UserIcon, Home, Package } from 'lucide-react';
import { CartItem, ViewState, User, Product } from '../types';
import { db } from '../services/db';
import { formatPrice } from '../constants';

interface NavbarProps {
  cart: CartItem[];
  currentView: ViewState;
  user: User | null;
  onChangeView: (view: ViewState) => void;
  onProductSelect: (product: Product) => void;
  isLoading?: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ cart, currentView, user, onChangeView, onProductSelect, isLoading = false }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isCartBouncing, setIsCartBouncing] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  const navItems = [
    { label: 'خانه', view: 'HOME' as ViewState, icon: Home },
    { label: 'محصولات', view: 'CATALOG' as ViewState, icon: Package },
    { label: 'دستیار هوشمند', view: 'AI_ASSISTANT' as ViewState, icon: Sparkles },
    { label: 'مجله', view: 'BLOG' as ViewState, icon: null },
  ];

  // Trigger bounce animation when cart count increases
  useEffect(() => {
    if (cartCount > 0) {
      setIsCartBouncing(true);
      const timer = setTimeout(() => setIsCartBouncing(false), 300);
      return () => clearTimeout(timer);
    }
  }, [cartCount]);

  // Handle outside click to close search suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim().length > 0) {
      const allProducts = db.products.getAll();
      const filtered = allProducts.filter(p => 
        p.name.toLowerCase().includes(query.toLowerCase()) || 
        p.category.includes(query)
      );
      setSuggestions(filtered.slice(0, 5));
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (product: Product) => {
    onProductSelect(product);
    setSearchQuery('');
    setShowSuggestions(false);
  };

  const handleUserClick = () => {
    if (user) {
      onChangeView('USER_PROFILE');
    } else {
      onChangeView('LOGIN');
    }
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-500 hover:text-primary focus:outline-none hover:scale-110 active:scale-90 transition-transform duration-200"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer group"
            onClick={() => onChangeView('HOME')}
          >
            <span className="text-2xl font-black text-primary ml-2 group-hover:scale-105 transition-transform duration-200">آشپزخونه</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-8 space-x-reverse items-center">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => onChangeView(item.view)}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 active:scale-95 ${
                  currentView === item.view
                    ? 'text-primary bg-orange-50'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                {item.icon && <item.icon size={18} className="ml-2" />}
                {item.label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4 space-x-reverse">
            {/* Search Bar with Suggestions */}
            <div className="hidden md:block relative text-gray-400 focus-within:text-gray-600 w-64 lg:w-80" ref={searchRef}>
               <div className="absolute inset-y-0 right-0 pl-3 flex items-center pointer-events-none pr-3">
                <Search size={18} />
              </div>
              <input 
                type="text" 
                placeholder="جستجو..." 
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => { if(searchQuery) setShowSuggestions(true); }}
                className="block w-full pr-10 pl-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-50 placeholder-gray-500 focus:outline-none focus:bg-white focus:ring-1 focus:ring-primary focus:border-primary sm:text-sm transition duration-150 ease-in-out hover:bg-white"
              />
              
              {/* Dropdown Suggestions */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    {suggestions.map(product => (
                        <div 
                            key={product.id}
                            onClick={() => handleSuggestionClick(product)}
                            className="flex items-center p-3 hover:bg-orange-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0 group"
                        >
                            <img src={product.image} alt={product.name} className="w-10 h-10 object-cover rounded-md ml-3 bg-gray-100" />
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-bold text-gray-800 line-clamp-1 group-hover:text-primary transition-colors">{product.name}</h4>
                                <span className="text-xs text-gray-500 font-medium">{formatPrice(product.price)}</span>
                            </div>
                        </div>
                    ))}
                </div>
              )}
              {showSuggestions && searchQuery && suggestions.length === 0 && (
                 <div className="absolute top-full right-0 w-full mt-2 bg-white rounded-xl shadow-lg border border-gray-100 p-4 text-center text-sm text-gray-500 z-50">
                    محصولی یافت نشد
                 </div>
              )}
            </div>

            <button 
                onClick={() => onChangeView('CART')}
                className={`relative p-2 text-gray-600 hover:text-primary transition-all duration-200 hover:scale-110 active:scale-90 ${isCartBouncing ? 'animate-bounce text-primary' : ''}`}
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            <button 
              onClick={handleUserClick}
              className={`p-2 transition-all duration-200 hover:scale-105 active:scale-95 flex items-center ${user ? 'text-primary' : 'text-gray-600 hover:text-primary'}`}
            >
                <UserIcon size={24} />
                {user && <span className="text-xs mr-1 hidden lg:inline">{user.name}</span>}
            </button>
          </div>
        </div>
      </div>

      {/* Loading Bar */}
      {isLoading && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-orange-100 overflow-hidden">
           <div className="h-full bg-primary animate-subtle-progress"></div>
        </div>
      )}
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t animate-in slide-in-from-top-2 duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => {
                  onChangeView(item.view);
                  setIsMenuOpen(false);
                }}
                className={`flex w-full items-center px-3 py-4 rounded-md text-base font-medium transition-colors active:scale-98 ${
                    currentView === item.view
                    ? 'text-primary bg-orange-50'
                    : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                }`}
              >
                 {item.icon && <item.icon size={20} className="ml-2" />}
                {item.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes subtle-progress {
          0% { width: 0%; margin-left: 0; }
          50% { width: 70%; margin-left: 30%; }
          100% { width: 0%; margin-left: 100%; }
        }
        .animate-subtle-progress {
          animation: subtle-progress 1.5s infinite ease-in-out;
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
