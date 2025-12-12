
import React, { useState } from 'react';
import { ViewState } from '../types';
import { LayoutDashboard, Package, ShoppingBag, LogOut, Store, FileText, Layers, Settings, Users, Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ currentView, onChangeView, onLogout, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const menuItems = [
    { label: 'داشبورد', view: 'ADMIN_DASHBOARD' as ViewState, icon: LayoutDashboard },
    { label: 'محصولات', view: 'ADMIN_PRODUCTS' as ViewState, icon: Package },
    { label: 'سفارشات', view: 'ADMIN_ORDERS' as ViewState, icon: ShoppingBag },
    { label: 'کاربران', view: 'ADMIN_USERS' as ViewState, icon: Users },
    { label: 'دسته‌بندی‌ها', view: 'ADMIN_CATEGORIES' as ViewState, icon: Layers },
    { label: 'مجله و بلاگ', view: 'ADMIN_BLOG' as ViewState, icon: FileText },
    { label: 'تنظیمات سایت', view: 'ADMIN_SETTINGS' as ViewState, icon: Settings },
  ];

  const handleNavigate = (view: ViewState) => {
    onChangeView(view);
    setIsSidebarOpen(false); // Close sidebar on mobile after navigation
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-fixed bg-cover" style={{ backgroundImage: `radial-gradient(at 0% 0%, hsla(27,96%,90%,1) 0, transparent 50%), radial-gradient(at 100% 100%, hsla(225,39%,90%,1) 0, transparent 50%)`}}>
      
      {/* Mobile Header */}
      <div className="md:hidden bg-gray-900 text-white p-4 flex justify-between items-center shadow-md z-30 sticky top-0">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
             <Menu size={24} />
          </button>
          <span className="font-bold text-orange-500">پنل مدیریت</span>
          <button onClick={onLogout} className="text-red-400">
             <LogOut size={20} />
          </button>
      </div>

      {/* Sidebar - Glassmorphism */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-64 bg-gray-900/95 backdrop-blur-xl text-white shadow-2xl border-l border-white/10 transition-transform duration-300 transform 
        md:translate-x-0 md:static md:border-l-0 md:border-r md:w-64 flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-gray-800/50 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-black text-orange-500">پنل مدیریت</h2>
            <p className="text-xs text-gray-400 mt-1">مدیریت فروشگاه آشپزخونه</p>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400">
            <X size={24} />
          </button>
        </div>
        
        <nav className="p-4 space-y-2 overflow-y-auto h-[calc(100vh-80px)]">
          {menuItems.map((item) => (
            <button
              key={item.view}
              onClick={() => handleNavigate(item.view)}
              className={`flex w-full items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                currentView === item.view
                  ? 'bg-orange-600 text-white shadow-lg shadow-orange-900/50'
                  : 'text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
            >
              <item.icon size={20} className="ml-2" />
              {item.label}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-gray-800/50">
            <button
              onClick={() => onChangeView('HOME')}
              className="flex w-full items-center px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-colors"
            >
              <Store size={20} className="ml-2" />
              بازگشت به فروشگاه
            </button>
            <button
              onClick={onLogout}
              className="flex w-full items-center px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-xl transition-colors"
            >
              <LogOut size={20} className="ml-2" />
              خروج
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-56px)] md:h-screen bg-gray-50/50 backdrop-blur-sm">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
