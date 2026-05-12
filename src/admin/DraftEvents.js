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

const DraftEvents = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => { fetchDraftEvents(); }, []);

  const fetchDraftEvents = async () => {
    try {
      const res = await axios.get(`${url}admin/events/drafts`, { headers: getHeaders() });
      setEvents(res.data.data?.events || []);
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    } finally { setLoading(false); }
  };

  const handleRemind = async (event) => {
    const ok = await confirmDialog(`Send a reminder to ${event.user?.name || "the host"} to complete "${event.eventName || 'this draft'}"?`);
    if (!ok) return;
    try {
      await axios.post(`${url}admin/events/drafts/${event._id}/remind`, {}, { headers: getHeaders() });
      toast("Reminder sent successfully", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Draft Events</h1>
          {events.length > 0 && (
            <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 6 }}>
              {events.length} drafts
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>View incomplete event listings and prompt hosts to finish them.</p>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Loading draft events...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Event ID", "Event", "Category", "Host", "Host Email", "Last Updated", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ ...S.td, textAlign: "center", padding: "48px 16px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                        <p style={{ margin: 0, fontWeight: 600, color: "#94a3b8", fontSize: "0.875rem" }}>No drafts found</p>
                        <p style={{ margin: 0, color: "#cbd5e1", fontSize: "0.78rem" }}>Users have completed all their event listings.</p>
                      </div>
                    </td>
                  </tr>
                ) : events.map(event => (
                  <tr key={event._id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.12s" }}>
                    <td style={S.td}>
                      <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
                        {event.eventId || "—"}
                      </span>
                    </td>
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
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#D26600" }}>{event.eventName?.[0] || 'D'}</span>
                          </div>
                        )}
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{event.eventName || "Untitled Draft"}</p>
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
                    <td style={{ ...S.td, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{event.user?.name || "—"}</td>
                    <td style={S.td}>{event.user?.email || "—"}</td>
                    <td style={S.td}>{event.updatedAt ? dayjs(event.updatedAt).format("DD MMM YYYY, HH:mm") : "—"}</td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        {/* Remind */}
                        <button onClick={() => handleRemind(event)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #bfdbfe", background: "#eff6ff", color: "#2563eb", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, transition: "all 0.15s" }}
                          onMouseEnter={e => { e.currentTarget.style.background = "#dbeafe"; }}
                          onMouseLeave={e => { e.currentTarget.style.background = "#eff6ff"; }}>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 17H2a3 3 0 0 0 3-3V9a7 7 0 0 1 14 0v5a3 3 0 0 0 3 3zm-8.27 4a2 2 0 0 1-3.46 0"></path></svg>
                          Send Reminder
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

export default DraftEvents;
