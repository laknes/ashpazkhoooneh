
import React, { useState, useEffect } from 'react';
import { CartItem, User, ViewState } from '../types';
import { formatPrice, PROVINCES, getCitiesForProvince, VALIDATION_REGEX } from '../constants';
import { db } from '../services/db';
import { MapPin, CreditCard, Truck, CheckCircle, Edit, AlertCircle } from 'lucide-react';

interface CheckoutProps {
  cart: CartItem[];
  user: User | null;
  onSuccess: () => void;
  onLoginRequest: () => void;
  onLoadingStateChange?: (isLoading: boolean) => void;
}

const Checkout: React.FC<CheckoutProps> = ({ 
  cart, 
  user, 
  onSuccess, 
  onLoginRequest,
  onLoadingStateChange 
}) => {
  // Use user's saved address as default, but allow editing for this order
  const [address, setAddress] = useState('');
  const [province, setProvince] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'ONLINE' | 'COD'>('ONLINE');
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
      if (user) {
          setAddress(user.address || '');
          setProvince(user.province || '');
          setCity(user.city || '');
          setPostalCode(user.postalCode || '');
          // If any field is missing, auto-open edit mode
          if (!user.address || !user.province || !user.city || !user.postalCode) {
              setEditingAddress(true);
          }
      }
  }, [user]);

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000000 ? 0 : 150000;
  const total = subtotal + shipping;

  const validateAddress = (): boolean => {
      const newErrors: Record<string, string> = {};
      if (!province) newErrors.province = 'استان الزامی است';
      if (!city) newErrors.city = 'شهر الزامی است';
      
      if (!postalCode.trim()) {
          newErrors.postalCode = 'کد پستی الزامی است';
      } else if (!VALIDATION_REGEX.POSTAL_CODE.test(postalCode)) {
          newErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد';
      }

      if (!address.trim()) newErrors.address = 'آدرس دقیق الزامی است';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = () => {
    if (!user) {
      onLoginRequest();
      return;
    }
    
    // Check validation
    if (!validateAddress()) {
        setEditingAddress(true);
        alert('لطفا اطلاعات آدرس را به درستی کامل کنید.');
        return;
    }

    setIsProcessing(true);
    if (onLoadingStateChange) onLoadingStateChange(true);
    
    // Simulate API delay
    setTimeout(() => {
      // Create Order in Mock DB
      const newOrder = {
        customerName: user.name,
        totalAmount: total,
        status: 'PENDING' as const,
        date: new Date().toISOString(),
        items: [...cart]
      };
      
      console.log('Order Placed:', newOrder);
      
      setIsProcessing(false);
      if (onLoadingStateChange) onLoadingStateChange(false);
      onSuccess();
      alert('سفارش شما با موفقیت ثبت شد!');
    }, 2000);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setProvince(e.target.value);
      setCity('');
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold mb-8">تسویه حساب</h1>
      
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Forms */}
        <div className="flex-1 space-y-8">
          {/* User Info */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="bg-orange-100 text-primary w-8 h-8 rounded-full flex items-center justify-center ml-3 text-sm">۱</span>
              اطلاعات گیرنده
            </h2>
            {user ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-500 mb-1">نام و نام خانوادگی</label>
                  <div className="font-medium">{user.name}</div>
                </div>
                <div>
                  <label className="block text-sm text-gray-500 mb-1">شماره تماس</label>
                  <div className="font-medium">{user.phone}</div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 bg-gray-50 rounded-lg">
                <p className="text-gray-600 mb-4">برای ثبت سفارش ابتدا وارد شوید</p>
                <button 
                  onClick={onLoginRequest}
                  className="bg-primary text-white px-6 py-2 rounded-lg text-sm"
                >
                  ورود / ثبت نام
                </button>
              </div>
            )}
          </div>

          {/* Address */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold flex items-center">
                <span className="bg-orange-100 text-primary w-8 h-8 rounded-full flex items-center justify-center ml-3 text-sm">۲</span>
                آدرس تحویل
                </h2>
                {user && !editingAddress && (
                    <button onClick={() => setEditingAddress(true)} className="text-primary text-sm flex items-center">
                        <Edit size={16} className="ml-1"/> ویرایش
                    </button>
                )}
            </div>
            
            <div className="space-y-4">
              {editingAddress ? (
                  <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                            <select 
                                className={`border rounded-lg p-3 w-full bg-white ${errors.province ? 'border-red-500' : ''}`}
                                value={province}
                                onChange={handleProvinceChange}
                            >
                                <option value="">انتخاب استان...</option>
                                {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                            </select>
                            <ErrorMsg field="province" />
                          </div>
                          <div>
                            <select 
                                className={`border rounded-lg p-3 w-full bg-white ${errors.city ? 'border-red-500' : ''}`}
                                value={city}
                                onChange={e => setCity(e.target.value)}
                                disabled={!province}
                            >
                                <option value="">انتخاب شهر...</option>
                                {getCitiesForProvince(province).map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            <ErrorMsg field="city" />
                          </div>
                      </div>
                      <div>
                        <input 
                                type="text" 
                                placeholder="کد پستی"
                                className={`border rounded-lg p-3 w-full dir-ltr font-mono ${errors.postalCode ? 'border-red-500' : ''}`}
                                value={postalCode}
                                onChange={e => setPostalCode(e.target.value)}
                                maxLength={10}
                            />
                        <ErrorMsg field="postalCode" />
                      </div>
                      <div>
                        <textarea
                            rows={2}
                            className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none ${errors.address ? 'border-red-500' : ''}`}
                            placeholder="خیابان، کوچه، پلاک، واحد..."
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        ></textarea>
                        <ErrorMsg field="address" />
                      </div>
                      <button 
                        onClick={() => {
                            if (validateAddress()) setEditingAddress(false);
                        }}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg"
                      >
                          تایید موقت آدرس
                      </button>
                  </div>
              ) : (
                  <div className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                      {province}، {city}، {address}
                      <div className="mt-2 text-sm text-gray-500 font-mono">کد پستی: {postalCode}</div>
                  </div>
              )}
            </div>
          </div>

          {/* Payment Method */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <span className="bg-orange-100 text-primary w-8 h-8 rounded-full flex items-center justify-center ml-3 text-sm">۳</span>
              شیوه پرداخت
            </h2>
            <div className="space-y-3">
              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'ONLINE' ? 'border-primary bg-orange-50' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'ONLINE'}
                  onChange={() => setPaymentMethod('ONLINE')}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <div className="mr-4 flex-1">
                  <div className="font-bold text-gray-800 flex items-center">
                    <CreditCard size={18} className="ml-2 text-gray-500" />
                    پرداخت اینترنتی
                  </div>
                  <div className="text-xs text-gray-500 mt-1">پرداخت با کلیه کارت‌های عضو شتاب</div>
                </div>
              </label>

              <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition ${paymentMethod === 'COD' ? 'border-primary bg-orange-50' : 'hover:bg-gray-50'}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="text-primary focus:ring-primary h-4 w-4"
                />
                <div className="mr-4 flex-1">
                  <div className="font-bold text-gray-800 flex items-center">
                    <Truck size={18} className="ml-2 text-gray-500" />
                    پرداخت در محل
                  </div>
                  <div className="text-xs text-gray-500 mt-1">پرداخت با کارتخوان سیار هنگام تحویل</div>
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="w-full lg:w-96">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-24">
            <h3 className="font-bold text-lg mb-6 border-b pb-4">خلاصه فاکتور</h3>
            
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>مبلغ کل کالاها ({cart.length})</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>هزینه ارسال</span>
                <span className={shipping === 0 ? "text-green-500" : ""}>
                  {shipping === 0 ? "رایگان" : formatPrice(shipping)}
                </span>
              </div>
            </div>

            <div className="flex justify-between font-black text-lg text-gray-900 border-t pt-4 mb-6">
              <span>مبلغ قابل پرداخت</span>
              <span>{formatPrice(total)}</span>
            </div>

            <button 
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-orange-200 transition-transform active:scale-95 flex justify-center items-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'در حال پردازش...' : 'پرداخت و ثبت نهایی'}
            </button>
            <p className="text-xs text-gray-400 mt-4 text-center">
              با ثبت سفارش، قوانین و مقررات آشپزخونه را می‌پذیرید.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
