
import React, { useState } from 'react';
import { User, Order } from '../types';
import { db } from '../services/db';
import { formatPrice, PROVINCES, getCitiesForProvince, VALIDATION_REGEX } from '../constants';
import { User as UserIcon, LogOut, Package, MapPin, Mail, Smartphone, Edit2, Save, FileText, X, AlertCircle, LayoutDashboard, Key } from 'lucide-react';

interface UserProfileProps {
  user: User;
  onLogout: () => void;
  onUpdateUser?: (user: User) => void;
  onEnterAdmin?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onLogout, onUpdateUser, onEnterAdmin }) => {
  const [activeTab, setActiveTab] = useState<'ORDERS' | 'PROFILE'>('ORDERS');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // For Invoice Modal
  
  // Edit Profile State
  const [editName, setEditName] = useState(user.name);
  const [editEmail, setEditEmail] = useState(user.email || '');
  const [editProvince, setEditProvince] = useState(user.province || '');
  const [editCity, setEditCity] = useState(user.city || '');
  const [editAddress, setEditAddress] = useState(user.address || '');
  const [editPostalCode, setEditPostalCode] = useState(user.postalCode || '');
  const [editPassword, setEditPassword] = useState(''); // New state for password change

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mock orders
  const orders = db.orders.getAll().slice(0, 3); 

  const validateProfile = (): boolean => {
      const newErrors: Record<string, string> = {};

      if (!editName.trim()) {
          newErrors.name = 'نام الزامی است';
      } else if (!VALIDATION_REGEX.PERSIAN_NAME.test(editName)) {
          newErrors.name = 'نام باید فقط شامل حروف فارسی باشد';
      }

      if (!editEmail.trim()) {
          newErrors.email = 'ایمیل الزامی است';
      } else if (!VALIDATION_REGEX.EMAIL.test(editEmail)) {
          newErrors.email = 'فرمت ایمیل صحیح نیست';
      }

      if (!editPostalCode.trim()) {
          newErrors.postalCode = 'کد پستی الزامی است';
      } else if (!VALIDATION_REGEX.POSTAL_CODE.test(editPostalCode)) {
          newErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateProfile()) {
        return;
    }

    const updates: Partial<User> = {
        name: editName,
        email: editEmail,
        province: editProvince,
        city: editCity,
        address: editAddress,
        postalCode: editPostalCode
    };

    // Only update password if user entered a new one
    if (editPassword.trim()) {
        updates.password = editPassword;
    }

    const updatedUser = db.users.update(user.id, updates);

    if (updatedUser && onUpdateUser) {
        onUpdateUser(updatedUser);
        setIsEditing(false);
        setEditPassword(''); // Clear password field after save
        alert('اطلاعات کاربری با موفقیت بروزرسانی شد.');
    }
  };

  const cancelEdit = () => {
    setEditName(user.name);
    setEditEmail(user.email || '');
    setEditProvince(user.province || '');
    setEditCity(user.city || '');
    setEditAddress(user.address || '');
    setEditPostalCode(user.postalCode || '');
    setEditPassword('');
    setErrors({});
    setIsEditing(false);
  };

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      setEditProvince(e.target.value);
      setEditCity('');
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

  const InvoiceModal = ({ order, onClose }: { order: Order, onClose: () => void }) => (
    <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95" onClick={e => e.stopPropagation()}>
            <div className="bg-gray-50 p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-lg text-gray-800 flex items-center">
                    <FileText size={20} className="ml-2 text-primary"/>
                    فاکتور سفارش {order.id}
                </h3>
                <button onClick={onClose} className="text-gray-500 hover:text-red-500 transition-colors">
                    <X size={24} />
                </button>
            </div>
            <div className="p-6">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 mb-6 border-b pb-6">
                    <div>
                        <span className="block text-gray-400 text-xs">مشتری:</span>
                        <span className="font-bold text-gray-800">{order.customerName}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 text-xs">تاریخ:</span>
                        <span className="font-bold text-gray-800">{new Date(order.date).toLocaleDateString('fa-IR')}</span>
                    </div>
                    <div>
                        <span className="block text-gray-400 text-xs">وضعیت:</span>
                         <span className={`px-2 py-1 rounded-full text-xs font-medium inline-block mt-1 ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {order.status === 'DELIVERED' ? 'تحویل شده' : 
                                    order.status === 'PROCESSING' ? 'در حال پردازش' : 
                                    order.status === 'SHIPPED' ? 'ارسال شده' : 'در انتظار'}
                        </span>
                    </div>
                </div>
                
                <h4 className="font-bold text-gray-800 mb-3 text-sm">اقلام سفارش</h4>
                <div className="border rounded-lg overflow-hidden mb-6">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-3 text-right font-medium">محصول</th>
                                <th className="p-3 text-center font-medium">تعداد</th>
                                <th className="p-3 text-left font-medium">قیمت واحد</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {/* Since order.items might be empty in mock data, show placeholder or items if added */}
                            {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="p-3">{item.name}</td>
                                    <td className="p-3 text-center">{item.quantity}</td>
                                    <td className="p-3 text-left">{formatPrice(item.price)}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={3} className="p-4 text-center text-gray-400 italic">جزئیات اقلام در دسترس نیست (داده آزمایشی)</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="flex justify-between items-center text-lg font-black bg-orange-50 p-4 rounded-xl text-primary">
                    <span>مبلغ کل پرداخت شده</span>
                    <span>{formatPrice(order.totalAmount)}</span>
                </div>
            </div>
        </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {selectedOrder && <InvoiceModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />}
      
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Sidebar */}
        <div className="w-full md:w-72 space-y-4">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center text-primary mb-4 border-4 border-white shadow-sm">
              <UserIcon size={32} />
            </div>
            <h2 className="font-bold text-xl text-gray-800">{user.name}</h2>
            <p className="text-gray-500 text-sm mt-1 font-mono">{user.phone}</p>
            {user.role === 'ADMIN' && (
                <span className="mt-2 bg-purple-100 text-purple-700 text-xs px-2 py-1 rounded-full font-bold">
                    مدیر سیستم
                </span>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <nav className="flex flex-col">
              {user.role === 'ADMIN' && onEnterAdmin && (
                  <button 
                    onClick={onEnterAdmin}
                    className="px-6 py-4 text-right bg-gray-900 text-white hover:bg-gray-800 flex items-center justify-between transition-colors mb-1"
                  >
                    <span>ورود به پنل مدیریت</span>
                    <LayoutDashboard size={18} />
                  </button>
              )}

              <button 
                onClick={() => setActiveTab('ORDERS')}
                className={`px-6 py-4 text-right hover:bg-gray-50 border-b border-gray-50 transition-all duration-200 hover:pr-8 ${activeTab === 'ORDERS' ? 'bg-orange-50 text-primary font-bold border-r-4 border-r-primary' : 'text-gray-700'}`}
              >
                سفارش‌های من
              </button>
              <button 
                onClick={() => setActiveTab('PROFILE')}
                className={`px-6 py-4 text-right hover:bg-gray-50 border-b border-gray-50 transition-all duration-200 hover:pr-8 ${activeTab === 'PROFILE' ? 'bg-orange-50 text-primary font-bold border-r-4 border-r-primary' : 'text-gray-700'}`}
              >
                مشخصات حساب کاربری
              </button>
              <button 
                onClick={onLogout}
                className="px-6 py-4 text-right text-red-500 hover:bg-red-50 flex items-center transition-all duration-200 hover:pr-8"
              >
                <LogOut size={18} className="ml-2" />
                خروج از حساب
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === 'ORDERS' && (
             <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">سفارش‌های اخیر</h1>
                <div className="space-y-4">
                    {orders.length > 0 ? orders.map((order, idx) => (
                    <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4">
                        <div className="flex items-center gap-6 text-sm">
                            <div>
                            <span className="text-gray-500 ml-2">شماره سفارش:</span>
                            <span className="font-bold font-mono">{order.id}</span>
                            </div>
                            <div>
                            <span className="text-gray-500 ml-2">تاریخ:</span>
                            <span className="font-bold">{new Date(order.date).toLocaleDateString('fa-IR')}</span>
                            </div>
                        </div>
                        <div className="text-primary font-bold">
                            {formatPrice(order.totalAmount)}
                        </div>
                        </div>
                        
                        <div className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center text-sm">
                                <span className="text-gray-500 ml-2">وضعیت:</span>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 
                                    order.status === 'CANCELLED' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                                }`}>
                                {order.status === 'DELIVERED' ? 'تحویل شده' : 
                                    order.status === 'PROCESSING' ? 'در حال پردازش' : 
                                    order.status === 'SHIPPED' ? 'ارسال شده' : 'در انتظار'}
                                </span>
                            </div>
                            <button 
                                onClick={() => setSelectedOrder(order)}
                                className="text-sm text-primary hover:text-orange-700 transition-colors flex items-center"
                            >
                                <FileText size={16} className="ml-1"/>
                                مشاهده فاکتور
                            </button>
                        </div>
                        </div>
                    </div>
                    )) : (
                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
                        <Package size={48} className="mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">شما هنوز هیچ سفارشی ثبت نکرده‌اید.</p>
                    </div>
                    )}
                </div>
             </div>
          )}

          {activeTab === 'PROFILE' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <div className="flex justify-between items-center mb-6">
                      <h1 className="text-2xl font-bold text-gray-800">مشخصات کاربری</h1>
                      {!isEditing && (
                          <button 
                            onClick={() => setIsEditing(true)}
                            className="text-primary hover:bg-orange-50 px-4 py-2 rounded-lg flex items-center transition-colors"
                          >
                              <Edit2 size={18} className="ml-2" />
                              ویرایش اطلاعات
                          </button>
                      )}
                  </div>

                  {isEditing ? (
                      <form onSubmit={handleSaveProfile} className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text" 
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none ${errors.name ? 'border-red-500' : ''}`}
                                    placeholder="فقط حروف فارسی"
                                  />
                                  <ErrorMsg field="name" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">شماره موبایل</label>
                                  <input 
                                    type="text" 
                                    value={user.phone}
                                    className="w-full border rounded-lg p-3 bg-gray-50 text-gray-500 cursor-not-allowed dir-ltr"
                                    disabled
                                    title="شماره موبایل قابل تغییر نیست"
                                  />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">ایمیل <span className="text-red-500">*</span></label>
                                  <input 
                                    type="email" 
                                    value={editEmail}
                                    onChange={e => setEditEmail(e.target.value)}
                                    className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr ${errors.email ? 'border-red-500' : ''}`}
                                  />
                                  <ErrorMsg field="email" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">کد پستی <span className="text-red-500">*</span></label>
                                  <input 
                                    type="text" 
                                    value={editPostalCode}
                                    onChange={e => setEditPostalCode(e.target.value)}
                                    className={`w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr font-mono ${errors.postalCode ? 'border-red-500' : ''}`}
                                    maxLength={10}
                                  />
                                  <ErrorMsg field="postalCode" />
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">استان</label>
                                  <select 
                                    value={editProvince}
                                    onChange={handleProvinceChange}
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                  >
                                      <option value="">انتخاب استان...</option>
                                      {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                  </select>
                              </div>
                              <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">شهر</label>
                                  <select 
                                    value={editCity}
                                    onChange={e => setEditCity(e.target.value)}
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                    disabled={!editProvince}
                                  >
                                      <option value="">انتخاب شهر...</option>
                                      {getCitiesForProvince(editProvince).map(c => <option key={c} value={c}>{c}</option>)}
                                  </select>
                              </div>
                              <div className="md:col-span-2">
                                  <label className="block text-sm font-medium text-gray-700 mb-2">آدرس دقیق</label>
                                  <textarea 
                                    rows={3}
                                    value={editAddress}
                                    onChange={e => setEditAddress(e.target.value)}
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none"
                                  />
                              </div>
                              
                              <div className="md:col-span-2 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                                  <div className="flex items-center gap-2 mb-2 text-gray-800 font-bold">
                                      <Key size={18} className="text-primary"/>
                                      تغییر رمز عبور
                                  </div>
                                  <p className="text-xs text-gray-500 mb-3">اگر قصد تغییر رمز عبور را ندارید، این فیلد را خالی بگذارید.</p>
                                  <input 
                                    type="text" 
                                    value={editPassword}
                                    onChange={e => setEditPassword(e.target.value)}
                                    className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr font-mono"
                                    placeholder="رمز عبور جدید..."
                                    autoComplete="new-password"
                                  />
                              </div>
                          </div>
                          <div className="flex justify-end gap-3 pt-4 border-t">
                              <button 
                                type="button" 
                                onClick={cancelEdit}
                                className="px-6 py-2 border rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
                              >
                                  انصراف
                              </button>
                              <button 
                                type="submit" 
                                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 shadow-md transition-colors flex items-center"
                              >
                                  <Save size={18} className="ml-2" />
                                  ذخیره تغییرات
                              </button>
                          </div>
                      </form>
                  ) : (
                      <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                              <div className="flex items-start">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ml-4 flex-shrink-0">
                                      <UserIcon size={20} />
                                  </div>
                                  <div>
                                      <span className="block text-sm text-gray-500 mb-1">نام و نام خانوادگی</span>
                                      <span className="block font-medium text-gray-800 text-lg">{user.name}</span>
                                  </div>
                              </div>
                              <div className="flex items-start">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ml-4 flex-shrink-0">
                                      <Smartphone size={20} />
                                  </div>
                                  <div>
                                      <span className="block text-sm text-gray-500 mb-1">شماره موبایل</span>
                                      <span className="block font-medium text-gray-800 text-lg font-mono">{user.phone}</span>
                                  </div>
                              </div>
                              <div className="flex items-start">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ml-4 flex-shrink-0">
                                      <Mail size={20} />
                                  </div>
                                  <div>
                                      <span className="block text-sm text-gray-500 mb-1">ایمیل</span>
                                      <span className="block font-medium text-gray-800 text-lg font-mono">{user.email || '---'}</span>
                                  </div>
                              </div>
                              <div className="flex items-start">
                                  <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 ml-4 flex-shrink-0">
                                      <MapPin size={20} />
                                  </div>
                                  <div>
                                      <span className="block text-sm text-gray-500 mb-1">آدرس</span>
                                      <div className="font-medium text-gray-800 leading-relaxed">
                                          {user.province && <span className="ml-1">{user.province}،</span>}
                                          {user.city && <span className="ml-1">{user.city}،</span>}
                                          {user.address}
                                          {!user.address && !user.city && !user.province && 'آدرسی ثبت نشده است.'}
                                      </div>
                                      {user.postalCode && <span className="block text-sm text-gray-500 mt-1 font-mono">کد پستی: {user.postalCode}</span>}
                                  </div>
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
