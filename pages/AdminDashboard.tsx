
import React, { useEffect, useState } from 'react';
import { db } from '../services/db';
import { formatPrice } from '../constants';
import { DollarSign, ShoppingBag, Package, Users, TrendingUp, Settings, Activity } from 'lucide-react';
import { ViewState } from '../types';

interface AdminDashboardProps {
  onChangeView?: (view: ViewState) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onChangeView }) => {
  const [stats, setStats] = useState({
    productsCount: 0,
    ordersCount: 0,
    totalSales: 0,
    pendingOrders: 0
  });
  const [activeUsers, setActiveUsers] = useState(0);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await db.stats.getSummary();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };
    fetchStats();

    // Fetch active users initially and every 10 seconds
    const fetchActiveUsers = async () => {
        try {
            const count = await db.stats.getActiveUsers();
            setActiveUsers(count);
        } catch (error) {
            console.error("Failed to fetch active users", error);
        }
    };
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 10000);

    return () => clearInterval(interval);
  }, []);

  const statCards = [
    { title: 'کاربران آنلاین', value: activeUsers, icon: Activity, color: 'bg-indigo-100 text-indigo-600', animate: true },
    { title: 'فروش کل', value: formatPrice(stats.totalSales), icon: DollarSign, color: 'bg-green-100 text-green-600' },
    { title: 'تعداد سفارشات', value: stats.ordersCount, icon: ShoppingBag, color: 'bg-blue-100 text-blue-600' },
    { title: 'تعداد محصولات', value: stats.productsCount, icon: Package, color: 'bg-orange-100 text-orange-600' },
    { title: 'سفارشات جاری', value: stats.pendingOrders, icon: TrendingUp, color: 'bg-yellow-100 text-yellow-600' },
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-gray-800">داشبورد</h1>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statCards.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between transition-all hover:shadow-md">
            <div>
              <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
              <h3 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                  {stat.value}
                  {stat.animate && <span className="flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
                  </span>}
              </h3>
            </div>
            <div className={`p-4 rounded-full ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity Mockup */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4">فعالیت‌های اخیر</h3>
            <div className="space-y-4">
                <div className="flex items-center text-sm border-b pb-3 last:border-0">
                    <div className="w-2 h-2 bg-green-500 rounded-full ml-3"></div>
                    <span className="text-gray-600">سفارش جدید #ORD-1002 ثبت شد.</span>
                    <span className="mr-auto text-gray-400 text-xs">۵ دقیقه پیش</span>
                </div>
                <div className="flex items-center text-sm border-b pb-3 last:border-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full ml-3"></div>
                    <span className="text-gray-600">موجودی محصول "اسپرسوساز" کم است.</span>
                    <span className="mr-auto text-gray-400 text-xs">۲ ساعت پیش</span>
                </div>
                <div className="flex items-center text-sm border-b pb-3 last:border-0">
                    <div className="w-2 h-2 bg-orange-500 rounded-full ml-3"></div>
                    <span className="text-gray-600">کاربر جدید "مریم رضایی" ثبت نام کرد.</span>
                    <span className="mr-auto text-gray-400 text-xs">دیروز</span>
                </div>
            </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
             <h3 className="font-bold text-lg mb-4">دسترسی سریع</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button 
                    onClick={() => onChangeView?.('ADMIN_PRODUCTS')}
                    className="p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-primary hover:border-primary hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
                >
                    <Package className="mb-2" />
                    مدیریت محصولات
                </button>
                <button 
                    onClick={() => onChangeView?.('ADMIN_USERS')}
                    className="p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-primary hover:border-primary hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
                >
                    <Users className="mb-2" />
                    مدیریت کاربران
                </button>
                <button 
                    onClick={() => onChangeView?.('ADMIN_SETTINGS')}
                    className="p-4 border border-dashed border-gray-300 rounded-lg text-gray-500 hover:text-primary hover:border-primary hover:bg-orange-50 transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center justify-center"
                >
                    <Settings className="mb-2" />
                    تنظیمات سایت
                </button>
             </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
