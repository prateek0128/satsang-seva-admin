import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";

const S = {
  page: { padding: "28px 32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter',-apple-system,sans-serif" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" },
  th: { padding: "11px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", textAlign: "left" },
  td: { padding: "12px 16px", fontSize: "0.82rem", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  iconBtn: (color) => ({ background: "none", border: "none", cursor: "pointer", padding: "6px 10px", borderRadius: 7, display: "inline-flex", alignItems: "center", gap: 5, fontSize: "0.72rem", fontWeight: 600, color, border: `1px solid ${color}20`, transition: "all 0.15s" }),
};

const PendingEvents = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => { fetchPendingEvents(); }, []);

  const fetchPendingEvents = async () => {
    try {
      const res = await axios.get(`${url}admin/events/pending`, { headers: getHeaders() });
      setEvents(res.data.data?.events || res.data.pending || []);
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    } finally { setLoading(false); }
  };

  const handleApprove = async (event) => {
    const ok = await confirmDialog(`Approve "${event.eventName}"?`);
    if (!ok) return;
    try {
      await axios.put(`${url}admin/approve/${event._id}`, {}, { headers: getHeaders() });
      setEvents(events.filter(e => e._id !== event._id));
      toast("Event approved successfully", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleReject = async (event) => {
    const ok = await confirmDialog(`Reject "${event.eventName}"?`);
    if (!ok) return;
    try {
      await axios.put(`${url}admin/reject/${event._id}`, {}, { headers: getHeaders() });
      setEvents(events.filter(e => e._id !== event._id));
      toast("Event rejected", "info");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleDelete = async (event) => {
    const ok = await confirmDialog(`Delete "${event.eventName}"? This cannot be undone.`);
    if (!ok) return;
    try {
      await axios.delete(`${url}events/${event._id}`, { headers: getHeaders() });
      setEvents(events.filter(e => e._id !== event._id));
      toast("Event deleted", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Pending Approvals</h1>
          {events.length > 0 && (
            <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 6 }}>
              {events.length} pending
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Review and approve event submissions from hosts</p>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Loading pending events...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Event", "Category", "Host", "Contact", "Start Date", "End Date", "Submitted", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ ...S.td, textAlign: "center", padding: "48px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <p style={{ margin: 0, fontWeight: 600, color: "#94a3b8", fontSize: "0.875rem" }}>All caught up!</p>
                        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.78rem" }}>No events pending approval</p>
                      </div>
                    </td>
                  </tr>
                ) : events.map(event => (
                  <tr key={event._id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.12s" }}>
                    <td style={{ ...S.td, maxWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {event.eventPosters?.[0] ? (
                          <div style={{ width: 36, height: 36, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "#f1f5f9", position: "relative" }}>
                            <img src={event.eventPosters[0].startsWith("http") ? event.eventPosters[0] : `${url?.replace("/api/", "")}${event.eventPosters[0]}`}
                              alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={e => { e.target.style.display = "none"; }} />
                          </div>
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#fff7ed", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#D26600" }}>{event.eventName?.[0]}</span>
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{event.eventName || "—"}</p>
                          <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8" }} onClick={() => navigator.clipboard.writeText(event._id)} title="Copy ID" className="cursor-pointer">
                            ...{event._id?.slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      {event.eventCategory?.length > 0 ? (
                        <span style={{ fontSize: "0.7rem", fontWeight: 600, background: "#fff7ed", color: "#D26600", border: "1px solid #fed7aa", borderRadius: 6, padding: "2px 8px" }}>
                          {event.eventCategory[0]}
                        </span>
                      ) : "—"}
                    </td>
                    <td style={{ ...S.td, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.hostName || "—"}</td>
                    <td style={S.td}>
                      {event.hostWhatsapp ? (
                        <a href={`tel:+91${event.hostWhatsapp}`} style={{ color: "#059669", fontWeight: 500, textDecoration: "none", fontSize: "0.8rem" }}>
                          {event.hostWhatsapp}
                        </a>
                      ) : "—"}
                    </td>
                    <td style={S.td}>{event.startDate ? dayjs(event.startDate).format("DD MMM YYYY") : "—"}</td>
                    <td style={S.td}>{event.endDate ? dayjs(event.endDate).format("DD MMM YYYY") : "—"}</td>
                    <td style={S.td}>{event.createdAt ? dayjs(event.createdAt).format("DD MMM YYYY") : "—"}</td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {/* View */}
                        <button style={{ ...S.iconBtn("#64748b"), padding: "5px" }} title="View"
                          onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/event/${event._id}`, "_blank")}
                          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        {/* Edit */}
                        <button style={{ ...S.iconBtn("#64748b"), padding: "5px" }} title="Edit"
                          onClick={() => navigate(`/admin/updateevent/${event._id}`)}
                          onMouseEnter={e => { e.currentTarget.style.background = "#f1f5f9"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        </button>
                        {/* Approve */}
                        <button onClick={() => handleApprove(event)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#059669", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#dcfce7"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#f0fdf4"; }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Approve
                        </button>
                        {/* Reject */}
                        <button onClick={() => handleReject(event)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#fef2f2"; }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                          Reject
                        </button>
                        {/* Delete */}
                        <button style={{ ...S.iconBtn("#64748b"), padding: "5px" }} title="Delete"
                          onClick={() => handleDelete(event)}
                          onMouseEnter={e => { e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.background = "#fef2f2"; }}
                          onMouseLeave={e => { e.currentTarget.style.color = "#64748b"; e.currentTarget.style.background = "transparent"; }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
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

export default PendingEvents;
