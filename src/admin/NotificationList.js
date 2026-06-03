import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, IconButton, Box, Typography, Tab, Tabs,
} from "@mui/material";
import AdminTablePagination from "./AdminTablePagination";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import CheckCircleIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import ScheduleIcon from "@mui/icons-material/ScheduleRounded";
import PeopleIcon from "@mui/icons-material/PeopleRounded";
import EventIcon from "@mui/icons-material/EventRounded";
import DraftsIcon from "@mui/icons-material/EditNoteRounded";
import { useSortable, SortCell, PlainCell } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2 };

const typeColor = (type) => ({
  broadcast:       { bg: "#eff6ff", color: "#2563eb" },
  event_approved:  { bg: "#f0fdf4", color: "#166534" },
  event_submitted: { bg: "#fff7ed", color: "#D26600" },
  event_draft:     { bg: "#f5f3ff", color: "#7c3aed" },
  host_submitted:  { bg: "#f0f9ff", color: "#0369a1" },
})[type] || { bg: "#fef2f2", color: "#991b1b" };

const SectionCard = ({ icon, title, count, accentColor, children }) => (
  <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", mb: 3 }}>
    <Box sx={{ px: 2.5, py: 1.5, borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: 1.5, background: "#f8fafc" }}>
      <Box sx={{ color: accentColor, display: "flex" }}>{icon}</Box>
      <Typography sx={{ fontWeight: 800, color: "#0f172a", fontSize: "0.85rem", fontFamily: "var(--font-admin)", flex: 1 }}>{title}</Typography>
      <Chip label={`${count}`} size="small" sx={{ fontSize: "0.65rem", fontWeight: 800, height: 20, background: accentColor + "18", color: accentColor }} />
    </Box>
    <TableContainer><Table>{children}</Table></TableContainer>
  </Paper>
);

