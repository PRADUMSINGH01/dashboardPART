"use client";

import React, { useEffect, useState } from "react";
import {
  FaUser,
  FaBoxOpen,
  FaCheck,
  FaTruck,
  FaMoneyBill,
  FaClipboardCheck,
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
} from "react-icons/fa";

// Define possible status types
type OrderStatus = "inquiry" | "on_track" | "payment_done" | "completed";

interface Order {
  id: string;
  name?: string;
  phone: string;
  productId: string;
  productName: string;
  status: OrderStatus;
  createdAt?: { seconds: number };
}

// Define interface for incoming API data
interface ApiOrder {
  id: string;
  name?: string;
  phone?: string;
  productId?: string;
  productName?: string;
  status?: OrderStatus;
  createdAt?: { seconds: number };
}

const DashboardClientFetch: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [expandedStatus, setExpandedStatus] = useState<OrderStatus | null>(
    null
  );
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [viewMode, setViewMode] = useState<"summary" | "detail">("summary");
  const [dateRange, setDateRange] = useState<{ label: string; days: number }>({
    label: "All",
    days: -1,
  });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/getorder");
        const data = await res.json();

        if (data.success) {
          // Add default status to orders missing it with proper typing
          const processedOrders: Order[] = data.orders.map(
            (order: ApiOrder) => ({
              id: order.id || "",
              name: order.name,
              phone: order.phone || "",
              productId: order.productId || "",
              productName: order.productName || "",
              status: order.status || "inquiry",
              createdAt: order.createdAt,
            })
          );

          // Sort by date (newest first)
          const sortedOrders = processedOrders.sort((a: Order, b: Order) => {
            const aTime = a.createdAt?.seconds || 0;
            const bTime = b.createdAt?.seconds || 0;
            return bTime - aTime;
          });

          setOrders(sortedOrders);
          setFilteredOrders(sortedOrders);
        } else {
          console.error("API error:", data.error);
        }
      } catch (err) {
        console.error("Failed to fetch orders:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  // Filter orders based on selected date range
  useEffect(() => {
    if (!orders.length) return;

    if (dateRange.days === -1) {
      setFilteredOrders(orders);
      return;
    }

    const now = new Date();
    const startDate = new Date(now);
    startDate.setDate(startDate.getDate() - dateRange.days);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    endDate.setHours(0, 0, 0, 0);

    const filtered = orders.filter((order) => {
      if (!order.createdAt || !order.createdAt.seconds) {
        return false;
      }

      const orderDate = new Date(order.createdAt.seconds * 1000);
      return orderDate >= startDate && orderDate < endDate;
    });

    setFilteredOrders(filtered);
  }, [dateRange, orders]);

  const updateOrderStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch("/api/updateOrderStatus", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prevOrders) =>
          prevOrders.map((order) =>
            order.id === orderId ? { ...order, status: newStatus } : order
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder({ ...selectedOrder, status: newStatus });
        }
      }
    } catch (err) {
      console.error("Error updating order status:", err);
    }
  };

  // Initialize all status categories with empty arrays
  const statusCategories: Record<OrderStatus, Order[]> = {
    inquiry: [],
    on_track: [],
    payment_done: [],
    completed: [],
  };

  // FIXED: Properly categorize orders including "inquiry"
  filteredOrders.forEach((order) => {
    const status = order.status || "inquiry";
    if (status in statusCategories) {
      statusCategories[status as OrderStatus].push(order);
    } else {
      statusCategories.inquiry.push(order);
    }
  });

  const toggleStatusView = (status: OrderStatus) => {
    if (expandedStatus === status) {
      setExpandedStatus(null);
    } else {
      setExpandedStatus(status);
      setSelectedOrder(null);
    }
    setViewMode("summary");
  };

  const viewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setViewMode("detail");
  };

  const closeDetailView = () => {
    setSelectedOrder(null);
    setViewMode("summary");
  };

  const getStatusInfo = (status: OrderStatus) => {
    const statusInfo = {
      inquiry: {
        title: "Inquiry Received",
        icon: <FaClipboardCheck className="text-blue-600" />,
        color: "bg-blue-500",
        buttonText: "Start Processing",
        nextStatus: "on_track" as OrderStatus,
        iconComponent: <FaTruck />,
      },
      on_track: {
        title: "On Track",
        icon: <FaTruck className="text-purple-600" />,
        color: "bg-purple-500",
        buttonText: "Mark Payment Done",
        nextStatus: "payment_done" as OrderStatus,
        iconComponent: <FaMoneyBill />,
      },
      payment_done: {
        title: "Payment Done",
        icon: <FaMoneyBill className="text-green-600" />,
        color: "bg-green-500",
        buttonText: "Complete Order",
        nextStatus: "completed" as OrderStatus,
        iconComponent: <FaCheck />,
      },
      completed: {
        title: "Complete Order",
        icon: <FaCheck className="text-teal-600" />,
        color: "bg-teal-500",
        buttonText: "",
        nextStatus: null,
        iconComponent: null,
      },
    };

    return statusInfo[status];
  };

  // Date filter options
  const dateFilters = [
    { label: "All", days: -1 },
    { label: "Today", days: 0 },
    { label: "Yesterday", days: 1 },
    { label: "2 Days Ago", days: 2 },
    { label: "3 Days Ago", days: 3 },
  ];

  if (loading) {
    return (
      <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="flex justify-center items-center h-[80vh]">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Loading orders...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 min-h-screen bg-gradient-to-br from-white to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-extrabold text-gray-800 dark:text-white flex items-center gap-3">
          <FaBoxOpen className="text-blue-600 animate-pulse" />
          Orders Dashboard
        </h2>

        {viewMode === "detail" && (
          <button
            onClick={closeDetailView}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <FaChevronUp className="transform rotate-90" />
            Back to overview
          </button>
        )}
      </div>

      {/* Date Filter Tabs */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <FaCalendarAlt className="text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            Filter by Date
          </h3>
        </div>
        <div className="flex flex-wrap gap-2">
          {dateFilters.map((filter) => (
            <button
              key={filter.label}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                dateRange.days === filter.days
                  ? "bg-blue-500 text-white shadow-md"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
              }`}
              onClick={() => setDateRange(filter)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {viewMode === "detail" && selectedOrder ? (
        <OrderDetailView
          order={selectedOrder}
          onStatusUpdate={updateOrderStatus}
          statusInfo={getStatusInfo(selectedOrder.status)}
          onClose={closeDetailView}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(statusCategories).map(([status, ordersList]) => {
            const statusKey = status as OrderStatus;
            const statusInfo = getStatusInfo(statusKey);
            const isExpanded = expandedStatus === statusKey;

            return (
              <div
                key={statusKey}
                className={`bg-gray-50 dark:bg-gray-800 rounded-xl p-4 transition-all duration-300 cursor-pointer hover:shadow-lg ${
                  isExpanded ? "ring-2 ring-blue-500 shadow-lg" : ""
                }`}
                onClick={() => toggleStatusView(statusKey)}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-full bg-white dark:bg-gray-700 shadow">
                      {statusInfo.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                        {statusInfo.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {ordersList.length} order
                        {ordersList.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                  <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4">
                    {ordersList.length === 0 ? (
                      <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                        No orders in this category
                      </div>
                    ) : (
                      ordersList.map((order) => (
                        <div
                          key={order.id}
                          className="bg-white dark:bg-gray-700 rounded-xl border border-gray-200 dark:border-gray-600 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            viewOrderDetails(order);
                          }}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <div className="bg-gray-100 dark:bg-gray-600 p-2 rounded-full">
                              <FaUser className="text-green-500" />
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-800 dark:text-white">
                                {order.name || "Unknown Customer"}
                              </h4>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {order.productName}
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between items-center text-xs mt-3">
                            <span className="text-gray-500 dark:text-gray-400">
                              {order.id.substring(0, 8)}...
                            </span>
                            <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
                              View Details
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// Order Detail View Component
interface StatusInfo {
  title: string;
  icon: React.ReactNode;
  color: string;
  buttonText: string;
  nextStatus: OrderStatus | null;
  iconComponent: React.ReactNode | null;
}

const OrderDetailView: React.FC<{
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
  statusInfo: StatusInfo;
  onClose: () => void;
}> = ({ order, onStatusUpdate, statusInfo, onClose }) => {
  // Format timestamp to readable date
  const formatDate = (timestamp?: { seconds: number }) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-6 shadow-xl max-w-3xl mx-auto">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-3">
            {statusInfo.icon}
            Order Details
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${statusInfo.color} text-white`}
            >
              {statusInfo.title}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">
              ID: {order.id}
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          <FaChevronUp className="transform rotate-90" />
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaUser className="text-green-500" />
            Customer Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-gray-800 dark:text-white font-medium">
                {order.name || "Unknown Customer"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
              <p className="text-gray-800 dark:text-white font-medium">
                {order.phone}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
            <FaBoxOpen className="text-blue-500" />
            Product Information
          </h3>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Product Name
              </p>
              <p className="text-gray-800 dark:text-white font-medium">
                {order.productName}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Product ID
              </p>
              <p className="text-gray-800 dark:text-white font-medium">
                {order.productId}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Order Timeline
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created At
            </p>
            <p className="text-gray-800 dark:text-white font-medium">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-5 mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Order Status
        </h3>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-3 rounded-full ${statusInfo.color} text-white`}>
              {statusInfo.icon}
            </div>
            <div>
              <p className="text-gray-800 dark:text-white font-medium">
                Current Status: {statusInfo.title}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Last updated: {formatDate(order.createdAt)}
              </p>
            </div>
          </div>

          {statusInfo.nextStatus && (
            <button
              onClick={() => onStatusUpdate(order.id, statusInfo.nextStatus!)}
              className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 transition-all ${statusInfo.color} hover:opacity-90`}
            >
              {statusInfo.iconComponent}
              {statusInfo.buttonText}
            </button>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          Close
        </button>
        {statusInfo.nextStatus && (
          <button
            onClick={() => onStatusUpdate(order.id, statusInfo.nextStatus!)}
            className={`px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2 ${statusInfo.color} hover:opacity-90`}
          >
            {statusInfo.iconComponent}
            {statusInfo.buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default DashboardClientFetch;