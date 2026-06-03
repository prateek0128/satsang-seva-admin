import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Popup";
import { Skeleton } from "@mui/material";

// ─── Icon Components ─────────────────────────────────────────────────────────
const Icon = ({ d, size = 20, viewBox = "0 0 24 24", fill = "none", ...rest }) => (
  <svg width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
    {d}
  </svg>
);

const icons = {
  users:    <Icon d={<><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></>} />,
  bookings: <Icon d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />,
  events:   <Icon d={<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>} />,
  pending:  <Icon d={<><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></>} />,
  bell:     <Icon size={18} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />,
  arrow:    <Icon size={14} d={<><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></>} />,
  approve:  <Icon size={18} d={<><polyline points="20 6 9 17 4 12"/></>} />,
  user:     <Icon size={18} d={<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>} />,
  cal:      <Icon size={18} d={<><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>} />,
  blog:     <Icon size={18} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>} />,
  draft:    <Icon size={20} d={<><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></>} />,
  blogLg:   <Icon size={20} d={<><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></>} />,
  contact:  <Icon size={20} d={<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></>} />,
  notif:    <Icon size={20} d={<><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>} />,
};

// ─── Reusable Components ──────────────────────────────────────────────────────
const StatCard = ({ label, value, icon, color, light, change, path, loading, navigate }) => (
  <div
    className="stat-card"
    onClick={() => navigate(path)}
    style={{
      background: "#fff", borderRadius: 16, padding: "22px 20px",
      border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
      transition: "all 0.25s cubic-bezier(0.4,0,0.2,1)", cursor: "pointer",
      position: "relative", overflow: "hidden",
    }}
    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 28px rgba(0,0,0,0.1), 0 0 0 1px ${color}22`; e.currentTarget.style.transform = "translateY(-3px)"; }}
    onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 4px rgba(0,0,0,0.05)"; e.currentTarget.style.transform = "translateY(0)"; }}
  >
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},#f58021,#ffa726)`, borderRadius: "16px 16px 0 0" }} />
    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
      <div style={{ width: 46, height: 46, borderRadius: 13, background: light, display: "flex", alignItems: "center", justifyContent: "center", color, boxShadow: `0 4px 16px ${color}33`, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 30% 30%, rgba(245,128,33,0.2), transparent 60%)`, opacity: 0.6 }} />
        <div style={{ position: "relative", zIndex: 1 }}>{icon}</div>
      </div>
      <span style={{ fontSize: "0.65rem", fontWeight: 800, color, background: light, border: `1px solid ${color}30`, padding: "3px 9px", borderRadius: 999, letterSpacing: "0.06em", textTransform: "uppercase" }}>
        {change}
      </span>
    </div>
    <p style={{ margin: "0 0 4px", fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</p>
    {loading
      ? <span className="skeleton" style={{ display: "inline-block", width: 64, height: 30 }} />
      : <p style={{ margin: 0, fontSize: "1.9rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px", lineHeight: 1 }}>{value?.toLocaleString() ?? "—"}</p>
    }
  </div>
);

const MetricItem = ({ label, value, loading, accent }) => (
  <div style={{ padding: "14px 16px", background: "rgba(255,255,255,0.05)", borderRadius: 12, border: "1px solid rgba(255,255,255,0.08)" }}>
    <p style={{ margin: "0 0 6px", fontSize: "0.62rem", fontWeight: 700, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
    <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: accent ? "#4ade80" : "#fff", letterSpacing: "-0.03em" }}>{loading ? "—" : value}</p>
  </div>
);

const ActionRow = ({ label, desc, icon, color, path, navigate }) => (
  <button
    onClick={() => navigate(path)}
    style={{ width: "100%", display: "flex", alignItems: "center", gap: 14, padding: "11px 14px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", textAlign: "left", transition: "background 0.15s" }}
    onMouseEnter={e => e.currentTarget.style.background = "#f8fafc"}
    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
  >
    <div style={{ width: 36, height: 36, borderRadius: 9, background: `${color}12`, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>{icon}</div>
    <div style={{ flex: 1, minWidth: 0 }}>
      <p style={{ margin: 0, fontSize: "0.85rem", fontWeight: 600, color: "#0f172a" }}>{label}</p>
      <p style={{ margin: "1px 0 0", fontSize: "0.75rem", color: "#94a3b8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{desc}</p>
    </div>
    <span style={{ color: "#cbd5e1", flexShrink: 0 }}>{icons.arrow}</span>
  </button>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const AdminPage = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [data, setData] = useState({ users: 0, bookings: 0, events: 0, drafts: 0, blogs: 0, pending: 0, notifications: 0, contacts: 0, notificationsReceived: 0 });
  const [loading, setLoading] = useState(true);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sending, setSending] = useState(false);
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };
        const [analyticsRes, draftsRes, blogsRes, notificationsRes, contactsRes, receivedRes] = await Promise.all([
          axios.get(url + "admin/analytics", { headers }),
          axios.get(url + "admin/events/drafts", { headers }),
          axios.get(url + "blogs", { headers }),
          axios.get(url + "admin/notifications?limit=1", { headers }),
          axios.get(url + "admin/contacts", { headers }),
          axios.get(url + "admin/notifications/received", { headers }),
        ]);
        if (analyticsRes.data.success) {
          const receivedData = receivedRes.data.data || {};
          setData({
            users:    analyticsRes.data.users,
            bookings: analyticsRes.data.bookings,
            events:   analyticsRes.data.events,
            pending:  analyticsRes.data.pendingEvents || 0,
            drafts:   draftsRes.data.data?.events?.length || draftsRes.data.events?.length || 0,
            blogs:    (blogsRes.data.data || blogsRes.data.blogs || []).length,
            notifications: notificationsRes.data.data?.total || 0,
            contacts: (contactsRes.data.data || []).length,
            notificationsReceived: (receivedData.pendingHosts?.length || 0) + (receivedData.pendingEvents?.length || 0) + (receivedData.draftEvents?.length || 0),
          });
        }
      } catch (e) {
        if (e.response?.status !== 401) toast(e.response?.data?.message || "Failed to load analytics", "error");
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const sendNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) { toast("Fill both title and message", "warning"); return; }
    setSending(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${url}admin/send-notification`, { title: notifTitle, body: notifBody }, { headers: { Authorization: `Bearer ${token}` } });
      if (res.data.success) { toast("Notification sent successfully", "success"); setNotifTitle(""); setNotifBody(""); }
      else toast(res.data.message || "Failed", "error");
    } catch (e) { toast(e.response?.data?.message || "Error", "error"); }
    setSending(false);
  };

  const stats = [
    { label: "Total Users",        value: data.users,         icon: icons.users,   color: "#2563eb", light: "#eff6ff", change: "Registered", path: "/admin/allusers" },
    { label: "Total Events",       value: data.events,        icon: icons.events,  color: "#D26600", light: "#fff7ed", change: "Listed",     path: "/admin/events" },
    { label: "Total Bookings",     value: data.bookings,      icon: icons.bookings,color: "#d97706", light: "#fffbeb", change: "All time",   path: "/admin/bookings" },
    { label: "Blog Posts",         value: data.blogs,         icon: icons.blogLg,  color: "#7c3aed", light: "#faf5ff", change: "Published",  path: "/admin/blog" },
    { label: "Pending Review",     value: data.pending,       icon: icons.pending, color: "#7c3aed", light: "#f5f3ff", change: "Awaiting",   path: "/admin/approvals" },
    { label: "Draft Events",       value: data.drafts,        icon: icons.draft,   color: "#0369a1", light: "#f0f9ff", change: "Incomplete", path: "/admin/drafts" },
    { label: "Notifications Sent", value: data.notifications, icon: icons.notif,   color: "#6366f1", light: "#eef2ff", change: "Total",     path: "/admin/notifications" },
    { label: "Contact Queries",    value: data.contacts,      icon: icons.contact, color: "#ec4899", light: "#fdf2f8", change: "Received",  path: "/admin/contact-queries" },
  ];

  const actions = [
    { label: "Approvals",         desc: "Review and approve pending events and hosts", icon: icons.approve, color: "#059669", path: "/admin/approvals" },
    { label: "User Management",   desc: "View, edit and manage all users",            icon: icons.user,    color: "#2563eb", path: "/admin/allusers" },
    { label: "Events",            desc: "Browse and manage all events",               icon: icons.cal,     color: "#D26600", path: "/admin/events" },
    { label: "Blog Management",   desc: "Create and publish blog posts",              icon: icons.blog,    color: "#7c3aed", path: "/admin/blog" },
    { label: "Booking Management",desc: "View and manage all user bookings",          icon: icons.bookings,color: "#d97706", path: "/admin/bookings" },
    { label: "Notification History",desc: "Track all sent notifications",             icon: icons.bell,    color: "#6366f1", path: "/admin/notifications" },
    { label: "Contact Queries",   desc: "View messages, feedback and reports",        icon: icons.contact, color: "#ec4899", path: "/admin/contact-queries" },
  ];

  return (
    <div style={{ padding: "32px", minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "'Plus Jakarta Sans','Inter',-apple-system,sans-serif" }}>

      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <p style={{ margin: "0 0 4px", fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.1em", textTransform: "uppercase" }}>
          {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
        </p>
        <h1 style={{ margin: "0 0 4px", fontSize: "1.75rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em", lineHeight: 1.15 }}>
          {greeting},{" "}
          <span style={{ background: "linear-gradient(135deg,#D26600,#f58021,#ffa726)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
            {admin?.name?.split(" ")[0] || "Admin"}
          </span>
        </h1>
        <p style={{ margin: 0, fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
          Here's an overview of your platform activity.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div className="stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20, marginBottom: 28 }}>
        {stats.map((s, i) => <StatCard key={i} loading={loading} navigate={navigate} {...s} />)}
      </div>

      {/* ── Platform Summary ── */}
      <div style={{ marginBottom: 28, background: "linear-gradient(135deg,#0f172a 0%,#1e293b 50%,#0f172a 100%)", borderRadius: 18, border: "1px solid rgba(255,255,255,0.06)", boxShadow: "0 4px 24px rgba(15,23,42,0.2)", padding: "24px 28px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: -40, right: -40, width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(245,128,33,0.15), transparent 70%)", filter: "blur(50px)", pointerEvents: "none" }} />
        <div style={{ position: "absolute", bottom: -60, left: -60, width: 200, height: 200, borderRadius: "50%", background: "radial-gradient(circle, rgba(210,102,0,0.12), transparent 70%)", filter: "blur(60px)", pointerEvents: "none" }} />
        <p style={{ margin: "0 0 16px", fontSize: "0.72rem", fontWeight: 800, color: "rgba(255,255,255,0.45)", textTransform: "uppercase", letterSpacing: "0.12em", position: "relative", zIndex: 1 }}>Platform Summary</p>
        <div className="summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, position: "relative", zIndex: 1 }}>
          <MetricItem label="Avg. Bookings / Event" value={data.events ? (data.bookings / data.events).toFixed(1) : "—"} loading={loading} />
          <MetricItem label="Notifications Sent"    value={data.notifications}                                            loading={loading} />
          <MetricItem label="Contact Queries"       value={data.contacts}                                                 loading={loading} />
          <MetricItem label="Pending Actions"       value={data.notificationsReceived}                                    loading={loading} accent />
        </div>
      </div>

      {/* ── Two Column ── */}
      <div className="main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>

        {/* Quick Actions */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e8edf5", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9" }}>
            <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Quick Actions</h2>
            <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Navigate to key sections</p>
          </div>
          <div style={{ padding: "10px 10px" }}>
            {actions.map((a, i) => <ActionRow key={i} navigate={navigate} {...a} />)}
          </div>
        </div>

        {/* Push Notification */}
        <div style={{ background: "#fff", borderRadius: 18, border: "1px solid #e8edf5", boxShadow: "0 2px 12px rgba(0,0,0,0.05)", overflow: "hidden", display: "flex", flexDirection: "column" }}>
          <div style={{ padding: "18px 22px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 12, background: "linear-gradient(135deg,#fff7ed 0%,#fff3e0 50%,#ffe0b2 100%)" }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#D26600,#f58021,#ffa726)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 4px 16px rgba(245,128,33,0.35)", position: "relative", overflow: "hidden" }}>
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.3), transparent 70%)" }} />
              <div style={{ position: "relative", zIndex: 1 }}>{icons.bell}</div>
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Push Notification</h2>
              <p style={{ margin: "2px 0 0", fontSize: "0.75rem", color: "#94a3b8" }}>Broadcast message to all users</p>
            </div>
          </div>

          <div style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: 14, flex: 1 }}>
            {[
              { label: "Title", val: notifTitle, set: setNotifTitle, tag: "input", placeholder: "Notification title" },
              { label: "Message", val: notifBody, set: setNotifBody, tag: "textarea", placeholder: "Write your message here…" },
            ].map(({ label, val, set, tag, placeholder }) => (
              <div key={label}>
                <label style={{ display: "block", fontSize: "0.72rem", fontWeight: 700, color: "#475569", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</label>
                {tag === "input" ? (
                  <input value={val} onChange={e => set(e.target.value)} placeholder={placeholder}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.875rem", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit", background: "#fafafa", transition: "all 0.15s" }}
                    onFocus={e => { e.target.style.borderColor = "#D26600"; e.target.style.boxShadow = "0 0 0 3px rgba(210,102,0,0.08)"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; }}
                  />
                ) : (
                  <textarea value={val} onChange={e => set(e.target.value)} placeholder={placeholder} rows={4}
                    style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.875rem", color: "#0f172a", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "none", background: "#fafafa", transition: "all 0.15s" }}
                    onFocus={e => { e.target.style.borderColor = "#D26600"; e.target.style.boxShadow = "0 0 0 3px rgba(210,102,0,0.08)"; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.boxShadow = "none"; e.target.style.background = "#fafafa"; }}
                  />
                )}
              </div>
            ))}

            <button
              onClick={sendNotification}
              disabled={sending}
              style={{
                padding: "11px 20px", borderRadius: 9, border: "none",
                background: sending ? "#f1f5f9" : "linear-gradient(135deg,#D26600,#f58021,#ffa726)",
                color: sending ? "#94a3b8" : "#fff",
                fontWeight: 700, fontSize: "0.875rem",
                cursor: sending ? "not-allowed" : "pointer",
                transition: "all 0.18s", fontFamily: "inherit",
                boxShadow: sending ? "none" : "0 4px 16px rgba(245,128,33,0.35)",
                marginTop: "auto",
                position: "relative",
                overflow: "hidden",
              }}
              onMouseEnter={e => { 
                if (!sending) { 
                  e.currentTarget.style.background = "linear-gradient(135deg,#b35800,#D26600,#f58021)"; 
                  e.currentTarget.style.boxShadow = "0 6px 24px rgba(245,128,33,0.5)"; 
                  e.currentTarget.style.transform = "translateY(-2px)";
                } 
              }}
              onMouseLeave={e => { 
                if (!sending) { 
                  e.currentTarget.style.background = "linear-gradient(135deg,#D26600,#f58021,#ffa726)"; 
                  e.currentTarget.style.boxShadow = "0 4px 16px rgba(245,128,33,0.35)"; 
                  e.currentTarget.style.transform = "translateY(0)";
                } 
              }}
            >
              {sending ? "Sending…" : "Send Notification"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1200px) { .stats-grid { grid-template-columns: repeat(4,1fr) !important; } .summary-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 900px)  { .stats-grid { grid-template-columns: repeat(2,1fr) !important; } }
        @media (max-width: 768px)  { .stats-grid { grid-template-columns: 1fr !important; } .main-grid { grid-template-columns: 1fr !important; } .summary-grid { grid-template-columns: 1fr 1fr !important; } }
        .skeleton { background: linear-gradient(90deg,#f1f5f9 25%,#e2e8f0 50%,#f1f5f9 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
        @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        .stat-card { position: relative; overflow: hidden; }
      `}</style>
    </div>
  );
};

export default AdminPage;
