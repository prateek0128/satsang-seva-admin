import React from "react";
import { useLocation, Link } from "react-router-dom";
import MenuIcon from "@mui/icons-material/MenuOpenRounded";
import MenuOpenIcon from "@mui/icons-material/MenuRounded";
import NotificationsIcon from "@mui/icons-material/NotificationsNoneRounded";

const pageMap = {
  "/admin/dashboard": {
    title: "Platform Overview",
    sub: "Analytics & quick actions",
    crumb: "Overview",
  },
  "/admin/allusers": {
    title: "User Management",
    sub: "View and manage all users",
    crumb: "Users",
  },
  "/admin/events": {
    title: "Events",
    sub: "Manage spiritual events",
    crumb: "Events",
  },
  "/admin/approvals": {
    title: "Approval Queue",
    sub: "Pending reviews",
    crumb: "Approvals",
  },
  "/admin/drafts": {
    title: "Draft Listings",
    sub: "Incomplete event drafts",
    crumb: "Drafts",
  },
  "/admin/blog": {
    title: "Content & Blogs",
    sub: "Manage published posts",
    crumb: "Blogs",
  },
  "/admin/bookings": {
    title: "Bookings",
    sub: "All reservations",
    crumb: "Bookings",
  },
  "/admin/notifications": {
    title: "Notifications",
    sub: "Broadcast & history",
    crumb: "Notifications",
  },
  "/admin/contact-queries": {
    title: "Contact Queries",
    sub: "User support requests",
    crumb: "Support",
  },
};

const TopNav = ({ isOpen, toggleNav }) => {
  const location = useLocation();
  const page = pageMap[location.pathname] || {
    title: "Dashboard",
    sub: "Admin panel",
    crumb: "Home",
  };
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const initials = (admin?.name || "A").slice(0, 2).toUpperCase();

  return (
    <header
      style={{
        width: "100%",
        height: 66,
        background: "rgba(255,255,255,0.95)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid #e8edf5",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 24px",
        position: "sticky",
        top: 0,
        zIndex: 999,
        boxShadow:
          "0 1px 0 rgba(0,0,0,0.04), 0 2px 12px rgba(0,0,0,0.03), inset 0 -2px 0 rgba(245,128,33,0.12)",
        flexShrink: 0,
      }}
    >
      {/* Left — toggle + breadcrumb + title */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}
      >
        <button
          onClick={toggleNav}
          aria-label="Toggle sidebar"
          style={{
            background: "#f1f5f9",
            border: "none",
            borderRadius: 10,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            transition: "all 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,#fff7ed,#ffe0b2)";
            e.currentTarget.style.color = "#f58021";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          {isOpen ? (
            <MenuIcon fontSize="small" />
          ) : (
            <MenuOpenIcon fontSize="small" />
          )}
        </button>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 1,
            }}
          >
            <Link
              to="/admin/dashboard"
              style={{
                fontSize: "0.68rem",
                color: "#94a3b8",
                textDecoration: "none",
                fontWeight: 600,
                letterSpacing: "0.02em",
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#64748b")}
              onMouseLeave={(e) => (e.target.style.color = "#94a3b8")}
            >
              Admin
            </Link>
            <span style={{ color: "#cbd5e1", fontSize: "0.68rem" }}>›</span>
            <span
              style={{
                fontSize: "0.68rem",
                background: "linear-gradient(90deg,#D26600,#f58021)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
              }}
            >
              {page.crumb}
            </span>
          </div>
          <h1
            style={{
              margin: 0,
              fontSize: "1rem",
              fontWeight: 800,
              color: "#0f172a",
              letterSpacing: "-0.4px",
              fontFamily: "'Plus Jakarta Sans',sans-serif",
              lineHeight: 1.2,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              padding: "0",
            }}
          >
            {page.title}
          </h1>
        </div>
      </div>

      {/* Right */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          flexShrink: 0,
        }}
      >
        <button
          style={{
            background: "transparent",
            border: "none",
            borderRadius: 9,
            width: 36,
            height: 36,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#94a3b8",
            transition: "all 0.18s",
            position: "relative",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background =
              "linear-gradient(135deg,#fff7ed,#ffe0b2)";
            e.currentTarget.style.color = "#f58021";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#94a3b8";
          }}
        >
          <NotificationsIcon fontSize="small" />
        </button>

        <div
          style={{
            width: 1,
            height: 24,
            background:
              "linear-gradient(180deg,transparent,rgba(245,128,33,0.3),transparent)",
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            cursor: "pointer",
            padding: "4px 10px 4px 4px",
            borderRadius: 12,
            transition: "all 0.18s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff7ed")}
          onMouseLeave={(e) =>
            (e.currentTarget.style.background = "transparent")
          }
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 10,
              background: "linear-gradient(135deg,#D26600,#f58021,#ffa726)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: "0.72rem",
              boxShadow: "0 4px 14px rgba(245,128,33,0.4)",
              letterSpacing: "0.02em",
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ display: "none" }} className="admin-name-block">
            <p
              style={{
                margin: 0,
                fontSize: "0.82rem",
                fontWeight: 700,
                color: "#0f172a",
                lineHeight: 1.2,
              }}
            >
              {admin?.name || "Admin"}
            </p>
            <p
              style={{
                margin: 0,
                fontSize: "0.62rem",
                background: "linear-gradient(90deg,#D26600,#f58021)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              Super Admin
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 640px) { .admin-name-block { display: block !important; } }
      `}</style>
    </header>
  );
};

export default TopNav;
