"use client";

import React, { useEffect, useState } from "react";
import { FaUser, FaBoxOpen } from "react-icons/fa";

interface Order {
  id: string;
  name?: string;
  phone: string;
  createdAt?: { seconds: number };
}

const DashboardClientFetch: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/getorder");
        const data = await res.json();
        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 flex items-center gap-2">
        <FaBoxOpen className="text-blue-500" /> Today&lsquo; Orders
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400">
          No orders placed today.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order: Order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm hover:shadow-lg border border-gray-200 dark:border-gray-700 p-5 transition-all"
            >
              <p className="text-sm text-gray-400 dark:text-gray-500 mb-1">
                Order Phone:{" "}
                <span className="text-gray-800 dark:text-gray-200">
                  {order.phone}
                </span>
              </p>
              <div className="flex items-center gap-2 text-gray-800 dark:text-gray-100 mb-2">
                <FaUser className="text-blue-600" />
                <span>{order.name || "Unknown Customer"}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardClientFetch;
