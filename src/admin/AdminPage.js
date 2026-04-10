import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/Popup';

// SVG Icons
const UsersIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const BookingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const EventIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);
const PendingIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const ArrowIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);
const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const UserMgmtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const EventMgmtIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const BlogIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>
  </svg>
);

const AdminPage = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [data, setData] = useState({ users: 0, bookings: 0, events: 0 });
  const [loading, setLoading] = useState(true);
  const [notifTitle, setNotifTitle] = useState('');
  const [notifBody, setNotifBody] = useState('');
  const [sending, setSending] = useState(false);
  const admin = JSON.parse(localStorage.getItem('admin') || '{}');
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(url + 'admin/analytics', { headers });
        if (res.data.success) setData({ users: res.data.users, bookings: res.data.bookings, events: res.data.events });
      } catch (e) {
        if (e.response?.status !== 401) toast(e.response?.data?.message || 'Failed to load analytics', 'error');
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) { toast('Fill both title and message', 'warning'); return; }
    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.post(`${url}admin/send-notification`, { title: notifTitle, body: notifBody }, { headers });
      if (res.data.success) { toast('Notification sent successfully', 'success'); setNotifTitle(''); setNotifBody(''); }
      else toast(res.data.message || 'Failed', 'error');
    } catch (e) { toast(e.response?.data?.message || 'Error', 'error'); }
    setSending(false);
  };

  const stats = [
    { label: 'Total Users', value: data.users, icon: <UsersIcon />, color: '#2563eb', light: '#eff6ff', change: 'Registered' },
    { label: 'Total Bookings', value: data.bookings, icon: <BookingIcon />, color: '#d97706', light: '#fffbeb', change: 'All time' },
    { label: 'Total Events', value: data.events, icon: <EventIcon />, color: '#D26600', light: '#fff7ed', change: 'Listed' },
    { label: 'Pending Review', value: 0, icon: <PendingIcon />, color: '#7c3aed', light: '#f5f3ff', change: 'Awaiting' },
  ];

  const actions = [
    { label: 'Event Approvals', desc: 'Review and approve pending events', icon: <CheckIcon />, color: '#059669', path: '/admin/approve' },
    { label: 'User Management', desc: 'View, edit and manage all users', icon: <UserMgmtIcon />, color: '#2563eb', path: '/admin/allusers' },
    { label: 'Events', desc: 'Browse and manage all events', icon: <EventMgmtIcon />, color: '#D26600', path: '/admin/events' },
    { label: 'Blog Management', desc: 'Create and publish blog posts', icon: <BlogIcon />, color: '#7c3aed', path: '/admin/blog' },
  ];

  return (
    <div style={{ padding: '32px', background: '#f8fafc', minHeight: '100vh', fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: '0 0 6px', fontSize: '0.78rem', fontWeight: 500, color: '#94a3b8', letterSpacing: '0.04em' }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
        <h1 style={{ margin: '0 0 4px', fontSize: '1.5rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.5px' }}>
          {greeting}, {admin?.name?.split(' ')[0] || 'Admin'}
        </h1>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>
          Here's an overview of your platform activity.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 28 }} className="stats-grid">
        {stats.map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '22px 24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)'}
            onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.04)'}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: s.light, display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color }}>
                {s.icon}
              </div>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#64748b', background: '#f8fafc', border: '1px solid #e2e8f0', padding: '2px 8px', borderRadius: 6 }}>
                {s.change}
              </span>
            </div>
            <p style={{ margin: '0 0 4px', fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{s.label}</p>
            <p style={{ margin: 0, fontSize: '1.875rem', fontWeight: 800, color: '#0f172a', letterSpacing: '-1px', lineHeight: 1 }}>
              {loading ? <span style={{ display: 'inline-block', width: 60, height: 28, background: '#f1f5f9', borderRadius: 6 }} /> : s.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {/* ── Two Column ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="main-grid">

        {/* Quick Actions */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
            <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Quick Actions</h2>
            <p style={{ margin: '2px 0 0', fontSize: '0.78rem', color: '#94a3b8' }}>Navigate to key sections</p>
          </div>
          <div style={{ padding: '12px' }}>
            {actions.map((a, i) => (
              <button key={i} onClick={() => navigate(a.path)} style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 14px', borderRadius: 10, border: 'none',
                background: 'transparent', cursor: 'pointer', textAlign: 'left',
                transition: 'background 0.15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ width: 36, height: 36, borderRadius: 9, background: `${a.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: a.color, flexShrink: 0 }}>
                  {a.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 600, color: '#0f172a' }}>{a.label}</p>
                  <p style={{ margin: '1px 0 0', fontSize: '0.75rem', color: '#94a3b8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.desc}</p>
                </div>
                <span style={{ color: '#cbd5e1', flexShrink: 0 }}><ArrowIcon /></span>
              </button>
            ))}
          </div>
        </div>

        {/* Notification */}
        <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#D26600' }}>
              <BellIcon />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Push Notification</h2>
              <p style={{ margin: 0, fontSize: '0.78rem', color: '#94a3b8' }}>Broadcast message to all users</p>
            </div>
          </div>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Title</label>
              <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                placeholder="Notification title"
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', background: '#fafafa', transition: 'all 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#D26600'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(210,102,0,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: '#475569', marginBottom: 6, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Message</label>
              <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)}
                placeholder="Write your message here..." rows={4}
                style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: '0.875rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', fontFamily: 'inherit', resize: 'none', background: '#fafafa', transition: 'all 0.15s' }}
                onFocus={e => { e.target.style.borderColor = '#D26600'; e.target.style.background = '#fff'; e.target.style.boxShadow = '0 0 0 3px rgba(210,102,0,0.08)'; }}
                onBlur={e => { e.target.style.borderColor = '#e2e8f0'; e.target.style.background = '#fafafa'; e.target.style.boxShadow = 'none'; }} />
            </div>
            <button onClick={sendNotification} disabled={sending} style={{
              padding: '11px 20px', borderRadius: 8, border: 'none',
              background: sending ? '#f1f5f9' : '#D26600',
              color: sending ? '#94a3b8' : '#fff',
              fontWeight: 600, fontSize: '0.875rem', cursor: sending ? 'not-allowed' : 'pointer',
              transition: 'all 0.15s', fontFamily: 'inherit',
              boxShadow: sending ? 'none' : '0 2px 8px rgba(210,102,0,0.25)',
            }}
              onMouseEnter={e => { if (!sending) e.currentTarget.style.background = '#b85a00'; }}
              onMouseLeave={e => { if (!sending) e.currentTarget.style.background = '#D26600'; }}>
              {sending ? 'Sending...' : 'Send Notification'}
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Bar ── */}
      <div style={{ marginTop: 24, background: '#fff', borderRadius: 14, border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.04)', padding: '20px 24px' }}>
        <h2 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>Platform Summary</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {[
            { label: 'Avg. Bookings / Event', value: data.events ? (data.bookings / data.events).toFixed(1) : '—' },
            { label: 'Users / Event Ratio', value: data.events ? (data.users / data.events).toFixed(1) : '—' },
            { label: 'System Status', value: 'Operational' },
            { label: 'Last Refreshed', value: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) },
          ].map((item, i) => (
            <div key={i} style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 10, border: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0 0 6px', fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</p>
              <p style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{loading ? '—' : item.value}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @media (max-width: 1024px) { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 768px)  { .stats-grid { grid-template-columns: 1fr !important; } .main-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
};

export default AdminPage;
