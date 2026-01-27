import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaSearch,
  FaFileInvoice,
  FaDownload,
  FaFileCsv,
} from "react-icons/fa";

const API_BASE = "http://31.97.206.144:6091/api";
const PAGE_SIZE = 5;

export default function VendorPaymentHistory() {
  const vendorId = localStorage.getItem("vendorId");

  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  /* ---------------- Fetch History ---------------- */
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE}/vendor/${vendorId}/payments/history`
      );
      setHistory(res.data.monthlyHistory || []);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Filtering + Search ---------------- */
  const filteredData = useMemo(() => {
    return history.filter((item) => {
      const matchSearch = item.month
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchStatus =
        statusFilter === "all" ||
        item.paymentStatus === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [history, search, statusFilter]);

  /* ---------------- Pagination ---------------- */
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  const paginatedData = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredData.slice(start, start + PAGE_SIZE);
  }, [filteredData, page]);

  /* ---------------- CSV Export ---------------- */
  const exportCSV = () => {
    const headers = [
      "Month",
      "Coupons",
      "Total Amount",
      "Paid",
      "Pending",
      "Status",
    ];

    const rows = filteredData.map((h) => [
      h.month,
      h.totalCouponsClaimed,
      h.totalAmount,
      h.amountPaid,
      h.amountPending,
      h.paymentStatus,
    ]);

    let csv = headers.join(",") + "\n";
    rows.forEach((r) => (csv += r.join(",") + "\n"));

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "payment_history.csv";
    a.click();
  };

  /* ---------------- Invoice PDF ---------------- */
  const generateInvoice = (row) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Vendor Payment Invoice", 20, 20);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.text(`Month: ${row.month}`, 20, 40);
    doc.text(`Coupons Redeemed: ${row.totalCouponsClaimed}`, 20, 50);
    doc.text(`Total Amount: $${row.totalAmount}`, 20, 60);
    doc.text(`Amount Paid: $${row.amountPaid}`, 20, 70);
    doc.text(`Amount Pending: $${row.amountPending}`, 20, 80);
    doc.text(`Status: ${row.paymentStatus}`, 20, 90);

    doc.text(
      `Generated on: ${new Date().toLocaleDateString()}`,
      20,
      120
    );

    doc.save(`Invoice_${row.month}.pdf`);
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl border">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-blue-900">
          Payment History
        </h2>

        <div className="flex gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <FaFileCsv /> Export CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative w-full md:w-1/3">
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search by month (YYYY-MM)"
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
          className="border px-4 py-2 rounded-lg"
        >
          <option value="all">All Status</option>
          <option value="fully_paid">Fully Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <p className="text-center py-10">Loading history...</p>
      ) : paginatedData.length === 0 ? (
        <p className="text-center py-10 text-gray-400">
          No payment records found
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border rounded-lg overflow-hidden">
            <thead className="bg-blue-600 text-white">
              <tr>
                <th className="p-3 text-left">Month</th>
                <th className="p-3">Coupons</th>
                <th className="p-3">Total</th>
                <th className="p-3">Paid</th>
                <th className="p-3">Pending</th>
                <th className="p-3">Status</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>

            <tbody>
              {paginatedData.map((row) => (
                <tr
                  key={row._id}
                  className="border-t hover:bg-gray-50"
                >
                  <td className="p-3">{row.month}</td>
                  <td className="p-3 text-center">
                    {row.totalCouponsClaimed}
                  </td>
                  <td className="p-3 text-center">
                    ${row.totalAmount}
                  </td>
                  <td className="p-3 text-center">
                    ${row.amountPaid}
                  </td>
                  <td className="p-3 text-center">
                    ${row.amountPending}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row.paymentStatus === "fully_paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {row.paymentStatus}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => generateInvoice(row)}
                      className="flex items-center gap-2 mx-auto text-blue-600 hover:text-blue-800"
                    >
                      <FaFileInvoice /> Invoice
                    </button>
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
