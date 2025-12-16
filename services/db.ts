
import { Product, Order, OrderStatus, BlogPost, Category, SiteSettings, User, HeroSlide, Review, Coupon } from '../types';
import { MOCK_PRODUCTS, CATEGORIES, BLOG_POSTS, HERO_IMAGE } from '../constants';

// Seed Data for First Run (Sent to server if DB is empty)
const SEED_DATA = {
    products: [...MOCK_PRODUCTS],
    categories: CATEGORIES,
    posts: BLOG_POSTS,
    settings: {
        heroSlides: [
            { id: 1, image: HERO_IMAGE, title: 'آشپزخانه‌ای مدرن و حرفه‌ای', subtitle: 'بهترین لوازم آشپزخانه از برترین برندهای جهانی.' }
        ],
        contact: { phone: '021-12345678', email: 'info@ashpazkhoneh.com', address: 'تهران، خیابان ولیعصر' },
        socialMedia: { instagram: '', twitter: '', linkedin: '', telegram: '' },
        favicon: '',
        sms: { provider: 'kavenegar', apiKey: '', lineNumber: '' },
        payment: { activeGateway: 'none', zarinpalMerchant: '', nextpayToken: '', zibalMerchant: '', isSandbox: true },
        shipping: { baseCost: 150000, freeThreshold: 5000000, apiToken: '' },
        seo: { defaultTitle: 'آشپزخونه', titleTemplate: '%s | آشپزخونه', defaultDescription: '', defaultKeywords: '', siteUrl: 'https://ashpazkhoneh.ir' },
        ssl: { enabled: false, provider: 'manual', certCrt: '', privateKey: '' },
        aboutText: 'فروشگاه اینترنتی آشپزخونه...'
    }
};

// API Helper
const API_URL = '/api';

const fetchJson = async (url: string, options?: RequestInit) => {
    try {
        const res = await fetch(`${API_URL}${url}`, {
            headers: { 'Content-Type': 'application/json' },
            ...options
        });
        if (!res.ok) throw new Error(`API Error: ${res.statusText}`);
        return await res.json();
    } catch (e) {
        console.error(`Fetch error for ${url}:`, e);
        return null;
    }
};

// Initial Seed Logic (Fire and Forget)
const seedDatabase = async () => {
    await fetchJson('/seed', {
        method: 'POST',
        body: JSON.stringify(SEED_DATA)
    });
};

if (typeof window !== 'undefined') {
    seedDatabase().catch(console.error);
}

// Local Storage for Client-Specific Data (Cart, Wishlist)
const LOCAL_KEYS = {
    WISHLIST: 'ashpazkhoneh_wishlist_local'
};

