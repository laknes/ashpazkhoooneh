
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [contactInfo, setContactInfo] = useState({ phone: '', email: '', address: '' });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await db.settings.get();
        setContactInfo(settings.contact);
      } catch (error) {
        console.error("Failed to load contact info", error);
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('پیام شما دریافت شد. همکاران ما به زودی با شما تماس خواهند گرفت.');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-black text-center text-gray-900 mb-12">تماس با ما</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">راه‌های ارتباطی</h2>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-primary flex-shrink-0 ml-4">
                  <Phone size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">تلفن تماس</h3>
                  <p className="text-gray-500 text-sm">شنبه تا پنج‌شنبه، ۹ صبح تا ۹ شب</p>
                  <p className="text-lg font-bold text-gray-900 mt-1 dir-ltr text-right">{contactInfo.phone}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-primary flex-shrink-0 ml-4">
                  <Mail size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">ایمیل پشتیبانی</h3>
                  <p className="text-gray-500 text-sm">پاسخگویی در کمتر از ۲۴ ساعت</p>
                  <p className="text-gray-900 mt-1 font-mono">{contactInfo.email}</p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-primary flex-shrink-0 ml-4">
                  <MapPin size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 mb-1">آدرس دفتر مرکزی</h3>
                  <p className="text-gray-600 leading-relaxed">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">ارسال پیام</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل یا شماره تماس</label>
                    <input 
                        type="text" 
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">پیام شما</label>
                    <textarea 
                        rows={4}
                        required
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none"
                        value={formData.message}
                        onChange={e => setFormData({...formData, message: e.target.value})}
                    ></textarea>
                </div>
                <button 
                    type="submit"
                    className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-lg font-bold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-1 active:scale-95 flex justify-center items-center"
                >
                    <Send size={18} className="ml-2" />
                    ارسال پیام
                </button>
            </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
