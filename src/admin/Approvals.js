import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import {
  Chip, Tooltip, IconButton, Box, Typography, Tab, Tabs, TableRow, TableCell,
} from "@mui/material";
import AdminTable from "./AdminTable";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleRounded";
import CancelIcon from "@mui/icons-material/CancelRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import { useSortable } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2, whiteSpace: "nowrap" };

const Approvals = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [events, setEvents] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [loadingHosts, setLoadingHosts] = useState(true);
  const [evPage, setEvPage] = useState(0);
  const [evRowsPerPage, setEvRowsPerPage] = useState(10);
  const [hPage, setHPage] = useState(0);
  const [hRowsPerPage, setHRowsPerPage] = useState(10);
  const { sorted: sortedEvents, orderBy: evOB, order: evO, handleSort: evSort } = useSortable(events, "createdAt", "desc");
  const { sorted: sortedHosts, orderBy: hOB, order: hO, handleSort: hSort } = useSortable(hosts, "createdAt", "desc");
  const adminData = JSON.parse(localStorage.getItem("admin") || "{}");
  const isSuperAdmin = adminData.designation === "superAdmin";

  const headers = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => {
    axios.get(`${url}admin/events/pending`, { headers: headers() })
      .then(r => setEvents(r.data.data?.events || []))
      .catch(e => toast(e.response?.data?.message || e.message, "error"))
      .finally(() => setLoadingEvents(false));
    axios.get(`${url}admin/host-approvals-pending`, { headers: headers() })
      .then(r => setHosts(r.data.data?.users || []))
      .catch(e => toast(e.response?.data?.message || e.message, "error"))
      .finally(() => setLoadingHosts(false));
  }, [url]);

  const approveEvent = async (ev) => {
    if (!await confirmDialog(`Approve "${ev.eventName}"?`)) return;
    try { await axios.put(`${url}admin/approve/${ev._id}`, {}, { headers: headers() }); setEvents(e => e.filter(x => x._id !== ev._id)); toast("Event approved", "success"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };
  const rejectEvent = async (ev) => {
    if (!isSuperAdmin) return;
    if (!await confirmDialog(`Reject "${ev.eventName}"?`)) return;
    try { await axios.put(`${url}admin/reject/${ev._id}`, {}, { headers: headers() }); setEvents(e => e.filter(x => x._id !== ev._id)); toast("Event rejected", "info"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };
  const deleteEvent = async (ev) => {
    if (!await confirmDialog(`Delete "${ev.eventName}"?`)) return;
    try { await axios.delete(`${url}events/${ev._id}`, { headers: headers() }); setEvents(e => e.filter(x => x._id !== ev._id)); toast("Event deleted", "success"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };
  const approveHost = async (h) => {
    if (!await confirmDialog(`Approve host "${h.name}"?`)) return;
    try { await axios.put(`${url}admin/approve-host/${h._id}`, {}, { headers: headers() }); setHosts(hh => hh.filter(x => x._id !== h._id)); toast("Host approved", "success"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };
  const rejectHost = async (h) => {
    const reason = window.prompt("Reason for rejection:");
    if (reason === null) return;
    try { await axios.put(`${url}admin/reject-host/${h._id}`, { reason }, { headers: headers() }); setHosts(hh => hh.filter(x => x._id !== h._id)); toast("Host rejected", "info"); }
    catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  const pagedEvents = sortedEvents.slice(evPage * evRowsPerPage, evPage * evRowsPerPage + evRowsPerPage);
  const pagedHosts = sortedHosts.slice(hPage * hRowsPerPage, hPage * hRowsPerPage + hRowsPerPage);

  return (
    <Box sx={{ p: { xs: "16px", sm: "28px 32px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Box sx={{ mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
          <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" }, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)" }}>Approvals</Typography>
          {(events.length + hosts.length) > 0 && <Chip label={`${events.length + hosts.length} pending`} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fef3c7", color: "#92400e", height: 22 }} />}
        </Box>
        <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>Review and approve pending events and host profiles</Typography>
      </Box>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2, "& .MuiTab-root": { fontSize: "0.78rem", fontWeight: 700, textTransform: "capitalize", fontFamily: "var(--font-admin)", minWidth: 120 }, "& .Mui-selected": { color: "#f58021 !important" }, "& .MuiTabs-indicator": { background: "linear-gradient(90deg,#D26600,#f58021)" } }}>
        <Tab label={`Events${events.length ? ` (${events.length})` : ""}`} />
        <Tab label={`Hosts${hosts.length ? ` (${hosts.length})` : ""}`} />
      </Tabs>

      <AdminTable
        columns={
          tab === 0
            ? [
                { label: "Event ID",   field: "eventId"   },
                { label: "Event",      field: "eventName" },
                { label: "Category"                      },
                { label: "Host",       field: "hostName"  },
                { label: "Contact"                       },
                { label: "Start Date", field: "startDate" },
                { label: "End Date",   field: "endDate"   },
                { label: "Submitted",  field: "createdAt" },
                { label: "Actions"                       },
              ]
            : [
                { label: "User ID",   field: "userId"        },
                { label: "Host",      field: "name"          },
                { label: "Type",      field: "performerType" },
                { label: "Email",     field: "email"         },
                { label: "Phone",     field: "phone"         },
                { label: "Location"                         },
                { label: "Submitted", field: "createdAt"     },
                { label: "Actions"                          },
              ]
        }
        rows={tab === 0 ? pagedEvents : pagedHosts}
        loading={tab === 0 ? loadingEvents : loadingHosts}
        emptyText={tab === 0 ? "No events pending approval" : "No hosts pending approval"}
        orderBy={tab === 0 ? evOB : hOB}
        order={tab === 0 ? evO : hO}
        onSort={tab === 0 ? evSort : hSort}
        count={tab === 0 ? sortedEvents.length : sortedHosts.length}
        page={tab === 0 ? evPage : hPage}
        rowsPerPage={tab === 0 ? evRowsPerPage : hRowsPerPage}
        onPageChange={(_, p) => tab === 0 ? setEvPage(p) : setHPage(p)}
        onRowsPerPageChange={e => {
          const v = parseInt(e.target.value, 10);
          tab === 0 ? (setEvRowsPerPage(v), setEvPage(0)) : (setHRowsPerPage(v), setHPage(0));
        }}
        renderRow={tab === 0
          ? ev => (
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
                      : <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#f58021" }}>{ev.eventName?.[0]}</span>}
                  </Box>
                  <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>{ev.eventName || "—"}</Typography>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}>{ev.eventCategory?.[0] ? <Chip label={ev.eventCategory[0]} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fff7ed", color: "#f58021", height: 22 }} /> : "—"}</TableCell>
              <TableCell sx={cellSx}>{ev.hostName || "—"}</TableCell>
              <TableCell sx={cellSx}>{ev.hostWhatsapp ? <a href={`tel:+91${ev.hostWhatsapp}`} style={{ color: "#059669", textDecoration: "none" }}>{ev.hostWhatsapp}</a> : "—"}</TableCell>
              <TableCell sx={cellSx}>{ev.startDate ? dayjs(ev.startDate).format("DD MMM YYYY") : "—"}</TableCell>
              <TableCell sx={cellSx}>{ev.endDate ? dayjs(ev.endDate).format("DD MMM YYYY") : "—"}</TableCell>
              <TableCell sx={cellSx}>{ev.createdAt ? dayjs(ev.createdAt).format("DD MMM YYYY") : "—"}</TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  <Tooltip title="View"><IconButton size="small" onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/event/${ev._id}`, "_blank")} sx={{ background: "#f9fafb", color: "#374151", borderRadius: "8px", "&:hover": { background: "#f3f4f6" } }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                  <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/admin/updateevent/${ev._id}`)} sx={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                  <Tooltip title="Approve"><IconButton size="small" onClick={() => approveEvent(ev)} sx={{ background: "#f0fdf4", color: "#059669", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><CheckCircleIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                  {isSuperAdmin && <Tooltip title="Reject"><IconButton size="small" onClick={() => rejectEvent(ev)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><CancelIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>}
                  {isSuperAdmin && <Tooltip title="Delete"><IconButton size="small" onClick={() => deleteEvent(ev)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>}
                </Box>
              </TableCell>
            </TableRow>
          )
          : h => (
            <TableRow key={h._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
              <TableCell sx={cellSx}>
                <Tooltip title="Click to copy" arrow>
                  <Box component="span" onClick={() => { navigator.clipboard.writeText(h.userId || h._id || ""); toast("User ID copied", "success"); }}
                    sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-block", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                    {h.userId || "—"}
                  </Box>
                </Tooltip>
              </TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box sx={{ width: 32, height: 32, borderRadius: "50%", background: "#f1f5f9", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {h.profilePicture ? <img src={h.profilePicture.startsWith("http") ? h.profilePicture : `${url.replace("/api/", "")}${h.profilePicture}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} alt="" />
                      : <span style={{ fontWeight: 700, color: "#f58021" }}>{h.name?.[0]}</span>}
                  </Box>
                  <Box><Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.82rem" }}>{h.name || "—"}</Typography><Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{h.profileType}</Typography></Box>
                </Box>
              </TableCell>
              <TableCell sx={cellSx}><Chip label={h.performerType || "Host"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#f0f9ff", color: "#0369a1", height: 22, textTransform: "capitalize" }} /></TableCell>
              <TableCell sx={cellSx}>{h.email || "—"}</TableCell>
              <TableCell sx={cellSx}>{h.phone || "—"}</TableCell>
              <TableCell sx={cellSx}>{h.address?.city || h.address?.state || "—"}</TableCell>
              <TableCell sx={cellSx}>{dayjs(h.createdAt).format("DD MMM YYYY")}</TableCell>
              <TableCell sx={cellSx}>
                <Box sx={{ display: "flex", gap: 0.6 }}>
                  <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/admin/userdetails/${h._id}`)} sx={{ background: "#f9fafb", color: "#374151", borderRadius: "8px", "&:hover": { background: "#f3f4f6" } }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                  <Tooltip title="Approve"><IconButton size="small" onClick={() => approveHost(h)} sx={{ background: "#f0fdf4", color: "#059669", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><CheckCircleIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                  <Tooltip title="Reject"><IconButton size="small" onClick={() => rejectHost(h)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><CancelIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          )
        }
      />
    </Box>
  );
};

export default Approvals;
