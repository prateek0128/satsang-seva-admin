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
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import { Tooltip } from "@mui/material";
import { confirmDialog } from "../../components/Popup";
import Badge from "../../components/Badge";

const SideNavbar = forwardRef(
  ({ isOpen, toggleNav, closeNav, isMobile }, ref) => {
    const location = useLocation();
    const url = process.env.REACT_APP_BACKEND;
    const [contactCount, setContactCount] = useState(0);
    const [notifCount, setNotifCount] = useState(0);
    const adminData = JSON.parse(localStorage.getItem("admin") || "{}");

    useEffect(() => {
      const token = localStorage.getItem("token");
      if (!token) return;
      const fetchCounts = async () => {
        try {
          const res = await axios.get(`${url}admin/badge-counts`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (res.data.status === "success") {
            setContactCount(res.data.data.contactUnread || 0);
            setNotifCount(res.data.data.receivedUnread || 0);
          }
        } catch {
          /* silent */
        }
      };
      fetchCounts();
      const interval = setInterval(fetchCounts, 60000);
      return () => clearInterval(interval);
    }, [url]);

    const navItems = [
      {
        to: "/admin/dashboard",
        label: "Overview",
        icon: <DashboardIcon fontSize="small" />,
      },
      ...(adminData.designation === "superAdmin"
        ? [
            {
              to: "/admin/admins",
              label: "Admin Users",
              icon: <AdminPanelSettingsIcon fontSize="small" />,
            },
          ]
        : []),
      {
        to: "/admin/allusers",
        label: "Users",
        icon: <UsersIcon fontSize="small" />,
      },
      {
        to: "/admin/events",
        label: "Events",
        icon: <EventsIcon fontSize="small" />,
      },
      {
        to: "/admin/approvals",
        label: "Approvals",
        icon: <ApproveIcon fontSize="small" />,
      },
      {
        to: "/admin/drafts",
        label: "Drafts",
        icon: <DraftsIcon fontSize="small" />,
      },
      {
        to: "/admin/blog",
        label: "Blogs",
        icon: <BlogIcon fontSize="small" />,
      },
      {
        to: "/admin/bookings",
        label: "Bookings",
        icon: <BookingsIcon fontSize="small" />,
        badge: 0,
      },
      {
        to: "/admin/notifications",
        label: "Notifications",
        icon: <NotificationsIcon fontSize="small" />,
        badge: notifCount,
      },
      {
        to: "/admin/contact-queries",
        label: "Contact Queries",
        icon: <SupportIcon fontSize="small" />,
        badge: contactCount,
      },
    ];

    const handleLogOut = async () => {
      if (await confirmDialog("Are you sure you want to exit?")) {
        localStorage.clear();
        window.location.href = "/admin";
      }
    };

    const collapsed = !isOpen;
    const sidebarW = isMobile ? (isOpen ? 260 : 0) : isOpen ? 260 : 72;

    return (
      <div
        ref={ref}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: sidebarW,
          height: "100vh",
          background:
            "linear-gradient(180deg,#0a0f1e 0%,#0f172a 50%,#130800 100%)",
          zIndex: 10000,
          transition: "width 0.38s cubic-bezier(0.4,0,0.2,1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "4px 0 32px rgba(0,0,0,0.25)",
          overflow: "hidden",
          borderRight: "1px solid rgba(255,255,255,0.04)",
        }}
      >
        <style>{`
        .snav::-webkit-scrollbar { display: none; }
        .snav { scrollbar-width: none; -ms-overflow-style: none; }
        .snav-link {
          display: flex; align-items: center; gap: 12px;
          padding: 9px 12px; border-radius: 10px;
          text-decoration: none; transition: all 0.2s ease;
          position: relative; cursor: pointer;
        }
        .snav-link.active { background: linear-gradient(135deg,rgba(245,128,33,0.2),rgba(210,102,0,0.08)); border: 1px solid rgba(245,128,33,0.15); }
        .snav-link.active .snav-icon { color: #f58021; filter: drop-shadow(0 0 8px rgba(245,128,33,0.6)); }
        .snav-link:hover { background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.04); }
        .snav-icon { transition: all 0.2s ease; flex-shrink: 0; }
        @keyframes snav-fade { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:translateX(0); } }
        .snav-label { animation: snav-fade 0.22s ease both; white-space: nowrap; overflow: hidden; }
        .logout-btn { width:100%; display:flex; align-items:center; gap:12px; padding:9px 12px; border-radius:10px; border:none; background:rgba(239,68,68,0.06); color:#f87171; font-weight:600; font-size:0.875rem; cursor:pointer; transition:all 0.2s; font-family:inherit; }
        .logout-btn:hover { background:rgba(239,68,68,0.14); color:#ef4444; }
      `}</style>

        {/* Brand */}
        <div
          style={{
            padding: "16px 14px",
            display: "flex",
            alignItems: "center",
            gap: 12,
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            minHeight: 70,
            flexShrink: 0,
          }}
        >
          <img
            src="/group1.svg"
            alt="SatsangSeva"
            style={{ width: 44, height: 44, flexShrink: 0 }}
          />
          {isOpen && (
            <div
              className="snav-label"
              style={{
                fontFamily: "Sacramento, cursive",
                fontSize: "1.6rem",
                fontWeight: 600,
                color: "#ffffff",
                whiteSpace: "nowrap",
              }}
            >
              Satsang Seva
            </div>
          )}
        </div>

        {/* Nav Items */}
        <nav
          className="snav"
          style={{
            flex: 1,
            padding: "10px 8px",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {isOpen && (
            <div style={{ padding: "6px 8px 4px", marginBottom: 2 }}>
              <span
                style={{
                  fontSize: "0.56rem",
                  fontWeight: 800,
                  color: "rgba(255,255,255,0.2)",
                  textTransform: "uppercase",
                  letterSpacing: "0.14em",
                }}
              >
                Main Menu
              </span>
            </div>
          )}

          {navItems.map(({ to, label, icon, badge }) => {
            const active =
              location.pathname === to ||
              location.pathname.startsWith(to + "/");
            const linkEl = (
              <Link
                key={to}
                to={to}
                onClick={closeNav}
                className={`snav-link${active ? " active" : ""}`}
                style={{ justifyContent: collapsed ? "center" : "flex-start" }}
              >
                {active && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: 22,
                      borderRadius: "0 4px 4px 0",
                      background:
                        "linear-gradient(180deg,#ffa726,#f58021,#D26600)",
                      boxShadow: "2px 0 16px rgba(245,128,33,0.7)",
                    }}
                  />
                )}
                <span
                  className="snav-icon"
                  style={{
                    color: active ? "#f58021" : "rgba(255,255,255,0.45)",
                    position: "relative",
                    display: "flex",
                  }}
                >
                  {icon}
                  {collapsed && badge > 0 && (
                    <span
                      style={{
                        position: "absolute",
                        top: -3,
                        right: -3,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#ef4444",
                        border: "1.5px solid #0a0f1e",
                      }}
                    />
                  )}
                </span>
                {isOpen && (
                  <>
                    <span
                      className="snav-label"
                      style={{
                        fontSize: "0.875rem",
                        fontWeight: active ? 700 : 500,
                        color: active ? "#fff" : "rgba(255,255,255,0.6)",
                        flex: 1,
                        fontFamily: "'Plus Jakarta Sans',sans-serif",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      {label}
                    </span>
                    <Badge count={badge} />
                  </>
                )}
              </Link>
            );

            return collapsed ? (
              <Tooltip key={to} title={label} placement="right" arrow>
                {linkEl}
              </Tooltip>
            ) : (
              <React.Fragment key={to}>{linkEl}</React.Fragment>
            );
          })}
        </nav>

        {/* Logout */}
        <div
          style={{
            padding: "10px 8px 14px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            flexShrink: 0,
          }}
        >
          {collapsed ? (
            <Tooltip title="Log Out" placement="right" arrow>
              <button
                className="logout-btn"
                onClick={handleLogOut}
                style={{ justifyContent: "center" }}
              >
                <LogoutIcon style={{ fontSize: "1.1rem", flexShrink: 0 }} />
              </button>
            </Tooltip>
          ) : (
            <button
              className="logout-btn"
              onClick={handleLogOut}
              style={{ justifyContent: "flex-start" }}
            >
              <LogoutIcon style={{ fontSize: "1.1rem", flexShrink: 0 }} />
              <span className="snav-label">Log Out</span>
            </button>
          )}
        </div>
      </div>
    );
  },
);

export default SideNavbar;
