import React, { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/SpaceDashboardTwoTone';
import UsersIcon from '@mui/icons-material/PeopleAltTwoTone';
import EventsIcon from '@mui/icons-material/EventNoteTwoTone';
import ApproveIcon from '@mui/icons-material/FactCheckTwoTone';
import BlogIcon from '@mui/icons-material/ArticleTwoTone';
import LogoutIcon from '@mui/icons-material/LogoutTwoTone';
import { toast, confirmDialog } from '../components/Popup';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <DashboardIcon fontSize="small" /> },
  { to: '/admin/allusers', label: 'Users', icon: <UsersIcon fontSize="small" /> },
  { to: '/admin/events', label: 'Events', icon: <EventsIcon fontSize="small" /> },
  { to: '/admin/approve', label: 'Approvals', icon: <ApproveIcon fontSize="small" /> },
  { to: '/admin/blog', label: 'Blogs', icon: <BlogIcon fontSize="small" /> },
];

const SideNavbar = forwardRef(({ isOpen, closeNav }, ref) => {
  const location = useLocation();

  const handleLogOut = async () => {
    const ok = await confirmDialog('Are you sure you want to logout?');
    if (ok) {
      localStorage.removeItem('admin');
      localStorage.removeItem('token');
      window.location.reload();
    }
  };

  return (
    <div ref={ref} style={{
      position: 'fixed', top: 0, left: isOpen ? 0 : -260,
      width: 240, height: '100vh', background: '#1a1a2e',
      zIndex: 10000, transition: 'left 0.28s cubic-bezier(.4,0,.2,1)',
      display: 'flex', flexDirection: 'column', boxShadow: isOpen ? '4px 0 24px rgba(0,0,0,0.18)' : 'none',
    }}>
      {/* Logo */}
      <div style={{ padding: '24px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: '#D26600', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: '#fff', fontWeight: 800, fontSize: '1rem' }}>S</span>
          </div>
          <div>
            <p style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', margin: 0, lineHeight: 1.2 }}>SatsangSeva</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.7rem', margin: 0 }}>Admin Panel</p>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
        {navItems.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={closeNav} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', borderRadius: 10, textDecoration: 'none',
              background: active ? 'rgba(210,102,0,0.18)' : 'transparent',
              color: active ? '#D26600' : 'rgba(255,255,255,0.7)',
              fontWeight: active ? 700 : 500, fontSize: '0.875rem',
              transition: 'all 0.18s',
              borderLeft: active ? '3px solid #D26600' : '3px solid transparent',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; } }}
            >
              <span style={{ color: active ? '#D26600' : 'rgba(255,255,255,0.5)', display: 'flex' }}>{icon}</span>
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
        <button onClick={handleLogOut} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '10px 14px', borderRadius: 10, border: 'none',
          background: 'transparent', color: 'rgba(255,255,255,0.6)',
          fontWeight: 500, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.18s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.12)'; e.currentTarget.style.color = '#f87171'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; }}
        >
          <LogoutIcon fontSize="small" />
          Logout
        </button>
      </div>
    </div>
  );
});

export default SideNavbar;
