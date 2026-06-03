import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, IconButton, Box, Typography, Button, TextField,
  Dialog, DialogTitle, DialogContent, DialogActions, Select, MenuItem, InputLabel, FormControl, Skeleton
} from "@mui/material";
import AdminTablePagination from "./AdminTablePagination";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import { useSortable, SortCell, PlainCell } from "./sortable";

const BRAND = "#f58021";
const cellSx = { fontSize: "0.82rem", color: "#334155", whiteSpace: "nowrap", py: 1.5, px: 2 };

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i} sx={{ py: 1.5, px: 2 }}>
        <Skeleton variant="text" width="80%" height={18} />
      </TableCell>
    ))}
  </TableRow>
);

const AdminManagement = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "", designation: "admin" });
  const [submitting, setSubmitting] = useState(false);

  // Current logged in admin
  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = currentAdmin.designation === "superAdmin";

  const fetchAdmins = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(url + "admin/list", { headers: { Authorization: `Bearer ${token}` } });
      setAdmins(res.data.data?.admins || []);
    } catch (e) {
      toast(e.response?.data?.message || "Error fetching admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (admin) => {
    if (!await confirmDialog(`Delete admin ${admin.name || admin.email}?`)) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(url + "admin/remove/" + admin._id, { headers: { Authorization: `Bearer ${token}` } });
      setAdmins(a => a.filter(x => x._id !== admin._id));
      toast("Admin deleted", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      await axios.post(url + "admin/create-admin", formData, { headers: { Authorization: `Bearer ${token}` } });
      toast("Admin created successfully", "success");
      setIsAddModalOpen(false);
      setFormData({ name: "", email: "", mobile: "", password: "", designation: "admin" });
      fetchAdmins();
    } catch (e) {
      toast(e.response?.data?.message || "Error creating admin", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const { sorted: allFiltered, orderBy, order, handleSort } = useSortable(admins, "createdAt", "desc");
  const filtered = allFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: "16px", sm: "24px 28px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)" }}>

      {/* ── Breadcrumb + Header ── */}
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: "0.7rem", fontWeight: 600, color: "#94a3b8", mb: 0.5, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          Admin / Admin Users
        </Typography>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: "1.5rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.05em", lineHeight: 1.2 }}>
              Admin Management
            </Typography>
            <Typography sx={{ fontSize: "0.82rem", color: "#64748b", mt: 0.4, fontWeight: 500 }}>
              {loading ? "Loading…" : `${admins.length} total admins`}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddModalOpen(true)}
            sx={{
              background: "linear-gradient(135deg,#D26600,#f58021)", color: "#fff", fontWeight: 700,
              textTransform: "none", borderRadius: "8px", px: 2, boxShadow: "0 4px 12px rgba(245,128,33,0.3)",
              "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" }
            }}
          >
            Add Admin
          </Button>
        </Box>
      </Box>

      {/* ── Table ── */}
      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", boxShadow: "0 2px 8px rgba(0,0,0,0.05)" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 220px)", overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SortCell label="Name"       field="name"         orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Email"      field="email"        orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Mobile"     field="mobile"       orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Designation" field="designation" orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Created At" field="createdAt"    orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Actions" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                Array.from({ length: rowsPerPage }).map((_, i) => <SkeletonRow key={i} />)
              ) : filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: "center", py: 8 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.5 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <AdminPanelSettingsIcon sx={{ fontSize: 28, color: "#cbd5e1" }} />
                      </Box>
                      <Typography sx={{ fontWeight: 700, color: "#334155", fontSize: "0.9rem" }}>No admins found</Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : filtered.map(admin => {
                const isSuper = admin.designation === "superAdmin";
                return (
                  <TableRow
                    key={admin._id}
                    hover
                    sx={{
                      "&:hover": { background: "#fafbff" },
                      "&:hover .row-actions": { opacity: 1 },
                      transition: "background 0.15s",
                      cursor: "default",
                    }}
                  >
                    <TableCell sx={cellSx}>
                      <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>
                        {admin.name || "—"}
                      </Typography>
                    </TableCell>

                    <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                      <Tooltip title="Click to copy">
                        <Box
                          component="span"
                          onClick={() => { navigator.clipboard.writeText(admin.email || ""); toast("Email copied", "success"); }}
                          sx={{
                            cursor: "pointer", display: "block", overflow: "hidden",
                            textOverflow: "ellipsis", color: "#475569",
                            "&:hover": { color: "#2563eb", textDecoration: "underline" },
                            transition: "color 0.15s",
                          }}
                        >
                          {admin.email || "—"}
                        </Box>
                      </Tooltip>
                    </TableCell>

                    <TableCell sx={cellSx}>
                      <Typography sx={{ color: "#475569", fontSize: "0.82rem" }}>{admin.mobile || admin.phone || "—"}</Typography>
                    </TableCell>

                    <TableCell sx={cellSx}>
                      <Chip
                        label={admin.designation || "admin"}
                        size="small"
                        sx={{
                          fontSize: "0.68rem", fontWeight: 700, height: 22,
                          background: isSuper ? "#f5f3ff" : "#f0fdf4",
                          color: isSuper ? "#7c3aed" : "#166534",
                          border: `1px solid ${isSuper ? "#ddd6fe" : "#bbf7d0"}`,
                        }}
                      />
                    </TableCell>

                    <TableCell sx={cellSx}>
                      {admin.createdAt ? (
                        <Box>
                          <Typography sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>
                            {dayjs(admin.createdAt).format("DD MMM YYYY")}
                          </Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>
                            {dayjs(admin.createdAt).format("hh:mm A")}
                          </Typography>
                        </Box>
                      ) : "—"}
                    </TableCell>

                    <TableCell sx={cellSx}>
                      {isSuperAdmin && currentAdmin._id !== admin._id && (
                        <Box className="row-actions" sx={{ display: "flex", gap: 0.6, opacity: { xs: 1, md: 0.6 }, transition: "opacity 0.2s" }}>
                          <Tooltip title="Delete Admin" arrow>
                            <IconButton size="small" onClick={() => handleDelete(admin)}
                              sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", width: 30, height: 30, "&:hover": { background: "#fee2e2", transform: "scale(1.08)" }, transition: "all 0.18s" }}>
                              <DeleteIcon sx={{ fontSize: 15 }} />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <AdminTablePagination
          count={allFiltered.length}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        />
      </Paper>

      {/* Add Admin Modal */}
      <Dialog open={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>Add New Admin</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Name" required value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} fullWidth size="small" />
            <TextField label="Email" type="email" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" />
            <TextField label="Mobile Number" required value={formData.mobile} onChange={e => setFormData({ ...formData, mobile: e.target.value })} fullWidth size="small" />
            <TextField label="Password" type="password" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Designation</InputLabel>
              <Select value={formData.designation} label="Designation" onChange={e => setFormData({ ...formData, designation: e.target.value })}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superAdmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setIsAddModalOpen(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting} sx={{ background: BRAND, "&:hover": { background: "#D26600" }, textTransform: "none", fontWeight: 600 }}>
              {submitting ? "Creating..." : "Create Admin"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
