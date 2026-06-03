import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { Country, State, City } from "country-state-city";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const CATEGORIES = [
  "Satsang", "Yoga", "Meditation", "Kirtan", "Utsavs",
  "Dharma Sabha", " ShAdhyatmikivir", "Seva & Charity",
  "Sanskritik", "Puja", "Vividh (Others)", "Spiritual",
];

const LANGUAGES = ["Hindi", "English", "Gujarati", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Other"];

const inputStyle = {
  width: "100%", padding: "11px 13px", borderRadius: 10,
  border: "1px solid #e2e8f0", fontSize: "0.875rem",
  outline: "none", boxSizing: "border-box", background: "#fff",
  color: "#0f172a", boxShadow: "0 1px 2px rgba(15,23,42,0.03)",
};

const labelStyle = { fontSize: "0.76rem", fontWeight: 800, color: "#334155", marginBottom: 6, display: "block" };
const grid2 = { display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 14 };
const grid3 = { display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: 14 };
const grid4 = { display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 14 };
const hintStyle = { margin: "6px 0 0", fontSize: "0.72rem", color: "#94a3b8" };

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const toneMap = {
  green:  { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
  orange: { bg: "#fff7ed", color: "#D26600",  border: "#fed7aa" },
  slate:  { bg: "#f1f5f9", color: "#475569",  border: "#cbd5e1" },
};

const StatusPill = ({ label, tone = "slate" }) => {
  const t = toneMap[tone] || toneMap.slate;
  return (
    <span style={{ padding: "4px 12px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 700,
      background: t.bg, color: t.color, border: `1px solid ${t.border}`,
      textTransform: "uppercase", letterSpacing: "0.05em" }}>
      {label}
    </span>
  );
};

const ToggleField = ({ label, checked, onChange }) => (
  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer",
    background: checked ? "#fff7ed" : "#f8fafc", border: `1px solid ${checked ? "#fed7aa" : "#e2e8f0"}`,
    borderRadius: 10, padding: "10px 14px" }}>
    <div style={{ position: "relative", width: 38, height: 22, flexShrink: 0 }}>
      <input type="checkbox" checked={checked} onChange={onChange}
        style={{ opacity: 0, width: 0, height: 0, position: "absolute" }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: 999,
        background: checked ? "#D26600" : "#cbd5e1", transition: "background 0.2s" }} />
      <div style={{ position: "absolute", top: 3, left: checked ? 19 : 3, width: 16, height: 16,
        borderRadius: "50%", background: "#fff", transition: "left 0.2s",
        boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
    </div>
    <span style={{ fontSize: "0.82rem", fontWeight: 700, color: checked ? "#D26600" : "#64748b" }}>{label}</span>
  </label>
);

const UpdateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  const [form, setForm] = useState({
    eventName: "", eventDesc: "", eventCategory: [],
    eventPrice: "0", eventLang: "Hindi",
    performerName: "", hostName: "", hostWhatsapp: "", sponserName: "",
    eventLink: "", locationLink: "", eventAddress: "", address2: "", landmark: "",
    city: "", province: "", postalCode: "", country: "",
    lat: "", lng: "",
    startDate: "", endDate: "", startTime: "", endTime: "",
    noOfAttendees: "", visibility: "public",
    approved: false, isLive: false, isPopular: false, rejectionReason: "",
  });
  const [subEvents, setSubEvents] = useState([{ title: "", detail: "" }]);
  const [existingPosters, setExistingPosters] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  const [resolvingLocation, setResolvingLocation] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  const [allCountries] = useState(Country.getAllCountries());
  const [allStates, setAllStates] = useState([]);
  const [allCities, setAllCities] = useState([]);

  // Normalise any time string to HH:mm (required by <input type="time">)
  const toHHmm = (t) => {
    if (!t) return "";
    // Already HH:mm
    if (/^\d{2}:\d{2}$/.test(t)) return t;
    // 12-hour with AM/PM e.g. "10:30 AM" or "10:30 am"
    const match = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2];
      const period = match[3].toUpperCase();
      if (period === "AM" && h === 12) h = 0;
      if (period === "PM" && h !== 12) h += 12;
      return `${String(h).padStart(2, "0")}:${m}`;
    }
    return "";
  };

  const getHeaders = (contentType = "application/json") => {
    const token = localStorage.getItem("token");
    return { "Content-Type": contentType, ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`${url}events/${id}`, { headers: getHeaders() });
        const e = res.data.data;
        setForm({
          eventName: e.eventName || "",
          eventDesc: e.eventDesc || "",
          eventCategory: e.eventCategory || [],
          eventPrice: e.eventPrice || "0",
          eventLang: e.eventLang || "Hindi",
          performerName: e.performerName || "",
          hostName: e.hostName || "",
          hostWhatsapp: e.hostWhatsapp || "",
          sponserName: e.sponserName || "",
          eventLink: e.eventLink || "",
          locationLink: e.locationLink || "",
          lat: e.geoCoordinates?.coordinates?.[1]?.toString() || "",
          lng: e.geoCoordinates?.coordinates?.[0]?.toString() || "",
          eventAddress: e.eventAddress || "",
          address2: e.address2 || "",
          landmark: e.landmark || "",
          city: e.city || "",
          province: e.province || "",
          postalCode: e.postalCode || "",
          country: e.country || "",
          startDate: e.startDate ? dayjs(e.startDate).format("YYYY-MM-DD") : "",
          endDate: e.endDate ? dayjs(e.endDate).format("YYYY-MM-DD") : "",
          startTime: toHHmm(e.startTime) || (e.startDate ? dayjs(e.startDate).format("HH:mm") : ""),
          endTime: toHHmm(e.endTime) || (e.endDate ? dayjs(e.endDate).format("HH:mm") : ""),
          noOfAttendees: e.noOfAttendees || "",
          visibility: e.visibility || "public",
          approved: !!e.approved,
          isLive: !!e.isLive,
          isPopular: !!e.isPopular,
          rejectionReason: e.rejectionReason || "",
        });
        setIsDraft(!!e.isDraft);
        setExistingPosters(e.eventPosters || []);
        setSubEvents(e.subEvents?.length ? e.subEvents : [{ title: "", detail: "" }]);
      } catch (err) {
        setFetchError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [id, url]);

  useEffect(() => {
    if (!form.country) {
      setAllStates([]);
      setAllCities([]);
      return;
    }
    const found = allCountries.find((c) => c.name === form.country);
    if (!found) {
      setAllStates([]);
      setAllCities([]);
      return;
    }
    setAllStates(State.getStatesOfCountry(found.isoCode));
  }, [form.country, allCountries]);

  useEffect(() => {
    if (!form.province || !form.country) {
      setAllCities([]);
      return;
    }
    const foundC = allCountries.find((c) => c.name === form.country);
    const foundS = allStates.find((s) => s.name === form.province);
    if (!foundC || !foundS) {
      setAllCities([]);
      return;
    }
    setAllCities(City.getCitiesOfState(foundC.isoCode, foundS.isoCode));
  }, [form.province, form.country, allCountries, allStates]);

  const set = (field) => (e) => {
    const raw = e?.target?.value ?? "";
    if (field === "postalCode") {
      const digitsOnly = String(raw).replace(/\D/g, "").slice(0, 6);
      setForm((prev) => ({ ...prev, postalCode: digitsOnly }));
      return;
    }
    if (field === "country") {
      setForm((prev) => ({ ...prev, country: raw, province: "", city: "" }));
      return;
    }
    if (field === "province") {
      setForm((prev) => ({ ...prev, province: raw, city: "" }));
      return;
    }
    setForm((prev) => ({ ...prev, [field]: raw }));
  };

  const setChecked = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.checked }));
  };

  const toggleCategory = (cat) => {
    setForm(prev => ({
      ...prev,
      eventCategory: prev.eventCategory.includes(cat)
        ? prev.eventCategory.filter(c => c !== cat)
        : [...prev.eventCategory, cat],
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 4);
    setNewFiles(files);
    setNewPreviews(files.map(f => URL.createObjectURL(f)));
  };

  const removeExistingPoster = (idx) => setExistingPosters(prev => prev.filter((_, i) => i !== idx));

  const updateSubEvent = (idx, field, value) => {
    setSubEvents(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };

  const resolveGoogleMapsUrl = async () => {
    if (!form.locationLink) return toast("Enter a Google Maps link first", "error");
    setResolvingLocation(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${url}events/resolve-location?url=${encodeURIComponent(form.locationLink)}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const { lat, lng } = res.data.data;
      setForm(prev => ({ ...prev, lat: lat.toString(), lng: lng.toString() }));
      toast(`📍 Location resolved: ${lat.toFixed(5)}, ${lng.toFixed(5)}`, "success");
    } catch (err) {
      toast(err.response?.data?.message || "Could not resolve location", "error");
    } finally {
      setResolvingLocation(false);
    }
  };

  const handlePublishDraft = async () => {
    if (!form.eventName) return toast("Event name is required", "error");
    if (!form.eventCategory.length) return toast("Select at least one category", "error");
    if (!form.startDate || !form.endDate) return toast("Start and end dates are required", "error");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const formData = new FormData();
      const { lat, lng, ...restForm } = form;
      const fields = { ...restForm, isDraft: false, approved: false, subEvents: JSON.stringify(subEvents) };
      Object.entries(fields).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => formData.append(k, item));
        else formData.append(k, v ?? "");
      });
      if (lat) formData.append("lat", lat);
      if (lng) formData.append("lng", lng);
      existingPosters.forEach(p => formData.append("existingPosters", p));
      newFiles.forEach(f => formData.append("posters", f));
      await axios.put(`${url}events/${id}`, formData, { headers });
      toast("Draft published for approval! ✅", "success");
      navigate("/admin/drafts");
    } catch (err) {
      toast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.eventName) return toast("Event name is required", "error");
    if (!form.eventCategory.length) return toast("Select at least one category", "error");
    if (!form.startDate || !form.endDate) return toast("Start and end dates are required", "error");

    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const formData = new FormData();
      const { lat, lng, ...restForm } = form;
      const fields = { ...restForm, subEvents: JSON.stringify(subEvents) };
      Object.entries(fields).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => formData.append(k, item));
        else formData.append(k, v ?? "");
      });
      if (lat) formData.append("lat", lat);
      if (lng) formData.append("lng", lng);
      existingPosters.forEach(p => formData.append("existingPosters", p));
      newFiles.forEach(f => formData.append("posters", f));

      await axios.put(`${url}events/${id}`, formData, { headers });
      toast("Event updated successfully", "success");
      navigate("/admin/events");
    } catch (err) {
      toast(err.response?.data?.message || err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !form.eventName) return <Loader />;
  if (fetchError) return <div style={{ padding: 32, color: "#ef4444" }}>{fetchError}</div>;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "30px 22px 96px" }}>
      {loading && <Loader />}

      <div style={{
        display: "flex", alignItems: "center", gap: 12, marginBottom: 18,
        background: "linear-gradient(135deg,#fff 0%,#fff7ed 100%)",
        border: "1px solid #fed7aa", borderRadius: 18, padding: "18px 20px",
        boxShadow: "0 14px 40px rgba(210,102,0,0.10)",
      }}>
        <button onClick={() => navigate("/admin/events")} style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10,
          padding: "8px 14px", cursor: "pointer", fontSize: "0.82rem", color: "#475569", fontWeight: 700,
        }}>← Back</button>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.45rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.03em" }}>Edit Event</h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.82rem" }}>Update event details, posters, agenda, location, and admin status.</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 22 }}>
        <StatusPill label={form.visibility === "private" ? "Private" : "Public"} tone={form.visibility === "private" ? "slate" : "green"} />
        <StatusPill label={form.approved ? "Approved" : "Pending"} tone={form.approved ? "green" : "orange"} />
        <StatusPill label={form.isLive ? "Live" : "Not Live"} tone={form.isLive ? "green" : "slate"} />
        {form.isPopular && <StatusPill label="Popular" tone="orange" />}
      </div>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>

        {/* Basic Info */}
        <Section title="Basic Info">
          <Field label="Event Name *">
            <input style={inputStyle} value={form.eventName} onChange={set("eventName")} required />
          </Field>
          <Field label="Description">
            <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }}
              value={form.eventDesc} onChange={set("eventDesc")} />
          </Field>
          <div style={grid2}>
            <Field label="Language">
              <select style={inputStyle} value={form.eventLang} onChange={set("eventLang")}>
                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
            </Field>
            <Field label="Visibility">
              <select style={inputStyle} value={form.visibility} onChange={set("visibility")}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </Field>
          </div>
        </Section>

        {/* Admin Status */}
        <Section title="Admin Status">
          <div style={grid3}>
            <ToggleField label="Approved" checked={form.approved} onChange={setChecked("approved")} />
            <ToggleField label="Live Event" checked={form.isLive} onChange={setChecked("isLive")} />
            <ToggleField label="Popular Event" checked={form.isPopular} onChange={setChecked("isPopular")} />
          </div>
          <Field label="Rejection Reason">
            <textarea
              style={{ ...inputStyle, minHeight: 74, resize: "vertical" }}
              value={form.rejectionReason}
              onChange={set("rejectionReason")}
              placeholder="Add or update the reason shown when this event is rejected"
            />
          </Field>
        </Section>

        {/* Categories */}
        <Section title="Categories *">
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {CATEGORIES.map(cat => {
              const active = form.eventCategory.includes(cat);
              return (
                <button key={cat} type="button" onClick={() => toggleCategory(cat)} style={{
                  padding: "5px 14px", borderRadius: 999, fontSize: "0.78rem", fontWeight: 600,
                  cursor: "pointer", border: `1px solid ${active ? "#D26600" : "#e5e7eb"}`,
                  background: active ? "#fff7ed" : "#fff", color: active ? "#D26600" : "#555",
                  transition: "all 0.15s",
                }}>{cat}</button>
              );
            })}
          </div>
        </Section>

        {/* Dates & Times */}
        <Section title="Dates & Times">
          <div style={grid4}>
            <Field label="Start Date *">
              <input style={inputStyle} type="date" value={form.startDate} onChange={set("startDate")} required />
            </Field>
            <Field label="End Date *">
              <input style={inputStyle} type="date" value={form.endDate} onChange={set("endDate")} required />
            </Field>
            <Field label="Start Time">
              <input style={inputStyle} type="time" value={form.startTime} onChange={set("startTime")} />
            </Field>
            <Field label="End Time">
              <input style={inputStyle} type="time" value={form.endTime} onChange={set("endTime")} />
            </Field>
          </div>
        </Section>

        {/* Pricing */}
        <Section title="Pricing">
          <div style={grid2}>
            <Field label="Price (INR) - set 0 for free">
              <input style={inputStyle} type="number" min="0" value={form.eventPrice} onChange={set("eventPrice")} />
              <p style={hintStyle}>{String(form.eventPrice) === "0" ? "This event is marked as free." : "Paid bookings will use this price."}</p>
            </Field>
            <Field label="Expected Attendees">
              <input style={inputStyle} value={form.noOfAttendees} onChange={set("noOfAttendees")} inputMode="numeric" placeholder="e.g. 500" />
            </Field>
          </div>
        </Section>

        {/* People */}
        <Section title="People">
          <div style={grid2}>
            <Field label="Performer / Artist Name">
              <input style={inputStyle} value={form.performerName} onChange={set("performerName")} />
            </Field>
            <Field label="Host Name">
              <input style={inputStyle} value={form.hostName} onChange={set("hostName")} />
            </Field>
            <Field label="Host WhatsApp">
              <input style={inputStyle} value={form.hostWhatsapp} onChange={set("hostWhatsapp")} />
            </Field>
            <Field label="Sponsor Name">
              <input style={inputStyle} value={form.sponserName} onChange={set("sponserName")} />
            </Field>
          </div>
        </Section>

        {/* Location */}
        <Section title="Location">
          <Field label="GPS Location (Google Maps Link)">
            <div style={{ display: "flex", gap: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={form.locationLink} onChange={set("locationLink")}
                placeholder="Paste Google Maps link (maps.app.goo.gl, goo.gl/maps, or full URL)" />
              <button type="button" onClick={resolveGoogleMapsUrl} disabled={resolvingLocation} style={{
                padding: "0 16px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D26600,#f59e0b)",
                color: "#fff", fontWeight: 700, fontSize: "0.8rem", cursor: "pointer", whiteSpace: "nowrap",
                opacity: resolvingLocation ? 0.7 : 1, flexShrink: 0
              }}>
                {resolvingLocation ? "Resolving…" : "📍 Resolve"}
              </button>
            </div>
            {form.lat && form.lng && (
              <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ padding: "4px 12px", borderRadius: 999, background: "#f0fdf4", color: "#15803d", fontSize: "0.75rem", fontWeight: 700, border: "1px solid #bbf7d0" }}>
                  ✅ Lat: {parseFloat(form.lat).toFixed(5)}, Lng: {parseFloat(form.lng).toFixed(5)}
                </span>
                <a href={`https://www.google.com/maps?q=${form.lat},${form.lng}`} target="_blank" rel="noopener noreferrer"
                  style={{ fontSize: "0.75rem", color: "#2563eb", fontWeight: 600 }}>View on Maps ↗</a>
              </div>
            )}
          </Field>
          <Field label="Address Line 1">
            <input style={inputStyle} value={form.eventAddress} onChange={set("eventAddress")} />
          </Field>
          <div style={grid2}>
            <Field label="Address Line 2">
              <input style={inputStyle} value={form.address2} onChange={set("address2")} />
            </Field>
            <Field label="Landmark">
              <input style={inputStyle} value={form.landmark} onChange={set("landmark")} />
            </Field>
            <Field label="City">
              <select style={inputStyle} value={form.city} onChange={set("city")}>
                <option value="">Select City</option>
                {!!form.city && !allCities.some((c) => c.name === form.city) && (
                  <option value={form.city}>{form.city}</option>
                )}
                {allCities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="State / Province">
              <select style={inputStyle} value={form.province} onChange={set("province")}>
                <option value="">Select State</option>
                {!!form.province && !allStates.some((s) => s.name === form.province) && (
                  <option value={form.province}>{form.province}</option>
                )}
                {allStates.map((s) => (
                  <option key={s.isoCode || s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Postal Code">
              <input
                style={inputStyle}
                value={form.postalCode}
                onChange={set("postalCode")}
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
              />
            </Field>
            <Field label="Country">
              <select style={inputStyle} value={form.country} onChange={set("country")}>
                <option value="">Select Country</option>
                {!!form.country && !allCountries.some((c) => c.name === form.country) && (
                  <option value={form.country}>{form.country}</option>
                )}
                {allCountries.map((c) => (
                  <option key={c.isoCode || c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Event Link (online / registration URL)">
            <input style={inputStyle} value={form.eventLink} onChange={set("eventLink")} />
          </Field>
        </Section>

        {/* Sub-Events */}
        <Section title="Sub-Events / Agenda">
          {subEvents.map((s, i) => (
            <div key={i} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: 10, alignItems: "end" }}>
              <Field label={`Title ${i + 1}`}>
                <input style={inputStyle} value={s.title} onChange={e => updateSubEvent(i, "title", e.target.value)} />
              </Field>
              <Field label="Detail">
                <input style={inputStyle} value={s.detail} onChange={e => updateSubEvent(i, "detail", e.target.value)} />
              </Field>
              <button type="button" onClick={() => setSubEvents(prev => prev.filter((_, j) => j !== i))}
                style={{ padding: "9px 12px", borderRadius: 8, border: "1px solid #fca5a5", background: "#fff", color: "#ef4444", cursor: "pointer", fontSize: "0.8rem", marginBottom: 0 }}>
                ✕
              </button>
            </div>
          ))}
          <button type="button" onClick={() => setSubEvents(prev => [...prev, { title: "", detail: "" }])}
            style={{ padding: "7px 16px", borderRadius: 8, border: "1px dashed #D26600", background: "#fff7ed", color: "#D26600", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, alignSelf: "flex-start" }}>
            + Add Sub-Event
          </button>
        </Section>

        {/* Posters */}
        <Section title="Event Posters">
          {existingPosters.length > 0 && (
            <div>
              <p style={{ fontSize: "0.78rem", color: "#6b7280", marginBottom: 8 }}>Current posters (click × to remove)</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {existingPosters.map((src, i) => {
                  const imgSrc = src.startsWith("http") ? src : `${url?.replace("/api/", "")}${src}`;
                  return (
                    <div key={i} style={{ position: "relative" }}>
                      <img src={imgSrc} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
                      <button type="button" onClick={() => removeExistingPoster(i)} style={{
                        position: "absolute", top: -6, right: -6, width: 20, height: 20,
                        borderRadius: "50%", background: "#ef4444", color: "#fff",
                        border: "none", cursor: "pointer", fontSize: "0.7rem", lineHeight: 1,
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>✕</button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          <Field label="Upload new posters (max 4)">
            <input type="file" accept="image/*" multiple onChange={handleFileChange}
              style={{ fontSize: "0.82rem", color: "#555" }} />
          </Field>
          {newPreviews.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 8 }}>
              {newPreviews.map((src, i) => (
                <img key={i} src={src} alt="" style={{ width: 90, height: 90, objectFit: "cover", borderRadius: 8, border: "1px solid #e5e7eb" }} />
              ))}
            </div>
          )}
        </Section>

        {/* Actions */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingBottom: 32, flexWrap: "wrap" }}>
          <button type="button" onClick={() => navigate(-1)} style={{
            padding: "10px 24px", borderRadius: 10, border: "1px solid #e2e8f0",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem", color: "#475569"
          }}>Cancel</button>
          {isDraft && (
            <button type="button" onClick={handlePublishDraft} disabled={loading} style={{
              padding: "10px 24px", borderRadius: 10, border: "none",
              background: "linear-gradient(135deg,#15803d,#22c55e)", color: "#fff",
              cursor: "pointer", fontWeight: 700, fontSize: "0.875rem", opacity: loading ? 0.7 : 1,
              boxShadow: "0 4px 12px rgba(21,128,61,0.3)"
            }}>{loading ? "Publishing…" : "✅ Publish for Approval"}</button>
          )}
          <button type="submit" disabled={loading} style={{
            padding: "10px 28px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg,#D26600,#f59e0b)", color: "#fff", cursor: "pointer",
            fontWeight: 700, fontSize: "0.875rem", opacity: loading ? 0.7 : 1,
            boxShadow: "0 4px 12px rgba(210,102,0,0.3)"
          }}>{loading ? "Saving…" : "Save Changes"}</button>
        </div>
      </form>
    </div>
  );
};

const Section = ({ title, children }) => (
  <div style={{ background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", flexDirection: "column", gap: 14 }}>
    <p style={{ margin: 0, fontSize: "0.82rem", fontWeight: 700, color: "#D26600", textTransform: "uppercase", letterSpacing: "0.05em" }}>{title}</p>
    {children}
  </div>
);

export default UpdateEvent;