const NotificationList = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [tab, setTab] = useState(0);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState({ pendingHosts: [], pendingEvents: [], draftEvents: [] });
  const [loadingSent, setLoadingSent] = useState(true);
  const [loadingReceived, setLoadingReceived] = useState(false);
  const [sentTotal, setSentTotal] = useState(0);
  const [sentPage, setSentPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const { sorted: sortedSent, orderBy, order, handleSort } = useSortable(sent, "createdAt", "desc");

  const h = () => { const t = localStorage.getItem("token"); return t ? { Authorization: `Bearer ${t}` } : {}; };

  useEffect(() => {
    setLoadingSent(true);
    axios.get(`${url}admin/notifications`, { headers: h(), params: { page: sentPage + 1, limit: rowsPerPage } })
      .then(r => { if (r.data.status === "success") { setSent(r.data.data.notifications); setSentTotal(r.data.data.total); } })
      .catch(() => toast("Error fetching notifications", "error"))
      .finally(() => setLoadingSent(false));
  }, [sentPage, rowsPerPage, url]);

  useEffect(() => {
    if (tab !== 1) return;
    setLoadingReceived(true);
    axios.get(`${url}admin/notifications/received`, { headers: h() })
      .then(r => { if (r.data.status === "success") setReceived(r.data.data); })
      .catch(() => toast("Error fetching received", "error"))
      .finally(() => setLoadingReceived(false));
  }, [tab, url]);

  const totalReceived = received.pendingHosts.length + received.pendingEvents.length + received.draftEvents.length;
  const { sorted: sortedHosts, orderBy: hOB, order: hO, handleSort: hSort } = useSortable(received.pendingHosts, "createdAt", "desc");
  const { sorted: sortedEvents, orderBy: eOB, order: eO, handleSort: eSort } = useSortable(received.pendingEvents, "createdAt", "desc");
  const { sorted: sortedDrafts, orderBy: dOB, order: dO, handleSort: dSort } = useSortable(received.draftEvents, "updatedAt", "desc");

  return (
    <Box sx={{ p: "28px 32px", minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)", mb: 0.5 }}>Notification History</Typography>
      <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", mb: 2.5 }}>Track all sent and received notifications</Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 3, "& .MuiTab-root": { fontSize: "0.78rem", fontWeight: 700, textTransform: "none", fontFamily: "var(--font-admin)", minWidth: 160 }, "& .Mui-selected": { color: "#f58021 !important" }, "& .MuiTabs-indicator": { background: "linear-gradient(90deg,#D26600,#f58021)" } }}>
        <Tab label="Sent Notifications" />
        <Tab label={`Received${totalReceived ? ` (${totalReceived})` : ""}`} />
      </Tabs>

      {tab === 0 ? (
        <>
          <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", mb: 3 }}>
            <TableContainer sx={{ maxHeight: "calc(100vh - 340px)", overflowX: "auto" }}>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <SortCell label="User"   field="user.name"  orderBy={orderBy} order={order} onSort={handleSort} />
                    <SortCell label="Type"   field="type"       orderBy={orderBy} order={order} onSort={handleSort} />
                    <SortCell label="Title"  field="title"      orderBy={orderBy} order={order} onSort={handleSort} />
                    <PlainCell label="Message" />
                    <SortCell label="Date"   field="createdAt"  orderBy={orderBy} order={order} onSort={handleSort} />
                    <SortCell label="Status" field="isRead"     orderBy={orderBy} order={order} onSort={handleSort} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loadingSent ? (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6 }}><Loader /></TableCell></TableRow>
                  ) : sent.length === 0 ? (
                    <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>No notifications sent</TableCell></TableRow>
                  ) : sortedSent.map(n => {
                    const tc = typeColor(n.type);
                    return (
                      <TableRow key={n._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                        <TableCell sx={cellSx}>
                          <Typography sx={{ fontWeight: 600, fontSize: "0.82rem" }}>{n.user?.name || "N/A"}</Typography>
                          <Typography sx={{ fontSize: "0.7rem", color: "#94a3b8" }}>{n.user?.userId || ""}</Typography>
                        </TableCell>
                        <TableCell sx={cellSx}><Chip label={n.type} size="small" sx={{ fontSize: "0.65rem", fontWeight: 700, height: 20, background: tc.bg, color: tc.color, textTransform: "uppercase", letterSpacing: "0.04em" }} /></TableCell>
                        <TableCell sx={{ ...cellSx, fontWeight: 700, color: "#0f172a" }}>{n.title}</TableCell>
                        <TableCell sx={{ ...cellSx, maxWidth: 280 }}>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Typography sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.8rem", color: "#64748b", flex: 1 }}>{n.message}</Typography>
                            <Tooltip title="View full"><IconButton size="small" onClick={() => setSelectedMessage(n.message)} sx={{ p: 0.3, color: "#D26600", flexShrink: 0 }}><VisibilityIcon sx={{ fontSize: 14 }} /></IconButton></Tooltip>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ ...cellSx, whiteSpace: "nowrap" }}>{dayjs(n.createdAt).format("DD MMM, hh:mm A")}</TableCell>
                        <TableCell sx={cellSx}>
                          {n.isRead
                            ? <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#166534" }}><CheckCircleIcon sx={{ fontSize: 14 }} /><Typography sx={{ fontSize: "0.75rem", fontWeight: 700 }}>Read</Typography></Box>
                            : <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8" }}><ScheduleIcon sx={{ fontSize: 14 }} /><Typography sx={{ fontSize: "0.75rem", fontWeight: 500 }}>Unread</Typography></Box>}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            {/* Pagination */}
            <AdminTablePagination
              count={sentTotal}
              page={sentPage}
              rowsPerPage={rowsPerPage}
              onPageChange={(_, p) => setSentPage(p)}
              onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setSentPage(0); }}
            />
          </Paper>
        </>
      ) : loadingReceived ? <Box sx={{ py: 6, textAlign: "center" }}><Loader /></Box> : (
        <>
          {/* Pending Hosts */}
          <SectionCard icon={<PeopleIcon fontSize="small" />} title="Host Approval Requests" count={received.pendingHosts.length} accentColor="#d97706">
            <TableHead><TableRow>
              <SortCell label="Name"       field="name"        orderBy={hOB} order={hO} onSort={hSort} />
              <SortCell label="Email"      field="email"       orderBy={hOB} order={hO} onSort={hSort} />
              <SortCell label="Phone"      field="phone"       orderBy={hOB} order={hO} onSort={hSort} />
              <SortCell label="Profile Type" field="performerType" orderBy={hOB} order={hO} onSort={hSort} />
              <SortCell label="Submitted"  field="createdAt"   orderBy={hOB} order={hO} onSort={hSort} />
            </TableRow></TableHead>
            <TableBody>
              {received.pendingHosts.length === 0 ? (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>No pending host approvals</TableCell></TableRow>
              ) : sortedHosts.map(h => (
                <TableRow key={h._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                  <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{h.name || "—"}</TableCell>
                  <TableCell sx={cellSx}>{h.email || "—"}</TableCell>
                  <TableCell sx={cellSx}>{h.phone || "—"}</TableCell>
                  <TableCell sx={cellSx}><Chip label={h.performerType || h.profileType || "Host"} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, height: 20, background: "#f0f9ff", color: "#0369a1", textTransform: "capitalize" }} /></TableCell>
                  <TableCell sx={cellSx}>{dayjs(h.createdAt).format("DD MMM YYYY, hh:mm A")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </SectionCard>

          {/* Pending Events */}
          <SectionCard icon={<EventIcon fontSize="small" />} title="Event Approval Requests" count={received.pendingEvents.length} accentColor="#059669">
            <TableHead><TableRow>
              <SortCell label="Event ID"   field="eventId"    orderBy={eOB} order={eO} onSort={eSort} />
              <SortCell label="Event Name" field="eventName"  orderBy={eOB} order={eO} onSort={eSort} />
              <PlainCell label="Category" />
              <SortCell label="Host"       field="hostName"   orderBy={eOB} order={eO} onSort={eSort} />
              <SortCell label="Start Date" field="startDate"  orderBy={eOB} order={eO} onSort={eSort} />
              <SortCell label="Submitted"  field="createdAt"  orderBy={eOB} order={eO} onSort={eSort} />
            </TableRow></TableHead>
            <TableBody>
              {received.pendingEvents.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>No pending event approvals</TableCell></TableRow>
              ) : sortedEvents.map(e => (
                <TableRow key={e._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                  <TableCell sx={cellSx}>
                      <Tooltip title="Click to copy" arrow>
                        <Box component="span" onClick={() => { navigator.clipboard.writeText(e.eventId || e._id || ""); toast("Event ID copied", "success"); }}
                          sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-block", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                          {e.eventId || "—"}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{e.eventName}</TableCell>
                  <TableCell sx={cellSx}>{e.eventCategory?.[0] ? <Chip label={e.eventCategory[0]} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fff7ed", color: "#D26600", height: 20 }} /> : "—"}</TableCell>
                  <TableCell sx={cellSx}>{e.hostName || e.user?.name || "—"}</TableCell>
                  <TableCell sx={cellSx}>{e.startDate ? dayjs(e.startDate).format("DD MMM YYYY") : "—"}</TableCell>
                  <TableCell sx={cellSx}>{dayjs(e.createdAt).format("DD MMM YYYY, hh:mm A")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </SectionCard>

          {/* Draft Events */}
          <SectionCard icon={<DraftsIcon fontSize="small" />} title="Draft Events" count={received.draftEvents.length} accentColor="#7c3aed">
            <TableHead><TableRow>
              <SortCell label="Event ID"     field="eventId"   orderBy={dOB} order={dO} onSort={dSort} />
              <SortCell label="Event Name"   field="eventName" orderBy={dOB} order={dO} onSort={dSort} />
              <PlainCell label="Category" />
              <SortCell label="Host"         field="hostName"  orderBy={dOB} order={dO} onSort={dSort} />
              <PlainCell label="Progress" />
              <SortCell label="Last Updated" field="updatedAt" orderBy={dOB} order={dO} onSort={dSort} />
            </TableRow></TableHead>
            <TableBody>
              {received.draftEvents.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 4, color: "#94a3b8" }}>No draft events</TableCell></TableRow>
              ) : sortedDrafts.map(e => (
                <TableRow key={e._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                  <TableCell sx={cellSx}>
                      <Tooltip title="Click to copy" arrow>
                        <Box component="span" onClick={() => { navigator.clipboard.writeText(e.eventId || e._id || ""); toast("Event ID copied", "success"); }}
                          sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-block", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                          {e.eventId || "—"}
                        </Box>
                      </Tooltip>
                    </TableCell>
                  <TableCell sx={{ ...cellSx, fontWeight: 600 }}>{e.eventName}</TableCell>
                  <TableCell sx={cellSx}>{e.eventCategory?.[0] ? <Chip label={e.eventCategory[0]} size="small" sx={{ fontSize: "0.68rem", fontWeight: 700, background: "#fff7ed", color: "#D26600", height: 20 }} /> : "—"}</TableCell>
                  <TableCell sx={cellSx}>{e.hostName || e.user?.name || "—"}</TableCell>
                  <TableCell sx={{ ...cellSx, minWidth: 120 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Box sx={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                        <Box sx={{ width: `${e.formProgress || 0}%`, height: "100%", background: "linear-gradient(90deg,#7c3aed,#a78bfa)", borderRadius: 3 }} />
                      </Box>
                      <Typography sx={{ fontSize: "0.72rem", fontWeight: 700, color: "#64748b", minWidth: 30 }}>{e.formProgress || 0}%</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={cellSx}>{dayjs(e.updatedAt || e.createdAt).format("DD MMM YYYY, hh:mm A")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </SectionCard>
        </>
      )}

      {selectedMessage && (
        <Box sx={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <Paper sx={{ p: 3, borderRadius: "16px", maxWidth: 500, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <Typography sx={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", mb: 2, fontFamily: "var(--font-admin)" }}>Message Details</Typography>
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

export default NotificationList;
