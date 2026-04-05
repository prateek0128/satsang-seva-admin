import { Button } from "@mui/material";
import SearchIcon from "@mui/icons-material/SearchTwoTone";
import axios from "axios";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import "../Csss/Search.css";
import EventList from "./EventList";

const SearchAndFilters = ({ className = "" }) => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    eventName: "",
    address: "",
    startTime: "",
    host: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSearch = async () => {
    if (
      formData.address ||
      formData.eventName ||
      formData.startTime ||
      formData.host
    ) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { "Content-Type": "application/json" };
        if (!token) {
          alert("You have to login first");
        }
        headers["Authorization"] = `Bearer ${token}`;
        // Include page=1 and limit=7 for search results
        const response = await axios.get(
          `${url}events/search?name=${encodeURIComponent(
            formData.eventName
          )}&add=${encodeURIComponent(
            formData.address
          )}&date=${encodeURIComponent(
            formData.startTime
          )}&host=${formData.host}&page=1&limit=7`,
          { headers }
        );
        // Pass both events and pagination metadata to parent
        handleSearchDataChange({
          events: response.data.events,
          pagination: response.data.pagination,
        });
        // Scroll down to results
        const windowHeight = window.innerHeight;
        const scrollAmount = windowHeight * 0.35;
        const currentScrollPosition = window.scrollY;
        window.scrollTo({
          top: currentScrollPosition + scrollAmount,
          behavior: "smooth",
        });
      } catch (error) {
        console.error("Search Error:", error);
        if (error.response) {
          if (error.response.status === 401) {
            alert("You need to login first to search events.");
            navigate("/sign-in/");
          } else {
            alert(
              error.response.data.message ||
                "Error searching events. Please try again."
            );
          }
        } else {
          alert(
            "No events found for your search! Try searching with other keywords."
          );
        }
      } finally {
        setLoading(false);
      }
    } else {
      alert("Please enter at least one search field.");
    }
  };

  const handleSearchDataChange = (newData) => {
    setData(newData);
  };

  useEffect(() => {
    fetchEvents();
    setTimeout(() => {
      const windowHeight = window.innerHeight;
      const scrollPosition = windowHeight * 0.55;
      window.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }, 100);
  }, [location]);

  const fetchEvents = async () => {
    const token = localStorage.getItem("token");
    const headers = { "Content-Type": "application/json" };
    if (!token) {
      alert("You have to login first");
    }
    headers["Authorization"] = `Bearer ${token}`;
    try {
      // Include page=1 and limit=7 for the initial fetch.
      const resp = await axios.get(url + "events?page=1&limit=7", { headers });
      // Expecting backend response: { events, pagination }
      setData({ events: resp.data.events, pagination: resp.data.pagination });
    } catch (e) {
      console.log("Error in fetching Events: " + e);
    }
  };
  return (
    <>
      <section
        style={{ width: "100vw" }}
        className={`flex flex-row items-start justify-center pt-3 px-5 pb-2.5 box-border max-w-full ${className}`}
      >
        {loading && <Loader />}
        <form className="m-0 w-[1275px] flex flex-col items-start justify-start gap-[37px] max-w-full mq750:gap-[18px]">
          <div className="w-full flex flex-row items-start justify-start py-0 px-0 box-border max-w-full lg:pl-7 lg:pr-7">
            <div className="flex-1 align-items-center shadow-[0px_10px_50px_rgba(61,_55,_241,_0.25)] rounded-xl bg-darkorange-200 flex flex-row flex-wrap items-start justify-start py-[30px] px-12 gap-[60px] min-h-[140px] max-w-full lg:gap-[30px] lg:pl-6 lg:pr-6 mq750:gap-[15px]">
              <div className="flex-1 flex flex-col items-start justify-start gap-[11px] min-w-[217px]">
                <div className="relative text-base font-dm-sans text-white text-left inline-block min-w-[97px]">
                  Search Event
                </div>
                <div className="self-stretch flex flex-col items-start justify-start gap-[4px]">
                  <input
                    id="eventName"
                    className="w-full placeholder-white border-none outline-none font-dm-sans text-3xl bg-transparent h-[29px] font-bold text-white"
                    placeholder="Event Name"
                    type="text"
                    onChange={handleChange}
                    value={formData.eventName}
                    autoComplete="off"
                  />
                  <div className="self-stretch h-px border-t border-solid border-sandybrown" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-start justify-start gap-[11px] min-w-[217px]">
                <div className="relative text-base font-dm-sans text-white text-left inline-block min-w-[97px]">
                  Search Host
                </div>
                <div className="self-stretch flex flex-col items-start justify-start gap-[4px]">
                  <input
                    id="host"
                    className="w-full placeholder-white border-none outline-none font-dm-sans text-3xl bg-transparent h-[29px] font-bold text-white"
                    placeholder="Host Name"
                    type="text"
                    onChange={handleChange}
                    value={formData.host}
                    autoComplete="off"
                  />
                  <div className="self-stretch h-px border-t border-solid border-sandybrown" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-start justify-start gap-[11px] min-w-[217px]">
                <div className="relative text-base font-dm-sans text-white text-left inline-block min-w-[97px]">
                  Place
                </div>
                <div className="self-stretch flex flex-col items-start justify-start gap-[4px]">
                  <input
                    id="address"
                    className="w-full placeholder-white border-none outline-none font-dm-sans text-3xl bg-transparent h-[29px] font-bold text-white"
                    placeholder="Event Address"
                    type="text"
                    onChange={handleChange}
                    value={formData.address}
                    autoComplete="off"
                  />
                  <div className="self-stretch h-px border-t border-solid border-sandybrown" />
                </div>
              </div>
              <div className="flex-1 flex flex-col items-start justify-start gap-[11px] min-w-[217px]">
                <div className="relative text-base font-dm-sans text-white text-left inline-block min-w-[97px]">
                  Date
                </div>
                <div className="self-stretch flex flex-col items-start justify-start gap-[4px]">
                  <input
                    id="startTime"
                    className="w-full border-none outline-none font-dm-sans text-2xl bg-transparent h-[29px] font-bold text-white"
                    placeholder="Event Time"
                    type="date"
                    onChange={handleChange}
                    value={formData.startTime}
                    min={new Date().toISOString().slice(0, 10)}
                  />
                  <div className="self-stretch h-px border-t border-solid border-sandybrown" />
                </div>
              </div>
              <Button
                title="Search"
                className="h-[44px] flex-1"
                disableElevation
                variant="outlined"
                sx={{
                  backgroundColor: "white",
                  textTransform: "none",
                  color: "#d26600",
                  fontSize: "1rem",
                  borderColor: "#d26600",
                  borderRadius: "50px",
                  "&:hover": {
                    borderColor: "#d26600",
                    backgroundColor: "whitesmoke",
                  },
                  height: 33,
                }}
                onClick={handleSearch}
              >
                <SearchIcon fontSize="large" />
              </Button>
            </div>
          </div>
        </form>
      </section>
      <EventList data={data} />
    </>
  );
};

SearchAndFilters.propTypes = {
  className: PropTypes.string,
};

export default SearchAndFilters;
