// import React, { useEffect, useState } from "react";
// import axios from "axios";
// import { useParams } from "react-router-dom";

// const ViewProfile = () => {
//     const { id } = useParams();
//     const [userData, setUserData] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState(null);
//     const url = process.env.REACT_APP_BACKEND; // backend URL from environment variables
//     console.log("IN view profile")

//     useEffect(() => {
//         const fetchUserData = async () => {
//             try {
//                 const response = await axios.get(`${url}user/${id}`);
//                 setUserData(response.data.user);
//             } catch (err) {
//                 console.error("Error fetching user data:", err);
//                 setError("Failed to fetch user data");
//             } finally {
//                 setLoading(false);
//             }
//         };

//         if (id) {
//             fetchUserData();
//         }
//     }, [id, url]);

//     if (loading) return <div>Loading...</div>;
//     if (error) return <div>{error}</div>;

//     return (
//         <div className="view-profile">
//             <h1>Profile Details</h1>
//             <div className="profile-details">
//                 {userData?.profile ? (
//                     <img
//                         src={userData.profile}
//                         alt={`${userData.name}'s Profile`}
//                         className="profile-image"
//                     />
//                 ) : (
//                     <div className="profile-placeholder">
//                         {userData?.name ? userData.name.charAt(0).toUpperCase() : "U"}
//                     </div>
//                 )}
//                 <h2>{userData?.name}</h2>
//                 <p>Email: {userData?.email}</p>
//                 <p>Phone: {userData?.phoneNumber}</p>
//                 <p>Location: {userData?.location}</p>
//                 <p>
//                     Member Since:
//                     {userData?.createdAt &&
//                         new Date(userData.createdAt).toLocaleDateString()}
//                 </p>
//                 {userData?.desc && (
//                     <div className="about-section">
//                         <h3>About</h3>
//                         <p>{userData.desc}</p>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ViewProfile;


import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import "../Csss/ProfilePage.css";

