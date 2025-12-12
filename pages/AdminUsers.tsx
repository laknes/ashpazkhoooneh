
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../services/db';
import { User } from '../types';
import { Trash2, Shield, ShieldOff, User as UserIcon, Edit, Plus, X, AlertCircle } from 'lucide-react';
import { PROVINCES, getCitiesForProvince, VALIDATION_REGEX } from '../constants';

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    refreshUsers();
  }, []);

  const refreshUsers = () => {
    setUsers(db.users.getAll());
  };

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این کاربر اطمینان دارید؟')) {
      db.users.delete(id);
      refreshUsers();
    }
  };

  const handleToggleRole = (user: User) => {
    const newRole = user.role === 'ADMIN' ? 'USER' : 'ADMIN';
    if (confirm(`آیا مطمئن هستید که می‌خواهید نقش کاربر ${user.name} را به ${newRole === 'ADMIN' ? 'مدیر' : 'کاربر عادی'} تغییر دهید؟`)) {
      db.users.updateRole(user.id, newRole);
      refreshUsers();
    }
  };

  const handleAdd = () => {
      setEditingUser({
          name: '',
          phone: '',
          email: '',
          role: 'USER',
          province: '',
          city: '',
          address: '',
          postalCode: '',
          password: ''
      });
      setErrors({});
      setIsModalOpen(true);
  };

  const handleEdit = (user: User) => {
      setEditingUser({ ...user });
      setErrors({});
      setIsModalOpen(true);
  };

  const validate = (): boolean => {
      const newErrors: Record<string, string> = {};
      
      if (!editingUser.name?.trim()) newErrors.name = 'نام الزامی است';
      else if (!VALIDATION_REGEX.PERSIAN_NAME.test(editingUser.name)) newErrors.name = 'نام باید فارسی باشد';

      if (!editingUser.phone?.trim()) newErrors.phone = 'شماره موبایل الزامی است';
      else if (!VALIDATION_REGEX.PHONE.test(editingUser.phone)) newErrors.phone = 'فرمت موبایل نامعتبر است';
      else if (!editingUser.id) {
          // Check uniqueness only for new users
          const exists = users.find(u => u.phone === editingUser.phone);
          if (exists) newErrors.phone = 'این شماره موبایل قبلاً ثبت شده است';
      }

      if (!editingUser.email?.trim()) newErrors.email = 'ایمیل الزامی است';
      else if (!VALIDATION_REGEX.EMAIL.test(editingUser.email)) newErrors.email = 'فرمت ایمیل نامعتبر است';

      if (!editingUser.postalCode?.trim()) newErrors.postalCode = 'کد پستی الزامی است';
      else if (!VALIDATION_REGEX.POSTAL_CODE.test(editingUser.postalCode)) newErrors.postalCode = 'کد پستی باید ۱۰ رقم باشد';

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate()) return;

      if (editingUser.id) {
          db.users.update(editingUser.id, editingUser);
      } else {
          db.users.add(editingUser as Omit<User, 'id'>);
      }
      setIsModalOpen(false);
      refreshUsers();
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

  // Render Modal via Portal to avoid Z-Index/Overflow issues
  const renderModal = () => {
    if (!isModalOpen) return null;

    return createPortal(
        <div 
            className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
            onClick={() => setIsModalOpen(false)}
        >
            <div 
                className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Fixed */}
                <div className="p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-2xl flex-shrink-0">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center">
                        <UserIcon className="ml-2 text-primary" />
                        {editingUser.id ? 'ویرایش اطلاعات کاربر' : 'افزودن کاربر جدید'}
                    </h2>
                    <button 
                        onClick={() => setIsModalOpen(false)} 
                        className="text-gray-400 hover:text-red-500 transition-colors p-1 hover:bg-red-50 rounded-full"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                    <form id="userForm" onSubmit={handleSubmit} className="space-y-6">
                        {/* Personal Info */}
                        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                            <h3 className="text-sm font-bold text-blue-800 mb-4 border-b border-blue-200 pb-2">اطلاعات هویتی و دسترسی</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">نام و نام خانوادگی <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={editingUser.name}
                                        onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                                        className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none transition-shadow ${errors.name ? 'border-red-500' : ''}`}
                                    />
                                    <ErrorMsg field="name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">نقش کاربری</label>
                                    <select 
                                        value={editingUser.role}
                                        onChange={e => setEditingUser({...editingUser, role: e.target.value as 'ADMIN' | 'USER'})}
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                    >
                                        <option value="USER">کاربر عادی</option>
                                        <option value="ADMIN">مدیر کل</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">شماره موبایل <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={editingUser.phone}
                                        onChange={e => setEditingUser({...editingUser, phone: e.target.value})}
                                        className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr font-mono ${errors.phone ? 'border-red-500' : ''}`}
                                        placeholder="0912..."
                                        disabled={!!editingUser.id}
                                    />
                                    <ErrorMsg field="phone" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">رمز عبور</label>
                                    <input 
                                        type="text" 
                                        value={editingUser.password || ''}
                                        onChange={e => setEditingUser({...editingUser, password: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr font-mono"
                                        placeholder={editingUser.id ? '•••••• (تغییر نمی‌کند)' : 'رمز عبور'}
                                    />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">ایمیل <span className="text-red-500">*</span></label>
                                    <input 
                                        type="email" 
                                        value={editingUser.email}
                                        onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                        className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr ${errors.email ? 'border-red-500' : ''}`}
                                    />
                                    <ErrorMsg field="email" />
                                </div>
                            </div>
                        </div>

                        {/* Address Info */}
                        <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                             <h3 className="text-sm font-bold text-orange-800 mb-4 border-b border-orange-200 pb-2">اطلاعات سکونت</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">استان</label>
                                    <select 
                                        value={editingUser.province}
                                        onChange={e => setEditingUser({...editingUser, province: e.target.value, city: ''})}
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                    >
                                        <option value="">انتخاب استان...</option>
                                        {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">شهر</label>
                                    <select 
                                        value={editingUser.city}
                                        onChange={e => setEditingUser({...editingUser, city: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                        disabled={!editingUser.province}
                                    >
                                        <option value="">انتخاب شهر...</option>
                                        {getCitiesForProvince(editingUser.province || '').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 mb-1">کد پستی <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        value={editingUser.postalCode}
                                        onChange={e => setEditingUser({...editingUser, postalCode: e.target.value})}
                                        className={`w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none dir-ltr font-mono ${errors.postalCode ? 'border-red-500' : ''}`}
                                        maxLength={10}
                                    />
                                    <ErrorMsg field="postalCode" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="block text-xs font-bold text-gray-600 mb-1">آدرس دقیق پستی</label>
                                    <textarea 
                                        rows={2}
                                        value={editingUser.address}
                                        onChange={e => setEditingUser({...editingUser, address: e.target.value})}
                                        className="w-full border rounded-lg p-2.5 focus:ring-2 focus:ring-primary focus:outline-none"
                                        placeholder="خیابان، کوچه، پلاک..."
                                    ></textarea>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer Buttons - Fixed at bottom */}
                <div className="p-4 border-t flex justify-end gap-3 bg-white rounded-b-2xl flex-shrink-0">
                    <button 
                        type="button" 
                        onClick={() => setIsModalOpen(false)}
                        className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition active:scale-95 font-medium"
                    >
                        انصراف
                    </button>
                    <button 
                        type="submit"
                        form="userForm"
                        className="px-8 py-2.5 bg-primary text-white rounded-xl hover:bg-orange-600 shadow-lg shadow-orange-500/30 transition active:scale-95 font-bold"
                    >
                        {editingUser.id ? 'ذخیره تغییرات' : 'افزودن کاربر'}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">مدیریت کاربران</h1>
        <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 hover:shadow-md active:scale-95"
        >
            <Plus size={20} className="ml-2" />
            افزودن کاربر جدید
        </button>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نام</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره موبایل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نقش</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">استان / شهر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-primary">
                                <UserIcon size={20} />
                            </div>
                            <div className="mr-4">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-xs text-gray-500">{user.email}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {user.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                        {user.role === 'ADMIN' ? 'مدیر کل' : 'کاربر'}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.province}، {user.city}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button 
                            onClick={() => handleEdit(user)}
                            className="text-indigo-600 hover:text-indigo-900 ml-4 p-2 hover:bg-indigo-50 rounded-full transition hover:scale-110"
                            title="ویرایش"
                        >
                            <Edit size={18} />
                        </button>
                        <button 
                            onClick={() => handleToggleRole(user)} 
                            className="text-orange-600 hover:text-orange-900 ml-4 p-2 hover:bg-orange-50 rounded-full transition hover:scale-110"
                            title={user.role === 'ADMIN' ? 'تغییر به کاربر عادی' : 'ارتقا به مدیر'}
                        >
                            {user.role === 'ADMIN' ? <ShieldOff size={18} /> : <Shield size={18} />}
                        </button>
                        <button 
                            onClick={() => handleDelete(user.id)} 
                            className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition hover:scale-110"
                            title="حذف"
                        >
                            <Trash2 size={18} />
                        </button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {renderModal()}
    </div>
  );
};

export default AdminUsers;
