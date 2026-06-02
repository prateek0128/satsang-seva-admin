import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigationType, useLocation } from "react-router-dom";

// User-facing page imports (kept for reference, routes commented out)
import LandingDesign from "./pages/LandingDesign";
import Event from "./pages/Event";
import CategoriesPage from "./pages/CategoriesPage";
import SignUp from "./pages/SignUp";
import CreateEventComponent from "./pages/CreateEventComponent";
import ProfilePage from "./pages/ProfilePage";
import SearchBar from "./pages/SearchBar";
import LogIn from "./pages/LogIn";
import BookingComponent from "./components/BookingComponent";
import PublicProfile from "./pages/PublicProfile";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import AddBlog from "./pages/AddBlog";
import Blogs from "./pages/Blogs";
import Terms from "./components/Terms";
import Home from "./pages/Home";
import LiveEvent from "./components/LiveEvent";
import Userlayout from "./components/UserLayout";
import ViewProfile from "./pages/ViewProfile";

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
import DeleteAccountRequest from "./admin/DeleteAccountRequest";
import ContactQueries from "./admin/ContactQueries";
import BookingList from "./admin/BookingList";
import NotificationList from "./admin/NotificationList";

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

      {/* ── USER ROUTES (commented out — admin-only build) ──
      <Route element={<Userlayout />}>
        <Route path="/sign-in" element={<SignUp />} />
        <Route path="/login" element={<LogIn />} />
        <Route path="/home" element={<Home />} />
        <Route path="/live-event" element={<LiveEvent />} />
        <Route path="/landing-design-a-2" element={<LandingDesign />} />
        <Route path="/categories-page" element={<CategoriesPage />} />
        <Route exact path="/profile-page" element={<ProfilePage />} />
        <Route path="/event-listing" element={<CreateEventComponent />} />
        <Route path="/search-bar" element={<SearchBar />} />
        <Route path="/booking" element={<BookingComponent />} />
        <Route path="/aboutus" element={<About />} />
        <Route path="/contactus" element={<ContactUs />} />
        <Route path="/blog" element={<Blogs />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/addblog" element={<AddBlog />} />
        <Route path="*" element={<LogIn />} />
      </Route>
      ── END USER ROUTES ── */}

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
          <Route path="allproduct/:id/:name" element={<AllProducts />} />
          <Route path="userevents/:userId" element={<UserEvents />} />
          <Route path="userdetails/:id" element={<UpdateUser />} />
          <Route path="updateform" element={<Updateform />} />
          <Route path="contact-queries" element={<ContactQueries />} />
          <Route path="bookings" element={<BookingList />} />
          <Route path="notifications" element={<NotificationList />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
