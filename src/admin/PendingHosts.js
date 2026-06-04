import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import { TableCell, TableRow, Chip, Tooltip, IconButton, Box, Typography } from "@mui/material";
import AdminTable from "./AdminTable";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import CancelIcon from "@mui/icons-material/CancelRounded";
import { useSortable } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2, whiteSpace: "nowrap" };

const PendingHosts = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [hosts, setHosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const navigate = useNavigate();
  const { sorted, orderBy, order, handleSort } = useSortable(hosts, "createdAt", "desc");

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => { fetchPendingHosts(); }, [url]);

  const fetchPendingHosts = async () => {
    try {
      const res = await axios.get(`${url}admin/host-approvals-pending`, { headers: getHeaders() });
      setHosts(res.data.data?.users || []);
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    } finally { setLoading(false); }
  };

  const handleApprove = async (host) => {
    if (!await confirmDialog(`Approve host "${host.name}"?`)) return;
    try {
      await axios.put(`${url}admin/approve-host/${host._id}`, {}, { headers: getHeaders() });
      setHosts(h => h.filter(x => x._id !== host._id));
      toast("Host approved successfully", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const handleReject = async (host) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try {
      await axios.put(`${url}admin/reject-host/${host._id}`, { reason }, { headers: getHeaders() });
      setHosts(h => h.filter(x => x._id !== host._id));
      toast("Host rejected", "info");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  return (
    <Box sx={{ p: { xs: "16px", sm: "28px 32px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" }, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)" }}>Pending Host Approvals</Typography>
          {hosts.length > 0 && <Chip label={`${hosts.length} pending`} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", height: 22 }} />}
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>Review and approve host profile submissions</Typography>
      </Box>

      <AdminTable
        columns={[
          { label: "User ID",   field: "userId"        },
          { label: "Host",      field: "name"          },
          { label: "Type",      field: "performerType" },
          { label: "Email",     field: "email"         },
          { label: "Phone",     field: "phone"         },
          { label: "Location" },
          { label: "Submitted", field: "createdAt"     },
          { label: "Actions" },
        ]}
        rows={sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)}
        loading={loading}
        emptyText="No hosts pending approval"
        orderBy={orderBy}
        order={order}
        onSort={handleSort}
        count={sorted.length}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={(_, p) => setPage(p)}
        onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        maxHeight="calc(100vh - 300px)"
        renderRow={host => (
          <TableRow key={host._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
            <TableCell sx={cellSx}>
              <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>{host.userId || "—"}</span>
            </TableCell>
            <TableCell sx={{ ...cellSx, maxWidth: 200 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
                  {host.profilePicture
                    ? <img src={host.profilePicture.startsWith("http") ? host.profilePicture : `${url.replace("/api/", "")}${host.profilePicture}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                    : <span style={{ fontWeight: 700, color: "#D26600" }}>{host.name?.[0]}</span>}
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.82rem" }}>{host.name || "—"}</Typography>
                  <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{host.profileType}</Typography>
                </Box>
              </Box>
            </TableCell>
            <TableCell sx={cellSx}>
              <Chip label={host.performerType || "Host"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#f0f9ff", color: "#0369a1", border: "1px solid #bae6fd", height: 22, textTransform: "capitalize" }} />
            </TableCell>
            <TableCell sx={cellSx}>{host.email || "—"}</TableCell>
            <TableCell sx={cellSx}>{host.phone || "—"}</TableCell>
            <TableCell sx={cellSx}>{host.address?.city || host.address?.state || "—"}</TableCell>
            <TableCell sx={cellSx}>{dayjs(host.createdAt).format("DD MMM YYYY")}</TableCell>
            <TableCell sx={cellSx}>
              <Box sx={{ display: "flex", gap: 0.6 }}>
                <Tooltip title="View" arrow>
                  <IconButton size="small" onClick={() => navigate(`/admin/userdetails/${host._id}`)} sx={{ background: "#f9fafb", color: "#374151", borderRadius: "8px", "&:hover": { background: "#f3f4f6" } }}>
                    <VisibilityIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Approve" arrow>
                  <IconButton size="small" onClick={() => handleApprove(host)} sx={{ background: "#f0fdf4", color: "#059669", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}>
                    <CheckCircleIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Reject" arrow>
                  <IconButton size="small" onClick={() => handleReject(host)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}>
                    <CancelIcon sx={{ fontSize: 15 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </TableCell>
          </TableRow>
        )}
      />
    </Box>
  );
};

export default PendingHosts;
