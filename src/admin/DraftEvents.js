import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, IconButton, Box, Typography, LinearProgress, Pagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActiveRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import { useSortable, SortCell, PlainCell } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2 };

const PAGE_SIZE = 15;

const DraftEvents = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const { sorted, orderBy, order, handleSort } = useSortable(events, "updatedAt", "desc");

  const headers = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => {
    axios.get(`${url}admin/events/drafts`, { headers: headers() })
      .then(r => setEvents(r.data.data?.events || []))
      .catch(e => toast(e.response?.data?.message || e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleRemind = async (ev) => {
    if (!await confirmDialog(`Send reminder to ${ev.user?.name || "the host"} for "${ev.eventName || "this draft"}"?`)) return;
    try { await axios.post(`${url}admin/events/drafts/${ev._id}/remind`, {}, { headers: headers() }); toast("Reminder sent", "success"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleDelete = async (ev) => {
    if (!await confirmDialog(`Delete draft "${ev.eventName || "this draft"}"?`)) return;
    try { await axios.delete(`${url}events/${ev._id}`, { headers: headers() }); setEvents(p => p.filter(x => x._id !== ev._id)); toast("Draft deleted", "success"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  return (
    <Box sx={{ p: "28px 32px", minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)" }}>Draft Events</Typography>
          {events.length > 0 && <Chip label={`${events.length} drafts`} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", height: 22 }} />}
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>View incomplete event listings and prompt hosts to finish them.</Typography>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 300px)", overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SortCell label="Event ID"     field="eventId"   orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Event"        field="eventName" orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Category" />
                <SortCell label="Host"         field="user.name" orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Host Email"   field="user.email" orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Progress" />
                <SortCell label="Last Updated" field="updatedAt" orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Actions" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>Loading draft events…</TableCell></TableRow>
              ) : events.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} sx={{ textAlign: "center", py: 8 }}>
                    <Typography sx={{ color: "#94a3b8", fontWeight: 600 }}>No drafts found</Typography>
                    <Typography sx={{ color: "#cbd5e1", fontSize: "0.78rem", mt: 0.5 }}>All event listings are complete.</Typography>
                  </TableCell>
                </TableRow>
              ) : sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(ev => (
                <TableRow key={ev._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                  <TableCell sx={cellSx}>
                    <Tooltip title="Click to copy" arrow>
                      <Box component="span" onClick={() => { navigator.clipboard.writeText(ev.eventId || ev._id || ""); toast("Event ID copied", "success"); }}
                        sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-block", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                        {ev.eventId || "—"}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ ...cellSx, maxWidth: 200 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      <Box sx={{ width: 36, height: 36, borderRadius: "8px", overflow: "hidden", flexShrink: 0, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {ev.eventPosters?.[0] ? <img src={ev.eventPosters[0].startsWith("http") ? ev.eventPosters[0] : `${url?.replace("/api/", "")}${ev.eventPosters[0]}`} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={e => e.target.style.display = "none"} />
                          : <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f58021" }}>{ev.eventName?.[0] || "D"}</span>}
                      </Box>
                      <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{ev.eventName || "Untitled Draft"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={cellSx}>{ev.eventCategory?.[0] ? <Chip label={ev.eventCategory[0]} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fff7ed", color: "#f58021", height: 22 }} /> : "—"}</TableCell>
                  <TableCell sx={cellSx}>{ev.user?.name || "—"}</TableCell>
                  <TableCell sx={cellSx}>{ev.user?.email || "—"}</TableCell>
                  <TableCell sx={{ ...cellSx, minWidth: 140 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <LinearProgress variant="determinate" value={ev.formProgress || 0} sx={{ flex: 1, height: 6, borderRadius: 3, background: "#f1f5f9", "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#D26600,#f58021,#ffa726)", borderRadius: 3 } }} />
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", minWidth: 32 }}>{ev.formProgress || 0}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={cellSx}>{ev.updatedAt ? dayjs(ev.updatedAt).format("DD MMM YYYY, HH:mm") : "—"}</TableCell>
                  <TableCell sx={cellSx}>
                    <Box sx={{ display: "flex", gap: 0.6 }}>
                      <Tooltip title="View"><IconButton size="small" onClick={() => window.open(`/event/${ev._id}`, "_blank")} sx={{ background: "#f9fafb", color: "#374151", borderRadius: "8px", "&:hover": { background: "#f3f4f6" } }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/admin/updateevent/${ev._id}`)} sx={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      <Tooltip title="Send Reminder"><IconButton size="small" onClick={() => handleRemind(ev)} sx={{ background: "#eff6ff", color: "#2563eb", borderRadius: "8px", "&:hover": { background: "#dbeafe" } }}><NotificationsActiveIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(ev)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        {Math.ceil(sorted.length / PAGE_SIZE) > 1 && (
          <Box sx={{ px: 2.5, py: 1.5, display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", background: "#f8fafc" }}>
            <Typography sx={{ fontSize: "0.78rem", color: "#64748b" }}>Page {page} of {Math.ceil(sorted.length / PAGE_SIZE)} ({sorted.length} drafts)</Typography>
            <Pagination count={Math.ceil(sorted.length / PAGE_SIZE)} page={page} onChange={(_, v) => setPage(v)} size="small"
              sx={{ "& .MuiPaginationItem-root": { fontWeight: 600, borderRadius: "8px", fontSize: "0.78rem" }, "& .Mui-selected": { background: "linear-gradient(135deg,#D26600,#f58021) !important", color: "#fff", boxShadow: "0 2px 8px rgba(245,128,33,0.35)" } }} />
          </Box>
        )}
      </Paper>
    </Box>
  );
};

export default DraftEvents;
