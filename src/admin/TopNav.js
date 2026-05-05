import React from 'react';
import { useLocation } from 'react-router-dom';
import MenuIcon from '@mui/icons-material/MenuOpenRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsNoneRounded';
import SearchIcon from '@mui/icons-material/SearchRounded';

const pageTitles = {
  '/admin/dashboard': 'Platform Overview',
  '/admin/allusers': 'User Management',
  '/admin/events': 'Events Control Center',
  '/admin/approve': 'Approval Queue',
  '/admin/drafts': 'Incomplete Listings',
  '/admin/blog': 'Content & Blogs',
};

const TopNav = ({ toggleNav }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Dashboard';
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  return (
    <div style={{
      width: '100%', height: 80, 
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 32px', 
      position: 'sticky', top: 0, zIndex: 999,
      transition: 'all 0.3s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
        <button onClick={toggleNav} style={{
          background: '#f1f5f9', border: 'none', borderRadius: '10px',
          width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#64748b', transition: 'all 0.2s'
        }} onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'} onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}>
          <MenuIcon />
        </button>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>{title}</h1>
          <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b', fontWeight: 500 }}>Welcome back, {admin.name || 'Administrator'}</p>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '8px', paddingRight: '20px', borderRight: '1px solid #e2e8f0' }}>
          <button style={actionBtnStyle}><SearchIcon fontSize="small" /></button>
          <button style={actionBtnStyle}><NotificationsIcon fontSize="small" /></button>
        </div>

        {/* Admin Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', fontWeight: 700, color: '#0f172a' }}>{admin?.name || 'Admin'}</p>
            <p style={{ margin: 0, fontSize: '0.7rem', color: '#D26600', fontWeight: 700, textTransform: 'uppercase' }}>Super Admin</p>
          </div>
          <div style={{
            width: 44, height: 44, borderRadius: '14px',
            background: 'linear-gradient(135deg, #0f172a, #334155)', 
            color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 800, fontSize: '1.1rem',
            boxShadow: '0 4px 12px rgba(15,23,42,0.2)',
            border: '2px solid #fff'
          }}>
            {(admin?.name || 'A')[0].toUpperCase()}
          </div>
        </div>
      </div>
    </div>
  );
};

const actionBtnStyle = {
  background: 'transparent', border: 'none', borderRadius: '10px',
  width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
  cursor: 'pointer', color: '#94a3b8', transition: 'all 0.2s'
};

export default TopNav;
