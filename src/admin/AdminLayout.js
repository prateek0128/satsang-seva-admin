import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidenav from "./Sidenav"
import TopNav from './TopNav';

const AdminLayout = () => {
  const navRef = useRef(null)
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(true); // Default open for desktop
  
  const toggleNav = () => setIsOpen(!isOpen);
  const closeNav = () => {
    if (window.innerWidth < 1024) setIsOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) setIsOpen(false);
      else setIsOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // Initial check
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    if (!token || !admin) {
      navigate("/admin");
      return;
    }

    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
          localStorage.removeItem("token");
          localStorage.removeItem("admin");
          navigate("/admin");
        }
        return Promise.reject(error);
      }
    );

    return () => axios.interceptors.response.eject(interceptor);
  }, [navigate]);

  const sidebarWidth = isOpen ? 260 : 80;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', sans-serif" }}>
      <Sidenav isOpen={isOpen} setIsOpen={setIsOpen} toggleNav={toggleNav} closeNav={closeNav} ref={navRef} />
      
      {/* Main Wrapper */}
      <div style={{ 
        marginLeft: sidebarWidth, 
        flex: 1, 
        display: 'flex', 
        flexDirection: 'column', 
        transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)', 
        minWidth: 0,
        position: 'relative'
      }}>
        <TopNav isOpen={isOpen} toggleNav={toggleNav} />
        
        <main style={{ 
          flex: 1, 
          padding: '24px', 
          overflowY: 'auto',
          animation: 'fadeIn 0.5s ease-out'
        }}>
          <Outlet />
        </main>
        
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          ::-webkit-scrollbar { width: 6px; }
          ::-webkit-scrollbar-track { background: #f1f5f9; }
          ::-webkit-scrollbar-thumb { background: #cbd5e1; borderRadius: 10px; }
          ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        `}</style>
      </div>
    </div>
  );
};

export default AdminLayout;