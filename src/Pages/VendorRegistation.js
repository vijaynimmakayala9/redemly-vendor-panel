import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VendorRegistration = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    zipcode: "",
    businessName: "",
    latitude: "",
    longitude: "",
    password: "",
    businessLogo: null,
  });

  const [token, setToken] = useState("");
  const [otp, setOtp] = useState("");

  const navigate = useNavigate();

  // onChange handler
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({ ...formData, [name]: files ? files[0] : value });
  };

  // Registration API
  const handleRegister = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      alert("Please fill all required fields.");
      return;
    }

    if (!formData.businessLogo) {
      alert("Please upload a Business Logo.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      Object.keys(formData).forEach((key) => data.append(key, formData[key]));

      const res = await axios.post(
        "http://31.97.206.144:6098/api/vendor/register",
        data
      );

      setToken(res.data.token);
      alert("Vendor registered! Please enter the OTP sent to your email.");
      setStep(2);
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed!");
    } finally {
      setLoading(false);
    }
  };

  // OTP verification API
  const handleVerifyOtp = async () => {
    if (otp.length < 4) {
      alert("Enter a valid OTP.");
      return;
    }

    setOtpLoading(true);

    try {
      await axios.post(
        "http://31.97.206.144:6098/api/vendor/verify-otp",
        { token, otp },
        { headers: { "Content-Type": "application/json" } }
      );

      alert("OTP Verified! Vendor Activated.");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "OTP Verification Failed!");
    } finally {
      setOtpLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-300 via-yellow-200 to-blue-300 p-6">

      <div className="w-full max-w-3xl p-8 rounded-3xl shadow-2xl 
                      backdrop-blur-xl bg-white/60 border border-white/40">

        {/* TITLE */}
        <h2 className="text-4xl font-bold text-center mb-6 
                       bg-gradient-to-r from-blue-700 to-yellow-600 
                       bg-clip-text text-transparent">
          Vendor Registration
        </h2>

        {/* ---------------- STEP 1 : REGISTRATION ---------------- */}
        {step === 1 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {[
                { name: "name", placeholder: "Full Name" },
                { name: "email", placeholder: "Email Address", type: "email" },
                { name: "phone", placeholder: "Phone Number" },
                { name: "city", placeholder: "City" },
                { name: "zipcode", placeholder: "Zip Code" },
                { name: "businessName", placeholder: "Business Name" },
                { name: "latitude", placeholder: "Latitude" },
                { name: "longitude", placeholder: "Longitude" },
                { name: "password", placeholder: "Password", type: "password" },
              ].map((item, idx) => (
                <input
                  key={idx}
                  type={item.type || "text"}
                  name={item.name}
                  placeholder={item.placeholder}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-blue-300 
                             bg-white/70 backdrop-blur 
                             focus:ring-2 focus:ring-blue-400 
                             focus:border-blue-500 outline-none transition-all"
                />
              ))}

              {/* FILE UPLOAD */}
              <div className="flex flex-col">
                <label className="font-semibold text-blue-700">Business Logo</label>
                <input
                  type="file"
                  name="businessLogo"
                  onChange={handleChange}
                  className="mt-1"
                />
              </div>

            </div>

            {/* REGISTER BUTTON */}
            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full mt-6 py-3 rounded-xl text-white font-bold shadow-lg 
                         bg-gradient-to-r from-blue-600 to-yellow-500 
                         hover:opacity-90 active:scale-95 transition-all"
            >
              {loading ? "Registering..." : "Register"}
            </button>

            {/* LOGIN LINK */}
            <p className="text-center text-gray-700 mt-4 font-medium">
              Already have an account?
            </p>

            <button
              onClick={() => navigate("/")}
              className="w-full mt-2 py-2 rounded-xl text-blue-700 border border-blue-500 
                         font-semibold bg-white/70 backdrop-blur
                         hover:bg-blue-50 active:scale-95 transition-all"
            >
              Login
            </button>
          </>
        )}

        {/* ---------------- STEP 2 : OTP ---------------- */}
        {step === 2 && (
          <div className="text-center">

            <h3 className="text-2xl font-bold text-blue-700 mb-3">OTP Verification</h3>
            <p className="text-gray-700 mb-4">Enter the OTP sent to your email.</p>

            <input
              type="text"
              maxLength="6"
              placeholder="Enter OTP"
              onChange={(e) => setOtp(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-blue-400 
                         bg-white/80 text-center text-xl tracking-widest 
                         focus:ring-2 focus:ring-blue-500 outline-none"
            />

            <button
              onClick={handleVerifyOtp}
              disabled={otpLoading}
              className="w-full mt-6 py-3 rounded-xl text-white font-bold 
                         shadow-lg bg-gradient-to-r from-blue-700 to-green-500 
                         hover:opacity-90 active:scale-95 transition-all"
            >
              {otpLoading ? "Verifying..." : "Verify OTP"}
            </button>

            {/* BACK TO LOGIN BUTTON */}
            <button
              onClick={() => navigate("/")}
              className="w-full mt-4 py-2 rounded-xl text-blue-700 
                         border border-blue-500 bg-white/70 backdrop-blur
                         hover:bg-blue-50 active:scale-95 transition-all"
            >
              Back to Login
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default VendorRegistration;
