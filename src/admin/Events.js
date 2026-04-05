import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import SearchAndFilters from "../components/SearchAndFilters";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import dayjs from "dayjs";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { IconButton, Chip, Tooltip } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityTwoTone";
import EditIcon from "@mui/icons-material/BorderColorTwoTone";
import DeleteIcon from "@mui/icons-material/DeleteForeverTwoTone";
import BlockIcon from "@mui/icons-material/BlockTwoTone";
import ArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import ArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import '../Csss/Orders.css';
import { toast, confirmDialog } from "../components/Popup";

const Events = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  const [searchedEvents, setSearchedEvents] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteEventId, setDeleteEventId] = useState(null);
  const [latestPage, setLatestPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [sorting, setSorting] = useState([]);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  useEffect(() => { fetchEvents(1); }, []);

  const fetchEvents = async (page) => {
    setLoading(true);
    try {
      const res = await axios.get(`${url}events?page=${page}&limit=20`, { headers: getHeaders() });
      const events = res.data.data?.events || [];
      const total = res.data.data?.total || 0;
      const limit = res.data.data?.limit || 20;
      setAllEvents(page === 1 ? events : prev => [...prev, ...events]);
      setHasMore(page * limit < total);
      setLatestPage(page);
    } catch (e) {
      if (e.response?.status !== 401) toast(e.response?.data?.message || "Failed to fetch events", "error");
    } finally { setLoading(false); }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await axios.delete(`${url}events/${deleteEventId}`, { headers: getHeaders() });
      setAllEvents(prev => prev.filter(e => e._id !== deleteEventId));
      setSearchedEvents(prev => prev.filter(e => e._id !== deleteEventId));
      setDeleteEventId(null);
    } catch (e) {
      toast(e.response?.data?.message || "Failed to delete", "error");
    } finally { setLoading(false); }
  };

  const handleReject = async (event) => {
    const ok = await confirmDialog(`Reject "${event.eventName}"?`);
    if (!ok) return;
    setLoading(true);
    try {
      await axios.put(`${url}admin/reject/${event._id}`, {}, { headers: getHeaders() });
      setAllEvents(prev => prev.filter(e => e._id !== event._id));
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    } finally { setLoading(false); }
  };

  const displayEvents = searchedEvents.length > 0 ? searchedEvents : allEvents;

  const columns = useMemo(() => [
    {
      accessorKey: "_id",
      header: "ID",
      size: 80,
      cell: ({ getValue }) => (
        <span
          onClick={() => navigator.clipboard.writeText(getValue())}
          title="Click to copy"
          style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#9ca3af", cursor: "pointer" }}>
          ...{getValue().slice(-5)}
        </span>
      ),
    },
    {
      accessorKey: "eventName",
      header: "Event",
      size: 220,
      cell: ({ row, getValue }) => {
        const poster = row.original.eventPosters?.[0];
        const src = poster ? (poster.startsWith("http") ? poster : `${url?.replace("/api/", "")}${poster}`) : null;
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {src
              ? <div style={{ position: "relative", width: 34, height: 34, borderRadius: 8, overflow: "hidden", flexShrink: 0, background: "linear-gradient(135deg, #D26600, #f59e0b)" }}>
                  <img src={src} alt="" onError={e => { e.target.style.display='none'; }} style={{ width: 34, height: 34, borderRadius: 8, objectFit: "cover", position: "absolute", inset: 0 }} />
                  <span style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem", fontWeight: 800, color: "rgba(255,255,255,0.7)" }}>{getValue()?.[0]?.toUpperCase()}</span>
                </div>
              : <div style={{ width: 34, height: 34, borderRadius: 8, background: "#fff7ed", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#D26600" }}>{getValue()?.[0]}</span>
                </div>
            }
            <span
              onClick={() => navigator.clipboard.writeText(getValue())}
              title="Click to copy"
              style={{ fontWeight: 600, fontSize: "0.82rem", color: "#111", cursor: "pointer", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 160 }}>
              {getValue()}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "hostName",
      header: "Host",
      size: 130,
      cell: ({ getValue }) => <span style={{ fontSize: "0.82rem", color: "#444" }}>{getValue() || "—"}</span>,
    },
    {
      accessorKey: "eventCategory",
      header: "Category",
      size: 130,
      enableSorting: false,
      cell: ({ getValue }) => (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
          {getValue()?.map((c, i) => (
            <span key={i} style={{ fontSize: "0.65rem", fontWeight: 700, background: "#fff7ed", color: "#D26600", border: "1px solid #fed7aa", borderRadius: 999, padding: "1px 8px" }}>
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "startDate",
      header: "Start",
      size: 110,
      cell: ({ getValue }) => <span style={{ fontSize: "0.8rem", color: "#555" }}>{dayjs(getValue()).format("DD MMM YYYY")}</span>,
    },
    {
      accessorKey: "endDate",
      header: "End",
      size: 110,
      cell: ({ getValue }) => <span style={{ fontSize: "0.8rem", color: "#555" }}>{dayjs(getValue()).format("DD MMM YYYY")}</span>,
    },
    {
      accessorKey: "eventPrice",
      header: "Price",
      size: 80,
      cell: ({ getValue }) => {
        const v = getValue();
        const free = !v || v === "0";
        return <span style={{ fontWeight: 700, fontSize: "0.82rem", color: free ? "#15803d" : "#111" }}>{free ? "Free" : `₹${v}`}</span>;
      },
    },
    {
      accessorKey: "approved",
      header: "Status",
      size: 110,
      cell: ({ getValue }) => {
        const approved = getValue();
        return (
          <span style={{
            fontSize: "0.68rem", fontWeight: 700, padding: "3px 10px", borderRadius: 999,
            background: approved ? "#dcfce7" : "#fef3c7",
            color: approved ? "#15803d" : "#92400e",
          }}>
            {approved ? "✓ Approved" : "Pending"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      size: 130,
      enableSorting: false,
      cell: ({ row }) => (
        <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Tooltip title="View">
            <IconButton size="small" onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/event/${row.original._id}`, "_blank")}>
              <VisibilityIcon sx={{ fontSize: 17, color: "#6b7280" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton size="small" onClick={() => navigate(`/admin/updateevent/${row.original._id}`)}>
              <EditIcon sx={{ fontSize: 17, color: "#D26600" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Delete">
            <IconButton size="small" onClick={() => setDeleteEventId(row.original._id)}>
              <DeleteIcon sx={{ fontSize: 17, color: "#ef4444" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reject">
            <IconButton size="small" onClick={() => handleReject(row.original)}>
              <BlockIcon sx={{ fontSize: 17, color: row.original.approved ? "#9ca3af" : "#ef4444" }} />
            </IconButton>
          </Tooltip>
        </div>
      ),
    },
  ], [allEvents]);

  const table = useReactTable({
    data: displayEvents,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageSize: 15 } },
  });

  return (
    <div className="events-page" style={{ padding: "1rem" }}>
      <div className="search-section">
        <SearchAndFilters handleSearchDataChange={(r) => setSearchedEvents(r)} />
      </div>

      {loading && <Loader />}

      <div style={{ marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#111", marginBottom: "1rem" }}>
          All Events <span style={{ fontSize: "0.8rem", color: "#9ca3af", fontWeight: 400 }}>({displayEvents.length})</span>
        </h2>

        <div style={{ background: "#fff", borderRadius: 14, boxShadow: "0 1px 6px rgba(0,0,0,0.07)", overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                {table.getHeaderGroups().map(hg => (
                  <tr key={hg.id}>
                    {hg.headers.map(header => (
                      <th key={header.id}
                        onClick={header.column.getToggleSortingHandler()}
                        style={{
                          padding: "11px 14px", textAlign: "left", background: "#EE7D45",
                          color: "#fff", fontSize: "0.72rem", fontWeight: 700,
                          textTransform: "uppercase", letterSpacing: "0.05em",
                          whiteSpace: "nowrap", userSelect: "none",
                          cursor: header.column.getCanSort() ? "pointer" : "default",
                          width: header.getSize(),
                        }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
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
                  <tr>
                    <td colSpan={columns.length} style={{ textAlign: "center", padding: "40px", color: "#9ca3af", fontSize: "0.875rem" }}>
                      No events found
                    </td>
                  </tr>
                ) : table.getRowModel().rows.map(row => (
                  <tr key={row.id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.15s" }}>
                    {row.getVisibleCells().map(cell => (
                      <td key={cell.id} style={{
                        padding: "10px 14px", borderBottom: "1px solid #f3f4f6",
                        fontSize: "0.82rem", color: "#222",
                        maxWidth: cell.column.getSize(), overflow: "hidden",
                      }}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderTop: "1px solid #f3f4f6", flexWrap: "wrap", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()} — {displayEvents.length} events
            </span>
            <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <button onClick={() => table.setPageIndex(0)} disabled={!table.getCanPreviousPage()} style={pgBtn}>«</button>
              <button onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()} style={pgBtn}>‹</button>
              <button onClick={() => table.nextPage()} disabled={!table.getCanNextPage()} style={pgBtn}>›</button>
              <button onClick={() => table.setPageIndex(table.getPageCount() - 1)} disabled={!table.getCanNextPage()} style={pgBtn}>»</button>
              <select value={table.getState().pagination.pageSize}
                onChange={e => table.setPageSize(Number(e.target.value))}
                style={{ fontSize: "0.8rem", padding: "4px 8px", borderRadius: 6, border: "1px solid #e5e7eb", color: "#444" }}>
                {[10, 15, 20, 50].map(s => <option key={s} value={s}>Show {s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {hasMore && (
          <div style={{ marginTop: 12, textAlign: "center" }}>
            <button onClick={() => fetchEvents(latestPage + 1)} disabled={loading}
              style={{ background: "#EE7D45", color: "#fff", border: "none", padding: "8px 24px", borderRadius: 8, fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", opacity: loading ? 0.6 : 1 }}>
              Load More from Server
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteEventId && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: 360, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>
            <h3 style={{ margin: "0 0 8px", fontSize: "1rem", fontWeight: 700 }}>Delete Event?</h3>
            <p style={{ margin: "0 0 20px", fontSize: "0.875rem", color: "#6b7280" }}>This action cannot be undone.</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={() => setDeleteEventId(null)}
                style={{ padding: "8px 18px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                Cancel
              </button>
              <button onClick={handleDelete}
                style={{ padding: "8px 18px", borderRadius: 8, border: "none", background: "#ef4444", color: "#fff", cursor: "pointer", fontWeight: 600, fontSize: "0.85rem" }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const pgBtn = {
  padding: "4px 10px", borderRadius: 6, border: "1px solid #e5e7eb",
  background: "#fff", cursor: "pointer", fontSize: "0.85rem", color: "#444",
  fontWeight: 600, transition: "background 0.15s",
};

export default Events;
