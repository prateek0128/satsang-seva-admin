import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, IconButton, Box, Typography, TextField, Select,
  MenuItem, FormControl, Button,
} from "@mui/material";
import AdminTablePagination from "./AdminTablePagination";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/SearchRounded";
import FilterAltIcon from "@mui/icons-material/FilterAltRounded";
import ClearIcon from "@mui/icons-material/ClearRounded";
import { useSortable, SortCell, PlainCell } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2, whiteSpace: "nowrap" };

const statusColor = (s) => ({
  confirmed: { bg: "#f0fdf4", color: "#166534" },
  cancelled:  { bg: "#fef2f2", color: "#991b1b" },
  inprocess:  { bg: "#eff6ff", color: "#1d4ed8" },
})[s] || { bg: "#fffbeb", color: "#92400e" };

const EMPTY = { eventId: "", hostName: "", date: "", bookingId: "", status: "" };

const BookingList = () => {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(EMPTY);
  const [eventOptions, setEventOptions] = useState([]);
  const [hostOptions, setHostOptions] = useState([]);
  const { sorted: sortedBookings, orderBy, order, handleSort } = useSortable(bookings, "createdAt", "desc");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${url}admin/bookings/filter-options`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => { const d = r.data?.data ?? r.data; setEventOptions(d.events || []); setHostOptions(d.hosts || (d.hostNames || []).map(n => ({ value: n, label: n }))); })
      .catch(() => toast("Error loading filter options", "error"));
  }, [url]);

  useEffect(() => { setPage(1); }, [filters.eventId, filters.hostName, filters.date]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const params = { page, limit: 20, ...Object.fromEntries(Object.entries(filters).filter(([, v]) => v)) };
        const res = await axios.get(`${url}admin/bookings`, { headers: { Authorization: `Bearer ${token}` }, params });
        if (res.data.status === "success") { setBookings(res.data.data.bookings); setTotal(res.data.data.total); }
      } catch { toast("Error fetching bookings", "error"); }
      finally { setLoading(false); }
    };
    fetch();
  }, [page, filters, url]);

  const hasFilters = Object.values(filters).some(Boolean);
  const pageCount = Math.max(1, Math.ceil(total / 20));

  const selectSx = { "& .MuiOutlinedInput-root": { borderRadius: "10px", fontSize: "0.82rem", fontFamily: "var(--font-admin)", "&.Mui-focused fieldset": { borderColor: "#D26600" } } };

  if (loading && page === 1 && bookings.length === 0) return <Loader />;

  return (
    <Box sx={{ p: "28px 32px", minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)" }}>All Bookings</Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", mt: 0.3 }}>
            {hasFilters ? "Matching" : "Total"}: <strong style={{ color: "#D26600" }}>{total}</strong> bookings
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: "14px", mb: 3, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</Typography>
            {hasFilters && (
              <Chip label={`${Object.values(filters).filter(Boolean).length} active`} size="small"
                sx={{ fontSize: "0.62rem", fontWeight: 700, height: 18, background: "#fff7ed", color: "#D26600", border: "1px solid #fed7aa" }} />
            )}
          </Box>
          {hasFilters && (
            <Box component="button" onClick={() => setFilters(EMPTY)}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.72rem", fontWeight: 600, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", px: 1.2, py: 0.4, cursor: "pointer", "&:hover": { background: "#fee2e2" }, transition: "all 0.15s" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear all
            </Box>
          )}
        </Box>
        <Box sx={{ p: "12px 16px", display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
          <TextField size="small" placeholder="Search Booking ID" value={filters.bookingId} onChange={e => setFilters(f => ({ ...f, bookingId: e.target.value }))}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 180, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused fieldset": { borderColor: "#D26600" } } }} />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} displayEmpty
              sx={{ borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D26600" } }}>
              <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All Statuses</MenuItem>
              <MenuItem value="confirmed" sx={{ fontSize: "0.82rem" }}>Confirmed</MenuItem>
              <MenuItem value="inprocess" sx={{ fontSize: "0.82rem" }}>In Process</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 200 }}>
            <Select value={filters.eventId} onChange={e => setFilters(f => ({ ...f, eventId: e.target.value }))} displayEmpty
              sx={{ borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D26600" } }}>
              <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All Events</MenuItem>
              {eventOptions.map(ev => <MenuItem key={ev.id} value={ev.id} sx={{ fontSize: "0.82rem" }}>{ev.label}</MenuItem>)}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select value={filters.hostName} onChange={e => setFilters(f => ({ ...f, hostName: e.target.value }))} displayEmpty
              sx={{ borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#D26600" } }}>
              <MenuItem value="" sx={{ fontSize: "0.82rem" }}>All Hosts</MenuItem>
              {hostOptions.map(h => <MenuItem key={h.value} value={h.value} sx={{ fontSize: "0.82rem" }}>{h.label}</MenuItem>)}
            </Select>
          </FormControl>
          <TextField size="small" type="date" value={filters.date} onChange={e => setFilters(f => ({ ...f, date: e.target.value }))}
            sx={{ minWidth: 150, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused fieldset": { borderColor: "#D26600" } } }} />
        </Box>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 360px)", overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SortCell label="Booking ID" field="bookingId"  orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Event"      field="eventName"  orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Host"       field="hostName"   orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="User"       field="userName"   orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Tickets"    field="tickets"    orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Date"       field="createdAt"  orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Status"     field="status"     orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Action" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && bookings.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>Loading…</TableCell></TableRow>
              ) : bookings.length === 0 ? (
                <TableRow><TableCell colSpan={8} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>{hasFilters ? "No bookings match your filters." : "No bookings found."}</TableCell></TableRow>
              ) : sortedBookings.map(b => {
                const sc = statusColor(b.status);
                return (
                  <TableRow key={b._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                    <TableCell sx={cellSx}>
                      <Tooltip title="Click to copy" arrow>
                        <Box component="span" onClick={() => { navigator.clipboard.writeText(b.bookingId || b._id || ""); toast("Booking ID copied", "success"); }}
                          sx={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b", fontWeight: 700, background: "#f1f5f9", padding: "2px 8px", borderRadius: "6px", cursor: "pointer", display: "inline-block", border: "1px solid #e2e8f0", "&:hover": { background: "#e2e8f0", color: "#334155" }, transition: "all 0.15s" }}>
                          {b.bookingId || b._id}
                        </Box>
                      </Tooltip>
                    </TableCell>
                    <TableCell sx={cellSx}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>{b.event?.eventName || "N/A"}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{b.event?.eventId || ""}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}><Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{b.event?.hostName || b.event?.user?.name || "N/A"}</Typography></TableCell>
                    <TableCell sx={cellSx}>
                      <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{b.user?.name || "N/A"}</Typography>
                      <Typography sx={{ fontSize: "0.72rem", color: "#94a3b8" }}>{b.user?.userId || ""}</Typography>
                    </TableCell>
                    <TableCell sx={cellSx}>{b.tickets}</TableCell>
                    <TableCell sx={cellSx}>{dayjs(b.createdAt).format("DD MMM YYYY")}</TableCell>
                    <TableCell sx={cellSx}><Chip label={b.status} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: sc.bg, color: sc.color }} /></TableCell>
                    <TableCell sx={cellSx}>
                      <Tooltip title="View Details">
                        <IconButton size="small" onClick={() => navigate(`/admin/bookings/${b._id}`, { state: { booking: b } })} sx={{ background: "#eff6ff", color: "#2563eb", borderRadius: "8px", "&:hover": { background: "#dbeafe" } }}>
                          <VisibilityIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination
          count={total}
          page={page - 1}
          rowsPerPage={20}
          rowsPerPageOptions={[20]}
          onPageChange={(_, p) => setPage(p + 1)}
          onRowsPerPageChange={() => {}}
        />
      </Paper>
    </Box>
  );
};

export default BookingList;
