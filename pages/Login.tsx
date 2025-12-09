
import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { Smartphone, ArrowLeft, Lock, User as UserIcon, Mail, MapPin, Building, Hash, AlertCircle } from 'lucide-react';
import { db } from '../services/db';
import { PROVINCES, getCitiesForProvince, VALIDATION_REGEX } from '../constants';

interface LoginProps {
  onLogin: (user: User) => void;
  onCancel: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, onCancel }) => {
  const [step, setStep] = useState<'IDENTIFIER' | 'OTP' | 'REGISTER'>('IDENTIFIER');
  const [identifier, setIdentifier] = useState(''); // Can be phone or email
  const [loginType, setLoginType] = useState<'PHONE' | 'EMAIL'>('PHONE');
  const [otp, setOtp] = useState('');
  
  // Registration State
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regProvince, setRegProvince] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regPostalCode, setRegPostalCode] = useState('');

  // Validation Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (VALIDATION_REGEX.PHONE.test(identifier)) {
      setLoginType('PHONE');
      setStep('OTP');
      // Pre-fill regPhone if we go to register later
      setRegPhone(identifier);
    } else if (VALIDATION_REGEX.EMAIL.test(identifier)) {
      setLoginType('EMAIL');
      setStep('OTP');
      // Pre-fill regEmail if we go to register later
      setRegEmail(identifier);
    } else {
      setErrors({ identifier: 'شماره موبایل یا ایمیل نامعتبر است' });
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '1234') { // Mock OTP
      // Check if user exists by identifier (phone OR email)
      const existingUser = db.users.findByLogin(identifier);
      
      if (existingUser) {
          // User exists, login
          onLogin(existingUser);
      } else {
          // User does not exist, go to registration
          setStep('REGISTER');
      }
    } else {
      setErrors({ otp: 'کد تایید نامعتبر است' });
    }
  };

  const validateRegistration = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!regName.trim()) {
        newErrors.name = 'نام و نام خانوادگی الزامی است';
    } else if (!VALIDATION_REGEX.PERSIAN_NAME.test(regName)) {
        newErrors.name = 'نام باید فقط شامل حروف فارسی باشد';
    }

    if (!regPhone.trim()) {
         newErrors.phone = 'شماره موبایل الزامی است';
    } else if (!VALIDATION_REGEX.PHONE.test(regPhone)) {
         newErrors.phone = 'فرمت موبایل صحیح نیست';
    }

    if (!regEmail.trim()) {
        newErrors.email = 'ایمیل الزامی است';
    } else if (!VALIDATION_REGEX.EMAIL.test(regEmail)) {
        newErrors.email = 'فرمت ایمیل صحیح نیست';
    }

    if (!regProvince) newErrors.province = 'انتخاب استان الزامی است';
    if (!regCity) newErrors.city = 'انتخاب شهر الزامی است';

    if (!regPostalCode.trim()) {
        newErrors.postalCode = 'کد پستی الزامی است';
    } else if (!VALIDATION_REGEX.POSTAL_CODE.test(regPostalCode)) {
        newErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!validateRegistration()) {
          return;
      }

      // Check for conflicts if user entered a phone/email that belongs to ANOTHER user during registration
      // (Edge case: Logged in with email, but entered a phone number already in DB)
      const conflictUser = db.users.findByLogin(loginType === 'EMAIL' ? regPhone : regEmail);
      if (conflictUser) {
           if (loginType === 'EMAIL') setErrors({ phone: 'این شماره موبایل قبلاً ثبت شده است' });
           else setErrors({ email: 'این ایمیل قبلاً ثبت شده است' });
           return;
      }

      const newUser = db.users.add({
          name: regName,
          phone: regPhone,
          role: 'USER',
          email: regEmail,
          province: regProvince,
          city: regCity,
          address: regAddress,
          postalCode: regPostalCode
      });
      onLogin(newUser);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const val = e.target.value;
      setRegProvince(val);
      setRegCity(''); // Reset city when province changes
  };

  const ErrorMsg = ({ field }: { field: string }) => {
      if (!errors[field]) return null;
      return (
          <div className="flex items-center text-red-500 text-xs mt-1">
              <AlertCircle size={12} className="ml-1" />
              {errors[field]}
          </div>
      );
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-lg border border-gray-100 animate-in fade-in zoom-in-95 duration-300">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-black text-gray-800 mb-2">
            {step === 'IDENTIFIER' ? 'ورود / ثبت‌نام' : step === 'OTP' ? 'تایید هویت' : 'تکمیل ثبت نام'}
          </h2>
          <p className="text-gray-500 text-sm">
            {step === 'IDENTIFIER' 
              ? 'برای ورود یا ثبت‌نام، شماره موبایل یا ایمیل خود را وارد کنید.' 
              : step === 'OTP'
              ? `کد تایید به ${identifier} ارسال شد.`
              : 'برای تکمیل حساب کاربری خود، اطلاعات زیر را وارد کنید.'}
          </p>
        </div>

        {step === 'IDENTIFIER' && (
          <form onSubmit={handleSendOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل یا ایمیل</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="0912xxxxxxx یا example@mail.com"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.identifier ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 text-left dir-ltr`}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
                <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
              <ErrorMsg field="identifier" />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
            >
              ارسال کد تایید
            </button>
          </form>
        )}

        {step === 'OTP' && (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">کد تایید (۱۲۳۴)</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="- - - -"
                  className={`w-full px-4 py-3 rounded-xl border ${errors.otp ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 text-center tracking-[1em] text-lg font-mono`}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={4}
                />
                <Lock className="absolute left-3 top-3.5 text-gray-400" size={20} />
              </div>
              <ErrorMsg field="otp" />
            </div>
            <button
              type="submit"
              className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
            >
              تایید و ادامه
            </button>
            <button
              type="button"
              onClick={() => setStep('IDENTIFIER')}
              className="w-full text-gray-500 text-sm hover:text-primary transition-all active:scale-95"
            >
              ویرایش شماره/ایمیل
            </button>
          </form>
        )}

        {step === 'REGISTER' && (
            <form onSubmit={handleRegister} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.name ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10`}
                                value={regName}
                                onChange={(e) => setRegName(e.target.value)}
                                placeholder="فقط حروف فارسی"
                            />
                            <UserIcon className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                        <ErrorMsg field="name" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل <span className="text-red-500">*</span></label>
                        <div className="relative">
                             <input
                                type="tel"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.phone ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 dir-ltr ${loginType === 'PHONE' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                value={regPhone}
                                onChange={(e) => setRegPhone(e.target.value)}
                                disabled={loginType === 'PHONE'}
                                maxLength={11}
                            />
                            <Smartphone className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                        <ErrorMsg field="phone" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="email"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.email ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 dir-ltr ${loginType === 'EMAIL' ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                                value={regEmail}
                                onChange={(e) => setRegEmail(e.target.value)}
                                disabled={loginType === 'EMAIL'}
                            />
                            <Mail className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                        <ErrorMsg field="email" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">استان <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                className={`w-full px-4 py-3 rounded-xl border ${errors.province ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 appearance-none bg-white`}
                                value={regProvince}
                                onChange={handleProvinceChange}
                            >
                                <option value="">انتخاب استان...</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <MapPin className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                        <ErrorMsg field="province" />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">شهر <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <select
                                className={`w-full px-4 py-3 rounded-xl border ${errors.city ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 appearance-none bg-white`}
                                value={regCity}
                                onChange={(e) => setRegCity(e.target.value)}
                                disabled={!regProvince}
                            >
                                <option value="">انتخاب شهر...</option>
                                {getCitiesForProvince(regProvince).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <Building className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                        <ErrorMsg field="city" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">کد پستی <span className="text-red-500">*</span></label>
                        <div className="relative">
                            <input
                                type="text"
                                className={`w-full px-4 py-3 rounded-xl border ${errors.postalCode ? 'border-red-500' : 'border-gray-300'} focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10 dir-ltr font-mono`}
                                value={regPostalCode}
                                onChange={(e) => setRegPostalCode(e.target.value)}
                                maxLength={10}
                                placeholder="۱۰ رقم بدون خط تیره"
                            />
                            <Hash className="absolute left-3 top-3.5 text-gray-400" size={20} />
                        </div>
                        <ErrorMsg field="postalCode" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">آدرس دقیق پستی</label>
                    <textarea
                        rows={2}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary transition-colors pl-10"
                        value={regAddress}
                        onChange={(e) => setRegAddress(e.target.value)}
                        placeholder="خیابان، کوچه، پلاک، واحد..."
                    />
                </div>

                <button
                    type="submit"
                    className="w-full bg-primary hover:bg-orange-600 text-white py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
                >
                    تکمیل ثبت نام و ورود
                </button>
            </form>
        )}
        
        {step === 'IDENTIFIER' && (
            <button 
            onClick={onCancel}
            className="mt-6 flex items-center justify-center w-full text-gray-400 text-sm hover:text-gray-600 transition-all active:scale-95"
            >
            <ArrowLeft size={16} className="ml-1" />
            بازگشت به فروشگاه
            </button>
        )}
      </div>
    </div>
  );
};

export default Login;
