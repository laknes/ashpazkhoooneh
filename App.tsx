
import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, Navigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const location = useLocation();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [targetCategory, setTargetCategory] = useState<string>('all');

  // Helper to map URL path to ViewState for components that need it (like Navbar)
  const getCurrentView = (): ViewState => {
    const path = location.pathname;
    if (path === '/') return 'HOME';
    if (path.startsWith('/product/')) return 'PRODUCT_DETAIL';
    if (path.startsWith('/catalog')) return 'CATALOG';
    if (path === '/cart') return 'CART';
    if (path === '/checkout') return 'CHECKOUT';
    if (path === '/login') return 'LOGIN';
    if (path === '/profile') return 'USER_PROFILE';
    if (path === '/blog') return 'BLOG';
    if (path === '/about') return 'ABOUT';
    if (path === '/contact') return 'CONTACT';
    if (path === '/ai-assistant') return 'AI_ASSISTANT';
    if (path === '/admin') return 'ADMIN_DASHBOARD';
    if (path.startsWith('/admin/')) {
        const sub = path.split('/')[2];
        return `ADMIN_${sub.toUpperCase()}` as ViewState;
    }
    return 'HOME';
  };

  const currentView = getCurrentView();

  // Initialize wishlist from DB
  useEffect(() => {
    setWishlist(db.wishlist.get());
  }, []);

  // Initialize favicon from settings
  useEffect(() => {
    const applyFavicon = async () => {
        try {
            const settings = await db.settings.get();
            if (settings && settings.favicon) {
                let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
                if (!link) {
                    link = document.createElement('link');
                    link.rel = 'icon';
                    document.getElementsByTagName('head')[0].appendChild(link);
                }
                link.href = settings.favicon;
            }
        } catch (e) {
            console.error("Failed to load favicon settings", e);
        }
    };
    applyFavicon();
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

  // Navigation logic replacement using React Router
  const handleNavigate = (view: ViewState) => {
    setIsLoading(true);
    
    // Simulate slight delay for loading bar effect if desired, or remove
    setTimeout(() => {
      setIsLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      switch (view) {
        case 'HOME': navigate('/'); break;
        case 'CATALOG': navigate('/catalog'); break;
        case 'CART': navigate('/cart'); break;
        case 'CHECKOUT': navigate('/checkout'); break;
        case 'LOGIN': navigate('/login'); break;
        case 'USER_PROFILE': navigate('/profile'); break;
        case 'BLOG': navigate('/blog'); break;
        case 'ABOUT': navigate('/about'); break;
        case 'CONTACT': navigate('/contact'); break;
        case 'AI_ASSISTANT': navigate('/ai-assistant'); break;
        
        // Admin Routes
        case 'ADMIN_DASHBOARD': navigate('/admin'); break;
        case 'ADMIN_PRODUCTS': navigate('/admin/products'); break;
        case 'ADMIN_ORDERS': navigate('/admin/orders'); break;
        case 'ADMIN_USERS': navigate('/admin/users'); break;
        case 'ADMIN_BLOG': navigate('/admin/blog'); break;
        case 'ADMIN_CATEGORIES': navigate('/admin/categories'); break;
        case 'ADMIN_SETTINGS': navigate('/admin/settings'); break;
        default: navigate('/');
      }
    }, 300);
  };

  const handleCategorySelect = (category: string) => {
      setTargetCategory(category);
      navigate('/catalog');
  };

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.id}`);
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
    if (loggedInUser.role === 'ADMIN') {
        navigate('/admin');
    } else {
        navigate('/');
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const handleUserUpdate = (updatedUser: User) => {
      setUser(updatedUser);
  };

  // Check if current route is an Admin route
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    // Basic protection
    if (!user || user.role !== 'ADMIN') {
        // In a real app, redirection happens here. 
        // For demo/dev purposes, sometimes we might want to bypass, but let's redirect to login
        // return <Navigate to="/login" replace />; 
    }

    return (
      <AdminLayout currentView={currentView} onChangeView={handleNavigate} onLogout={handleLogout}>
        <div className="animate-fadeInUp">
            <Routes>
                <Route path="/" element={<AdminDashboard onChangeView={handleNavigate} />} />
                <Route path="/products" element={<AdminProducts />} />
                <Route path="/orders" element={<AdminOrders />} />
                <Route path="/users" element={<AdminUsers />} />
                <Route path="/blog" element={<AdminBlog />} />
                <Route path="/categories" element={<AdminCategories />} />
                <Route path="/settings" element={<AdminSettings />} />
                <Route path="*" element={<AdminDashboard onChangeView={handleNavigate} />} />
            </Routes>
        </div>
      </AdminLayout>
    );
  }

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
        <div className="animate-fadeInUp">
            <Routes>
                <Route path="/" element={
                    <Home 
                        onChangeView={handleNavigate} 
                        onProductClick={handleProductClick} 
                        onAddToCart={addToCart} 
                        wishlist={wishlist}
                        onToggleWishlist={toggleWishlist}
                        onCategorySelect={handleCategorySelect}
                    />
                } />
                <Route path="/catalog" element={
                    <Catalog 
                        onProductClick={handleProductClick}
                        onAddToCart={addToCart}
                        wishlist={wishlist}
                        onToggleWishlist={toggleWishlist}
                        initialCategory={targetCategory}
                    />
                } />
                <Route path="/product/:id" element={
                    <ProductDetail 
                        onBack={() => navigate('/catalog')}
                        onAddToCart={addToCart}
                        onProductClick={handleProductClick}
                        wishlist={wishlist}
                        onToggleWishlist={toggleWishlist}
                        onLoadingStateChange={setIsLoading}
                    />
                } />
                <Route path="/cart" element={
                    <Cart 
                        cart={cart}
                        onUpdateQuantity={updateCartQuantity}
                        onRemove={removeFromCart}
                        onChangeView={handleNavigate}
                    />
                } />
                <Route path="/checkout" element={
                    <Checkout 
                        cart={cart}
                        user={user}
                        onSuccess={() => {
                            clearCart();
                            navigate('/profile');
                        }}
                        onLoginRequest={() => navigate('/login')}
                        onLoadingStateChange={setIsLoading}
                    />
                } />
                <Route path="/login" element={
                    <Login onLogin={handleLogin} onCancel={() => navigate('/')} />
                } />
                <Route path="/profile" element={
                    user ? (
                        <UserProfile 
                            user={user} 
                            onLogout={handleLogout} 
                            onUpdateUser={handleUserUpdate} 
                            onEnterAdmin={() => navigate('/admin')}
                            onEnterSettings={() => navigate('/admin/settings')}
                        />
                    ) : <Navigate to="/login" replace />
                } />
                <Route path="/blog" element={<Blog />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/ai-assistant" element={<AiAssistant onLoadingStateChange={setIsLoading} />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
