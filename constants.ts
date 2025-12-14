
import { Product, Category } from './types';

// Replace this URL with your uploaded image path (e.g., '/images/hero-banner.jpg')
export const HERO_IMAGE = "https://images.unsplash.com/photo-1556910103-1c02745a30bf?q=80&w=2070&auto=format&fit=crop";

export const CATEGORIES: Category[] = [
  { id: 1, name: "لوازم برقی", image: "https://images.unsplash.com/photo-1570222094114-28a9d88a27e6?q=80&w=200&auto=format&fit=crop" },
  { id: 2, name: "پخت و پز", image: "https://images.unsplash.com/photo-1584990347449-a60361bfdd29?q=80&w=200&auto=format&fit=crop" },
  { id: 3, name: "سرو و پذیرایی", image: "https://images.unsplash.com/photo-1578357078586-4917d4b0d6a8?q=80&w=200&auto=format&fit=crop" },
  { id: 4, name: "نوشیدنی‌ساز", image: "https://images.unsplash.com/photo-1594254215286-9a22f3020614?q=80&w=200&auto=format&fit=crop" },
  { id: 5, name: "ابزار آشپزخانه", image: "https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?q=80&w=200&auto=format&fit=crop" },
  { id: 6, name: "شستشو و نظافت", image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=200&auto=format&fit=crop" },
  { id: 7, name: "نظم‌دهنده", image: "https://images.unsplash.com/photo-1591123720164-de1348028a82?q=80&w=200&auto=format&fit=crop" },
  { id: 8, name: "منسوجات", image: "https://images.unsplash.com/photo-1516961642265-531546e84af2?q=80&w=200&auto=format&fit=crop" },
  { id: 9, name: "دکوراتیو", image: "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=200&auto=format&fit=crop" },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "اسپرسوساز حرفه‌ای دلونگی",
    price: 8500000,
    oldPrice: 9200000,
    category: "نوشیدنی‌ساز",
    image: "https://images.unsplash.com/photo-1572535978393-2ae2b1e42b24?q=80&w=400&auto=format&fit=crop",
    description: "دستگاه اسپرسوساز تمام اتوماتیک با قابلیت تهیه کاپوچینو و لته. دارای آسیاب داخلی و سیستم گرمایش سریع.",
    rating: 4.8,
    reviews: 124,
    features: ["فشار ۲۰ بار", "مخزن شیر", "صفحه نمایش لمسی"]
  },
  {
    id: 2,
    name: "سرویس قابلمه گرانیتی ۱۰ پارچه",
    price: 4200000,
    category: "پخت و پز",
    image: "https://images.unsplash.com/photo-1585512330541-d3a3754d92eb?q=80&w=400&auto=format&fit=crop",
    description: "سرویس قابلمه نچسب با پوشش گرانیت طبیعی. مقاوم در برابر خط و خش و حرارت بالا.",
    rating: 4.5,
    reviews: 85,
    features: ["درب پیرکس", "کف القایی", "بدون مواد سمی"]
  },
  {
    id: 3,
    name: "مخلوط کن و اسموتی ساز",
    price: 2100000,
    oldPrice: 2500000,
    category: "لوازم برقی",
    image: "https://images.unsplash.com/photo-1570222094114-28a9d88a27e6?q=80&w=400&auto=format&fit=crop",
    description: "موتور قدرتمند ۱۰۰۰ وات با تیغه‌های استیل ضد زنگ. مناسب برای تهیه انواع اسموتی و سوپ سرد.",
    rating: 4.2,
    reviews: 45,
    features: ["پارچ شیشه‌ای", "عملکرد پالس", "قفل ایمنی"]
  },
  {
    id: 4,
    name: "ست چاقوی آشپزخانه حرفه‌ای",
    price: 1800000,
    category: "ابزار آشپزخانه",
    image: "https://images.unsplash.com/photo-1593618998160-e34014e67546?q=80&w=400&auto=format&fit=crop",
    description: "ست ۶ عددی چاقوی استیل با پایه چوبی. بسیار تیز و خوش دست برای سرآشپزها.",
    rating: 4.9,
    reviews: 210,
    features: ["استیل وانادیوم", "دسته ارگونومیک", "ضد زنگ"]
  },
  {
    id: 5,
    name: "پلوپز دیجیتال چندکاره",
    price: 3500000,
    category: "پخت و پز",
    image: "https://images.unsplash.com/photo-1544233726-9f1d2b27be8b?q=80&w=400&auto=format&fit=crop",
    description: "پلوپز ۱۲ نفره با قابلیت آرام‌پز، بخارپز و ماست‌بند. دارای تایمر ۲۴ ساعته.",
    rating: 4.6,
    reviews: 98,
    features: ["دیگ سرامیکی", "پنل لمسی", "گرم نگهدارنده"]
  },
  {
    id: 6,
    name: "سرویس غذاخوری ۲۴ نفره چینی",
    price: 12500000,
    category: "سرو و پذیرایی",
    image: "https://images.unsplash.com/photo-1603197806536-233939a70717?q=80&w=400&auto=format&fit=crop",
    description: "سرویس چینی استخوانی با طرح طلاکوب. مناسب برای مهمانی‌های رسمی و مجلل.",
    rating: 4.7,
    reviews: 32,
    features: ["قابل شستشو در ماشین", "ضد خش", "طراحی مدرن"]
  },
  {
    id: 7,
    name: "جاروبرقی رباتیک هوشمند",
    price: 15000000,
    oldPrice: 16500000,
    category: "شستشو و نظافت",
    image: "https://images.unsplash.com/photo-1563453392212-326f5e854473?q=80&w=400&auto=format&fit=crop",
    description: "جاروبرقی رباتیک با قابلیت نقشه‌برداری لیزری و کنترل از طریق موبایل. مناسب برای سرامیک و فرش.",
    rating: 4.8,
    reviews: 56,
    features: ["سنسور تشخیص ارتفاع", "بازگشت خودکار به شارژر", "فیلتر HEPA"]
  },
  {
    id: 8,
    name: "ست نظم‌دهنده یخچال (۶ تکه)",
    price: 450000,
    category: "نظم‌دهنده",
    image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=400&auto=format&fit=crop",
    description: "باکس‌های شفاف اکرولیک برای مرتب‌سازی میوه و سبزیجات در یخچال. نشکن و بهداشتی.",
    rating: 4.3,
    reviews: 112,
    features: ["بدون BPA", "قابل شستشو", "درب‌دار"]
  },
  {
    id: 9,
    name: "دستمال آشپزخانه نانو (بسته ۵ عددی)",
    price: 120000,
    category: "منسوجات",
    image: "https://images.unsplash.com/photo-1621886125078-439543606c4b?q=80&w=400&auto=format&fit=crop",
    description: "دستمال‌های میکروفایبر با قدرت جذب آب بسیار بالا و بدون پرزدهی.",
    rating: 4.5,
    reviews: 240,
    features: ["آنتی‌باکتریال", "خشک شدن سریع", "رنگ ثابت"]
  },
  {
    id: 10,
    name: "گلدان سرامیکی مینیمال",
    price: 350000,
    category: "دکوراتیو",
    image: "https://images.unsplash.com/photo-1581539250439-c96689b516dd?q=80&w=400&auto=format&fit=crop",
    description: "گلدان سرامیکی دست‌ساز با لعاب مات. مناسب برای گل‌های طبیعی و مصنوعی روی کانتر آشپزخانه.",
    rating: 4.9,
    reviews: 18,
    features: ["دست‌ساز", "ضد آب", "طراحی مدرن"]
  }
];

