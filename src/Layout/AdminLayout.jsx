import { useState, useEffect, useRef } from "react";
import Sidebar from "../Components/Sidebar";
import Navbar from "../Components/Navbar";

export default function AdminLayout({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const sidebarRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      // Auto-collapse sidebar on mobile initially
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    // Initial check
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle click outside sidebar on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isMobile && 
        !isCollapsed && 
        sidebarRef.current && 
        !sidebarRef.current.contains(event.target) &&
        !event.target.closest('.navbar-toggle-button') // Don't close if clicking toggle button
      ) {
        setIsCollapsed(true);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isMobile, isCollapsed]);

  // Prevent body scroll when sidebar is open on mobile
  useEffect(() => {
    if (isMobile && !isCollapsed) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobile, isCollapsed]);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="flex h-screen relative overflow-hidden">
      {/* Overlay for mobile */}
      {isMobile && !isCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300"
          onClick={() => setIsCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <div ref={sidebarRef}>
        <Sidebar 
          isCollapsed={isCollapsed} 
          isMobile={isMobile} 
          setIsCollapsed={setIsCollapsed}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col transition-all duration-300 w-full">
        {/* Navbar */}
        <Navbar 
          setIsCollapsed={setIsCollapsed} 
          isCollapsed={isCollapsed}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />
        
        {/* Page Content */}
        <div className="p-3 sm:p-4 md:p-6 overflow-y-auto bg-[#EFF0F1] flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}