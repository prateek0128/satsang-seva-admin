import { useState, useEffect, useCallback } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import FirstFold1 from "../components/FirstFold1";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import axios from "axios";
import { Country, State, City } from "country-state-city";
import { useDropzone } from "react-dropzone";
import Loader from "../components/Loader";

// Define event categories – add any extra categories if needed.
const categories = [
  { value: "Satsang", label: "Satsang" },
  { value: "Yoga", label: "Yoga" },
  { value: "Meditation", label: "Meditation" },
  { value: "Kirtan", label: "Kirtan" },
  { value: "Utsavs", label: "Utsavs" },
  { value: "Dharma Sabha", label: "Dharma Sabha" },
  { value: "Adhyatmik Shivir", label: "Adhyatmik Shivir" },
  { value: "Seva & Charity", label: "Seva & Charity" },
  { value: "Sanskritik", label: "Sanskritik" },
  { value: "Puja", label: "Puja" },
  { value: "Vividh (Others)", label: "Vividh (Others)" },
  { value: "Spiritual", label: "Spiritual" },
];


const generateUniqueId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

/**
 * Returns the total days and daily duration (in hours and minutes) for an event.
 *
 * @param {string} startDate - Start date in "YYYY-MM-DD" format.
 * @param {string} endDate - End date in "YYYY-MM-DD" format.
 * @param {string} startTime - Start time in "HH:MM" format.
 * @param {string} endTime - End time in "HH:MM" format.
 * @returns {Object} - { totalDays, hours, minutes }
 */
