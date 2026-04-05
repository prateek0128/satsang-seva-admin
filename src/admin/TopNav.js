import React from 'react';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/admin/dashboard': 'Dashboard',
  '/admin/allusers': 'Users',
  '/admin/events': 'Events',
  '/admin/approve': 'Approvals',
  '/admin/blog': 'Blogs',
};

const TopNav = ({ isOpen, toggleNav }) => {
  const location = useLocation();
  const title = pageTitles[location.pathname] || 'Admin';
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');

  return (
    <div style={{
      width: '100%', height: 64, background: '#fff',
      borderBottom: '1px solid #f0f0f0',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '0 20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
      position: 'sticky', top: 0, zIndex: 9999,
    }}>
      {/* Left — hamburger + title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button onClick={toggleNav} style={{
          background: 'none', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          width: 36, height: 36, borderRadius: 8,
          color: '#444', transition: 'background 0.18s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#f3f4f6'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          {isOpen ? <CloseIcon /> : <MenuIcon />}
        </button>
        <h1 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111' }}>{title}</h1>
      </div>

      {/* Right — admin info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: '#111' }}>{admin?.name || 'Admin'}</p>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#9ca3af' }}>Administrator</p>
        </div>
        <div style={{
          width: 36, height: 36, borderRadius: '50%',
          background: '#D26600', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: 700, fontSize: '0.9rem',
        }}>
          {(admin?.name || 'A')[0].toUpperCase()}
        </div>
      </div>
    </div>
  );
};

export default TopNav;
