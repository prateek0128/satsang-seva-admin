import EventCard from "../components/EventCard";
import Footer from "../components/Footer";
import { useEffect, useState } from "react";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import "../Csss/ProfilePage.css";

const PublicProfile = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const location = useLocation();
  const userId = localStorage.getItem("userId");
  const token = localStorage.getItem("token");
  const [userData, setUserData] = useState(null);
  const [userEvents, setUserEvents] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscriberCount, setSubscriberCount] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  const [profileUserId, setProfileUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const publicUser = queryParams.get("q");
    if (!publicUser || publicUser.length < 5) {
      return navigate("/");
    }
    if (publicUser === userId) {
      navigate("/profile-page");
    } else {
      setProfileUserId(publicUser);
      fetchUserInfo(publicUser);
    }
  }, [userId, location, navigate]);

  // Scroll effect
  useEffect(() => {
    setTimeout(() => {
      const windowHeight = window.innerHeight;
      const scrollPosition = windowHeight * 0.55;
      window.scrollTo({ top: scrollPosition, behavior: "smooth" });
    }, 100);
  }, [location]);

  // Check subscription `status` when both user IDs are available
  useEffect(() => {
    if (userId && profileUserId && token) {
      checkSubscriptionStatus();
      fetchSubscriptionCounts();
    }
  }, [userId, profileUserId, token]);

  const fetchUserInfo = async (id) => {
    try {
      const userResponse = await axios.get(url + "users/" + id);
      const user = userResponse.data.data || userResponse.data.user;
      setUserData(user);

      const eventsResponse = await axios.get(url + "events/by-user/" + id);
      setUserEvents(eventsResponse.data.data || eventsResponse.data.events || []);
    } catch (e) {
      console.error("Error fetching user info:", e);
    }
  };

  const checkSubscriptionStatus = async () => {
    try {
      const response = await axios.get(
        `${url}subscription/status/${profileUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setIsSubscribed(response.data.subscribed);
    } catch (error) {
      console.error("Failed to check subscription status:", error);
    }
  };

  const fetchSubscriptionCounts = async () => {
    try {
      const response = await axios.get(
        `${url}subscription/count/${profileUserId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setSubscriberCount(response.data.subscribers);
      setSubscriptionCount(response.data.subscriptions);
    } catch (error) {
      console.error("Failed to fetch subscription counts:", error);
    }
  };

  const handleSubscriptionToggle = async () => {
    if (!userId || !token) {
      alert("Please login to subscribe to this user");
      return navigate("/login");
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${url}subscription/toggle/${profileUserId}`,
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

  const memberSince = (x) => {
    const date = new Date(x);
    const month = date.toLocaleString("default", { month: "long" });
    const year = date.getFullYear();
    return ` ${month}, ${year}`;
  };

  return (
    <div
      className="w-full relative bg-white overflow-hidden flex flex-col items-start justify-start gap-[50px] leading-[normal] tracking-[normal] mq750:gap-[41px] mq450:gap-[20px]"
    >
      <main
        style={{ width: "100vw" }}
        className="flex flex-row items-start justify-center py-0 px-5 box-border max-w-full"
      >
        <section className="w-[1256px] flex flex-col items-start justify-start max-w-full text-left text-21xl text-black font-poppins mq750:gap-[18px]">
          <div className="w-[1229px] flex flex-row items-start justify-start py-0 px-3.5 box-border max-w-full text-xs">
            <div className="flex-1 flex flex-col items-start justify-between max-w-full gap-[20px] mq750:!justify-end mq1050:flex-wrap">
              <div className="w-full flex justify-between pt-px px-0 pb-0 box-border">
                <div className="self-stretch flex flex-row items-center justify-between max-w-full gap-[20px] mq750:flex-wrap">
                  {userData && userData.profilePicture ? (
                    <img
                      className="profile-icon"
                      src={userData.profilePicture}
                      alt="Profile Image"
                    />
                  ) : (
                    <div className="profile-icon">
                      {userData ? userData.name.charAt(0).toUpperCase() : "..."}
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
                    </div>
                  </div>
                </div>
                <div className="w-28 md:flex flex-col items-end justify-start gap-[45.6px] mq450:hidden">
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      ;
                    }}
                    title="Copy Public URL"
                    className="w-[26px] cursor-pointer rounded-8xs box-border flex flex-col items-start justify-start py-[3px] px-1 border-[1px] border-solid border-chocolate"
                  >
                    <img
                      className="w-4 h-[14.4px] relative"
                      alt=""
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
                              userData ? "tel:+91" + userData.phone : "#"
                            }
                          >
                            <img
                              className="h-6 w-6 relative overflow-hidden shrink-0"
                              loading="lazy"
                              alt=""
                              src="/phone.svg"
                            />
                          </a>
                        </div>
                        <a
                          href={
                            userData && userData.social && userData.social[0]
                              ? userData.social[0].link
                              : null
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="w-7 h-7 relative overflow-hidden shrink-0"
                            loading="lazy"
                            alt=""
                            src="/facebook1.svg"
                          />
                        </a>
                      </div>
                      <div className="flex flex-col items-start justify-start gap-[12px]">
                        <a href={userData ? "mailto:" + userData.email : "#"}>
                          <img
                            className="w-7 h-7 relative"
                            loading="lazy"
                            alt=""
                            src="/mail.svg"
                          />
                        </a>
                        <a
                          href={
                            userData && userData.social && userData.social[2]
                              ? userData.social[2].link
                              : null
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="w-7 h-7 relative overflow-hidden shrink-0"
                            loading="lazy"
                            alt=""
                            src="/twitterx.svg"
                          />
                        </a>
                      </div>
                      <div className="flex flex-col items-start justify-start gap-[12px]">
                        <img
                          className="w-[25px] h-7 relative overflow-hidden shrink-0"
                          loading="lazy"
                          alt=""
                          src="/iconsmappin-1.svg"
                        />
                        <a
                          href={
                            userData && userData.social && userData.social[1]
                              ? userData.social[1].link
                              : null
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="w-7 h-7 relative overflow-hidden shrink-0"
                            loading="lazy"
                            alt=""
                            src="/instagram.svg"
                          />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div
                style={{ fontSize: "1rem" }}
                className="self-stretch relative text-justify pt-5"
              >
                {userData && userData.bio ? <h5>About: </h5> : ""}
                {userData && userData.bio ? userData.bio : ""}
              </div>

              <div className="w-full mq450:flex justify-center hidden">
                <div className="w-28 flex flex-col justify-center items-center  gap-[45.6px] ">
                  <div
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      ;
                    }}
                    title="Copy Public URL"
                    className="w-[26px] cursor-pointer rounded-8xs box-border flex flex-col items-start justify-start py-[3px] px-1 border-[1px] border-solid border-chocolate"
                  >
                    <img
                      className="w-4 h-[14.4px] relative"
                      alt=""
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
                              userData ? "tel:+91" + userData.phone : "#"
                            }
                          >
                            <img
                              className="h-6 w-6 relative overflow-hidden shrink-0"
                              loading="lazy"
                              alt=""
                              src="/phone.svg"
                            />
                          </a>
                        </div>
                        <a
                          href={
                            userData && userData.social && userData.social[0]
                              ? userData.social[0].link
                              : null
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="w-7 h-7 relative overflow-hidden shrink-0"
                            loading="lazy"
                            alt=""
                            src="/facebook1.svg"
                          />
                        </a>
                      </div>
                      <div className="flex flex-col items-start justify-start gap-[12px]">
                        <a href={userData ? "mailto:" + userData.email : "#"}>
                          <img
                            className="w-7 h-7 relative"
                            loading="lazy"
                            alt=""
                            src="/mail.svg"
                          />
                        </a>
                        <a
                          href={
                            userData && userData.social && userData.social[2]
                              ? userData.social[2].link
                              : null
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="w-7 h-7 relative overflow-hidden shrink-0"
                            loading="lazy"
                            alt=""
                            src="/twitterx.svg"
                          />
                        </a>
                      </div>
                      <div className="flex flex-col items-start justify-start gap-[12px]">
                        <img
                          className="w-[25px] h-7 relative overflow-hidden shrink-0"
                          loading="lazy"
                          alt=""
                          src="/iconsmappin-1.svg"
                        />
                        <a
                          href={
                            userData && userData.social && userData.social[1]
                              ? userData.social[1].link
                              : null
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <img
                            className="w-7 h-7 relative overflow-hidden shrink-0"
                            loading="lazy"
                            alt=""
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
          <div
            style={{ width: "100vw" }}
            className=" flex flex-col items-end justify-center pt-0 px-0 box-border gap-[20px] max-w-full lg:gap-[41px] lg:pb-[67px] lg:box-border mq750:gap-[20px] mq750:pb-11 mq750:box-border"
          >
            <div className="self-stretch flex flex-row items-start justify-center max-w-full text-center">
              <div className="w-[854px] flex flex-col items-end justify-start gap-[24px] max-w-full">
                <div className="self-stretch flex flex-row items-start justify-center max-w-full">
                  <div className="w-[751px] flex flex-col items-center justify-start gap-[15px] max-w-full">
                    <h1
                      id="events"
                      className="pt-5 m-0 relative text-inherit leading-[48px] font-bold font-inherit mq1050:text-13xl mq1050:leading-[38px] mq450:text-5xl mq450:leading-[29px]"
                    >
                      <span>{userData?.name.split(" ")[0]}'s </span>
                      <span className="text-tomato">Events</span>
                    </h1>
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
                        eventCardImage={
                          e.eventPosters
                            ? `${e.eventPosters[0]}`
                            : "/rectangle-12-1@2x.png"
                        }
                        event={e}
                        title={e.eventName}
                        date={e.startDate}
                        endDate={e.endDate}
                        address={e.eventAddress}
                        className="rounded-[20px] shadow-lg hover:scale-95 transition-transform"
                      />
                    ))}
                  </div>
                </div>
              </>
            )}
            {userEvents && userEvents.length === 0 && (
              <div className="text-center w-full py-8">
                <p className="text-lg text-gray-600">
                  No events created yet by this user.
                </p>
              </div>
            )}
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

export default PublicProfile;
