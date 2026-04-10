import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";

const S = {
  page: { padding: "28px 32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter',-apple-system,sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" },
  sub: { margin: 0, fontSize: "0.8rem", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" },
  th: { padding: "11px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", textAlign: "left" },
  td: { padding: "12px 16px", fontSize: "0.82rem", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "5px", borderRadius: 6, display: "inline-flex", alignItems: "center", color: "#94a3b8", transition: "all 0.15s" },
  badge: (type) => ({
    display: "inline-block", fontSize: "0.68rem", fontWeight: 600, padding: "2px 8px", borderRadius: 6,
    background: type === "admin" ? "#fef3c7" : type === "host" ? "#eff6ff" : "#f0fdf4",
    color: type === "admin" ? "#92400e" : type === "host" ? "#1d4ed8" : "#166534",
  }),
};

const UserList = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(url + "users", { headers });
        setUsers(res.data.data?.users || res.data.users || []);
      } catch (e) {
        toast("Error fetching users: " + e.message, "error");
      } finally { setLoading(false); }
    };
    fetchUsers();
  }, []);

  const handleDelete = async (user) => {
    const ok = await confirmDialog(`Delete ${user.name || "this user"}? This action is irreversible.`);
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(url + "users/" + user._id, { headers });
      setUsers(users.filter(u => u._id !== user._id));
      toast("User deleted successfully", "success");
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    }
  };

  const filtered = users.filter(u =>
    !search || u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.phone?.includes(search)
  );

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Users</h1>
          <p style={S.sub}>{users.length} total registered users</p>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or phone..."
          style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#334155", outline: "none", width: 260, fontFamily: "inherit", background: "#fff" }}
          onFocus={e => e.target.style.borderColor = "#D26600"}
          onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Loading users...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "Name", "Type", "Email", "Phone", "Joined", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", padding: 40, color: "#94a3b8" }}>No users found</td></tr>
                ) : filtered.map(user => (
                  <tr key={user._id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.12s" }}>
                    <td style={S.td}>
                      <span onClick={() => navigator.clipboard.writeText(user._id)} title="Copy ID"
                        style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#94a3b8", cursor: "pointer" }}>
                        ...{user._id?.slice(-6)}
                      </span>
                    </td>
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#D26600,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                          {(user.name || "?")[0].toUpperCase()}
                        </div>
                        <span style={{ fontWeight: 600, color: "#0f172a" }}>{user.name || "—"}</span>
                      </div>
                    </td>
                    <td style={S.td}><span style={S.badge(user.userType)}>{user.userType || "—"}</span></td>
                    <td style={{ ...S.td, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      <span onClick={() => navigator.clipboard.writeText(user.email || "")} title="Copy" style={{ cursor: "pointer" }}>{user.email || "—"}</span>
                    </td>
                    <td style={S.td}>
                      <span onClick={() => navigator.clipboard.writeText(user.phone || "")} title="Copy" style={{ cursor: "pointer" }}>{user.phone || "—"}</span>
                    </td>
                    <td style={S.td}>{user.createdAt ? dayjs(user.createdAt).format("DD MMM YYYY") : "—"}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={S.iconBtn} title="View Profile"
                          onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/public-profile?q=${user._id}`, "_blank")}
                          onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button style={S.iconBtn} title="Edit User"
                          onClick={() => navigate(`/admin/updateuser/${user._id}`)}
                          onMouseEnter={e => e.currentTarget.style.color = "#D26600"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        <button style={S.iconBtn} title="Delete User"
                          onClick={() => handleDelete(user)}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
