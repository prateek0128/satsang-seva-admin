import { Button } from "@mui/material";
import SearchEventCard from "./SearchEventCard";
import PropTypes from "prop-types";
import { useEffect, useState } from "react";
import Loader from "./Loader";
import { useNavigate } from "react-router-dom";
import NotFound from "@mui/icons-material/EventBusy";
import axios from "axios";

// Updated category options
const categoryOptions = [
  { value: "Satsang", label: "Satsang & Dharmic Pravachan" },
  { value: "Kirtan", label: "Bhajan & Kirtan" },
  { value: "Sabha", label: "Dhram Sabha" },
  { value: "Yoga", label: "Yoga & Dhyan" },
  { value: "Utsav", label: "Utsav & Celebrations" },
  { value: "Adhyatmik", label: "Adhyatmik Shivir (Spiritual Retreats)" },
  { value: "Puja", label: "Puja & Anushthan" },
  { value: "Seva & Charity", label: "Seva & Charity" },
  { value: "Sanskritik", label: "Sanskritik Karyakram (Cultural Programs)" },
  { value: "Vividh", label: "Vividh (Others)" },
];

const EventList = ({ className = "", data }) => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  // Store the events and pagination metadata from backend.
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(false);

  // Filter states – note that category is now a single string.
  const [lang, setLang] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  // When the parent sends new data (e.g. on initial load or new search),
  // update the events and pagination metadata.
  useEffect(() => {
    if (data) {
      setEvents(data.events);
      setPagination(data.pagination);
      setLang("");
      setCategory("");
      setType("");
    }
  }, [data]);

  // Load more events based on the current pagination state and filters.
  const loadMoreEvents = async () => {
    if (!pagination || !pagination.hasNextPage) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (!token) {
        alert("You have to login first");
        navigate("/sign-in/");
        return;
      }
      headers["Authorization"] = `Bearer ${token}`;

      // Build query parameters using the current filters and next page.
      const params = new URLSearchParams();
      if (lang) params.append("language", lang);
      if (category) params.append("category", category);
      const nextPage = pagination.page + 1;
      params.append("page", nextPage);
      params.append("limit", 7);

      const response = await axios.get(
        `${url}events/search?${params.toString()}`,
        { headers }
      );
      let newEvents = response.data.events;
      // Apply client‑side price filtering for "Free", "Below Rs500", or "Above Rs500"
      if (type) {
        switch (type) {
          case "Free":
            newEvents = newEvents.filter((event) => event.eventPrice === "0");
            break;
          case "Below Rs500":
            newEvents = newEvents.filter(
              (event) => parseInt(event.eventPrice, 10) < 500
            );
            break;
          case "Above Rs500":
            newEvents = newEvents.filter(
              (event) => parseInt(event.eventPrice, 10) >= 500
            );
            break;
          default:
            break;
        }
      }
      // Append the newly fetched events to the current list.
      setEvents((prevEvents) => [...prevEvents, ...newEvents]);
      // Update pagination metadata.
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error loading more events:", error);
      if (error.response && error.response.status === 401) {
        alert("You need to login first to load more events.");
        navigate("/sign-in/");
      } else {
        alert("Failed to load more events. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Apply filters (language, category, price type) – always re-fetch page 1.
  // Now accepts current filter values as arguments
  const applyFilters = async (
    currentLang = lang,
    currentCategory = category,
    currentType = type
  ) => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const headers = { "Content-Type": "application/json" };
      if (!token) {
        alert("You have to login first");
        navigate("/sign-in/");
        return;
      }
      headers["Authorization"] = `Bearer ${token}`;

      const params = new URLSearchParams();
      if (currentLang) params.append("language", currentLang);
      if (currentCategory) params.append("category", currentCategory);
      params.append("page", 1);
      params.append("limit", 7);

      const response = await axios.get(
        `${url}events/search?${params.toString()}`,
        { headers }
      );
      let filteredResults = response.data.events;
      // Apply price filtering on the client side.
      if (currentType) {
        switch (currentType) {
          case "Free":
            filteredResults = filteredResults.filter(
              (event) => event.eventPrice === "0"
            );
            break;
          case "Below Rs500":
            filteredResults = filteredResults.filter(
              (event) => parseInt(event.eventPrice, 10) < 500
            );
            break;
          case "Above Rs500":
            filteredResults = filteredResults.filter(
              (event) => parseInt(event.eventPrice, 10) >= 500
            );
            break;
          default:
            break;
        }
      }
      setEvents(filteredResults);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error applying filters:", error);
      if (error.response && error.response.status === 401) {
        alert("You need to login first to filter events.");
        navigate("/sign-in/");
      } else {
        alert("Failed to filter events. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // When any filter changes, re‑apply the filters with the current selection
  const handleTypeChange = (event) => {
    const selectedType = event.target.value;
    setType(selectedType);
    // Pass the newly selected type along with existing filters
    applyFilters(lang, category, selectedType);
  };

  const handleLangChange = (event) => {
    const selectedLang = event.target.value;
    setLang(selectedLang);
    // Pass the newly selected language along with existing filters
    applyFilters(selectedLang, category, type);
  };

  // For category we now use a simple select (only one choice).
  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
    // Pass the newly selected category along with existing filters
    applyFilters(lang, selectedCategory, type);
  };

  return (
    <section
      className={`self-stretch flex flex-col items-center justify-start py-0 pr-[21px] pl-5 box-border max-w-full text-center ${className}`}
    >
      {loading && <Loader />}
      <div className="w-[1275px] flex flex-col items-center justify-start max-w-full">
        <div className="w-full flex items-center justify-between pt-2 pb-10 box-border max-w-full mq750:flex-col">
          <h1 className="w-[500px] m-0 relative text-inherit leading-[48px] font-bold mq450:leading-[29px] mq1050:text-13xl mq1050:leading-[38px]">
            <span className="text-tomato">Events </span>
            <span>For You</span>
          </h1>
          <div className="w-full flex flex-col items-start justify-start pt-0.5 pb-0 text-sm text-darkorange-200 font-dm-sans">
            <div className="w-full flex flex-row items-center gap-[20px] md:flex-wrap">
              <div className="w-full h-[46px] min-w-[160px] relative">
                <select
                  onChange={handleTypeChange}
                  value={type}
                  className="w-full h-[46px] bg-[#ffe6c5] rounded-full text-[#ff5f17] font-normal text-base flex items-center justify-center cursor-pointer appearance-none pr-8"
                  style={{ padding: "0 1rem", lineHeight: "1.5rem" }}
                >
                  <option value="">Event Type</option>
                  <option value="Free">Free</option>
                  <option value="Below Rs500">Below &#8377;500</option>
                  <option value="Above Rs500">Above &#8377;500</option>
                </select>
              </div>
              <div className="w-full h-[46px] min-w-[160px] relative">
                <select
                  onChange={handleLangChange}
                  value={lang}
                  className="w-full h-[46px] bg-[#ffe6c5] rounded-full text-[#ff5f17] font-normal text-base flex items-center justify-center cursor-pointer appearance-none pr-8"
                  style={{ padding: "0 1rem", lineHeight: "1.5rem" }}
                >
                  <option value="">Event Language</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  <option value="Hindi & English">Hindi & English</option>
                </select>
              </div>
              <div className="w-full h-[46px] min-w-[200px] relative">
                <select
                  onChange={handleCategoryChange}
                  value={category}
                  className="w-full h-[46px] bg-[#ffe6c5] rounded-full text-[#ff5f17] font-normal text-base flex items-center justify-center cursor-pointer appearance-none pr-8"
                  style={{ padding: "0 1rem", lineHeight: "1.5rem" }}
                >
                  <option value="">Any Category</option>
                  {categoryOptions.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        {/* Display events */}
        <div className="flex flex-col gap-[26px] self-stretch text-left text-lg text-black">
          {events &&
            events.map((item) => (
              <SearchEventCard key={item._id} item={item} />
            ))}
        </div>
        {/* Show More button only if there is a next page */}
        {pagination && pagination.hasNextPage && (
          <div className="flex flex-row items-center justify-center pt-0 pr-[22px] pl-5 self-stretch">
            <Button
              className="h-[33px] w-[149px] m-8 z-[1]"
              disabled={loading}
              disableElevation
              variant="outlined"
              sx={{
                textTransform: "none",
                color: "#ff5f17",
                fontSize: "14",
                borderColor: "#ff5f17",
                borderRadius: "50px",
                "&:hover": { borderColor: "#ff5f17" },
                width: 149,
                height: 33,
              }}
              onClick={loadMoreEvents}
            >
              {loading ? "Loading..." : "Show More"}
            </Button>
          </div>
        )}
        {events && events.length === 0 && (
          <>
            <NotFound fontSize="large" sx={{ color: "#D26600" }} />
            <h2 className="text-center text-danger pb-5">No Events Found!</h2>
          </>
        )}
      </div>
    </section>
  );
};

EventList.propTypes = {
  className: PropTypes.string,
  // Now expecting an object with keys: events and pagination
  data: PropTypes.object,
};

export default EventList;
