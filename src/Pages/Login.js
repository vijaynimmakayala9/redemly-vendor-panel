import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import discountLogo from "../Images/discount logo.png";

const LoginPage = () => {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // Handle input change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // LOGIN API CALL (NO OTP)
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      return setError("Email & Password are required.");
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "http://31.97.206.144:6098/api/vendor/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json();
      console.log("Login Response:", data);

      if (response.ok) {
        if (data.vendor && data.vendor._id) {
          localStorage.setItem("vendorId", data.vendor._id);
          localStorage.setItem("vendorName", data.vendor.name);
          localStorage.setItem("vendorEmail", data.vendor.email);
          localStorage.setItem("vendorLogo", data.vendor.businessLogo);
          localStorage.setItem("vendorToken", data.token);
        }

        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed. Try again.");
      }
    } catch (err) {
      setError("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 py-10">

      <div className="flex flex-col md:flex-row items-center bg-white rounded-lg shadow-2xl overflow-hidden max-w-4xl w-full">

        {/* -------- LEFT - LOGIN FORM -------- */}
        <div className="w-full md:w-1/2 p-8 space-y-6">
          <h1 className="text-4xl font-bold text-blue-600 text-center mb-4">
            Redemly
          </h1>

          <h2 className="text-xl font-bold text-center text-gray-800">
            Vendor Login
          </h2>

          {error && (
            <div className="p-3 text-red-600 bg-red-100 rounded-md shadow-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md 
                           focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Enter email"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="block w-full p-3 mt-1 border border-gray-300 rounded-md 
                           focus:outline-none focus:ring focus:ring-blue-500"
                placeholder="Enter password"
              />
            </div>

            {/* Login Button */}
            <button
              type="submit"
              className={`w-full p-3 text-white bg-blue-600 rounded-md 
                         hover:bg-blue-700 transition duration-200 transform ${
                           isLoading
                             ? "opacity-50 cursor-not-allowed"
                             : "hover:scale-105"
                         }`}
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Signup Button */}
            <p className="text-center text-gray-600 mt-2">
              Don’t have an account?
            </p>

            <button
              type="button"
              onClick={() => navigate("/register")}
              className="w-full p-3 text-blue-600 border border-blue-600 rounded-md 
                         hover:bg-blue-50 transition duration-200 transform hover:scale-105"
            >
              Create an Account
            </button>
          </form>
        </div>

        {/* -------- RIGHT - IMAGE -------- */}
        <div className="w-full md:w-1/2 flex justify-center p-4 md:p-0">
          <img
            src={discountLogo}
            alt="Discount Logo"
            className="object-contain w-3/4 h-auto"
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
