import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import axios from "axios";
import Footer from "../components/Footer";
import { toast } from "../components/Popup";
import dayjs from "dayjs";

const Chip = ({ icon, label, value }) => (
  <div className="flex flex-col gap-0.5 bg-gray-50 hover:bg-orange-50 border border-gray-100 hover:border-orange-200 rounded-xl p-2 transition-all">
    <div className="flex items-center gap-1">
      <span className="text-sm">{icon}</span>
      <span style={{ fontSize: "9px", letterSpacing: "0.08em" }} className="text-gray-400 uppercase font-bold">{label}</span>
    </div>
    <p className="text-gray-900 font-bold text-sm pl-5 leading-snug truncate">{value || "—"}</p>
  </div>
);

const SectionTitle = ({ children }) => (
  <h2 style={{ fontFamily: "inherit", fontSize: "1rem", fontWeight: 700, color: "#111", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "8px" }}>
    <span style={{ width: 3, height: 18, background: "#D26600", borderRadius: 4, display: "inline-block", flexShrink: 0 }} />
    {children}
  </h2>
);

const Event = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const res = await axios.get(`${url}events/${id}`, { headers });
        setEvent(res.data.data || res.data.event);
      } catch (err) {
        toast(err.response?.data?.message || "Failed to fetch event.", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id]);

  const handleCopy = () => {
    toast("Event URL copied!", "info");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPosterUrl = (p) =>
    !p ? null : p.startsWith("http") ? p : `${url?.replace("/api/", "")}${p}`;

  if (loading) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f8" }}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
        <div className="w-10 h-10 border-4 border-[#D26600] border-t-transparent rounded-full animate-spin" />
        <p style={{ color: "#888", fontSize: "0.95rem", fontWeight: 500 }}>Loading event...</p>
      </div>
    </div>
  );

  if (!event) return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16, background: "#f7f7f8" }}>
      <p style={{ fontSize: "3rem" }}>🙏</p>
      <p style={{ color: "#555", fontSize: "1.1rem", fontWeight: 600 }}>Event not found</p>
      <Link to="/" style={{ background: "#D26600", color: "#fff", padding: "8px 24px", borderRadius: 999, fontSize: "0.875rem", fontWeight: 600, textDecoration: "none" }}>
        Go Home
      </Link>
    </div>
  );

  const poster = getPosterUrl(event.eventPosters?.[0]);
  const isFree = !event.eventPrice || event.eventPrice === "0";
  const address = [event.eventAddress, event.landmark, event.city, event.province, event.country]
    .filter(Boolean).join(", ");

  return (
    <div style={{ minHeight: "100vh", background: "#f4f4f5", display: "flex", flexDirection: "column" }}>

      {/* HERO */}
      <div style={{ position: "relative", width: "100%", height: "52vh", minHeight: 300, overflow: "hidden" }}>
        {poster
          ? <img src={poster} alt={event.eventName}
              onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
              style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.45)" }} />
          : null
        }
        <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #D26600, #f59e0b)", display: poster ? "none" : "flex", alignItems: "center", justifyContent: "center", position: poster ? "absolute" : "relative", inset: 0 }}>
          <span style={{ fontSize: "8rem", fontWeight: 900, color: "rgba(255,255,255,0.3)", lineHeight: 1 }}>{event.eventName?.[0]?.toUpperCase()}</span>
        </div>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)" }} />

        <button onClick={() => window.history.length > 1 ? window.history.back() : window.close()}
          style={{ position: "absolute", top: 20, left: 20, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 999, fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}>
          ← Back
        </button>
        <button onClick={handleCopy}
          style={{ position: "absolute", top: 20, right: 20, background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", color: "#fff", border: "none", padding: "7px 16px", borderRadius: 999, fontSize: "0.8rem", cursor: "pointer", fontWeight: 500 }}>
          {copied ? "✓ Copied!" : "⎘ Share"}
        </button>

        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 24px 28px" }}>
          <div style={{ maxWidth: 960, margin: "0 auto" }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              {event.eventCategory?.map((cat, i) => (
                <span key={i} style={{ background: "#D26600", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "3px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  {cat}
                </span>
              ))}
              {event.approved && (
                <span style={{ background: "#22c55e", color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "3px 12px", borderRadius: 999, textTransform: "uppercase", letterSpacing: "0.06em" }}>
                  ✓ Approved
                </span>
              )}
            </div>
            <h1 style={{ color: "#fff", fontSize: "clamp(1.6rem, 4vw, 2.8rem)", fontWeight: 800, lineHeight: 1.2, margin: 0, textShadow: "0 2px 12px rgba(0,0,0,0.4)" }}>
              {event.eventName}
            </h1>
            <p style={{ color: "rgba(255,255,255,0.75)", marginTop: 8, fontSize: "0.875rem" }}>
              📅 {dayjs(event.startDate).format("ddd, DD MMM YYYY")}
              {event.startTime && ` • ${event.startTime}`}
              {event.city && ` • 📍 ${event.city}`}
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ maxWidth: 960, margin: "0 auto", width: "100%", padding: "24px 16px", display: "grid", gridTemplateColumns: "1fr", gap: 20 }}
        className="lg:grid-cols-[1fr_300px]">

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* About */}
          {event.eventDesc && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <SectionTitle>About This Event</SectionTitle>
              <p style={{ color: "#222", fontSize: "0.9rem", lineHeight: 1.75, whiteSpace: "pre-wrap", margin: 0 }}>{event.eventDesc}</p>
            </div>
          )}

          {/* Details */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <SectionTitle>Event Details</SectionTitle>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <Chip icon="📅" label="Starts" value={`${dayjs(event.startDate).format("DD MMM YYYY")}${event.startTime ? " • " + event.startTime : ""}`} />
              <Chip icon="🏁" label="Ends" value={`${dayjs(event.endDate).format("DD MMM YYYY")}${event.endTime ? " • " + event.endTime : ""}`} />
              <Chip icon="🎙️" label="Performer" value={event.performerName} />
              <Chip icon="🧑‍💼" label="Host" value={event.hostName} />
              <Chip icon="🗣️" label="Language" value={event.eventLang} />
              <Chip icon="👥" label="Attendees" value={event.noOfAttendees} />
              {event.sponserName && <Chip icon="🤝" label="Sponsor" value={event.sponserName} />}
              {event.city && <Chip icon="📍" label="City" value={`${event.city}${event.province ? ", " + event.province : ""}`} />}
              <Chip icon="🎟️" label="Entry" value={isFree ? "Free" : `₹${event.eventPrice}`} />
            </div>
            {event.hostWhatsapp && (
              <a href={`https://wa.me/91${event.hostWhatsapp}`} target="_blank" rel="noopener noreferrer"
                style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 12, padding: "10px 14px", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem" }}>💬</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: "9px", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>WhatsApp Contact</p>
                  <p style={{ color: "#15803d", fontWeight: 700, fontSize: "0.875rem", margin: 0 }}>+91 {event.hostWhatsapp}</p>
                </div>
                <span style={{ color: "#22c55e", fontWeight: 700 }}>→</span>
              </a>
            )}
          </div>

          {/* Sub Events */}
          {event.subEvents?.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <SectionTitle>Programme Schedule</SectionTitle>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {event.subEvents.map((sub, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "12px 14px", background: "#fff7ed", borderRadius: 12, border: "1px solid #fed7aa" }}>
                    <div style={{ width: 28, height: 28, background: "#D26600", color: "#fff", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.8rem", fontWeight: 700, flexShrink: 0 }}>
                      {i + 1}
                    </div>
                    <div>
                      <p style={{ fontWeight: 700, color: "#111", fontSize: "0.9rem", margin: 0 }}>{sub.title}</p>
                      {sub.detail && <p style={{ color: "#666", fontSize: "0.8rem", margin: "2px 0 0" }}>{sub.detail}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Gallery */}
          {event.eventPosters?.length > 1 && (
            <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <SectionTitle>Gallery</SectionTitle>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {event.eventPosters.map((p, i) => {
                  const src = getPosterUrl(p);
                  return (
                    <div key={i} style={{ position: "relative", borderRadius: 12, overflow: "hidden", width: "100%", height: 130, background: "linear-gradient(135deg, #D26600, #f59e0b)" }}>
                      <img src={src} alt={`poster-${i}`}
                        onError={e => { e.target.style.display='none'; }}
                        style={{ width: "100%", height: "100%", objectFit: "cover", cursor: "pointer", transition: "transform 0.2s", position: "absolute", inset: 0 }}
                        onMouseEnter={e => e.target.style.transform="scale(1.04)"}
                        onMouseLeave={e => e.target.style.transform="scale(1)"} />
                      <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.5rem", fontWeight: 900, color: "rgba(255,255,255,0.4)", zIndex: 0 }}>
                        {event.eventName?.[0]?.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Location */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "20px 24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <SectionTitle>📍 Location</SectionTitle>
            <p style={{ color: "#222", fontSize: "0.875rem", marginBottom: 12 }}>{address || "Location not specified"}</p>
            {event.city && (
              <div style={{ borderRadius: 12, overflow: "hidden", height: 200, boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
                <iframe width="100%" height="100%" frameBorder="0" style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCL1tHqIArMfMJUICjD0feQQbl-yNLx3SY&q=${encodeURIComponent(address)}`}
                  allowFullScreen loading="lazy" title="Event Location" />
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: "16px", boxShadow: "0 2px 12px rgba(0,0,0,0.08)", position: "sticky", top: 16, display: "flex", flexDirection: "column", gap: 10 }}>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <p style={{ fontSize: "0.65rem", color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, margin: 0 }}>Entry</p>
                <p style={{ fontSize: "1.6rem", fontWeight: 800, color: "#111", margin: 0, lineHeight: 1.2 }}>
                  {isFree ? "FREE" : `₹${event.eventPrice}`}
                </p>
              </div>
              <span style={{ fontSize: "0.7rem", fontWeight: 700, padding: "4px 10px", borderRadius: 999, background: event.approved ? "#dcfce7" : "#fef3c7", color: event.approved ? "#15803d" : "#92400e" }}>
                {event.approved ? "✓ Approved" : "⏳ Pending"}
              </span>
            </div>

            <div style={{ borderTop: "1px solid #f3f4f6", paddingTop: 8, display: "flex", flexDirection: "column", gap: 5 }}>
              {[
                { icon: "📅", val: dayjs(event.startDate).format("DD MMM YYYY") },
                event.startTime && { icon: "🕐", val: event.startTime },
                event.city && { icon: "📍", val: `${event.city}${event.province ? `, ${event.province}` : ""}` },
                event.eventLang && { icon: "🗣️", val: event.eventLang },
              ].filter(Boolean).map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: "0.8rem", color: "#222" }}>
                  <span>{item.icon}</span><span style={{ fontWeight: 500 }}>{item.val}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8, borderTop: "1px solid #f3f4f6", paddingTop: 10 }}>
              <button onClick={() => navigate("/booking", { state: { event } })}
                style={{ width: "100%", background: "#D26600", color: "#fff", border: "none", padding: "12px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(210,102,0,0.3)", transition: "background 0.2s" }}
                onMouseEnter={e => e.target.style.background = "#b85a00"}
                onMouseLeave={e => e.target.style.background = "#D26600"}>
                🎟️ Book Now
              </button>
              <button onClick={handleCopy}
                style={{ width: "100%", background: "transparent", color: "#D26600", border: "2px solid #D26600", padding: "9px", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }}
                onMouseEnter={e => e.target.style.background = "#fff7ed"}
                onMouseLeave={e => e.target.style.background = "transparent"}>
                {copied ? "✓ Link Copied!" : "⎘ Share Event"}
              </button>
              {event.hostWhatsapp && (
                <a href={`https://wa.me/91${event.hostWhatsapp}`} target="_blank" rel="noopener noreferrer"
                  style={{ width: "100%", background: "#22c55e", color: "#fff", padding: "9px", borderRadius: 12, fontSize: "0.8rem", fontWeight: 600, textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, transition: "background 0.2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#16a34a"}
                  onMouseLeave={e => e.currentTarget.style.background = "#22c55e"}>
                  💬 Contact on WhatsApp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer group="/group1.svg" facebook="/facebook.svg" twitter="/twitter.svg"
        linkedin="/linkedin.svg" group1="/group1.svg" footerAlignSelf="stretch" footerWidth="unset" />
    </div>
  );
};

export default Event;
