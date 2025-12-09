
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { SiteSettings, HeroSlide } from '../types';
import { Save, Plus, Trash2, AlertCircle, Instagram, Twitter, Linkedin, Send, Image as ImageIcon, MessageSquare, CreditCard, Truck, ExternalLink, Search } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const AdminSettings: React.FC = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'GENERAL' | 'SEO' | 'API'>('GENERAL');

  useEffect(() => {
    setSettings(db.settings.get());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      // Validation: Check if all slides have images
      const missingImages = settings.heroSlides.some(s => !s.image);
      if (missingImages) {
          alert('لطفا برای همه اسلایدها یک تصویر انتخاب کنید.');
          return;
      }

      db.settings.update(settings);
      alert('تنظیمات با موفقیت ذخیره شد.');
    }
  };

  const addSlide = () => {
      if (settings) {
          const newSlide: HeroSlide = {
              id: Date.now(),
              image: '',
              title: 'عنوان جدید',
              subtitle: 'توضیحات کوتاه اسلاید'
          };
          setSettings({ ...settings, heroSlides: [...settings.heroSlides, newSlide] });
      }
  };

  const removeSlide = (id: number) => {
      if (settings) {
          if (settings.heroSlides.length <= 1) {
              alert('حداقل یک اسلاید باید وجود داشته باشد.');
              return;
          }
          setSettings({ ...settings, heroSlides: settings.heroSlides.filter(s => s.id !== id) });
      }
  };

  const updateSlide = (id: number, field: keyof HeroSlide, value: string) => {
      if (settings) {
          setSettings({
              ...settings,
              heroSlides: settings.heroSlides.map(s => s.id === id ? { ...s, [field]: value } : s)
          });
      }
  };

  if (!settings) return <div>در حال بارگذاری...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">تنظیمات سایت</h1>
      
      {/* Tabs */}
      <div className="flex gap-4 mb-8 border-b border-gray-200 pb-1">
          <button 
            onClick={() => setActiveTab('GENERAL')}
            className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'GENERAL' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
          >
              عمومی و اسلایدر
          </button>
          <button 
            onClick={() => setActiveTab('SEO')}
            className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'SEO' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
          >
              سئو و بهینه‌سازی
          </button>
          <button 
            onClick={() => setActiveTab('API')}
            className={`pb-3 px-2 font-medium transition-colors ${activeTab === 'API' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-800'}`}
          >
              تنظیمات فنی (API)
          </button>
      </div>
      
      <form onSubmit={handleSave} className="space-y-8 max-w-5xl pb-24">
        
        {/* GENERAL TAB */}
        {activeTab === 'GENERAL' && (
            <>
                {/* Hero Slides Management */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6 border-b pb-4">
                        <div>
                            <h2 className="text-xl font-bold text-gray-800">اسلایدر سه بعدی صفحه اصلی</h2>
                            <p className="text-sm text-gray-500">تصاویر و متن‌های اسلایدر متحرک را مدیریت کنید.</p>
                        </div>
                        <button 
                            type="button" 
                            onClick={addSlide}
                            className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg flex items-center transition text-sm font-bold active:scale-95"
                        >
                            <Plus size={16} className="ml-2" />
                            افزودن اسلاید
                        </button>
                    </div>
                    
                    <div className="space-y-8">
                        {settings.heroSlides.map((slide, index) => (
                            <div key={slide.id} className="bg-gray-50 p-6 rounded-xl border border-gray-200 relative group transition-all hover:shadow-md hover:border-orange-200">
                                <div className="absolute top-4 left-4 flex gap-2 z-10">
                                    <span className="bg-white/80 backdrop-blur px-2 py-1 rounded text-xs font-mono text-gray-400">
                                        #{index + 1}
                                    </span>
                                    <button 
                                        type="button"
                                        onClick={() => removeSlide(slide.id)}
                                        className="text-red-400 hover:text-red-600 p-1 bg-white rounded-full shadow-sm hover:scale-110 transition-all"
                                        title="حذف اسلاید"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {/* Image Upload */}
                                    <div className="col-span-1">
                                        <label className="flex items-center text-xs font-bold text-gray-500 mb-2">
                                            تصویر اسلاید (افقی)
                                            {!slide.image && <span className="text-red-500 mr-1">*</span>}
                                        </label>
                                        <div className="bg-blue-50 text-blue-800 text-xs px-2 py-1.5 rounded-lg mb-2 flex items-center">
                                            <ImageIcon size={12} className="ml-1" />
                                            ابعاد: ۱۹۲۰ × ۶۰۰ پیکسل
                                        </div>
                                        <ImageUploader 
                                            currentImage={slide.image} 
                                            onImageSelect={(base64) => updateSlide(slide.id, 'image', base64)} 
                                            className="h-48"
                                        />
                                        {!slide.image && (
                                            <div className="flex items-center text-red-500 text-xs mt-2">
                                                <AlertCircle size={12} className="ml-1" />
                                                انتخاب تصویر الزامی است
                                            </div>
                                        )}
                                    </div>
                                    
                                    {/* Text Inputs */}
                                    <div className="col-span-2 space-y-4 pt-2">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">عنوان بزرگ</label>
                                            <input 
                                                type="text" 
                                                required
                                                value={slide.title}
                                                onChange={(e) => updateSlide(slide.id, 'title', e.target.value)}
                                                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                                                placeholder="مثلا: فروش ویژه تابستانه"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 mb-1">توضیحات زیرعنوان</label>
                                            <textarea 
                                                rows={3}
                                                required
                                                value={slide.subtitle}
                                                onChange={(e) => updateSlide(slide.id, 'subtitle', e.target.value)}
                                                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow"
                                                placeholder="توضیح کوتاهی که زیر عنوان نمایش داده می‌شود..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">اطلاعات تماس</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">شماره تلفن</label>
                    <input 
                        type="text" 
                        value={settings.contact.phone}
                        onChange={e => setSettings({...settings, contact: {...settings.contact, phone: e.target.value}})}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                    />
                    </div>
                    <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل پشتیبانی</label>
                    <input 
                        type="email" 
                        value={settings.contact.email}
                        onChange={e => setSettings({...settings, contact: {...settings.contact, email: e.target.value}})}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                    />
                    </div>
                    <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس پستی</label>
                    <input 
                        type="text" 
                        value={settings.contact.address}
                        onChange={e => setSettings({...settings, contact: {...settings.contact, address: e.target.value}})}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                    </div>
                </div>
                </div>
                
                {/* Social Media */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2">شبکه‌های اجتماعی</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Instagram size={16} className="ml-1 text-pink-600" />
                                اینستاگرام
                            </label>
                            <input 
                                type="text" 
                                value={settings.socialMedia.instagram}
                                onChange={e => setSettings({...settings, socialMedia: {...settings.socialMedia, instagram: e.target.value}})}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                                placeholder="https://instagram.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Send size={16} className="ml-1 text-blue-500" />
                                تلگرام
                            </label>
                            <input 
                                type="text" 
                                value={settings.socialMedia.telegram}
                                onChange={e => setSettings({...settings, socialMedia: {...settings.socialMedia, telegram: e.target.value}})}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                                placeholder="https://t.me/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Twitter size={16} className="ml-1 text-blue-400" />
                                توییتر / ایکس
                            </label>
                            <input 
                                type="text" 
                                value={settings.socialMedia.twitter}
                                onChange={e => setSettings({...settings, socialMedia: {...settings.socialMedia, twitter: e.target.value}})}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                                placeholder="https://twitter.com/..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                                <Linkedin size={16} className="ml-1 text-blue-700" />
                                لینکدین
                            </label>
                            <input 
                                type="text" 
                                value={settings.socialMedia.linkedin}
                                onChange={e => setSettings({...settings, socialMedia: {...settings.socialMedia, linkedin: e.target.value}})}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                                placeholder="https://linkedin.com/in/..."
                            />
                        </div>
                    </div>
                </div>

                {/* About Text */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">متن درباره ما</h2>
                <textarea 
                    rows={8}
                    value={settings.aboutText}
                    onChange={e => setSettings({...settings, aboutText: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
                </div>
            </>
        )}

        {/* SEO TAB */}
        {activeTab === 'SEO' && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
                <div className="flex items-center gap-3 border-b pb-4 mb-4">
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                        <Search size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">تنظیمات سئو (SEO)</h2>
                        <p className="text-sm text-gray-500">بهینه‌سازی سایت برای موتورهای جستجو</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">عنوان پیش‌فرض سایت (Default Title)</label>
                        <input 
                            type="text" 
                            value={settings.seo.defaultTitle}
                            onChange={e => setSettings({...settings, seo: {...settings.seo, defaultTitle: e.target.value}})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="آشپزخونه | لوازم لوکس خانه و آشپزخانه"
                        />
                        <p className="text-xs text-gray-400 mt-1">این عنوان در صفحه اصلی استفاده می‌شود.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">قالب عنوان صفحات (Title Template)</label>
                        <input 
                            type="text" 
                            value={settings.seo.titleTemplate}
                            onChange={e => setSettings({...settings, seo: {...settings.seo, titleTemplate: e.target.value}})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                            placeholder="%s | Ashpazkhoneh"
                        />
                        <p className="text-xs text-gray-400 mt-1">از <span className="font-mono bg-gray-100 px-1">%s</span> به عنوان جایگزین نام صفحه (مثلاً نام محصول) استفاده کنید.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">توضیحات متا (Meta Description)</label>
                        <textarea 
                            rows={3}
                            value={settings.seo.defaultDescription}
                            onChange={e => setSettings({...settings, seo: {...settings.seo, defaultDescription: e.target.value}})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="توضیحاتی جذاب درباره فروشگاه که در نتایج گوگل نمایش داده می‌شود..."
                        />
                        <p className="text-xs text-gray-400 mt-1">پیشنهاد می‌شود بین ۱۲۰ تا ۱۶۰ کاراکتر باشد.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">کلمات کلیدی پیش‌فرض (Keywords)</label>
                        <input 
                            type="text" 
                            value={settings.seo.defaultKeywords}
                            onChange={e => setSettings({...settings, seo: {...settings.seo, defaultKeywords: e.target.value}})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                            placeholder="لوازم آشپزخانه, خرید آنلاین, جهیزیه..."
                        />
                        <p className="text-xs text-gray-400 mt-1">کلمات را با کاما (،) از هم جدا کنید.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">آدرس سایت (Canonical URL Base)</label>
                        <input 
                            type="text" 
                            value={settings.seo.siteUrl}
                            onChange={e => setSettings({...settings, seo: {...settings.seo, siteUrl: e.target.value}})}
                            className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr"
                            placeholder="https://ashpazkhoneh.ir"
                        />
                    </div>
                </div>
            </div>
        )}

        {/* API TAB */}
        {activeTab === 'API' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* SMS Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center justify-between">
                        <div className="flex items-center">
                            <MessageSquare size={20} className="ml-2 text-primary" />
                            تنظیمات پیامک
                        </div>
                        <a href="https://kavenegar.com/" target="_blank" rel="noreferrer" className="text-xs text-primary flex items-center hover:underline">
                            دریافت پنل <ExternalLink size={12} className="mr-1" />
                        </a>
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">پنل پیامکی</label>
                            <select 
                                value={settings.sms.provider}
                                onChange={e => setSettings({...settings, sms: {...settings.sms, provider: e.target.value as any}})}
                                className="w-full border rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                <option value="kavenegar">کاوه نگار (Kavenegar)</option>
                                <option value="ghasedak">قاصدک (Ghasedak)</option>
                                <option value="other">سایر</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">کلید API</label>
                            <input 
                                type="password" 
                                value={settings.sms.apiKey}
                                onChange={e => setSettings({...settings, sms: {...settings.sms, apiKey: e.target.value}})}
                                className="w-full border rounded-lg p-2 dir-ltr font-mono text-sm"
                                placeholder="API Key..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">شماره خط ارسال کننده</label>
                            <input 
                                type="text" 
                                value={settings.sms.lineNumber}
                                onChange={e => setSettings({...settings, sms: {...settings.sms, lineNumber: e.target.value}})}
                                className="w-full border rounded-lg p-2 dir-ltr font-mono"
                                placeholder="e.g. 1000..."
                            />
                        </div>
                    </div>
                </div>

                {/* Payment Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center justify-between">
                        <div className="flex items-center">
                            <CreditCard size={20} className="ml-2 text-green-600" />
                            درگاه پرداخت
                        </div>
                        {settings.payment.activeGateway === 'zarinpal' && (
                            <a href="https://zarinpal.com/" target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center hover:underline">
                                زرین پال <ExternalLink size={12} className="mr-1" />
                            </a>
                        )}
                        {settings.payment.activeGateway === 'nextpay' && (
                            <a href="https://nextpay.org/" target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center hover:underline">
                                نکست پی <ExternalLink size={12} className="mr-1" />
                            </a>
                        )}
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">درگاه فعال</label>
                            <select 
                                value={settings.payment.activeGateway}
                                onChange={e => setSettings({...settings, payment: {...settings.payment, activeGateway: e.target.value as any}})}
                                className="w-full border rounded-lg p-2 bg-white text-gray-900 focus:ring-2 focus:ring-primary focus:outline-none"
                            >
                                <option value="none">غیرفعال (فقط پرداخت در محل)</option>
                                <option value="zarinpal">زرین پال</option>
                                <option value="nextpay">نکست پی</option>
                                <option value="zibal">زیبال</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <input 
                                type="checkbox" 
                                id="sandbox"
                                checked={settings.payment.isSandbox}
                                onChange={e => setSettings({...settings, payment: {...settings.payment, isSandbox: e.target.checked}})}
                                className="w-4 h-4 text-primary focus:ring-primary rounded"
                            />
                            <label htmlFor="sandbox" className="text-sm text-gray-700 select-none">حالت آزمایشی (Sandbox)</label>
                        </div>

                        {settings.payment.activeGateway === 'zarinpal' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">مرچنت کد زرین پال</label>
                                <input 
                                    type="text" 
                                    value={settings.payment.zarinpalMerchant}
                                    onChange={e => setSettings({...settings, payment: {...settings.payment, zarinpalMerchant: e.target.value}})}
                                    className="w-full border rounded-lg p-2 dir-ltr font-mono text-sm"
                                    placeholder="Merchant ID..."
                                />
                            </div>
                        )}
                        {settings.payment.activeGateway === 'nextpay' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">توکن نکست پی</label>
                                <input 
                                    type="text" 
                                    value={settings.payment.nextpayToken}
                                    onChange={e => setSettings({...settings, payment: {...settings.payment, nextpayToken: e.target.value}})}
                                    className="w-full border rounded-lg p-2 dir-ltr font-mono text-sm"
                                />
                            </div>
                        )}
                        {settings.payment.activeGateway === 'zibal' && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">مرچنت کد زیبال</label>
                                <input 
                                    type="text" 
                                    value={settings.payment.zibalMerchant}
                                    onChange={e => setSettings({...settings, payment: {...settings.payment, zibalMerchant: e.target.value}})}
                                    className="w-full border rounded-lg p-2 dir-ltr font-mono text-sm"
                                    placeholder="zibal"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Settings */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 lg:col-span-2">
                    <h2 className="text-xl font-bold mb-4 border-b pb-2 flex items-center justify-between">
                        <div className="flex items-center">
                            <Truck size={20} className="ml-2 text-blue-600" />
                            تنظیمات حمل و نقل
                        </div>
                        <a href="https://tipaxco.com/" target="_blank" rel="noreferrer" className="text-xs text-blue-600 flex items-center hover:underline">
                            سامانه تیپاکس <ExternalLink size={12} className="mr-1" />
                        </a>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">هزینه پایه ارسال (تومان)</label>
                            <input 
                                type="number" 
                                value={settings.shipping.baseCost}
                                onChange={e => setSettings({...settings, shipping: {...settings.shipping, baseCost: Number(e.target.value)}})}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">سقف ارسال رایگان (تومان)</label>
                            <input 
                                type="number" 
                                value={settings.shipping.freeThreshold}
                                onChange={e => setSettings({...settings, shipping: {...settings.shipping, freeThreshold: Number(e.target.value)}})}
                                className="w-full border rounded-lg p-2"
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">توکن API پست / تیپاکس (اختیاری)</label>
                            <input 
                                type="text" 
                                value={settings.shipping.apiToken}
                                onChange={e => setSettings({...settings, shipping: {...settings.shipping, apiToken: e.target.value}})}
                                className="w-full border rounded-lg p-2 dir-ltr font-mono text-sm"
                                placeholder="برای اتصال به سیستم‌های حمل و نقل هوشمند"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        <button 
          type="submit"
          className="fixed bottom-8 left-8 bg-primary hover:bg-orange-600 text-white px-8 py-3 rounded-full font-bold shadow-2xl flex items-center justify-center z-50 transition-transform hover:scale-105 active:scale-95"
        >
          <Save size={20} className="ml-2" />
          ذخیره تغییرات
        </button>
      </form>
    </div>
  );
};

export default AdminSettings;
