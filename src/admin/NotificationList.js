import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  title: { fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  sub: { margin: "0 0 20px", fontSize: "0.8rem", color: "#94a3b8" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden", marginBottom: 24 },
  sectionTitle: { padding: "14px 16px", borderBottom: "1px solid #e2e8f0", fontSize: "0.8rem", fontWeight: 700, color: "#0f172a", background: "#f8fafc", display: "flex", alignItems: "center", gap: 8 },
  badge: (color) => ({ fontSize: "0.65rem", fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: color + "18", color }),
  th: { padding: "11px 16px", background: "#f8fafc", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", textAlign: "left" },
  td: { padding: "12px 16px", fontSize: "0.82rem", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "top", whiteSpace: "nowrap" },
  typeBadge: (type) => ({
    padding: "3px 8px", borderRadius: 6, fontSize: "0.7rem", fontWeight: 700, textTransform: "uppercase",
    background: type === "broadcast" ? "#eff6ff" : type === "event_approved" ? "#f0fdf4" : type === "event_submitted" ? "#fff7ed" : type === "event_draft" ? "#f5f3ff" : type === "host_submitted" ? "#f0f9ff" : "#fef2f2",
    color: type === "broadcast" ? "#2563eb" : type === "event_approved" ? "#166534" : type === "event_submitted" ? "#D26600" : type === "event_draft" ? "#7c3aed" : type === "host_submitted" ? "#0369a1" : "#991b1b",
  }),
  pageBtn: (active) => ({ padding: "6px 14px", borderRadius: 8, border: "1px solid #e2e8f0", background: active ? "#D26600" : "#fff", color: active ? "#fff" : "#64748b", fontWeight: 600, cursor: "pointer", fontSize: "0.8rem" }),
};

const IconEye = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconClock = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUser = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconCalendar = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);
const IconFile = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);

