
import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AdminLayout from './components/AdminLayout';
import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Login from './pages/Login';
import UserProfile from './pages/UserProfile';
import Blog from './pages/Blog';
import About from './pages/About';
import Contact from './pages/Contact';
import AiAssistant from './pages/AiAssistant';
import AdminDashboard from './pages/AdminDashboard';
import AdminProducts from './pages/AdminProducts';
import AdminOrders from './pages/AdminOrders';
import AdminBlog from './pages/AdminBlog';
import AdminCategories from './pages/AdminCategories';
import AdminSettings from './pages/AdminSettings';
import AdminUsers from './pages/AdminUsers';
import ScrollToTop from './components/ScrollToTop';
import { Product, CartItem, ViewState, User } from './types';
import { db } from './services/db';
import { CheckCircle, X } from 'lucide-react';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewState>('HOME');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);

  // Initialize wishlist from DB
  useEffect(() => {
    setWishlist(db.wishlist.get());
  }, []);

  // Heartbeat for Active Users Tracking
  useEffect(() => {
    // Get or create a session ID
    let sessionId = sessionStorage.getItem('ashpazkhoneh_session_id');
    if (!sessionId) {
      sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
      sessionStorage.setItem('ashpazkhoneh_session_id', sessionId);
    }

    const sendHeartbeat = () => {
      if (sessionId) db.system.sendHeartbeat(sessionId);
    };

    // Send immediately
    sendHeartbeat();

    // Send every 30 seconds
    const interval = setInterval(sendHeartbeat, 30000);

    return () => clearInterval(interval);
  }, []);

  const toggleWishlist = (productId: number) => {
    const updatedWishlist = db.wishlist.toggle(productId);
    setWishlist(updatedWishlist);
  };

  // Navigation handlers
  const handleNavigate = (view: ViewState) => {
    setIsLoading(true);
    // Simulate network delay for transition effect
    setTimeout(() => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        setIsLoading(false);
    }, 500);
  };

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    handleNavigate('PRODUCT_DETAIL');
  };

  // Cart Logic
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    // Show toast
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const updateCartQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Auth Logic
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    // Auto-redirect to admin dashboard if role is ADMIN
    if (loggedInUser.role === 'ADMIN') {
        handleNavigate('ADMIN_DASHBOARD');
    } else {
        handleNavigate('HOME');
    }
  };

  const handleLogout = () => {
    setUser(null);
    handleNavigate('HOME');
  };

  const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
  };

  // Calculate a unique key for the view to trigger animation
  // If we are in product detail, include product ID so switching products triggers animation
  const viewKey = currentView === 'PRODUCT_DETAIL' && selectedProduct 
    ? `PRODUCT_DETAIL-${selectedProduct.id}` 
    : currentView;

  // Admin View Logic
  if (currentView.startsWith('ADMIN')) {
    // Only allow admin access if user has ADMIN role (in a real app)
    if (currentView !== 'ADMIN_DASHBOARD' && user?.role !== 'ADMIN' && currentView.startsWith('ADMIN')) {
       // Optional: Redirect to login or home if strictly enforcing
    }

    return (
      <AdminLayout currentView={currentView} onChangeView={handleNavigate} onLogout={handleLogout}>
        <div key={viewKey} className="animate-fadeInUp">
            {currentView === 'ADMIN_DASHBOARD' && <AdminDashboard onChangeView={handleNavigate} />}
            {currentView === 'ADMIN_PRODUCTS' && <AdminProducts />}
            {currentView === 'ADMIN_ORDERS' && <AdminOrders />}
            {currentView === 'ADMIN_USERS' && <AdminUsers />}
            {currentView === 'ADMIN_BLOG' && <AdminBlog />}
            {currentView === 'ADMIN_CATEGORIES' && <AdminCategories />}
            {currentView === 'ADMIN_SETTINGS' && <AdminSettings />}
        </div>
      </AdminLayout>
    );
  }

  // Storefront View Logic
  const renderStoreView = () => {
    switch (currentView) {
      case 'HOME':
        return (
          <Home 
            onChangeView={handleNavigate} 
            onProductClick={handleProductClick}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        );
      case 'CATALOG':
        return (
          <Catalog 
            onProductClick={handleProductClick}
            onAddToCart={addToCart}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        );
      case 'PRODUCT_DETAIL':
        return selectedProduct ? (
          <ProductDetail 
            product={selectedProduct} 
            onBack={() => handleNavigate('CATALOG')}
            onAddToCart={addToCart}
            onProductClick={handleProductClick}
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
            onLoadingStateChange={setIsLoading}
          />
        ) : <Catalog 
              onProductClick={handleProductClick} 
              onAddToCart={addToCart} 
              wishlist={wishlist}
              onToggleWishlist={toggleWishlist}
            />;
      case 'CART':
        return (
          <Cart 
            cart={cart}
            onUpdateQuantity={updateCartQuantity}
            onRemove={removeFromCart}
            onChangeView={handleNavigate}
          />
        );
      case 'CHECKOUT':
        return (
          <Checkout 
            cart={cart}
            user={user}
            onSuccess={() => {
              clearCart();
              handleNavigate('USER_PROFILE');
            }}
            onLoginRequest={() => handleNavigate('LOGIN')}
            onLoadingStateChange={setIsLoading}
          />
        );
      case 'LOGIN':
        return <Login onLogin={handleLogin} onCancel={() => handleNavigate('HOME')} />;
      case 'USER_PROFILE':
        return user ? (
          <UserProfile 
            user={user} 
            onLogout={handleLogout} 
            onUpdateUser={handleUserUpdate} 
            onEnterAdmin={() => handleNavigate('ADMIN_DASHBOARD')}
            onEnterSettings={() => handleNavigate('ADMIN_SETTINGS')}
          />
        ) : <Login onLogin={handleLogin} onCancel={() => handleNavigate('HOME')} />;
      case 'BLOG':
        return <Blog />;
      case 'ABOUT':
        return <About />;
      case 'CONTACT':
        return <Contact />;
      case 'AI_ASSISTANT':
        return <AiAssistant onLoadingStateChange={setIsLoading} />;
      default:
        return (
          <Home 
            onChangeView={handleNavigate} 
            onProductClick={handleProductClick} 
            onAddToCart={addToCart} 
            wishlist={wishlist}
            onToggleWishlist={toggleWishlist}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 flex flex-col">
      <Navbar 
        cart={cart} 
        currentView={currentView}
        user={user}
        onChangeView={handleNavigate} 
        onProductSelect={handleProductClick}
        isLoading={isLoading}
      />
      
      <main className="flex-grow">
        <div key={viewKey} className="animate-fadeInUp">
            {renderStoreView()}
        </div>
      </main>

      <Footer onChangeView={handleNavigate} />
      <ScrollToTop />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 left-8 z-[100] bg-gray-900 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5 duration-300">
           <div className="bg-green-500 rounded-full p-1">
             <CheckCircle size={16} className="text-white" />
           </div>
           <div>
             <h4 className="font-bold text-sm">به سبد خرید اضافه شد</h4>
             <p className="text-xs text-gray-300 mt-1">کالا با موفقیت به سبد افزوده شد.</p>
           </div>
           <button onClick={() => setShowToast(false)} className="text-gray-400 hover:text-white mr-2 transition-colors">
             <X size={18} />
           </button>
        </div>
      )}
    </div>
  );
};

export default App;
