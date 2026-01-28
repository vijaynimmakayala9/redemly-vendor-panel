import { useEffect, useState } from "react";
import axios from "axios";
import {
  FaFileInvoiceDollar,
  FaCreditCard,
  FaChartLine,
  FaCashRegister,
  FaUserTie,
} from "react-icons/fa";

const API_BASE = "http://31.97.206.144:6091/api";

export default function VendorInvoiceDashboard() {
  const vendorId = localStorage.getItem("vendorId");

  const [selectedMonth, setSelectedMonth] = useState("2026-01");
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRazorpayScript();
    fetchInvoice();
  }, [selectedMonth]);

  /* ---------------- Razorpay Script ---------------- */
  const loadRazorpayScript = () => {
    if (window.Razorpay) return;
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  /* ---------------- Fetch Invoice ---------------- */
  const fetchInvoice = async () => {
    try {
      setLoading(true);
      setError("");

      const apiMonth = selectedMonth.replace("-0", "-");
      const res = await axios.get(
        `${API_BASE}/vendor/${vendorId}/payments/due?month=${apiMonth}`
      );

      setInvoice(res.data.data);
    } catch {
      setInvoice(null);
      setError("No invoice available for selected month");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- Pay Online ---------------- */
  const handlePayOnline = async () => {
    try {
      setPaying(true);

      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(
        new Date(startDate).getFullYear(),
        new Date(startDate).getMonth() + 1,
        0
      )
        .toISOString()
        .split("T")[0];

      const orderRes = await axios.post(
        `${API_BASE}/vendor/${vendorId}/payments/online`,
        { period: "monthly", startDate, endDate }
      );

      const order = orderRes.data.data;

      const options = {
        key: order.razorpayKey,
        amount: order.amountINR * 100,
        currency: order.currency,
        name: order.vendorName,
        description: `Invoice Payment - ${order.period}`,
        order_id: order.orderId,
        handler: async (response) => {
          try {
            await axios.post(
              `${API_BASE}/vendor/${vendorId}/payments/verify`,
              response
            );
            alert("✅ Payment successful");
            fetchInvoice();
          } catch {
            alert("❌ Payment verification failed");
          }
        },
        prefill: invoice.vendor,
        theme: { color: "#2563EB" },
      };

      new window.Razorpay(options).open();
    } catch {
      alert("❌ Failed to initiate payment");
    } finally {
      setPaying(false);
    }
  };

  /* ---------------- UI ---------------- */
  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-blue-900 flex gap-2 items-center">
            <FaFileInvoiceDollar /> Vendor Invoice
          </h2>
          <p className="text-sm text-gray-500">
            Monthly payments & invoices
          </p>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border rounded-lg w-full sm:w-auto"
        />
      </div>

      {loading && <p className="text-center py-20">Loading...</p>}
      {error && <p className="text-center py-20 text-gray-400">{error}</p>}

      {invoice && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Stat label="Coupons" value={invoice.totals.totalCouponsClaimed} />
            <Stat label="Total USD" value={`$${invoice.totals.totalAmountUSD}`} />
            <Stat
              label="Pending INR"
              value={`₹${invoice.totals.amountPendingINR}`}
            />
            <Stat label="Status" value={invoice.paymentStatus} status />
          </div>

          {/* Vendor Details */}
          <div className="border rounded-xl p-5 bg-white shadow mb-6">
            <h4 className="font-semibold mb-4 flex items-center gap-2">
              <FaUserTie /> Vendor Details
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <Detail label="Business Name" value={invoice.vendor.businessName} />
              <Detail label="Vendor Name" value={invoice.vendor.name} />
              <Detail label="Email" value={invoice.vendor.email} />
              <Detail label="Phone" value={invoice.vendor.phone} />
              <Detail label="Vendor ID" value={invoice.vendor.id} />
            </div>
          </div>

          {/* Payment Options */}
          <div className="bg-white border rounded-2xl shadow-xl p-5 sm:p-6 space-y-4">
            <h3 className="font-semibold text-lg">Payment Options</h3>

            <button
              disabled={paying || invoice.paymentStatus === "paid"}
              onClick={handlePayOnline}
              className="w-full sm:w-auto flex gap-2 justify-center items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaCreditCard />
              {paying ? "Processing..." : "Pay Online (Razorpay)"}
            </button>

            <p className="flex gap-2 items-center text-sm text-gray-600">
              <FaCashRegister /> Cash payment available at Admin Office
            </p>
          </div>
        </>
      )}
    </div>
  );
}

/* ---------------- Components ---------------- */
function Stat({ label, value, status }) {
  return (
    <div className="p-4 rounded-xl border bg-white shadow flex justify-between">
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p
          className={`text-lg font-bold capitalize ${
            status
              ? value === "paid"
                ? "text-green-600"
                : "text-yellow-600"
              : "text-gray-800"
          }`}
        >
          {value}
        </p>
      </div>
      <FaChartLine className="text-xl text-blue-600" />
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="font-medium break-all">{value || "—"}</p>
    </div>
  );
}
