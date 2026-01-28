import { useEffect, useState } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import {
  FaFileInvoiceDollar,
  FaDownload,
  FaCreditCard,
  FaChartLine,
  FaMoneyBillWave,
  FaUniversity,
  FaCashRegister,
} from "react-icons/fa";
import { MdOutlinePendingActions, MdOutlinePaid } from "react-icons/md";

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

  /* ------------------ Load Razorpay ------------------ */
  const loadRazorpayScript = () => {
    if (window.Razorpay) return;

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);
  };

  /* ------------------ Fetch Invoice ------------------ */
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

  /* ------------------ Download PDF ------------------ */
  const handleDownload = () => {
    if (!invoice) return;

    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text("Vendor Coupon Invoice", 20, 20);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.text(`Business: ${invoice.vendor.businessName}`, 20, 40);
    doc.text(`Vendor Name: ${invoice.vendor.name}`, 20, 50);
    doc.text(`Period: ${invoice.period}`, 20, 60);
    doc.text(`Coupons Redeemed: ${invoice.totals.totalCouponsClaimed}`, 20, 70);
    doc.text(`Amount (USD): $${invoice.totals.totalAmountUSD}`, 20, 80);
    doc.text(`Status: ${invoice.paymentStatus}`, 20, 90);

    doc.save(`Invoice_${invoice.vendor.businessName}_${selectedMonth}.pdf`);
  };

  /* ------------------ Online Payment ------------------ */
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

      // 1️⃣ CREATE ORDER
      const orderRes = await axios.post(
        `${API_BASE}/vendor/${vendorId}/payments/online`,
        {
          period: "monthly",
          startDate,
          endDate,
        }
      );

      const order = orderRes.data.data;

      // 2️⃣ OPEN RAZORPAY
      const options = {
        key: order.razorpayKey,
        amount: order.amountINR * 100,
        currency: order.currency,
        name: order.vendorName,
        description: `Invoice Payment - ${order.period}`,
        order_id: order.orderId,
        handler: async function (response) {
          try {
            // 3️⃣ VERIFY PAYMENT
            await axios.post(
              `${API_BASE}/vendor/${vendorId}/payments/verify`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }
            );

            alert("✅ Payment successful!");
            fetchInvoice();
          } catch {
            alert("❌ Payment verification failed");
          }
        },
        prefill: {
          name: invoice.vendor.name,
          email: invoice.vendor.email,
          contact: invoice.vendor.phone,
        },
        theme: {
          color: "#2563EB",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      alert("❌ Failed to initiate payment");
    } finally {
      setPaying(false);
    }
  };

  /* ------------------ UI ------------------ */
  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
            <FaFileInvoiceDollar /> Vendor Invoice
          </h2>
          <p className="text-gray-500">Monthly payments & invoices</p>
        </div>

        <div className="flex gap-3 items-center">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-lg border shadow-sm"
          />
          {/* {invoice && (
            <button
              onClick={handleDownload}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <FaDownload />
            </button>
          )} */}
        </div>
      </div>

      {loading && <p className="text-center py-20">Loading...</p>}
      {error && <p className="text-center py-20 text-gray-400">{error}</p>}

      {invoice && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-10">
            <Stat label="Coupons" value={invoice.totals.totalCouponsClaimed} />
            <Stat label="USD" value={`$${invoice.totals.totalAmountUSD}`} />
            <Stat label="INR" value={`₹${invoice.totals.amountPendingINR}`} />
            <Stat
              label="Status"
              value={invoice.paymentStatus}
              status
            />
          </div>

          {/* Payment */}
          <div className="bg-white border rounded-2xl shadow-xl p-6">
            <h3 className="font-semibold mb-4">Payment Options</h3>

            <button
              disabled={paying || invoice.paymentStatus === "paid"}
              onClick={handlePayOnline}
              className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <FaCreditCard />
              {paying ? "Processing..." : "Pay Online"}
            </button>

            <div className="mt-6 text-sm text-gray-500">
              <p className="flex items-center gap-2">
                <FaCashRegister /> Cash at Admin Office
              </p>
              <p className="flex items-center gap-2 mt-1">
                <FaUniversity /> Bank Transfer Available
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------ Stat Card ------------------ */
function Stat({ label, value, status }) {
  return (
    <div className="p-5 rounded-xl border bg-white shadow flex justify-between">
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p
          className={`text-xl font-bold capitalize ${
            status && value === "paid"
              ? "text-green-600"
              : status
              ? "text-yellow-600"
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
