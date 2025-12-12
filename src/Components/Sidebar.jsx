import React, { useState } from "react";
import { FaChevronDown } from "react-icons/fa";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = ({ isCollapsed, isMobile }) => {
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };

  const handleLogout = () => {
      window.location.href = "/";    
      alert("Logout successful");
   
  };

  const elements = [
    {
      icon: <i className="ri-home-fill text-white"></i>,
      name: "Home",
      path: "/dashboard",
    },
    {
    icon: <i className="ri-user-3-fill text-white"></i>,
    name: "Profile",
    dropdown: [
      { name: "My Profile", path: "/profile" }
    ]
  },
    {
      icon: <i className="ri-building-fill text-white"></i>,
      name: "Coupons",
      dropdown: [
        { name: "Add Coupon", path: "/create-coupon" },
        { name: "All Coupons", path: "/coupons" },
        { name: "Coupons History", path: "/couponshistory" },
      ],
    },
    {
      icon: <i className="ri-file-search-fill text-white"></i>,
      name: "Documents",
      dropdown: [
        { name: "Upload Documents", path: "/upload-docs" },
        { name: "Documents List", path: "/docs" },
      ],
    },
    {
      icon: <i className="ri-survey-fill text-white"></i>,
      name: "Survey",
      dropdown: [
        { name: "Create Survey", path: "/createsurvey" },
        { name: "Get All Surveys", path: "/surveylist" },
        { name: "Submitted Surveys", path: "/submitted-survey" },
      ],
    },
    {
      icon: <i className="ri-money-dollar-circle-fill text-white"></i>,
      name: "Payments",
      dropdown: [
        { name: "Payment List", path: "/paymentlist" },
      ],
    },
    {
      icon: <i className="ri-notification-3-fill text-white"></i>,
      name: "Notifications",
      dropdown: [
        { name: "All Notifications", path: "/notifications" },
      ],
    },
    {
      icon: <i className="ri-logout-box-fill text-white"></i>,
      name: "Logout",
      action: handleLogout,
    },
  ];

  return (
    <div
      className={`transition-all duration-300 ${isMobile ? (isCollapsed ? "w-0" : "w-64") : isCollapsed ? "w-16" : "w-64"
        } h-screen overflow-y-scroll no-scrollbar flex flex-col bg-blue-800`}
    >


      <div className="sticky top-0 p-4 font-bold text-white flex justify-center text-xl">
        <span>Vendor Dashboard</span>
      </div>

      <div className="border-b-4 border-gray-800 my-2"></div>

      <nav className={`flex flex-col ${isCollapsed && "items-center"} space-y-4 mt-4`}>
        {elements.map((item, idx) => (
          <div key={idx}>
            {item.dropdown ? (
              <>
                <div
                  className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-[#333333] hover:text-[#00B074] duration-300 cursor-pointer"
                  onClick={() => toggleDropdown(item.name)}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                    {item.name}
                  </span>
                  <FaChevronDown
                    className={`ml-auto text-xs transform ${openDropdown === item.name ? "rotate-180" : "rotate-0"}`}
                  />
                </div>
                {openDropdown === item.name && (
                  <ul className="ml-10 text-sm text-white">
                    {item.dropdown.map((subItem, subIdx) => (
                      <li key={subIdx}>
                        <Link
                          to={subItem.path}
                          className="flex items-center space-x-2 py-2 font-bold cursor-pointer hover:text-[#00B074] hover:underline"
                          onClick={() => setOpenDropdown(null)}
                        >
                          <span className="text-[#00B074]">•</span>
                          <span>{subItem.name}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            ) : (
              <Link
                to={item.path}
                className="flex items-center py-3 px-4 font-bold text-sm text-white mx-4 rounded-lg hover:bg-[#333333] hover:text-[#00B074] duration-300 cursor-pointer"
                onClick={item.action ? item.action : null}
              >
                <span className="text-xl">{item.icon}</span>
                <span className={`ml-4 ${isCollapsed && !isMobile ? "hidden" : "block"}`}>
                  {item.name}
                </span>
              </Link>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
