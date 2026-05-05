import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const CATEGORIES = [
  "Satsang", "Yoga", "Meditation", "Kirtan", "Utsavs",
  "Dharma Sabha", "Adhyatmik Shivir", "Seva & Charity",
  "Sanskritik", "Puja", "Vividh (Others)", "Spiritual",
];

const LANGUAGES = ["Hindi", "English", "Gujarati", "Marathi", "Bengali", "Tamil", "Telugu", "Kannada", "Other"];

const inputStyle = {
  width: "100%", padding: "9px 12px", borderRadius: 8,
  border: "1px solid #e5e7eb", fontSize: "0.875rem",
  outline: "none", boxSizing: "border-box", background: "#fff",
};

const labelStyle = { fontSize: "0.78rem", fontWeight: 600, color: "#374151", marginBottom: 4, display: "block" };

const Field = ({ label, children }) => (
  <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

const UpdateEvent = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  const [form, setForm] = useState({
    eventName: "", eventDesc: "", eventCategory: [],
    eventPrice: "0", eventLang: "Hindi",
    performerName: "", hostName: "", hostWhatsapp: "", sponserName: "",
    eventLink: "", eventAddress: "", address2: "", landmark: "",
    city: "", province: "", postalCode: "", country: "",
    startDate: "", endDate: "", startTime: "", endTime: "",
    noOfAttendees: "", visibility: "public",
  });
  const [subEvents, setSubEvents] = useState([{ title: "", detail: "" }]);
  const [existingPosters, setExistingPosters] = useState([]);
  const [newFiles, setNewFiles] = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchError, setFetchError] = useState(null);

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
        });
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

  const set = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

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
      const fields = { ...form, subEvents: JSON.stringify(subEvents) };
      Object.entries(fields).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach(item => formData.append(k, item));
        else if (v !== "") formData.append(k, v);
      });
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
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "24px 16px" }}>
      {loading && <Loader />}

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
        <button onClick={() => navigate("/admin/events")} style={{
          background: "none", border: "1px solid #e5e7eb", borderRadius: 8,
          padding: "6px 14px", cursor: "pointer", fontSize: "0.82rem", color: "#555",
        }}>← Back</button>
        <h1 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700, color: "#111" }}>Edit Event</h1>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Price (₹) — set 0 for free">
              <input style={inputStyle} type="number" min="0" value={form.eventPrice} onChange={set("eventPrice")} />
            </Field>
            <Field label="Expected Attendees">
              <input style={inputStyle} value={form.noOfAttendees} onChange={set("noOfAttendees")} />
            </Field>
          </div>
        </Section>

        {/* People */}
        <Section title="People">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
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
          <Field label="Address Line 1">
            <input style={inputStyle} value={form.eventAddress} onChange={set("eventAddress")} />
          </Field>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Field label="Address Line 2">
              <input style={inputStyle} value={form.address2} onChange={set("address2")} />
            </Field>
            <Field label="Landmark">
              <input style={inputStyle} value={form.landmark} onChange={set("landmark")} />
            </Field>
            <Field label="City">
              <input style={inputStyle} value={form.city} onChange={set("city")} />
            </Field>
            <Field label="State / Province">
              <input style={inputStyle} value={form.province} onChange={set("province")} />
            </Field>
            <Field label="Postal Code">
              <input style={inputStyle} value={form.postalCode} onChange={set("postalCode")} />
            </Field>
            <Field label="Country">
              <input style={inputStyle} value={form.country} onChange={set("country")} />
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
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", paddingBottom: 32 }}>
          <button type="button" onClick={() => navigate("/admin/events")} style={{
            padding: "10px 24px", borderRadius: 8, border: "1px solid #e5e7eb",
            background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.875rem",
          }}>Cancel</button>
          <button type="submit" disabled={loading} style={{
            padding: "10px 28px", borderRadius: 8, border: "none",
            background: "#D26600", color: "#fff", cursor: "pointer",
            fontWeight: 700, fontSize: "0.875rem", opacity: loading ? 0.7 : 1,
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
