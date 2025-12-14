
import React from 'react';
import { CartItem, ViewState } from '../types';
import { formatPrice } from '../constants';
import { Trash2, Plus, Minus, ArrowLeft } from 'lucide-react';

// Helper for empty state icon
const ShoppingCartIcon = ({ size, className }: { size: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size} 
        height={size} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

interface CartProps {
  cart: CartItem[];
  onUpdateQuantity: (id: number, delta: number) => void;
  onRemove: (id: number) => void;
  onChangeView: (view: ViewState) => void;
}

const Cart: React.FC<CartProps> = ({ cart, onUpdateQuantity, onRemove, onChangeView }) => {
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shipping = subtotal > 5000000 ? 0 : 150000;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-in fade-in zoom-in duration-500">
        <div className="bg-orange-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCartIcon size={48} className="text-primary opacity-50" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">سبد خرید شما خالی است</h2>
        <p className="text-gray-500 mb-8">هنوز محصولی به سبد خرید خود اضافه نکرده‌اید.</p>
        <button 
            onClick={() => onChangeView('CATALOG')}
            className="bg-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-orange-600 transition-all duration-300 shadow-md hover:shadow-lg hover:-translate-y-1 active:scale-95"
        >
            مشاهده محصولات
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold mb-8 flex items-center">
        سبد خرید
        <span className="mr-2 text-sm font-normal text-gray-500 bg-white/60 backdrop-blur-sm border border-white/50 px-2 py-1 rounded-full">
            {cart.length} کالا
        </span>
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items - Glassmorphism */}
        <div className="flex-1 space-y-4">
            {cart.map(item => (
                <div key={item.id} className="glass-card p-4 rounded-xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center w-full sm:w-auto gap-4">
                        <img src={item.image} alt={item.name} className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg bg-white/40 border border-white/30 flex-shrink-0" />
                        <div className="flex-1 sm:hidden">
                            <h3 className="font-bold text-gray-800 mb-1 text-sm line-clamp-1">{item.name}</h3>
                            <span className="text-xs text-gray-500">{item.category}</span>
                            <div className="mt-1 text-primary font-bold text-sm">
                                {formatPrice(item.price)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="hidden sm:block flex-1">
                        <h3 className="font-bold text-gray-800 mb-1">{item.name}</h3>
                        <span className="text-sm text-gray-500">{item.category}</span>
                        <div className="mt-2 text-primary font-bold">
                            {formatPrice(item.price)}
                        </div>
                    </div>

                    <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-4 mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100/50">
                        <div className="flex items-center bg-white/50 border border-white/60 rounded-lg p-1">
                            <button 
                                onClick={() => onUpdateQuantity(item.id, 1)}
                                className="p-1 hover:bg-white rounded-md transition-all duration-200 shadow-sm hover:shadow active:scale-90"
                            >
                                <Plus size={16} />
                            </button>
                            <span className="w-8 text-center font-bold text-gray-700 select-none">{item.quantity}</span>
                            <button 
                                onClick={() => onUpdateQuantity(item.id, -1)}
                                className="p-1 hover:bg-white rounded-md transition-all duration-200 shadow-sm hover:shadow active:scale-90 disabled:opacity-50 disabled:cursor-not-allowed"
                                disabled={item.quantity <= 1}
                            >
                                <Minus size={16} />
                            </button>
                        </div>

                        <button 
                            onClick={() => onRemove(item.id)}
                            className="text-red-400 hover:text-red-600 transition-all duration-200 hover:scale-110 active:scale-90 flex items-center gap-1 text-sm sm:text-base"
                            title="حذف از سبد"
                        >
                            <Trash2 size={18} />
                            <span className="sm:hidden">حذف</span>
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* Summary - Glassmorphism */}
        <div className="w-full lg:w-96">
            <div className="glass-card p-6 rounded-xl shadow-sm sticky top-24">
                <h3 className="font-bold text-lg mb-6 border-b border-gray-200/50 pb-4">خلاصه سفارش</h3>
                
                <div className="space-y-3 text-sm text-gray-600 mb-6">
                    <div className="flex justify-between">
                        <span>مجموع اقلام</span>
                        <span>{formatPrice(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                        <span>هزینه ارسال</span>
                        <span className={shipping === 0 ? "text-green-500" : ""}>
                            {shipping === 0 ? "رایگان" : formatPrice(shipping)}
                        </span>
                    </div>
                </div>

                <div className="flex justify-between font-black text-lg text-gray-900 border-t border-gray-200/50 pt-4 mb-6">
                    <span>مبلغ قابل پرداخت</span>
                    <span>{formatPrice(total)}</span>
                </div>

                <button 
                    onClick={() => onChangeView('CHECKOUT')}
                    className="w-full bg-primary hover:bg-orange-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl shadow-orange-200 transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 active:scale-95 flex justify-center items-center"
                >
                    تکمیل خرید
                    <ArrowLeft size={20} className="mr-2" />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