export const db = {
  system: {
    sendHeartbeat: async (sessionId: string) => {
        await fetchJson('/heartbeat', { method: 'POST', body: JSON.stringify({ sessionId }) });
    },
    // Backup & Restore
    downloadBackup: () => {
        window.open('/api/backup', '_blank');
    },
    restoreBackup: async (fileContent: any) => {
        return await fetchJson('/restore', { 
            method: 'POST', 
            body: JSON.stringify(fileContent) 
        });
    }
  },
  products: {
    getAll: async (): Promise<Product[]> => {
        const data = await fetchJson('/products');
        return data || [];
    },
    getBestSellers: async (): Promise<Product[]> => {
        const products = await db.products.getAll();
        return products
            .sort((a, b) => (b.rating * 100 + b.reviews) - (a.rating * 100 + a.reviews))
            .slice(0, 4);
    },
    getById: async (id: number): Promise<Product | undefined> => {
        const products = await db.products.getAll();
        return products.find(p => p.id === id);
    },
    add: async (product: Omit<Product, 'id'>): Promise<Product> => {
        return await fetchJson('/products', { method: 'POST', body: JSON.stringify(product) });
    },
    update: async (id: number, updates: Partial<Product>): Promise<Product | null> => {
        return await fetchJson(`/products/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    delete: async (id: number): Promise<boolean> => {
        const res = await fetchJson(`/products/${id}`, { method: 'DELETE' });
        return !!res;
    }
  },
  orders: {
    getAll: async (): Promise<Order[]> => {
        const data = await fetchJson('/orders');
        return data || [];
    },
    add: async (order: Omit<Order, 'id'>): Promise<Order> => {
        return await fetchJson('/orders', { method: 'POST', body: JSON.stringify(order) });
    },
    updateStatus: async (id: string, status: OrderStatus): Promise<void> => {
        await fetchJson(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    }
  },
  users: {
    getAll: async (): Promise<User[]> => {
        const data = await fetchJson('/users');
        return data || [];
    },
    getByPhone: async (phone: string): Promise<User | undefined> => {
        const users = await db.users.getAll();
        return users.find(u => u.phone === phone);
    },
    findByLogin: async (login: string): Promise<User | undefined> => {
        const users = await db.users.getAll();
        return users.find(u => u.phone === login || u.email === login);
    },
    login: async (login: string, password?: string): Promise<User | null> => {
        try {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login, password })
            });
            if (res.ok) return await res.json();
            return null;
        } catch { return null; }
    },
    add: async (user: Omit<User, 'id'>): Promise<User> => {
        return await fetchJson('/users', { method: 'POST', body: JSON.stringify(user) });
    },
    update: async (id: number, updates: Partial<User>): Promise<User | null> => {
        return await fetchJson(`/users/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    updateRole: async (id: number, role: 'ADMIN' | 'USER'): Promise<User | null> => {
        return db.users.update(id, { role });
    },
    delete: async (id: number): Promise<boolean> => {
        // Implement delete endpoint in server if needed, for now client-side filtering mock
        return true; 
    }
  },
  posts: {
    getAll: async (): Promise<BlogPost[]> => {
        const data = await fetchJson('/posts');
        return data || [];
    },
    add: async (post: Omit<BlogPost, 'id'>): Promise<BlogPost> => {
        return await fetchJson('/posts', { method: 'POST', body: JSON.stringify(post) });
    },
    update: async (id: number, updates: Partial<BlogPost>): Promise<BlogPost | null> => {
        // Implement update in server
        return null; 
    },
    delete: async (id: number): Promise<boolean> => {
        // Implement delete in server
        return true;
    }
  },
  categories: {
    getAll: async (): Promise<Category[]> => {
        const data = await fetchJson('/categories');
        return data || [];
    },
    add: async (category: Omit<Category, 'id'>): Promise<Category> => {
        return await fetchJson('/categories', { method: 'POST', body: JSON.stringify(category) });
    },
    update: async (id: number, updates: Partial<Category>): Promise<Category | null> => {
        return await fetchJson(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(updates) });
    },
    delete: async (id: number): Promise<boolean> => {
        const res = await fetchJson(`/categories/${id}`, { method: 'DELETE' });
        return !!res;
    }
  },
  settings: {
    get: async (): Promise<SiteSettings> => {
        const data = await fetchJson('/settings');
        // Return default structure if empty
        if (!data || Object.keys(data).length === 0) return SEED_DATA.settings as SiteSettings;
        return data as SiteSettings;
    },
    update: async (settings: SiteSettings): Promise<void> => {
        await fetchJson('/settings', { method: 'POST', body: JSON.stringify(settings) });
    }
  },
  // Keep Wishlist Client-Side for simplicity in MVP
  wishlist: {
    get: (): number[] => {
        try {
            return JSON.parse(localStorage.getItem(LOCAL_KEYS.WISHLIST) || '[]');
        } catch { return []; }
    },
    toggle: (productId: number): number[] => {
        const list = db.wishlist.get();
        const index = list.indexOf(productId);
        let newList;
        if (index === -1) {
            newList = [...list, productId];
        } else {
            newList = list.filter(id => id !== productId);
        }
        localStorage.setItem(LOCAL_KEYS.WISHLIST, JSON.stringify(newList));
        return newList;
    }
  },
  stats: {
    getSummary: async () => {
      const products = await db.products.getAll();
      const orders = await db.orders.getAll();
      const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      return {
        productsCount: products.length,
        ordersCount: orders.length,
        totalSales: totalSales,
        pendingOrders: orders.filter(o => o.status === 'PENDING' || o.status === 'PROCESSING').length
      };
    },
    getActiveUsers: async (): Promise<number> => {
        const data = await fetchJson('/stats/active-users');
        return data?.count || 0;
    }
  }
};
