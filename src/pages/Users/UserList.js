import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../../components/Popup";
import {
  TableCell, TableRow,
  Chip, Tooltip, IconButton, Box, Typography, TextField,
  ToggleButtonGroup, ToggleButton, Skeleton,
} from "@mui/material";
import AdminTable from "../Shared/AdminTable";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import PeopleIcon from "@mui/icons-material/PeopleRounded";
import HowToRegIcon from "@mui/icons-material/HowToRegRounded";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircleRounded";
import PendingActionsIcon from "@mui/icons-material/PendingActionsRounded";
import InputAdornment from "@mui/material/InputAdornment";
import { useSortable } from "../Shared/sortable";
import usePermission from "../../hooks/usePermission";

const BRAND = "#f58021";
const cellSx = { fontSize: "0.82rem", color: "#334155", whiteSpace: "nowrap", py: 1.5, px: 2 };

const StatCard = ({ label, value, icon, color, light, loading }) => (
  <Box sx={{
    background: "#fff", borderRadius: "16px", p: "20px 22px",
    border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    display: "flex", alignItems: "center", gap: 2,
    position: "relative", overflow: "hidden",
    transition: "box-shadow 0.25s, transform 0.25s",
    "&:hover": { boxShadow: `0 8px 28px rgba(245,128,33,0.15), 0 0 0 1px ${color}22`, transform: "translateY(-2px)" },
  }}>
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},#f58021,#ffa726)`, borderRadius: "16px 16px 0 0" }} />
    <Box sx={{ width: 46, height: 46, borderRadius: "13px", background: light, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0, boxShadow: `0 4px 16px ${color}33`, position: "relative", overflow: "hidden" }}>
      <Box sx={{ position: "absolute", inset: 0, background: "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.35), transparent 60%)", pointerEvents: "none" }} />
      <Box sx={{ position: "relative", zIndex: 1 }}>{icon}</Box>
    </Box>
    <Box>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</Typography>
      {loading
        ? <Skeleton width={48} height={32} sx={{ borderRadius: "6px" }} />
        : <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px", lineHeight: 1.1 }}>{value?.toLocaleString() ?? "—"}</Typography>
      }
    </Box>
  </Box>
);

