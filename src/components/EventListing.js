import { useEffect, useState } from "react";
import { Button } from "@mui/material";
import NotFound from "@mui/icons-material/EventBusy";
import axios from "axios";
import EventCard from "./EventCard";
import PropTypes from "prop-types";
import Loader from "./Loader";
import "../Csss/EventListing.css";

const categories = [
  {
    value: "Satsang",
    label: "Satsang & Dharmic Pravachan",
  },
  { value: "Kirtan", label: "Bhajan & Kirtan" },
  { value: "Sabha", label: "Dhram Sabha" },
  { value: "Yoga", label: "Yoga & Dhyan" },
  { value: "Utsav", label: "Utsav & Celebrations" },
  {
    value: "Adhyatmik",
    label: "Adhyatmik Shivir (Spiritual Retreats)",
  },
  { value: "Puja", label: "Puja & Anushthan" },
  { value: "Seva & Charity", label: "Seva & Charity" },
  {
    value: "Sanskritik",
    label: "Sanskritik Karyakram (Cultural Programs)",
  },
  { value: "Vividh", label: "Vividh (Others)" },
];

const EventListing = ({ className = "" }) => {
  const url = process.env.REACT_APP_BACKEND;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState("");
  const [lang, setLang] = useState("");
  const [type, setType] = useState("");

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(9); // Show 9 events per page in UI
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [position, setPosition] = useState({
    latitude: null,
    longitude: null,
  });

  // New state to track whether to use geolocation or not
  const [useNearbySearch, setUseNearbySearch] = useState(true);

  useEffect(() => {
    const apiKey = process.env.REACT_APP_GMAP_KEY;
    const url = `https://www.googleapis.com/geolocation/v1/geolocate?key=${apiKey}`;

    const getPosition = async () => {
      if (navigator.geolocation) {
        try {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          });

          return {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
        } catch (error) {
          console.error(error);
        }
      }

      // If browser geolocation API doesn't work or is not supported, fall back to Google Geolocation API
      const response = await axios.post(url, {
        considerIp: true, // Use IP address to estimate location
      });

      return {
        lat: response.data.location.lat,
        lng: response.data.location.lng,
      };
    };

    getPosition()
      .then((position) => {
        localStorage.setItem("loc", [position.lat, position.lng]);
        setPosition({
          latitude: position.lat,
          longitude: position.lng,
        });
      })
      .catch((error) => {
        console.error(error);
      });
  }, []);

  // Effect for initial load and when position changes
  useEffect(() => {
    if (position.latitude && position.longitude && useNearbySearch) {
      setLoading(true);
      setEvents([]);
      setPage(1);
      setHasMore(true);
      setTimeout(() => {
        fetchNearBy(1);
        // fetchEvents(1);
      }, 1000);
    }
  }, [position, useNearbySearch]);

  // Separate effect for when filters change
  useEffect(() => {
    // When any filter is applied, switch to filtered search
    if (category || lang || type) {
      setUseNearbySearch(false);
      setLoading(true);
      setEvents([]);
      setPage(1);
      setHasMore(true);
      fetchEvents(1);
    }
  }, [category, lang, type]);

  const fetchNearBy = async (pageNumber = page) => {
    const isLoadingMore = pageNumber > 1;
    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Build query parameters with pagination
      let queryParams = `events/search?long=${position.longitude}&lat=${position.latitude}&page=${pageNumber}&limit=${limit}`;

      // Add filters if they exist
      if (category) queryParams += `&category=${category}`;
      if (lang) queryParams += `&language=${encodeURIComponent(lang)}`;
      if (type) {
        // Convert the type filter to appropriate price filter
        switch (type) {
          case "Free":
            queryParams += `&price=0`;
            break;
          case "Below Rs500":
            queryParams += `&priceLt=500`;
            break;
          case "Above Rs500":
            queryParams += `&priceGte=500`;
            break;
          default:
            break;
        }
      }

      // Make the API request
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const resp = await axios.get(url + queryParams, {
        headers,
      });


      // Get today's date
      const today = new Date();

      // Check if events data exists in the response
      if (!resp?.data?.events) {
        console.error("Error: 'events' data is missing in the API response.");
        alert("No events data found in the response.");
        setEvents([]);
        return;
      }

      // Filter events where endDate is greater than or equal to today and approved is true
      const validEvents = resp.data.events.filter((event) => {
        const eventEndDate = new Date(event.endDate);
        return eventEndDate >= today && event.approved === true;
      });

      if (validEvents.length > 0) {
        if (isLoadingMore) {
          // Prevent duplicates when appending
          setEvents((prevEvents) => {
            // Create a set of existing IDs for O(1) lookup
            const existingIds = new Set(prevEvents.map((event) => event._id));

            // Filter out any events that already exist in our list
            const newEvents = validEvents.filter(
              (event) => !existingIds.has(event._id)
            );

            // Only append new, non-duplicate events
            return [...prevEvents, ...newEvents];
          });
        } else {
          // Replace all events for the first page
          setEvents(validEvents);
        }

        // Determine if there are more events to load
        setHasMore(validEvents.length === limit);

        // Update current page
        setPage(pageNumber);
      } else {
        if (!isLoadingMore) {
          alert("No Upcoming Approved Events Found");
          setEvents([]);
        }

        // No more events to load
        setHasMore(false);
      }
    } catch (e) {
      // Check for server error (500) specifically
      if (e.response?.status === 500) {
        console.error("Server error (500):", e);
        if (!isLoadingMore) {
          alert(
            "There was a server error retrieving events. Please try again later."
          );
        }
      } else {
        console.error("Error fetching nearby events:", e);
        if (!isLoadingMore) {
          alert("An error occurred while fetching events.");
        }
      }

      if (!isLoadingMore) {
        setEvents([]);
      }
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const fetchEvents = async (pageNumber = page) => {
    const isLoadingMore = pageNumber > 1;

    if (isLoadingMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }

    try {
      // Build query parameters for filtering
      let queryParams = `?page=${pageNumber}&limit=${limit}`;

      // Add filters if they exist
      if (category) queryParams += `&category=${encodeURIComponent(category)}`;
      if (lang) queryParams += `&language=${encodeURIComponent(lang)}`;
      if (type) {
        // Convert the type filter to appropriate price filter
        switch (type) {
          case "Free":
            queryParams += `&price=0`;
            break;
          case "Below Rs500":
            queryParams += `&priceLt=500`;
            break;
          case "Above Rs500":
            queryParams += `&priceGte=500`;
            break;
          default:
            break;
        }
      }

      // Make the API request with
      // pagination and filters
      const token = localStorage.getItem("token");
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const response = await axios.get(`${url}events/search${queryParams}`, {
        headers,
      });

      const fetchedEvents = response.data.events || [];

      if (isLoadingMore) {
        // Check for duplicates before appending
        setEvents((prevEvents) => {
          // Create a set of existing IDs for O(1) lookup
          const existingIds = new Set(prevEvents.map((event) => event._id));

          // Filter out any events that already exist in our list
          const newEvents = fetchedEvents.filter(
            (event) => !existingIds.has(event._id)
          );

          // Only append new, non-duplicate events
          return [...prevEvents, ...newEvents];
        });
      } else {
        // Replace all events if it's the first page
        setEvents(fetchedEvents);
      }

      // Determine if there are more events to load
      // If the backend doesn't return fewer events than requested, assume there might be more
      setHasMore(fetchedEvents.length === limit);

      // Update current page
      setPage(pageNumber);
    } catch (error) {
      console.error("Error fetching events:", error);
      if (!isLoadingMore) {
        // Only show alert for initial load, not for "load more"
        alert("An error occurred while fetching events.");
      }
    } finally {
      if (isLoadingMore) {
        setLoadingMore(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleTypeChange = (event) => {
    const selectedfee = event.target.value;
    setType(selectedfee);
  };

  const handleLangChange = (event) => {
    const selectedLang = event.target.value;
    setLang(selectedLang);
  };

  const handleCategoryChange = (event) => {
    const selectedCategory = event.target.value;
    setCategory(selectedCategory);
  };

  const handleLoadMore = () => {
    // Load the next page
    const nextPage = page + 1;
    if (useNearbySearch && position.latitude && position.longitude) {
      fetchEvents(nextPage);
      // fetchNearBy(nextPage);
    } else {
      fetchEvents(nextPage);
    }
  };


  return (
    <section
      id="upcomingEvents"
      className={`w-full flex flex-col items-center py-0 px-5 box-border max-w-full shrink-0 text-left text-21xl text-goldenrod font-montserrat ${className}`}
    >
      {loading && <Loader />}
      <div
        className="w-full max-w-[1086px] flex flex-col items-center justify-between mq750:!pt-5"
        data-scroll-to="upcomingEventsContainer"
        style={{ minHeight: "25rem", paddingTop: "4.5rem" }}
      >
        <div className="w-full pb-5 flex flex-row items-center justify-between max-w-full gap-[10px] mq1050:flex-wrap">
          <h1 className="m-0 relative text-inherit font-bold font-inherit inline-block text-center max-w-full mq1050:text-13xl mq450:text-5xl">
            Upcoming Events
          </h1>

          {/* select start  */}
          <div className="w-[544px] flex flex-col items-start justify-start pt-0.5 px-0 pb-0 box-border max-w-full text-sm text-darkorange-200 font-dm-sans">
            <div className="self-stretch flex flex-row items-start justify-start gap-[20px] mq750:flex-wrap">
              <div className="h-[46px] flex-1 min-w-[109px] relative">
                <select
                  aria-controls="menu-undefined"
                  aria-haspopup="true"
                  onChange={handleTypeChange}
                  value={type}
                  className="w-full h-[46px] bg-[#ffe6c5] rounded-full text-[#ff5f17] font-normal text-base flex items-center justify-center cursor-pointer appearance-none pr-8 mega"
                  style={{ padding: "0 1rem", lineHeight: "1.5rem" }}
                >
                  <option value="">Event Type</option>
                  <option value="Free">Free</option>
                  <option value="Below Rs500">Below &#8377;500</option>
                  <option value="Above Rs500">Above &#8377;500</option>
                </select>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-[#ff5f17]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              <div className="h-[46px] flex-1 min-w-[109px] relative">
                <select
                  aria-controls="menu-undefined"
                  aria-haspopup="true"
                  onChange={handleLangChange}
                  value={lang}
                  className="w-full h-[46px] bg-[#ffe6c5] rounded-full text-[#ff5f17] font-normal text-base flex items-center justify-center cursor-pointer appearance-none pr-8 mega"
                  style={{ padding: "0 1rem", lineHeight: "1.5rem" }}
                >
                  <option value="">Any Language</option>
                  <option value="Hindi">Hindi</option>
                  <option value="English">English</option>
                  {/* <option value="Hindi & English">Hindi & English</option> */}
                </select>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-[#ff5f17]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>

              <div className="h-[46px] flex-1 min-w-[109px] relative">
                <select
                  aria-controls="menu-undefined"
                  aria-haspopup="true"
                  onChange={handleCategoryChange}
                  value={category}
                  className="w-full h-[46px] bg-[#ffe6c5] rounded-full text-[#ff5f17] font-normal text-base flex items-center justify-center cursor-pointer appearance-none pr-8 mega"
                  style={{ padding: "0 1rem", lineHeight: "1.5rem" }}
                >
                  <option value="">Any Category</option>
                  {categories.map((category) => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <span className="absolute right-2 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg
                    className="w-4 h-4 text-[#ff5f17]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </span>
              </div>
            </div>
          </div>

          {/* select end  */}
        </div>
        {events && events.length > 0 ? (
          <>
            <div className="w-full flex flex-wrap justify-center gap-[62.5px] max-w-full text-center text-xs-4 text-orangered font-dm-sans lg:gap-[31px] mq750:gap-[16px]">
              <div className="flex pb-5 flex-wrap w-full gap-[28.5px] justify-center">
                {events.map((e) => (
                  <EventCard
                    key={e._id}
                    map={true}
                    eventCardImage={
                      e.eventPosters
                        ? `${e.eventPosters[0]}`
                        : "/rectangle-12-1@2x.png"
                    }
                    event={e}
                    title={e.eventName}
                    distance={e.distanceInKm}
                    date={e.startDate}
                    endDate={e.endDate}
                    address={e.eventAddress}
                    className="rounded-[20px] shadow-lg hover:scale-110 transition-transform"
                  />
                ))}
              </div>
            </div>
          </>
        ) : null}
        <div className="w-full flex flex-col items-center justify-center gap-[62.5px] max-w-full text-center text-xs-4 text-orangered font-dm-sans lg:gap-[31px] mq750:gap-[16px]">
          {hasMore && events.length > 0 && (
            <div className="w-[1038px] h-[60px] flex flex-row items-start justify-center py-0 px-5 box-border max-w-full">
              <Button
                className="self-stretch w-[182px] border-[#ff5f17] text-[#ff5f17] rounded-full text-lg transition-all duration-200 ease-in-out hover:border-[#ff5f17] hover:shadow-md active:shadow-sm active:scale-95"
                variant="outlined"
                onClick={handleLoadMore}
                disabled={loadingMore}
              >
                {loadingMore ? "Loading..." : "Load More"}
              </Button>
            </div>
          )}
        </div>
        {events.length === 0 && !loading && (
          <>
            <NotFound fontSize="large" sx={{ color: "#D26600" }} />
            <h2 className="text-center text-danger pb-5">No Events Found!</h2>
          </>
        )}
      </div>
    </section>
  );
};

EventListing.propTypes = {
  className: PropTypes.string,
};

export default EventListing;
