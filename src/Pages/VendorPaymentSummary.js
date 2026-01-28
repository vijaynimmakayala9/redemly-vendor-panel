import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FaCalendarWeek,
  FaCalendarAlt,
  FaSearch,
} from "react-icons/fa";

const API_BASE = "http://31.97.206.144:6091/api";
const PAGE_SIZE = 5;

export default function VendorPaymentSummary() {
  const vendorId = localStorage.getItem("vendorId");

  const [activeTab, setActiveTab] = useState("weekly");
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  /* ---------------- Fetch Data ---------------- */
  useEffect(() => {
    fetchSummary();
  }, [activeTab]);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setPage(1);

      const url =
        activeTab === "weekly"
          ? `${API_BASE}/vendor/${vendorId}/payments/weekly-summary`
          : `${API_BASE}/vendor/${vendorId}/payments/monthly-summary`;

      const res = await axios.get(url);
      activeTab === "weekly" ? setData(res.data.weeks || []) : setData(res.data.monthlySummaries || [])
      
      console.log(res.data.weeks)
    } catch (err) {
      console.error(err);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Search + Filter (SAFE) ---------------- */
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const label =
        activeTab === "weekly"
          ? item.week || ""
          : item.monthName || item.month || "";

      const matchSearch = label
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        item.paymentStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter, activeTab]);

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          Booking Summary
        </h2>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab("weekly")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "weekly"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
            }`}
          >
            <FaCalendarWeek /> Weekly
          </button>
          <button
            onClick={() => setActiveTab("monthly")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              activeTab === "monthly"
                ? "bg-blue-600 text-white"
                : "text-gray-600"
            }`}
          >
            <FaCalendarAlt /> Monthly
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative md:w-1/3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder={`Search ${
              activeTab === "weekly" ? "week" : "month"
            }`}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 pr-4 py-2 w-full border rounded-lg"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="border px-4 py-2 rounded-lg md:w-48"
        >
          <option value="all">All Status</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="fully_paid">Fully Paid</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-10">Loading summary...</p>
      ) : paginatedData.length === 0 ? (
        <p className="text-center py-10 text-gray-400">
          No data found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-center">S NO</th>
                <th className="p-3 text-left">
                  {activeTab === "weekly" ? "Week" : "Month"}
                </th>                
                <th className="p-3 text-center">Coupons</th>
                <th className="p-3 text-center">Total ($)</th>
                <th className="p-3 text-center">Paid ($)</th>
                <th className="p-3 text-center">Pending ($)</th>
                <th className="p-3 text-center">Status</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row, idx) => (
                <tr
                  key={idx}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td className="p-3">
                    {activeTab === "weekly"
                      ? row.weekLabel
                      : row.monthName || row.month}
                  </td>
                  <td className="p-3 text-center">
                    {row.totalCoupons}
                  </td>
                  <td className="p-3 text-center">
                    ${row.totalAmountUSD}
                  </td>
                  <td className="p-3 text-center">
                    ${row.amountPaidUSD}
                  </td>
                  <td className="p-3 text-center">
                    ${row.amountPendingUSD}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.paymentStatus === "paid" ||
                        row.paymentStatus === "fully_paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-4 py-2 rounded-lg ${
                page === i + 1
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 hover:bg-gray-200"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
