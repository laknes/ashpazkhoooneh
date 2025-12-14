
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { BlogPost } from '../types';
import { Calendar, User, ArrowLeft } from 'lucide-react';

const Blog: React.FC = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await db.posts.getAll();
        setPosts(data);
      } catch (error) {
        console.error("Failed to load blog posts", error);
      }
    };
    fetchPosts();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-black text-gray-900 mb-4">مجله آشپزخونه</h1>
        <p className="text-gray-500 max-w-2xl mx-auto">
          جدیدترین مقالات، راهنمای خرید و ترفندهای خانه‌داری را در اینجا بخوانید.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
            <div className="relative h-48 overflow-hidden">
              <img 
                src={post.image} 
                alt={post.title} 
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            
            <div className="p-6">
              <div className="flex items-center text-xs text-gray-400 mb-4 space-x-4 space-x-reverse">
                <span className="flex items-center"><Calendar size={12} className="ml-1" /> {post.date}</span>
                <span className="flex items-center"><User size={12} className="ml-1" /> {post.author}</span>
              </div>
              
              <h2 className="text-xl font-bold text-gray-800 mb-3 group-hover:text-primary transition-colors">
                {post.title}
              </h2>
              
              <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                {post.excerpt}
              </p>
              
              <button className="text-primary text-sm font-medium flex items-center hover:text-orange-700">
                ادامه مطلب <ArrowLeft size={16} className="mr-1" />
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blog;
