import { useRef, useState } from "react";
import axios from "axios";
import Footer from "../components/Footer";
import FirstFold1 from "../components/FirstFold1";

const ContactUs = () => {
  const url = process.env.REACT_APP_BACKEND;
  const formRef = useRef();
  const [loading, setLoading] = useState(false);

  const sendEmail = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = {
      firstName: formRef.current["firstName"].value,
      lastName: formRef.current["lastName"].value,
      email: formRef.current["email"].value,
      phone: formRef.current["phone"].value,
      message: formRef.current["msg"].value,
    };

    try {
      const response = await axios.post(url + "api/send-email", formData);
      alert(response.data.message); // Shows success message
      formRef.current.reset(); // Reset the form
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{ marginTop: "-5rem" }}
      className="w-full relative bg-white overflow-hidden flex flex-col items-end justify-start py-0 px-px box-border leading-[normal] tracking-[normal]"
    >
      <FirstFold1 />
      <form
        ref={formRef}
        onSubmit={sendEmail}
        className="py-5 self-stretch flex flex-col items-center justify-center box-border max-w-full"
      >
        {/* Form fields */}
        <div
          className="md:container p-5 md:mx-auto mq750:!p-5 mq750:!py-[40px]"
          style={{ border: "1px solid #333", borderRadius: "2rem" }}
        >
          <h1>
            Contact <span style={{ color: "#D26600" }}>US</span>
          </h1>
          <div className="w-full h-auto flex justify-between items-center my-3">
            {/* First Name */}
            <input
              placeholder="Enter First Name"
              type="text"
              name="firstName"
              required
              maxLength="50"
              className="border-[1px] border-gray-300 p-2 outline-none rounded-md w-[48%]"
            />
            {/* Last Name */}
            <input
              placeholder="Enter Last Name"
              type="text"
              name="lastName"
              required
              maxLength="50"
              className="border-[1px] border-gray-300 p-2 outline-none rounded-md w-[48%]"
            />
          </div>
          <div className="w-full h-auto flex justify-between items-center my-3">
            {/* Email */}
            <input
              placeholder="Enter Email Address"
              type="email"
              name="email"
              required
              maxLength="50"
              className="border-[1px] border-gray-300 p-2 outline-none rounded-md w-[48%]"
            />
            {/* Phone */}
            <input
              placeholder="+91-XXXXX-XXXXX"
              type="tel"
              name="phone"
              maxLength="10"
              className="border-[1px] border-gray-300 p-2 outline-none rounded-md w-[48%]"
            />
          </div>
          {/* Message */}
          <textarea
            placeholder="Write your message..."
            name="msg"
            rows="5"
            maxLength={2000}
            required
            className="border-[1px] border-gray-300 p-2 outline-none rounded-md w-full resize-none"
          ></textarea>
          <button
            type="submit"
            className="mt-4 px-4 py-1.5 rounded-lg flex items-center justify-center"
            style={{ backgroundColor: "#FFCBA4" }}
            disabled={loading}
          >
            {loading ? "Sending..." : "Send mail"}
          </button>
        </div>
      </form>
      <Footer />
    </div>
  );
};

export default ContactUs;
