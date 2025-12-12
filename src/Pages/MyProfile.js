import React, { useEffect, useState } from "react";

const MyProfile = () => {
  const vendorId = localStorage.getItem("vendorId"); // get stored vendor ID
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch vendor details
  const fetchProfile = async () => {
    try {
      const res = await fetch(
        `http://31.97.206.144:6098/api/vendor/getById/${vendorId}`
      );
      const data = await res.json();
      setVendor(data.vendor);
    } catch (err) {
      console.log("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (vendorId) fetchProfile();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl font-semibold text-blue-600">
        Loading Profile...
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-600">
        Failed to load vendor profile
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg p-6 md:p-10">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-700 drop-shadow-sm">
            My Profile
          </h1>
          <p className="text-gray-600">Manage your business identity</p>
        </div>

        {/* Profile Card */}
        <div className="flex flex-col items-center">
          <img
            src={vendor.businessLogo}
            alt="Business Logo"
            className="w-32 h-32 rounded-full object-cover shadow-md border-4 border-blue-300"
          />

          <h2 className="mt-4 text-2xl font-semibold text-gray-800">
            {vendor.businessName}
          </h2>
          <p className="text-gray-500">{vendor.city}, {vendor.zipcode}</p>
        </div>

        {/* Details Section */}
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Name */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Owner Name</p>
            <p className="text-lg font-semibold text-gray-900">{vendor.name}</p>
          </div>

          {/* Email */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Email</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.email}
            </p>
          </div>

          {/* Phone */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Phone</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.phone}
            </p>
          </div>

          {/* Business Name */}
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Business Name</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.businessName}
            </p>
          </div>

          {/* City */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">City</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.city}
            </p>
          </div>

          {/* Zip Code */}
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Zip Code</p>
            <p className="text-lg font-semibold text-gray-900">
              {vendor.zipcode}
            </p>
          </div>

          {/* Status */}
          <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Status</p>
            <span className="mt-1 inline-block px-3 py-1 rounded-full text-sm font-bold bg-green-200 text-green-800">
              {vendor.isApproved ? "Approved" : "Pending"}
            </span>
          </div>

          {/* Created At */}
          <div className="p-4 bg-gray-100 border border-gray-200 rounded-xl">
            <p className="text-sm text-gray-600 font-medium">Created At</p>
            <p className="text-lg font-semibold text-gray-900">
              {new Date(vendor.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Edit Profile Button */}
        <div className="mt-10 flex justify-center">
          <button className="px-8 py-3 rounded-xl bg-blue-600 text-white text-lg font-semibold shadow hover:bg-blue-700 transition">
            Edit Profile
          </button>
        </div>

      </div>
    </div>
  );
};

export default MyProfile;
