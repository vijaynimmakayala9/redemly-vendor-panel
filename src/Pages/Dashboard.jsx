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
  Cell,
  PieChart,
  Pie,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts";

const Dashboard = () => {
  const [timeframe, setTimeframe] = useState("Today");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Color palettes
  const barColors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
  const gradientColors = [
    { from: "#FF6B6B", to: "#FF8E53" },
    { from: "#4ECDC4", to: "#44A08D" },
    { from: "#45B7D1", to: "#2C3E50" },
    { from: "#96CEB4", to: "#FFEAA7" },
    { from: "#DDA0DD", to: "#BA68C8" },
    { from: "#98D8C8", to: "#4ECDC4" }
  ];

  // Status colors for coupons
  const statusColors = {
    pending: "#FFB74D",
    approved: "#4CAF50",
    rejected: "#F44336",
    available: "#2196F3",
    redeemed: "#9C27B0",
    active: "#4CAF50",
    expired: "#9E9E9E"
  };

  // Fetch dashboard data from backend
  const fetchDashboardData = async () => {
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      setError("Vendor ID not found in localStorage");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.redemly.com/api/vendor/dashboard/${vendorId}`);
      if (!response.ok) {
        throw new Error(`Error fetching data: ${response.statusText}`);
      }
      const data = await response.json();
      console.log("Dashboard Data:", data);
      setDashboardData(data.data); // Note: Changed to data.data because response has success and data fields
    } catch (err) {
      setError(err.message || "Failed to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTimeframeChange = (e) => {
    setTimeframe(e.target.value);
  };

  // Calculate coupon status distribution safely
  const calculateCouponStatus = () => {
    if (!dashboardData?.topCoupons || !Array.isArray(dashboardData.topCoupons)) {
      return [];
    }

    const statusCounts = dashboardData.topCoupons.reduce((acc, coupon) => {
      const status = coupon.status || "unknown";
      if (!acc[status]) {
        acc[status] = 0;
      }
      acc[status]++;
      return acc;
    }, {});

    return Object.entries(statusCounts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: statusColors[name.toLowerCase()] || barColors[0]
    }));
  };

  // Format weekly downloads data
  const formatWeeklyData = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      ...item,
      name: item.day
    }));
  };

  // Format monthly revenue data
  const formatMonthlyRevenue = (data) => {
    if (!data || !Array.isArray(data)) return [];
    return data.map(item => ({
      ...item,
      name: item.week
    }));
  };

  // Calculate today's stats
  const calculateTodayStats = () => {
    if (!dashboardData) return { downloads: 0, redemptions: 0, revenue: 0 };
    return {
      downloads: dashboardData.todayStats?.downloadsToday || 0,
      redemptions: dashboardData.todayStats?.redemptionsToday || 0,
      revenue: dashboardData.todayStats?.revenueToday || 0
    };
  };

  // Calculate totals
  const calculateTotals = () => {
    if (!dashboardData) return {
      coupons: 0,
      downloads: 0,
      redemptions: 0,
      feedbacks: 0,
      rating: 0
    };
    return {
      coupons: dashboardData.totals?.totalCoupons || 0,
      downloads: dashboardData.totals?.totalDownloads || 0,
      redemptions: dashboardData.totals?.totalRedemptions || 0,
      feedbacks: dashboardData.totals?.totalFeedbacks || 0,
      rating: dashboardData.totals?.averageRating || 0
    };
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading dashboard data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-green-50">
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-md text-center">
        <div className="text-red-500 text-5xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Dashboard</h3>
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all"
        >
          Retry
        </button>
      </div>
    </div>
  );

  if (!dashboardData) return null;

  const todayStats = calculateTodayStats();
  const totals = calculateTotals();
  const couponStatusData = calculateCouponStatus();
  const weeklyDownloads = formatWeeklyData(dashboardData.charts?.weeklyDownloads);
  const weeklyRedemptions = formatWeeklyData(dashboardData.charts?.weeklyRedemptions);
  const monthlyRevenue = formatMonthlyRevenue(dashboardData.charts?.monthlyRevenue);

  return (
    <div className="p-4 md:p-6 bg-gradient-to-br from-blue-50 via-white to-green-50 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Vendor Dashboard</h1>
          <p className="text-gray-600">Welcome back, {dashboardData.vendor?.name || "Vendor"}!</p>
        </div>
        <div className="mt-4 md:mt-0">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <select
                className="appearance-none bg-white border border-gray-200 rounded-xl px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                value={timeframe}
                onChange={handleTimeframeChange}
              >
                <option value="Today">Today</option>
                <option value="Week">This Week</option>
                <option value="Month">This Month</option>
                <option value="Year">This Year</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <button
              onClick={fetchDashboardData}
              className="inline-flex items-center bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:from-blue-600 hover:to-blue-700 transition-all shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-6">
        {/* Total Coupons */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Total</span>
          </div>
          <div className="text-2xl font-bold mb-1">{totals.coupons}</div>
          <h4 className="text-xs font-medium text-blue-100">Total Coupons</h4>
        </div>

        {/* Active Coupons */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Active</span>
          </div>
          <div className="text-2xl font-bold mb-1">{dashboardData.totals?.activeCoupons || 0}</div>
          <h4 className="text-xs font-medium text-green-100">Active Coupons</h4>
        </div>

        {/* Downloads Today */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="text-2xl font-bold mb-1">{todayStats.downloads}</div>
          <h4 className="text-xs font-medium text-purple-100">Downloads Today</h4>
        </div>

        {/* Redemptions Today */}
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="text-2xl font-bold mb-1">{todayStats.redemptions}</div>
          <h4 className="text-xs font-medium text-orange-100">Redemptions Today</h4>
        </div>

        {/* Revenue Today */}
        <div className="bg-gradient-to-br from-pink-500 to-pink-600 rounded-2xl p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Today</span>
          </div>
          <div className="text-2xl font-bold mb-1">${todayStats.revenue.toFixed(2)}</div>
          <h4 className="text-xs font-medium text-pink-100">Revenue Today</h4>
        </div>

        {/* Average Rating */}
        <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg transform transition-transform hover:scale-[1.02]">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <span className="text-xs font-medium bg-white/20 px-2 py-1 rounded-full">Rating</span>
          </div>
          <div className="text-2xl font-bold mb-1">{totals.rating.toFixed(1)}</div>
          <h4 className="text-xs font-medium text-indigo-100">Avg. Rating</h4>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Weekly Downloads Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Weekly Performance</h3>
              <p className="text-sm text-gray-600">Downloads vs Redemptions</p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-blue-500 mr-2"></div>
                <span className="text-sm text-gray-600">Downloads</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                <span className="text-sm text-gray-600">Redemptions</span>
              </div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyDownloads}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#666' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                  padding: '12px'
                }}
              />
              <defs>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ECDC4" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4ECDC4" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorRedemptions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF6B6B" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FF6B6B" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="downloads"
                stroke="#4ECDC4"
                fillOpacity={1}
                fill="url(#colorDownloads)"
                strokeWidth={2}
              />
              <Area
                type="monotone"
                dataKey={(entry) => {
                  const redemptionData = weeklyRedemptions.find(r => r.day === entry.day);
                  return redemptionData ? redemptionData.redemptions : 0;
                }}
                stroke="#FF6B6B"
                fillOpacity={1}
                fill="url(#colorRedemptions)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Coupon Status Distribution */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-800 mb-6">Coupon Status</h3>
          {couponStatusData.length > 0 ? (
            <div className="flex flex-col items-center">
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={couponStatusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    label
                  >
                    {couponStatusData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => [`${value} coupons`, 'Count']}
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-2 w-full">
                {couponStatusData.map((entry, index) => (
                  <div key={index} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    />
                    <span className="text-sm font-medium text-gray-700">{entry.name}</span>
                    <span className="text-sm font-bold ml-auto">{entry.value}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="text-gray-400 text-5xl mb-4">📊</div>
              <p className="text-gray-500 text-center">No coupon data available</p>
              <p className="text-gray-400 text-sm mt-1">Create some coupons to see stats</p>
            </div>
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-lg font-bold text-gray-800">Monthly Revenue</h3>
            <p className="text-sm text-gray-600">Revenue generated per week</p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={monthlyRevenue}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666' }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#666' }}
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip
              formatter={(value) => [`$${value}`, 'Revenue']}
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Bar
              dataKey="revenue"
              radius={[8, 8, 0, 0]}
              fill="url(#colorRevenue)"
            >
              {monthlyRevenue.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={barColors[index % barColors.length]}
                  opacity={0.8}
                />
              ))}
            </Bar>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8884d8" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#8884d8" stopOpacity={0.2} />
              </linearGradient>
            </defs>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Coupons */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-800">Top Coupons</h3>
            <p className="text-gray-600 text-sm mt-1">Most popular coupons</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Coupon Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Discount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {dashboardData.topCoupons && dashboardData.topCoupons.length > 0 ? (
                  dashboardData.topCoupons.slice(0, 5).map((coupon, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">

                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{coupon.name || "Unnamed Coupon"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-lg font-bold text-gray-900">
                          {coupon.category || "N/A"}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center">
                          <span className="text-blue-600 font-bold">{coupon.discountPercentage || 0}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center">
                      <div className="text-gray-400 text-4xl mb-3">🎫</div>
                      <h4 className="text-lg font-medium text-gray-700 mb-2">No Coupons Yet</h4>
                      <p className="text-gray-500">Create your first coupon to get started</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Feedbacks */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h3 className="text-lg font-bold text-gray-800">Recent Feedbacks</h3>
            <p className="text-gray-600 text-sm mt-1">Customer reviews and ratings</p>
          </div>

          <div className="overflow-y-auto max-h-[400px]">
            {dashboardData.recentFeedbacks && dashboardData.recentFeedbacks.length > 0 ? (
              dashboardData.recentFeedbacks.slice(0, 5).map((feedback, index) => (
                <div key={index} className="p-6 border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-10 w-10 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                        <span className="text-purple-600 font-bold">
                          {feedback.customerName ? feedback.customerName.charAt(0).toUpperCase() : "U"}
                        </span>
                      </div>
                      <div className="ml-4">
                        <h4 className="font-medium text-gray-900">
                          {feedback.customerName || "Anonymous User"}
                        </h4>
                        <div className="flex items-center mt-1">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < (feedback.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                          <span className="ml-2 text-sm text-gray-600">{feedback.rating || 0}/5</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {feedback.date ? new Date(feedback.date).toLocaleDateString() : "Recently"}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm">
                    {feedback.comment || "No comment provided"}
                  </p>
                </div>
              ))
            ) : (
              <div className="p-12 text-center">
                <div className="text-gray-400 text-4xl mb-3">💬</div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Feedbacks Yet</h4>
                <p className="text-gray-500">Customer feedbacks will appear here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-8 p-6 bg-white rounded-2xl shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h4 className="font-medium text-gray-800">Vendor Information</h4>
            <p className="text-sm text-gray-600">
              {dashboardData.vendor?.name} • {dashboardData.vendor?.email} • {dashboardData.vendor?.phone}
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-gray-500">
              Dashboard updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;