const badgeColor = (type) =>
  type === "admin"   ? { bg: "#fef3c7", color: "#92400e", border: "#fde68a" } :
  type === "host"    ? { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" } :
                       { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };

const UserList = () => {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { can, isSuperAdmin } = usePermission();

  useEffect(() => {
    const fetch = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(url + "users", { headers: { Authorization: `Bearer ${token}` } });
        setUsers(res.data.data?.users || res.data.users || []);
      } catch (e) { toast("Error fetching users", "error"); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleDelete = async (user) => {
    if (!await confirmDialog(`Delete ${user.name || "this user"}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(url + "admin/user/" + user._id, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(u => u.filter(x => x._id !== user._id));
      toast("User deleted", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const visibleUsers = isSuperAdmin ? users : users.filter(u => u.userType !== "participant");

  const baseFiltered = visibleUsers.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s);
    const matchType = filterType === "all" || u.userType === filterType;
    return matchSearch && matchType;
  });

  const { sorted: allFiltered, orderBy, order, handleSort } = useSortable(baseFiltered, "createdAt", "desc");
  const filtered = allFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  const totalHosts = visibleUsers.filter(u => u.userType === "host").length;
  const totalParticipants = visibleUsers.filter(u => u.userType === "participant").length;
  const pendingHosts = visibleUsers.filter(u => u.userType === "host" && !u.approved).length;

  const stats = [
    { label: "Total Users",    value: visibleUsers.length, icon: <PeopleIcon sx={{ fontSize: 20 }} />,              color: "#2563eb", light: "#eff6ff" },
    { label: "Hosts",          value: totalHosts,         icon: <SupervisedUserCircleIcon sx={{ fontSize: 20 }} />, color: BRAND,     light: "#fff7ed" },
    ...(isSuperAdmin ? [{ label: "Participants", value: totalParticipants, icon: <HowToRegIcon sx={{ fontSize: 20 }} />, color: "#059669", light: "#f0fdf4" }] : []),
    { label: "Pending Hosts",  value: pendingHosts,       icon: <PendingActionsIcon sx={{ fontSize: 20 }} />,       color: "#7c3aed", light: "#f5f3ff" },
  ];
  const filterOptions = isSuperAdmin ? ["all", "host", "participant"] : ["all", "host"];

  return (
    <Box sx={{ p: { xs: "16px", sm: "24px 28px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)" }}>

      {/* ── Breadcrumb + Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Admin / Users
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em", lineHeight: 1.2 }}>
              User Management
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mt: 0.4, fontWeight: 500 }}>
              {loading ? "Loading…" : `${visibleUsers.length} total registered users`}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* ── Stat Cards ── */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(180px, 1fr))" }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
        {stats.map((s, i) => <StatCard key={i} loading={loading} {...s} />)}
      </Box>

      {/* ── Filters Bar ── */}
      <Box sx={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: "14px", mb: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <Box sx={{ px: 2, py: 1.2, borderBottom: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} />
            <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em" }}>Filters</Typography>
          </Box>
          {(search || filterType !== "all") && (
            <Box component="button" onClick={() => { setSearch(""); setFilterType("all"); setPage(0); }}
              sx={{ display: "flex", alignItems: "center", gap: 0.5, fontSize: "0.72rem", fontWeight: 600, color: "#ef4444", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "6px", px: 1.2, py: 0.4, cursor: "pointer", "&:hover": { background: "#fee2e2" }, transition: "all 0.15s" }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              Clear
            </Box>
          )}
        </Box>
        <Box sx={{ p: "12px 16px", display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <ToggleButtonGroup size="small" value={filterType} exclusive onChange={(_, v) => { v && setFilterType(v); setPage(0); }}
            sx={{ background: "#f8fafc", borderRadius: "8px", p: "2px", border: "1px solid #e2e8f0", flexShrink: 0,
              "& .MuiToggleButton-root": { border: "none", borderRadius: "6px !important", fontSize: "0.75rem", fontWeight: 600, px: 1.8, py: 0.5, color: "#64748b", textTransform: "capitalize",
                "&.Mui-selected": { background: "linear-gradient(135deg,#D26600,#f58021)", color: "#fff", boxShadow: "0 2px 8px rgba(245,128,33,0.3)", "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" } } } }}>
            {filterOptions.map(t => <ToggleButton key={t} value={t}>{t}</ToggleButton>)}
          </ToggleButtonGroup>
          <TextField size="small" placeholder="Search name, email, phone…" value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused fieldset": { borderColor: BRAND } } }} />
        </Box>
      </Box>

      {/* ── Table ── */}
      <AdminTable
        columns={[
          { label: "User ID",    field: "userId"        },
          { label: "Name",       field: "name"          },
          { label: "Type",       field: "userType"      },
          { label: "Performer",  field: "performerType" },
          { label: "Approved",   field: "approved"      },
          { label: "Email",      field: "email"         },
          { label: "Phone",      field: "phone"         },
          { label: "Registered", field: "createdAt"     },
          { label: "Actions" },
        ]}
        rows={filtered}
        loading={loading}
        emptyText={search ? "Try adjusting your search or filter" : "No users have registered yet"}
        orderBy={orderBy}
        order={order}
        onSort={handleSort}
        count={allFiltered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        maxHeight="calc(100vh - 380px)"
        sx={{ boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}
        renderRow={user => {
          const bc = badgeColor(user.userType);
          return (
            <TableRow
              key={user._id}
              hover
              sx={{ "&:hover": { background: "#fafbff" }, "&:hover .row-actions": { opacity: 1 }, transition: "background 0.15s", cursor: "default" }}
            >
              <TableCell sx={cellSx}>
                <Tooltip title="Click to copy">
                  <Box component="span" onClick={() => { navigator.clipboard.writeText(user.userId || user._id); toast("ID copied", "success"); }}
                    sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                    {user.userId || user._id || "—"}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  {user.profilePicture ? (
                    <Box component="img" src={user.profilePicture.startsWith("http") ? user.profilePicture : `${url.replace("/api/", "/")}${user.profilePicture}`} alt="" onError={e => e.target.style.display = "none"} sx={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover", border: "2px solid #e2e8f0", flexShrink: 0 }} />
                  ) : (
                    <Box sx={{ width: 34, height: 34, borderRadius: "50%", flexShrink: 0, background: "linear-gradient(135deg,#D26600,#f58021,#ffa726)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "0.75rem", fontWeight: 800, border: "2px solid #fff", boxShadow: "0 2px 10px rgba(245,128,33,0.4)" }}>
                      {(user.name || "?")[0].toUpperCase()}
                    </Box>
                  )}
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem", lineHeight: 1.2 }}>{user.name || "—"}</Typography>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}>
                <Chip label={user.userType || "—"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: bc.bg, color: bc.color, border: `1px solid ${bc.border}` }} />
              </TableCell>
              <TableCell sx={cellSx}>
                {user.performerType
                  ? <Chip label={user.performerType} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, textTransform: "capitalize", background: "#fce7f3", color: "#be185d", border: "1px solid #fbcfe8" }} />
                  : <Typography component="span" sx={{ color: "#cbd5e1", fontSize: "0.8rem" }}>—</Typography>}
              </TableCell>
              <TableCell sx={cellSx}>
                {user.userType === "host" ? (
                  <Chip label={user.approved ? "Approved" : "Pending"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: user.approved ? "#f0fdf4" : "#fef2f2", color: user.approved ? "#166534" : "#991b1b", border: `1px solid ${user.approved ? "#bbf7d0" : "#fecaca"}` }} />
                ) : <Typography component="span" sx={{ color: "#cbd5e1", fontSize: "0.8rem" }}>—</Typography>}
              </TableCell>
              <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                <Tooltip title="Click to copy">
                  <Box component="span" onClick={() => { navigator.clipboard.writeText(user.email || ""); toast("Email copied", "success"); }}
                    sx={{ cursor: "pointer", display: "block", overflow: "hidden", textOverflow: "ellipsis", color: "#475569", "&:hover": { color: "#2563eb", textDecoration: "underline" }, transition: "color 0.15s" }}>
                    {user.email || "—"}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={cellSx}>
                <Typography sx={{ color: "#475569", fontSize: "0.82rem" }}>{user.phone || "—"}</Typography>
              </TableCell>
              <TableCell sx={cellSx}>
                {user.createdAt ? (
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>{dayjs(user.createdAt).format("DD MMM YYYY")}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{dayjs(user.createdAt).format("hh:mm A")}</Typography>
                  </Box>
                ) : "—"}
              </TableCell>
              <TableCell sx={cellSx}>
                <Box className="row-actions" sx={{ display: "flex", gap: 0.6, opacity: { xs: 1, md: 0.6 }, transition: "opacity 0.2s" }}>
                  <Tooltip title="View Profile" arrow>
                    <IconButton size="small" onClick={() => navigate(`/admin/userdetails/${user._id}`)} sx={{ background: "#eff6ff", color: "#2563eb", borderRadius: "8px", width: 30, height: 30, "&:hover": { background: "#dbeafe", transform: "scale(1.08)" }, transition: "all 0.18s" }}>
                      <VisibilityIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  {can("allusers", "edit") && (
                  <Tooltip title="Edit User" arrow>
                    <IconButton size="small" onClick={() => navigate(`/admin/updateuser/${user._id}`)} sx={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", width: 30, height: 30, "&:hover": { background: "#dcfce7", transform: "scale(1.08)" }, transition: "all 0.18s" }}>
                      <EditIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  )}
                  {can("allusers", "delete") && (
                    <Tooltip title="Delete User" arrow>
                      <IconButton size="small" onClick={() => handleDelete(user)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", width: 30, height: 30, "&:hover": { background: "#fee2e2", transform: "scale(1.08)" }, transition: "all 0.18s" }}>
                        <DeleteIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
      />
    </Box>
  );
};

export default UserList;
