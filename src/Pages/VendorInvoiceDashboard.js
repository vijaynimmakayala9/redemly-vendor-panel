import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaFileInvoiceDollar,
  FaCreditCard,
  FaChartLine,
  FaUniversity,
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

  /* ---------------- Extract Bank Details ---------------- */
  const bankMethod = invoice?.paymentMethods?.find(
    (m) => m.method === "bank_transfer"
  );
  const bankDetails = bankMethod?.bankDetails;

  /* ---------------- UI ---------------- */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 flex gap-2 items-center">
            <FaFileInvoiceDollar /> Vendor Invoice
          </h2>
          <p className="text-gray-500">Monthly payments & invoices</p>
        </div>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="px-4 py-2 border rounded-lg"
        />
      </div>

      {loading && <p className="text-center py-20">Loading...</p>}
      {error && <p className="text-center py-20 text-gray-400">{error}</p>}

      {invoice && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <Stat label="Coupons" value={invoice.totals.totalCouponsClaimed} />
            <Stat label="Total USD" value={`$${invoice.totals.totalAmountUSD}`} />
            <Stat
              label="Pending INR"
              value={`₹${invoice.totals.amountPendingINR}`}
            />
            <Stat label="Status" value={invoice.paymentStatus} status />
          </div>

          {/* Vendor + Bank Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Vendor Details */}
            <div className="border rounded-xl p-6 bg-white shadow">
              <h4 className="font-semibold mb-4 flex items-center gap-2">
                <FaUserTie /> Vendor Details
              </h4>

              <div className="grid grid-cols-1 gap-3 text-sm">
                <Detail label="Business Name" value={invoice.vendor.businessName} />
                <Detail label="Vendor Name" value={invoice.vendor.name} />
                <Detail label="Email" value={invoice.vendor.email} />
                <Detail label="Phone" value={invoice.vendor.phone} />
                <Detail label="Vendor ID" value={invoice.vendor.id} />
              </div>
            </div>

            {/* Admin Bank Details */}
            {bankDetails && (
              <div className="border rounded-xl p-6 bg-gray-50 shadow">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <FaUniversity /> Admin Bank Details
                </h4>

                <div className="grid grid-cols-1 gap-3 text-sm">
                  <Detail label="Account Holder" value={bankDetails.name} />
                  <Detail label="Account Number" value={bankDetails.account} />
                  <Detail label="IFSC Code" value={bankDetails.ifsc} />
                </div>

                <p className="mt-4 text-xs text-gray-500">
                  ⚠️ Mention your <b>Vendor ID</b> in transfer reference.
                </p>
              </div>
            )}
          </div>

          {/* Payment Options */}
          <div className="bg-white border rounded-2xl shadow-xl p-6 space-y-6">
            <h3 className="font-semibold text-lg">Payment Options</h3>

            <button
              disabled={paying || invoice.paymentStatus === "paid"}
              onClick={handlePayOnline}
              className="flex gap-2 items-center bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaCreditCard />
              {paying ? "Processing..." : "Pay Online (Razorpay)"}
            </button>

            <p className="flex gap-2 items-center text-sm text-gray-600">
              <FaCashRegister /> Cash at Admin Office
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
    <div className="p-5 rounded-xl border bg-white shadow flex justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p
          className={`text-xl font-bold capitalize ${
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
      <FaChartLine className="text-2xl text-blue-600" />
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
