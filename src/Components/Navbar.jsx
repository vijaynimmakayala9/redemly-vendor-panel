import { useState, useEffect } from "react";
import {
  RiMenu2Line,
  RiMenu3Line,
  RiFullscreenLine,
  RiFullscreenExitLine,
  RiNotification3Fill,
} from "react-icons/ri";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const REFRESH_INTERVAL = 10000; // 10 seconds

const Navbar = ({ setIsCollapsed, isCollapsed, isMobile, toggleSidebar }) => {
  const navigate = useNavigate();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const vendorId = localStorage.getItem("vendorId");

  /* ---------------- FETCH UNREAD COUNT ---------------- */
  const fetchUnreadCount = async () => {
    try {
      if (!vendorId) {
        setUnreadCount(0);
        return;
      }

      const res = await axios.get(
        `https://api.redemly.com/api/vendor/notifications/${vendorId}`
      );

      const unread = res?.data?.data?.stats?.unread ?? 0;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Failed to fetch unread notifications:", error);
    }
  };

  /* ---------------- INITIAL + POLLING ---------------- */
  useEffect(() => {
    fetchUnreadCount();

    const interval = setInterval(fetchUnreadCount, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [vendorId]);

  /* ---------------- FULLSCREEN LISTENER ---------------- */
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("mozfullscreenchange", handleFullscreenChange);
    document.addEventListener("MSFullscreenChange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("webkitfullscreenchange", handleFullscreenChange);
      document.removeEventListener("mozfullscreenchange", handleFullscreenChange);
      document.removeEventListener("MSFullscreenChange", handleFullscreenChange);
    };
  }, []);

  /* ---------------- FULLSCREEN TOGGLE ---------------- */
  const toggleFullscreen = () => {
    const element = document.documentElement;

    if (!document.fullscreenElement) {
      element.requestFullscreen?.() ||
        element.webkitRequestFullscreen?.() ||
        element.msRequestFullscreen?.();
    } else {
      document.exitFullscreen?.() ||
        document.webkitExitFullscreen?.() ||
        document.msExitFullscreen?.();
    }
  };

  /* ---------------- KEYBOARD SHORTCUTS ---------------- */
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "F11") {
        e.preventDefault();
        toggleFullscreen();
      }
      if (e.key === "Escape" && document.fullscreenElement) {
        toggleFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  /* ---------------- SIDEBAR TOGGLE ---------------- */
  const handleSidebarToggle = () => {
    if (toggleSidebar) toggleSidebar();
    else setIsCollapsed(!isCollapsed);
  };

  return (
    <nav className="bg-blue-800 text-white sticky top-0 w-full h-16 md:h-20 px-3 sm:px-4 flex items-center shadow-md z-50">
      {/* Sidebar Toggle */}
      <button
        onClick={handleSidebarToggle}
        className="p-2 hover:bg-blue-700 rounded-lg transition"
        aria-label="Toggle sidebar"
      >
        {isCollapsed ? (
          <RiMenu2Line className="text-2xl" />
        ) : (
          <RiMenu3Line className="text-2xl" />
        )}
      </button>

      {/* Notifications */}
      <div
        className="flex items-center gap-2 cursor-pointer ml-3 sm:ml-5"
        onClick={() => navigate("/notifications")}
      >
        <div className="relative">
          <RiNotification3Fill className="text-xl sm:text-2xl hover:text-yellow-300 transition" />

          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-600 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center rounded-full px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>

        <span className="text-sm font-semibold hidden sm:inline">
          Notifications
        </span>
      </div>

      {/* Right Side */}
      <div className="flex-1 flex justify-end items-center gap-3">
        {/* Fullscreen */}
        <button
          onClick={toggleFullscreen}
          className="px-2 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 transition flex items-center gap-2"
          title={isFullscreen ? "Exit Fullscreen (F11)" : "Enter Fullscreen (F11)"}
        >
          {isFullscreen ? (
            <RiFullscreenExitLine className="text-lg" />
          ) : (
            <RiFullscreenLine className="text-lg" />
          )}
          <span className="text-xs hidden sm:inline">
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </span>
        </button>

        {/* Logo */}
        <div className="flex items-center gap-2 pl-3 border-l border-white/20">
          <img
            src="/discount logo.png"
            alt="Vendor Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <span className="font-bold text-base sm:text-lg hidden md:inline">
            Redemly
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
