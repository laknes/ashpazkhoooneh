
export interface Product {
  id: number;
  name: string;
  price: number;
  oldPrice?: number;
  category: string;
  image: string;
  description: string;
  rating: number;
  reviews: number;
  features: string[];
  tags?: string[];
  // SEO Specific Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface User {
  id: number;
  name: string;
  phone: string;
  password?: string; // Added for password-based login
  role: 'USER' | 'ADMIN';
  email: string; // Mandatory
  province?: string;
  city?: string;
  address?: string; // Street Address
  postalCode: string; // Mandatory
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  date: string;
  author: string;
  tags?: string[];
  // SEO Specific Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface Category {
  id: number;
  name: string;
  image: string;
  icon?: string;
  // SEO Specific Fields
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
}

export interface HeroSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

export interface SmsConfig {
  provider: 'kavenegar' | 'ghasedak' | 'other';
  apiKey: string;
  lineNumber: string;
}

export interface PaymentConfig {
  activeGateway: 'zarinpal' | 'nextpay' | 'zibal' | 'none';
  zarinpalMerchant: string;
  nextpayToken: string;
  zibalMerchant: string;
  isSandbox: boolean;
}

export interface ShippingConfig {
  baseCost: number;
  freeThreshold: number;
  apiToken: string; // For potential API integration (Tipax/Post)
}

export interface SeoConfig {
  defaultTitle: string;
  titleTemplate: string; // e.g. "%s | Ashpazkhoneh"
  defaultDescription: string;
  defaultKeywords: string;
  siteUrl: string; // For canonical links
}

export interface SslConfig {
  enabled: boolean;
  provider: 'manual' | 'cloudflare'; // Added cloudflare option
  certCrt: string;
  privateKey: string;
  chain?: string;
}

export interface CloudinaryConfig {
  enabled: boolean;
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export interface SiteSettings {
  heroSlides: HeroSlide[];
  contact: {
    phone: string;
    email: string;
    address: string;
  };
  socialMedia: {
    instagram: string;
    twitter: string;
    linkedin: string;
    telegram: string;
    custom?: { id: number; name: string; url: string }[];
  };
  favicon?: string; // Website Favicon
  sms: SmsConfig;
  payment: PaymentConfig;
  shipping: ShippingConfig;
  seo: SeoConfig;
  ssl: SslConfig;
  cloudinary?: CloudinaryConfig; // Added Cloudinary
  aboutText: string;
}

export interface Review {
  id: number;
  productId: number;
  userId: number;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface Coupon {
  id: number;
  code: string;
  type: 'PERCENTAGE' | 'FIXED';
  value: number; 
  minOrderAmount?: number;
  expirationDate?: string;
  isActive: boolean;
}

export type ViewState = 
  | 'HOME' 
  | 'CATALOG' 
  | 'PRODUCT_DETAIL' 
  | 'CART' 
  | 'CHECKOUT' 
  | 'LOGIN'
  | 'USER_PROFILE'
  | 'BLOG'
  | 'ABOUT'
  | 'CONTACT'
  | 'AI_ASSISTANT'
  | 'ADMIN_DASHBOARD'
  | 'ADMIN_PRODUCTS'
  | 'ADMIN_ORDERS'
  | 'ADMIN_BLOG'
  | 'ADMIN_CATEGORIES'
  | 'ADMIN_SETTINGS'
  | 'ADMIN_USERS';

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isError?: boolean;
}

export type OrderStatus = 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

export interface Order {
  id: string;
  customerName: string;
  totalAmount: number;
  status: OrderStatus;
  date: string;
  items: CartItem[];
}
