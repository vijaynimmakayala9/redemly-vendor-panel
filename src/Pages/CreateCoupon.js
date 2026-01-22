import { useEffect, useState } from "react";
import axios from "axios";
import { FaPlus, FaSpinner } from "react-icons/fa";

const CreateCoupon = () => {
  const vendorId = localStorage.getItem("vendorId");
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [fetchingCategories, setFetchingCategories] = useState(true);

  const [formData, setFormData] = useState({
    category: "",
    discountPercentage: "",
    validityDate: "",
    couponCodeType: "%",
  });

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setFetchingCategories(true);
        const res = await axios.get("https://api.redemly.com/api/admin/categories");
        
        if (res.data.categories && res.data.categories.length > 0) {
          setCategories(res.data.categories);
          // Set default category to first category
          setFormData(prev => ({
            ...prev,
            category: res.data.categories[0].categoryName
          }));
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
        alert("Failed to load categories");
      } finally {
        setFetchingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.category) {
      alert("Please select a category");
      return;
    }
    
    if (!formData.discountPercentage) {
      alert("Please enter discount percentage");
      return;
    }
    
    if (!formData.validityDate) {
      alert("Please select validity date");
      return;
    }

    try {
      setLoading(true);

      // Create payload with only 4 fields
      const payload = {
        category: formData.category,
        discountPercentage: Number(formData.discountPercentage),
        validityDate: formData.validityDate,
        couponCodeType: formData.couponCodeType,
      };

      const response = await axios.post(
        `https://api.redemly.com/api/vendor/create-coupon/${vendorId}`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.data.success || response.data.message) {
        alert("✅ Coupon created successfully");

        // Reset form but keep selected category
        setFormData({
          category: categories.length > 0 ? categories[0].categoryName : "",
          discountPercentage: "",
          validityDate: "",
          couponCodeType: "%",
        });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create coupon");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 py-16 px-4">
      {/* Header */}
      <div className="max-w-3xl mx-auto mb-10 text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
          Create Coupon
        </h1>
        <p className="mt-2 text-gray-600">
          Quick coupon creation with essential fields
        </p>
      </div>

      {/* Card */}
      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto backdrop-blur-xl bg-white/80 border border-white/40 rounded-3xl shadow-xl p-8 md:p-10"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl text-white shadow-lg">
            <FaPlus />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Essential Coupon Details
          </h2>
        </div>

        {/* Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Category */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Category
            </label>
            {fetchingCategories ? (
              <div className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm flex items-center gap-2">
                <FaSpinner className="animate-spin text-purple-500" />
                <span className="text-gray-500">Loading categories...</span>
              </div>
            ) : categories.length === 0 ? (
              <div className="mt-1 w-full rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm">
                <span className="text-red-600">No categories available</span>
              </div>
            ) : (
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
                className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.categoryName}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Discount Percentage */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Discount Percentage
            </label>
            <input
              type="number"
              name="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleChange}
              placeholder="50"
              required
              min="1"
              max="100"
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Validity Date */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Validity Date
            </label>
            <input
              type="date"
              name="validityDate"
              value={formData.validityDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]} // Minimum date is today
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Coupon Code Type */}
          <div>
            <label className="text-sm font-medium text-gray-600">
              Coupon Type
            </label>
            <select
              name="couponCodeType"
              value={formData.couponCodeType}
              onChange={handleChange}
              className="mt-1 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:ring-2 focus:ring-purple-500 outline-none"
            >
              <option value="%">Percentage (%)</option>
              <option value="fixed">Fixed Amount</option>
              <option value="free">Free Item</option>
            </select>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end mt-10">
          <button
            type="submit"
            disabled={loading || fetchingCategories || categories.length === 0}
            className="px-8 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
          >
            {loading ? (
              <>
                <FaSpinner className="animate-spin" />
                Creating...
              </>
            ) : (
              "Create Coupon"
            )}
          </button>
        </div>

        {/* Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <p className="text-sm text-blue-700">
            <span className="font-semibold">Note:</span> Only 4 fields are required: 
            Category, Discount Percentage, Validity Date, and Coupon Type.
          </p>
          {categories.length > 0 && (
            <p className="text-xs text-blue-600 mt-1">
              Categories loaded: {categories.map(c => c.categoryName).join(", ")}
            </p>
          )}
        </div>

        {/* Categories Loading Error */}
        {!fetchingCategories && categories.length === 0 && (
          <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200">
            <p className="text-sm text-red-700">
              <span className="font-semibold">Error:</span> No categories available. Please contact admin to add categories first.
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default CreateCoupon;