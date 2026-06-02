import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate, useParams } from "react-router-dom";
import { toast, confirmDialog } from "../components/Popup";
import Loader from "../components/Loader";

const Badge = ({ children, bg, color }) => (
  <span style={{ padding: "4px 14px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700, background: bg, color, textTransform: "uppercase", letterSpacing: "0.06em", display: "inline-block" }}>
    {children}
  </span>
);

const StatCard = ({ icon, label, value, color, bg }) => (
  <div style={{ background: bg, borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 16, border: `1px solid ${bg === "#fff" ? "#e2e8f0" : "transparent"}` }}>
    <div style={{ width: 48, height: 48, borderRadius: 14, background: color + "20", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", flexShrink: 0 }}>{icon}</div>
    <div>
      <p style={{ margin: 0, fontSize: "1.6rem", fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
      <p style={{ margin: "4px 0 0", fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</p>
    </div>
  </div>
);

const SectionCard = ({ title, children }) => (
  <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
    <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 4, height: 20, background: "linear-gradient(180deg,#D26600,#f59e0b)", borderRadius: 4 }} />
      <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em" }}>{title}</p>
    </div>
    <div style={{ padding: "20px 24px" }}>{children}</div>
  </div>
);

const InfoItem = ({ icon, label, value }) => {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 14, padding: "12px 0", borderBottom: "1px solid #f8fafc" }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>{icon}</div>
      <div>
        <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
        <p style={{ margin: "3px 0 0", fontSize: "0.9rem", fontWeight: 600, color: "#0f172a", wordBreak: "break-word" }}>{value}</p>
      </div>
    </div>
  );
};

const ViewEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${url}events/${id}`, { headers: { Authorization: `Bearer ${token}` } });
        setEvent(res.data.data || res.data.event || res.data);
      } catch {
        toast("Failed to load event", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, url]);

  const handleApprove = async () => {
    const ok = await confirmDialog(`Approve "${event.eventName}"?`);
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${url}admin/events/approve/${event._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEvent(prev => ({ ...prev, approved: true }));
      toast("Event approved", "success");
    } catch { toast("Approval failed", "error"); }
  };

  const handleReject = async () => {
    const ok = await confirmDialog(`Reject "${event.eventName}"?`);
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${url}admin/events/reject/${event._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEvent(prev => ({ ...prev, approved: false }));
      toast("Event rejected", "info");
    } catch { toast("Rejection failed", "error"); }
  };

  const handleTogglePopular = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${url}admin/events/${event._id}/toggle-popular`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setEvent(prev => ({ ...prev, isPopular: res.data.data.isPopular }));
      toast(res.data.data.isPopular ? "Marked as Popular ⭐" : "Removed from Popular", "success");
    } catch { toast("Failed to update popularity", "error"); }
  };

  if (loading) return <Loader />;
  if (!event) return <div style={{ padding: 40, textAlign: "center", color: "#94a3b8" }}>Event not found.</div>;

  const getPosterUrl = (p) => !p ? null : p.startsWith("http") ? p : `${url?.replace("/api/", "/")}${p}`;
  const poster = getPosterUrl(event.eventPosters?.[0]);
  const isFree = !event.eventPrice || event.eventPrice === "0";
  const isPast = event.endDate ? dayjs(event.endDate).isBefore(dayjs()) : false;
  const fullAddress = [event.eventAddress, event.landmark, event.city, event.province, event.country].filter(Boolean).join(", ");

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Hero Banner ── */}
      <div style={{ position: "relative", height: 360, overflow: "hidden", background: "linear-gradient(135deg, #D26600 0%, #f59e0b 100%)" }}>
        {poster && (
          <img src={poster} alt={event.eventName}
            onError={e => e.target.style.display = "none"}
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.35)" }} />
        )}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)" }} />

        {/* Top bar */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "20px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <button onClick={() => navigate(-1)} style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>
            Back to Events
          </button>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => window.open(`/event/${event._id}`, "_blank")} style={{ display: "flex", alignItems: "center", gap: 7, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
              Public View
            </button>
            <button onClick={() => navigate(`/admin/updateevent/${event._id}`)} style={{ display: "flex", alignItems: "center", gap: 7, background: "linear-gradient(135deg,#D26600,#f59e0b)", border: "none", color: "#fff", padding: "10px 18px", borderRadius: 12, cursor: "pointer", fontWeight: 700, fontSize: "0.85rem", boxShadow: "0 4px 14px rgba(210,102,0,0.4)" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Edit Event
            </button>
          </div>
        </div>

        {/* Hero Content */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 40px 36px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 14 }}>
            {event.eventCategory?.map((cat, i) => <Badge key={i} bg="#D26600" color="#fff">{cat}</Badge>)}
            <Badge bg={event.approved ? "#16a34a" : "#f59e0b"} color="#fff">{event.approved ? "✓ Approved" : "⏳ Pending"}</Badge>
            {isPast && <Badge bg="#475569" color="#fff">Past Event</Badge>}
            {event.isPopular && <Badge bg="#7c3aed" color="#fff">⭐ Popular</Badge>}
            <Badge bg={isFree ? "#15803d" : "#b45309"} color="#fff">{isFree ? "FREE ENTRY" : `₹${event.eventPrice}`}</Badge>
          </div>
          <h1 style={{ margin: 0, color: "#fff", fontSize: "2.2rem", fontWeight: 900, lineHeight: 1.2, textShadow: "0 2px 16px rgba(0,0,0,0.5)", maxWidth: 700 }}>{event.eventName}</h1>
          <div style={{ display: "flex", gap: 20, marginTop: 12, flexWrap: "wrap" }}>
            {event.hostName && <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6 }}>🧑‍💼 {event.hostName}</span>}
            {event.city && <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6 }}>📍 {event.city}{event.country ? `, ${event.country}` : ""}</span>}
            {event.startDate && <span style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", display: "flex", alignItems: "center", gap: 6 }}>📅 {dayjs(event.startDate).format("DD MMM YYYY")}</span>}
            <span style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>ID: {event.eventId || event._id?.slice(-8)}</span>
          </div>
        </div>
      </div>

      {/* ── Main Content ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "36px 40px" }}>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 32 }}>
          <StatCard icon="👁️" label="Total Views" value={event.viewCount || 0} color="#1e40af" bg="#eff6ff" />
          <StatCard icon="🎟️" label="Bookings" value={event.bookings?.length || 0} color="#7c3aed" bg="#f5f3ff" />
          <StatCard icon="💰" label="Entry Fee" value={isFree ? "FREE" : `₹${event.eventPrice}`} color={isFree ? "#15803d" : "#D26600"} bg={isFree ? "#f0fdf4" : "#fff7ed"} />
          <StatCard icon="📅" label="Duration" value={event.startDate && event.endDate ? `${dayjs(event.endDate).diff(dayjs(event.startDate), "day") + 1} Days` : "1 Day"} color="#0369a1" bg="#f0f9ff" />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 24, alignItems: "start" }}>

          {/* Left Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* About */}
            {event.eventDesc && (
              <SectionCard title="About this Event">
                <p style={{ margin: 0, fontSize: "0.95rem", color: "#334155", lineHeight: 1.8, whiteSpace: "pre-wrap" }}>{event.eventDesc}</p>
              </SectionCard>
            )}

            {/* Date & Time */}
            <SectionCard title="Date & Schedule">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div style={{ background: "#fff7ed", borderRadius: 14, padding: "18px 20px", border: "1px solid #fed7aa" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 700, color: "#D26600", textTransform: "uppercase", letterSpacing: "0.06em" }}>🗓️ Start Date</p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{event.startDate ? dayjs(event.startDate).format("ddd, DD MMM YYYY") : "—"}</p>
                  {event.startTime && <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#D26600", fontWeight: 600 }}>⏰ {event.startTime}</p>}
                </div>
                <div style={{ background: "#f0fdf4", borderRadius: 14, padding: "18px 20px", border: "1px solid #bbf7d0" }}>
                  <p style={{ margin: "0 0 6px", fontSize: "0.68rem", fontWeight: 700, color: "#15803d", textTransform: "uppercase", letterSpacing: "0.06em" }}>🏁 End Date</p>
                  <p style={{ margin: 0, fontSize: "1rem", fontWeight: 800, color: "#0f172a" }}>{event.endDate ? dayjs(event.endDate).format("ddd, DD MMM YYYY") : "—"}</p>
                  {event.endTime && <p style={{ margin: "4px 0 0", fontSize: "0.85rem", color: "#15803d", fontWeight: 600 }}>⏰ {event.endTime}</p>}
                </div>
              </div>
            </SectionCard>

            {/* Programme Schedule */}
            {event.subEvents?.filter(s => s.title).length > 0 && (
              <SectionCard title="Programme Schedule">
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {event.subEvents.filter(s => s.title).map((sub, i) => (
                    <div key={i} style={{ display: "flex", gap: 16, padding: "14px 18px", background: i % 2 === 0 ? "#fffbf5" : "#f8fafc", borderRadius: 12, border: "1px solid #f1f5f9" }}>
                      <div style={{ width: 32, height: 32, background: "linear-gradient(135deg,#D26600,#f59e0b)", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                      <div>
                        <p style={{ margin: 0, fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>{sub.title}</p>
                        {sub.detail && <p style={{ margin: "4px 0 0", fontSize: "0.82rem", color: "#64748b" }}>{sub.detail}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </SectionCard>
            )}

            {/* Posters */}
            {event.eventPosters?.length > 0 && (
              <SectionCard title={`Event Posters (${event.eventPosters.length})`}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                  {event.eventPosters.map((p, i) => {
                    const src = getPosterUrl(p);
                    return (
                      <div key={i} onClick={() => window.open(src, "_blank")} style={{ borderRadius: 12, overflow: "hidden", height: 140, cursor: "pointer", background: "linear-gradient(135deg,#D26600,#f59e0b)", position: "relative", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <img src={src} alt={`poster-${i}`} onError={e => e.target.style.display = "none"}
                          style={{ width: "100%", height: "100%", objectFit: "cover", transition: "transform 0.3s" }}
                          onMouseEnter={e => e.target.style.transform = "scale(1.08)"}
                          onMouseLeave={e => e.target.style.transform = "scale(1)"} />
                        <div style={{ position: "absolute", bottom: 6, right: 8, background: "rgba(0,0,0,0.5)", color: "#fff", fontSize: "0.65rem", padding: "2px 8px", borderRadius: 20, fontWeight: 600 }}>View</div>
                      </div>
                    );
                  })}
                </div>
              </SectionCard>
            )}
          </div>

          {/* Right Column */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* Quick Actions */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
              <div style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 4, height: 20, background: "linear-gradient(180deg,#D26600,#f59e0b)", borderRadius: 4 }} />
                <p style={{ margin: 0, fontSize: "0.78rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.08em" }}>Quick Actions</p>
              </div>
              <div style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
                <button onClick={() => navigate(`/admin/updateevent/${event._id}`)} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#D26600,#f59e0b)", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, boxShadow: "0 4px 14px rgba(210,102,0,0.3)" }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                  Edit Event
                </button>
                {!event.approved ? (
                  <button onClick={handleApprove} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "none", background: "#15803d", color: "#fff", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                    Approve Event
                  </button>
                ) : (
                  <button onClick={handleReject} style={{ width: "100%", padding: "13px", borderRadius: 12, border: "1px solid #fca5a5", background: "#fef2f2", color: "#ef4444", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                    Reject Event
                  </button>
                )}
                <button onClick={handleTogglePopular} style={{ width: "100%", padding: "13px", borderRadius: 12, border: `1px solid ${event.isPopular ? "#fde68a" : "#e2e8f0"}`, background: event.isPopular ? "#fffbeb" : "#f8fafc", color: event.isPopular ? "#d97706" : "#64748b", fontWeight: 700, fontSize: "0.9rem", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                  {event.isPopular ? "★ Unmark Popular" : "☆ Mark as Popular"}
                </button>
              </div>
            </div>

            {/* Event Details */}
            <SectionCard title="Event Details">
              <InfoItem icon="🎙️" label="Performer" value={event.performerName} />
              <InfoItem icon="🧑‍💼" label="Host" value={event.hostName} />
              <InfoItem icon="📱" label="Host WhatsApp" value={event.hostWhatsapp ? `+91 ${event.hostWhatsapp}` : null} />
              <InfoItem icon="🤝" label="Sponsor" value={event.sponserName} />
              <InfoItem icon="🗣️" label="Language" value={event.eventLang} />
              <InfoItem icon="👥" label="Expected Attendees" value={event.noOfAttendees} />
              <InfoItem icon="🔒" label="Visibility" value={event.visibility} />
              {event.eventLink && (
                <div style={{ display: "flex", gap: 14, padding: "12px 0" }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>🔗</div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Event Link</p>
                    <a href={event.eventLink} target="_blank" rel="noopener noreferrer" style={{ fontSize: "0.85rem", fontWeight: 600, color: "#2563eb", wordBreak: "break-all" }}>{event.eventLink}</a>
                  </div>
                </div>
              )}
            </SectionCard>

            {/* Location */}
            {fullAddress && (
              <SectionCard title="Location">
                <div style={{ display: "flex", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", flexShrink: 0 }}>📍</div>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "#334155", lineHeight: 1.6, fontWeight: 500 }}>{fullAddress}</p>
                </div>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`} target="_blank" rel="noopener noreferrer"
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 7, padding: "10px", borderRadius: 10, background: "#eff6ff", color: "#1d4ed8", fontWeight: 700, fontSize: "0.82rem", textDecoration: "none", border: "1px solid #bfdbfe" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                  Open in Google Maps
                </a>
              </SectionCard>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewEvent;
