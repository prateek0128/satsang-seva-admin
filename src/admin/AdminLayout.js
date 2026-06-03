import React, { useEffect, useRef, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidenav from "./Sidenav";
import TopNav from './TopNav';

const AdminLayout = () => {
  const navRef = useRef(null);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  const toggleNav = () => setIsOpen(o => !o);
  const closeNav = () => { if (isMobile) setIsOpen(false); };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) setIsOpen(false);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    if (!token || !admin) { navigate("/admin"); return; }

    const interceptor = axios.interceptors.response.use(
      r => r,
      error => {
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

  const sidebarWidth = isMobile ? 0 : (isOpen ? 260 : 72);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: "'Plus Jakarta Sans','Inter',-apple-system,sans-serif" }}>
      <Sidenav isOpen={isOpen} setIsOpen={setIsOpen} toggleNav={toggleNav} closeNav={closeNav} ref={navRef} isMobile={isMobile} />

      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          onClick={closeNav}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 9999, backdropFilter: 'blur(2px)', transition: 'opacity 0.3s' }}
        />
      )}

      <div style={{
        marginLeft: sidebarWidth,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        transition: 'margin-left 0.38s cubic-bezier(0.4,0,0.2,1)',
        minWidth: 0,
      }}>
        <TopNav isOpen={isOpen} toggleNav={toggleNav} />
        <main style={{ flex: 1, overflowY: 'auto', animation: 'fadeIn 0.35s ease-out' }}>
          <Outlet />
        </main>
      </div>

      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
};

export default AdminLayout;
