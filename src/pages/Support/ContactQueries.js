import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../../components/Popup";
import {
  TableCell, TableRow,
  Chip, Tooltip, IconButton, Box, Typography, TextField,
} from "@mui/material";
import AdminTable from "../Shared/AdminTable";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import MailIcon from "@mui/icons-material/MailRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import InputAdornment from "@mui/material/InputAdornment";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import ToggleButton from "@mui/material/ToggleButton";
import { useSortable } from "../Shared/sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2, whiteSpace: "nowrap" };

const typeColors = {
  Contact:    { bg: "rgba(37,99,235,0.08)",  color: "#2563eb" },
  Help:       { bg: "rgba(230,99,52,0.08)",  color: "#E66334" },
  Experience: { bg: "rgba(16,185,129,0.08)", color: "#10b981" },
  Feedback:   { bg: "rgba(139,92,246,0.08)", color: "#8b5cf6" },
  Report:     { bg: "rgba(239,68,68,0.08)",  color: "#ef4444" },
  Message:    { bg: "rgba(59,130,246,0.08)", color: "#3b82f6" },
};

const QUERY_TYPES = ["all", "contact", "help", "experience", "report", "feedback", "messages"];

const ContactQueries = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [queries, setQueries] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = adminData.designation === "superAdmin";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const h = { Authorization: `Bearer ${token}` };
    Promise.all([
      axios.get(url + "admin/contacts", { headers: h }),
      axios.get(url + "admin/contacts/messages", { headers: h }),
    ]).then(([qr, mr]) => {
      setQueries(qr.data.data || []);
      setChatMessages((mr.data.data || []).map(m => ({ ...m, queryType: "Message" })));
      axios.patch(url + "admin/contacts/mark-read", {}, { headers: h }).catch(() => {});
    }).catch(e => toast("Error fetching queries: " + e.message, "error"))
      .finally(() => setLoading(false));
  }, [url]);

  const handleDelete = async (q) => {
    if (!await confirmDialog("Delete this query?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(url + "admin/contact/" + q._id, { headers: { Authorization: `Bearer ${token}` } });
      setQueries(qs => qs.filter(x => x._id !== q._id));
      toast("Query deleted", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const baseFiltered = filterType === "messages"
    ? chatMessages.filter(m => !search || [m.firstName, m.lastName, m.email, m.subject, m.message].some(f => f?.toLowerCase().includes(search.toLowerCase())))
    : queries.filter(q => {
        const s = search.toLowerCase();
        const matchSearch = !s || [q.firstName, q.lastName, q.email, q.subject, q.message].some(f => f?.toLowerCase().includes(s));
        const matchType = filterType === "all" || q.queryType?.toLowerCase() === filterType;
        return matchSearch && matchType;
      });

  // reset page on filter change
  React.useEffect(() => { setPage(0); }, [search, filterType]);

  const { sorted: filtered, orderBy, order, handleSort } = useSortable(baseFiltered, "createdAt", "desc");
  const paged = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: "16px", sm: "28px 32px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" }, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)" }}>Contact Queries</Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", mt: 0.3 }}>{queries.length} total messages received</Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
          <ToggleButtonGroup size="small" value={filterType} exclusive onChange={(_, v) => v && setFilterType(v)}
            sx={{ background: "#f1f5f9", borderRadius: "10px", p: "3px", border: "1px solid #e2e8f0", flexWrap: "wrap", "& .MuiToggleButton-root": { border: "none", borderRadius: "8px !important", fontSize: "0.72rem", fontWeight: 600, px: 1.5, py: 0.6, color: "#64748b", textTransform: "capitalize", fontFamily: "var(--font-admin)", "&.Mui-selected": { background: "linear-gradient(135deg,#D26600,#f58021)", color: "#fff", "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" } } } }}>
            {QUERY_TYPES.map(t => <ToggleButton key={t} value={t}>{t}</ToggleButton>)}
          </ToggleButtonGroup>
          <TextField size="small" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 16, color: "#94a3b8" }} /></InputAdornment> }}
            sx={{ width: { xs: "100%", sm: 220 }, "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.82rem", "&.Mui-focused fieldset": { borderColor: "#D26600" } } }} />
        </Box>
      </Box>

      <AdminTable
        columns={[
          { label: "Date",    field: "createdAt" },
          { label: "Sender",  field: "firstName" },
          { label: "Contact", field: "email"     },
          { label: "Type",    field: "queryType" },
          { label: "Subject", field: "subject"   },
          { label: "Message" },
          { label: "Actions" },
        ]}
        rows={paged}
        loading={loading}
        emptyText="No queries found"
        orderBy={orderBy}
        order={order}
        onSort={handleSort}
        count={filtered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        maxHeight="calc(100vh - 320px)"
        renderRow={q => {
          const qType = q.queryType || "Contact";
          const tc = typeColors[qType] || typeColors.Contact;
          return (
            <TableRow key={q._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
              <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>
                <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{dayjs(q.createdAt).format("DD MMM YYYY")}</Typography>
                <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{dayjs(q.createdAt).format("hh:mm A")}</Typography>
              </TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#D26600,#f59e0b)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 700, flexShrink: 0 }}>
                    {(q.firstName || "?")[0].toUpperCase()}
                  </Box>
                  <Box>
                    <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>{q.firstName} {q.lastName}</Typography>
                    {q.user && <Typography sx={{ fontSize: "0.7rem", color: "#2563eb" }}>Registered</Typography>}
                  </Box>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}>
                <Typography sx={{ fontSize: "0.82rem" }}>{q.email}</Typography>
                <Typography sx={{ fontSize: "0.72rem", color: "#64748b" }}>{q.phone || "No phone"}</Typography>
              </TableCell>
              <TableCell sx={cellSx}>
                <Chip label={qType} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: tc.bg, color: tc.color, textTransform: "capitalize" }} />
              </TableCell>
              <TableCell sx={{ ...cellSx, maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: 600, color: "#0f172a" }}>
                {q.subject}
              </TableCell>
              <TableCell sx={{ ...cellSx, maxWidth: 300, minWidth: 180 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography sx={{ overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontSize: "0.8rem", color: "#475569", flex: 1 }}>{q.message}</Typography>
                  <Tooltip title="View full message">
                    <IconButton size="small" onClick={() => setSelectedMessage(q.message)} sx={{ flexShrink: 0, color: "#D26600", p: 0.3 }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  <Tooltip title="Reply via Email">
                    <IconButton size="small" component="a" href={`mailto:${q.email}?subject=Re: ${encodeURIComponent(q.subject)}`} sx={{ background: "#eff6ff", color: "#2563eb", borderRadius: "8px", "&:hover": { background: "#dbeafe" } }}><MailIcon sx={{ fontSize: 15 }} /></IconButton>
                  </Tooltip>
                  {isSuperAdmin && (
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => handleDelete(q)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
      />

      {selectedMessage && (
        <Box sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <Paper sx={{ p: 3, borderRadius: "16px", maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", mb: 2, fontFamily: "var(--font-admin)" }}>Full Message</Typography>
            <Typography sx={{ fontSize: "0.875rem", color: "#334155", lineHeight: 1.7, whiteSpace: "pre-wrap", maxHeight: "60vh", overflowY: "auto" }}>{selectedMessage}</Typography>
            <Box sx={{ mt: 3, textAlign: "right" }}>
              <button onClick={() => setSelectedMessage(null)} style={{ padding: "8px 20px", background: "#f1f5f9", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: 700, color: "#475569", fontFamily: "var(--font-admin)" }}>Close</button>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};

export default ContactQueries;
