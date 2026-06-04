import React, { useState } from "react";
import axios from "axios";

const S = {
  page: { minHeight: "100vh", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px", fontFamily: "'Inter',-apple-system,sans-serif" },
  card: { background: "#fff", borderRadius: 16, border: "1px solid #e2e8f0", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", padding: "40px 36px", width: "100%", maxWidth: 480 },
  label: { display: "block", fontSize: "0.8rem", fontWeight: 600, color: "#374151", marginBottom: 6 },
  input: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "inherit" },
  textarea: { width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #d1d5db", fontSize: "0.875rem", color: "#111827", outline: "none", boxSizing: "border-box", fontFamily: "inherit", resize: "vertical", minHeight: 90 },
  btn: (disabled) => ({ width: "100%", padding: "11px", borderRadius: 8, border: "none", background: disabled ? "#e5e7eb" : "#ef4444", color: disabled ? "#9ca3af" : "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: disabled ? "not-allowed" : "pointer", fontFamily: "inherit", transition: "background 0.15s" }),
};

const DeleteAccountRequest = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle | success | error
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setStatus("idle");
    try {
      await axios.post(`${url}auth/request-delete-account`, { phone, reason });
      setStatus("success");
      setMessage("Your account deletion request has been submitted. We will process it within 30 days.");
      setPhone("");
      setReason("");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to submit request. Please try again or contact support@satsangseva.com");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.card}>

        {/* Icon + Title */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: "50%", background: "#fef2f2", marginBottom: 14 }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </div>
          <h1 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>Delete App Account</h1>
          <p style={{ margin: "8px 0 0", fontSize: "0.82rem", color: "#64748b", lineHeight: 1.6 }}>
            You can submit a request to delete your account and associated data for this app.
          </p>
        </div>

        {/* What gets deleted */}
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, padding: "14px 16px", marginBottom: 24 }}>
          <p style={{ margin: "0 0 8px", fontSize: "0.78rem", fontWeight: 700, color: "#991b1b" }}>What will be deleted:</p>
          {["Account and profile information", "Event bookings and history", "Created events and drafts", "Wishlist and subscriptions", "All personal data associated with your account"].map((item) => (
            <p key={item} style={{ margin: "3px 0", fontSize: "0.78rem", color: "#7f1d1d" }}>• {item}</p>
          ))}
        </div>

        {status === "success" ? (
          <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 10, padding: "16px", textAlign: "center" }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: 8 }}>
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {status === "error" && (
              <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: "0.8rem", color: "#dc2626" }}>
                {message}
              </div>
            )}
            <div style={{ marginBottom: 16 }}>
              <label style={S.label}>Registered Phone Number *</label>
              <input style={S.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91XXXXXXXXXX" maxLength={15} required />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={S.label}>Reason for deletion (optional)</label>
              <textarea style={S.textarea} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Tell us why you want to delete your account..." />
            </div>
            <button type="submit" style={S.btn(loading || !phone.trim())} disabled={loading || !phone.trim()}>
              {loading ? "Submitting..." : "Submit Deletion Request"}
            </button>
            <p style={{ textAlign: "center", fontSize: "0.75rem", color: "#94a3b8", marginTop: 14, marginBottom: 0 }}>
              For help, contact{" "}
              <a href="mailto:support@satsangseva.com" style={{ color: "#ef4444" }}>support@satsangseva.com</a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default DeleteAccountRequest;
