import React, { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import {
  Box, Chip, IconButton, InputAdornment, Skeleton, TableCell,
  TableRow, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import PersonOffIcon from "@mui/icons-material/PersonOffRounded";
import PeopleIcon from "@mui/icons-material/PeopleRounded";
import SearchIcon from "@mui/icons-material/SearchRounded";
import SupervisedUserCircleIcon from "@mui/icons-material/SupervisedUserCircleRounded";
import HowToRegIcon from "@mui/icons-material/HowToRegRounded";
import AdminTable from "../Shared/AdminTable";
import { useSortable } from "../Shared/sortable";
import { confirmDialog, toast } from "../../components/Popup";

const BRAND = "#f58021";
const cellSx = { fontSize: "0.82rem", color: "#334155", whiteSpace: "nowrap", py: 1.5, px: 2 };

const StatCard = ({ label, value, icon, color, light, loading }) => (
  <Box sx={{
    background: "#fff", borderRadius: "16px", p: "20px 22px",
    border: "1px solid #e8edf5", boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    display: "flex", alignItems: "center", gap: 2, position: "relative", overflow: "hidden",
  }}>
    <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg,${color},#f58021,#ffa726)` }} />
    <Box sx={{ width: 46, height: 46, borderRadius: "13px", background: light, display: "flex", alignItems: "center", justifyContent: "center", color, flexShrink: 0 }}>
      {icon}
    </Box>
    <Box>
      <Typography sx={{ fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</Typography>
      {loading
        ? <Skeleton width={48} height={32} sx={{ borderRadius: "6px" }} />
        : <Typography sx={{ fontSize: "1.6rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px", lineHeight: 1.1 }}>{value?.toLocaleString() ?? "0"}</Typography>
      }
    </Box>
  </Box>
);

const badgeColor = (type) =>
  type === "host"
    ? { bg: "#eff6ff", color: "#1d4ed8", border: "#bfdbfe" }
    : { bg: "#f0fdf4", color: "#166534", border: "#bbf7d0" };

const InactiveUsers = () => {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchInactiveUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${url}admin/users/inactive`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { limit: 500 },
      });
      setUsers(res.data.data?.users || []);
    } catch (e) {
      toast(e.response?.data?.message || "Error fetching inactive users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (adminData.designation !== "superAdmin") {
      navigate("/admin/dashboard", { replace: true });
      return;
    }
    fetchInactiveUsers();
  }, []);

  const handleActivate = async (user) => {
    if (!await confirmDialog(`Activate ${user.name || "this user"}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.patch(`${url}admin/user/${user._id}/activate`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast("User activated", "success");
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    }
  };

  const handleDelete = async (user) => {
    if (!await confirmDialog(`Permanently delete ${user.name || "this user"}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}admin/user/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(prev => prev.filter(u => u._id !== user._id));
      toast("User deleted", "success");
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    }
  };

  const baseFiltered = users.filter(u => {
    const s = search.toLowerCase();
    const matchSearch = !s || u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s) || u.phone?.includes(s);
    const matchType = filterType === "all" || u.userType === filterType;
    return matchSearch && matchType;
  });

  const { sorted: allFiltered, orderBy, order, handleSort } = useSortable(baseFiltered, "deactivatedAt", "desc");
  const filtered = allFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  const totalHosts = users.filter(u => u.userType === "host").length;
  const totalParticipants = users.filter(u => u.userType === "participant").length;

  return (
    <Box sx={{ p: { xs: "16px", sm: "24px 28px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)" }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Admin / Removed Users
        </Typography>
        <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em", lineHeight: 1.2 }}>
          Removed Users
        </Typography>
        {/* <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mt: 0.4, fontWeight: 500 }}>
          {loading ? "Loading..." : `${users.length} disabled accounts`}
        </Typography> */}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(auto-fit, minmax(180px, 1fr))" }, gap: { xs: 1.5, sm: 2 }, mb: 3 }}>
        <StatCard loading={loading} label="Removed Users" value={users.length} icon={<PersonOffIcon sx={{ fontSize: 20 }} />} color="#64748b" light="#f8fafc" />
        <StatCard loading={loading} label="Hosts" value={totalHosts} icon={<SupervisedUserCircleIcon sx={{ fontSize: 20 }} />} color={BRAND} light="#fff7ed" />
        <StatCard loading={loading} label="Participants" value={totalParticipants} icon={<HowToRegIcon sx={{ fontSize: 20 }} />} color="#059669" light="#f0fdf4" />
      </Box>

      <Box sx={{ background: "#fff", border: "1px solid #e8edf5", borderRadius: "14px", mb: 2, boxShadow: "0 1px 4px rgba(0,0,0,0.04)", overflow: "hidden" }}>
        <Box sx={{ p: "12px 16px", display: "flex", gap: 1.5, alignItems: "center", flexWrap: "wrap" }}>
          <ToggleButtonGroup size="small" value={filterType} exclusive onChange={(_, v) => { v && setFilterType(v); setPage(0); }}
            sx={{ background: "#f8fafc", borderRadius: "8px", p: "2px", border: "1px solid #e2e8f0", flexShrink: 0,
              "& .MuiToggleButton-root": { border: "none", borderRadius: "6px !important", fontSize: "0.75rem", fontWeight: 600, px: 1.8, py: 0.5, color: "#64748b", textTransform: "capitalize",
                "&.Mui-selected": { background: "linear-gradient(135deg,#D26600,#f58021)", color: "#fff", boxShadow: "0 2px 8px rgba(245,128,33,0.3)" } } }}>
            {["all", "host", "participant"].map(t => <ToggleButton key={t} value={t}>{t}</ToggleButton>)}
          </ToggleButtonGroup>
          <TextField size="small" placeholder="Search name, email, phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 15, color: "#94a3b8" }} /></InputAdornment> }}
            sx={{ flex: 1, minWidth: 220, "& .MuiOutlinedInput-root": { borderRadius: "8px", fontSize: "0.82rem", height: 36, "&.Mui-focused fieldset": { borderColor: BRAND } } }} />
        </Box>
      </Box>

      <AdminTable
        columns={[
          { label: "User ID", field: "userId" },
          { label: "Name", field: "name" },
          { label: "Type", field: "userType" },
          { label: "Email", field: "email" },
          { label: "Phone", field: "phone" },
          { label: "Deactivated", field: "deactivatedAt" },
          { label: "Action" },
        ]}
        rows={filtered}
        loading={loading}
        emptyText={search || filterType !== "all" ? "No inactive users match this filter" : "No inactive users"}
        orderBy={orderBy}
        order={order}
        onSort={handleSort}
        count={allFiltered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        maxHeight="calc(100vh - 360px)"
        renderRow={user => {
          const bc = badgeColor(user.userType);
          return (
            <TableRow key={user._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
              <TableCell sx={cellSx}>{user.userId || user._id}</TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PeopleIcon sx={{ fontSize: 18, color: "#94a3b8" }} />
                  <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>{user.name || "-"}</Typography>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}>
                <Chip label={user.userType || "-"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: bc.bg, color: bc.color, border: `1px solid ${bc.border}` }} />
              </TableCell>
              <TableCell sx={{ ...cellSx, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{user.email || "-"}</TableCell>
              <TableCell sx={cellSx}>{user.phone || "-"}</TableCell>
              <TableCell sx={cellSx}>
                {user.deactivatedAt ? (
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>{dayjs(user.deactivatedAt).format("DD MMM YYYY")}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{dayjs(user.deactivatedAt).format("hh:mm A")}</Typography>
                  </Box>
                ) : "-"}
              </TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  <Tooltip title="Activate User" arrow>
                    <IconButton size="small" onClick={() => handleActivate(user)} sx={{ background: "#ecfdf5", color: "#047857", borderRadius: "8px", width: 30, height: 30, "&:hover": { background: "#d1fae5", transform: "scale(1.08)" }, transition: "all 0.18s" }}>
                      <CheckCircleIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete User" arrow>
                    <IconButton size="small" onClick={() => handleDelete(user)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", width: 30, height: 30, "&:hover": { background: "#fee2e2", transform: "scale(1.08)" }, transition: "all 0.18s" }}>
                      <DeleteIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          );
        }}
      />
    </Box>
  );
};

export default InactiveUsers;
