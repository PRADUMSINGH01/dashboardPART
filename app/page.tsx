"use client";

import React, { useEffect, useState } from "react";
import { FaUser, FaBoxOpen, FaPhoneAlt } from "react-icons/fa";

interface Order {
  id: string;
  name?: string;
  phone: string;
  productId: string;
  productName: string;
  requestComplete?: boolean;
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

  const markRequestComplete = async (orderId: string) => {
    try {
      const res = await fetch("/api/markRequestComplete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId }),
      });
      const data = await res.json();
      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, requestComplete: true } : order
          )
        );
      }
    } catch (err) {
      console.error("Error updating request status:", err);
    }
  };

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white mb-8 flex items-center gap-3">
        <FaBoxOpen className="text-blue-600 animate-pulse" />
        Today&lsquo; Orders
      </h2>

      {loading ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-lg animate-pulse">
          Loading...
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500 dark:text-gray-400 text-lg">
          No orders placed today.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {orders.map((order: Order) => (
            <div
              key={order.id}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-md hover:shadow-xl transition-transform transform hover:scale-105 flex flex-col justify-between"
            >
              <div className="mb-3">
                <div className="flex items-center gap-3 text-gray-800 dark:text-gray-100 mb-2">
                  <FaUser className="text-green-600" />
                  <span className="text-lg font-semibold">
                    {order.name || "Unknown Customer"}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-gray-600 dark:text-gray-300">
                  <FaPhoneAlt className="text-indigo-600" />
                  <span className="break-all">{order.phone}</span>
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                  Product: <strong>{order.productName}</strong>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  Order ID: {order.id}
                </div>
                <button
                  onClick={() => markRequestComplete(order.id)}
                  disabled={order.requestComplete}
                  className={`text-sm px-4 py-1 rounded-full transition-all font-medium ${
                    order.requestComplete
                      ? "bg-green-500 text-white cursor-not-allowed"
                      : "bg-blue-600 hover:bg-blue-700 text-white"
                  }`}
                >
                  {order.requestComplete ? "Completed" : "Mark Complete"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardClientFetch;
