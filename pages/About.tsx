
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { CheckCircle } from 'lucide-react';

const About: React.FC = () => {
  const [aboutText, setAboutText] = useState('');

  useEffect(() => {
    setAboutText(db.settings.get().aboutText);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-12 text-center md:text-right">
        <h1 className="text-3xl font-black text-gray-900 mb-8 text-center">درباره آشپزخونه</h1>
        
        <div className="prose prose-lg text-gray-600 max-w-none space-y-6 text-justify whitespace-pre-wrap">
          {aboutText}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
            <div className="bg-orange-50 p-6 rounded-xl">
                <h3 className="font-bold text-lg text-primary mb-3">چرا ما؟</h3>
                <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center"><CheckCircle size={16} className="ml-2 text-green-500"/> ضمانت اصالت کالا</li>
                    <li className="flex items-center"><CheckCircle size={16} className="ml-2 text-green-500"/> ۷ روز ضمانت بازگشت وجه</li>
                    <li className="flex items-center"><CheckCircle size={16} className="ml-2 text-green-500"/> ارسال سریع به سراسر کشور</li>
                    <li className="flex items-center"><CheckCircle size={16} className="ml-2 text-green-500"/> مشاوره تخصصی رایگان</li>
                </ul>
            </div>
            <div className="bg-gray-50 p-6 rounded-xl">
                 <h3 className="font-bold text-lg text-gray-800 mb-3">ماموریت ما</h3>
                 <p className="text-sm text-gray-600 leading-relaxed">
                    ایجاد تجربه‌ای متفاوت در خرید آنلاین لوازم خانگی با تمرکز بر کیفیت، سرعت و رضایت مشتری. ما می‌خواهیم آشپزی را برای شما آسان‌تر و لذت‌بخش‌تر کنیم.
                 </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default About;
