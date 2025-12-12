import React, { useState, useEffect } from "react";
import { MdNotificationsActive, MdDelete } from "react-icons/md";
import { FaShoppingCart, FaCheckCircle, FaTag } from "react-icons/fa";

const iconMap = {
  order: <FaShoppingCart className="text-blue-600" />,
  coupon: <FaTag className="text-green-600" />,
  stock: <MdNotificationsActive className="text-red-600" />,
  redeemed: <FaCheckCircle className="text-green-700" />,
};

const VendorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get vendorId from localStorage
  const vendorId = localStorage.getItem("vendorId");

  useEffect(() => {
    if (!vendorId) {
      setError("Vendor ID not found in localStorage.");
      setLoading(false);
      return;
    }

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        setError(null);

        // Updated to send vendorId as a URL param, not query param
        const res = await fetch(`http://31.97.206.144:6098/api/vendor/notifications/${vendorId}`);
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

        const data = await res.json();
        setNotifications(data.data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [vendorId]);

  const handleDelete = async (id) => {
    try {
      // Delete API call
      const res = await fetch(`http://31.97.206.144:6098/api/notifications/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error(`Failed to delete notification. Status: ${res.status}`);

      // Remove from UI
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading notifications...</div>;
  // if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
        <MdNotificationsActive className="text-blue-600" />
        Vendor Notifications
      </h1>

      <div className="space-y-4">
        {notifications.length > 0 ? (
          notifications.map((notif) => (
            <div
              key={notif._id}
              className="flex items-start justify-between bg-white p-4 rounded-md shadow-sm border border-gray-100 hover:shadow-md transition"
            >
              <div className="flex gap-4">
                <div className="text-2xl">
                  {iconMap[notif.type] || <MdNotificationsActive className="text-gray-600" />}
                </div>
                <div>
                  <h2 className="text-md font-semibold text-gray-800">{notif.title}</h2>
                  <p className="text-sm text-gray-600">{notif.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(notif.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500">No notifications available.</p>
        )}
      </div>
    </div>
  );
};

export default VendorNotifications;
