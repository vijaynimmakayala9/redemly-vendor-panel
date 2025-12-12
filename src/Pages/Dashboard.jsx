import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("Today");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Bar color palette
  const barColors = ["#FF9800", "#4CAF50", "#2196F3", "#9C27B0", "#FF5722", "#FFC107", "#03A9F4"];

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    const vendorId = localStorage.getItem("vendorId"); // get vendorId from localStorage
    if (!vendorId) {
      setError("Vendor ID not found in localStorage");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://31.97.206.144:6098/api/vendor/dashboard/${vendorId}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Dashboard Data:", data);
      setDashboardData(data);
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Handler for timeframe change (currently only "Today" data available)
  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  if (loading) return <div className="p-6">Loading dashboard data...</div>;
  if (error) return <div className="p-6 text-red-600">Error: {error}</div>;

  if (!dashboardData) return null; // or some placeholder

  // For salesData: backend returns salesData array, just use it
  // For other stats use totalOrders, pendingCoupons, redeemedToday

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6 bg-gradient-to-r from-blue-100 to-green-100 min-h-screen">
      {/* Stats Cards */}
      <div className="md:col-span-4 p-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">{dashboardData.totalOrders}</div>
          <h4 className="text-lg font-semibold">Total Orders</h4>
        </div>

        <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">{dashboardData.pendingCoupons}</div>
          <h4 className="text-lg font-semibold">Pending Coupons</h4>
        </div>

        <div className="bg-gradient-to-r from-indigo-400 to-indigo-600 shadow-lg rounded-lg p-4 text-center text-white">
          <div className="text-3xl font-bold">{dashboardData.redeemedToday}</div>
          <h4 className="text-lg font-semibold">Redeemed Today</h4>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="md:col-span-4 p-4 bg-white rounded shadow-md">
        <h3 className="text-lg font-semibold mb-2 text-gray-700">Sales Overview</h3>

        {/* Dropdown to select timeframe */}
        <div className="mb-4">
          <select className="border rounded p-2" value={timeframe} onChange={handleTimeframeChange}>
            <option value="Today">Today</option>
            {/* Other options disabled or hidden because backend only sends Today */}
            {/* You can implement weekly/monthly endpoints later */}
          </select>
        </div>

        {/* BarChart based on selected timeframe */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dashboardData.salesData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {dashboardData.salesData.map((data, index) => (
              <Bar
                key={index}
                dataKey="sales"
                fill={barColors[index % barColors.length]}
                name={data.name}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Coupons Table */}
      <div className="md:col-span-4 p-6 bg-white rounded-lg shadow-md mt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-700">Recent Coupons</h3>
        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Category</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Discount %</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Required Coins</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Status</th>
              <th className="px-4 py-2 border-b text-left text-sm font-semibold text-gray-700">Validity Date</th>
            </tr>
          </thead>
          <tbody>
            {dashboardData.recentCoupons.map((coupon) => (
              <tr key={coupon._id}>
                <td className="px-4 py-2 border-b text-sm">{coupon.name}</td>
                <td className="px-4 py-2 border-b text-sm">{coupon.category}</td>
                <td className="px-4 py-2 border-b text-sm">{coupon.discountPercentage}%</td>
                <td className="px-4 py-2 border-b text-sm">{coupon.requiredCoins}</td>
                <td
                  className={`px-4 py-2 border-b text-sm ${
                    coupon.status === "available"
                      ? "text-green-600"
                      : coupon.status === "redeemed"
                      ? "text-blue-600"
                      : "text-yellow-600"
                  }`}
                >
                  {coupon.status.charAt(0).toUpperCase() + coupon.status.slice(1)}
                </td>
                <td className="px-4 py-2 border-b text-sm">
                  {new Date(coupon.validityDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
