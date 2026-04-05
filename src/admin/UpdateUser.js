import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
    TextField,
    Button,
    Tabs,
    Tab,
    MenuItem,
} from "@mui/material";
import Loader from "../components/Loader";
import { Country, State, City } from "country-state-city";

const userTypeOptions = [
    { value: "Host&Participant", label: "Host&Participant" },
    { value: "Participant", label: "Participant" },
];

const profileTypeOptions = [
    { value: "Artist", label: "Artist" },
    { value: "Orator", label: "Orator" },
    { value: "Organizer", label: "Organizer" },
];

const UpdateUser = () => {
    const { id } = useParams();
    const url = process.env.REACT_APP_BACKEND;

    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [tab, setTab] = useState(0);

    // Show OTP field only when needed by the backend response.
    const [otpRequired, setOtpRequired] = useState(false);

    // --- Basic Data ---
    const [basicData, setBasicData] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        profileType: "",
        userType: "",
        otp: "",
    });

    // --- Additional Data ---
    const [additionalData, setAdditionalData] = useState({
        desc: "",
        address: "",
        address2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "",
    });

    // --- Country-State-City arrays ---
    const [allCountries, setAllCountries] = useState([]);
    const [allStates, setAllStates] = useState([]);
    const [allCities, setAllCities] = useState([]);

    // On mount, fetch all countries
    useEffect(() => {
        const countries = Country.getAllCountries(); // returns array of { name, isoCode, ... }
        setAllCountries(countries);
    }, []);

    // When additionalData.country changes, load states
    useEffect(() => {
        if (!additionalData.country) {
            setAllStates([]);
            setAllCities([]);
            return;
        }

        // Find the selected country by name in allCountries
        const foundCountry = allCountries.find(
            (c) => c.name.toLowerCase() === additionalData.country.toLowerCase()
        );
        if (!foundCountry) {
            setAllStates([]);
            setAllCities([]);
            return;
        }

        const states = State.getStatesOfCountry(foundCountry.isoCode);
        setAllStates(states || []);
        // Reset city list whenever country changes
        setAllCities([]);
    }, [additionalData.country, allCountries]);

    // When additionalData.state changes, load cities
    useEffect(() => {
        if (!additionalData.state || !additionalData.country) {
            setAllCities([]);
            return;
        }

        // Find the selected country by name
        const foundCountry = allCountries.find(
            (c) => c.name.toLowerCase() === additionalData.country.toLowerCase()
        );
        if (!foundCountry) {
            setAllCities([]);
            return;
        }

        // Find the selected state by name
        const foundState = State.getStatesOfCountry(foundCountry.isoCode).find(
            (s) => s.name.toLowerCase() === additionalData.state.toLowerCase()
        );
        if (!foundState) {
            setAllCities([]);
            return;
        }

        const cities = City.getCitiesOfState(foundCountry.isoCode, foundState.isoCode);
        setAllCities(cities || []);
    }, [additionalData.state, additionalData.country, allCountries]);

    // Fetch user details by id on mount
    useEffect(() => {
        const fetchUser = async () => {
            setLoading(true);
            try {
                const response = await axios.get(`${url}user/${id}`);
                if (response.data.user) {
                    const fetchedUser = response.data.user;
                    setUser(fetchedUser);

                    // Populate basic data fields
                    setBasicData({
                        name: fetchedUser?.name || "",
                        email: fetchedUser?.email || "",
                        phoneNumber: fetchedUser?.phoneNumber || "",
                        password: "",
                        profileType: fetchedUser?.profileType || "",
                        userType: fetchedUser?.userType || "",
                        otp: "",
                    });

                    // Populate additional details
                    setAdditionalData({
                        desc: fetchedUser?.desc || "",
                        address: fetchedUser?.location?.address || "",
                        address2: fetchedUser?.location?.address2 || "",
                        city: fetchedUser?.location?.city || "",
                        state: fetchedUser?.location?.state || "",
                        postalCode: fetchedUser?.location?.postalCode || "",
                        country: fetchedUser?.location?.country || "",
                    });
                }
            } catch (error) {
                alert("Error fetching user: " + error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id, url]);

    const handleTabChange = (e, newValue) => {
        setTab(newValue);
    };

    // --- Basic form changes ---
    const handleBasicChange = (e) => {
        setBasicData({ ...basicData, [e.target.name]: e.target.value });
    };

    // --- Additional form changes ---
    const handleAdditionalChange = (e) => {
        setAdditionalData({ ...additionalData, [e.target.name]: e.target.value });
    };

    // For the country dropdown
    const handleCountryChange = (e) => {
        setAdditionalData((prev) => ({
            ...prev,
            country: e.target.value,
            state: "",
            city: "",
        }));
    };

    // For the state dropdown
    const handleStateChange = (e) => {
        setAdditionalData((prev) => ({
            ...prev,
            state: e.target.value,
            city: "",
        }));
    };

    // For the city dropdown
    const handleCityChange = (e) => {
        setAdditionalData((prev) => ({
            ...prev,
            city: e.target.value,
        }));
    };

    // --- Update Basic User Info ---
    const handleBasicUpdate = async () => {
        const payload = {
            name: basicData.name,
            email: basicData.email,
            phoneNumber: basicData.phoneNumber,
            password: basicData.password,
            userType: basicData.userType
        };
        if (basicData?.profileType && basicData?.profileType.trim() !== "") {

            payload.profileType = basicData.profileType
        }
        if (basicData.otp) {
            payload.otp = basicData.otp;
        }
        setLoading(true);
        try {
            const headers = { "Content-Type": "application/json" };
            const token = localStorage.getItem("token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await axios.put(
                `${url}admin/user/basic/${id}`,
                payload,
                { headers }
            );
            if (response.data.otp) {
                setOtpRequired(true);
                alert(
                    response.data.message ||
                    `OTP sent to your number. Please verify to complete the update.`
                );
            } else {
                alert(response.data.message || "User updated successfully!");
            }
        } catch (error) {
            alert(
                "Error updating basic details: " +
                (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    // --- Update Additional Details ---
    const handleAdditionalUpdate = async () => {

        const payload = {
            desc: additionalData.desc,
            location: {
                address: additionalData.address,
                address2: additionalData.address2,
                city: additionalData.city,
                state: additionalData.state,
                postalCode: additionalData.postalCode,
                country: additionalData.country,
            },
        };

        const formData = new FormData();
        formData.append("updateUser", JSON.stringify(payload));

        setLoading(true);
        try {
            const headers = { "Content-Type": "multipart/form-data" };
            const token = localStorage.getItem("token");
            if (token) {
                headers["Authorization"] = `Bearer ${token}`;
            }
            const response = await axios.put(
                `${url}admin/user/modify/${id}`,
                formData,
                { headers }
            );
            alert(
                response.data.message ||
                "User additional details updated successfully!"
            );

        } catch (error) {
            alert(
                "Error updating additional details: " +
                (error.response?.data?.message || error.message)
            );
        } finally {
            setLoading(false);
        }
    };

    // --- Render ---
    return (
        <div style={{ padding: "1rem" }}>
            {loading && <Loader />}
            <h1>Update User Information</h1>
            <Tabs value={tab} onChange={handleTabChange}>
                <Tab label="Basic Details" />
                <Tab label="Additional Details" />
            </Tabs>

            {/* ---------------- Basic Details Tab ---------------- */}
            {tab === 0 && (
                <div style={{ marginTop: "1rem" }}>
                    <TextField
                        label="Name"
                        name="name"
                        value={basicData.name}
                        onChange={handleBasicChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Email"
                        name="email"
                        value={basicData.email}
                        onChange={handleBasicChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Phone Number"
                        name="phoneNumber"
                        value={basicData.phoneNumber}
                        onChange={handleBasicChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Password"
                        name="password"
                        value={basicData.password}
                        onChange={handleBasicChange}
                        type="password"
                        fullWidth
                        margin="normal"
                    />
                    {/* User Type Dropdown */}
                    <TextField
                        select
                        label="User Type"
                        name="userType"
                        value={basicData.userType}
                        onChange={handleBasicChange}
                        fullWidth
                        margin="normal"
                    >
                        {userTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* Profile Type Dropdown */}
                    <TextField
                        select
                        label="Profile Type"
                        name="profileType"
                        value={basicData.profileType}
                        onChange={handleBasicChange}
                        fullWidth
                        margin="normal"
                    >
                        {profileTypeOptions.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </TextField>
                    {/* Conditionally render OTP field */}
                    {otpRequired && (
                        <TextField
                            label="OTP (if required)"
                            name="otp"
                            value={basicData.otp}
                            onChange={handleBasicChange}
                            fullWidth
                            margin="normal"
                            helperText="Enter OTP to complete update"
                        />
                    )}
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleBasicUpdate}
                        style={{ marginTop: "1rem" }}
                    >
                        Update Basic Details
                    </Button>
                </div>
            )}

            {/* ---------------- Additional Details Tab ---------------- */}
            {tab === 1 && (
                <div style={{ marginTop: "1rem" }}>
                    <TextField
                        label="Description"
                        name="desc"
                        value={additionalData.desc}
                        onChange={handleAdditionalChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Address"
                        name="address"
                        value={additionalData.address}
                        onChange={handleAdditionalChange}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Address 2"
                        name="address2"
                        value={additionalData.address2}
                        onChange={handleAdditionalChange}
                        fullWidth
                        margin="normal"
                    />

                    {/* Country Dropdown */}
                    <TextField
                        select
                        label="Country"
                        name="country"
                        value={additionalData.country}
                        onChange={handleCountryChange}
                        fullWidth
                        margin="normal"
                    >
                        <MenuItem value="">
                            <em>Select Country</em>
                        </MenuItem>
                        {allCountries.map((c) => (
                            <MenuItem key={c.isoCode} value={c.name}>
                                {c.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* State Dropdown */}
                    <TextField
                        select
                        label="State"
                        name="state"
                        value={additionalData.state}
                        onChange={handleStateChange}
                        fullWidth
                        margin="normal"
                        disabled={!allStates.length}
                    >
                        <MenuItem value="">
                            <em>Select State</em>
                        </MenuItem>
                        {allStates.map((s) => (
                            <MenuItem key={s.isoCode} value={s.name}>
                                {s.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    {/* City Dropdown */}
                    <TextField
                        select
                        label="City"
                        name="city"
                        value={additionalData.city}
                        onChange={handleCityChange}
                        fullWidth
                        margin="normal"
                        disabled={!allCities.length}
                    >
                        <MenuItem value="">
                            <em>Select City</em>
                        </MenuItem>
                        {allCities.map((ci) => (
                            <MenuItem key={ci.name} value={ci.name}>
                                {ci.name}
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Postal Code"
                        name="postalCode"
                        value={additionalData.postalCode}
                        onChange={handleAdditionalChange}
                        fullWidth
                        margin="normal"
                    />

                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAdditionalUpdate}
                        style={{ marginTop: "1rem" }}
                    >
                        Update Additional Details
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UpdateUser;
