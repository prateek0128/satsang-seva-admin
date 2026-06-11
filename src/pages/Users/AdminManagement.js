import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../../components/Popup";
import {
  TableCell, TableRow,
  Chip, Tooltip, IconButton, Box, Typography, Button,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Select, MenuItem, InputLabel, FormControl, TextField,
  Switch, FormControlLabel, Divider,
} from "@mui/material";
import AdminTable from "../Shared/AdminTable";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import TuneIcon from "@mui/icons-material/TuneRounded";
import { useSortable } from "../Shared/sortable";

const BRAND = "#f58021";
const cellSx = { fontSize: "0.82rem", color: "#334155", whiteSpace: "nowrap", py: 1.5, px: 2 };

const PAGES = [
  { key: "allusers",       label: "All Users",       actions: ["view", "edit", "deactivate"] },
  { key: "events",         label: "Events",          actions: ["view", "edit", "delete"] },
  { key: "approvals",      label: "Approvals",       actions: ["view", "edit", "delete", "approve", "reject"] },
  { key: "drafts",         label: "Draft Events",    actions: ["view", "edit", "delete"] },
  { key: "blog",           label: "Blogs",           actions: ["view", "edit", "delete"] },
  { key: "bookings",       label: "Bookings",        actions: ["view"] },
  { key: "contact-queries",label: "Contact Queries", actions: ["view", "delete"] },
  { key: "notifications",  label: "Notifications",   actions: ["view"] },
];

const ACTIONS = ["view", "edit", "delete", "approve", "reject", "deactivate"];
const actionLabel = (action) => action === "deactivate" ? "Deactivate" : action;
const pageActions = (pageKey) => PAGES.find((p) => p.key === pageKey)?.actions || [];

const emptyPermissions = () =>
  Object.fromEntries(
    PAGES.map((p) => [p.key, Object.fromEntries(p.actions.map((a) => [a, false]))])
  );

