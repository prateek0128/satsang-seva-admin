import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "32px" },
  backBtn: { background: "#fff", border: "1px solid #e2e8f0", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontSize: "0.875rem", fontWeight: 600, color: "#64748b", display: "flex", alignItems: "center", gap: "8px" },
  saveBtn: { background: "linear-gradient(135deg, #D26600, #ea580c)", color: "#fff", border: "none", padding: "12px 24px", borderRadius: "10px", fontWeight: 700, cursor: "pointer", boxShadow: "0 4px 12px rgba(210,102,0,0.2)", transition: "all 0.2s" },
  grid: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", marginBottom: "24px" },
  sectionTitle: { fontSize: "1.1rem", fontWeight: 700, color: "#0f172a", marginBottom: "20px", borderBottom: "2px solid #f1f5f9", paddingBottom: "10px", display: "flex", alignItems: "center", gap: "8px" },
  label: { fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", display: "block" },
  input: { width: "100%", padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#334155", fontSize: "0.95rem", fontWeight: 500, outline: "none", transition: "border-color 0.2s", boxSizing: "border-box" },
  select: { width: "100%", padding: "12px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "10px", color: "#334155", fontSize: "0.95rem", fontWeight: 500, outline: "none", appearance: "none", cursor: "pointer" },
  avatarWrapper: { textAlign: "center", marginBottom: "24px" },
  avatar: { width: "140px", height: "140px", borderRadius: "50%", margin: "0 auto 16px", border: "4px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.1)", objectFit: "cover" },
  interestTag: { background: "#fff7ed", color: "#c2410c", padding: "6px 12px", borderRadius: "8px", fontSize: "0.75rem", fontWeight: 700, border: "1px solid #ffedd5", display: "flex", alignItems: "center", gap: "8px" },
  docCard: { padding: "12px", border: "1px solid #e2e8f0", background: "#f8fafc", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "10px", marginBottom: "8px" }
};

const userTypeOptions = [
  { value: "participant", label: "Participant" },
  { value: "host", label: "Host" },
  { value: "admin", label: "Admin" },
];

const profileTypeOptions = [
  { value: "artist", label: "Artist" },
  { value: "orator", label: "Orator" },
  { value: "organizer", label: "Organizer" },
  { value: "participant", label: "Participant" },
  { value: "host", label: "Host" },
];

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "", email: "", phone: "", password: "",
    userType: "participant", profileType: "participant", performerType: "None",
    isOrganizer: false, bio: "", profilePicture: "", otp: "",
    address1: "", address2: "", city: "", state: "", pincode: "", country: "",
    facebook: "", instagram: "", youtube: "", twitter: "", website: "",
    interests: [], documents: []
  });

  const [newInterest, setNewInterest] = useState("");

  const [allCountries] = useState(Country.getAllCountries());
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${url}admin/user/${id}`, { headers });
        const u = response.data.user;
        if (u) {
          setFormData({
            name: u.name || "",
            email: u.email || "",
            phone: u.phone || "",
            password: "",
            userType: u.userType || "participant",
            profileType: u.profileType || "participant",
            performerType: u.performerType || "None",
            isOrganizer: u.isOrganizer || false,
            bio: u.bio || "",
            profilePicture: u.profilePicture || "",
            address1: u.address?.address1 || "",
            address2: u.address?.address2 || "",
            city: u.address?.city || "",
            state: u.address?.state || "",
            pincode: u.address?.pincode || "",
            country: u.address?.country || "",
            facebook: u.socialLinks?.facebook || "",
            instagram: u.socialLinks?.instagram || "",
            youtube: u.socialLinks?.youtube || "",
            twitter: u.socialLinks?.twitter || "",
            website: u.socialLinks?.website || "",
            interests: u.interests || [],
            documents: u.documents || [],
            otp: ""
          });
        }
      } catch (error) {
        toast("Error fetching user", "error");
      } finally { setLoading(false); }
    };
    fetchUser();
  }, [id, url]);

  useEffect(() => {
    if (formData.country) {
      const found = allCountries.find(c => c.name === formData.country);
      if (found) setAllStates(State.getStatesOfCountry(found.isoCode));
    }
  }, [formData.country, allCountries]);

  useEffect(() => {
    if (formData.state && formData.country) {
      const foundC = allCountries.find(c => c.name === formData.country);
      const foundS = allStates.find(s => s.name === formData.state);
      if (foundC && foundS) setAllCities(City.getCitiesOfState(foundC.isoCode, foundS.isoCode));
    }
  }, [formData.state, formData.country, allCountries, allStates]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleAddInterest = (e) => {
    if (e.key === 'Enter' && newInterest.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(newInterest.trim())) {
        setFormData(prev => ({ ...prev, interests: [...prev.interests, newInterest.trim()] }));
      }
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }));
  };

  const handleRemoveDoc = (idx) => {
    setFormData(prev => ({ ...prev, documents: prev.documents.filter((_, i) => i !== idx) }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
      
      // Update Basic
      const basicPayload = {
        name: formData.name, email: formData.email, phone: formData.phone,
        password: formData.password, userType: formData.userType,
        profileType: formData.profileType, performerType: formData.performerType,
        isOrganizer: formData.isOrganizer, otp: formData.otp
      };
      const basicRes = await axios.put(`${url}admin/user/basic/${id}`, basicPayload, { headers });
      
      if (basicRes.data.otp) {
        setOtpRequired(true);
        toast("OTP Required to verify changes", "info");
      }

      // Update Additional
      const additionalPayload = {
        bio: formData.bio,
        interests: formData.interests,
        documents: formData.documents,
        address: {
          address1: formData.address1, address2: formData.address2,
          city: formData.city, state: formData.state,
          pincode: formData.pincode, country: formData.country
        },
        socialLinks: {
          facebook: formData.facebook, instagram: formData.instagram,
          youtube: formData.youtube, twitter: formData.twitter, website: formData.website
        },
        profilePicture: formData.profilePicture
      };
      
      await axios.put(`${url}admin/user/modify/${id}`, additionalPayload, { headers });

      toast("User updated successfully!", "success");
      if (!basicRes.data.otp) navigate(`/admin/userdetails/${id}`);

    } catch (error) {
      toast(error.response?.data?.message || "Update failed", "error");
    } finally { setLoading(false); }
  };

  return (
    <div style={S.container}>
      {loading && <Loader />}
      
      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate(-1)}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          Cancel
        </button>
        <button style={S.saveBtn} onClick={handleUpdate}>
          Save Changes
        </button>
      </div>

      <div style={S.grid}>
        {/* SIDEBAR */}
        <div>
          <div style={S.card}>
            <div style={S.avatarWrapper}>
              {formData.profilePicture ? (
                <img src={formData.profilePicture.startsWith('http') ? formData.profilePicture : `${url.replace('/api/', '/')}/${formData.profilePicture}`} alt="Avatar" style={S.avatar} />
              ) : (
                <div style={{ ...S.avatar, display: "flex", alignItems: "center", justifyContent: "center", background: "#f1f5f9", fontSize: "3rem", color: "#cbd5e1" }}>
                  {(formData.name || "?")[0].toUpperCase()}
                </div>
              )}
              <h2 style={{ ...S.name, marginBottom: "16px" }}>{formData.name || "User Profile"}</h2>
              <div style={{ width: "100%", textAlign: "left" }}>
                <span style={S.label}>Profile Picture URL</span>
                <input style={S.input} name="profilePicture" value={formData.profilePicture} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>Account Type</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <span style={S.label}>User Role</span>
                <select style={S.select} name="userType" value={formData.userType} onChange={handleChange}>
                  {userTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div>
                <span style={S.label}>Profile Category</span>
                <select style={S.select} name="profileType" value={formData.profileType} onChange={handleChange}>
                  {profileTypeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px", background: "#f8fafc", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
                <input type="checkbox" name="isOrganizer" checked={formData.isOrganizer} onChange={handleChange} style={{ width: "18px", height: "18px", cursor: "pointer" }} />
                <span style={{ fontSize: "0.9rem", fontWeight: 600, color: "#334155" }}>Is Organizer</span>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>Interests / Categories</h3>
            <span style={S.label}>Add New Category (Press Enter)</span>
            <input style={{ ...S.input, marginBottom: "12px" }} value={newInterest} onChange={(e) => setNewInterest(e.target.value)} onKeyDown={handleAddInterest} placeholder="e.g. Bhajan" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {formData.interests.map((it, idx) => (
                <div key={idx} style={S.interestTag}>
                  {it}
                  <button onClick={() => handleRemoveInterest(it)} style={{ background: "none", border: "none", color: "#c2410c", cursor: "pointer", fontSize: "1rem", display: "flex" }}>×</button>
                </div>
              ))}
              {formData.interests.length === 0 && <span style={{ fontSize: "0.85rem", color: "#94a3b8", fontStyle: "italic" }}>No categories added.</span>}
            </div>
          </div>
        </div>

        {/* MAIN FORM */}
        <div>
          <div style={S.card}>
            <h3 style={S.sectionTitle}>Identity & Contact</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div style={{ gridColumn: "span 2" }}>
                <span style={S.label}>Full Name</span>
                <input style={S.input} name="name" value={formData.name} onChange={handleChange} />
              </div>
              <div>
                <span style={S.label}>Email Address</span>
                <input style={S.input} name="email" value={formData.email} onChange={handleChange} />
              </div>
              <div>
                <span style={S.label}>Phone Number</span>
                <input style={S.input} name="phone" value={formData.phone} onChange={handleChange} />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={S.label}>New Password (Leave blank to keep current)</span>
                <input style={S.input} type="password" name="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
              </div>
              {otpRequired && (
                <div style={{ gridColumn: "span 2", background: "#fff7ed", padding: "16px", borderRadius: "12px", border: "1px solid #ffedd5" }}>
                  <span style={{ ...S.label, color: "#c2410c" }}>Verification OTP</span>
                  <input style={{ ...S.input, borderColor: "#fb923c" }} name="otp" value={formData.otp} onChange={handleChange} placeholder="Enter OTP sent to phone" />
                </div>
              )}
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>About & Biography</h3>
            <span style={S.label}>Bio / Description</span>
            <textarea style={{ ...S.input, minHeight: "120px", resize: "vertical" }} name="bio" value={formData.bio} onChange={handleChange} />
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>Address & Location</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={S.label}>Street Address</span>
                  <input style={S.input} name="address1" value={formData.address1} onChange={handleChange} />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={S.label}>Address Line 2</span>
                  <input style={S.input} name="address2" value={formData.address2} onChange={handleChange} />
                </div>
                <div>
                  <span style={S.label}>Country</span>
                  <select style={S.select} name="country" value={formData.country} onChange={handleChange}>
                    <option value="">Select Country</option>
                    {allCountries.map(c => <option key={c.isoCode} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <span style={S.label}>State</span>
                  <select style={S.select} name="state" value={formData.state} onChange={handleChange} disabled={!allStates.length}>
                    <option value="">Select State</option>
                    {allStates.map(s => <option key={s.isoCode} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <span style={S.label}>City</span>
                  <select style={S.select} name="city" value={formData.city} onChange={handleChange} disabled={!allCities.length}>
                    <option value="">Select City</option>
                    {allCities.map(ci => <option key={ci.name} value={ci.name}>{ci.name}</option>)}
                  </select>
                </div>
                <div>
                  <span style={S.label}>Pincode / Postal</span>
                  <input style={S.input} name="pincode" value={formData.pincode} onChange={handleChange} />
                </div>
              </div>
            </div>
          </div>

          <div style={S.card}>
            <h3 style={S.sectionTitle}>Social Profiles</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
              <div>
                <span style={S.label}>Facebook</span>
                <input style={S.input} name="facebook" value={formData.facebook} onChange={handleChange} placeholder="Profile link" />
              </div>
              <div>
                <span style={S.label}>Instagram</span>
                <input style={S.input} name="instagram" value={formData.instagram} onChange={handleChange} placeholder="Profile link" />
              </div>
              <div>
                <span style={S.label}>YouTube</span>
                <input style={S.input} name="youtube" value={formData.youtube} onChange={handleChange} placeholder="Channel link" />
              </div>
              <div>
                <span style={S.label}>Twitter</span>
                <input style={S.input} name="twitter" value={formData.twitter} onChange={handleChange} placeholder="Profile link" />
              </div>
              <div style={{ gridColumn: "span 2" }}>
                <span style={S.label}>Website / Portfolio</span>
                <input style={S.input} name="website" value={formData.website} onChange={handleChange} placeholder="https://..." />
              </div>
            </div>
          </div>

          {formData.userType !== "participant" && (
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Documents Management</h3>
              <span style={S.label}>Current Documents</span>
              {formData.documents.length > 0 ? (
                formData.documents.map((doc, idx) => (
                  <div key={idx} style={S.docCard}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "1.2rem" }}>📄</span>
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#1e293b" }}>{doc.name}</div>
                        <a href={doc.uri} target="_blank" rel="noreferrer" style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "none" }}>View File</a>
                      </div>
                    </div>
                    <button onClick={() => handleRemoveDoc(idx)} style={{ background: "#fee2e2", color: "#ef4444", border: "none", padding: "6px 10px", borderRadius: "6px", fontSize: "0.75rem", fontWeight: 700, cursor: "pointer" }}>Remove</button>
                  </div>
                ))
              ) : (
                <div style={{ padding: "20px", textAlign: "center", border: "2px dashed #e2e8f0", borderRadius: "12px", color: "#94a3b8", fontSize: "0.9rem" }}>
                  No documents uploaded for this user.
                </div>
              )}
              <p style={{ fontSize: "0.7rem", color: "#64748b", marginTop: "12px" }}>
                * Admin can view and remove documents. To upload new ones, please use the mobile app or user dashboard.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateUser;
