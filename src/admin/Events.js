import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { IconButton, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityTwoTone";
import EditIcon from "@mui/icons-material/BorderColorTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteForeverTwoTone";
import BlockIcon from "@mui/icons-material/BlockTwoTone";
import StarIcon from "@mui/icons-material/StarTwoTone";
import StarBorderIcon from "@mui/icons-material/StarBorderTwoTone";
import ArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import Loader from "../components/Loader";
import { toast, confirmDialog } from "../components/Popup";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "32px", flexWrap: "wrap", gap: "20px" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0, letterSpacing: "-0.025em" },
  subTitle: { fontSize: "0.875rem", color: "#64748b", marginTop: "4px" },
  statsRow: { display: "flex", gap: "16px", marginBottom: "32px" },
  statCard: { background: "#fff", padding: "16px 24px", borderRadius: "16px", border: "1px solid #e2e8f0", flex: 1, display: "flex", flexDirection: "column", gap: "4px" },
  statVal: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a" },
  statLabel: { fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" },
  filterBar: { background: "#fff", padding: "16px", borderRadius: "16px", border: "1px solid #e2e8f0", display: "flex", gap: "16px", marginBottom: "24px", alignItems: "center", flexWrap: "wrap" },
  searchInput: { flex: 1, minWidth: "200px", padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", transition: "all 0.2s" },
  select: { padding: "10px 16px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "0.9rem", outline: "none", background: "#fff", cursor: "pointer" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  th: { padding: "14px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", textAlign: "left", whiteSpace: "nowrap" },
  td: { padding: "16px", borderBottom: "1px solid #f1f5f9", fontSize: "0.875rem", color: "#334155", verticalAlign: "middle", whiteSpace: "nowrap" },
  eventThumb: { width: "40px", height: "40px", borderRadius: "8px", objectFit: "cover", background: "#f1f5f9" },
  badge: (bg, fg) => ({ padding: "4px 10px", borderRadius: "20px", fontSize: "0.68rem", fontWeight: 700, background: bg, color: fg }),
  actionBtn: (color) => ({ padding: "8px", borderRadius: "8px", border: "none", background: "transparent", color: color, cursor: "pointer", transition: "all 0.2s", display: "inline-flex", alignItems: "center", justifyContent: "center" }),
  pagination: { padding: "16px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#f8fafc", borderTop: "1px solid #e2e8f0" },
  pgBtn: { padding: "6px 12px", borderRadius: "8px", border: "1px solid #e2e8f0", background: "#fff", color: "#64748b", fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", transition: "all 0.2s" }
};

const categoryOptions = ["Satsang", "Kirtan", "Sabha", "Yoga", "Utsav", "Adhyatmik", "Puja", "Seva & Charity", "Sanskritik", "Vividh"];

const Events = () => {
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ eventName: "", host: "", place: "", category: "", status: "all", language: "", type: "all" });
  const [sorting, setSorting] = useState([{ id: "startDate", desc: false }]);

  const [draftsCount, setDraftsCount] = useState(0);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        
        // Fetch all events
        const res = await axios.get(`${url}events?limit=1000`, { headers });
        setAllEvents(res.data.data?.events || res.data.events || []);

        // Fetch drafts count
        const draftsRes = await axios.get(`${url}admin/events/drafts`, { headers });
        setDraftsCount(draftsRes.data.data?.events?.length || draftsRes.data.events?.length || 0);
      } catch (e) {
        toast("Error fetching events", "error");
      } finally { setLoading(false); }
    };
    fetchEvents();
  }, [url]);

  const handleDelete = async (event) => {
    const ok = await confirmDialog(`Are you sure you want to delete "${event.eventName}"?`);
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}events/${event._id}`, { headers: { Authorization: `Bearer ${token}` } });
      setAllEvents(prev => prev.filter(e => e._id !== event._id));
      toast("Event deleted", "success");
    } catch (e) { toast("Failed to delete", "error"); }
  };

  const handleTogglePopular = async (event) => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${url}admin/events/${event._id}/toggle-popular`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAllEvents(prev => prev.map(e => e._id === event._id ? { ...e, isPopular: res.data.data.isPopular } : e));
      toast(res.data.data.isPopular ? "Marked as Popular" : "Unmarked from Popular", "success");
    } catch (e) { toast("Failed to update popularity", "error"); }
  };

  const handleApprove = async (event) => {
    const ok = await confirmDialog(`Approve "${event.eventName}"?`);
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${url}admin/events/approve/${event._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAllEvents(prev => prev.map(e => e._id === event._id ? { ...e, approved: true } : e));
      toast("Event approved", "success");
    } catch (e) { toast("Approval failed", "error"); }
  };

  const handleReject = async (event) => {
    const ok = await confirmDialog(`Reject "${event.eventName}"?`);
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      await axios.put(`${url}admin/events/reject/${event._id}`, {}, { headers: { Authorization: `Bearer ${token}` } });
      setAllEvents(prev => prev.map(e => e._id === event._id ? { ...e, approved: false } : e));
      toast("Event rejected", "info");
    } catch (e) { toast("Rejection failed", "error"); }
  };

  const filteredEvents = useMemo(() => {
    return allEvents.filter(e => {
      const matchesName = !filters.eventName || e.eventName?.toLowerCase().includes(filters.eventName.toLowerCase());
      const matchesHost = !filters.host || e.hostName?.toLowerCase().includes(filters.host.toLowerCase());
      const matchesPlace = !filters.place || e.city?.toLowerCase().includes(filters.place.toLowerCase()) || e.address?.toLowerCase().includes(filters.place.toLowerCase());
      const matchesCategory = !filters.category || e.eventCategory?.includes(filters.category);
      const matchesStatus = filters.status === "all" || (filters.status === "approved" ? e.approved : !e.approved);
      const matchesLanguage = !filters.language || e.eventLang === filters.language;
      const matchesType = filters.type === "all" || (filters.type === "free" ? e.eventPrice === "0" : e.eventPrice !== "0");
      return matchesName && matchesHost && matchesPlace && matchesCategory && matchesStatus && matchesLanguage && matchesType;
    });
  }, [allEvents, filters]);

  const columns = useMemo(() => [
    {
      accessorKey: "eventId",
      header: "Event ID",
      cell: ({ getValue }) => (
        <span style={{ fontFamily: "monospace", fontSize: "0.75rem", color: "#64748b", fontWeight: 700 }}>
          {getValue() || "—"}
        </span>
      )
    },
    {
      accessorKey: "eventName",
      header: "Event Detail",
      cell: ({ row, getValue }) => {
        const poster = row.original.eventPosters?.[0];
        const src = poster ? (poster.startsWith("http") ? poster : `${url.replace("/api/", "/")}${poster}`) : null;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <img src={src || "https://via.placeholder.com/40"} alt="" style={S.eventThumb} onError={(e) => e.target.src = "https://via.placeholder.com/40"} />
            <div>
              <div style={{ fontWeight: 700, color: "#0f172a" }}>{getValue()}</div>
              <div style={{ fontSize: "0.75rem", color: "#64748b" }}>{row.original.city}, {row.original.country}</div>
            </div>
          </div>
        );
      }
    },
    {
      accessorKey: "hostName",
      header: "Host",
      cell: ({ getValue }) => <div style={{ fontWeight: 600 }}>{getValue() || "—"}</div>
    },
    {
      accessorKey: "eventCategory",
      header: "Category",
      cell: ({ getValue }) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
          {getValue()?.slice(0, 2).map((c, i) => (
            <span key={i} style={S.badge("#eff6ff", "#1e40af")}>{c}</span>
          ))}
          {getValue()?.length > 2 && <span style={S.badge("#f1f5f9", "#475569")}>+{getValue().length - 2}</span>}
        </div>
      )
    },
    {
      accessorKey: "startDate",
      header: "Date & Price",
      cell: ({ row, getValue }) => (
        <div>
          <div style={{ fontWeight: 600 }}>{dayjs(getValue()).format("DD MMM YYYY")}</div>
          <div style={{ fontSize: "0.75rem", color: row.original.eventPrice === "0" ? "#15803d" : "#D26600", fontWeight: 700 }}>
            {row.original.eventPrice === "0" ? "FREE" : `₹${row.original.eventPrice}`}
          </div>
        </div>
      )
    },
    {
      accessorKey: "approved",
      header: "Engagement",
      cell: ({ row }) => (
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#64748b", fontSize: "0.75rem" }}>
            <VisibilityIcon sx={{ fontSize: 14 }} />
            <span style={{ fontWeight: 600 }}>{row.original.viewCount || 0}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#059669", fontSize: "0.75rem" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span style={{ fontWeight: 600 }}>{row.original.bookings?.length || 0}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "approved",
      header: "Status",
      cell: ({ getValue }) => {
        const approved = getValue();
        return <span style={S.badge(approved ? "#f0fdf4" : "#fff7ed", approved ? "#166534" : "#9a3412")}>
          {approved ? "Approved" : "Pending"}
        </span>;
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Tooltip title={row.original.isPopular ? "Unmark Popular" : "Mark Popular"}>
            <button style={S.actionBtn(row.original.isPopular ? "#f59e0b" : "#cbd5e1")} onClick={() => handleTogglePopular(row.original)}>
              {row.original.isPopular ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
            </button>
          </Tooltip>
          <Tooltip title="View">
            <button style={S.actionBtn("#64748b")} onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/event/${row.original._id}`, "_blank")}>
              <VisibilityIcon fontSize="small" />
            </button>
          </Tooltip>
          <Tooltip title="Edit">
            <button style={S.actionBtn("#D26600")} onClick={() => navigate(`/admin/updateevent/${row.original._id}`)}>
              <EditIcon fontSize="small" />
            </button>
          </Tooltip>
          {!row.original.approved ? (
            <Tooltip title="Approve">
              <button style={S.actionBtn("#15803d")} onClick={() => handleApprove(row.original)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              </button>
            </Tooltip>
          ) : (
            <Tooltip title="Reject">
              <button style={S.actionBtn("#ef4444")} onClick={() => handleReject(row.original)}>
                <BlockIcon fontSize="small" />
              </button>
            </Tooltip>
          )}
          <Tooltip title="Delete">
            <button style={S.actionBtn("#ef4444")} onClick={() => handleDelete(row.original)}>
              <DeleteIcon fontSize="small" />
            </button>
          </Tooltip>
        </div>
      )
    }
  ], [url, navigate]);

  const table = useReactTable({
    data: filteredEvents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 12 } }
  });

  const stats = useMemo(() => ({
    total: allEvents.length,
    pending: allEvents.filter(e => !e.approved).length,
    popular: allEvents.filter(e => e.isPopular).length,
    drafts: draftsCount
  }), [allEvents, draftsCount]);

  return (
    <div style={S.container}>
      {loading && <Loader />}

      <div style={S.header}>
        <div>
          <h1 style={S.title}>Events Management</h1>
          <p style={S.subTitle}>Manage and moderate all spiritual events on the platform</p>
        </div>
      </div>

      <div style={S.statsRow}>
        <div style={S.statCard}>
          <span style={S.statLabel}>Total Events</span>
          <span style={S.statVal}>{stats.total}</span>
        </div>
        <div style={{ ...S.statCard, borderLeft: "4px solid #f59e0b", cursor: "pointer" }} onClick={() => navigate("/admin/approve")}>
          <span style={S.statLabel}>Pending Approval</span>
          <span style={S.statVal}>{stats.pending}</span>
        </div>
        <div style={{ ...S.statCard, borderLeft: "4px solid #D26600" }}>
          <span style={S.statLabel}>Popular Events</span>
          <span style={S.statVal}>{stats.popular}</span>
        </div>
        <div style={{ ...S.statCard, borderLeft: "4px solid #64748b", cursor: "pointer" }} onClick={() => navigate("/admin/drafts")}>
          <span style={S.statLabel}>Draft Events</span>
          <span style={S.statVal}>{stats.drafts}</span>
        </div>
      </div> 

      <div style={{ ...S.filterBar, flexDirection: "column", alignItems: "stretch", gap: "12px" }}>
        {/* Row 1: Search Inputs */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input style={S.searchInput} placeholder="Search Event Name..." value={filters.eventName} onChange={e => setFilters({ ...filters, eventName: e.target.value })} />
          <input style={S.searchInput} placeholder="Search Host..." value={filters.host} onChange={e => setFilters({ ...filters, host: e.target.value })} />
          <input style={S.searchInput} placeholder="Search Place/City..." value={filters.place} onChange={e => setFilters({ ...filters, place: e.target.value })} />
        </div>
        
        {/* Row 2: Select Filters */}
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <select style={{ ...S.select, flex: 1 }} value={filters.category} onChange={e => setFilters({ ...filters, category: e.target.value })}>
            <option value="">All Categories</option>
            {categoryOptions.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select style={{ ...S.select, flex: 1 }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
            <option value="all">All Status</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
          </select>
          <select style={{ ...S.select, flex: 1 }} value={filters.language} onChange={e => setFilters({ ...filters, language: e.target.value })}>
            <option value="">All Languages</option>
            <option value="Hindi">Hindi</option>
            <option value="English">English</option>
            <option value="Hindi & English">Hindi & English</option>
          </select>
          <select style={{ ...S.select, flex: 1 }} value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
            <option value="all">Free & Paid</option>
            <option value="free">Free Events</option>
            <option value="paid">Paid Events</option>
          </select>
        </div>
      </div>

      <div style={S.card}>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              {table.getHeaderGroups().map(hg => (
                <tr key={hg.id}>
                  {hg.headers.map(header => (
                    <th key={header.id} style={S.th} onClick={header.column.getToggleSortingHandler()}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer" }}>
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && <ArrowUpIcon sx={{ fontSize: 14 }} />}
                        {header.column.getIsSorted() === "desc" && <ArrowDownIcon sx={{ fontSize: 14 }} />}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.length === 0 ? (
                <tr><td colSpan={columns.length} style={{ ...S.td, textAlign: "center", padding: "64px", color: "#94a3b8" }}>No events found matching your criteria.</td></tr>
              ) : table.getRowModel().rows.map(row => (
                <tr key={row.id} onMouseEnter={e => e.currentTarget.style.background = "#fcfcfc"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} style={S.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={S.pagination}>
          <span style={{ fontSize: "0.875rem", color: "#64748b" }}>
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} ({filteredEvents.length} events)
          </span>
          <div style={{ display: "flex", gap: "8px" }}>
            <button style={S.pgBtn} onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>Previous</button>
            <button style={S.pgBtn} onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