export const BLOG_POSTS = [
  {
    id: 1,
    title: "راهنمای خرید بهترین قهوه‌ساز خانگی",
    excerpt: "در این مقاله به بررسی نکات مهم در خرید قهوه‌سازهای خانگی و تفاوت‌های آن‌ها می‌پردازیم.",
    image: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?q=80&w=400&auto=format&fit=crop",
    date: "۱۴۰۳/۰۲/۱۵",
    author: "سارا مجیدی"
  },
  {
    id: 2,
    title: "۵ ترفند برای نگهداری بهتر از ظروف تفلون",
    excerpt: "چگونه عمر ظروف نچسب خود را افزایش دهیم؟ این نکات ساده را رعایت کنید.",
    image: "https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?q=80&w=400&auto=format&fit=crop",
    date: "۱۴۰۳/۰۲/۱۰",
    author: "علی رضایی"
  },
  {
    id: 3,
    title: "چیدمان مدرن آشپزخانه کوچک",
    excerpt: "ایده‌های خلاقانه برای استفاده بهینه از فضای آشپزخانه‌های کوچک آپارتمانی.",
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?q=80&w=400&auto=format&fit=crop",
    date: "۱۴۰۳/۰۲/۰۵",
    author: "مریم کمالی"
  }
];

export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
};

// --- DATA & VALIDATION HELPERS ---

export const PROVINCES = [
  "تهران", "البرز", "اصفهان", "فارس", "خراسان رضوی", "آذربایجان شرقی", "آذربایجان غربی",
  "مازندران", "گیلان", "خوزستان", "کرمان", "یزد", "قزوین", "قم", "مرکزی", "همدان",
  "هرمزگان", "اردبیل", "زنجان", "لرستان", "کرمانشاه", "گلستان", "بوشهر", "کردستان",
  "سمنان", "سیستان و بلوچستان", "چهارمحال و بختیاری", "خراسان شمالی", "خراسان جنوبی",
  "کهگیلویه و بویراحمد", "ایلام"
];

export const CITIES: Record<string, string[]> = {
  "تهران": ["تهران", "اسلام‌شهر", "شهریار", "قدس", "ملارد", "پاکدشت", "ورامین"],
  "البرز": ["کرج", "فردیس", "کمال‌شهر", "نظرآباد", "هشتگرد"],
  "اصفهان": ["اصفهان", "کاشان", "خمینی‌شهر", "نجف‌آباد", "شاهین‌شهر"],
  "فارس": ["شیراز", "مرودشت", "جهرم", "فسا", "کازرون"],
  "خراسان رضوی": ["مشهد", "نیشابور", "سبزوار", "تربت حیدریه"],
  "آذربایجان شرقی": ["تبریز", "مراغه", "مرند", "میانه"],
  "مازندران": ["ساری", "بابل", "آمل", "قائم‌شهر", "بهشهر"],
  "گیلان": ["رشت", "بندر انزلی", "لاهیجان", "لنگرود"],
  "خوزستان": ["اهواز", "دزفول", "آبادان", "بندر ماهشهر"],
  // Add other cities as needed... currently just mapping province names as default if not listed
};

export const VALIDATION_REGEX = {
  // Persian characters + spaces
  PERSIAN_NAME: /^[\u0600-\u06FF\s]+$/,
  // Simple Email
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  // 10 Digit Iranian Postal Code
  POSTAL_CODE: /^\d{10}$/,
  // Mobile Phone (starts with 09)
  PHONE: /^09\d{9}$/
};

export const getCitiesForProvince = (province: string): string[] => {
  if (CITIES[province]) {
    return CITIES[province];
  }
  return [province]; // Fallback: just use province name as city if not defined
};
