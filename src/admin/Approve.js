import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import View from "@mui/icons-material/VisibilityTwoTone";
import Edit from "@mui/icons-material/BorderColorTwoTone";
import Delete from "@mui/icons-material/DeleteForeverTwoTone";
import CheckCircle from "@mui/icons-material/CheckCircleTwoTone";
import Loader from "../components/Loader";
import dayjs from "dayjs";
import { Divider } from "@mui/material";
import { toast, confirmDialog } from "../components/Popup";

const PendingEvents = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { fetchPendingEvents(); }, []);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    return { "Content-Type": "application/json", ...(token && { Authorization: `Bearer ${token}` }) };
  };

  const fetchPendingEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${url}admin/events/pending`, { headers: getHeaders() });
      setEvents(response.data.data?.events || response.data.pending || []);
    } catch (error) {
      toast("Error fetching pending events: " + (error.response?.data?.message || error.message), "error");
    } finally { setLoading(false); }
  };

  const handleApprove = async (event) => {
    const ok = await confirmDialog(`Approve "${event.eventName}"?`);
    if (!ok) return;
    setLoading(true);
    try {
      const response = await axios.put(`${url}admin/approve/${event._id}`, {}, { headers: getHeaders() });
      setEvents(events.filter((e) => e._id !== event._id));
      toast(response.data.message || "Event approved successfully!", "success");
    } catch (error) {
      toast("Error approving event: " + (error.response?.data?.message || error.message), "error");
    } finally { setLoading(false); }
  };

  const handleReject = async (event) => {
    const ok = await confirmDialog(`Reject "${event.eventName}"?`);
    if (!ok) return;
    setLoading(true);
    try {
      const response = await axios.put(`${url}admin/reject/${event._id}`, {}, { headers: getHeaders() });
      setEvents(events.filter((e) => e._id !== event._id));
      toast(response.data.message || "Event rejected successfully!", "success");
    } catch (error) {
      toast("Error rejecting event: " + (error.response?.data?.message || error.message), "error");
    } finally { setLoading(false); }
  };

  const handleDelete = async (event) => {
    const ok = await confirmDialog(`Delete "${event.eventName}"? This action is irreversible.`);
    if (!ok) return;
    setLoading(true);
    try {
      const response = await axios.delete(`${url}events/${event._id}`, { headers: getHeaders() });
      setEvents(events.filter((e) => e._id !== event._id));
      toast(response.data.message || "Event deleted successfully!", "success");
    } catch (error) {
      toast("Error deleting event: " + (error.response?.data?.message || error.message), "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="px-2">
      {loading && <Loader />}
      <h1 className="text-2xl font-bold mb-4">Pending Events</h1>
      <div className="overflow-x-auto">
        <div>
          <div className="flex bg-[#EE7D45] text-white font-bold">
            <div className="p-3 w-16 flex-shrink-0">ID</div>
            <div className="p-3 w-40 flex-shrink-0">Event Name</div>
            <div className="p-3 w-32 flex-shrink-0">Category</div>
            <div className="p-3 w-32 flex-shrink-0">Host Name</div>
            <div className="p-3 w-32 flex-shrink-0">Host Contact</div>
            <div className="p-3 w-40 flex-shrink-0">Start Date</div>
            <div className="p-3 w-40 flex-shrink-0">End Date</div>
            <div className="p-3 w-32 flex-shrink-0">Created At</div>
            <div className="p-3 w-32 flex-shrink-0">Actions</div>
          </div>
          {events && events.length > 0 ? events.map((event) => (
            <React.Fragment key={event._id}>
              <div className="flex border-b border-gray-200 hover:bg-gray-50 text-gray-700 text-sm">
                <div className="p-3 w-16 flex-shrink-0 cursor-pointer" title="Click to copy ID" onClick={() => navigator.clipboard.writeText(event._id)}>
                  {event._id ? `${event._id.slice(-5)}...` : "--"}
                </div>
                <div className="p-3 w-40 flex-shrink-0 cursor-pointer truncate" onClick={() => navigator.clipboard.writeText(event.eventName)}>
                  {event.eventName || "--"}
                </div>
                <div className="p-3 w-32 flex-shrink-0 cursor-pointer truncate" onClick={() => navigator.clipboard.writeText(event.eventCategory)}>
                  {event.eventCategory || "--"}
                </div>
                <div className="p-3 w-32 flex-shrink-0 cursor-pointer truncate" onClick={() => navigator.clipboard.writeText(event.hostName)}>
                  {event.hostName || "--"}
                </div>
                <div className="p-3 w-32 flex-shrink-0 cursor-pointer truncate" onClick={() => navigator.clipboard.writeText(event.hostWhatsapp)}>
                  <a href={`tel:+91${event.hostWhatsapp}`}>{event.hostWhatsapp || "--"}</a>
                </div>
                <div className="p-3 w-40 flex-shrink-0 cursor-pointer" onClick={() => navigator.clipboard.writeText(dayjs(event.startDate).format("DD-MM-YYYY HH:mm"))}>
                  {event.startDate ? dayjs(event.startDate).format("DD-MM-YYYY HH:mm") : "--"}
                </div>
                <div className="p-3 w-40 flex-shrink-0 cursor-pointer" onClick={() => navigator.clipboard.writeText(dayjs(event.endDate).format("DD-MM-YYYY HH:mm"))}>
                  {event.endDate ? dayjs(event.endDate).format("DD-MM-YYYY HH:mm") : "--"}
                </div>
                <div className="p-3 w-32 flex-shrink-0 cursor-pointer" onClick={() => navigator.clipboard.writeText(dayjs(event.createdAt).format("DD-MM-YYYY HH:mm"))}>
                  {event.createdAt ? dayjs(event.createdAt).format("DD-MM-YYYY HH:mm") : "--"}
                </div>
                <div className="w-fit flex-shrink-0 flex gap-2 items-center justify-center">
                  <View onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/event/${event._id}`, "_blank", "noopener,noreferrer")} titleAccess="View Event" className="text-[#D26600] cursor-pointer" />
                  <Edit titleAccess="Edit Event" style={{ color: "#D26600" }} className="cursor-pointer" onClick={() => navigate(`/admin/updateevent/${event._id}`)} />
                  <Delete onClick={() => handleDelete(event)} titleAccess="Delete Event" className="text-[#D26600] cursor-pointer" />
                  <CheckCircle onClick={() => handleApprove(event)} titleAccess="Approve Event" className="text-[#D26600] cursor-pointer" />
                </div>
              </div>
              <Divider />
            </React.Fragment>
          )) : (
            <div className="p-4 text-center border-b">No pending events found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingEvents;
