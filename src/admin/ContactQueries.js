import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import Loader from "../components/Loader";

const S = {
  page: { padding: "28px 32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter',-apple-system,sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 },
  title: { margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" },
  sub: { margin: 0, fontSize: "0.8rem", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" },
  th: { padding: "11px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", textAlign: "left" },
  td: { padding: "12px 16px", fontSize: "0.82rem", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "top" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "5px", borderRadius: 6, display: "inline-flex", alignItems: "center", color: "#94a3b8", transition: "all 0.15s" },
};

const ContactQueries = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all"); // "all", "help", "contact"

  useEffect(() => {
    const fetchQueries = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(url + "admin/contacts", { headers });
        console.log("Contact Queries Response:", res.data);
        setQueries(res.data.data || []);
      } catch (e) {
        console.error("Fetch contacts error:", e);
        toast("Error fetching contact queries: " + e.message, "error");
      } finally { setLoading(false); }
    };
    fetchQueries();
  }, [url]);

  const handleDelete = async (query) => {
    const ok = await confirmDialog("Delete this query?");
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(url + "admin/contact/" + query._id, { headers });
      setQueries(queries.filter(q => q._id !== query._id));
      toast("Query deleted successfully", "success");
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    }
  };

  const filtered = queries.filter(q => {
    const matchesSearch = !search || 
      q.firstName?.toLowerCase().includes(search.toLowerCase()) ||
      q.email?.toLowerCase().includes(search.toLowerCase()) ||
      q.subject?.toLowerCase().includes(search.toLowerCase());
    
    const isHelp = !!q.isHelp || 
                   q.subject?.toLowerCase().includes("help") || 
                   q.subject?.toLowerCase().includes("support");

    if (filterType === "help") return matchesSearch && isHelp;
    if (filterType === "contact") return matchesSearch && !isHelp;
    return matchesSearch;
  });

  return (
    <div style={S.page}>
      <div style={S.header}>
        <div>
          <h1 style={S.title}>Contact Queries</h1>
          <p style={S.sub}>{queries.length} total messages received</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: "10px", gap: "4px" }}>
            {["all", "help", "contact"].map(type => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                style={{
                  padding: "6px 16px",
                  borderRadius: "8px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  background: filterType === type ? "#fff" : "transparent",
                  color: filterType === type ? "#D26600" : "#64748b",
                  boxShadow: filterType === type ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {type === "all" ? "All" : type === "help" ? "Help" : "Contact"}
              </button>
            ))}
          </div>

          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search..."
            style={{ padding: "9px 14px", borderRadius: 8, border: "1px solid #e2e8f0", fontSize: "0.82rem", color: "#334155", outline: "none", width: 220, fontFamily: "inherit", background: "#fff" }}
            onFocus={e => e.target.style.borderColor = "#D26600"}
            onBlur={e => e.target.style.borderColor = "#e2e8f0"} />
        </div>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}><Loader /></div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Date", "Sender", "Contact", "Type", "Subject", "Message", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} style={{ ...S.td, textAlign: "center", padding: 40, color: "#94a3b8" }}>No queries found</td></tr>
                ) : filtered.map(q => {
                  const isHelp = !!q.isHelp || 
                                q.subject?.toLowerCase().includes("help") || 
                                q.subject?.toLowerCase().includes("support");
                  return (
                  <tr key={q._id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.12s" }}>
                    
                    <td style={{...S.td, whiteSpace: "nowrap"}}>
                      <div style={{ fontWeight: 600 }}>{dayjs(q.createdAt).format("DD MMM YYYY")}</div>
                      <div style={{ fontSize: "0.7rem", color: "#94a3b8" }}>{dayjs(q.createdAt).format("hh:mm A")}</div>
                    </td>
                    
                    <td style={{...S.td, whiteSpace: "nowrap"}}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#D26600,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                          {(q.firstName || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, color: "#0f172a" }}>{q.firstName} {q.lastName}</div>
                          {q.user && <div style={{ fontSize: "0.7rem", color: "#2563eb" }}>Registered User</div>}
                        </div>
                      </div>
                    </td>
                    
                    <td style={{...S.td, whiteSpace: "nowrap"}}>
                      <div style={{ color: "#334155" }}>{q.email}</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{q.phone || "No phone"}</div>
                    </td>

                    <td style={{...S.td, whiteSpace: "nowrap"}}>
                      {isHelp ? (
                        <span style={{ background: "rgba(230,99,52,0.1)", color: "#E66334", fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "capitalize" }}>Help</span>
                      ) : (
                        <span style={{ background: "rgba(37,99,235,0.1)", color: "#2563eb", fontSize: "0.75rem", fontWeight: 700, padding: "4px 10px", borderRadius: "20px", textTransform: "capitalize" }}>Contact</span>
                      )}
                    </td>

                    <td style={{...S.td, fontWeight: 600, color: "#0f172a", maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap"}}>
                      {q.subject}
                    </td>
                    
                    <td style={{...S.td, maxWidth: 300, minWidth: 200, lineHeight: 1.4}}>
                      <div style={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", color: "#475569" }}>
                        {q.message}
                      </div>
                    </td>
                    
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <a href={`mailto:${q.email}?subject=Re: ${encodeURIComponent(q.subject)}`} style={S.iconBtn} title="Reply via Email"
                          onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        </a>
                        <button style={S.iconBtn} title="Delete Query"
                          onClick={() => handleDelete(q)}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactQueries;
