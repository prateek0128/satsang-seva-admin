import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "../components/Popup";
import Loader from "../components/Loader";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: 0 },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  th: { padding: "16px 24px", background: "#f1f5f9", fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em", borderBottom: "1px solid #e2e8f0" },
  td: { padding: "16px 24px", fontSize: "0.875rem", color: "#334155", borderBottom: "1px solid #f1f5f9" },
  id: { fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b", fontWeight: 700, background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" },
  badge: (status) => ({
    padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
    background: status === 'confirmed' ? "#f0fdf4" : (status === 'cancelled' ? "#fef2f2" : "#fffbeb"),
    color: status === 'confirmed' ? "#166534" : (status === 'cancelled' ? "#991b1b" : "#92400e")
  }),
  pagination: { display: "flex", justifyContent: "center", gap: "8px", marginTop: "24px" },
  pageBtn: (active) => ({ padding: "8px 16px", borderRadius: "8px", border: "1px solid #e2e8f0", background: active ? "#D26600" : "#fff", color: active ? "#fff" : "#64748b", fontWeight: 600, cursor: "pointer" })
};

const BookingList = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${url}admin/bookings`, { headers, params: { page, limit: 20 } });
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
  }, [page]);

  if (loading && page === 1) return <Loader />;

  return (
    <div style={S.container}>
      <div style={S.header}>
        <h1 style={S.title}>All Bookings</h1>
        <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 500 }}>
          Total: <span style={{ color: "#D26600", fontWeight: 700 }}>{total}</span> bookings
        </div>
      </div>

      <div style={S.card}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Booking ID</th>
              <th style={S.th}>Event</th>
              <th style={S.th}>User</th>
              <th style={S.th}>Tickets</th>
              <th style={S.th}>Date</th>
              <th style={S.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((b) => (
              <tr key={b._id}>
                <td style={S.td}>
                  <span style={S.id}>{b.bookingId || b._id}</span>
                </td>
                <td style={S.td}>
                  <div style={{ fontWeight: 600, color: "#0f172a" }}>{b.event?.eventName || "N/A"}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{b.event?.eventId || "N/A"}</div>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={S.pagination}>
        {Array.from({ length: Math.ceil(total / 20) }).map((_, i) => (
          <button key={i} style={S.pageBtn(page === i + 1)} onClick={() => setPage(i + 1)}>
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default BookingList;
