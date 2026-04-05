import React, { useState, useEffect } from "react";
import "../Csss/EventData.css";
import { Link } from "react-router-dom";
import Like from "@mui/icons-material/ThumbUpTwoTone";
import Pin from "@mui/icons-material/LocationOnTwoTone";
import WhatsApp from "@mui/icons-material/WhatsApp";
import Start from "@mui/icons-material/AlarmTwoTone";
import EventMap from "./EventMap";
import { IconButton } from "@mui/material";
import axios from "axios";

const EventData = ({ event: initialEvent = null }) => {
  const url = process.env.REACT_APP_BACKEND;
  // Create a local state copy of the event
  const [eventData, setEventData] = useState(initialEvent);

  // Optional: update local state when initialEvent prop changes
  useEffect(() => {
    setEventData(initialEvent);
  }, [initialEvent]);

  function formatDateTime(dateString) {
    const date = new Date(dateString);
    if (!(date instanceof Date) || isNaN(date.getTime())) {
      throw new Error("Invalid date object");
    }
    // Convert the date to UTC
    const utcDate = new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes()
    );
    const options = {
      weekday: "short",
      month: "short",
      day: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
      hour12: false, // 24-hour format
    };
    const formattedDate = new Intl.DateTimeFormat("en-IN", options).format(
      utcDate
    );
    const [weekday, day, month, year, hour] = formattedDate
      .split(/[\s,/]+/)
      .slice(0, 6);
    return `${weekday} • ${month} ${day}, ${year} • ${hour}`;
  }

  function formatNames(names) {
    if (names.split(",").length > 1) {
      const formattedNames = names
        .split(",")
        .map((name, index) => `${index + 1}) ${name}`)
        .join(" ");
      return formattedNames;
    } else {
      return names;
    }
  }

  function getTotalAttendees(bookings) {
    return bookings.reduce(
      (total, booking) => total + parseInt(booking.noOfAttendee, 10),
      0
    );
  }

  function extractCity(address) {
    const addressParts = address.split(",");
    return addressParts[addressParts.length - 4];
  }

  const handleCopy = () => {
    const publicURL = window.location.origin + "/event/" + eventData._id;
    navigator.clipboard.writeText(publicURL);
    alert("Event URL Copied to Clipboard!");
  };

  const getDuration = (startDate, endDate) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const duration = end - start;

    const days = Math.floor(duration / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    let durationString = "";
    if (days > 0) {
      durationString += `${days} Days`;
    }
    if (hours > 0) {
      if (durationString.length > 0) durationString += ", ";
      durationString += `${hours} Hrs`;
    }
    if (minutes > 0) {
      if (durationString.length > 0) durationString += ", ";
      durationString += `${minutes} Mins`;
    }
    return durationString;
  };

  const capitalizedStr = (str) => {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const handleToggleLike = async () => {
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      console.log(`token`, token);
      const response = await axios.post(
        `${url}event/like/${eventData._id}`,
        {},
        { headers }
      );

      if (response.data.success) {
        console.log(response.data.message, response.data.likeCount);
        // Update the eventData locally without refreshing the page
        setEventData((prev) => {
          const isAlreadyLiked = prev.isLiked;
          return {
            ...prev,
            isLiked: !isAlreadyLiked,
            likeCount: isAlreadyLiked
              ? prev.likeCount - 1
              : prev.likeCount + 1,
          };
        });
      } else {
        alert("Like operation failed: " + response.data.message);
        console.error("Like operation failed:", response.data.message);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      alert("Error toggling like: " + error);
    }
  };

  return (
    <div className="mx-10 flex flex-col gap-10">
      <div className="flex mq450:flex-col items-end">
        <div className="event-left py-2">
          <div className="event-details p-0 my-2 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h1 className="py-2">
                {eventData?.eventName ? eventData.eventName : "Loading..."}
              </h1>
              <img
                className="w-6 h-6 relative cursor-pointer"
                onClick={handleCopy}
                loading="lazy"
                title="Copy Event URL"
                src="/vector-6.svg"
              />
            </div>
            <p>
              <strong>Starts: </strong>
              {eventData && formatDateTime(eventData.startDate)}
            </p>
            <p>
              <strong>Ends: </strong>
              {eventData && formatDateTime(eventData.endDate)}
            </p>
            {eventData && eventData.eventCategory
              ? eventData.eventCategory.map((category, index) => (
                <p key={index}>
                  <strong>Category: </strong>
                  {capitalizedStr(category)}
                </p>
              ))
              : "Loading..."}
            <p>
              <strong>Host Name : </strong>
              {eventData ? eventData.hostName || "--" : "Loading..."}
            </p>
            <p>
              <strong>Performer Name : </strong>
              {eventData ? eventData.performerName || "--" : "Loading..."}
            </p>
            <p>
              <strong>
                Contact Details <WhatsApp sx={{ color: "#D26600" }} /> :
              </strong>
              {eventData ? `+91-${eventData.hostWhatsapp}` : "Loading..."}
            </p>
            <p>
              <strong>Language : </strong>
              {eventData
                ? capitalizedStr(eventData.eventLang)
                : "Loading..."}
            </p>
            <p>
              <Start sx={{ color: "#D26600" }} className="my-2" />
              <strong>
                {eventData && formatDateTime(eventData.startDate)}
                {eventData &&
                  ` • (${getDuration(
                    eventData.startDate,
                    eventData.endDate
                  )})`}
              </strong>
            </p>
          </div>
        </div>
        <div className="event-right pb-0 mq750:!p-0">
          <div className="event-meta flex flex-col items-end gap-[10px] mq750:items-center">
            <div className="interest">
              <IconButton onClick={handleToggleLike}>
                <Like
                  fontSize="large"
                  className={`like-icon ${eventData?.isLiked
                    ? "text-[#D26600]"
                    : "text-[#BDBDBD]"
                    }`}
                />
              </IconButton>
              <span>
                {eventData && eventData.likeCount && eventData.likeCount}
              </span>
            </div>
            <div className="attendees">
              Expected Attendees :
              <strong style={{ color: "#D26600" }}>
                {eventData
                  ? `(${eventData.currentNoOfAttendees}) `
                  : "200 "}+
              </strong>
            </div>
          </div>
          <div className="event-map text-start" style={{ color: "#D26600" }}>
            <h4 className="text-center mb-0">Location of the event</h4>
            <p>
              <Pin sx={{ color: "#D26600" }} />
              <strong>
                {eventData && [eventData.eventAddress, eventData.city, eventData.province, eventData.country, eventData.postalCode].filter(Boolean).join(", ")}
              </strong>
              <a
                className="pl-3"
                href={eventData?.eventLink || "#"}
                target="_blank"
                rel="noopener noreferrer"
              >
                [Get Direction]
              </a>
            </p>
            <div className="map-container" style={{ width: "100%", height: "300px", marginTop: "10px" }}>
              {eventData?.city && (
                <iframe
                  width="100%"
                  height="100%"
                  frameBorder="0"
                  style={{ border: 0 }}
                  src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyCL1tHqIArMfMJUICjD0feQQbl-yNLx3SY&q=${encodeURIComponent(
                    `${eventData.eventAddress || ""}, ${eventData.city || ""}, ${eventData.province || ""}`
                  )}`}
                  allowFullScreen
                  loading="lazy"
                  title="Event Location"
                ></iframe>
              )}
            </div>
          </div>
        </div>
      </div>
      <div>
        <p className="py-2 text-justify mt-6" style={{ whiteSpace: "pre-wrap" }}>
          {eventData?.eventDesc}
        </p>
      </div>
    </div>
  );
};

export default EventData;
