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

const PendingHosts = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => { fetchPendingHosts(); }, [url]);

  const fetchPendingHosts = async () => {
    try {
      const res = await axios.get(`${url}admin/host-approvals-pending`, { headers: getHeaders() });
      setHosts(res.data.data?.users || []);
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    } finally { setLoading(false); }
  };

  const handleApprove = async (host) => {
    const ok = await confirmDialog(`Approve host "${host.name}"?`);
    if (!ok) return;
    try {
      await axios.put(`${url}admin/approve-host/${host._id}`, {}, { headers: getHeaders() });
      setHosts(hosts.filter(h => h._id !== host._id));
      toast("Host approved successfully", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleReject = async (host) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      await axios.put(`${url}admin/reject-host/${host._id}`, { reason }, { headers: getHeaders() });
      setHosts(hosts.filter(h => h._id !== host._id));
      toast("Host rejected", "info");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  return (
    <div style={S.page}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
          <h1 style={{ margin: 0, fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Pending Host Approvals</h1>
          {hosts.length > 0 && (
            <span style={{ fontSize: "0.7rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", padding: "2px 8px", borderRadius: 6 }}>
              {hosts.length} pending
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>Review and approve host profile submissions</p>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Loading pending hosts...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Host", "Type", "Email", "Phone", "Location", "Submitted", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {hosts.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ ...S.td, textAlign: "center", padding: "48px 16px" }}>
                       <p style={{ margin: 0, fontWeight: 600, color: "#94a3b8", fontSize: "0.875rem" }}>No hosts pending approval</p>
                    </td>
                  </tr>
                ) : hosts.map(host => (
                  <tr key={host._id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.12s" }}>
                    <td style={{ ...S.td, maxWidth: 200 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                          {host.profilePicture ? (
                             <img src={host.profilePicture.startsWith("http") ? host.profilePicture : `${url.replace("/api/", "")}${host.profilePicture}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                             <span style={{ fontWeight: 700, color: "#D26600" }}>{host.name?.[0]}</span>
                          )}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <p style={{ margin: 0, fontWeight: 600, color: "#0f172a" }}>{host.name || "—"}</p>
                          <p style={{ margin: 0, fontSize: "0.7rem", color: "#94a3b8" }}>{host.profileType}</p>
                        </div>
                      </div>
                    </td>
                    <td style={S.td}>
                      <span style={{ fontSize: "0.7rem", fontWeight: 600, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", borderRadius: 6, padding: "2px 8px", textTransform: "capitalize" }}>
                        {host.performerType || "Host"}
                      </span>
                    </td>
                    <td style={S.td}>{host.email || "—"}</td>
                    <td style={S.td}>{host.phone || "—"}</td>
                    <td style={S.td}>{host.address?.city || host.address?.state || "—"}</td>
                    <td style={S.td}>{dayjs(host.createdAt).format("DD MMM YYYY")}</td>
                    <td style={{ ...S.td, whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                        <button onClick={() => navigate(`/admin/userdetails/${host._id}`)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                          View
                        </button>
                        <button onClick={() => handleApprove(host)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #bbf7d0", background: "#f0fdf4", color: "#059669", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                          Approve
                        </button>
                        <button onClick={() => handleReject(host)}
                          style={{ padding: "5px 10px", borderRadius: 7, border: "1px solid #fecaca", background: "#fef2f2", color: "#dc2626", fontSize: "0.72rem", fontWeight: 700, cursor: "pointer" }}>
                          Reject
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

export default PendingHosts;
