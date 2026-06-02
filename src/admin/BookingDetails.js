import React from "react";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const S = {
  container: { padding: "32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    marginBottom: "24px", padding: "8px 16px", borderRadius: "10px",
    border: "1px solid #e2e8f0", background: "#fff", color: "#334155",
    fontSize: "0.875rem", fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
  },
  title: { fontSize: "1.5rem", fontWeight: 800, color: "#0f172a", margin: "0 0 24px 0" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "20px" },
  card: { background: "#fff", borderRadius: "16px", border: "1px solid #e2e8f0", padding: "20px" },
  cardTitle: { fontSize: "0.75rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "16px" },
  row: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", padding: "8px 0", borderBottom: "1px solid #f1f5f9" },
  label: { fontSize: "0.8rem", color: "#64748b", fontWeight: 500 },
  value: { fontSize: "0.875rem", color: "#0f172a", fontWeight: 600, textAlign: "right", maxWidth: "60%" },
  badge: (status) => ({
    padding: "4px 12px", borderRadius: "20px", fontSize: "0.75rem", fontWeight: 700,
    background: status === "confirmed" ? "#f0fdf4" : status === "inprocess" ? "#eff6ff" : status === "cancelled" ? "#fef2f2" : "#fffbeb",
    color: status === "confirmed" ? "#166534" : status === "inprocess" ? "#1d4ed8" : status === "cancelled" ? "#991b1b" : "#92400e",
  }),
};

const Field = ({ label, value }) => (
  <div style={S.row}>
    <span style={S.label}>{label}</span>
    <span style={S.value}>{value || "N/A"}</span>
  </div>
);

const BookingDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const booking = state?.booking;

  if (!booking) return <div style={S.container}><p>Booking not found.</p></div>;

  return (
    <div style={S.container}>
      <button style={S.backBtn} onClick={() => navigate(-1)}>← Back</button>
      <h1 style={S.title}>Booking Details</h1>

      <div style={S.grid}>
        <div style={S.card}>
          <div style={S.cardTitle}>Booking Info</div>
          <Field label="Booking ID" value={booking.bookingId || booking._id} />
          <Field label="Tickets" value={booking.tickets} />
          <Field label="Amount" value={booking.amount != null ? `₹${booking.amount}` : null} />
          <Field label="Payment ID" value={booking.paymentId} />
          <div style={S.row}>
            <span style={S.label}>Status</span>
            <span style={S.badge(booking.status)}>{booking.status}</span>
          </div>
          <Field label="Booked On" value={dayjs(booking.createdAt).format("DD MMM YYYY, hh:mm A")} />
        </div>

        <div style={S.card}>
          <div style={S.cardTitle}>User Info</div>
          <Field label="Name" value={booking.user?.name} />
          <Field label="Email" value={booking.user?.email} />
          <Field label="Phone" value={booking.user?.phone} />
          <Field label="User ID" value={booking.user?.userId || booking.user?._id} />
        </div>

        {booking.status === "confirmed" && (
          <div style={{ ...S.card, display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
            <div style={S.cardTitle}>Booking QR Code</div>
            <QRCodeSVG
              value={JSON.stringify({
                bookingId: booking.bookingId || booking._id,
                user: booking.user?.name,
                event: booking.event?.eventName,
                tickets: booking.tickets,
                status: booking.status,
              })}
              size={160}
              level="M"
            />
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{booking.bookingId || booking._id}</span>
          </div>
        )}

        <div style={S.card}>
          <div style={S.cardTitle}>Event Info</div>
          <Field label="Event Name" value={booking.event?.eventName} />
          <Field label="Event ID" value={booking.event?.eventId || booking.event?._id} />
          <Field label="Host" value={booking.event?.hostName || booking.event?.user?.name} />
          <Field label="Event Date" value={booking.event?.date ? dayjs(booking.event.date).format("DD MMM YYYY") : null} />
          <Field label="Location" value={booking.event?.location || booking.event?.venue} />
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;
