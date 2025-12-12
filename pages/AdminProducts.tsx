
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Product } from '../types';
import { formatPrice, CATEGORIES } from '../constants';
import { Edit, Trash2, Plus, X, MinusCircle, Image as ImageIcon, Search } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Partial<Product>>({});
  const [newFeature, setNewFeature] = useState('');

  useEffect(() => {
    refreshProducts();
  }, []);

  const refreshProducts = () => {
    setProducts(db.products.getAll());
  };

  const handleDelete = (id: number) => {
    if (confirm('آیا از حذف این محصول اطمینان دارید؟')) {
      db.products.delete(id);
      refreshProducts();
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct({...product, features: product.features || []});
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingProduct({
        name: '',
        price: 0,
        category: 'لوازم برقی',
        image: '',
        description: '',
        features: [],
        rating: 5,
        reviews: 0,
        metaTitle: '',
        metaDescription: '',
        metaKeywords: ''
    });
    setNewFeature('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct.image) {
        alert('لطفا تصویری برای محصول انتخاب کنید.');
        return;
    }

    if (editingProduct.id) {
        db.products.update(editingProduct.id, editingProduct);
    } else {
        db.products.add(editingProduct as Omit<Product, 'id'>);
    }
    setIsModalOpen(false);
    refreshProducts();
  };

  const addFeature = () => {
    if (newFeature.trim()) {
        setEditingProduct({
            ...editingProduct,
            features: [...(editingProduct.features || []), newFeature.trim()]
        });
        setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    const updatedFeatures = [...(editingProduct.features || [])];
    updatedFeatures.splice(index, 1);
    setEditingProduct({ ...editingProduct, features: updatedFeatures });
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">مدیریت محصولات</h1>
        <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition-all duration-200 hover:shadow-md active:scale-95"
        >
            <Plus size={20} className="ml-2" />
            افزودن محصول جدید
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">تصویر</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">نام محصول</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">دسته‌بندی</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">قیمت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">عملیات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                <tr key={product.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <img className="h-10 w-10 rounded-full object-cover" src={product.image} alt="" />
                    </td>
                    <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800">
                        {product.category}
                        </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatPrice(product.price)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button onClick={() => handleEdit(product)} className="text-indigo-600 hover:text-indigo-900 ml-4 transition-transform hover:scale-110"><Edit size={18} /></button>
                        <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:text-red-900 transition-transform hover:scale-110"><Trash2 size={18} /></button>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>

      {/* Edit/Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200">
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-bold">{editingProduct.id ? 'ویرایش محصول' : 'افزودن محصول جدید'}</h2>
                    <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-transform hover:scale-110"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    
                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Image Upload Column */}
                        <div className="w-full md:w-1/3">
                            <label className="block text-sm font-medium text-gray-700 mb-2">تصویر محصول</label>
                            <div className="bg-blue-50 text-blue-800 text-xs px-2 py-1.5 rounded-lg mb-2 flex items-center">
                                <ImageIcon size={12} className="ml-1" />
                                حداکثر ۸۰۰ پیکسل
                            </div>
                            <ImageUploader 
                                currentImage={editingProduct.image}
                                onImageSelect={(base64) => setEditingProduct({...editingProduct, image: base64})}
                                maxWidth={800}
                                maxHeight={800}
                                quality={0.8}
                            />
                        </div>

                        {/* Fields Column */}
                        <div className="w-full md:w-2/3 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام محصول</label>
                                <input 
                                    type="text" 
                                    required
                                    autoFocus
                                    value={editingProduct.name}
                                    onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">دسته‌بندی</label>
                                    <select 
                                        value={editingProduct.category}
                                        onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    >
                                        {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">قیمت (تومان)</label>
                                    <input 
                                        type="number" 
                                        required
                                        value={editingProduct.price}
                                        onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">قیمت قبلی (تومان)</label>
                                <input 
                                    type="number" 
                                    value={editingProduct.oldPrice || ''}
                                    onChange={e => setEditingProduct({...editingProduct, oldPrice: Number(e.target.value)})}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">توضیحات</label>
                                <textarea 
                                    rows={3}
                                    value={editingProduct.description}
                                    onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Features Section */}
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                        <label className="block text-sm font-bold text-gray-700 mb-2">ویژگی‌های محصول</label>
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" 
                                value={newFeature}
                                onChange={e => setNewFeature(e.target.value)}
                                placeholder="مثلا: دارای گارانتی ۱۸ ماهه"
                                className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none bg-white"
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            />
                            <button 
                                type="button" 
                                onClick={addFeature}
                                className="bg-gray-800 text-white px-3 py-2 rounded-lg hover:bg-gray-700 transition active:scale-95"
                            >
                                <Plus size={20} />
                            </button>
                        </div>
                        <div className="space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {editingProduct.features?.map((feature, idx) => (
                                <div key={idx} className="flex justify-between items-center bg-white border border-gray-200 px-3 py-2 rounded-lg text-sm">
                                    <span>{feature}</span>
                                    <button 
                                        type="button" 
                                        onClick={() => removeFeature(idx)}
                                        className="text-red-500 hover:text-red-700 transition hover:scale-110"
                                    >
                                        <MinusCircle size={16} />
                                    </button>
                                </div>
                            ))}
                            {(!editingProduct.features || editingProduct.features.length === 0) && (
                                <p className="text-gray-400 text-xs italic text-center py-2">هنوز ویژگی‌ای اضافه نشده است.</p>
                            )}
                        </div>
                    </div>

                    {/* SEO Section */}
                    <div className="border rounded-xl p-4 border-gray-200">
                        <div className="flex items-center gap-2 mb-4 text-gray-800">
                            <Search size={18} className="text-green-600" />
                            <h3 className="font-bold text-sm">تنظیمات سئو (SEO)</h3>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">عنوان متا (Meta Title)</label>
                                <input 
                                    type="text" 
                                    value={editingProduct.metaTitle || ''}
                                    onChange={e => setEditingProduct({...editingProduct, metaTitle: e.target.value})}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="اگر خالی باشد، از نام محصول استفاده می‌شود"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-600 mb-1">توضیحات متا (Meta Description)</label>
                                <textarea 
                                    rows={2}
                                    value={editingProduct.metaDescription || ''}
                                    onChange={e => setEditingProduct({...editingProduct, metaDescription: e.target.value})}
                                    className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                                    placeholder="توضیحاتی برای موتورهای جستجو..."
                                />
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-4 border-t flex justify-end gap-3">
                        <button 
                            type="button" 
                            onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50 transition active:scale-95"
                        >
                            انصراف
                        </button>
                        <button 
                            type="submit" 
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 shadow-md transition active:scale-95 font-bold"
                        >
                            {editingProduct.id ? 'ذخیره تغییرات' : 'افزودن محصول'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;