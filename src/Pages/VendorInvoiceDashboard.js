import { useState } from "react";
import jsPDF from "jspdf";
import { 
  FaFileInvoiceDollar, 
  FaDownload, 
  FaCreditCard, 
  FaCalendarAlt, 
  FaChartLine,
  FaReceipt,
  FaMoneyBillWave,
  FaHistory
} from "react-icons/fa";
import { MdOutlinePayment, MdOutlinePendingActions, MdOutlinePaid } from "react-icons/md";

export default function VendorInvoiceDashboard() {
  // Empty invoices array (no dummy data)
  const [invoices, setInvoices] = useState([]);

  const handlePayment = (id) => {
    setInvoices((prev) =>
      prev.map((invoice) =>
        invoice.id === id ? { ...invoice, status: "Paid" } : invoice
      )
    );
    alert("Payment successful. Thank you!");
  };

  const handleDownload = (invoice) => {
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.setTextColor(33, 33, 33);
    doc.text("Vendor Coupon Invoice", 20, 20);

    // Add decorative line
    doc.setDrawColor(59, 130, 246);
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25);

    doc.setFontSize(12);
    doc.setTextColor(75, 85, 99);
    
    doc.text(`Invoice ID: INV-${String(invoice.id).padStart(4, '0')}`, 20, 40);
    doc.text(`Vendor Name: ${invoice.vendorName}`, 20, 50);
    doc.text(`Month: ${invoice.month}`, 20, 60);
    doc.text(`Coupons Redeemed: ${invoice.redeemedCoupons}`, 20, 70);
    doc.text(`Amount: $${invoice.amount.toFixed(2)}`, 20, 80);
    doc.text(`Status: ${invoice.status}`, 20, 90);

    // Add footer
    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.text("Thank you for your participation!", 20, 120);
    doc.text("Generated on: " + new Date().toLocaleDateString(), 20, 130);
    
    // Save PDF
    doc.save(`Invoice_${invoice.vendorName}_${invoice.month.replace(" ", "_")}.pdf`);
  };

  // Calculate statistics
  const totalInvoices = invoices.length;
  const totalAmount = invoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0);
  const pendingInvoices = invoices.filter(invoice => invoice.status === "Pending").length;
  const paidInvoices = invoices.filter(invoice => invoice.status === "Paid").length;

  return (
    <div className="p-4 md:p-6 rounded-xl bg-white shadow-lg border border-gray-100">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2">
              <FaFileInvoiceDollar className="text-blue-600" />
              My Vendor Invoices
            </h2>
            <p className="text-gray-600 text-sm">View and manage your monthly coupon invoices</p>
          </div>
          <div className="mt-4 lg:mt-0 flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Total Invoices</p>
              <p className="text-2xl font-bold text-blue-700">{totalInvoices}</p>
            </div>
            <button 
              className="bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-2.5 rounded-lg font-medium hover:from-green-700 hover:to-green-800 transition flex items-center gap-2"
              onClick={() => alert("Generate new invoices feature will be implemented")}
            >
              <FaReceipt /> Generate Invoice
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Amount</p>
                <p className="text-2xl font-bold text-blue-700">${totalAmount.toFixed(2)}</p>
              </div>
              <FaMoneyBillWave className="text-3xl text-blue-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Paid Invoices</p>
                <p className="text-2xl font-bold text-green-700">{paidInvoices}</p>
              </div>
              <MdOutlinePaid className="text-3xl text-green-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 rounded-xl border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Invoices</p>
                <p className="text-2xl font-bold text-yellow-700">{pendingInvoices}</p>
              </div>
              <MdOutlinePendingActions className="text-3xl text-yellow-600" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Coupons/Month</p>
                <p className="text-2xl font-bold text-purple-700">
                  {invoices.length > 0 
                    ? Math.round(invoices.reduce((sum, inv) => sum + inv.redeemedCoupons, 0) / invoices.length)
                    : 0
                  }
                </p>
              </div>
              <FaChartLine className="text-3xl text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="overflow-hidden rounded-xl border border-gray-200">
        {invoices.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-50 mb-4">
              <FaFileInvoiceDollar className="text-3xl text-blue-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Invoices Found</h3>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              You don't have any invoices yet. Invoices will be generated monthly based on coupon redemptions.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
                onClick={() => alert("Generate invoices feature will be implemented")}
              >
                <FaCalendarAlt /> Generate Test Invoice
              </button>
              <button 
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition"
                onClick={() => alert("View history feature will be implemented")}
              >
                <FaHistory /> View Invoice History
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                  <tr>
                    <th className="p-4 text-left font-semibold">Sl No</th>
                    <th className="p-4 text-left font-semibold">Month</th>
                    <th className="p-4 text-left font-semibold">Coupons Redeemed</th>
                    <th className="p-4 text-left font-semibold">Amount ($)</th>
                    <th className="p-4 text-left font-semibold">Status</th>
                    <th className="p-4 text-left font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {invoices.map((invoice, index) => (
                    <tr key={invoice.id} className="hover:bg-gray-50 transition">
                      <td className="p-4 font-medium text-gray-700">{index + 1}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <FaCalendarAlt className="text-gray-400" />
                          {invoice.month}
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-bold">
                          {invoice.redeemedCoupons}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-green-600">${invoice.amount}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          invoice.status === "Paid"
                            ? "bg-green-100 text-green-800"
                            : invoice.status === "Pending"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                        }`}>
                          {invoice.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          {invoice.status === "Pending" && (
                            <button
                              className="flex items-center gap-2 bg-green-50 text-green-700 hover:bg-green-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                              onClick={() => handlePayment(invoice.id)}
                            >
                              <FaCreditCard /> Pay Now
                            </button>
                          )}
                          <button
                            className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-2 rounded-lg text-sm font-medium transition"
                            onClick={() => handleDownload(invoice)}
                          >
                            <FaDownload /> Download
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Additional Information Section */}
      {invoices.length === 0 && (
        <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <FaChartLine className="text-blue-600" />
            How Invoices Work
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">1. Coupon Redemption</div>
              <p className="text-gray-600 text-sm">Customers redeem coupons at your establishment</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">2. Monthly Calculation</div>
              <p className="text-gray-600 text-sm">System calculates total redemptions at month end</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <div className="text-blue-600 font-bold text-lg mb-2">3. Invoice Generation</div>
              <p className="text-gray-600 text-sm">Invoice is generated on 1st of each month</p>
            </div>
          </div>
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Invoices are automatically generated based on actual coupon redemptions. 
              You'll see your first invoice after customers start redeeming coupons at your venue.
            </p>
          </div>
        </div>
      )}

      {/* Payment Instructions Modal (can be triggered from button) */}
      <div className="mt-8 text-center">
        <p className="text-gray-500 text-sm mb-4">Need help with invoices or payments?</p>
        <div className="flex justify-center gap-4">
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 transition"
            onClick={() => alert("Contact support feature will be implemented")}
          >
            Contact Support
          </button>
          <span className="text-gray-300">•</span>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 transition"
            onClick={() => alert("FAQ section will be implemented")}
          >
            View FAQ
          </button>
          <span className="text-gray-300">•</span>
          <button 
            className="text-sm text-blue-600 hover:text-blue-800 transition"
            onClick={() => alert("Payment terms will be shown")}
          >
            Payment Terms
          </button>
        </div>
      </div>
    </div>
  );
}