const getEventSummary = (startDate, endDate, startTime, endTime) => {
  if (!startDate || !endDate || !startTime || !endTime) return null;

  const start = new Date(`${startDate}T${startTime}:00`);
  const end = new Date(`${endDate}T${endTime}:00`);
  const msPerDay = 1000 * 60 * 60 * 24;
  const totalDays = Math.ceil((end - start) / msPerDay) || 1;

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);
  let startTotalMins = startH * 60 + startM;
  let endTotalMins = endH * 60 + endM;
  // If the event crosses midnight, adjust end time
  if (endTotalMins < startTotalMins) {
    endTotalMins += 24 * 60;
  }
  const totalDurationMins = endTotalMins - startTotalMins;
  const hours = Math.floor(totalDurationMins / 60);
  const minutes = totalDurationMins % 60;

  return { totalDays, hours, minutes };
};
const CreateEventComponent = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  const [currentDraftId, setCurrentDraftId] = useState(null);
  const [isDraftLoaded, setIsDraftLoaded] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form state holds all the event details structured as per your sample data.
  const [formValues, setFormValues] = useState({
    eventName: "",
    eventCategory: [],
    eventDesc: "",
    eventPrice: "0", // default value for free events
    eventLang: "",
    noOfAttendees: "",
    maxAttendees: "",
    artistOrOratorName: "",
    organizerName: "",
    organizerWhatsapp: "",
    eventLink: "",
    locationLink: "",
    // bookingLink will be required only for paid events.
    bookingLink: "",
    // Address fields
    address: "",
    address2: "",
    landmark: "",
    country: "",
    state: "",
    city: "",
    postalCode: "",
    startDate: "",
    endDate: "",
    startTime: "",
    endTime: "",
    eventAgenda: [
      {
        subEvent: 1,
        title: "",
        description: "",
      },
    ],
    eventType: "free",
  });

  // For agenda items handling separately from formValues
  const [agendaItems, setAgendaItems] = useState([
    {
      subEvent: 1,
      title: "",
      description: "",
    },
  ]);

  // For country/state/city dropdowns using country-state-city
  const [selectedCountry, setSelectedCountry] = useState(null);
  const [statesOptions, setStatesOptions] = useState([]);
  const [selectedState, setSelectedState] = useState(null);
  const [citiesOptions, setCitiesOptions] = useState([]);

  // For images handling (minimum 1 and maximum 4)
  const [images, setImages] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);
  const [mainImage, setMainImage] = useState(null);
  const [image, setImage] = useState(null);

  const [validationError, setValidationError] = useState("");

  const getDraftIdFromParams = () => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('draftId');
  };


  const saveDraft = useCallback(() => {
    // Default values to compare against
    const defaultValues = {
      eventName: "",
      eventCategory: [],
      eventDesc: "",
      eventPrice: "0",
      eventLang: "",
      noOfAttendees: "",
      maxAttendees: "",
      artistOrOratorName: "",
      organizerName: "",
      organizerWhatsapp: "",
      eventLink: "",
      locationLink: "",
      bookingLink: "",
      address: "",
      address2: "",
      landmark: "",
      country: "",
      state: "",
      city: "",
      postalCode: "",
      startDate: "",
      endDate: "",
      startTime: "",
      endTime: "",
      eventType: "free", // Default is free
    };

    // Check if any field has non-default data
    const hasData = Object.entries(formValues).some(([key, value]) => {
      // Skip checking event type since it has a default value
      if (key === 'eventType') return false;

      // For arrays like eventCategory, check if they have items
      if (Array.isArray(value)) return value.length > 0;

      // For eventPrice, only consider it if not the default "0" for free events
      if (key === 'eventPrice') return value !== "0" && value !== "";

      // For other fields, check if they have non-empty values
      return value && String(value).trim() !== '' && value !== defaultValues[key];
    });

    // Check if agenda items have any content
    const hasAgendaData = agendaItems.some(item =>
      (item.title && item.title.trim() !== '') ||
      (item.description && item.description.trim() !== '')
    );

    // Only save draft if we have real data or images
    if (!hasData && !hasAgendaData && images.length === 0) {
      return;
    }

    const existingDrafts = JSON.parse(localStorage.getItem("eventDrafts")) || [];
    const now = new Date().toISOString();

    if (currentDraftId) {
      // Update existing draft
      const updatedDrafts = existingDrafts.map(draft =>
        draft.id === currentDraftId
          ? {
            id: currentDraftId,
            lastUpdated: now,
            eventData: {
              ...formValues,
              eventAgenda: agendaItems
            },
            hasImages: images.length > 0
          }
          : draft
      );
      localStorage.setItem("eventDrafts", JSON.stringify(updatedDrafts));
    } else {
      // Create new draft
      const newId = generateUniqueId();
      const newDraft = {
        id: newId,
        lastUpdated: now,
        eventData: {
          ...formValues,
          eventAgenda: agendaItems
        },
        hasImages: images.length > 0
      };
      existingDrafts.push(newDraft);
      localStorage.setItem("eventDrafts", JSON.stringify(existingDrafts));
      setCurrentDraftId(newId);
    }

    setLastSaved(now);
  }, [formValues, agendaItems, currentDraftId, images]);

  // Save draft when form values change (debounced)
  useEffect(() => {
    if (!isDraftLoaded) return; // Don't save until initial loading is done

    const timer = setTimeout(() => {
      saveDraft();
    }, 2000); // Save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [formValues, agendaItems, isDraftLoaded, saveDraft]);

  // Check login and prefill some fields from local storage
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("userId");
      alert("You have to login First!");
      navigate("/login");
      return;
    }

    // Check if we're editing a specific draft
    const draftId = getDraftIdFromParams();

    if (draftId) {
      // Get all drafts
      const eventDrafts = JSON.parse(localStorage.getItem("eventDrafts")) || [];
      // Find the specific draft
      const selectedDraft = eventDrafts.find(draft => draft.id === draftId);

      if (selectedDraft) {
        // Load the draft data
        const draftData = selectedDraft.eventData;
        setFormValues(draftData);

        if (draftData.eventAgenda && Array.isArray(draftData.eventAgenda)) {
          setAgendaItems(draftData.eventAgenda);
        }

        setCurrentDraftId(draftId);
      }
    }

    // Pre-fill organizer info regardless of draft
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (token && (!userInfo?.contact || userInfo?.contact.trim() === "")) {
      setTimeout(() => {
        alert("You have to update First!");
        navigate("/user-profile");
      }, 2000);
    }

    if (userInfo) {
      setFormValues(prev => ({
        ...prev,
        organizerName: userInfo.name || prev.organizerName,
        organizerWhatsapp: userInfo.contact || prev.organizerWhatsapp,
      }));
    }

    setIsDraftLoaded(true);
  }, [navigate]);

  // Update states when country changes
  useEffect(() => {
    if (selectedCountry) {
      const states = State.getStatesOfCountry(selectedCountry.isoCode);
      setStatesOptions(states);
    }
  }, [selectedCountry]);

  // Update cities when state changes
  useEffect(() => {
    if (selectedState) {
      const cities = City.getCitiesOfState(selectedCountry.isoCode, selectedState.isoCode);
      setCitiesOptions(cities);
    }
  }, [selectedState, selectedCountry]);

  // Handle text and select input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "organizerWhatsapp") {
      if (!/^\d{10}$/.test(value)) {
        setValidationError("Please enter a valid 10-digit contact number.");
      } else {
        setValidationError("");
      }
    }
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // Handle free/paid toggle change
  const handleEventTypeChange = (e) => {
    const type = e.target.value;
    // If free is selected, clear booking link and set eventPrice to "0"
    if (type === "free") {
      setFormValues((prev) => ({
        ...prev,
        eventType: type,
        bookingLink: "",
        eventPrice: "0",
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        eventType: type,
      }));
    }
  };

  // For event category, update the list based on checkbox changes
  const handleCategoryChange = (e) => {
    const { value, checked } = e.target;
    let newCategories = [...formValues.eventCategory];
    if (checked) {
      newCategories.push(value);
    } else {
      newCategories = newCategories.filter((cat) => cat !== value);
    }
    setFormValues((prev) => ({ ...prev, eventCategory: newCategories }));
  };

  // Agenda items handling
  const handleAgendaChange = (index, field, value) => {
    const updatedAgenda = [...agendaItems];
    updatedAgenda[index] = { ...updatedAgenda[index], [field]: field === "subEvent" ? parseInt(value, 10) : value };
    setAgendaItems(updatedAgenda);
    setFormValues((prev) => ({ ...prev, eventAgenda: updatedAgenda }));
  };

  const addAgendaItem = () => {
    const lastSubEvent = agendaItems.length > 0 ? agendaItems[agendaItems.length - 1].subEvent : 0;
    const newAgenda = [
      ...agendaItems,
      { subEvent: lastSubEvent + 1, title: "", description: "" },
    ];
    setAgendaItems(newAgenda);
    setFormValues((prev) => ({ ...prev, eventAgenda: newAgenda }));
  };

  const removeAgendaItem = (index) => {
    if (agendaItems.length > 1) {
      const newAgenda = agendaItems.filter((_, i) => i !== index);
      setAgendaItems(newAgenda);
      setFormValues((prev) => ({ ...prev, eventAgenda: newAgenda }));
    }
  };

  // Image dropzone handling
  const onDrop = (acceptedFiles) => {
    if (acceptedFiles.length > 0) {
      const newImages = [...images];
      const newPreviews = [...previewImages];
      acceptedFiles.forEach((file) => {
        if (newImages.length >= 4) {
          alert("Maximum 4 images allowed. Only the first 4 will be used.");
          return;
        }
        newImages.push(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          setPreviewImages([...newPreviews]);
        };
        reader.readAsDataURL(file);
      });
      setImages(newImages.slice(0, 4));
      if (!mainImage && newImages.length > 0) {
        setMainImage(newImages[0]);
        if (newPreviews.length > 0) {
          setImage(newPreviews[0]);
        }
      }
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: { "image/jpeg": [], "image/png": [], "image/jpg": [], "image/jfif": [] },
    onDrop,
    multiple: true,
  });

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    newImages.splice(index, 1);
    newPreviews.splice(index, 1);
    setImages(newImages);
    setPreviewImages(newPreviews);
    if (index === 0 && newImages.length > 0) {
      setMainImage(newImages[0]);
      setImage(newPreviews[0]);
    } else if (newImages.length === 0) {
      setMainImage(null);
      setImage(null);
    }
  };

  const setAsMainImage = (index) => {
    const newImages = [...images];
    const newPreviews = [...previewImages];
    const selectedImage = newImages.splice(index, 1)[0];
    const selectedPreview = newPreviews.splice(index, 1)[0];
    newImages.unshift(selectedImage);
    newPreviews.unshift(selectedPreview);
    setImages(newImages);
    setPreviewImages(newPreviews);
    setMainImage(newImages[0]);
    setImage(newPreviews[0]);
  };

  // Ensure time is in correct format HH:MM
  const timeFormat = (timeString) => {
    if (/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/.test(timeString)) {
      return timeString;
    }
    try {
      const [hours, minutes] = timeString.split(":");
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
    } catch (e) {
      return timeString;
    }
  };


  const removeDraft = (draftId) => {
    const existingDrafts = JSON.parse(localStorage.getItem("eventDrafts")) || [];
    const updatedDrafts = existingDrafts.filter(draft => draft.id !== draftId);
    localStorage.setItem("eventDrafts", JSON.stringify(updatedDrafts));
  };

  // Form submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const token = localStorage.getItem("token");
    if (!token) {
      localStorage.removeItem("userId");
      alert("You have to login First!");
      navigate("/login");
      setLoading(false);
      return;
    }

    // Validation checks (same as your existing code)
    if (!images || images.length === 0) {
      setLoading(false);
      return alert("Please select at least one event image.");
    }

    // Additional validation checks...

    // Prepare event data 
    let newData = {
      eventName: formValues.eventName,
      eventCategory: formValues.eventCategory,
      eventDesc: formValues.eventDesc,
      eventPrice: formValues.eventType === "free" ? "0" : formValues.eventPrice,
      eventLang: formValues.eventLang,
      noOfAttendees: Number(formValues.noOfAttendees),
      maxAttendees: Number(formValues.maxAttendees),
      artistOrOratorName: formValues.artistOrOratorName,
      organizerName: formValues.organizerName,
      organizerWhatsapp: formValues.organizerWhatsapp,
      eventLink: formValues.eventLink,
      locationLink: formValues.locationLink,
      bookingLink: formValues.eventType === "paid" ? formValues.bookingLink : "",
      address: {
        address: formValues.address,
        address2: formValues.address2,
        landmark: formValues.landmark,
        city: formValues.city,
        state: formValues.state,
        postalCode: formValues.postalCode,
        country: formValues.country,
      },
      startDate: `${formValues.startDate}T${formValues.startTime}:00+05:30`,
      endDate: `${formValues.endDate}T${formValues.endTime}:00+05:30`,
      startTime: timeFormat(formValues.startTime),
      endTime: timeFormat(formValues.endTime),
      eventAgenda: agendaItems,
      eventType: formValues.eventType,
    };

    // Prepare form data with images
    const formData = new FormData();
    formData.append("eventData", JSON.stringify(newData));

    images.forEach((img) => {
      formData.append("images", img);
    });

    const headers = {
      Authorization: `Bearer ${token}`,
      "Content-Type": "multipart/form-data",
    };

    try {
      const response = await axios.post(url + "events", formData, { headers });
      console.log("Event Created:", response.data);

      // Remove this specific draft from local storage on success
      if (currentDraftId) {
        removeDraft(currentDraftId);
      }

      alert("Event Successfully Created! It will be visible once approved by an Administrator.");
      navigate("/");
    } catch (error) {
      alert(`Error in Adding Event: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const eventSummary = getEventSummary(
    formValues.startDate,
    formValues.endDate,
    formValues.startTime,
    formValues.endTime
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div
        style={{ marginTop: "-5rem" }}
        className="w-full relative bg-white border border-red-900 flex flex-col items-center justify-center leading-normal tracking-normal">
        <FirstFold1 />
        {loading && <Loader />}
        <section id="form" className="py-5 px-5 max-w-full text-center text-base text-black font-poppins">
          <h1 className="font-bold mb-4 mx-auto">
            <span>List Your </span>
            <span className="text-tomato">Event</span>
          </h1>
          <p className="mb-4 mx-auto">Host your religious event and reach a wider audience</p>
          <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
            {/* Event Images */}
            <div className="mb-6">
              <div className="font-medium pb-2">
                <span>Event Poster (1-4 images)</span>
                <span className="text-red-500">*</span>
              </div>
              <div
                {...getRootProps()}
                className="w-full h-72 flex flex-col items-center justify-center border-2 border-dashed border-[#F58021] rounded-xl bg-[#F58021] cursor-pointer relative overflow-hidden"
              >
                <input {...getInputProps()} className="absolute inset-0 opacity-0" />
                {image ? (
                  <img className="w-full h-full object-contain" src={image} alt="Main Preview" />
                ) : (
                  <>
                    <p className="text-center text-white">Event Poster</p>
                    <img className="w-36 h-36 object-contain" src="/add-image@2x.png" alt="Add image" loading="lazy" />
                    <p className="text-center mt-2 text-white">
                      Drag and drop images here, or click to select (1-4 images)
                    </p>
                  </>
                )}
              </div>
              {previewImages.length > 0 && (
                <div className="w-full mt-4 flex flex-wrap gap-4">
                  {previewImages.map((preview, index) => (
                    <div key={index} className="relative w-24 h-24 border rounded">
                      <img src={preview} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      <div className="absolute top-0 right-0 flex">
                        {index !== 0 && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setAsMainImage(index);
                            }}
                            className="bg-blue-500 text-white p-1 text-xs"
                          >
                            Main
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage(index);
                          }}
                          className="bg-red-500 text-white p-1 text-xs"
                        >
                          X
                        </button>
                      </div>
                      {index === 0 && (
                        <div className="absolute top-0 left-0 bg-green-500 text-white p-1 text-xs">
                          Main
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              <p className="text-sm text-gray-500 mt-2">{images.length}/4 images selected. First image will be the main poster.</p>
            </div>
            {/* Event Name */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventName"
                value={formValues.eventName}
                onChange={handleInputChange}
                placeholder="Enter Event Name"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {/* Event Category (Checkboxes) */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Category <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-4">
                {categories.map((cat, index) => (
                  <label key={index} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      value={cat.value}
                      checked={formValues.eventCategory.includes(cat.value)}
                      onChange={handleCategoryChange}
                    />
                    {cat.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Maximum Attendees */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Maximum Attendees <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxAttendees"
                value={formValues.maxAttendees}
                onChange={handleInputChange}
                placeholder="Enter Maximum Attendees"
                className="w-full p-2 border border-gray-300 rounded"
                min="0"
              />
            </div>
            {/* Number of Attendees */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Number of Attendees <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="noOfAttendees"
                value={formValues.noOfAttendees}
                onChange={handleInputChange}
                placeholder="Enter Number of Attendees"
                className="w-full p-2 border border-gray-300 rounded"
                min="1"
                required
              />
            </div>
            {/* Event Language */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Language <span className="text-red-500">*</span>
              </label>
              <select
                name="eventLang"
                value={formValues.eventLang}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
                required
              >
                <option value="">Select Language</option>
                <option value="Hindi">Hindi</option>
                <option value="English">English</option>
              </select>
            </div>
            {/* Event Link */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Link <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="eventLink"
                value={formValues.eventLink}
                onChange={handleInputChange}
                placeholder="Enter Event Link"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            {/* Free/Paid Toggle */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Type <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eventType"
                    value="free"
                    checked={formValues.eventType === "free"}
                    onChange={handleEventTypeChange}
                  />
                  Free
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="eventType"
                    value="paid"
                    checked={formValues.eventType === "paid"}
                    onChange={handleEventTypeChange}
                  />
                  Paid
                </label>
              </div>
            </div>
            {/* Booking Link for Paid Events */}
            {formValues.eventType === "paid" && (
              <div className="mb-6">
                <label className="block text-left font-medium mb-1">
                  Booking Link <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="bookingLink"
                  value={formValues.bookingLink}
                  onChange={handleInputChange}
                  placeholder="Enter Booking Link"
                  className="w-full p-2 border border-gray-300 rounded"
                  required={formValues.eventType === "paid"}
                />
              </div>
            )}
            {/* Artist/Orator Name */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Orator/Artist Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="artistOrOratorName"
                value={formValues.artistOrOratorName}
                onChange={handleInputChange}
                placeholder="Enter Orator/Artist Name"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {/* Organizer Name */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Organizer Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organizerName"
                value={formValues.organizerName}
                onChange={handleInputChange}
                placeholder="Enter Organizer Name"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {/* Organizer Whatsapp */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="organizerWhatsapp"
                value={formValues.organizerWhatsapp}
                onChange={handleInputChange}
                placeholder="Enter Mobile Number"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
              {validationError && (
                <p className="text-red-500 text-sm mt-1">{validationError}</p>
              )}
            </div>
            {/* Location Link */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Location Link <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="locationLink"
                value={formValues.locationLink}
                onChange={handleInputChange}
                placeholder="Enter Google Maps or location URL"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {/* Address Section */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Address Line 1 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="address"
                value={formValues.address}
                onChange={handleInputChange}
                placeholder="Enter address line 1"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Address Line 2 / Landmark
              </label>
              <input
                type="text"
                name="address2"
                value={formValues.address2}
                onChange={handleInputChange}
                placeholder="Enter address line 2"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Landmark
              </label>
              <input
                type="text"
                name="landmark"
                value={formValues.landmark}
                onChange={handleInputChange}
                placeholder="Enter Landmark"
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
            {/* Country, State, City Dropdowns */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-left font-medium mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  name="country"
                  value={selectedCountry ? selectedCountry.isoCode : ""}
                  onChange={(e) => {
                    const countryCode = e.target.value;
                    const countryObj = Country.getCountryByCode(countryCode);
                    setSelectedCountry(countryObj);
                    setFormValues((prev) => ({ ...prev, country: countryObj.name }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select Country</option>
                  {Country.getAllCountries().map((country, index) => (
                    <option key={index} value={country.isoCode}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-left font-medium mb-1">
                  State/Province <span className="text-red-500">*</span>
                </label>
                <select
                  name="state"
                  value={selectedState ? selectedState.isoCode : ""}
                  onChange={(e) => {
                    const stateCode = e.target.value;
                    const stateObj = statesOptions.find((s) => s.isoCode === stateCode);
                    setSelectedState(stateObj);
                    setFormValues((prev) => ({ ...prev, state: stateObj ? stateObj.name : "" }));
                  }}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select State</option>
                  {statesOptions.map((state, index) => (
                    <option key={index} value={state.isoCode}>
                      {state.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-left font-medium mb-1">
                  City <span className="text-red-500">*</span>
                </label>
                <select
                  name="city"
                  value={formValues.city}
                  onChange={(e) => setFormValues((prev) => ({ ...prev, city: e.target.value }))}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                >
                  <option value="">Select City</option>
                  {citiesOptions.map((city, index) => (
                    <option key={index} value={city.name}>
                      {city.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {/* Postal Code */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="postalCode"
                value={formValues.postalCode}
                onChange={handleInputChange}
                placeholder="Enter Postal Code"
                className="w-full p-2 border border-gray-300 rounded"
                required
              />
            </div>
            {/* Start Date and End Date */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
              <div className="flex-grow-1">
                <label className="block text-left font-medium mb-1">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formValues.startDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="block text-left font-medium mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={formValues.endDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            {/* Start Time and End Time */}
            <div className="mb-6 flex flex-col lg:flex-row gap-4">
              <div className="flex-grow-1">
                <label className="block text-left font-medium mb-1">
                  Start Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={formValues.startTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div className="flex-grow-1">
                <label className="block text-left font-medium mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={formValues.endTime}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>
            {eventSummary && (
              <div className="mb-6 text-left">
                <p>
                  <strong>Total Days:</strong> {eventSummary.totalDays}
                </p>
                <p>
                  <strong>Daily Duration:</strong> {eventSummary.hours} hours {eventSummary.minutes} minutes
                </p>
              </div>
            )}
            {/* Event Description */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="eventDesc"
                value={formValues.eventDesc}
                onChange={handleInputChange}
                placeholder="Enter Event Description"
                className="w-full p-2 border border-gray-300 rounded"
                rows="4"
                required
              ></textarea>
            </div>
            {/* Event Agenda */}
            <div className="mb-6">
              <label className="block text-left font-medium mb-1">
                Event Agenda <span className="text-red-500">*</span>
              </label>
              {agendaItems.map((item, index) => (
                <div key={index} className="mb-4 border p-4 rounded">
                  <div className="mb-2">
                    <label className="block font-medium">Sub Event</label>
                    <input
                      type="number"
                      min={1}
                      value={item.subEvent}
                      onChange={(e) => handleAgendaChange(index, "subEvent", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-medium">Title</label>
                    <input
                      type="text"
                      value={item.title}
                      onChange={(e) => handleAgendaChange(index, "title", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                    />
                  </div>
                  <div className="mb-2">
                    <label className="block font-medium">Description</label>
                    <textarea
                      value={item.description}
                      onChange={(e) => handleAgendaChange(index, "description", e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded"
                      rows="3"
                    ></textarea>
                    {agendaItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeAgendaItem(index)}
                        className="p-2 mt-2 rounded"
                      >
                        Remove Agenda Item
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <button type="button" onClick={addAgendaItem} className="p-2 rounded">
                Add Agenda Item
              </button>
            </div>
            <button type="submit" className="bg-[#F58021] text-white p-3 rounded w-full">
              Create Event
            </button>
          </form>
        </section>
        <Footer />
      </div>
    </LocalizationProvider>
  );
};

export default CreateEventComponent;