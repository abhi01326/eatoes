import React, { useState, useEffect } from "react";
import { toast, Toaster } from "react-hot-toast";

// API base URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Status badge color classes
const statusColors = {
  Pending: "bg-yellow-100 text-yellow-800",
  Preparing: "bg-blue-100 text-blue-800",
  Ready: "bg-green-100 text-green-800",
  Delivered: "bg-gray-100 text-gray-800",
  Cancelled: "bg-red-100 text-red-800",
};

// All possible order statuses
const statuses = [
  "All",
  "Pending",
  "Preparing",
  "Ready",
  "Delivered",
  "Cancelled",
];
const PAGE_SIZE = 5;

// Orders Dashboard component
export default function OrdersDashboard() {
  // State hooks
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState("All");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [updating, setUpdating] = useState(null);

  // Fetch orders when status or page changes
  useEffect(() => {
    fetchOrders();
    // eslint-disable-next-line
  }, [status, page]);

  // Fetch orders from API
  async function fetchOrders() {
    setLoading(true);
    let url = `${API_URL}/orders?page=${page}&limit=${PAGE_SIZE}`;
    if (status !== "All") url += `&status=${status}`;
    try {
      const res = await fetch(url);
      const data = await res.json();
      setOrders(data.orders);
      setTotal(data.total);
    } catch (e) {
      console.error("Failed to fetch orders", e);
      setOrders([]);
      setTotal(0);
    }
    setLoading(false);
  }

  // Update order status (with loading state)
  async function updateOrderStatus(id, newStatus) {
    setUpdating(id);
    try {
      const res = await fetch(`${API_URL}/orders/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to update");
      setOrders(
        orders.map((o) => (o._id === id ? { ...o, status: newStatus } : o)),
      );
      toast.success("Order status updated successfully!");
    } catch (e) {
      alert(e.message);
      toast.error("Failed to update order status. Please try again.");
    }
    setUpdating(null);
  }

  // Render Orders Dashboard UI
  return (
    <div className="max-w-5xl mx-auto p-6 bg-gradient-to-br from-white to-blue-50 rounded-xl text-black shadow-xl min-h-[80vh] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
        <h2 className="text-3xl font-extrabold tracking-tight text-blue-900">
          Orders Dashboard
        </h2>
        {/* Status Filter */}
        <div className="flex items-center gap-2">
          <label htmlFor="status" className="font-medium text-gray-700">
            Status:
          </label>
          <select
            id="status"
            className="border border-blue-200 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            {statuses.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <Toaster reverseOrder={false} />
      </div>

      {/* Orders Table */}
      <div className="flex-1 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg shadow bg-white w-full">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="p-3 border-b font-semibold text-left">
                    Order #
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Customer
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Table
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Status
                  </th>
                  <th className="p-3 border-b font-semibold text-left">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>

                {orders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr className="hover:bg-blue-50 transition group">
                      <td className="p-3 border-b font-mono text-blue-800 group-hover:font-bold">
                        {order.orderNumber}
                      </td>
                      <td className="p-3 border-b">{order.customerName}</td>
                      <td className="p-3 border-b">{order.tableNumber}</td>
                      <td className="p-3 border-b">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold shadow-sm ${statusColors[order.status]}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="p-3 border-b flex flex-col sm:flex-row gap-2 items-start sm:items-center">
                        {/* Status dropdown */}
                        <select
                          className="border border-blue-200 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                          value={order.status}
                          disabled={updating === order._id}
                          onChange={(e) =>
                            updateOrderStatus(order._id, e.target.value)
                          }
                        >
                          {statuses
                            .filter((s) => s !== "All")
                            .map((s) => (
                              <option key={s}>{s}</option>
                            ))}
                        </select>
                        {/* Expand/collapse order details */}
                        <button
                          className="text-blue-400  font-medium hover:text-blue-800 bg-gradient-to-tr from-blue-100 to-blue-50 px-2 py-1 rounded transition disabled:opacity-50"
                          onClick={() =>
                            setExpanded(
                              expanded === order._id ? null : order._id,
                            )
                          }
                        >
                          {expanded === order._id ? "Hide" : "View"}
                        </button>
                      </td>
                    </tr>
                    {/* Expanded order details */}
                    {expanded === order._id && (
                      <tr>
                        <td colSpan={5} className="bg-blue-50 p-6 border-b">
                          <div className="flex flex-col gap-2">
                            <div className="font-semibold text-blue-900">
                              Items:
                            </div>
                            <ul className="list-disc ml-6 text-blue-800">
                              {order.items.map((item, idx) => (
                                <li key={idx}>
                                  {item.menuItem?.name || "Item"} x{" "}
                                  {item.quantity}{" "}
                                  <span className="text-gray-500">
                                    (${item.price})
                                  </span>
                                </li>
                              ))}
                            </ul>
                            <div className="mt-2 text-lg">
                              Total: <strong>${order.totalAmount}</strong>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Created:{" "}
                              {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-between items-center mt-6 gap-4 text-white">
        <button
          className="px-4 py-2 border border-blue-200 rounded-2xl bg-gradient-to-bl from-blue-300 to-blue-500 shadow hover:bg-blue-100 disabled:opacity-50"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page === 1}
        >
          Prev
        </button>
        <span className="font-medium text-blue-900">
          Page {page} / {Math.ceil(total / PAGE_SIZE) || 1}
        </span>
        <button
          className="px-4 py-2 border border-blue-200 rounded bg-gradient-to-bl from-blue-300 to-blue-500 shadow hover:bg-blue-100 disabled:opacity-50"
          onClick={() => setPage((p) => p + 1)}
          disabled={page * PAGE_SIZE >= total}
        >
          Next
        </button>
      </div>
    </div>
  );
}
