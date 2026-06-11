import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { toast } from "../../components/Popup";
import Loader from "../../components/Loader";
import usePermission from "../../hooks/usePermission";

const S = {
  container: {
    padding: "32px",
    background: "#f8fafc",
    minHeight: "100vh",
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "32px",
  },
  backBtn: {
    background: "#fff",
    border: "1px solid #e2e8f0",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "0.875rem",
    fontWeight: 600,
    color: "#64748b",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  saveBtn: {
    background: "linear-gradient(135deg, #D26600, #ea580c)",
    color: "#fff",
    border: "none",
    padding: "12px 24px",
    borderRadius: "10px",
    fontWeight: 700,
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(210,102,0,0.2)",
    transition: "all 0.2s",
  },
  grid: { display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px" },
  card: {
    background: "#fff",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    marginBottom: "24px",
  },
  sectionTitle: {
    fontSize: "1.1rem",
    fontWeight: 700,
    color: "#0f172a",
    marginBottom: "20px",
    borderBottom: "2px solid #f1f5f9",
    paddingBottom: "10px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  label: {
    fontSize: "0.75rem",
    fontWeight: 700,
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "8px",
    display: "block",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#334155",
    fontSize: "0.95rem",
    fontWeight: 500,
    outline: "none",
    transition: "border-color 0.2s",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "12px 16px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "10px",
    color: "#334155",
    fontSize: "0.95rem",
    fontWeight: 500,
    outline: "none",
    appearance: "none",
    cursor: "pointer",
  },
  avatarWrapper: { textAlign: "center", marginBottom: "24px" },
  avatar: {
    width: "140px",
    height: "140px",
    borderRadius: "50%",
    margin: "0 auto 16px",
    border: "4px solid #fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    objectFit: "cover",
  },
  interestTag: {
    background: "#fff7ed",
    color: "#c2410c",
    padding: "6px 12px",
    borderRadius: "8px",
    fontSize: "0.75rem",
    fontWeight: 700,
    border: "1px solid #ffedd5",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  docCard: {
    padding: "12px",
    border: "1px solid #e2e8f0",
    background: "#f8fafc",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "10px",
    marginBottom: "8px",
  },
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

const INTEREST_LABELS = {
  1: "Satsang",
  2: "Bhajan & Kirtan",
  3: "Pooja",
  4: "Yoga & Dhyan",
  5: "Dharma Sabha",
  6: "Adhyatmik Shivir",
  7: "Utsav",
  8: "Seva & Charity",
  9: "Sanskritik Karyakram",
  10: "Samuhik Vivah",
};

const UpdateUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const url = process.env.REACT_APP_BACKEND;
  const isReadOnly = location.pathname.includes("/admin/userdetails/");
  const { can } = usePermission();
  const canEdit = can("allusers", "edit");

  const [loading, setLoading] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [isInactive, setIsInactive] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    userType: "participant",
    profileType: "participant",
    performerType: "None",
    isOrganizer: false,
    bio: "",
    profilePicture: "",
    otp: "",
    address1: "",
    address2: "",
    city: "",
    state: "",
    pincode: "",
    country: "",
    facebook: "",
    instagram: "",
    youtube: "",
    twitter: "",
    website: "",
    interests: [],
    documents: [],
  });

  const [newInterest, setNewInterest] = useState("");
  const [docFiles, setDocFiles] = useState([]);
  const [profileFile, setProfileFile] = useState(null);
  const [events, setEvents] = useState([]);
  const [stats, setStats] = useState({ subscribers: 0, subscriptions: 0 });

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
          setIsInactive(u.isActive === false);
          setStats({
            subscribers: u.subscribers?.length || 0,
            subscriptions: u.subscriptions?.length || 0,
          });
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
            otp: "",
          });
        }
        try {
          const eventsRes = await axios.get(`${url}events`, {
            headers,
            params: { user: id, limit: 100 },
          });
          const rawData = eventsRes.data.data || eventsRes.data;
          const eventsList = rawData.events || rawData;
          const userEvents = Array.isArray(eventsList)
            ? eventsList.filter((e) => (e.user?._id || e.user) === id)
            : [];
          setEvents(userEvents);
        } catch (ee) {
          setEvents([]);
        }
      } catch (error) {
        toast("Error fetching user", "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, url]);

  useEffect(() => {
    if (formData.country) {
      const found = allCountries.find((c) => c.name === formData.country);
      if (found) setAllStates(State.getStatesOfCountry(found.isoCode));
    }
  }, [formData.country, allCountries]);

  useEffect(() => {
    if (formData.state && formData.country) {
      const foundC = allCountries.find((c) => c.name === formData.country);
      const foundS = allStates.find((s) => s.name === formData.state);
      if (foundC && foundS)
        setAllCities(City.getCitiesOfState(foundC.isoCode, foundS.isoCode));
    }
  }, [formData.state, formData.country, allCountries, allStates]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "phone") {
      const digitsOnly = String(value || "")
        .replace(/\D/g, "")
        .slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digitsOnly }));
      return;
    }
    if (name === "pincode") {
      const digitsOnly = String(value || "")
        .replace(/\D/g, "")
        .slice(0, 6);
      setFormData((prev) => ({ ...prev, pincode: digitsOnly }));
      return;
    }

    // Keep userType/profileType consistent when admin changes account type
    if (name === "userType") {
      setFormData((prev) => {
        const nextUserType = value;
        if (nextUserType === "participant") {
          return {
            ...prev,
            userType: nextUserType,
            profileType: "participant",
            performerType: "None",
          };
        }
        if (nextUserType === "host") {
          const nextProfileType =
            prev.profileType === "participant"
              ? "host"
              : prev.profileType || "host";
          const nextPerformerType = ["artist", "orator", "organizer"].includes(
            nextProfileType,
          )
            ? nextProfileType
            : nextProfileType === "host"
              ? "None"
              : prev.performerType;
          return {
            ...prev,
            userType: nextUserType,
            profileType: nextProfileType,
            performerType: nextPerformerType,
          };
        }
        return { ...prev, userType: nextUserType };
      });
      return;
    }

    if (name === "profileType") {
      setFormData((prev) => {
        const nextProfileType = value;
        const nextUserType = ["artist", "orator", "organizer", "host"].includes(
          nextProfileType,
        )
          ? "host"
          : nextProfileType === "participant"
            ? "participant"
            : prev.userType;
        const nextPerformerType = ["artist", "orator", "organizer"].includes(
          nextProfileType,
        )
          ? nextProfileType
          : nextUserType === "participant"
            ? "None"
            : "None";
        return {
          ...prev,
          profileType: nextProfileType,
          userType: nextUserType,
          performerType: nextPerformerType,
        };
      });
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleAddInterest = (e) => {
    if (e.key === "Enter" && newInterest.trim()) {
      e.preventDefault();
      if (!formData.interests.includes(newInterest.trim())) {
        setFormData((prev) => ({
          ...prev,
          interests: [...prev.interests, newInterest.trim()],
        }));
      }
      setNewInterest("");
    }
  };

  const handleRemoveInterest = (interest) => {
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.filter((i) => i !== interest),
    }));
  };

  const handleRemoveDoc = (idx) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== idx),
    }));
  };

  const handleDocFileChange = (e) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((f) => {
      const isImage = f.type.startsWith("image/");
      const isPdf = f.type === "application/pdf";
      return isImage || isPdf;
    });
    if (validFiles.length !== files.length) {
      toast("Only image and PDF documents are allowed", "error");
    }
    setDocFiles(validFiles);
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      setProfileFile(file);
    } else if (file) {
      toast("Only image files are allowed", "error");
    }
  };

  const getInterestLabel = (interest) => {
    const key = Number(interest);
    if (!Number.isNaN(key) && INTEREST_LABELS[key]) return INTEREST_LABELS[key];
    return String(interest || "").trim() || "Unknown";
  };

  const handleUpdate = async () => {
    if (isReadOnly || isInactive) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      };

      // Update Basic
      const basicPayload = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        userType: formData.userType,
        profileType: formData.profileType,
        performerType: formData.performerType,
        isOrganizer: formData.isOrganizer,
        otp: formData.otp,
      };
      const basicRes = await axios.put(
        `${url}admin/user/basic/${id}`,
        basicPayload,
        { headers },
      );

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
          address1: formData.address1,
          address2: formData.address2,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country,
        },
        socialLinks: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          youtube: formData.youtube,
          twitter: formData.twitter,
          website: formData.website,
        },
        profilePicture: formData.profilePicture,
      };

      if (docFiles.length > 0 || profileFile) {
        const multipartHeaders = token
          ? {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            }
          : { "Content-Type": "multipart/form-data" };
        const additionalForm = new FormData();
        additionalForm.append("updateUser", JSON.stringify(additionalPayload));
        docFiles.forEach((file) => {
          additionalForm.append("documents", file);
        });
        if (profileFile) {
          additionalForm.append("profilePicture", profileFile);
        }
        await axios.put(`${url}admin/user/modify/${id}`, additionalForm, {
          headers: multipartHeaders,
        });
      } else {
        await axios.put(`${url}admin/user/modify/${id}`, additionalPayload, {
          headers,
        });
      }

      toast("User updated successfully!", "success");
      if (!basicRes.data.otp) navigate(`/admin/userdetails/${id}`);
    } catch (error) {
      toast(error.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const isParticipant =
    (!formData.userType || formData.userType.toLowerCase() === "participant") &&
    (!formData.profileType ||
      formData.profileType.toLowerCase() === "participant") &&
    (!formData.performerType || formData.performerType === "None");

  return (
    <div style={S.container}>
      {loading && <Loader />}

      <div style={S.header}>
        <button style={S.backBtn} onClick={() => navigate("/admin/allusers")}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {isReadOnly ? "Back" : "Cancel"}
        </button>
       
        {isReadOnly && !isInactive  && canEdit && (
          <button
            style={S.saveBtn}
            onClick={() => navigate(`/admin/updateuser/${id}`)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginRight: "8px", verticalAlign: "middle" }}
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Edit Details
          </button>
        )}
        {!isReadOnly && !isInactive && (
          <button style={S.saveBtn} onClick={handleUpdate}>
            Save Changes
          </button>
        )}
        {isInactive && (
          <button style={{ ...S.saveBtn, opacity: 0.65, cursor: "not-allowed" }} disabled>
            Inactive User
          </button>
        )}
      </div>

      <fieldset
        disabled={isReadOnly || isInactive}
        style={{ border: "none", margin: 0, padding: 0 }}
      >
        <div style={S.grid}>
          {/* SIDEBAR */}
          <div>
            <div style={S.card}>
              <div style={S.avatarWrapper}>
                {formData.profilePicture || profileFile ? (
                  <img
                    src={
                      profileFile
                        ? URL.createObjectURL(profileFile)
                        : formData.profilePicture.startsWith("http")
                          ? formData.profilePicture
                          : `${url.replace("/api/", "/")}/${formData.profilePicture}`
                    }
                    alt="Avatar"
                    style={S.avatar}
                  />
                ) : (
                  <div
                    style={{
                      ...S.avatar,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "#f1f5f9",
                      fontSize: "3rem",
                      color: "#cbd5e1",
                    }}
                  >
                    {(formData.name || "?")[0].toUpperCase()}
                  </div>
                )}
                <h2 style={{ ...S.name, marginBottom: "16px" }}>
                  {formData.name || "User Profile"}
                </h2>
                <input
                  id="profile-pic-input"
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  style={{ display: "none" }}
                />
                <label
                  htmlFor="profile-pic-input"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    padding: "10px 16px",
                    borderRadius: "8px",
                    background: "linear-gradient(135deg, #D26600, #ea580c)",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    width: "100%",
                    marginBottom: "12px",
                    boxShadow: "0 2px 8px rgba(210,102,0,0.2)",
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 5 17 10" />
                    <line x1="12" y1="5" x2="12" y2="17" />
                  </svg>
                  Upload Photo
                </label>
              </div>
            </div>

            <div style={S.card}>
              <h3 style={S.sectionTitle}>Account Type</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div>
                  <span style={S.label}>User Role</span>
                  <select
                    style={S.select}
                    name="userType"
                    value={formData.userType}
                    onChange={handleChange}
                  >
                    {userTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <span style={S.label}>Profile Category</span>
                  <select
                    style={S.select}
                    name="profileType"
                    value={formData.profileType}
                    onChange={handleChange}
                  >
                    {profileTypeOptions.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div style={S.card}>
              <h3 style={S.sectionTitle}>Account Stats</h3>
              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  justifyContent: "space-between",
                }}
              >
                {!isParticipant && (
                  <>
                    <div
                      style={{
                        flex: 1,
                        background: "#fff7ed",
                        borderRadius: "12px",
                        padding: "10px 4px",
                        textAlign: "center",
                        border: "1px solid #ffedd5",
                      }}
                    >
                      <div
                        style={{
                          color: "#D26600",
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          marginBottom: "2px",
                        }}
                      >
                        {events.length}
                      </div>
                      <div
                        style={{
                          color: "#9a3412",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Posts
                      </div>
                    </div>
                    <div
                      style={{
                        flex: 1,
                        background: "#fff7ed",
                        borderRadius: "12px",
                        padding: "10px 4px",
                        textAlign: "center",
                        border: "1px solid #ffedd5",
                      }}
                    >
                      <div
                        style={{
                          color: "#D26600",
                          fontSize: "1.25rem",
                          fontWeight: 800,
                          marginBottom: "2px",
                        }}
                      >
                        {stats.subscribers}
                      </div>
                      <div
                        style={{
                          color: "#9a3412",
                          fontSize: "0.65rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                        }}
                      >
                        Subscribers
                      </div>
                    </div>
                  </>
                )}
                <div
                  style={{
                    flex: 1,
                    background: "#fff7ed",
                    borderRadius: "12px",
                    padding: "10px 4px",
                    textAlign: "center",
                    border: "1px solid #ffedd5",
                  }}
                >
                  <div
                    style={{
                      color: "#D26600",
                      fontSize: "1.25rem",
                      fontWeight: 800,
                      marginBottom: "2px",
                    }}
                  >
                    {stats.subscriptions}
                  </div>
                  <div
                    style={{
                      color: "#9a3412",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      textTransform: "uppercase",
                    }}
                  >
                    Following
                  </div>
                </div>
              </div>
            </div>

            {formData.userType !== "host" && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Interests / Categories</h3>
                <span style={S.label}>Add New Category (Press Enter)</span>
                <input
                  style={{ ...S.input, marginBottom: "12px" }}
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={handleAddInterest}
                  placeholder="e.g. Bhajan"
                />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                  {formData.interests.map((it, idx) => (
                    <div key={idx} style={S.interestTag}>
                      {getInterestLabel(it)}
                      <button
                        onClick={() => handleRemoveInterest(it)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#c2410c",
                          cursor: "pointer",
                          fontSize: "1rem",
                          display: "flex",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  {formData.interests.length === 0 && (
                    <span
                      style={{
                        fontSize: "0.85rem",
                        color: "#94a3b8",
                        fontStyle: "italic",
                      }}
                    >
                      No categories added.
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* MAIN FORM */}
          <div>
            <div style={S.card}>
              <h3 style={S.sectionTitle}>Identity & Contact</h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                }}
              >
                <div style={{ gridColumn: "span 2" }}>
                  <span style={S.label}>Full Name</span>
                  <input
                    style={S.input}
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <span style={S.label}>Email Address</span>
                  <input
                    style={S.input}
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div>
                  <span style={S.label}>Phone Number</span>
                  <input
                    style={S.input}
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    inputMode="numeric"
                    maxLength={10}
                  />
                </div>
                <div style={{ gridColumn: "span 2" }}>
                  <span style={S.label}>
                    New Password (Leave blank to keep current)
                  </span>
                  <input
                    style={S.input}
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                  />
                </div>
                {otpRequired && (
                  <div
                    style={{
                      gridColumn: "span 2",
                      background: "#fff7ed",
                      padding: "16px",
                      borderRadius: "12px",
                      border: "1px solid #ffedd5",
                    }}
                  >
                    <span style={{ ...S.label, color: "#c2410c" }}>
                      Verification OTP
                    </span>
                    <input
                      style={{ ...S.input, borderColor: "#fb923c" }}
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter OTP sent to phone"
                    />
                  </div>
                )}
              </div>
            </div>

            <div style={S.card}>
              <h3 style={S.sectionTitle}>About & Biography</h3>
              <span style={S.label}>Bio / Description</span>
              <textarea
                style={{ ...S.input, minHeight: "120px", resize: "vertical" }}
                name="bio"
                value={formData.bio}
                onChange={handleChange}
              />
            </div>

            <div style={S.card}>
              <h3 style={S.sectionTitle}>Address & Location</h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={S.label}>Street Address</span>
                    <input
                      style={S.input}
                      name="address1"
                      value={formData.address1}
                      onChange={handleChange}
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={S.label}>Address Line 2</span>
                    <input
                      style={S.input}
                      name="address2"
                      value={formData.address2}
                      onChange={handleChange}
                    />
                  </div>
                  <div>
                    <span style={S.label}>Country</span>
                    <select
                      style={S.select}
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                    >
                      <option value="">Select Country</option>
                      {allCountries.map((c) => (
                        <option key={c.isoCode} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span style={S.label}>State</span>
                    <select
                      style={S.select}
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      disabled={!allStates.length}
                    >
                      <option value="">Select State</option>
                      {allStates.map((s) => (
                        <option key={s.isoCode} value={s.name}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span style={S.label}>City</span>
                    <select
                      style={S.select}
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      disabled={!allCities.length}
                    >
                      <option value="">Select City</option>
                      {allCities.map((ci) => (
                        <option key={ci.name} value={ci.name}>
                          {ci.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <span style={S.label}>Pincode / Postal</span>
                    <input
                      style={S.input}
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      inputMode="numeric"
                      maxLength={6}
                    />
                  </div>
                </div>
              </div>
            </div>

            {formData.userType !== "participant" && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Social Profiles</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div>
                    <span style={S.label}>Facebook</span>
                    <input
                      style={S.input}
                      name="facebook"
                      value={formData.facebook}
                      onChange={handleChange}
                      placeholder="Profile link"
                    />
                  </div>
                  <div>
                    <span style={S.label}>Instagram</span>
                    <input
                      style={S.input}
                      name="instagram"
                      value={formData.instagram}
                      onChange={handleChange}
                      placeholder="Profile link"
                    />
                  </div>
                  <div>
                    <span style={S.label}>YouTube</span>
                    <input
                      style={S.input}
                      name="youtube"
                      value={formData.youtube}
                      onChange={handleChange}
                      placeholder="Channel link"
                    />
                  </div>
                  <div>
                    <span style={S.label}>Twitter</span>
                    <input
                      style={S.input}
                      name="twitter"
                      value={formData.twitter}
                      onChange={handleChange}
                      placeholder="Profile link"
                    />
                  </div>
                  <div style={{ gridColumn: "span 2" }}>
                    <span style={S.label}>Website / Portfolio</span>
                    <input
                      style={S.input}
                      name="website"
                      value={formData.website}
                      onChange={handleChange}
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </div>
            )}

            {formData.userType !== "participant" && (
              <div style={S.card}>
                <h3 style={S.sectionTitle}>Documents Management</h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr auto",
                    gap: "10px",
                    marginBottom: "14px",
                  }}
                >
                  <input
                    id="doc-upload-input"
                    type="file"
                    multiple
                    accept="image/*,application/pdf"
                    onChange={handleDocFileChange}
                    style={{ display: "none" }}
                  />
                  <label
                    htmlFor="doc-upload-input"
                    style={{
                      gridColumn: "span 3",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "8px",
                      padding: "12px 16px",
                      borderRadius: "10px",
                      background: "linear-gradient(135deg, #D26600, #ea580c)",
                      color: "#fff",
                      fontWeight: 700,
                      fontSize: "0.88rem",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(210,102,0,0.25)",
                      border: "1px solid rgba(255,255,255,0.15)",
                    }}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 5 17 10" />
                      <line x1="12" y1="5" x2="12" y2="17" />
                    </svg>
                    Upload Documents (Image/PDF)
                  </label>
                </div>
                {docFiles.length > 0 && (
                  <div
                    style={{
                      marginBottom: "14px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "6px",
                    }}
                  >
                    {docFiles.map((f, i) => (
                      <div
                        key={`${f.name}-${i}`}
                        style={{ fontSize: "0.78rem", color: "#475569" }}
                      >
                        {f.name} ({(f.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    ))}
                  </div>
                )}
                <span style={S.label}>Current Documents</span>
                {formData.documents.length > 0 ? (
                  formData.documents.map((doc, idx) => (
                    <div key={idx} style={S.docCard}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <span style={{ fontSize: "1.2rem" }}>📄</span>
                        <div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              color: "#1e293b",
                            }}
                          >
                            {doc.name}
                          </div>
                          <a
                            href={doc.uri}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              fontSize: "0.75rem",
                              color: "#2563eb",
                              textDecoration: "none",
                            }}
                          >
                            View File
                          </a>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveDoc(idx)}
                        style={{
                          background: "#fee2e2",
                          color: "#ef4444",
                          border: "none",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      padding: "20px",
                      textAlign: "center",
                      border: "2px dashed #e2e8f0",
                      borderRadius: "12px",
                      color: "#94a3b8",
                      fontSize: "0.9rem",
                    }}
                  >
                    No documents uploaded for this user.
                  </div>
                )}
                <p
                  style={{
                    fontSize: "0.7rem",
                    color: "#64748b",
                    marginTop: "12px",
                  }}
                >
                  * Select image or PDF documents from your device, then click
                  Save Changes.
                </p>
              </div>
            )}
          </div>
        </div>
      </fieldset>
    </div>
  );
};

export default UpdateUser;
