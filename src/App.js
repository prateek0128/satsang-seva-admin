import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigationType, useLocation } from "react-router-dom";

import Event from "./pages/Event";
import PublicProfile from "./pages/PublicProfile";
import AddBlog from "./pages/AddBlog";

// Admin imports
import AdminPage from "./admin/AdminPage";
import AllProducts from "./admin/AllProducts";
import UserList from "./admin/UserList";
import Events from "./admin/Events";
import UserEvents from "./admin/UserEvents";
import Updateform from "./admin/Updateform";
import Approvals from "./admin/Approvals";
import Blog from "./admin/Blog";
import ViewBlog from "./admin/ViewBlog";
import DraftEvents from "./admin/DraftEvents";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminSignup from "./admin/AdminSignup";
import UpdateUser from "./admin/UpdateUser";
import UpdateEvent from "./admin/UpdateEvent";
import ViewEvent from "./admin/ViewEvent";
import DeleteAccountRequest from "./admin/DeleteAccountRequest";
import ContactQueries from "./admin/ContactQueries";
import BookingList from "./admin/BookingList";
import BookingDetails from "./admin/BookingDetails";
import NotificationList from "./admin/NotificationList";
import AdminManagement from "./admin/AdminManagement";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin")); } catch { return null; }
  });

  const handleAdmin = (adminData) => setAdmin(adminData);

  useEffect(() => {
    if (action !== "POP") window.scrollTo(0, 0);
  }, [action, pathname]);

  return (
    <Routes>
      {/* ── Redirect root to admin login ── */}
      <Route path="/" element={<AdminLogin setAdmin={handleAdmin} />} />

      {/* ── Event & Public Profile preview (opened from admin in new tab) ── */}
      <Route path="/event/:id" element={<Event />} />
      <Route path="/public-profile" element={<PublicProfile />} />
      <Route path="/delete-account" element={<DeleteAccountRequest />} />

      {/* ── ADMIN ROUTES ── */}
      <Route path="/admin">
        <Route index element={<AdminLogin setAdmin={handleAdmin} />} />
        <Route path="signup" element={<AdminSignup />} />
        <Route path="*" element={<AdminLogin setAdmin={handleAdmin} />} />
        <Route element={<AdminLayout setAdmin={handleAdmin} />}>
          <Route path="dashboard" element={<AdminPage />} />
          <Route path="allusers" element={<UserList />} />
          <Route path="events" element={<Events />} />
          <Route path="drafts" element={<DraftEvents />} />
          <Route path="approvals" element={<Approvals />} />
          <Route path="blog" element={<Blog />} />
          <Route path="viewblog/:id" element={<ViewBlog />} />
          <Route path="createblog" element={<AddBlog />} />
          <Route path="editblog/:id" element={<AddBlog />} />
          <Route path="updateuser/:id" element={<UpdateUser />} />
          <Route path="updateevent/:id" element={<UpdateEvent />} />
          <Route path="event/:id" element={<ViewEvent />} />
          <Route path="allproduct/:id/:name" element={<AllProducts />} />
          <Route path="userevents/:userId" element={<UserEvents />} />
          <Route path="userdetails/:id" element={<UpdateUser />} />
          <Route path="updateform" element={<Updateform />} />
          <Route path="contact-queries" element={<ContactQueries />} />
          <Route path="bookings" element={<BookingList />} />
          <Route path="bookings/:id" element={<BookingDetails />} />
          <Route path="notifications" element={<NotificationList />} />
          <Route path="admins" element={<AdminManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
