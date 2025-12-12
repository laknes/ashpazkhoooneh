
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Category } from '../types';
import { Edit, Trash2, Plus, X, Image as ImageIcon } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Partial<Category>>({});

  useEffect(() => {
    refreshCategories();
  }, []);

  const refreshCategories = () => {
    setCategories(db.categories.getAll());
  };

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این دسته‌بندی اطمینان دارید؟ توجه داشته باشید که محصولات این دسته حذف نخواهند شد.')) {
      db.categories.delete(id);
      refreshCategories();
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory({ name: '', image: '', icon: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory.image) {
        alert('لطفاً یک تصویر برای دسته‌بندی انتخاب کنید.');
        return;
    }
    if (editingCategory.id) {
      db.categories.update(editingCategory.id, editingCategory);
    } else {
      db.categories.add(editingCategory as Omit<Category, 'id'>);
    }
    setIsModalOpen(false);
    refreshCategories();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">مدیریت دسته‌بندی‌ها</h1>
        <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition"
        >
            <Plus size={20} className="ml-2" />
            افزودن دسته جدید
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-200 ml-4 flex-shrink-0">
                  {cat.image ? (
                    <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-2xl">
                        {cat.icon || <ImageIcon size={24} className="text-gray-400" />}
                    </div>
                  )}
              </div>
              <h3 className="font-bold text-lg text-gray-800">{cat.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(cat)} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-full transition"><Edit size={18} /></button>
              <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-full transition"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingCategory.id ? 'ویرایش دسته' : 'افزودن دسته جدید'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نام دسته‌بندی</label>
                <input 
                  type="text" 
                  required
                  value={editingCategory.name}
                  onChange={e => setEditingCategory({...editingCategory, name: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  placeholder="مثال: لوازم برقی"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">تصویر دسته‌بندی</label>
                <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg mb-2 flex items-center">
                    <ImageIcon size={14} className="ml-1" />
                    حداکثر ۴۰۰ پیکسل (بهتر است مربع باشد)
                </div>
                <ImageUploader 
                    currentImage={editingCategory.image}
                    onImageSelect={(base64) => setEditingCategory({...editingCategory, image: base64})}
                    className="h-40"
                    maxWidth={400}
                    maxHeight={400}
                />
              </div>

              {/* Optional Icon fallback hidden or minimized */}
              <div className="opacity-50 hover:opacity-100 transition-opacity">
                 <label className="block text-xs font-medium text-gray-500 mb-1">آیکون (اختیاری - ایموجی)</label>
                 <input 
                  type="text" 
                  value={editingCategory.icon || ''}
                  onChange={e => setEditingCategory({...editingCategory, icon: e.target.value})}
                  className="w-full border rounded-lg p-2 text-sm"
                  placeholder="⚡"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">انصراف</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 shadow-md">
                  {editingCategory.id ? 'ذخیره تغییرات' : 'افزودن'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;