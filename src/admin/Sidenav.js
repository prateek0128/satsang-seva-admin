import React, { forwardRef, useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import DashboardIcon from "@mui/icons-material/SpaceDashboardRounded";
import UsersIcon from "@mui/icons-material/PeopleRounded";
import EventsIcon from "@mui/icons-material/EventAvailableRounded";
import ApproveIcon from "@mui/icons-material/VerifiedUserRounded";
import BlogIcon from "@mui/icons-material/DescriptionRounded";
import LogoutIcon from "@mui/icons-material/PowerSettingsNewRounded";
import DraftsIcon from "@mui/icons-material/EditNoteRounded";
import SupportIcon from "@mui/icons-material/SupportAgentRounded";
import BookingsIcon from "@mui/icons-material/BookOnlineRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsRounded";
import { confirmDialog } from "../components/Popup";
import Badge from "../components/Badge";

const SideNavbar = forwardRef(({ isOpen, toggleNav, closeNav }, ref) => {
  const location = useLocation();
  const url = process.env.REACT_APP_BACKEND;
  const [contactCount, setContactCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    const headers = { Authorization: `Bearer ${token}` };

    const fetchCounts = async () => {
      try {
        const res = await axios.get(`${url}admin/badge-counts`, { headers });
        if (res.data.status === 'success') {
          setContactCount(res.data.data.contactUnread || 0);
          setNotifCount(res.data.data.receivedUnread || 0);
        }
      } catch { /* silent */ }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [url]);

  const navItems = [
    { to: "/admin/dashboard", label: "Overview", icon: <DashboardIcon /> },
    { to: "/admin/allusers", label: "Users", icon: <UsersIcon /> },
    { to: "/admin/events", label: "Events", icon: <EventsIcon /> },
    { to: "/admin/approvals", label: "Approvals", icon: <ApproveIcon /> },
    { to: "/admin/drafts", label: "Drafts", icon: <DraftsIcon /> },
    { to: "/admin/blog", label: "Blogs", icon: <BlogIcon /> },
    { to: "/admin/bookings", label: "Bookings", icon: <BookingsIcon /> },
    { to: "/admin/notifications", label: "Notifications", icon: <NotificationsIcon />, badge: notifCount },
    { to: "/admin/contact-queries", label: "Contact Queries", icon: <SupportIcon />, badge: contactCount },
  ];

  const handleLogOut = async () => {
    const ok = await confirmDialog("Are you sure you want to exit?");
    if (ok) {
      localStorage.clear();
      window.location.href = "/admin";
    }
  };

  return (
    <div ref={ref} style={{
      position: "fixed", top: 0, left: 0,
      width: isOpen ? 260 : 80, height: "100vh",
      background: "#0f172a", zIndex: 10000,
      transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
      display: "flex", flexDirection: "column",
      boxShadow: "10px 0 30px rgba(0,0,0,0.15)", overflow: "hidden",
    }}>
      <style>{`
        .sidenav-nav::-webkit-scrollbar { display: none; }
        .sidenav-nav { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      {/* Brand */}
      <div style={{ padding: "20px 16px", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
        <div style={{ width: 40, height: 40, borderRadius: 12, background: "linear-gradient(135deg, #D26600, #ea580c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "1.2rem", fontWeight: 900, flexShrink: 0, boxShadow: "0 4px 12px rgba(210,102,0,0.3)" }}>
          S
        </div>
        {isOpen && (
          <div style={{ animation: "fadeIn 0.3s" }}>
            <h1 style={{ margin: 0, color: "#fff", fontSize: "1.1rem", fontWeight: 800, letterSpacing: "-0.5px" }}>Satsang</h1>
            <p style={{ margin: 0, color: "#64748b", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}>Admin Control</p>
          </div>
        )}
      </div>

      {/* Nav Items */}
      <nav className="sidenav-nav" style={{ flex: 1, padding: "8px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "1px" }}>
        {navItems.map(({ to, label, icon, badge }) => {
          const active = location.pathname === to;
          return (
            <Link key={to} to={to} onClick={closeNav} style={{
              display: "flex", alignItems: "center", gap: "14px",
              padding: "9px 14px", borderRadius: "10px", textDecoration: "none",
              justifyContent: isOpen ? "flex-start" : "center",
              background: active ? "rgba(210,102,0,0.1)" : "transparent",
              color: active ? "#fff" : "#94a3b8",
              position: "relative", transition: "all 0.2s ease",
            }}
              onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "rgba(255,255,255,0.03)"; e.currentTarget.style.color = "#fff"; } }}
              onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#94a3b8"; } }}
            >
              {/* Icon with dot badge when collapsed */}
              <span style={{ color: active ? "#D26600" : "inherit", display: "flex", transition: "transform 0.2s ease", transform: active ? "scale(1.1)" : "none", position: "relative", flexShrink: 0 }}>
                {icon}
                {!isOpen && badge > 0 && (
                  <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "1.5px solid #0f172a" }} />
                )}
              </span>

              {isOpen && (
                <>
                  <span style={{ fontSize: "0.9rem", fontWeight: active ? 700 : 500, flex: 1 }}>{label}</span>
                  <Badge count={badge} />
                </>
              )}

              {active && (
                <div style={{ position: "absolute", left: -12, width: 4, height: 24, background: "#D26600", borderRadius: "0 4px 4px 0", boxShadow: "4px 0 10px rgba(210,102,0,0.4)" }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div style={{ padding: "8px 10px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button onClick={handleLogOut} style={{
          width: "100%", display: "flex", alignItems: "center", gap: "14px",
          padding: "9px 14px", borderRadius: "10px", border: "none",
          justifyContent: isOpen ? "flex-start" : "center",
          background: "rgba(239, 68, 68, 0.05)", color: "#f87171",
          fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.2s",
        }}
          onMouseEnter={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.12)"; e.currentTarget.style.color = "#ef4444"; }}
          onMouseLeave={e => { e.currentTarget.style.background = "rgba(239, 68, 68, 0.05)"; e.currentTarget.style.color = "#f87171"; }}
        >
          <LogoutIcon style={{ fontSize: "1.25rem" }} />
          {isOpen && "Log Out"}
        </button>
      </div>
    </div>
  );
});

export default SideNavbar;
