
import React, { useState, useEffect } from 'react';
import { Instagram, Twitter, Linkedin, Phone, Mail, MapPin, Send, ShieldCheck } from 'lucide-react';
import { ViewState, SiteSettings } from '../types';
import { db } from '../services/db';

interface FooterProps {
  onChangeView: (view: ViewState) => void;
}

const Footer: React.FC<FooterProps> = ({ onChangeView }) => {
  // Initialize settings lazily to avoid layout shift/flicker on mount
  const [settings, setSettings] = useState<SiteSettings | null>(() => {
    try {
      return db.settings.get();
    } catch (error) {
      console.error("Failed to load settings:", error);
      return null;
    }
  });

  useEffect(() => {
    // Refresh settings on mount to ensure sync (though localStorage is sync)
    setSettings(db.settings.get());
  }, []);

  if (!settings) return null;

  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-primary">آشپزخونه</h2>
            <p className="text-gray-500 text-sm leading-relaxed">
              ارائه‌دهنده لوکس‌ترین لوازم آشپزخانه و خانه با تضمین کیفیت و اصالت کالا. ما خانه‌ی شما را مدرن می‌کنیم.
            </p>
            <div className="flex space-x-4 space-x-reverse pt-2">
              {settings.socialMedia.instagram && (
                <a href={settings.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-110">
                  <Instagram size={20} />
                </a>
              )}
              {settings.socialMedia.telegram && (
                <a href={settings.socialMedia.telegram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-110">
                  <Send size={20} />
                </a>
              )}
              {settings.socialMedia.twitter && (
                <a href={settings.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-110">
                  <Twitter size={20} />
                </a>
              )}
              {settings.socialMedia.linkedin && (
                <a href={settings.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-110">
                  <Linkedin size={20} />
                </a>
              )}
              {settings.socialMedia.custom?.map(social => (
                <a key={social.id} href={social.url} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-primary transition-all hover:scale-110" title={social.name}>
                    {/* Using a generic icon for custom links since we can't dynamic import icons easily in this setup */}
                    <div className="w-5 h-5 border border-current rounded-full flex items-center justify-center text-[10px] font-bold">
                        {social.name.charAt(0).toUpperCase()}
                    </div>
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">دسترسی سریع</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={() => onChangeView('CATALOG')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">محصولات</button></li>
              <li><button onClick={() => onChangeView('ABOUT')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">درباره ما</button></li>
              <li><button onClick={() => onChangeView('CONTACT')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">تماس با ما</button></li>
              <li><button onClick={() => onChangeView('BLOG')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">مجله آشپزخونه</button></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">خدمات مشتریان</h3>
            <ul className="space-y-2 text-sm text-gray-500">
              <li><button onClick={() => onChangeView('CONTACT')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">پاسخ به پرسش‌های متداول</button></li>
              <li><button onClick={() => onChangeView('ABOUT')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">رویه بازگرداندن کالا</button></li>
              <li><button onClick={() => onChangeView('ABOUT')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">شرایط استفاده</button></li>
              <li><button onClick={() => onChangeView('ABOUT')} className="hover:text-primary transition-all hover:-translate-x-1 inline-block text-right w-full md:w-auto">حریم خصوصی</button></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-bold text-gray-800 mb-4">تماس با ما</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-center">
                <Phone size={16} className="ml-2 text-primary flex-shrink-0" />
                <span dir="ltr">{settings.contact.phone}</span>
              </li>
              <li className="flex items-center">
                <Mail size={16} className="ml-2 text-primary flex-shrink-0" />
                <span className="font-mono">{settings.contact.email}</span>
              </li>
              <li className="flex items-start">
                <MapPin size={16} className="ml-2 mt-1 text-primary flex-shrink-0" />
                {settings.contact.address}
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges / Enamad */}
        <div className="border-t border-gray-100 py-8 mb-4">
             <h3 className="text-center font-bold text-gray-400 mb-6 text-sm">نمادهای اعتماد</h3>
             <div className="flex flex-wrap justify-center gap-6 md:gap-12">
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center p-2 shadow-sm cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                     <ShieldCheck size={32} className="text-blue-500 mb-2 md:mb-3"/>
                     <span className="text-[10px] md:text-xs text-gray-500 text-center font-bold">نماد اعتماد الکترونیکی</span>
                 </div>
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center p-2 shadow-sm cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                     <div className="text-xl md:text-2xl font-black text-gray-700 mb-1 md:mb-2">ساماندهی</div>
                     <span className="text-[10px] md:text-xs text-gray-500 text-center font-bold">نشان ملی ثبت</span>
                 </div>
                 <div className="w-24 h-24 md:w-32 md:h-32 bg-white border border-gray-100 rounded-xl flex flex-col items-center justify-center p-2 shadow-sm cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1">
                    <span className="text-base md:text-lg font-bold text-gray-600 mb-1 md:mb-2 text-center leading-tight">عضو اتحادیه</span>
                     <span className="text-[10px] md:text-xs text-gray-500 text-center font-bold">کسب‌وکارهای مجازی</span>
                 </div>
             </div>
        </div>
        
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
          <p>© ۱۴۰۳ تمامی حقوق برای فروشگاه آشپزخونه محفوظ است.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