const AdminManagement = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // Add admin modal
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "", password: "", designation: "admin" });
  const [submitting, setSubmitting] = useState(false);

  // Permissions modal
  const [permAdmin, setPermAdmin] = useState(null); // admin being edited
  const [permData, setPermData] = useState(emptyPermissions());
  const [savingPerms, setSavingPerms] = useState(false);

  const currentAdmin = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = currentAdmin.designation === "superAdmin";

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

  const fetchAdmins = async () => {
    try {
      const res = await axios.get(url + "admin/list", { headers: headers() });
      setAdmins(res.data.data?.admins || []);
    } catch (e) {
      toast(e.response?.data?.message || "Error fetching admins", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAdmins(); }, []);

  const handleDelete = async (admin) => {
    if (!await confirmDialog(`Delete admin ${admin.name || admin.email}?`)) return;
    try {
      await axios.delete(url + "admin/remove/" + admin._id, { headers: headers() });
      setAdmins((a) => a.filter((x) => x._id !== admin._id));
      toast("Admin deleted", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(url + "admin/create-admin", formData, { headers: headers() });
      toast("Admin created successfully", "success");
      setIsAddOpen(false);
      setFormData({ name: "", email: "", mobile: "", password: "", designation: "admin" });
      fetchAdmins();
    } catch (e) {
      toast(e.response?.data?.message || "Error creating admin", "error");
    } finally { setSubmitting(false); }
  };

  // Open permissions modal — pre-fill with existing permissions
  const openPermissions = (admin) => {
    const base = emptyPermissions();
    if (admin.permissions) {
      PAGES.forEach(({ key }) => {
        if (admin.permissions[key]) {
          pageActions(key).forEach((a) => {
            base[key][a] = !!(admin.permissions[key][a]);
          });
        }
      });
    }
    setPermData(base);
    setPermAdmin(admin);
  };

  const toggleAction = (pageKey, action) => {
    setPermData((prev) => ({
      ...prev,
      [pageKey]: { ...prev[pageKey], [action]: !prev[pageKey][action] },
    }));
  };

  const toggleAllActionsForPage = (pageKey, value) => {
    setPermData((prev) => ({
      ...prev,
      [pageKey]: Object.fromEntries(pageActions(pageKey).map((a) => [a, value])),
    }));
  };

  const toggleAllPages = (value) => {
    setPermData(
      Object.fromEntries(
        PAGES.map(({ key, actions }) => [key, Object.fromEntries(actions.map((a) => [a, value]))])
      )
    );
  };

  const savePermissions = async () => {
    setSavingPerms(true);
    try {
      const res = await axios.put(
        `${url}admin/permissions/${permAdmin._id}`,
        { permissions: permData },
        { headers: headers() }
      );
      // Update local list
      setAdmins((prev) =>
        prev.map((a) => (a._id === permAdmin._id ? { ...a, permissions: permData } : a))
      );
      toast("Permissions saved", "success");
      setPermAdmin(null);
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
    finally { setSavingPerms(false); }
  };

  const { sorted: allFiltered, orderBy, order, handleSort } = useSortable(admins, "createdAt", "desc");
  const paged = allFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Box sx={{ p: { xs: "16px", sm: "24px 28px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)" }}>

      {/* Header */}
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
          {isSuperAdmin && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setIsAddOpen(true)}
              sx={{
                background: "linear-gradient(135deg,#D26600,#f58021)", color: "#fff", fontWeight: 700,
                textTransform: "none", borderRadius: "8px", px: 2, boxShadow: "0 4px 12px rgba(245,128,33,0.3)",
                "&:hover": { background: "linear-gradient(135deg,#b35800,#D26600)" },
              }}
            >
              Add Admin
            </Button>
          )}
        </Box>
      </Box>

      {/* Table */}
      <AdminTable
        columns={[
          { label: "Name",        field: "name"        },
          { label: "Email",       field: "email"       },
          { label: "Mobile",      field: "mobile"      },
          { label: "Designation", field: "designation" },
          { label: "Created At",  field: "createdAt"   },
          { label: "Actions" },
        ]}
        rows={paged}
        loading={loading}
        emptyText="No admins found"
        orderBy={orderBy}
        order={order}
        onSort={handleSort}
        count={allFiltered.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        maxHeight="calc(100vh - 220px)"
        renderRow={(admin) => {
          const isSuper = admin.designation === "superAdmin";
          const isSelf = currentAdmin._id === admin._id;
          return (
            <TableRow key={admin._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
              <TableCell sx={cellSx}>
                <Typography sx={{ fontWeight: 700, color: "#0f172a", fontSize: "0.82rem" }}>{admin.name || "—"}</Typography>
              </TableCell>
              <TableCell sx={{ ...cellSx, maxWidth: 180 }}>
                <Tooltip title="Click to copy">
                  <Box component="span"
                    onClick={() => { navigator.clipboard.writeText(admin.email || ""); toast("Email copied", "success"); }}
                    sx={{ cursor: "pointer", display: "block", overflow: "hidden", textOverflow: "ellipsis", color: "#475569", "&:hover": { color: "#2563eb", textDecoration: "underline" }, transition: "color 0.15s" }}>
                    {admin.email || "—"}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={cellSx}>{admin.mobile || admin.phone || "—"}</TableCell>
              <TableCell sx={cellSx}>
                <Chip label={admin.designation || "admin"} size="small"
                  sx={{ fontSize: "0.68rem", fontWeight: 700, height: 22, background: isSuper ? "#f5f3ff" : "#f0fdf4", color: isSuper ? "#7c3aed" : "#166534", border: `1px solid ${isSuper ? "#ddd6fe" : "#bbf7d0"}` }} />
              </TableCell>
              <TableCell sx={cellSx}>
                {admin.createdAt ? (
                  <Box>
                    <Typography sx={{ fontSize: "0.8rem", color: "#334155", fontWeight: 600 }}>{dayjs(admin.createdAt).format("DD MMM YYYY")}</Typography>
                    <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{dayjs(admin.createdAt).format("hh:mm A")}</Typography>
                  </Box>
                ) : "—"}
              </TableCell>
              <TableCell sx={cellSx}>
                {isSuperAdmin && !isSelf && (
                  <Box sx={{ display: "flex", gap: 0.6 }}>
                    {!isSuper && (
                      <Tooltip title="Manage Permissions" arrow>
                        <IconButton size="small" onClick={() => openPermissions(admin)}
                          sx={{ background: "#fff7ed", color: "#D26600", borderRadius: "8px", "&:hover": { background: "#ffedd5" } }}>
                          <TuneIcon sx={{ fontSize: 15 }} />
                        </IconButton>
                      </Tooltip>
                    )}
                    <Tooltip title="Delete Admin" arrow>
                      <IconButton size="small" onClick={() => handleDelete(admin)}
                        sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}>
                        <DeleteIcon sx={{ fontSize: 15 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          );
        }}
      />

      {/* ── Add Admin Modal ── */}
      <Dialog open={isAddOpen} onClose={() => setIsAddOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a" }}>Add New Admin</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField label="Name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} fullWidth size="small" />
            <TextField label="Email" type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} fullWidth size="small" />
            <TextField label="Mobile Number" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} fullWidth size="small" />
            <TextField label="Password" type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} fullWidth size="small" />
            <FormControl fullWidth size="small">
              <InputLabel>Designation</InputLabel>
              <Select value={formData.designation} label="Designation" onChange={(e) => setFormData({ ...formData, designation: e.target.value })}>
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="superAdmin">Super Admin</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions sx={{ px: 3, py: 2 }}>
            <Button onClick={() => setIsAddOpen(false)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={submitting}
              sx={{ background: BRAND, "&:hover": { background: "#D26600" }, textTransform: "none", fontWeight: 600 }}>
              {submitting ? "Creating..." : "Create Admin"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* ── Permissions Modal ── */}
      <Dialog open={!!permAdmin} onClose={() => setPermAdmin(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 1 }}>
          <TuneIcon sx={{ color: BRAND }} />
          Permissions — {permAdmin?.name}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {/* Global toggle row */}
          <Box sx={{ px: 3, py: 1.5, background: "#f8fafc", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <Typography sx={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button size="small" onClick={() => toggleAllPages(true)}
                sx={{ fontSize: "0.72rem", textTransform: "none", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", border: "1px solid #bbf7d0", "&:hover": { background: "#dcfce7" } }}>
                Grant All
              </Button>
              <Button size="small" onClick={() => toggleAllPages(false)}
                sx={{ fontSize: "0.72rem", textTransform: "none", fontWeight: 700, color: "#dc2626", background: "#fef2f2", border: "1px solid #fecaca", "&:hover": { background: "#fee2e2" } }}>
                Revoke All
              </Button>
            </Box>
          </Box>

          {/* Header row */}
          <Box sx={{ px: 3, py: 1, background: "#f1f5f9", borderBottom: "1px solid #e2e8f0", display: "grid", gridTemplateColumns: "180px repeat(6, 1fr) 80px", alignItems: "center" }}>
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em" }}>Page</Typography>
            {ACTIONS.map((a) => (
              <Typography key={a} sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>{actionLabel(a)}</Typography>
            ))}
            <Typography sx={{ fontSize: "0.7rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.07em", textAlign: "center" }}>All</Typography>
          </Box>

          {PAGES.map(({ key, label }, idx) => {
            const pagePerms = permData[key] || {};
            const allowedActions = pageActions(key);
            const allOn = allowedActions.every((a) => pagePerms[a]);
            const anyOn = allowedActions.some((a) => pagePerms[a]);
            return (
              <Box key={key} sx={{
                px: 3, py: 1.2,
                background: idx % 2 === 0 ? "#fff" : "#fafbff",
                borderBottom: "1px solid #f1f5f9",
                display: "grid",
                gridTemplateColumns: "180px repeat(6, 1fr) 80px",
                alignItems: "center",
              }}>
                <Typography sx={{ fontSize: "0.82rem", fontWeight: 700, color: "#0f172a" }}>{label}</Typography>
                {ACTIONS.map((action) => {
                  const isAllowed = allowedActions.includes(action);
                  return (
                    <Box key={action} sx={{ display: "flex", justifyContent: "center" }}>
                      {isAllowed ? (
                        <Switch
                          size="small"
                          checked={!!(pagePerms[action])}
                          onChange={() => toggleAction(key, action)}
                          sx={{
                            "& .MuiSwitch-switchBase.Mui-checked": { color: "#f58021" },
                            "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#f58021" },
                          }}
                        />
                      ) : (
                        <Typography sx={{ color: "#cbd5e1", fontSize: "0.75rem" }}>-</Typography>
                      )}
                    </Box>
                  );
                })}
                <Box sx={{ display: "flex", justifyContent: "center" }}>
                  <Switch
                    size="small"
                    checked={allOn}
                    indeterminate={anyOn && !allOn}
                    onChange={() => toggleAllActionsForPage(key, !allOn)}
                    sx={{
                      "& .MuiSwitch-switchBase.Mui-checked": { color: "#7c3aed" },
                      "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": { backgroundColor: "#7c3aed" },
                    }}
                  />
                </Box>
              </Box>
            );
          })}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={() => setPermAdmin(null)} color="inherit" sx={{ textTransform: "none", fontWeight: 600 }}>Cancel</Button>
          <Button variant="contained" disabled={savingPerms} onClick={savePermissions}
            sx={{ background: "linear-gradient(135deg,#D26600,#f58021)", "&:hover": { background: "#D26600" }, textTransform: "none", fontWeight: 700, boxShadow: "0 4px 12px rgba(245,128,33,0.3)" }}>
            {savingPerms ? "Saving…" : "Save Permissions"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminManagement;