const ViewProfile = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [userEvents, setUserEvents] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscriberCount, setSubscriberCount] = useState(0);
    const [subscriptionCount, setSubscriptionCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const url = process.env.REACT_APP_BACKEND;
    const userId = localStorage.getItem("userId");
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (!id || id.length < 5) {
            setError("Invalid profile ID");
            setLoading(false);
            return;
        }

        // Redirect to profile-page if user is viewing their own profile
        if (id === userId) {
            navigate("/profile-page");
            return;
        }

        const fetchUserData = async () => {
            try {
                // Fetch user profile data
                const userResponse = await axios.get(`${url}user/${id}`);
                setUserData(userResponse.data.user);

                // Fetch user events
                const eventsResponse = await axios.get(`${url}user/events/${id}`);
                setUserEvents(eventsResponse.data.events);

                // Check if current user has subscribed to this profile
                if (userId && token) {
                    try {
                        const subStatusResponse = await axios.get(
                            `${url}subscription/status/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        setIsSubscribed(subStatusResponse.data.subscribed);

                        // Get subscription counts
                        const subCountResponse = await axios.get(
                            `${url}subscription/count/${id}`,
                            {
                                headers: {
                                    Authorization: `Bearer ${token}`,
                                },
                            }
                        );
                        setSubscriberCount(subCountResponse.data.subscribers);
                        setSubscriptionCount(subCountResponse.data.subscriptions);
                    } catch (subErr) {
                        console.error("Error fetching subscription data:", subErr);
                    }
                }
            } catch (err) {
                console.error("Error fetching user data:", err);
                setError("Failed to fetch user data");
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, [id, url, userId, token, navigate]);

    // Scroll effect - similar to PublicProfile
    useEffect(() => {
        setTimeout(() => {
            const windowHeight = window.innerHeight;
            const scrollPosition = windowHeight * 0.55;
            window.scrollTo({ top: scrollPosition, behavior: "smooth" });
        }, 100);
    }, []);

    const handleSubscriptionToggle = async () => {
        if (!userId || !token) {
            alert("Please login to subscribe to this user");
            return navigate("/login");
        }

        setIsLoading(true);
        try {
            const response = await axios.post(
                `${url}subscription/toggle/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            setIsSubscribed(response.data.subscribed);
            // Update subscriber count based on the action
            setSubscriberCount((prev) =>
                response.data.subscribed ? prev + 1 : prev - 1
            );
        } catch (error) {
            console.error("Failed to toggle subscription:", error);
            alert(error.response?.data?.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const memberSince = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const month = d.toLocaleString("default", { month: "long" });
        const year = d.getFullYear();
        return `${month}, ${year}`;
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    if (loading) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl text-tomato">Loading...</div>
        </div>
    );

    if (error) return (
        <div className="flex items-center justify-center h-screen">
            <div className="text-2xl text-tomato">{error}</div>
        </div>
    );

    return (
        <div className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start gap-[50px] leading-[normal] tracking-[normal] mq750:gap-[41px] mq450:gap-[20px]">
            {/* Main content section */}
            <main className="w-full flex flex-row items-start justify-center py-12 px-5 box-border max-w-full">
                <section className="w-[1256px] flex flex-col items-start justify-start max-w-full text-left text-21xl text-black font-poppins mq750:gap-[18px]">
                    {/* Profile header */}
                    <div className="w-[1229px] flex flex-row items-start justify-start py-0 px-3.5 box-border max-w-full text-xs">
                        <div className="flex-1 flex flex-col items-start justify-between max-w-full gap-[20px] mq750:!justify-end mq1050:flex-wrap">
                            <div className="w-full flex justify-between pt-px px-0 pb-0 box-border">
                                <div className="self-stretch flex flex-row items-center justify-between max-w-full gap-[20px] mq750:flex-wrap">
                                    {userData && userData.profile ? (
                                        <img
                                            className="profile-icon"
                                            src={userData.profile}
                                            alt="Profile"
                                        />
                                    ) : (
                                        <div className="profile-icon">
                                            {userData ? userData.name.charAt(0).toUpperCase() : "U"}
                                        </div>
                                    )}
                                    <div className="w-[650px] flex flex-col gap-2 items-start justify-center min-w-[403px] max-w-full mq750:flex-1 mq750:min-w-full">
                                        <div className="flex flex-col items-start justify-start text-lg">
                                            <div className="flex items-center gap-4">
                                                <b style={{ fontSize: "2rem" }} className="relative">
                                                    {userData && userData.name
                                                        ? userData.name
                                                        : "Loading..."}
                                                </b>
                                                {userId && (
                                                    <button
                                                        onClick={handleSubscriptionToggle}
                                                        disabled={isLoading}
                                                        className={`px-4 py-2 rounded-full text-sm font-medium ${isSubscribed
                                                            ? "bg-gray-200 text-gray-800 hover:bg-gray-300"
                                                            : "bg-tomato text-white hover:bg-red-600"
                                                            } transition-colors duration-300`}
                                                    >
                                                        {isLoading
                                                            ? "Loading..."
                                                            : isSubscribed
                                                                ? "Unsubscribe"
                                                                : "Subscribe"}
                                                    </button>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-6 mt-2">
                                                <div
                                                    style={{ fontSize: "1rem", fontWeight: "450" }}
                                                    className="relative text-sm z-[1]"
                                                >
                                                    <span className="font-bold">{subscriberCount}</span>{" "}
                                                    Subscribers
                                                </div>
                                                <div
                                                    style={{ fontSize: "1rem", fontWeight: "450" }}
                                                    className="relative text-sm z-[1]"
                                                >
                                                    <span className="font-bold">{subscriptionCount}</span>{" "}
                                                    Subscriptions
                                                </div>
                                            </div>
                                            <div
                                                style={{ fontSize: "1rem", fontWeight: "450" }}
                                                className="relative text-sm z-[1] mt-2"
                                            >
                                                Member Since:{" "}
                                                {userData && userData.createdAt
                                                    ? memberSince(userData.createdAt)
                                                    : "Loading..."}
                                            </div>
                                            <div
                                                style={{ fontSize: "1rem" }}
                                                className="relative text-sm z-[1]"
                                            >
                                                {
                                                    userData && userData.location && (() => {
                                                        const { address, addres2, city, state, country, postalCode } = userData.location;
                                                        const addressParts = [];
                                                        if (address) addressParts.push(address);
                                                        if (addres2) addressParts.push(addres2);
                                                        if (city) addressParts.push(city);
                                                        if (state) addressParts.push(state);
                                                        if (country) addressParts.push(country);
                                                        if (postalCode) addressParts.push(postalCode);
                                                        return addressParts.join(', ');
                                                    })()
                                                }
                                            </div>
                                            <div
                                                style={{ fontSize: "1rem" }}
                                                className="relative text-sm z-[1] mt-2"
                                            >
                                                {userData && userData.email
                                                    ? `Email: ${userData.email}`
                                                    : ""}
                                            </div>
                                            <div
                                                style={{ fontSize: "1rem" }}
                                                className="relative text-sm z-[1]"
                                            >
                                                {userData && userData.phoneNumber
                                                    ? `Phone: ${userData.phoneNumber}`
                                                    : ""}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="w-28 md:flex flex-col items-end justify-start gap-[45.6px] mq450:hidden">
                                    <div
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Profile URL Copied to Clipboard!");
                                        }}
                                        title="Copy Profile URL"
                                        className="w-[26px] cursor-pointer rounded-8xs box-border flex flex-col items-start justify-start py-[3px] px-1 border-[1px] border-solid border-chocolate"
                                    >
                                        <img
                                            className="w-4 h-[14.4px] relative"
                                            alt="Share"
                                            src="/vector-6.svg"
                                        />
                                    </div>
                                    <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
                                        <div className="self-stretch flex flex-row items-start justify-end">
                                            <div className="relative inline-block min-w-[70px]">
                                                Contact On
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-end justify-start gap-[14px]">
                                            <div className="flex flex-col items-start justify-start gap-[12px]">
                                                <div className="flex flex-row items-start justify-start py-0 px-0.5">
                                                    <a
                                                        href={
                                                            userData && userData.phoneNumber
                                                                ? `tel:+91${userData.phoneNumber}`
                                                                : "#"
                                                        }
                                                    >
                                                        <img
                                                            className="h-6 w-6 relative overflow-hidden shrink-0"
                                                            loading="lazy"
                                                            alt="Phone"
                                                            src="/phone.svg"
                                                        />
                                                    </a>
                                                </div>
                                                <a
                                                    href={
                                                        userData &&
                                                            userData.social &&
                                                            userData.social[0] &&
                                                            userData.social[0].link
                                                            ? userData.social[0].link
                                                            : "#"
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        className="w-7 h-7 relative overflow-hidden shrink-0"
                                                        loading="lazy"
                                                        alt="Facebook"
                                                        src="/facebook1.svg"
                                                    />
                                                </a>
                                            </div>
                                            <div className="flex flex-col items-start justify-start gap-[12px]">
                                                <a
                                                    href={
                                                        userData && userData.email
                                                            ? `mailto:${userData.email}`
                                                            : "#"
                                                    }
                                                >
                                                    <img
                                                        className="w-7 h-7 relative"
                                                        loading="lazy"
                                                        alt="Email"
                                                        src="/mail.svg"
                                                    />
                                                </a>
                                                <a
                                                    href={
                                                        userData &&
                                                            userData.social &&
                                                            userData.social[2] &&
                                                            userData.social[2].link
                                                            ? userData.social[2].link
                                                            : "#"
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        className="w-7 h-7 relative overflow-hidden shrink-0"
                                                        loading="lazy"
                                                        alt="Twitter"
                                                        src="/twitterx.svg"
                                                    />
                                                </a>
                                            </div>
                                            <div className="flex flex-col items-start justify-start gap-[12px]">
                                                <img
                                                    className="w-[25px] h-7 relative overflow-hidden shrink-0"
                                                    loading="lazy"
                                                    alt="Location"
                                                    src="/iconsmappin-1.svg"
                                                />
                                                <a
                                                    href={
                                                        userData &&
                                                            userData.social &&
                                                            userData.social[1] &&
                                                            userData.social[1].link
                                                            ? userData.social[1].link
                                                            : "#"
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        className="w-7 h-7 relative overflow-hidden shrink-0"
                                                        loading="lazy"
                                                        alt="Instagram"
                                                        src="/instagram.svg"
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* About section */}
                            <div
                                style={{ fontSize: "1rem" }}
                                className="self-stretch relative text-justify pt-5"
                            >
                                {userData && userData.desc ? <h5>About: </h5> : ""}
                                {userData && userData.desc ? userData.desc : ""}
                            </div>

                            {/* Mobile contact section */}
                            <div className="w-full mq450:flex justify-center hidden">
                                <div className="w-28 flex flex-col justify-center items-center gap-[45.6px]">
                                    <div
                                        onClick={() => {
                                            navigator.clipboard.writeText(window.location.href);
                                            alert("Profile URL Copied to Clipboard!");
                                        }}
                                        title="Copy Profile URL"
                                        className="w-[26px] cursor-pointer rounded-8xs box-border flex flex-col items-start justify-start py-[3px] px-1 border-[1px] border-solid border-chocolate"
                                    >
                                        <img
                                            className="w-4 h-[14.4px] relative"
                                            alt="Share"
                                            src="/vector-6.svg"
                                        />
                                    </div>
                                    <div className="self-stretch flex flex-col items-start justify-start gap-[12px]">
                                        <div className="self-stretch flex flex-row items-start justify-end">
                                            <div className="relative inline-block min-w-[70px]">
                                                Contact On
                                            </div>
                                        </div>
                                        <div className="flex flex-row items-end justify-start gap-[14px]">
                                            <div className="flex flex-col items-start justify-start gap-[12px]">
                                                <div className="flex flex-row items-start justify-start py-0 px-0.5">
                                                    <a
                                                        href={
                                                            userData && userData.phoneNumber
                                                                ? `tel:+91${userData.phoneNumber}`
                                                                : "#"
                                                        }
                                                    >
                                                        <img
                                                            className="h-6 w-6 relative overflow-hidden shrink-0"
                                                            loading="lazy"
                                                            alt="Phone"
                                                            src="/phone.svg"
                                                        />
                                                    </a>
                                                </div>
                                                <a
                                                    href={
                                                        userData &&
                                                            userData.social &&
                                                            userData.social[0] &&
                                                            userData.social[0].link
                                                            ? userData.social[0].link
                                                            : "#"
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        className="w-7 h-7 relative overflow-hidden shrink-0"
                                                        loading="lazy"
                                                        alt="Facebook"
                                                        src="/facebook1.svg"
                                                    />
                                                </a>
                                            </div>
                                            <div className="flex flex-col items-start justify-start gap-[12px]">
                                                <a
                                                    href={
                                                        userData && userData.email
                                                            ? `mailto:${userData.email}`
                                                            : "#"
                                                    }
                                                >
                                                    <img
                                                        className="w-7 h-7 relative"
                                                        loading="lazy"
                                                        alt="Email"
                                                        src="/mail.svg"
                                                    />
                                                </a>
                                                <a
                                                    href={
                                                        userData &&
                                                            userData.social &&
                                                            userData.social[2] &&
                                                            userData.social[2].link
                                                            ? userData.social[2].link
                                                            : "#"
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        className="w-7 h-7 relative overflow-hidden shrink-0"
                                                        loading="lazy"
                                                        alt="Twitter"
                                                        src="/twitterx.svg"
                                                    />
                                                </a>
                                            </div>
                                            <div className="flex flex-col items-start justify-start gap-[12px]">
                                                <img
                                                    className="w-[25px] h-7 relative overflow-hidden shrink-0"
                                                    loading="lazy"
                                                    alt="Location"
                                                    src="/iconsmappin-1.svg"
                                                />
                                                <a
                                                    href={
                                                        userData &&
                                                            userData.social &&
                                                            userData.social[1] &&
                                                            userData.social[1].link
                                                            ? userData.social[1].link
                                                            : "#"
                                                    }
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        className="w-7 h-7 relative overflow-hidden shrink-0"
                                                        loading="lazy"
                                                        alt="Instagram"
                                                        src="/instagram.svg"
                                                    />
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Events section */}
                    <div className="w-full flex flex-col items-end justify-center pt-8 px-0 box-border gap-[20px] max-w-full lg:gap-[41px] lg:pb-[67px] lg:box-border mq750:gap-[20px] mq750:pb-11 mq750:box-border">
                        <div className="self-stretch flex flex-row items-start justify-center max-w-full text-center">
                            <div className="w-[854px] flex flex-col items-end justify-start gap-[24px] max-w-full">
                                <div className="self-stretch flex flex-row items-start justify-center max-w-full">
                                    <div className="w-[751px] flex flex-col items-center justify-start gap-[15px] max-w-full">
                                        <h1
                                            id="events"
                                            className="pt-5 m-0 relative text-inherit leading-[48px] font-bold font-inherit mq1050:text-13xl mq1050:leading-[38px] mq450:text-5xl mq450:leading-[29px]"
                                        >
                                            <span>{userData?.name?.split(" ")[0]}'s </span>
                                            <span className="text-tomato">Events</span>
                                        </h1>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Events cards */}
                        {userEvents && userEvents.length > 0 ? (
                            <div className="w-full flex flex-wrap justify-center gap-8 text-center">
                                {userEvents.map((event) => (
                                    <div
                                        key={event._id}
                                        className="w-72 rounded-[20px] shadow-lg overflow-hidden hover:scale-95 transition-transform"
                                        onClick={() => navigate(`/event/${event._id}`)}
                                    >
                                        <div className="relative h-48 w-full">
                                            <img
                                                src={event.eventPosters && event.eventPosters.length > 0 ? event.eventPosters[0] : "/rectangle-12-1@2x.png"}
                                                alt={event.eventName}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                        <div className="p-4 bg-white">
                                            <h3 className="text-lg font-semibold mb-2 text-tomato">{event.eventName}</h3>
                                            <p className="text-sm text-gray-600 mb-1">
                                                {formatDate(event.startDate)} - {formatDate(event.endDate)}
                                            </p>
                                            <p className="text-sm text-gray-800 truncate">{event.eventAddress}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center w-full py-8">
                                <p className="text-lg">
                                    {userEvents === null ? "Loading events..." : "No events created yet by this user."}
                                </p>
                            </div>
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default ViewProfile;