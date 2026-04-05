import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { TextField, Button, CircularProgress, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio, Select, MenuItem, Checkbox, FormGroup } from "@mui/material";
import dayjs from "dayjs";
import { Country, State, City } from "country-state-city";

// Provided categories list
const categoriesList = [
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

const UpdateEvent = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const url = process.env.REACT_APP_BACKEND;

    // Form state (matching event data structure)
    const [formValues, setFormValues] = useState({
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
        eventAgenda: [
            {
                subEvent: 1,
                title: "",
                description: "",
            },
        ],
        eventType: "free",
    });

    // For event posters/files
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previewImages, setPreviewImages] = useState([]);

    // Loading and error states
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // For country/state/city dropdowns using country-state-city
    const [selectedCountry, setSelectedCountry] = useState(null);
    const [statesOptions, setStatesOptions] = useState([]);
    const [selectedState, setSelectedState] = useState(null);
    const [citiesOptions, setCitiesOptions] = useState([]);

    // Fetch event data by id and prefill the form and address dropdowns
    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const token = localStorage.getItem("token");
                const headers = { "Content-Type": "application/json" };
                if (token) headers["Authorization"] = `Bearer ${token}`;

                const response = await axios.get(`${url}events/${id}`, { headers });
                if (response.data && response.data.success) {
                    const event = response.data.event;
                    // Convert dates/times to input‑compatible formats
                    const startDate = dayjs(event.startDate).format("YYYY-MM-DD");
                    const endDate = dayjs(event.endDate).format("YYYY-MM-DD");
                    const startTime = dayjs(event.startDate).format("HH:mm");
                    const endTime = dayjs(event.endDate).format("HH:mm");

                    // Set form values
                    setFormValues({
                        eventName: event.eventName || "",
                        eventCategory: event.eventCategory || [],
                        eventDesc: event.eventDesc || "",
                        eventPrice: event.eventPrice || "0",
                        eventLang: event.eventLang || "",
                        noOfAttendees: event.noOfAttendees || "",
                        maxAttendees: event.maxAttendees || "",
                        artistOrOratorName: event.artistOrOratorName || "",
                        organizerName: event.organizerName || "",
                        organizerWhatsapp: event.organizerWhatsapp || "",
                        eventLink: event.eventLink || "",
                        locationLink: event.locationLink || "",
                        bookingLink: event.bookingLink || "",
                        address: event.address?.address || "",
                        address2: event.address?.address2 || "",
                        landmark: event.address?.landmark || "",
                        country: event.address?.country || "",
                        state: event.address?.state || "",
                        city: event.address?.city || "",
                        postalCode: event.address?.postalCode || "",
                        startDate,
                        endDate,
                        startTime,
                        endTime,
                        eventAgenda: event.eventAgenda && event.eventAgenda.length > 0 ? event.eventAgenda : [{ subEvent: 1, title: "", description: "" }],
                        eventType: event.eventPrice === "0" ? "free" : "paid",
                    });

                    // Set existing poster previews
                    setPreviewImages(event.eventPosters || []);

                    // For address dropdowns:
                    // If country is provided, try to find it; otherwise default to India.
                    let countryObj =
                        Country.getAllCountries().find(
                            (c) =>
                                c.name.toLowerCase() === (event.address?.country || "").toLowerCase()
                        ) || Country.getAllCountries().find(c => c.isoCode === "IN");
                    setSelectedCountry(countryObj);
                    setFormValues(prev => ({ ...prev, country: countryObj ? countryObj.name : "" }));
                    // Load states for the selected country
                    const states = countryObj ? State.getStatesOfCountry(countryObj.isoCode) : [];
                    setStatesOptions(states);
                    // If state is provided, find matching state
                    let stateObj =
                        states.find(
                            (s) => s.name.toLowerCase() === (event.address?.state || "").toLowerCase()
                        ) || null;
                    setSelectedState(stateObj);
                    setFormValues(prev => ({ ...prev, state: stateObj ? stateObj.name : "" }));
                    // Load cities if state is selected
                    if (stateObj) {
                        const cities = City.getCitiesOfState(countryObj.isoCode, stateObj.isoCode);
                        setCitiesOptions(cities);
                    }
                } else {
                    setError("Event not found");
                }
            } catch (err) {
                setError(err.response?.data?.message || err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchEvent();
    }, [id, url]);

    // Handle basic input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormValues(prev => ({ ...prev, [name]: value }));
    };

    // Handle checkboxes for event categories
    const handleCategoryChange = (e) => {
        const { value, checked } = e.target;
        let updatedCategories = [...formValues.eventCategory];
        if (checked) {
            updatedCategories.push(value);
        } else {
            updatedCategories = updatedCategories.filter(cat => cat !== value);
        }
        setFormValues(prev => ({ ...prev, eventCategory: updatedCategories }));
    };

    // Handle free/paid toggle
    const handleEventTypeChange = (e) => {
        const type = e.target.value;
        if (type === "free") {
            setFormValues(prev => ({ ...prev, eventType: type, bookingLink: "", eventPrice: "0" }));
        } else {
            setFormValues(prev => ({ ...prev, eventType: type }));
        }
    };

    // Handle agenda item changes
    const handleAgendaChange = (index, field, value) => {
        const updatedAgenda = [...formValues.eventAgenda];
        updatedAgenda[index] = { ...updatedAgenda[index], [field]: field === "subEvent" ? parseInt(value, 10) : value };
        setFormValues(prev => ({ ...prev, eventAgenda: updatedAgenda }));
    };

    const addAgendaItem = () => {
        const lastSubEvent = formValues.eventAgenda.length > 0 ? formValues.eventAgenda[formValues.eventAgenda.length - 1].subEvent : 0;
        const newAgenda = [...formValues.eventAgenda, { subEvent: lastSubEvent + 1, title: "", description: "" }];
        setFormValues(prev => ({ ...prev, eventAgenda: newAgenda }));
    };

    const removeAgendaItem = (index) => {
        if (formValues.eventAgenda.length > 1) {
            const newAgenda = formValues.eventAgenda.filter((_, i) => i !== index);
            setFormValues(prev => ({ ...prev, eventAgenda: newAgenda }));
        }
    };

    // Handle file selection for event posters
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        // Limit to maximum 5 files
        const limitedFiles = files.slice(0, 5);
        setSelectedFiles(limitedFiles);
        // Create preview URLs
        const previews = limitedFiles.map(file => URL.createObjectURL(file));
        setPreviewImages(previews);
    };

    // Address dropdown change handlers
    const handleCountryChange = (e) => {
        const countryIso = e.target.value;
        const countryObj = Country.getAllCountries().find(c => c.isoCode === countryIso);
        setSelectedCountry(countryObj);
        setFormValues(prev => ({ ...prev, country: countryObj.name, state: "", city: "" }));
        const states = countryObj ? State.getStatesOfCountry(countryObj.isoCode) : [];
        setStatesOptions(states);
        setSelectedState(null);
        setCitiesOptions([]);
    };

    const handleStateChange = (e) => {
        const stateIso = e.target.value;
        const stateObj = statesOptions.find(s => s.isoCode === stateIso);
        setSelectedState(stateObj);
        setFormValues(prev => ({ ...prev, state: stateObj.name, city: "" }));
        const cities = selectedCountry ? City.getCitiesOfState(selectedCountry.isoCode, stateObj.isoCode) : [];
        setCitiesOptions(cities);
    };

    const handleCityChange = (e) => {
        setFormValues(prev => ({ ...prev, city: e.target.value }));
    };

    // Submit update request
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem("token");
            const headers = { "Content-Type": "multipart/form-data" };
            if (token) headers["Authorization"] = `Bearer ${token}`;

            // Prepare event data for update
            const eventDataToUpdate = {
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
                startDate: new Date(`${formValues.startDate}T${formValues.startTime}`),
                endDate: new Date(`${formValues.endDate}T${formValues.endTime}`),
                startTime: formValues.startTime,
                endTime: formValues.endTime,
                eventAgenda: formValues.eventAgenda,
                eventType: formValues.eventType,
            };

            // Build FormData payload
            const formData = new FormData();
            formData.append("eventData", JSON.stringify(eventDataToUpdate));
            selectedFiles.forEach(images => formData.append("images", images));

            const response = await axios.put(`${url}admin/event/${id}`, formData, { headers });
            if (response.data.success) {
                alert(response.data.message || "Event updated successfully!");
                navigate("/admin/events");
            } else {
                alert("Update failed: " + response.data.message);
            }
        } catch (err) {
            alert("Error updating event: " + (err.response?.data?.message || err.message));
        } finally {
            setLoading(false);
        }
    };

    if (loading && !formValues.eventName) {
        return (
            <div className="flex justify-center items-center h-screen">
                <CircularProgress />
            </div>
        );
    }
    if (error) return <div className="text-red-500 text-center mt-4">{error}</div>;

    return (
        <div className="max-w-5xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-6">Update Event</h1>
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Event Name */}
                <TextField
                    label="Event Name"
                    name="eventName"
                    fullWidth
                    variant="outlined"
                    value={formValues.eventName}
                    onChange={handleInputChange}
                    required
                />

                {/* Event Categories (Checkboxes) */}
                <div>
                    <p className="font-medium mb-2">Event Categories *</p>
                    <div className="flex flex-wrap gap-4">
                        {categoriesList.map((cat, index) => (
                            <FormControlLabel
                                key={index}
                                control={
                                    <Checkbox
                                        value={cat.value}
                                        checked={formValues.eventCategory.includes(cat.value)}
                                        onChange={handleCategoryChange}
                                    />
                                }
                                label={cat.label}
                            />
                        ))}
                    </div>
                </div>

                {/* Event Description */}
                <TextField
                    label="Event Description"
                    name="eventDesc"
                    fullWidth
                    multiline
                    rows={4}
                    variant="outlined"
                    value={formValues.eventDesc}
                    onChange={handleInputChange}
                    required
                />

                {/* Event Price (only for paid events) */}
                {formValues.eventType === "paid" && (
                    <TextField
                        label="Event Price"
                        name="eventPrice"
                        fullWidth
                        variant="outlined"
                        value={formValues.eventPrice}
                        onChange={handleInputChange}
                        required
                    />
                )}

                {/* Event Language Dropdown */}
                <FormControl fullWidth>
                    <FormLabel>Event Language *</FormLabel>
                    <Select
                        name="eventLang"
                        value={formValues.eventLang}
                        onChange={handleInputChange}
                        required
                    >
                        <MenuItem value=""><em>Select Language</em></MenuItem>
                        <MenuItem value="Hindi">Hindi</MenuItem>
                        <MenuItem value="English">English</MenuItem>
                        <MenuItem value="Both">Both</MenuItem>
                    </Select>
                </FormControl>

                {/* Number of Attendees & Maximum Attendees */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Number of Attendees"
                        name="noOfAttendees"
                        type="number"
                        variant="outlined"
                        value={formValues.noOfAttendees}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Maximum Attendees"
                        name="maxAttendees"
                        type="number"
                        variant="outlined"
                        value={formValues.maxAttendees}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Orator/Artist Name, Organizer Name & Organizer Whatsapp */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <TextField
                        label="Orator/Artist Name"
                        name="artistOrOratorName"
                        variant="outlined"
                        value={formValues.artistOrOratorName}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Organizer Name"
                        name="organizerName"
                        variant="outlined"
                        value={formValues.organizerName}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Organizer Whatsapp"
                        name="organizerWhatsapp"
                        variant="outlined"
                        value={formValues.organizerWhatsapp}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Event Link and Location Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Event Link"
                        name="eventLink"
                        variant="outlined"
                        value={formValues.eventLink}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Location Link"
                        name="locationLink"
                        variant="outlined"
                        value={formValues.locationLink}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Event Type (Free/Paid) and conditional Booking Link */}
                <FormControl component="fieldset">
                    <FormLabel component="legend">Event Type *</FormLabel>
                    <RadioGroup row name="eventType" value={formValues.eventType} onChange={handleEventTypeChange}>
                        <FormControlLabel value="free" control={<Radio />} label="Free" />
                        <FormControlLabel value="paid" control={<Radio />} label="Paid" />
                    </RadioGroup>
                </FormControl>
                {formValues.eventType === "paid" && (
                    <TextField
                        label="Booking Link"
                        name="bookingLink"
                        fullWidth
                        variant="outlined"
                        value={formValues.bookingLink}
                        onChange={handleInputChange}
                        required
                    />
                )}

                {/* Address Section with Country/State/City dropdowns */}
                <div className="space-y-4">
                    <TextField
                        label="Address Line 1"
                        name="address"
                        fullWidth
                        variant="outlined"
                        value={formValues.address}
                        onChange={handleInputChange}
                        required
                    />
                    <TextField
                        label="Address Line 2 / Landmark"
                        name="address2"
                        fullWidth
                        variant="outlined"
                        value={formValues.address2}
                        onChange={handleInputChange}
                    />
                    <TextField
                        label="Landmark"
                        name="landmark"
                        fullWidth
                        variant="outlined"
                        value={formValues.landmark}
                        onChange={handleInputChange}
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormControl fullWidth required>
                            <FormLabel>Country</FormLabel>
                            <Select
                                value={selectedCountry ? selectedCountry.isoCode : ""}
                                onChange={handleCountryChange}
                            >
                                {Country.getAllCountries().map((country) => (
                                    <MenuItem key={country.isoCode} value={country.isoCode}>
                                        {country.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <FormLabel>State</FormLabel>
                            <Select
                                value={selectedState ? selectedState.isoCode : ""}
                                onChange={handleStateChange}
                            >
                                {statesOptions.map((state) => (
                                    <MenuItem key={state.isoCode} value={state.isoCode}>
                                        {state.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <FormLabel>City</FormLabel>
                            <Select value={formValues.city} onChange={handleCityChange}>
                                {citiesOptions.map((city) => (
                                    <MenuItem key={city.name} value={city.name}>
                                        {city.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </div>
                    <TextField
                        label="Postal Code"
                        name="postalCode"
                        variant="outlined"
                        value={formValues.postalCode}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Date & Time inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Start Date"
                        name="startDate"
                        type="date"
                        variant="outlined"
                        value={formValues.startDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        label="End Date"
                        name="endDate"
                        type="date"
                        variant="outlined"
                        value={formValues.endDate}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <TextField
                        label="Start Time"
                        name="startTime"
                        type="time"
                        variant="outlined"
                        value={formValues.startTime}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                    <TextField
                        label="End Time"
                        name="endTime"
                        type="time"
                        variant="outlined"
                        value={formValues.endTime}
                        onChange={handleInputChange}
                        InputLabelProps={{ shrink: true }}
                        required
                    />
                </div>

                {/* Event Agenda */}
                <div>
                    <p className="font-medium mb-2">Event Agenda *</p>
                    {formValues.eventAgenda.map((item, index) => (
                        <div key={index} className="border p-4 rounded mb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
                                <TextField
                                    label="Sub Event"
                                    type="number"
                                    name="subEvent"
                                    value={item.subEvent}
                                    onChange={(e) => handleAgendaChange(index, "subEvent", e.target.value)}
                                />
                                <TextField
                                    label="Title"
                                    name="title"
                                    value={item.title}
                                    onChange={(e) => handleAgendaChange(index, "title", e.target.value)}
                                />
                                <TextField
                                    label="Description"
                                    name="description"
                                    value={item.description}
                                    onChange={(e) => handleAgendaChange(index, "description", e.target.value)}
                                    multiline
                                    rows={2}
                                />
                            </div>
                            {formValues.eventAgenda.length > 1 && (
                                <Button variant="outlined" color="error" onClick={() => removeAgendaItem(index)}>
                                    Remove Agenda Item
                                </Button>
                            )}
                        </div>
                    ))}
                    <Button variant="contained" onClick={addAgendaItem}>
                        Add Agenda Item
                    </Button>
                </div>

                {/* Event Posters File Upload */}
                <div>
                    <p className="font-medium mb-2">Event Posters (max 5)</p>
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileChange}
                        className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-[#D26600] file:text-white
              hover:file:bg-[#c65f00]"
                    />
                    {previewImages.length > 0 && (
                        <div className="mt-4 grid grid-cols-3 gap-4">
                            {previewImages.map((src, idx) => (
                                <img key={idx} src={src} alt={`Poster ${idx}`} className="w-full h-auto object-cover rounded" />
                            ))}
                        </div>
                    )}
                </div>

                <Button variant="contained" color="primary" type="submit" fullWidth disabled={loading}>
                    {loading ? "Updating..." : "Update Event"}
                </Button>
            </form>
        </div>
    );
};

export default UpdateEvent;
