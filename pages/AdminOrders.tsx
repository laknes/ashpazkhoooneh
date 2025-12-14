
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Order, OrderStatus } from '../types';
import { formatPrice } from '../constants';
import { CheckCircle, XCircle, Clock, Truck } from 'lucide-react';

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const data = await db.orders.getAll();
      setOrders(data);
    };
    fetchOrders();
  }, []);

  const handleStatusChange = async (id: string, newStatus: OrderStatus) => {
    await db.orders.updateStatus(id, newStatus);
    const data = await db.orders.getAll();
    setOrders(data);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case 'PENDING': return <span className="flex items-center text-yellow-600 bg-yellow-100 px-2 py-1 rounded-full text-xs"><Clock size={12} className="ml-1"/> در انتظار</span>;
        case 'PROCESSING': return <span className="flex items-center text-blue-600 bg-blue-100 px-2 py-1 rounded-full text-xs"><Clock size={12} className="ml-1"/> در حال پردازش</span>;
        case 'SHIPPED': return <span className="flex items-center text-indigo-600 bg-indigo-100 px-2 py-1 rounded-full text-xs"><Truck size={12} className="ml-1"/> ارسال شده</span>;
        case 'DELIVERED': return <span className="flex items-center text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs"><CheckCircle size={12} className="ml-1"/> تحویل شده</span>;
        case 'CANCELLED': return <span className="flex items-center text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs"><XCircle size={12} className="ml-1"/> لغو شده</span>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">مدیریت سفارشات</h1>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
                <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">شماره سفارش</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مشتری</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">تاریخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">مبلغ کل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">وضعیت</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">عملیات</th>
                </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => (
                <tr key={order.id}>
                    <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.customerName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.date).toLocaleDateString('fa-IR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                        {formatPrice(order.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <select 
                            value={order.status}
                            onChange={(e) => handleStatusChange(order.id, e.target.value as OrderStatus)}
                            className="border border-gray-300 rounded text-xs p-1 focus:ring-primary focus:border-primary"
                        >
                            <option value="PENDING">در انتظار</option>
                            <option value="PROCESSING">در حال پردازش</option>
                            <option value="SHIPPED">ارسال شده</option>
                            <option value="DELIVERED">تحویل شده</option>
                            <option value="CANCELLED">لغو شده</option>
                        </select>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
