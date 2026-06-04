import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { TableCell, TableRow, Box, Typography } from '@mui/material';
import AdminTable from './AdminTable';

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2, whiteSpace: "nowrap" };

const AllProducts = () => {
  const url = process.env.REACT_APP_BACKEND;
  const { id, name } = useParams();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${url}/booking/event/${id}`);
        const data = await response.json();
        setBookings(data.booking);
      } catch (error) {
        console.error('Error fetching booking data:', error);
        alert("Error in fetching Bookings!");
        navigate(-1);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [id]);

  return (
    <Box sx={{ p: { xs: "16px", sm: "28px 32px" }, minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)" }}>
      <Box sx={{ mb: 3 }}>
        <Typography sx={{ fontSize: { xs: "1.1rem", sm: "1.4rem" }, fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em" }}>
          Booking Details
        </Typography>
        <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", mt: 0.3 }}>
          Event: <strong style={{ color: "#f58021" }}>{decodeURIComponent(name)}</strong> &nbsp;·&nbsp; ID: {id}
        </Typography>
      </Box>

      <AdminTable
        columns={[
          { label: "Booking ID" },
          { label: "Attendee Contact" },
          { label: "User Name" },
          { label: "No of Attendees" },
          { label: "Amount Paid" },
          { label: "Payment ID" },
        ]}
        rows={bookings || []}
        loading={loading}
        emptyText="No Bookings Found"
        renderRow={booking => (
          <TableRow key={booking._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
            <TableCell sx={cellSx}>{booking.bookingId || booking._id}</TableCell>
            <TableCell sx={cellSx}>{booking.attendeeContact}</TableCell>
            <TableCell sx={cellSx}>{booking.user ? booking.user.name : "N/A"}</TableCell>
            <TableCell sx={cellSx}>{booking.noOfAttendee}</TableCell>
            <TableCell sx={cellSx}>{booking.amountPaid}</TableCell>
            <TableCell sx={cellSx}>{booking.paymentId || "N/A"}</TableCell>
          </TableRow>
        )}
      />
    </Box>
  );
};

export default AllProducts;
