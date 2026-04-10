import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { HashLink as Link } from "react-router-hash-link";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import "../Csss/NavComponent.css";
import GoogleTranslate from "./GoogleTranslate";

const NavComponent = ({ solid = false }) => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [name, setName] = useState("");
  const [profile, setProfile] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const adminData = localStorage.getItem("admin");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp < Math.floor(Date.now() / 1000);
        if (isExpired) {
          localStorage.removeItem("token");
          localStorage.removeItem("userId");
          localStorage.removeItem("userInfo");
          localStorage.removeItem("admin");
          navigate("/login");
          return;
        }
        const id = decoded.id || localStorage.getItem("userId");
        if (id) {
          setUserId(id);
          if (adminData) {
            const admin = JSON.parse(adminData);
            setName(trimFirstName(admin.name || "Admin"));
            setIsAdmin(true);
          } else {
            verifyUser(id, token);
          }
        }
      } catch (e) {
        localStorage.removeItem("token");
        setUserId(null);
      }
    }
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const verifyUser = async (userId, token) => {
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const resp = await axios.get(`${url}users/${userId}`, { headers });
      const user = resp.data.data || resp.data.user;
      if (user?.name) setName(trimFirstName(user.name));
      if (user?.profilePicture) setProfile(user.profilePicture);
    } catch (e) {
      console.log(e);
    }
  };

  const handleScroll = () => {
    setScrolled(window.scrollY > 50);
  };

  function trimFirstName(fullName) {
    let names = fullName.split(" ");
    let firstName = names[0];
    return firstName.length > 7 ? firstName.substring(0, 7) + "..." : firstName;
  }

  const toggleMenu = () => {
    setMenuOpen(!isMenuOpen);
  };

  const goToTop = () => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className={`nav-main ${scrolled || solid ? "scrolled" : ""}`}>
      <Link className="left-nav no-underline" to="/#home" onClick={goToTop}>
        <img src="/group1.svg" alt="SatsangSeva" />
        <h1 className="font-semibold font-sacramento">Satsang Seva</h1>
      </Link>
      <div className="hamburger-menu pt-2" onClick={toggleMenu}>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className={`right-nav ${isMenuOpen ? "active" : ""} pt-2`}>
        <ul>
          <li
            className="io"
            onClick={() => {
              toggleMenu();
              goToTop();
            }}
          >
            <Link to="/#home">Home</Link>
          </li>
          <li className="io" onClick={toggleMenu}>
            <Link to="/#upcomingEvents">Upcoming Events</Link>
          </li>
          <li className="io" onClick={toggleMenu}>
            <Link to="/#listEvent">List Your Events</Link>
          </li>
          <li className="io" onClick={toggleMenu}>
            <Link to="/categories-page#main">Categories</Link>
          </li>
          <li className="io">
            <GoogleTranslate />
          </li>
          {!userId ? (
            <li className="" onClick={toggleMenu}>
              <Link to="/login" className="log py-1 px-4 text-xl">
                Login
              </Link>
            </li>
          ) : (
            <li className="log py-1" onClick={toggleMenu}>
              <Link to={isAdmin ? "/admin/dashboard" : "/profile-page"}>
                <div className="info flex items-center justify-center">
                  <span className="user-name pr-2">{name}</span>
                  {profile ? (
                    <img
                      className="border rounded-full h-10 w-10"
                      src={profile}
                      alt="Profile"
                    />
                  ) : (
                    <span className="border rounded-full h-10 w-10">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </Link>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default NavComponent;
