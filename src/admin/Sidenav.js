import React, { forwardRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import DashboardIcon from '@mui/icons-material/SpaceDashboardRounded';
import UsersIcon from '@mui/icons-material/PeopleRounded';
import EventsIcon from '@mui/icons-material/EventAvailableRounded';
import ApproveIcon from '@mui/icons-material/VerifiedUserRounded';
import BlogIcon from '@mui/icons-material/DescriptionRounded';
import LogoutIcon from '@mui/icons-material/PowerSettingsNewRounded';
import DraftsIcon from '@mui/icons-material/EditNoteRounded';
import SupportIcon from '@mui/icons-material/SupportAgentRounded';
import BookingsIcon from '@mui/icons-material/BookOnlineRounded';
import NotificationsIcon from '@mui/icons-material/NotificationsRounded';
import { confirmDialog } from '../components/Popup';

const navItems = [
  { to: '/admin/dashboard', label: 'Overview', icon: <DashboardIcon /> },
  { to: '/admin/allusers', label: 'User Directory', icon: <UsersIcon /> },
  { to: '/admin/events', label: 'Events Hub', icon: <EventsIcon /> },
  { to: '/admin/approve', label: 'Event Approvals', icon: <ApproveIcon /> },
  { to: '/admin/approve-hosts', label: 'Host Approvals', icon: <ApproveIcon /> },
  { to: '/admin/drafts', label: 'Drafts', icon: <DraftsIcon /> },
  { to: '/admin/blog', label: 'Blogs & News', icon: <BlogIcon /> },
  { to: '/admin/contact-queries', label: 'Support Queries', icon: <SupportIcon /> },
  { to: '/admin/bookings', label: 'Booking Management', icon: <BookingsIcon /> },
  { to: '/admin/notifications', label: 'Notification History', icon: <NotificationsIcon /> },
];

const SideNavbar = forwardRef(({ isOpen, toggleNav, closeNav }, ref) => {
  const location = useLocation();

  const handleLogOut = async () => {
    const ok = await confirmDialog('Are you sure you want to exit?');
    if (ok) {
      localStorage.clear();
      window.location.href = '/admin';
    }
  };

  return (
    <div ref={ref} style={{
      position: 'fixed', top: 0, left: 0,
      width: isOpen ? 260 : 80, height: '100vh', 
      background: '#0f172a',
      zIndex: 10000, 
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      display: 'flex', flexDirection: 'column', 
      boxShadow: '10px 0 30px rgba(0,0,0,0.15)',
      overflow: 'hidden',
    }}>
      <style>{`
        .sidenav-nav::-webkit-scrollbar { display: none; }
        .sidenav-nav { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>
      {/* Brand Section */}
      <div style={{ 
        padding: '20px 16px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.05)' 
      }}>
        <div style={{ 
          width: 40, height: 40, borderRadius: 12, 
          background: 'linear-gradient(135deg, #D26600, #ea580c)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '1.2rem', fontWeight: 900,
          flexShrink: 0,
          boxShadow: '0 4px 12px rgba(210,102,0,0.3)'
        }}>
          S
        </div>
        {isOpen && (
          <div style={{ animation: 'fadeIn 0.3s' }}>
            <h1 style={{ margin: 0, color: '#fff', fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.5px' }}>Satsang</h1>
            <p style={{ margin: 0, color: '#64748b', fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Admin Control</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="sidenav-nav" style={{ flex: 1, padding: '8px 10px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {navItems.map(({ to, label, icon }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={closeNav} style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '9px 14px', borderRadius: '10px', textDecoration: 'none',
              justifyContent: isOpen ? 'flex-start' : 'center',
              background: active ? 'rgba(210,102,0,0.1)' : 'transparent',
              color: active ? '#fff' : '#94a3b8',
              position: 'relative',
              transition: 'all 0.2s ease',
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#fff'; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; } }}
            >
              <span style={{ 
                color: active ? '#D26600' : 'inherit', 
                display: 'flex', 
                transition: 'transform 0.2s ease',
                transform: active ? 'scale(1.1)' : 'none'
              }}>{icon}</span>
              
              {isOpen && <span style={{ fontSize: '0.9rem', fontWeight: active ? 700 : 500 }}>{label}</span>}
              
              {active && (
                <div style={{ 
                  position: 'absolute', left: -12, width: 4, height: 24, 
                  background: '#D26600', borderRadius: '0 4px 4px 0',
                  boxShadow: '4px 0 10px rgba(210,102,0,0.4)'
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: '8px 10px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button onClick={handleLogOut} style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
          padding: '9px 14px', borderRadius: '10px', border: 'none',
          justifyContent: isOpen ? 'flex-start' : 'center',
          background: 'rgba(239, 68, 68, 0.05)', color: '#f87171',
          fontWeight: 600, fontSize: '0.875rem', cursor: 'pointer', transition: 'all 0.2s',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'; e.currentTarget.style.color = '#ef4444'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#f87171'; }}
        >
          <LogoutIcon style={{ fontSize: '1.25rem' }} />
          {isOpen && 'Log Out'}
        </button>
      </div>
    </div>
  );
});

export default SideNavbar;
