import React, { useState, useEffect } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 },
  filterBar: {
    background: "#fff",
    padding: "16px",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    display: "flex",
    gap: "16px",
    marginBottom: "24px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  select: {
    flex: 1,
    minWidth: "200px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    cursor: "pointer",
    color: "#334155",
  },
  textInput: {
    minWidth: "180px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
    color: "#334155",
  },
  dateInput: {
    minWidth: "160px",
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    outline: "none",
    fontFamily: "inherit",
    background: "#fff",
  },
  clearBtn: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    background: "#fff",
    color: "#64748b",
    fontSize: "0.875rem",
    fontWeight: 600,
    cursor: "pointer",
    fontFamily: "inherit",
  },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 24px", background: "#f1f5f9", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap" },
  td: { padding: "16px 24px", fontSize: "0.875rem", color: "#334155", borderBottom: "1px solid #f1f5f9", whiteSpace: "nowrap" },
  id: { fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b", fontWeight: 700, background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" },
  badge: (status) => ({
    padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
    background: status === 'confirmed' ? "#f0fdf4" : status === 'cancelled' ? "#fef2f2" : status === 'inprocess' ? "#eff6ff" : "#fffbeb",
    color: status === 'confirmed' ? "#166534" : status === 'cancelled' ? "#991b1b" : status === 'inprocess' ? "#1d4ed8" : "#92400e"
  }),
  pagination: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px", flexWrap: "wrap" },
  pageBtn: (active) => ({ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: active ? "#D26600" : "#fff", color: active ? "#fff" : "#64748b", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }),
  emptyRow: { padding: "32px 24px", textAlign: "center", color: "#94a3b8", fontSize: "0.9rem" },
  viewBtn: { padding: "6px 14px", borderRadius: "8px", border: "1px solid #D26600", background: "#fff", color: "#D26600", fontSize: "0.8rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" },
};

const EMPTY_FILTERS = { eventId: "", hostName: "", date: "", bookingId: "", status: "" };

const BookingList = () => {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [eventOptions, setEventOptions] = useState([]);
  const [hostOptions, setHostOptions] = useState([]);
  const url = process.env.REACT_APP_BACKEND;

  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${url}admin/bookings/filter-options`, { headers });
        const payload = res.data?.data ?? res.data;
        if (res.data?.status === "success" || payload?.events) {
          setEventOptions(payload.events || []);
          setHostOptions(payload.hosts || (payload.hostNames || []).map((name) => ({ value: name, label: name })));
        }
      } catch (e) {
        toast("Error loading filter options", "error");
      }
    };
    fetchFilterOptions();
  }, [url]);

  useEffect(() => {
    setPage(1);
  }, [filters.eventId, filters.hostName, filters.date]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = {
        page,
        limit: 20,
        ...(filters.eventId && { eventId: filters.eventId }),
        ...(filters.hostName && { hostName: filters.hostName }),
        ...(filters.date && { date: filters.date }),
        ...(filters.bookingId && { bookingId: filters.bookingId }),
        ...(filters.status && { status: filters.status }),
      };
      const res = await axios.get(`${url}admin/bookings`, { headers, params });
      if (res.data.status === 'success') {
        setBookings(res.data.data.bookings);
        setTotal(res.data.data.total);
      }
    } catch (e) {
      toast("Error fetching bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [page, filters]);

  const hasActiveFilters = filters.eventId || filters.hostName || filters.date || filters.bookingId || filters.status;

  const clearFilters = () => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  };

  const onFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const pageCount = Math.max(1, Math.ceil(total / 20));

  if (loading && page === 1 && bookings.length === 0) return <Loader />;

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>All Bookings</h1>
        <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
          {hasActiveFilters ? "Matching" : "Total"}:{" "}
          <span style={{ color: "#D26600", fontWeight: 700 }}>{total}</span> bookings
        </div>
      </div>

      <div style={S.filterBar}>
        <input
          style={S.textInput}
          type="text"
          placeholder="Search Booking ID"
          value={filters.bookingId}
          onChange={(e) => onFilterChange("bookingId", e.target.value)}
        />
        <select
          style={S.select}
          value={filters.status}
          onChange={(e) => onFilterChange("status", e.target.value)}
          aria-label="Filter by status"
        >
          <option value="">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="inprocess">In Process</option>
        </select>
        <select
          style={S.select}
          value={filters.eventId}
          onChange={(e) => onFilterChange("eventId", e.target.value)}
          aria-label="Filter by event"
        >
          <option value="">All Events</option>
          {eventOptions.map((ev) => (
            <option key={ev.id} value={ev.id}>
              {ev.label}
            </option>
          ))}
        </select>
        <select
          style={S.select}
          value={filters.hostName}
          onChange={(e) => onFilterChange("hostName", e.target.value)}
          aria-label="Filter by host name"
        >
          <option value="">All Hosts</option>
          {hostOptions.map((host) => (
            <option key={host.value} value={host.value}>
              {host.label}
            </option>
          ))}
        </select>
        <input
          style={S.dateInput}
          type="date"
          title="Filter by booking date"
          value={filters.date}
          onChange={(e) => setFilters({ ...filters, date: e.target.value })}
        />
        {hasActiveFilters && (
          <button type="button" style={S.clearBtn} onClick={clearFilters}>
            Clear filters
          </button>
        )}
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Booking ID</th>
              <th style={S.th}>Event</th>
              <th style={S.th}>Host</th>
              <th style={S.th}>User</th>
              <th style={S.th}>Tickets</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Status</th>
              <th style={S.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && bookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={S.emptyRow}>Loading...</td>
              </tr>
            ) : bookings.length === 0 ? (
              <tr>
                <td colSpan={8} style={S.emptyRow}>
                  {hasActiveFilters ? "No bookings match your filters." : "No bookings found."}
                </td>
              </tr>
            ) : (
              bookings.map((b) => (
                <tr key={b._id}>
                  <td style={S.td}>
                    <span style={S.id}>{b.bookingId || b._id}</span>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600, color: "#0f172a" }}>{b.event?.eventName || "N/A"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{b.event?.eventId || "N/A"}</div>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600 }}>{b.event?.hostName || b.event?.user?.name || "N/A"}</div>
                  </td>
                  <td style={S.td}>
                    <div style={{ fontWeight: 600 }}>{b.user?.name || "N/A"}</div>
                    <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{b.user?.userId || "N/A"}</div>
                  </td>
                  <td style={S.td}>{b.tickets}</td>
                  <td style={S.td}>{dayjs(b.createdAt).format("DD MMM YYYY")}</td>
                  <td style={S.td}>
                    <span style={S.badge(b.status)}>{b.status}</span>
                  </td>
                  <td style={S.td}>
                    <button style={S.viewBtn} onClick={() => navigate(`/admin/bookings/${b._id}`, { state: { booking: b } })}>View</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pageCount > 1 && (
        <div style={S.pagination}>
          {Array.from({ length: pageCount }).map((_, i) => (
            <button
              key={i}
              type="button"
              style={S.pageBtn(page === i + 1)}
              onClick={() => setPage(i + 1)}
              disabled={loading}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default BookingList;
