import React, { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import LandingDesign from "./pages/LandingDesign";
import Event from "./pages/Event";
import CategoriesPage from "./pages/CategoriesPage";
import SignUp from "./pages/SignUp";
import CreateEventComponent from "./pages/CreateEventComponent";
import ProfilePage from "./pages/ProfilePage";
import SearchBar from "./pages/SearchBar";
import LogIn from "./pages/LogIn";
import BookingComponent from "./components/BookingComponent";
import NavComponent from "./components/NavComponent";
import PublicProfile from "./pages/PublicProfile";
import About from "./pages/About";
import ContactUs from "./pages/ContactUs";
import AddBlog from "./pages/AddBlog";
import Blogs from "./pages/Blogs";
import AdminPage from "./admin/AdminPage";
import AllProducts from "./admin/AllProducts";
import UserList from "./admin/UserList";
import Events from "./admin/Events";
import UserEvents from "./admin/UserEvents";
import Updateform from "./admin/Updateform";
import Approve from "./admin/Approve";
import Blog from "./admin/Blog";
import AdminLayout from "./admin/AdminLayout";
import AdminLogin from "./admin/AdminLogin";
import AdminSignup from "./admin/AdminSignup";
import GoogleTranslate from "./components/GoogleTranslate";
import Terms from "./components/Terms";
import Home from "./pages/Home";
import LiveEvent from "./components/LiveEvent";
import Userlayout from "./components/UserLayout";
import ViewProfile from "./pages/ViewProfile";
import UpdateUser from "./admin/UpdateUser";
import UpdateEvent from "./admin/UpdateEvent";

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;
  const [admin, setAdmin] = useState(() => {
    try { return JSON.parse(localStorage.getItem("admin")); } catch { return null; }
  });

  const handleAdmin = (adminData) => {
    setAdmin(adminData);
  };

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "";
        metaDescription = "";
        break;
      case "/live-event":
        title = "";
        metaDescription = "";
        break;
      case "/perticular-event-b":
        title = "";
        metaDescription = "";
        break;
      case "/landing-design-a-2":
        title = "";
        metaDescription = "";
        break;
      case "/perticular-event-a":
        title = "";
        metaDescription = "";
        break;
      case "/categories-page":
        title = "";
        metaDescription = "";
        break;
      case "/sign-in":
        title = "";
        metaDescription = "";
        break;
      case "/event-listing":
        title = "";
        metaDescription = "";
        break;
      case "/profile-page":
        title = "";
        metaDescription = "";
        break;
      case "/search-bar":
        title = "";
        metaDescription = "";
        break;
      case "/login":
        title = "";
        metaDescription = "";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag = document.querySelector(
        'head > meta[name="description"]'
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <>
      <GoogleTranslate />
      {/* <NavComponent /> */}
      <Routes>
        <Route element={<Userlayout />}>
          {/* Signin page */}
          <Route path="/sign-in" element={<SignUp />} />
          {/* Login */}
          <Route path="/login" element={<LogIn />} />
          {/* All other routes */}
          <Route path="*" element={<LogIn />} />
          {/* Home */}
          <Route path="/" element={<Home />} />
          <Route path="/live-event" element={<LiveEvent />} />
          <Route path="/landing-design-a-2" element={<LandingDesign />} />
          {/* Event category page */}
          <Route path="/categories-page" element={<CategoriesPage />} />
          {/* Profile page */}
          <Route exact path="/profile-page" element={<ProfilePage />} />
          {/* create event  */}
          <Route path="/event-listing" element={<CreateEventComponent />} />
          {/* Public profile */}
          {/* Search bar */}
          <Route path="/search-bar" element={<SearchBar />} />
          {/* Booking component */}
          <Route path="/booking" element={<BookingComponent />} />
          {/* About us */}
          <Route path="/aboutus" element={<About />} />
          {/* Contact us */}
          <Route path="/contactus" element={<ContactUs />} />
          {/* Particuler blog */}
          <Route path="/blog" element={<Blogs />} />
          {/* Tearms and condition */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/addblog" element={<AddBlog />} />
        </Route>

        {/* Event detail — no navbar, opens cleanly from admin */}
        <Route path="/event/:id" element={<Event />} />
        {/* Public profile — no navbar, opens cleanly from admin */}
        <Route path="/public-profile" element={<PublicProfile />} />


        <Route path="/admin">
          <Route index element={<AdminLogin setAdmin={handleAdmin} />} />
          <Route path="signup" element={<AdminSignup />} />
          <Route path="*" element={<AdminLogin setAdmin={handleAdmin} />} />
          <Route element={<AdminLayout setAdmin={handleAdmin} />}>
            <Route path="dashboard" element={<AdminPage />} />
            <Route path="allusers" element={<UserList />} />
            <Route path="events" element={<Events />} />
            <Route path="approve" element={<Approve />} />
            <Route path="blog" element={<Blog />} />
            <Route path="createblog" element={<AddBlog />} />
            <Route path="updateuser/:id" element={<UpdateUser />} />
            <Route path="updateevent/:id" element={<UpdateEvent />} />
            {/* <Route path="coupon" element={<Coupon />} /> */}
            {/* <Route path="categorie" element={<Categories />} /> */}
            {/* <Route path="brands" element={<Brands />} /> */}
            {/* <Route path="orderdetails" element={<OrderDetails />} /> */}
            <Route path="allproduct/:id/:name" element={<AllProducts />} />
            <Route path="userevents/:userId" element={<UserEvents />} />
            <Route path="updateform" element={<Updateform />} />
          </Route>
        </Route >
      </Routes>
    </>
  );
}
export default App;
