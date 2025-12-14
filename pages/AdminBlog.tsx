
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { BlogPost } from '../types';
import { Edit, Trash2, Plus, X, Search } from 'lucide-react';
import ImageUploader from '../components/ImageUploader';

const AdminBlog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<BlogPost>>({});

  useEffect(() => {
    refreshPosts();
  }, []);

  const refreshPosts = async () => {
    const data = await db.posts.getAll();
    setPosts(data);
  };

  const handleDelete = async (id: number) => {
    if (confirm('آیا از حذف این مقاله اطمینان دارید؟')) {
      await db.posts.delete(id);
      refreshPosts();
    }
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingPost({
      title: '',
      excerpt: '',
      image: '',
      date: new Date().toLocaleDateString('fa-IR'),
      author: 'ادمین',
      metaTitle: '',
      metaDescription: '',
      metaKeywords: ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPost.id) {
      await db.posts.update(editingPost.id, editingPost);
    } else {
      await db.posts.add(editingPost as Omit<BlogPost, 'id'>);
    }
    setIsModalOpen(false);
    refreshPosts();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">مدیریت مجله و بلاگ</h1>
        <button 
            onClick={handleAdd}
            className="bg-primary hover:bg-orange-600 text-white px-4 py-2 rounded-lg flex items-center transition"
        >
            <Plus size={20} className="ml-2" />
            افزودن مقاله جدید
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تصویر</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عنوان</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">نویسنده</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {posts.map((post) => (
              <tr key={post.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img className="h-10 w-16 object-cover rounded" src={post.image} alt="" />
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm font-medium text-gray-900">{post.title}</div>
                  <div className="text-xs text-gray-500 truncate max-w-xs">{post.excerpt}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.author}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{post.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button onClick={() => handleEdit(post)} className="text-indigo-600 hover:text-indigo-900 ml-4"><Edit size={18} /></button>
                  <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-900"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="text-xl font-bold">{editingPost.id ? 'ویرایش مقاله' : 'افزودن مقاله جدید'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">عنوان مقاله</label>
                <input 
                  type="text" 
                  required
                  value={editingPost.title}
                  onChange={e => setEditingPost({...editingPost, title: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نویسنده</label>
                  <input 
                    type="text" 
                    required
                    value={editingPost.author}
                    onChange={e => setEditingPost({...editingPost, author: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تاریخ انتشار</label>
                  <input 
                    type="text" 
                    required
                    value={editingPost.date}
                    onChange={e => setEditingPost({...editingPost, date: e.target.value})}
                    className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">تصویر مقاله</label>
                <div className="text-xs text-gray-500 mb-2">حداکثر ۸۰۰ پیکسل</div>
                <ImageUploader 
                    currentImage={editingPost.image}
                    onImageSelect={(base64) => setEditingPost({...editingPost, image: base64})}
                    className="h-40"
                    maxWidth={800}
                    maxHeight={600}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">خلاصه متن</label>
                <textarea 
                  rows={4}
                  required
                  value={editingPost.excerpt}
                  onChange={e => setEditingPost({...editingPost, excerpt: e.target.value})}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary focus:outline-none"
                ></textarea>
              </div>

              {/* SEO Section */}
              <div className="border rounded-xl p-4 border-gray-200 mt-4">
                  <div className="flex items-center gap-2 mb-4 text-gray-800">
                      <Search size={18} className="text-green-600" />
                      <h3 className="font-bold text-sm">تنظیمات سئو (SEO)</h3>
                  </div>
                  <div className="space-y-3">
                      <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">عنوان متا (Meta Title)</label>
                          <input 
                              type="text" 
                              value={editingPost.metaTitle || ''}
                              onChange={e => setEditingPost({...editingPost, metaTitle: e.target.value})}
                              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                              placeholder="پیش‌فرض: عنوان مقاله"
                          />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-600 mb-1">توضیحات متا (Meta Description)</label>
                          <textarea 
                              rows={2}
                              value={editingPost.metaDescription || ''}
                              onChange={e => setEditingPost({...editingPost, metaDescription: e.target.value})}
                              className="w-full border rounded-lg p-2 text-sm focus:ring-2 focus:ring-green-500 focus:outline-none"
                              placeholder="توضیحاتی جذاب برای موتورهای جستجو..."
                          />
                      </div>
                  </div>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50">انصراف</button>
                <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-orange-600 shadow-md">
                  {editingPost.id ? 'ذخیره تغییرات' : 'انتشار مقاله'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;
