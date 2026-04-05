import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import { Country, State, City } from "country-state-city";
import Edit from "@mui/icons-material/Edit";
import Verify from "@mui/icons-material/Verified";
import { HashLink } from "react-router-hash-link";
import Button from "@mui/material/Button";
import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import FirstFold1 from "../components/FirstFold1";
import { MdDelete } from 'react-icons/md';
import Loader from "../components/Loader"
import { Link } from "react-router-dom";

// Options for the new dropdowns (adjust values as per your user schema)
const userTypeOptions = [
  { value: "Host&Participant", label: "Host&Participant" },
  { value: "Participant", label: "Participant" },
];
const profileTypeOptions = [
  { value: "", label: "Select profile" },
  { value: "Artist", label: "Artist" },
  { value: "Orator", label: "Orator" },
  { value: "Organizer", label: "Organizer" },
];

const ProfilePage = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");

  // Main states for user details and form data
  const [userData, setUserData] = useState(null);
  const [userEvents, setUserEvents] = useState(null);
  const [userBookings, setUserBookings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [maxLength] = useState(5000);

  // Remove OTP states since mobile & email are not updated
  // For country, state, city selection
  const [selectedCountry, setSelectedCountry] = useState(Country.getCountryByCode("IN"));
  const [selectedState, setSelectedState] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);

  // New dropdown states for userType and profileType
  const [userType, setUserType] = useState(null);
  const [profileType, setProfileType] = useState(null);

  const [draftEvents, setDraftEvents] = useState([]);


  // Form data holds both basic & additional info.
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    description: "",
    address: "",
    country: "India",
    state: "",
    city: "",
    postalCode: "",
    facebook: "",
    instagram: "",
    twitter: "",
    web: "",
    youtube: "",
    profileImage: null,
    doc: null,
  });

  useEffect(() => {
    // Load draft events from local storage
    const loadDrafts = () => {
      const eventDrafts = JSON.parse(localStorage.getItem("eventDrafts")) || [];
      // Sort by last updated (newest first)
      eventDrafts.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      setDraftEvents(eventDrafts);
      setLoading(false);
    };

    loadDrafts();
  }, []);

  const deleteDraft = (id, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (window.confirm("Are you sure you want to delete this draft?")) {
      const updatedDrafts = draftEvents.filter(draft => draft.id !== id);
      localStorage.setItem("eventDrafts", JSON.stringify(updatedDrafts));
      setDraftEvents(updatedDrafts);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserInfo(userId);
    } else {
      navigate("/login");
    }
  }, [userId]);

  useEffect(() => {
    // Smooth scroll on location change.
    setTimeout(() => {
      const windowHeight = window.innerHeight;
      const scrollPosition = windowHeight * 0.55;
      window.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }, 100);
  }, [location]);

  useEffect(() => {
    // Populate formData from fetched userData
    if (userData) {
      setFormData((prevData) => ({
        ...prevData,
        name: userData.name,
        email: userData.email,
        mobile: userData.phoneNumber,
        password: "",
        description: userData.desc || "",
        address: userData?.location?.address || "",
        postalCode: userData?.location?.postalCode || "",
        city: userData?.location?.city || "",
        state: userData?.location?.state || "",
        country: userData?.location?.country || "India",
        facebook: userData.social && userData.social['facebook'] ? userData.social['facebook'] : "",
        instagram: userData.social && userData.social['instagram'] ? userData.social['instagram'] : "",
        web: userData.social && userData.social['web'] ? userData.social['web'] : "",
        youtube: userData.social && userData.social['youtube'] ? userData.social['youtube'] : "",

      }));
      setUserType(userData.userType ? { value: userData.userType, label: userData.userType } : null);
      setProfileType(userData.profileType ? { value: userData.profileType, label: userData.profileType } : null);
    }
  }, [userData]);

  const fetchUserInfo = async (id) => {
    try {
      const bookingsResp = await axios.get(url + "user/bookings/" + id);
      setUserBookings(bookingsResp.data.bookings);
    } catch (e) {
      alert("Error: " + e);
    }
    try {

      const userResp = await axios.get(url + "user/" + id);

      setUserData(userResp.data.user);
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          email: userResp.data.user.email,
          name: userResp.data.user.name,
          contact: userResp.data.user.phoneNumber,
        })
      );
    } catch (e) {
      alert("Error: " + e);
    }
    try {
      const eventsResp = await axios.get(url + "user/events/" + id);
      setUserEvents(eventsResp.data.events);
    } catch (e) {
      alert("Error: " + e);
    }
  };

  const handleLogOut = () => {
    if (window.confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("userId");
      localStorage.removeItem("token");
      // Call any logout function if needed
      window.location.reload();
    }
  };

  const handleCopyUrl = () => {
    const publicURL = window.location.origin + "/public-profile?q=" + userId;
    navigator.clipboard.writeText(publicURL);
    alert("Public Profile URL Copied to Clipboard!");
  };

  // Basic update: update name and password only (email and mobile are read-only)
  const handleBasicUpdate = async () => {
    if (formData.name.length < 3) {
      return alert("Enter a valid name.");
    }
    let basicPayload = { name: formData.name };
    if (formData.password && formData.password.trim() !== "") {
      basicPayload.password = formData.password.trim();
    }
    try {
      setLoading(true);
      const headers = { "Content-Type": "application/json" };
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.put(url + "user/basic-update", basicPayload, { headers });
      alert(response.data.message);
    } catch (error) {
      alert(
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Error updating basic info."
      );
    } finally {
      setLoading(false);
    }
  };

  const isValidSocialLink = (link, platform) => {
    try {
      const urlObj = new URL(link);
      return urlObj.protocol === "https:";
    } catch (err) {
      return false;
    }
  };

  const validateSocialLinks = async () => {
    const socialLinks = {
      facebook: formData.facebook,
      instagram: formData.instagram,
      twitter: formData.twitter,
      web: formData.web,
      youtube: formData.youtube,
    };
    const errors = [];
    Object.keys(socialLinks).forEach((platform) => {
      const link = socialLinks[platform];
      if (link && !isValidSocialLink(link, platform)) {
        errors.push(`Invalid ${platform} link: ${link}`);
      }
    });
    return errors;
  };

  // Additional update: update description, location, social, profile image, userType, and profileType.
  const handleAdditionalUpdate = async () => {
    const socialLinkErrors = await validateSocialLinks();
    if (socialLinkErrors.length > 0) {
      return alert(socialLinkErrors.join("\n"));
    }
    try {
      setLoading(true);
      const additionalData = {
        desc: formData.description,
        location: {
          address: formData.address,
          postalCode: formData.postalCode,
          city: formData.city,
          state: formData.state,
          country: formData.country,
        },
        social: {
          facebook: formData.facebook,
          instagram: formData.instagram,
          twitter: formData.twitter,
          web: formData.web,
          youtube: formData.youtube,
        },
        userType: userType ? userType.value : undefined,
        profileType: profileType ? profileType.value : undefined,
      };
      const additionalForm = new FormData();
      additionalForm.append("updateUser", JSON.stringify(additionalData));
      if (formData.profileImage) {
        additionalForm.append("images", formData.profileImage);
      }
      const response = await axios.put(url + "user/update/" + userId, additionalForm, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(response.data.message);
      // window.location.reload();
    } catch (error) {
      alert(
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        "Error updating additional info."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (ip) => {
    $("#" + ip).fadeIn();
  };

  const handleCloseForm = (ip) => {
    $("#" + ip).fadeOut();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const fileSizeLimit = 1024 * 1024 * 2; // 2MB limit
    if (file.size > fileSizeLimit) {
      return alert(`File size exceeds the limit of ${fileSizeLimit / 1024 / 1024} MB`);
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [e.target.name]: file,
      }));
    }
  };

  const memberSince = (x) => {
    const date = new Date(x);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return ` ${month}, ${year}`;
  };

  return (
    <div style={{ marginTop: "-5rem" }} className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start gap-[50px] leading-[normal] tracking-[normal] mq750:gap-[41px] mq450:gap-[20px]">
      <FirstFold1 />
      <main style={{ width: "100vw" }} className="flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
        {loading && <Loader />}
        <section className="w-[1256px] flex flex-col items-start justify-start max-w-full text-left text-21xl text-black font-poppins mq750:gap-[18px]">
          <div className="mq450:w-full w-[1229px] flex mq450:flex-col mq450:items-center flex-row items-start justify-start py-0 px-3.5 box-border max-w-full text-xs">
            <div className="flex-1 flex flex-row mq450:justify-center items-start justify-between max-w-full gap-[20px] mq1050:flex-wrap">
              <div className="w-[750px] flex flex-col items-start justify-start pt-px px-0 pb-0 box-border max-w-full">
                <div className="self-stretch flex flex-row items-center justify-between max-w-full gap-[20px] mq750:flex-wrap">
                  {userData && userData.profile ? (
                    <img className="profile-icon" src={userData?.profile} alt="Profile Image" />
                  ) : (
                    <div className="profile-icon">{userData ? userData.name.charAt(0).toUpperCase() : "..."}</div>
                  )}
                  <div className="w-[650px] flex flex-col gap-2 items-start justify-center min-w-[403px] max-w-full mq750:flex-1 mq750:min-w-full">
                    <div className="flex flex-col items-start justify-start text-lg">
                      <b style={{ fontSize: "2rem" }} className="relative">
                        {userData && userData.name ? userData.name : "Loading..."}
                      </b>
                      <div style={{ fontSize: "1rem", fontWeight: "450" }} className="relative text-sm z-[1]">
                        Member Since: {userData && userData.createdAt ? memberSince(userData.createdAt) : "Loading..."}
                      </div>
                      <div style={{ fontSize: "1rem" }} className="relative text-sm z-[1]">
                        {userData &&
                          userData.location &&
                          (() => {
                            const { address, addres2, city, state, country, postalCode } = userData.location;
                            const addressParts = [];
                            if (address) addressParts.push(address);
                            if (addres2) addressParts.push(addres2);
                            if (city) addressParts.push(city);
                            if (state) addressParts.push(state);
                            if (country) addressParts.push(country);
                            if (postalCode) addressParts.push(postalCode);
                            return addressParts.join(", ");
                          })()}
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <Edit
                        onClick={() => {
                          handleEditClick("editForm");
                          handleCloseForm("registerForm");
                        }}
                        className="cursor-pointer mb-3"
                        titleAccess="Update Profile"
                        sx={{ color: "#D26600" }}
                      />
                      {/* <Verify
                        onClick={() => {
                          handleEditClick("registerForm");
                          handleCloseForm("editForm");
                        }}
                        className="cursor-pointer mb-3"
                        titleAccess="Register Here"
                        sx={{ color: "#D26600", fontSize: "27px" }}
                      /> */}
                    </div>
                  </div>
                  <div id="editForm" className="edit-form" style={{ display: "none" }}>
                    <h2 className="text-center">Edit Your Profile</h2>
                    {/* Basic Information Section */}
                    <div>
                      <h3>Basic Information</h3>
                      <label htmlFor="name">Your Name:</label>
                      <input
                        className="form-control"
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Enter Name"
                      />
                      <label htmlFor="email">Your Email:</label>
                      <input className="form-control" type="email" id="email" name="email" value={formData.email} disabled />
                      <label htmlFor="mobile">Your Mobile:</label>
                      <input className="form-control" type="text" id="mobile" name="mobile" value={formData.mobile} disabled />
                      <label htmlFor="password">New Password (leave blank to keep current):</label>
                      <input
                        className="form-control"
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        placeholder="Enter New Password"
                      />
                      <div className="flex pt-3">
                        <button type="button" onClick={handleBasicUpdate}>
                          Update Basic Info
                        </button>
                      </div>
                    </div>
                    {/* Additional Information Section */}
                    <div>
                      <h3>Additional Information</h3>
                      <label htmlFor="description">Edit Description:</label>
                      <textarea
                        className="form-control"
                        id="description"
                        name="description"
                        value={formData.description}
                        maxLength={maxLength}
                        onChange={handleInputChange}
                        placeholder="Enter Your Bio here... (Max: 5000 Chars)"
                        style={{ height: "150px" }}
                      />
                      <p>{maxLength - formData.description.length} characters remaining</p>
                      <label>Edit Country:</label>
                      <Select
                        id="country"
                        className="w-full"
                        placeholder={formData.country || "Select Your Country"}
                        options={Country?.getAllCountries()}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.name}
                        value={selectedCountry}
                        onChange={(item) => {
                          setSelectedCountry(item);
                          setFormData({ ...formData, country: item.name, state: "", city: "" });
                          setSelectedState(null);
                          setSelectedCity(null);
                        }}
                      />
                      <label>Edit State:</label>
                      <Select
                        id="state"
                        className="w-full"
                        placeholder={formData.state || "Select Your State"}
                        options={State?.getStatesOfCountry(selectedCountry?.isoCode)}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.name}
                        value={selectedState}
                        onChange={(item) => {
                          setSelectedState(item);
                          setFormData({ ...formData, state: item.name, city: "" });
                        }}
                      />
                      <label>Edit City:</label>
                      <Select
                        id="city"
                        className="w-full"
                        placeholder={formData.city || "Select Your City"}
                        options={City.getCitiesOfState(selectedState?.countryCode, selectedState?.isoCode)}
                        getOptionLabel={(option) => option.name}
                        getOptionValue={(option) => option.name}
                        value={selectedCity}
                        onChange={(item) => {
                          setSelectedCity(item);
                          setFormData({ ...formData, city: item.name });
                        }}
                      />
                      <label>Edit Address:</label>
                      <input
                        id="address"
                        name="address"
                        className="form-control"
                        type="text"
                        placeholder={formData.address || "Enter address"}
                        value={formData.address}
                        onChange={handleInputChange}
                      />
                      <label>Edit Postal Code:</label>
                      <input
                        id="postalCode"
                        name="postalCode"
                        className="form-control text-sm"
                        type="number"
                        placeholder={formData.postalCode || "Enter postalCode"}
                        value={formData.postalCode}
                        onChange={handleInputChange}
                      />
                      <label>Edit Facebook Link:</label>
                      <input
                        className="form-control"
                        type="text"
                        id="facebook"
                        name="facebook"
                        value={formData.facebook}
                        onChange={handleInputChange}
                        placeholder="Facebook Link"
                      />
                      <label>Edit Instagram Link:</label>
                      <input
                        className="form-control"
                        type="text"
                        id="instagram"
                        name="instagram"
                        value={formData.instagram}
                        onChange={handleInputChange}
                        placeholder="Instagram Link"
                      />
                      <label>Edit Twitter Link:</label>
                      <input
                        className="form-control"
                        type="text"
                        id="twitter"
                        name="twitter"
                        value={formData.twitter}
                        onChange={handleInputChange}
                        placeholder="Twitter (X) Link"
                      />
                      <label>Edit website Link:</label>
                      <input
                        className="form-control"
                        type="text"
                        id="web"
                        name="web"
                        value={formData.web}
                        onChange={handleInputChange}
                        placeholder="Website Link"
                      />
                      <label>Edit youtube Link:</label>
                      <input
                        className="form-control"
                        type="text"
                        id="youtube"
                        name="youtube"
                        value={formData.youtube}
                        onChange={handleInputChange}
                        placeholder="youtube Link"
                      />
                      <label>Edit Profile Image:</label>
                      <input
                        className="form-control"
                        type="file"
                        id="profileImage"
                        name="profileImage"
                        accept=".jpg, .jpeg, .png"
                        onChange={handleFileChange}
                      />
                      <label>User Type:</label>
                      <Select
                        id="userType"
                        className="w-full"
                        placeholder="Select User Type"
                        options={userTypeOptions}
                        value={userType}
                        onChange={(selected) => setUserType(selected)}
                      />
                      <label>Profile Type:</label>
                      <Select
                        id="profileType"
                        className="w-full"
                        placeholder="Select Profile Type"
                        options={profileTypeOptions}
                        value={profileType}
                        onChange={(selected) => setProfileType(selected)}
                      />
                      <div className="flex pt-3">
                        <button type="button" onClick={handleAdditionalUpdate}>
                          Update Additional Info
                        </button>
                      </div>
                    </div>
                    <div className="flex pt-3">
                      <button type="button" onClick={() => handleCloseForm("editForm")}>
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
                <div className="self-stretch flex mq450:flex-col items-end justify-center max-w-full">
                  <div style={{ marginLeft: "7rem" }} className="w-[414px] flex flex-row flex-wrap mq450:items-center mq450:justify-center justify-start gap-[14px] max-w-full">
                    <div className="w-[123px] flex flex-col items-start justify-start py-0 pr-[7px] pl-0 box-border">
                      <Button
                        className="h-fit min-w-[7rem] w-fit px-2"
                        disableElevation
                        variant="outlined"
                        sx={{
                          textTransform: "none",
                          color: "#d26600",
                          fontSize: "14",
                          borderColor: "#d26600",
                          borderRadius: "50px",
                          "&:hover": { borderColor: "#d26600" },
                          height: 33,
                        }}
                        onClick={handleLogOut}
                      >
                        Log Out
                      </Button>
                    </div>
                    <Button
                      className="h-fit min-w-[7rem] w-fit px-2"
                      disableElevation
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        color: "#fff",
                        fontSize: "14",
                        background: "#d26600",
                        border: "#f5f5f5 solid 1px",
                        borderRadius: "50px",
                        "&:hover": { background: "#d26600" },
                        height: 33,
                      }}
                    >
                      <a href="#bookings" className="w-full" style={{ color: "white", textDecoration: "none" }}>
                        Bookings
                      </a>
                    </Button>
                    <Button
                      className="h-fit min-w-[7rem] w-fit px-2"
                      disableElevation
                      variant="contained"
                      sx={{
                        textTransform: "none",
                        color: "#fff",
                        fontSize: "14",
                        background: "#d26600",
                        border: "#f5f5f5 solid 1px",
                        borderRadius: "50px",
                        "&:hover": { background: "#d26600" },
                        width: 118,
                        height: 33,
                      }}
                    >
                      <a className="w-full" href="#events" style={{ color: "white", textDecoration: "none" }}>
                        Events
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
              <div className="w-28 flex flex-col items-center justify-center gap-[45.6px]">
                <div className="flex gap-5">
                  <div
                    onClick={handleCopyUrl}
                    className="w-[26px] h-[26px] cursor-pointer rounded-8xs box-border flex flex-col items-start justify-start py-[3px] px-1 border-[1px] border-solid border-chocolate"
                  >
                    <img className="w-4 h-[14.4px] relative" alt="" src="/vector-6.svg" />
                  </div>
                </div>
                <div className="flex flex-col justify-center gap-4">
                  <div className="">
                    <div className="flex justify-center">Contact On</div>
                  </div>
                  <div className="flex flex-row items-end justify-start gap-[14px]">
                    <div className="flex flex-col items-start justify-start gap-[12px]">
                      <div className="flex flex-row items-start justify-start py-0 px-0.5">
                        <a href={userData ? "tel:+91" + userData.phoneNumber : "#"}>
                          <img className="h-6 w-6 relative overflow-hidden shrink-0" loading="lazy" alt="" src="/phone.svg" />
                        </a>
                      </div>
                      <a href={userData && userData.social && userData.social['facebook'] ? userData.social['facebook'] : null} target="_blank" rel="noopener noreferrer">
                        <img className="w-7 h-7 relative overflow-hidden shrink-0" loading="lazy" alt="" src="/facebook1.svg" />
                      </a>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[12px]">
                      <a href={userData ? "mailto:" + userData.email : "#"}>
                        <img className="w-7 h-7 relative" loading="lazy" alt="" src="/mail.svg" />
                      </a>
                      <a href={userData && userData.social && userData.social['twitter'] ? userData.social['twitter'] : null} target="_blank" rel="noopener noreferrer">
                        <img className="w-7 h-7 relative overflow-hidden shrink-0" loading="lazy" alt="" src="/twitterx.svg" />
                      </a>
                    </div>
                    <div className="flex flex-col items-start justify-start gap-[12px]">
                      <img className="w-[25px] h-7 relative overflow-hidden shrink-0" loading="lazy" alt="" src="/iconsmappin-1.svg" />
                      <a href={userData && userData.social && userData.social['instagram'] ? userData.social['instagram'] : null} target="_blank" rel="noopener noreferrer">
                        <img className="w-7 h-7 relative overflow-hidden shrink-0" loading="lazy" alt="" src="/instagram.svg" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full text-sm mt-10">
            <div className="self-stretch relative text-justify" style={{ whiteSpace: "pre-wrap" }}>
              {userData && userData.desc ? userData.desc : ""}
            </div>
          </div>
          <div style={{ width: "100vw" }} className="flex flex-col items-end justify-center pt-0 px-0 box-border gap-[81.5px] max-w-full lg:gap-[41px] lg:pb-[67px] lg:box-border mq750:gap-[20px] mq750:pb-11 mq750:box-border">
            <div className="self-stretch flex flex-row items-start justify-center max-w-full text-center">
              <div className="w-full flex flex-col items-end justify-start gap-[24px] max-w-full">
                <div className="self-stretch flex flex-row items-start justify-center max-w-full">
                  <div className="w-full flex flex-col items-center justify-start gap-[15px] max-w-full">
                    <h1 id="#bookings" className="pt-5 m-0 relative text-inherit leading-[48px] font-bold font-inherit mq1050:text-13xl mq1050:leading-[38px] mq450:text-5xl mq450:leading-[29px]">
                      <span>Your </span> <span className="text-tomato">Bookings</span>
                    </h1>
                    <p style={{ fontSize: "1rem" }}>Attend your favourite religious event</p>
                    {userBookings && (
                      <>
                        <div className="w-full flex flex-wrap justify-center gap-[62.5px] max-w-full text-center text-xs-4 text-orangered font-dm-sans lg:gap-[31px] mq750:gap-[16px]">
                          <div className="flex flex-wrap w-full gap-[28.5px] justify-center">
                            {userBookings.map((item, index) => (
                              <EventCard
                                key={item.event._id + index}
                                eventCardImage={item.event.eventPosters ? `${item.event.eventPosters[0]}` : "/rectangle-12-1@2x.png"}
                                event={item.event}
                                title={item.event.eventName}
                                date={item.event.startDate}
                                endDate={item.event.endDate}
                                address={item.event.eventAddress}
                                className="rounded-[20px] shadow-lg hover:scale-95 transition-transform"
                              />
                            ))}
                            <div
                              onClick={() => {
                                navigate("/search-bar");
                              }}
                              style={{ cursor: "pointer" }}
                              className="w-[343px] shadow-[0px_19px_47.38px_rgba(119,_115,_170,_0.1)] rounded-t-[18.95px] rounded-b-[18.95px] flex bg-gainsboro-200 flex-col items-center justify-center pt-[87px] px-[104px] pb-[118.5px] box-border relative gap-[14px] max-w-full text-base text-black mq450:pl-5 mq450:pr-5 mq450:box-border"
                            >
                              <div className="flex flex-row items-start justify-start py-0 px-3">
                                <img className="h-24 w-24 relative overflow-hidden shrink-0 z-[1]" loading="lazy" alt="" src="/add-circle.svg" />
                              </div>
                              <b className="relative leading-[19px] inline-block min-w-[120px] z-[1]">Book Event Now!</b>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                    <h1 id="events" className="pt-5 m-0 relative text-inherit leading-[48px] font-bold font-inherit mq1050:text-13xl mq1050:leading-[38px] mq450:text-5xl mq450:leading-[29px]">
                      <span>Your </span> <span className="text-tomato">Events</span>
                    </h1>
                    <p style={{ fontSize: "1rem" }}>Host your religious event and reach a wider audience</p>
                  </div>
                </div>
              </div>
            </div>
            {userEvents && (
              <>
                <div className="w-full flex flex-wrap justify-center gap-[62.5px] max-w-full text-center text-xs-4 text-orangered font-dm-sans lg:gap-[31px] mq750:gap-[16px]">
                  <div className="flex flex-wrap w-full gap-[28.5px] justify-center">
                    {userEvents.map((e, index) => (
                      <EventCard
                        key={e._id + index}
                        eventCardImage={e.eventPosters ? `${e.eventPosters[0]}` : "/rectangle-12-1@2x.png"}
                        event={e}
                        title={e.eventName}
                        date={e.startDate}
                        endDate={e.endDate}
                        address={e.eventAddress}
                        className="rounded-[20px] shadow-lg hover:scale-95 transition-transform"
                      />
                    ))}
                    <HashLink
                      to="/event-listing#form"
                      style={{ cursor: "pointer" }}
                      className="w-[343px] no-underline shadow-[0px_19px_47.38px_rgba(119,_115,_170,_0.1)] rounded-t-[18.95px] rounded-b-[18.95px] flex bg-gainsboro-200 flex-col items-center justify-center pt-[87px] px-[104px] pb-[118.5px] box-border relative gap-[14px] max-w-full text-base text-black mq450:pl-5 mq450:pr-5 mq450:box-border"
                    >
                      <div className="flex flex-row items-start justify-start py-0 px-3">
                        <img className="h-24 w-24 relative overflow-hidden shrink-0 z-[1]" loading="lazy" alt="" src="/add-circle.svg" />
                      </div>
                      <b className="relative leading-[19px] inline-block min-w-[120px] z-[1]">Add Your Event!</b>
                    </HashLink>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* <div className="w-full flex flex-col items-center justify-start gap-[15px] max-w-full">
            <h1 id="#bookings" className="pt-5 m-0 relative text-inherit leading-[48px] font-bold font-inherit mq1050:text-13xl mq1050:leading-[38px] mq450:text-5xl mq450:leading-[29px]">
              <span>Your </span> <span className="text-tomato">Draft</span>
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {draftEvents.length > 0 ?
                draftEvents.map(draft => (
                  <Link
                    to={`/event-listing?draftId=${draft.id}`}
                    key={draft.id}
                    className="block border rounded-lg p-4 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-lg mb-2">
                        {draft.eventData.eventName || "Unnamed Event"}
                      </h3>
                      <button
                        onClick={(e) => deleteDraft(draft.id, e)}
                        className="text-red-500 hover:text-red-700"
                      >
                        Delete
                      </button>
                    </div>

                    <div className="text-sm text-gray-500 mb-3">
                      Last edited: {new Date(draft.lastUpdated).toLocaleString()}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {draft.eventData.eventCategory && draft.eventData.eventCategory.map((cat, i) => (
                        <span key={i} className="bg-gray-100 text-xs px-2 py-1 rounded">
                          {cat}
                        </span>
                      ))}
                    </div>

                    {draft.eventData.startDate && (
                      <div className="text-sm">
                        <span className="font-medium">Date: </span>
                        {new Date(draft.eventData.startDate).toLocaleDateString()}
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between">
                      <span className={`text-sm ${draft.eventData.eventType === 'free' ? 'text-green-600' : 'text-blue-600'}`}>
                        {draft.eventData.eventType === 'free' ? 'Free' : 'Paid'}
                      </span>

                      <span className="text-sm">
                        {draft.hasImages ? '📷 Has images' : 'No images'}
                      </span>
                    </div>
                  </Link>
                ))
                :
                <HashLink
                  to="/event-listing#form"
                  style={{ cursor: "pointer" }}
                  className="w-[343px] no-underline shadow-[0px_19px_47.38px_rgba(119,_115,_170,_0.1)] rounded-t-[18.95px] rounded-b-[18.95px] flex bg-gainsboro-200 flex-col items-center justify-center pt-[87px] px-[104px] pb-[118.5px] box-border relative gap-[14px] max-w-full text-base text-black mq450:pl-5 mq450:pr-5 mq450:box-border"
                >
                  <div className="flex flex-row items-start justify-start py-0 px-3">
                    <img className="h-24 w-24 relative overflow-hidden shrink-0 z-[1]" loading="lazy" alt="" src="/add-circle.svg" />
                  </div>
                  <b className="relative leading-[19px] inline-block min-w-[120px] z-[1]">Add Your Event!</b>
                </HashLink>
              }
            </div>
            
            
            
            
            
            
          </div> */}
          <div className="w-full flex flex-col items-center justify-start gap-[15px] max-w-full">
            <h1 id="drafts" className="pt-5 m-0 relative text-inherit leading-[48px] font-bold font-inherit mq1050:text-13xl mq1050:leading-[38px] mq450:text-5xl mq450:leading-[29px]">
              <span>Your </span> <span className="text-tomato">Drafts</span>
            </h1>
            <p style={{ fontSize: "1rem" }}>Continue working on your saved event drafts</p>

            <div className="w-full flex flex-wrap justify-center gap-[28.5px] max-w-full text-center text-xs-4 text-orangered font-dm-sans">
              {draftEvents.length > 0 ? (
                draftEvents.map((draft) => (
                  <div key={draft.id} className="relative">
                    <EventCard
                      eventCardImage={draft.hasImages ? "/event-draft-image.png" : "/placeholder-event.png"} // Use a placeholder image
                      event={{
                        _id: draft.id,
                        startDate: draft.eventData.startDate || new Date().toISOString(),
                        endDate: draft.eventData.endDate || new Date().toISOString(),
                        dist: draft.eventData.eventType === 'free' ? 'Free' : 'Paid'
                      }}
                      title={draft.eventData.eventName || "Unnamed Event"}
                      date={draft.eventData.startDate || new Date().toISOString()}
                      address={draft.eventData.eventAddress || "Location not specified"}
                      className="rounded-[20px] shadow-lg hover:scale-95 transition-transform cursor-pointer"
                      lastedited={draft?.lastUpdated}
                      onClick={() => navigate(`/event-listing?draftId=${draft.id}`)}
                    />

                    {/* Delete button overlay */}
                    <div
                      className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md cursor-pointer hover:bg-red-50 z-2"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDraft(draft.id, e);
                      }}
                      title="Delete draft"
                    >
                      <MdDelete size={20} color="#D26600" />
                    </div>

                    {/* Categories */}
                    <div className="absolute bottom-24 left-2 right-2 flex flex-wrap gap-1 z-10">
                      {draft.eventData.eventCategory && draft.eventData.eventCategory.slice(0, 2).map((cat, i) => (
                        <span key={i} className="bg-white bg-opacity-80 text-xs px-2 py-1 rounded text-black">
                          {cat}
                        </span>
                      ))}
                      {draft.eventData.eventCategory && draft.eventData.eventCategory.length > 2 && (
                        <span className="bg-white bg-opacity-80 text-xs px-2 py-1 rounded text-black">
                          +{draft.eventData.eventCategory.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <HashLink
                  to="/event-listing#form"
                  style={{ cursor: "pointer" }}
                  className="w-[343px] no-underline shadow-[0px_19px_47.38px_rgba(119,_115,_170,_0.1)] rounded-t-[18.95px] rounded-b-[18.95px] flex bg-gainsboro-200 flex-col items-center justify-center pt-[87px] px-[104px] pb-[118.5px] box-border relative gap-[14px] max-w-full text-base text-black mq450:pl-5 mq450:pr-5 mq450:box-border"
                >
                  <div className="flex flex-row items-start justify-start py-0 px-3">
                    <img className="h-24 w-24 relative overflow-hidden shrink-0 z-[1]" loading="lazy" alt="" src="/add-circle.svg" />
                  </div>
                  <b className="relative leading-[19px] inline-block min-w-[120px] z-[1]">Create Your First Draft!</b>
                </HashLink>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer
        group="/group1.svg"
        facebook="/facebook.svg"
        twitter="/twitter.svg"
        linkedin="/linkedin.svg"
        group1="/group1.svg"
        footerAlignSelf="stretch"
        footerWidth="unset"
      />
    </div>
  );
};

export default ProfilePage;
