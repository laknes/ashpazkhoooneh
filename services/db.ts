
import { Product, Order, OrderStatus, BlogPost, Category, SiteSettings, User, HeroSlide, Review, Coupon } from '../types';
import { MOCK_PRODUCTS, CATEGORIES, BLOG_POSTS, HERO_IMAGE } from '../constants';

// Simulated Database Keys
const DB_PRODUCTS_KEY = 'ashpazkhoneh_products';
const DB_ORDERS_KEY = 'ashpazkhoneh_orders';
const DB_POSTS_KEY = 'ashpazkhoneh_posts';
const DB_CATEGORIES_KEY = 'ashpazkhoneh_categories';
const DB_SETTINGS_KEY = 'ashpazkhoneh_settings';
const DB_WISHLIST_KEY = 'ashpazkhoneh_wishlist';
const DB_USERS_KEY = 'ashpazkhoneh_users';
const DB_REVIEWS_KEY = 'ashpazkhoneh_reviews';
const DB_COUPONS_KEY = 'ashpazkhoneh_coupons';

// Helper to safely parse JSON from localStorage
const safeParse = <T>(key: string, fallback: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch (error) {
    console.warn(`Error parsing data for key "${key}":`, error);
    return fallback;
  }
};

// Helper to safely save to localStorage
const safeSave = (key: string, value: any): boolean => {
  try {
    const stringValue = JSON.stringify(value);
    const currentValue = localStorage.getItem(key);
    
    // Optimization: Don't write if data hasn't changed to avoid quota hits
    if (currentValue === stringValue) return true;

    localStorage.setItem(key, stringValue);
    return true;
  } catch (error: any) {
    if (error.name === 'QuotaExceededError' || 
        error.code === 22 || 
        error.code === 1014 || 
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.warn(`LocalStorage quota exceeded when saving "${key}". Data might not persist. Clear some space.`);
    } else {
      console.error(`Error saving data for key "${key}":`, error);
    }
    return false;
  }
};

