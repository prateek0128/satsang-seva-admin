import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", alignItems: "center", gap: "16px", marginBottom: "32px" },
  backBtn: { background: "#fff", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: "8px" },
  grid: { display: "grid", gridTemplateColumns: "320px 1fr", gap: "24px" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  profileSection: { textAlign: "center", marginBottom: "24px" },
  avatar: { width: "120px", height: "120px", borderRadius: "50%", margin: "0 auto 16px", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", objectFit: "cover", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #D26600, #f59e0b)", color: "#fff", fontSize: "3rem", fontWeight: 700 },
  name: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 4px" },
  type: { fontSize: "0.875rem", fontWeight: 600, color: "#D26600", textTransform: "uppercase", letterSpacing: "0.05em" },
  infoGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" },
  infoBox: { marginBottom: "20px" },
  label: { fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px", display: "block" },
  value: { fontSize: "0.95rem", color: "#334155", fontWeight: 500 },
  fieldBox: { padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#334155", fontSize: "0.95rem", fontWeight: 500 },
  sectionTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" },
  badge: (active) => ({ padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700, background: active ? "#f0fdf4" : "#fef2f2", color: active ? "#166534" : "#991b1b" }),
  socialIcon: { width: "32px", height: "32px", borderRadius: "8px", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.2s" }
};

const UserDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const userRes = await axios.get(`${url}admin/user/${id}`, { headers });
        const userData = userRes.data.user;
        setUser(userData);
        try {
          const eventsRes = await axios.get(`${url}events`, { headers, params: { user: id, limit: 100 } });
          const rawData = eventsRes.data.data || eventsRes.data;
          const eventsList = rawData.events || rawData;
          const userEvents = Array.isArray(eventsList) ? eventsList.filter(e => (e.user?._id || e.user) === id) : [];
          setEvents(userEvents);
        } catch (ee) { console.error("Events fetch error:", ee); }
      } catch (e) {
        toast("Error fetching user details", "error");
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id, url]);

  if (loading) return <Loader />;
  if (!user) return <div style={S.container}>User not found</div>;

  const address = user.address || {};
  const isParticipant = (!user.userType || user.userType.toLowerCase() === 'participant') && (!user.profileType || user.profileType.toLowerCase() === 'participant') && (!user.performerType || user.performerType === 'None');

  return (
    <div style={S.container}>
      <div style={S.header}>
        <div style={{ flex: 1 }}>
          <button style={S.backBtn} onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            Back to Users
          </button>
        </div>
      </div>

      <div style={S.grid}>
        {/* LEFT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={S.card}>
            <div style={S.profileSection}>
              {user.profilePicture ? (
                <img src={user.profilePicture.startsWith('http') ? user.profilePicture : `${url.replace('/api/', '/')}/${user.profilePicture}`} alt={user.name} style={S.avatar} />
              ) : (
                <div style={S.avatar}>{(user.name || "?")[0].toUpperCase()}</div>
              )}
              <h2 style={{ ...S.name, marginBottom: "8px" }}>{user.name || "N/A"}</h2>
              <span style={S.type}>{user.userType || "Participant"}</span>
              <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginTop: "16px" }}>
                {/* <span style={S.badge(user.isVerified)}>
                  {user.isVerified ? "✓ Verified" : "Unverified"}
                </span> */}
                <span style={S.badge(user.profileProgress === 100)}>
                  {user.profileProgress}% Complete
                </span>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>Primary Information</h3>
            <div style={S.infoBox}>
              <span style={S.label}>Full Name</span>
              <div style={S.fieldBox}>{user.name || "—"}</div>
            </div>
            <div style={S.infoBox}>
              <span style={S.label}>Email Address</span>
              <div style={S.fieldBox}>{user.email || "—"}</div>
            </div>
            <div style={S.infoBox}>
              <span style={S.label}>Phone Number</span>
              <div style={S.fieldBox}>{user.phone || "—"}</div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>Account Stats</h3>
            <div style={{ display: "flex", gap: "8px", justifyContent: "space-between" }}>
              {!isParticipant && (
                <>
                  <div style={{ flex: 1, background: "#fff7ed", borderRadius: "12px", padding: "10px 4px", textAlign: "center", border: "1px solid #ffedd5" }}>
                    <div style={{ color: "#D26600", fontSize: "1.25rem", fontWeight: 800, marginBottom: "2px" }}>{events.length}</div>
                    <div style={{ color: "#9a3412", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Posts</div>
                  </div>
                  <div style={{ flex: 1, background: "#fff7ed", borderRadius: "12px", padding: "10px 4px", textAlign: "center", border: "1px solid #ffedd5" }}>
                    <div style={{ color: "#D26600", fontSize: "1.25rem", fontWeight: 800, marginBottom: "2px" }}>{user.subscribers?.length || 0}</div>
                    <div style={{ color: "#9a3412", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Subscribers</div>
                  </div>
                </>
              )}
              <div style={{ flex: 1, background: "#fff7ed", borderRadius: "12px", padding: "10px 4px", textAlign: "center", border: "1px solid #ffedd5" }}>
                <div style={{ color: "#D26600", fontSize: "1.25rem", fontWeight: 800, marginBottom: "2px" }}>{user.subscriptions?.length || 0}</div>
                <div style={{ color: "#9a3412", fontSize: "0.65rem", fontWeight: 700, textTransform: "uppercase" }}>Following</div>
              </div>
            </div>
          </div>

          {!isParticipant && (
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Social Presence</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                {user.socialLinks && Object.entries(user.socialLinks).some(([_, link]) => link) ? (
                  Object.entries(user.socialLinks).map(([platform, link]) => (
                    link && (
                      <a key={platform} href={link.startsWith('http') ? link : `https://${link}`} target="_blank" rel="noreferrer" 
                         style={{ ...S.socialIcon, width: "auto", padding: "0 16px", background: "#f8fafc", border: "1px solid #e2e8f0", textDecoration: "none" }} title={platform}>
                        <span style={{ fontSize: "0.8rem", fontWeight: 700, textTransform: "uppercase", color: "#475569" }}>{platform}</span>
                      </a>
                    )
                  ))
                ) : (
                  <div style={{ ...S.value, color: "#94a3b8", fontSize: "0.85rem", fontStyle: "italic" }}>No social links provided.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Profile Overview</h3>
            <div style={S.infoGrid}>
              <div style={S.infoBox}>
                <span style={S.label}>Profile Type</span>
                <div style={S.fieldBox}>{user.profileType || "—"}</div>
              </div>
              <div style={S.infoBox}>
                <span style={S.label}>Performer Type</span>
                <div style={S.fieldBox}>{user.performerType || "None"}</div>
              </div>
              <div style={S.infoBox}>
                <span style={S.label}>Joined Date</span>
                <div style={S.fieldBox}>{user.createdAt ? dayjs(user.createdAt).format("DD MMM YYYY, hh:mm A") : "—"}</div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>About / Bio</h3>
            <div style={{ ...S.fieldBox, lineHeight: "1.6", whiteSpace: "pre-wrap", minHeight: "60px" }}>
              {user.bio || "No bio provided."}
            </div>
          </div>

          {user.interests && user.interests.length > 0 && (
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Interests / Categories</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {user.interests.map((it, idx) => (
                  <span key={idx} style={{ background: "#fff7ed", color: "#c2410c", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid #ffedd5" }}>
                    Category {it}
                  </span>
                ))}
              </div>
            </div>
          )}

          {events.length > 0 && (
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Events Created ({events.length})</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {events.map((ev, idx) => (
                  <div key={idx} style={{ padding: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "10px", cursor: "pointer" }} 
                       onClick={() => navigate(`/admin/updateevent/${ev._id}`)}>
                    <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>{ev.eventName}</div>
                    <div style={{ fontSize: "0.75rem", color: "#64748b", marginTop: "4px" }}>
                      {dayjs(ev.startDate).format("DD MMM YYYY")}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px" }}>
              <h3 style={{ ...S.sectionTitle, borderBottom: "none", margin: 0 }}>Address Detail</h3>
              {address.address1 && (
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${address.address1} ${address.city} ${address.state} ${address.pincode}`)}`} 
                   target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#D26600", fontWeight: 700, textDecoration: "none" }}>
                   📍 View on Map
                </a>
              )}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={S.label}>Address</span>
                <div style={S.fieldBox}>{address.address1 || "—"}</div>
              </div>
              <div>
                <span style={S.label}>Address 2</span>
                <div style={S.fieldBox}>{address.address2 || "—"}</div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={S.label}>City</span>
                  <div style={S.fieldBox}>{address.city || "—"}</div>
                </div>
                <div>
                  <span style={S.label}>State</span>
                  <div style={S.fieldBox}>{address.state || "—"}</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <span style={S.label}>Postal Code</span>
                  <div style={S.fieldBox}>{address.pincode || "—"}</div>
                </div>
                <div>
                  <span style={S.label}>Country</span>
                  <div style={S.fieldBox}>{address.country || "—"}</div>
                </div>
              </div>
              <div>
                <span style={S.label}>GPS Coordinates</span>
                <div style={{ ...S.fieldBox, background: "#fff7ed", border: "1px solid #ffedd5", color: "#D26600", fontWeight: 700, fontFamily: "monospace" }}>
                  {user.lat && user.lng ? `${user.lat}, ${user.lng}` : (user.geoCoordinates?.coordinates ? `${user.geoCoordinates.coordinates[1]}, ${user.geoCoordinates.coordinates[0]}` : "—")}
                </div>
              </div>
            </div>
          </div>

          {user.documents && user.documents.length > 0 && (
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Documents</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                {user.documents.map((doc, idx) => (
                  <div key={idx} style={{ padding: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "10px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ background: "#eff6ff", color: "#2563eb", width: "32px", height: "32px", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      📄
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b" }}>{doc.name || `Document ${idx+1}`}</div>
                      <a href={doc.uri} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>View File</a>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetails;