const NotificationList = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [tab, setTab] = useState("sent");
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState({ pendingHosts: [], pendingEvents: [], draftEvents: [] });
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [sentTotal, setSentTotal] = useState(0);
  const [sentPage, setSentPage] = useState(1);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  useEffect(() => {
    const fetch = async () => {
      setLoadingSent(true);
      try {
        const res = await axios.get(`${url}admin/notifications`, { headers: getHeaders(), params: { page: sentPage, limit: 20 } });
        if (res.data.status === "success") { setSent(res.data.data.notifications); setSentTotal(res.data.data.total); }
      } catch { toast("Error fetching sent notifications", "error"); }
      finally { setLoadingSent(false); }
    };
    fetch();
  }, [sentPage, url]);

  useEffect(() => {
    if (tab !== "received") return;
    const fetch = async () => {
      setLoadingReceived(true);
      try {
        const res = await axios.get(`${url}admin/notifications/received`, { headers: getHeaders() });
        if (res.data.status === "success") setReceived(res.data.data);
      } catch { toast("Error fetching received notifications", "error"); }
      finally { setLoadingReceived(false); }
    };
    fetch();
  }, [tab, url]);

  const Pagination = ({ total, page, setPage }) => {
    const pages = Math.ceil(total / 20);
    if (pages <= 1) return null;
    return (
      <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 20 }}>
        {Array.from({ length: pages }).map((_, i) => (
          <button key={i} style={S.pageBtn(page === i + 1)} onClick={() => setPage(i + 1)}>{i + 1}</button>
        ))}
      </div>
    );
  };

  const totalReceived = received.pendingHosts.length + received.pendingEvents.length + received.draftEvents.length;

  return (
    <div style={S.container}>
      <h1 style={S.title}>Notification History</h1>
      <p style={S.sub}>Track all sent and received notifications</p>

      <div style={{ display: "flex", background: "#f1f5f9", padding: "4px", borderRadius: 10, gap: 4, marginBottom: 20, width: "fit-content" }}>
        {["sent", "received"].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "6px 20px", borderRadius: 8, border: "none", fontSize: "0.75rem", fontWeight: 700,
            cursor: "pointer", transition: "all 0.2s",
            background: tab === t ? "#fff" : "transparent",
            color: tab === t ? "#D26600" : "#64748b",
            boxShadow: tab === t ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
          }}>
            {t === "sent" ? "Sent Notifications" : `Received Notifications${totalReceived ? ` (${totalReceived})` : ""}`}
          </button>
        ))}
      </div>

      {tab === "sent" ? (
        <>
          <div style={S.card}>
            {loadingSent ? <div style={{ padding: 40, textAlign: "center" }}><Loader /></div> : (
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["User", "Type", "Title", "Message", "Date", "Status"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {sent.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", padding: 40, color: "#94a3b8" }}>No notifications sent</td></tr>
                    ) : sent.map(n => (
                      <tr key={n._id}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={S.td}>
                          <div style={{ fontWeight: 600 }}>{n.user?.name || "N/A"}</div>
                          <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{n.user?.userId || ""}</div>
                        </td>
                        <td style={S.td}><span style={S.typeBadge(n.type)}>{n.type}</span></td>
                        <td style={{ ...S.td, fontWeight: 700 }}>{n.title}</td>
                        <td style={{ ...S.td, maxWidth: 300, fontSize: "0.8rem", color: "#64748b" }}>{n.message}</td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }}>{dayjs(n.createdAt).format("DD MMM, hh:mm A")}</td>
                        <td style={S.td}>
                          {n.isRead
                            ? <span style={{ color: "#166534", fontWeight: 700, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}><IconEye /> Read</span>
                            : <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: "0.75rem", display: "flex", alignItems: "center", gap: 4 }}><IconClock /> Unread</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <Pagination total={sentTotal} page={sentPage} setPage={setSentPage} />
        </>
      ) : (
        loadingReceived ? <div style={{ padding: 40, textAlign: "center" }}><Loader /></div> : (
          <>
            {/* Pending Hosts */}
            <div style={S.card}>
              <div style={S.sectionTitle}>
                <IconUser /> Host Approval Requests
                <span style={S.badge("#d97706")}>{received.pendingHosts.length} pending</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Name", "Email", "Phone", "Profile Type", "Submitted"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {received.pendingHosts.length === 0 ? (
                      <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: 32, color: "#94a3b8" }}>No pending host approvals</td></tr>
                    ) : received.pendingHosts.map(h => (
                      <tr key={h._id}
                        onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <td style={{ ...S.td, fontWeight: 600 }}>{h.name || "—"}</td>
                        <td style={S.td}>{h.email || "—"}</td>
                        <td style={S.td}>{h.phone || "—"}</td>
                        <td style={S.td}>
                          <span style={{ fontSize: "0.7rem", fontWeight: 600, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", borderRadius: 6, padding: "2px 8px", textTransform: "capitalize" }}>
                            {h.performerType || h.profileType || "Host"}
                          </span>
                        </td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }}>{dayjs(h.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pending Events */}
            <div style={S.card}>
              <div style={S.sectionTitle}>
                <IconCalendar /> Event Approval Requests
                <span style={S.badge("#059669")}>{received.pendingEvents.length} pending</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Event ID", "Event Name", "Category", "Host", "Start Date", "Submitted"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {received.pendingEvents.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", padding: 32, color: "#94a3b8" }}>No pending event approvals</td></tr>
                    ) : received.pendingEvents.map(e => (
                      <tr key={e._id}
                        onMouseEnter={ev => ev.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                        <td style={S.td}><span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>{e.eventId || "—"}</span></td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{e.eventName}</td>
                        <td style={S.td}>
                          {e.eventCategory?.[0] && <span style={{ fontSize: "0.7rem", fontWeight: 600, background: "#fff7ed", color: "#D26600", border: "1px solid #fed7aa", borderRadius: 6, padding: "2px 8px" }}>{e.eventCategory[0]}</span>}
                        </td>
                        <td style={S.td}>{e.hostName || e.user?.name || "—"}</td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }}>{e.startDate ? dayjs(e.startDate).format("DD MMM YYYY") : "—"}</td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }}>{dayjs(e.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Draft Events */}
            <div style={S.card}>
              <div style={S.sectionTitle}>
                <IconFile /> Draft Events
                <span style={S.badge("#7c3aed")}>{received.draftEvents.length} drafts</span>
              </div>
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>{["Event ID", "Event Name", "Category", "Host", "Progress", "Last Updated"].map(h => <th key={h} style={S.th}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {received.draftEvents.length === 0 ? (
                      <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", padding: 32, color: "#94a3b8" }}>No draft events</td></tr>
                    ) : received.draftEvents.map(e => (
                      <tr key={e._id}
                        onMouseEnter={ev => ev.currentTarget.style.background = "#fafafa"}
                        onMouseLeave={ev => ev.currentTarget.style.background = "transparent"}>
                        <td style={S.td}><span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>{e.eventId || "—"}</span></td>
                        <td style={{ ...S.td, fontWeight: 600 }}>{e.eventName}</td>
                        <td style={S.td}>
                          {e.eventCategory?.[0] && <span style={{ fontSize: "0.7rem", fontWeight: 600, background: "#fff7ed", color: "#D26600", border: "1px solid #fed7aa", borderRadius: 6, padding: "2px 8px" }}>{e.eventCategory[0]}</span>}
                        </td>
                        <td style={S.td}>{e.hostName || e.user?.name || "—"}</td>
                        <td style={S.td}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                              <div style={{ width: `${e.formProgress || 0}%`, height: "100%", background: "#D26600", borderRadius: 3 }} />
                            </div>
                            <span style={{ fontSize: "0.72rem", fontWeight: 600, color: "#64748b" }}>{e.formProgress || 0}%</span>
                          </div>
                        </td>
                        <td style={{ ...S.td, whiteSpace: "nowrap" }}>{dayjs(e.updatedAt || e.createdAt).format("DD MMM YYYY, hh:mm A")}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )
      )}
    </div>
  );
};

export default NotificationList;