// Initialize DB with mock data if empty
const initDB = () => {
  try {
    // Always update categories to match constants (dev mode behavior) to show new categories
    safeSave(DB_CATEGORIES_KEY, CATEGORIES);

    // If products are empty OR we want to reset to show new mock data
    const storedProducts = safeParse<Product[]>(DB_PRODUCTS_KEY, []);
    if (storedProducts.length <= 6) {
       safeSave(DB_PRODUCTS_KEY, MOCK_PRODUCTS);
    }

    if (!localStorage.getItem(DB_ORDERS_KEY)) {
      // Generate some mock orders
      const mockOrders: Order[] = [
        {
          id: 'ORD-1001',
          customerName: 'علی رضایی',
          totalAmount: 12500000,
          status: 'DELIVERED',
          date: new Date(Date.now() - 86400000 * 2).toISOString(),
          items: []
        },
        {
          id: 'ORD-1002',
          customerName: 'سارا محمدی',
          totalAmount: 4200000,
          status: 'PROCESSING',
          date: new Date(Date.now() - 3600000 * 5).toISOString(),
          items: []
        }
      ];
      safeSave(DB_ORDERS_KEY, mockOrders);
    }
    
    // Update posts to match constants
    safeSave(DB_POSTS_KEY, BLOG_POSTS);

    if (!localStorage.getItem(DB_USERS_KEY)) {
      const mockUsers: User[] = [
        { id: 1, name: 'مدیر کل', phone: '09123456789', password: 'admin', role: 'ADMIN', email: 'admin@ashpazkhoneh.com', province: 'تهران', city: 'تهران', address: 'دفتر مرکزی', postalCode: '1234567890' },
        { id: 2, name: 'علی رضایی', phone: '09121111111', role: 'USER', email: 'ali@example.com', province: 'تهران', city: 'تهران', address: 'خیابان ولیعصر', postalCode: '1111111111' },
        { id: 3, name: 'سارا محمدی', phone: '09352222222', role: 'USER', email: 'sara@example.com', province: 'البرز', city: 'کرج', address: 'عظیمیه', postalCode: '2222222222' },
      ];
      safeSave(DB_USERS_KEY, mockUsers);
    } else {
        // Migration: Ensure admin has a password
        const existingUsers = safeParse<User[]>(DB_USERS_KEY, []);
        let usersUpdated = false;
        existingUsers.forEach(u => {
            if (u.role === 'ADMIN' && !u.password) {
                u.password = 'admin';
                usersUpdated = true;
            }
        });
        if (usersUpdated) {
            safeSave(DB_USERS_KEY, existingUsers);
        }
    }

    if (!localStorage.getItem(DB_REVIEWS_KEY)) {
      const mockReviews: Review[] = [
          { id: 1, productId: 1, userId: 2, userName: 'علی رضایی', rating: 5, comment: 'واقعا عالیه، هر روز صبح باهاش قهوه درست می‌کنم و کیفیتش بی‌نظیره.', date: '1403/02/10', status: 'APPROVED' },
          { id: 2, productId: 1, userId: 3, userName: 'سارا محمدی', rating: 4, comment: 'دستگاه خوبیه اما کاش مخزن آبش بزرگتر بود.', date: '1403/02/12', status: 'APPROVED' },
          { id: 3, productId: 2, userId: 2, userName: 'علی رضایی', rating: 5, comment: 'خیلی نچسب و با کیفیته.', date: '1403/02/15', status: 'APPROVED' }
      ];
      safeSave(DB_REVIEWS_KEY, mockReviews);
    }

    if (!localStorage.getItem(DB_COUPONS_KEY)) {
        const mockCoupons: Coupon[] = [
            { id: 1, code: 'WELCOME', type: 'PERCENTAGE', value: 10, isActive: true },
            { id: 2, code: 'SUMMER20', type: 'PERCENTAGE', value: 20, minOrderAmount: 1000000, isActive: true },
            { id: 3, code: 'OFF50K', type: 'FIXED', value: 50000, minOrderAmount: 500000, isActive: true }
        ];
        safeSave(DB_COUPONS_KEY, mockCoupons);
    }

    const defaultSlides: HeroSlide[] = [
        {
          id: 1,
          image: HERO_IMAGE,
          title: 'آشپزخانه‌ای مدرن و حرفه‌ای',
          subtitle: 'بهترین لوازم آشپزخانه از برترین برندهای جهان را با ضمانت اصالت و ارسال سریع تجربه کنید.'
        },
        {
          id: 2,
          image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?q=80&w=2070&auto=format&fit=crop',
          title: 'زیبایی در جزئیات',
          subtitle: 'مجموعه‌ای از ظروف پذیرایی خاص برای میزبانی‌های به یاد ماندنی شما.'
        },
        {
          id: 3,
          image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=2070&auto=format&fit=crop',
          title: 'آشپزی آسان و لذت‌بخش',
          subtitle: 'با ابزارهای حرفه‌ای، آشپزی را به هنری لذت‌بخش تبدیل کنید.'
        }
    ];

    const storedSettings = safeParse<SiteSettings | null>(DB_SETTINGS_KEY, null);
    
    // Default SEO Settings
    const defaultSeo = {
        defaultTitle: 'آشپزخونه | لوازم لوکس خانه و آشپزخانه',
        titleTemplate: '%s | آشپزخونه',
        defaultDescription: 'فروشگاه آنلاین لوازم آشپزخانه لوکس و مدرن. خرید انواع ظروف، لوازم برقی و دکوراتیو با بهترین کیفیت و قیمت.',
        defaultKeywords: 'لوازم آشپزخانه, لوازم خانگی, جهیزیه, ظروف پذیرایی, خرید آنلاین',
        siteUrl: 'https://ashpazkhoneh.ir'
    };

    let settings: SiteSettings;

    if (!storedSettings) {
      settings = {
        heroSlides: defaultSlides,
        contact: {
          phone: '021-12345678',
          email: 'info@ashpazkhoneh.com',
          address: 'تهران، خیابان ولیعصر، برج تجارت، طبقه ۵، واحد ۲۰'
        },
        socialMedia: {
          instagram: 'https://instagram.com',
          twitter: 'https://twitter.com',
          linkedin: 'https://linkedin.com',
          telegram: 'https://telegram.org'
        },
        sms: {
          provider: 'kavenegar',
          apiKey: '',
          lineNumber: ''
        },
        payment: {
          activeGateway: 'none',
          zarinpalMerchant: '',
          nextpayToken: '',
          zibalMerchant: '',
          isSandbox: true
        },
        shipping: {
          baseCost: 150000,
          freeThreshold: 5000000,
          apiToken: ''
        },
        seo: defaultSeo,
        aboutText: `فروشگاه اینترنتی آشپزخونه با هدف ارائه بهترین و باکیفیت‌ترین لوازم خانه و آشپزخانه فعالیت خود را آغاز کرده است. ما بر این باوریم که قلب هر خانه، آشپزخانه آن است و شایستگی استفاده از بهترین ابزارها را دارد.

ما مجموعه‌ای از برترین برندهای جهانی و داخلی را گرد هم آورده‌ایم تا شما بتوانید با اطمینان خاطر از اصالت کالا، خریدی لذت‌بخش را تجربه کنید. تیم پشتیبانی ما همواره آماده پاسخگویی به سوالات شما و راهنمایی در انتخاب بهترین محصول متناسب با نیازتان است.`
      };
      safeSave(DB_SETTINGS_KEY, settings);
    } else {
      // Migration logic
      const parsed = storedSettings;
      let updated = false;

      if (!parsed.heroSlides) {
          parsed.heroSlides = defaultSlides;
          if ((parsed as any).heroImage) delete (parsed as any).heroImage; 
          updated = true;
      }

      if (!parsed.socialMedia) {
          parsed.socialMedia = {
              instagram: 'https://instagram.com',
              twitter: 'https://twitter.com',
              linkedin: 'https://linkedin.com',
              telegram: 'https://telegram.org'
          };
          updated = true;
      }

      if (!parsed.sms) {
          parsed.sms = { provider: 'kavenegar', apiKey: '', lineNumber: '' };
          updated = true;
      }

      if (!parsed.payment) {
          parsed.payment = { 
              activeGateway: 'none', 
              zarinpalMerchant: '', 
              nextpayToken: '', 
              zibalMerchant: '', 
              isSandbox: true 
          };
          updated = true;
      }

      if (!parsed.shipping) {
          parsed.shipping = { 
              baseCost: 150000, 
              freeThreshold: 5000000, 
              apiToken: '' 
          };
          updated = true;
      }

      if (!parsed.seo) {
          parsed.seo = defaultSeo;
          updated = true;
      }

      if (updated) {
          safeSave(DB_SETTINGS_KEY, parsed);
      }
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
};

// Initialize immediately in browser
if (typeof window !== 'undefined') {
  try {
    initDB();
  } catch (e) {
    console.error("Critical: DB init failed", e);
  }
}

export const db = {
  products: {
    getAll: (): Product[] => safeParse<Product[]>(DB_PRODUCTS_KEY, []),
    getBestSellers: (): Product[] => {
        const products = db.products.getAll();
        return products
            .sort((a, b) => (b.rating * 100 + b.reviews) - (a.rating * 100 + a.reviews))
            .slice(0, 4);
    },
    getById: (id: number): Product | undefined => {
      const products = db.products.getAll();
      return products.find(p => p.id === id);
    },
    add: (product: Omit<Product, 'id'>): Product => {
      const products = db.products.getAll();
      const newProduct = { ...product, id: Date.now() }; 
      products.push(newProduct);
      safeSave(DB_PRODUCTS_KEY, products);
      return newProduct;
    },
    update: (id: number, updates: Partial<Product>): Product | null => {
      const products = db.products.getAll();
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return null;
      
      const updatedProduct = { ...products[index], ...updates };
      products[index] = updatedProduct;
      safeSave(DB_PRODUCTS_KEY, products);
      return updatedProduct;
    },
    delete: (id: number): boolean => {
      const products = db.products.getAll();
      const filtered = products.filter(p => p.id !== id);
      safeSave(DB_PRODUCTS_KEY, filtered);
      return true;
    }
  },
  orders: {
    getAll: (): Order[] => safeParse<Order[]>(DB_ORDERS_KEY, []),
    updateStatus: (id: string, status: OrderStatus): void => {
      const orders = db.orders.getAll();
      const order = orders.find(o => o.id === id);
      if (order) {
        order.status = status;
        safeSave(DB_ORDERS_KEY, orders);
      }
    }
  },
  users: {
    getAll: (): User[] => safeParse<User[]>(DB_USERS_KEY, []),
    getByPhone: (phone: string): User | undefined => {
        const users = db.users.getAll();
        return users.find(u => u.phone === phone);
    },
    findByLogin: (login: string): User | undefined => {
        const users = db.users.getAll();
        return users.find(u => u.phone === login || u.email === login);
    },
    add: (user: Omit<User, 'id'>): User => {
      const users = db.users.getAll();
      const newUser = { ...user, id: Date.now() };
      users.push(newUser);
      safeSave(DB_USERS_KEY, users);
      return newUser;
    },
    update: (id: number, updates: Partial<User>): User | null => {
      const users = db.users.getAll();
      const index = users.findIndex(u => u.id === id);
      if (index === -1) return null;
      
      const updatedUser = { ...users[index], ...updates };
      users[index] = updatedUser;
      safeSave(DB_USERS_KEY, users);
      return updatedUser;
    },
    updateRole: (id: number, role: 'ADMIN' | 'USER'): User | null => {
      return db.users.update(id, { role });
    },
    delete: (id: number): boolean => {
      const users = db.users.getAll();
      const filtered = users.filter(u => u.id !== id);
      safeSave(DB_USERS_KEY, filtered);
      return true;
    }
  },
  posts: {
    getAll: (): BlogPost[] => safeParse<BlogPost[]>(DB_POSTS_KEY, []),
    add: (post: Omit<BlogPost, 'id'>): BlogPost => {
      const posts = db.posts.getAll();
      const newPost = { ...post, id: Date.now() };
      posts.push(newPost);
      safeSave(DB_POSTS_KEY, posts);
      return newPost;
    },
    update: (id: number, updates: Partial<BlogPost>): BlogPost | null => {
      const posts = db.posts.getAll();
      const index = posts.findIndex(p => p.id === id);
      if (index === -1) return null;
      posts[index] = { ...posts[index], ...updates };
      safeSave(DB_POSTS_KEY, posts);
      return posts[index];
    },
    delete: (id: number): boolean => {
      const posts = db.posts.getAll();
      const filtered = posts.filter(p => p.id !== id);
      safeSave(DB_POSTS_KEY, filtered);
      return true;
    }
  },
  categories: {
    getAll: (): Category[] => safeParse<Category[]>(DB_CATEGORIES_KEY, []),
    add: (category: Omit<Category, 'id'>): Category => {
      const categories = db.categories.getAll();
      const newCat = { ...category, id: Date.now() };
      categories.push(newCat);
      safeSave(DB_CATEGORIES_KEY, categories);
      return newCat;
    },
    update: (id: number, updates: Partial<Category>): Category | null => {
      const categories = db.categories.getAll();
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) return null;
      categories[index] = { ...categories[index], ...updates };
      safeSave(DB_CATEGORIES_KEY, categories);
      return categories[index];
    },
    delete: (id: number): boolean => {
      const categories = db.categories.getAll();
      const filtered = categories.filter(c => c.id !== id);
      safeSave(DB_CATEGORIES_KEY, filtered);
      return true;
    }
  },
  reviews: {
    getAll: (): Review[] => safeParse<Review[]>(DB_REVIEWS_KEY, []),
    getByProductId: (productId: number): Review[] => {
        const reviews = db.reviews.getAll();
        return reviews.filter(r => r.productId === productId && r.status === 'APPROVED');
    },
    add: (review: Omit<Review, 'id' | 'status'>): Review => {
        const reviews = db.reviews.getAll();
        const newReview: Review = { ...review, id: Date.now(), status: 'APPROVED' }; 
        reviews.push(newReview);
        safeSave(DB_REVIEWS_KEY, reviews);
        
        // Update product stats
        const productReviews = reviews.filter(r => r.productId === review.productId && r.status === 'APPROVED');
        if (productReviews.length > 0) {
            const totalRating = productReviews.reduce((sum, r) => sum + r.rating, 0);
            const avgRating = parseFloat((totalRating / productReviews.length).toFixed(1));
            db.products.update(review.productId, { 
                rating: avgRating, 
                reviews: productReviews.length 
            });
        }

        return newReview;
    }
  },
  coupons: {
    getAll: (): Coupon[] => safeParse<Coupon[]>(DB_COUPONS_KEY, []),
    getByCode: (code: string): Coupon | undefined => {
        const coupons = db.coupons.getAll();
        return coupons.find(c => c.code === code && c.isActive);
    },
    add: (coupon: Omit<Coupon, 'id'>): Coupon => {
        const coupons = db.coupons.getAll();
        const newCoupon = { ...coupon, id: Date.now() };
        coupons.push(newCoupon);
        safeSave(DB_COUPONS_KEY, coupons);
        return newCoupon;
    },
    delete: (id: number): boolean => {
        const coupons = db.coupons.getAll();
        const filtered = coupons.filter(c => c.id !== id);
        safeSave(DB_COUPONS_KEY, filtered);
        return true;
    }
  },
  settings: {
    get: (): SiteSettings => {
      const settings = safeParse<SiteSettings | null>(DB_SETTINGS_KEY, null);
      if (settings) {
          // Backward compatibility checks
          if (!settings.heroSlides) settings.heroSlides = [];
          if (!settings.socialMedia) {
             settings.socialMedia = {
                instagram: '',
                twitter: '',
                linkedin: '',
                telegram: ''
             };
          }
          if (!settings.sms) settings.sms = { provider: 'kavenegar', apiKey: '', lineNumber: '' };
          if (!settings.payment) settings.payment = { activeGateway: 'none', zarinpalMerchant: '', nextpayToken: '', zibalMerchant: '', isSandbox: true };
          if (!settings.shipping) settings.shipping = { baseCost: 150000, freeThreshold: 5000000, apiToken: '' };
          if (!settings.seo) {
              settings.seo = {
                defaultTitle: 'آشپزخونه | لوازم لوکس خانه و آشپزخانه',
                titleTemplate: '%s | آشپزخونه',
                defaultDescription: 'فروشگاه آنلاین لوازم آشپزخانه لوکس و مدرن. خرید انواع ظروف، لوازم برقی و دکوراتیو با بهترین کیفیت و قیمت.',
                defaultKeywords: 'لوازم آشپزخانه, لوازم خانگی, جهیزیه, ظروف پذیرایی, خرید آنلاین',
                siteUrl: 'https://ashpazkhoneh.ir'
              };
          }
          
          return settings;
      }
      // This part should technically be covered by initDB, but safe as fallback
      return {
        heroSlides: [],
        contact: { phone: '', email: '', address: '' },
        socialMedia: { instagram: '', twitter: '', linkedin: '', telegram: '' },
        sms: { provider: 'kavenegar', apiKey: '', lineNumber: '' },
        payment: { activeGateway: 'none', zarinpalMerchant: '', nextpayToken: '', zibalMerchant: '', isSandbox: true },
        shipping: { baseCost: 150000, freeThreshold: 5000000, apiToken: '' },
        seo: {
            defaultTitle: 'آشپزخونه',
            titleTemplate: '%s | آشپزخونه',
            defaultDescription: '',
            defaultKeywords: '',
            siteUrl: ''
        },
        aboutText: ''
      };
    },
    update: (settings: SiteSettings): void => {
      safeSave(DB_SETTINGS_KEY, settings);
    }
  },
  wishlist: {
    get: (): number[] => safeParse<number[]>(DB_WISHLIST_KEY, []),
    toggle: (productId: number): number[] => {
      const list = db.wishlist.get();
      const index = list.indexOf(productId);
      let newList;
      if (index === -1) {
        newList = [...list, productId];
      } else {
        newList = list.filter(id => id !== productId);
      }
      safeSave(DB_WISHLIST_KEY, newList);
      return newList;
    }
  },
  stats: {
    getSummary: () => {
      const products = db.products.getAll();
      const orders = db.orders.getAll();
      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        productsCount: products.length,
        ordersCount: orders.length,
        totalSales: totalSales,
        pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length
      };
    }
  }
};