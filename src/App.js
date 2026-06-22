import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";

// Auth
import AdminLogin from "./pages/Auth/AdminLogin";
import AdminSignup from "./pages/Auth/AdminSignup";

// Shared / Layout
import AdminLayout from "./pages/Shared/AdminLayout";
import AdminPage from "./pages/Shared/AdminPage";
import Updateform from "./pages/Shared/Updateform";

// Users
import UserList from "./pages/Users/UserList";
import InactiveUsers from "./pages/Users/InactiveUsers";
import UserEvents from "./pages/Users/UserEvents";
import UpdateUser from "./pages/Users/UpdateUser";
import AdminManagement from "./pages/Users/AdminManagement";

// Events
import Events from "./pages/Events/Events";
import DraftEvents from "./pages/Events/DraftEvents";
import Approvals from "./pages/Events/Approvals";
import UpdateEvent from "./pages/Events/UpdateEvent";
import ViewEvent from "./pages/Events/ViewEvent";
import AllProducts from "./pages/Events/AllProducts";

// Bookings
import BookingList from "./pages/Bookings/BookingList";
import BookingDetails from "./pages/Bookings/BookingDetails";

// Blogs
import Blog from "./pages/Blogs/Blog";
import ViewBlog from "./pages/Blogs/ViewBlog";
import AddBlog from "./pages/Blogs/Createblog";

// Notifications
import NotificationList from "./pages/Notifications/NotificationList";
import MetaTemplates from "./pages/Templates/MetaTemplates";

// Support
import ContactQueries from "./pages/Support/ContactQueries";
import DeleteAccountRequest from "./pages/Support/DeleteAccountRequest";

// Public pages
import Event from "./pages/Event";
import PublicProfile from "./pages/PublicProfile";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;
  const [admin, setAdmin] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("admin"));
    } catch {
      return null;
    }
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
          <Route path="inactive-users" element={<InactiveUsers />} />
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
          <Route path="templates" element={<MetaTemplates />} />
          <Route path="admins" element={<AdminManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
