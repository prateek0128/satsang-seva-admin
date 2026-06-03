import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import Loader from "../components/Loader";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, IconButton, Box, Typography, TextField, Select,
  MenuItem, FormControl, Pagination,
} from "@mui/material";
import InputAdornment from "@mui/material/InputAdornment";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import CancelIcon from "@mui/icons-material/CancelRounded";
import StarIcon from "@mui/icons-material/StarRounded";
import StarBorderIcon from "@mui/icons-material/StarBorderRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import GroupsIcon from "@mui/icons-material/GroupsRounded";
import { useSortable, SortCell, PlainCell } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2 };
const CATS = ["Satsang", "Kirtan", "Sabha", "Yoga", "Utsav", "Adhyatmik", "Puja", "Seva & Charity", "Sanskritik", "Vividh"];
const PAGE_SIZE = 12;

const Events = () => {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draftsCount, setDraftsCount] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ eventName: "", host: "", place: "", category: "", status: "all", language: "", type: "all" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    const h = { Authorization: `Bearer ${token}` };
    setLoading(true);
    Promise.all([
      axios.get(`${url}events?limit=1000`, { headers: h }),
      axios.get(`${url}admin/events/drafts`, { headers: h }),
    ]).then(([evRes, draftRes]) => {
      setAllEvents(evRes.data.data?.events || evRes.data.events || []);
      setDraftsCount(draftRes.data.data?.events?.length || 0);
    }).catch(() => toast("Error fetching events", "error"))
      .finally(() => setLoading(false));
  }, [url]);

  const setF = (key, val) => { setFilters(f => ({ ...f, [key]: val })); setPage(1); };

  const baseFiltered = useMemo(() => allEvents.filter(e => {
    const s = filters;
    return (!s.eventName || e.eventName?.toLowerCase().includes(s.eventName.toLowerCase()))
      && (!s.host || e.hostName?.toLowerCase().includes(s.host.toLowerCase()))
      && (!s.place || e.city?.toLowerCase().includes(s.place.toLowerCase()) || e.address?.toLowerCase().includes(s.place.toLowerCase()))
      && (!s.category || e.eventCategory?.includes(s.category))
      && (s.status === "all" || (s.status === "approved" ? e.approved : !e.approved))
      && (!s.language || e.eventLang === s.language)
      && (s.type === "all" || (s.type === "free" ? e.eventPrice === "0" : e.eventPrice !== "0"));
  }), [allEvents, filters]);

  const { sorted: filtered, orderBy, order, handleSort } = useSortable(baseFiltered, "startDate", "asc");

  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);

  const stats = useMemo(() => ({
    total: allEvents.length,
    pending: allEvents.filter(e => !e.approved).length,
    popular: allEvents.filter(e => e.isPopular).length,
    drafts: draftsCount,
  }), [allEvents, draftsCount]);

  const h = () => { const t = localStorage.getItem("token"); return { Authorization: `Bearer ${t}` }; };

  const handleDelete = async (ev) => {
    if (!await confirmDialog(`Delete "${ev.eventName}"?`)) return;
    try { await axios.delete(`${url}events/${ev._id}`, { headers: h() }); setAllEvents(p => p.filter(e => e._id !== ev._id)); toast("Event deleted", "success"); }
    catch { toast("Failed to delete", "error"); }
  };
  const handleTogglePopular = async (ev) => {
    try {
      const res = await axios.post(`${url}admin/events/${ev._id}/toggle-popular`, {}, { headers: h() });
      setAllEvents(p => p.map(e => e._id === ev._id ? { ...e, isPopular: res.data.data.isPopular } : e));
      toast(res.data.data.isPopular ? "Marked as Popular" : "Unmarked from Popular", "success");
    } catch { toast("Failed to update popularity", "error"); }
  };
  const handleApprove = async (ev) => {
    if (!await confirmDialog(`Approve "${ev.eventName}"?`)) return;
    try {
      await axios.put(`${url}admin/events/approve/${ev._id}`, {}, { headers: h() });
      setAllEvents(p => p.map(e => e._id === ev._id ? { ...e, approved: true, approvedAt: new Date().toISOString() } : e));
      toast("Event approved", "success");
    }
    catch { toast("Approval failed", "error"); }
  };
  const handleReject = async (ev) => {
    if (!await confirmDialog(`Reject "${ev.eventName}"?`)) return;
    try { await axios.put(`${url}admin/events/reject/${ev._id}`, {}, { headers: h() }); setAllEvents(p => p.map(e => e._id === ev._id ? { ...e, approved: false } : e)); toast("Event rejected", "info"); }
    catch { toast("Rejection failed", "error"); }
  };

  return (
    <Box sx={{ p: "28px 32px", background: "#f4f6fb", minHeight: "100vh", fontFamily: "var(--font-admin)" }}>
      {loading && <Loader />}

      {/* Header */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)", mb: 0.5 }}>Events Management</Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>Manage and moderate all spiritual events on the platform</Typography>
      </Box>

      {/* Stats row */}
      <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
        {[
          { label: "Total Events", value: stats.total, color: "#0f172a", border: "#e2e8f0" },
          { label: "Pending Approval", value: stats.pending, color: "#d97706", border: "#f59e0b", click: () => navigate("/admin/approvals") },
          { label: "Popular Events", value: stats.popular, color: "#D26600", border: "#D26600" },
          { label: "Draft Events", value: stats.drafts, color: "#64748b", border: "#94a3b8", click: () => navigate("/admin/drafts") },
        ].map((s, i) => (
          <Paper key={i} elevation={0} onClick={s.click} sx={{ flex: 1, minWidth: 160, p: "16px 20px", borderRadius: "14px", border: `1px solid #e2e8f0`, borderLeft: `4px solid ${s.border}`, cursor: s.click ? "pointer" : "default", transition: "all 0.2s", "&:hover": s.click ? { boxShadow: "0 4px 16px rgba(0,0,0,0.08)", transform: "translateY(-1px)" } : {} }}>
            <Typography sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em", mb: 0.5 }}>{s.label}</Typography>
            <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: s.color, letterSpacing: "-1px", fontFamily: "var(--font-admin)" }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Filters */}
      <Box sx={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: "14px", mb: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</Typography>
            {Object.values(filters).some(v => v && v !== "all") && (
              <Chip label={`${Object.values(filters).filter(v => v && v !== "all").length} active`} size="small"
                sx={{ fontSize: "0.62rem", fontWeight: 700, height: 18, background: "#fff7ed", color: "#D26600", border: "1px solid #fed7aa" }} />
            )}
          </Box>
          {Object.values(filters).some(v => v && v !== "all") && (
            <Box component="button" onClick={() => { setFilters({ eventName: "", host: "", place: "", category: "", status: "all", language: "", type: "all" }); setPage(1); }}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.72rem", fontWeight: 600, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", px: 1.2, py: 0.4, cursor: "pointer", "&:hover": { background: "#fee2e2" }, transition: "all 0.15s" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear all
            </Box>
          )}
        </Box>
        <Box sx={{ p: "12px 16px", display: "flex", flexDirection: "column", gap: 1.5 }}>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {[["eventName", "Search event name…"], ["host", "Search host…"], ["place", "Search city / place…"]].map(([key, ph]) => (
              <TextField key={key} size="small" placeholder={ph} value={filters[key]} onChange={e => setF(key, e.target.value)}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} /></InputAdornment> }}
                sx={{ flex: 1, minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused fieldset": { borderColor: "#D26600" } } }} />
            ))}
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            {[
              { key: "category", options: [["", "All Categories"], ...CATS.map(c => [c, c])] },
              { key: "status",   options: [["all", "All Status"], ["approved", "Approved"], ["pending", "Pending"]] },
              { key: "language", options: [["", "All Languages"], ["Hindi", "Hindi"], ["English", "English"], ["Hindi & English", "Hindi & English"]] },
              { key: "type",     options: [["all", "Free & Paid"], ["free", "Free Events"], ["paid", "Paid Events"]] },
            ].map(({ key, options }) => (
              <FormControl key={key} size="small" sx={{ flex: 1, minWidth: 150 }}>
                <Select value={filters[key]} onChange={e => setF(key, e.target.value)} displayEmpty
                  sx={{ borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D26600" } }}>
                  {options.map(([val, lbl]) => <MenuItem key={val} value={val} sx={{ fontSize: "0.82rem" }}>{lbl}</MenuItem>)}
                </Select>
              </FormControl>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <SortCell label="Event ID"    field="eventId"   orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Event"       field="eventName" orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Host"        field="hostName"  orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Category" />
                <SortCell label="Date & Price" field="startDate" orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Timing" />
                <SortCell label="Engagement"  field="viewCount" orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Created"     field="createdAt" orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Status"      field="approved"   orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Approved On"  field="approvedAt" orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Actions" />
              </TableRow>
            </TableHead>
            <TableBody>
              {paged.length === 0 ? (
                <TableRow><TableCell colSpan={11} sx={{ textAlign: "center", py: 8, color: "#94a3b8" }}>No events found matching your criteria.</TableCell></TableRow>
              ) : paged.map(ev => {
                const poster = ev.eventPosters?.[0];
                const src = poster ? (poster.startsWith("http") ? poster : `${url.replace("/api/", "/")}${poster}`) : null;
                const isPast = ev.endDate || ev.startDate ? dayjs(ev.endDate || ev.startDate).endOf("day").isBefore(dayjs()) : false;
                return (
                  <TableRow key={ev._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                    <TableCell sx={cellSx}>
                      <Tooltip title="Click to copy" arrow>
                        <Box component="span" onClick={() => { navigator.clipboard.writeText(ev.eventId || ev._id || ""); toast("Event ID copied", "success"); }}
                          sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-block", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                          {ev.eventId || "—"}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, maxWidth: 220 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                        <img src={src || "https://via.placeholder.com/40"} alt="" onError={e => e.target.src = "https://via.placeholder.com/40"} style={{ width: 40, height: 40, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} />
                        <Box>
                          <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>{ev.eventName}</Typography>
                          <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>{ev.city}, {ev.country}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{ev.hostName || "—"}</TableCell>
                    <TableCell sx={cellSx}>
                      <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                        {ev.eventCategory?.slice(0, 2).map((c, i) => <Chip key={i} label={c} size="small" sx={{ fontSize: "0.65rem", fontWeight: 700, height: 20, background: "#eff6ff", color: "#1e40af" }} />)}
                        {ev.eventCategory?.length > 2 && <Chip label={`+${ev.eventCategory.length - 2}`} size="small" sx={{ fontSize: "0.65rem", height: 20, background: "#f1f5f9", color: "#475569" }} />}
                      </Box>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{ev.startDate ? dayjs(ev.startDate).format("DD MMM YYYY") : "—"}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>to {ev.endDate ? dayjs(ev.endDate).format("DD MMM YYYY") : "—"}</Typography>
                      <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: ev.eventPrice === "0" ? "#15803d" : "#D26600", mt: 0.3 }}>{ev.eventPrice === "0" ? "FREE" : `₹${ev.eventPrice}`}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}><Chip label={isPast ? "Past" : "Upcoming"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: isPast ? "#f1f5f9" : "#ecfdf5", color: isPast ? "#475569" : "#047857" }} /></TableCell>
                    <TableCell sx={cellSx}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, mb: 0.4 }}>
                        <VisibilityOutlinedIcon sx={{ fontSize: 13, color: "#94a3b8" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#64748b" }}>{ev.viewCount || 0}</Typography>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <GroupsIcon sx={{ fontSize: 13, color: "#059669" }} />
                        <Typography sx={{ fontSize: "0.75rem", color: "#059669" }}>{ev.bookings?.length || 0}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{ev.createdAt ? dayjs(ev.createdAt).format("DD MMM YYYY") : "—"}</Typography>
                      <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{ev.createdAt ? dayjs(ev.createdAt).format("hh:mm A") : ""}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Chip label={ev.approved ? "Approved" : "Pending"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: ev.approved ? "#f0fdf4" : "#fff7ed", color: ev.approved ? "#166534" : "#9a3412" }} />
                    </TableCell>
                    <TableCell sx={cellSx}>
                      {ev.approvedAt ? (
                        <Box>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.82rem", color: "#166534" }}>{dayjs(ev.approvedAt).format("DD MMM YYYY")}</Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{dayjs(ev.approvedAt).format("hh:mm A")}</Typography>
                        </Box>
                      ) : (
                        <Typography sx={{ fontSize: "0.75rem", color: "#cbd5e1" }}>—</Typography>
                      )}
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Box sx={{ display: "flex", gap: 0.5 }}>
                        <Tooltip title={ev.isPopular ? "Unmark Popular" : "Mark Popular"}>
                          <IconButton size="small" onClick={() => handleTogglePopular(ev)} sx={{ background: ev.isPopular ? "#fffbeb" : "#f1f5f9", color: ev.isPopular ? "#f59e0b" : "#94a3b8", borderRadius: "8px", "&:hover": { background: "#fef3c7" } }}>
                            {ev.isPopular ? <StarIcon sx={{ fontSize: 15 }} /> : <StarBorderIcon sx={{ fontSize: 15 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/admin/event/${ev._id}`)} sx={{ background: "#f9fafb", color: "#374151", borderRadius: "8px", "&:hover": { background: "#f3f4f6" } }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/admin/updateevent/${ev._id}`)} sx={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                        {!ev.approved
                          ? <Tooltip title="Approve"><IconButton size="small" onClick={() => handleApprove(ev)} sx={{ background: "#f0fdf4", color: "#15803d", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><CheckCircleIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                          : <Tooltip title="Reject"><IconButton size="small" onClick={() => handleReject(ev)} sx={{ background: "#fef2f2", color: "#ef4444", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><CancelIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>}
                        <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(ev)} sx={{ background: "#fef2f2", color: "#ef4444", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Footer */}
        <Box sx={{ px: 2.5, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
          <Typography sx={{ fontSize: "0.82rem", color: "#64748b", fontFamily: "var(--font-admin)" }}>
            Page {page} of {pageCount || 1} ({filtered.length} events)
          </Typography>
          {pageCount > 1 && (
            <Pagination count={pageCount} page={page} onChange={(_, v) => setPage(v)} size="small"
              sx={{ "& .MuiPaginationItem-root": { fontFamily: "var(--font-admin)", fontWeight: 600, borderRadius: "8px", fontSize: "0.78rem" }, "& .Mui-selected": { background: "#D26600 !important", color: "#fff" } }} />
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default Events;
