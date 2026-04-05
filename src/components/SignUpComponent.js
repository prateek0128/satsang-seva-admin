import { useCallback, useState } from "react";
import { TextField, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import Loader from "./Loader";
import { GoogleLogin } from "@react-oauth/google";
import { jwtDecode } from "jwt-decode";
import { Modal, Button as Btn } from "react-bootstrap";
import { Link } from "react-router-dom";
import { IoIosCloseCircleOutline } from "react-icons/io";

const SignUpComponent = ({ className = "" }) => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
    userType: "Host&Participant",
    profileType: "",
  });

  const [error, setError] = useState("");
  const [inputOtp, setInputOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const onInputChange = (e) => {
    if (disabled) {
      if (e.target.name === "email") {
        alert("Don't mess with Website!");
        return window.location.reload();
      }
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleClose = () => {
    setOtp("");
    setInputOtp(false);
  };

  const handleCheckOtp = async () => {
    setLoading(true);
    if (otp.length !== 4 || formData.phoneNumber.length !== 10) {
      alert("OTP is of 4-Digits");
      return setLoading(false);
    }
    const data = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      userType: formData.userType,
      profileType: formData.profileType,
      fcmToken: "test",
      otp,
    };
    await axios
      .post(url + "user/signup/verifyotp", data)
      .then((resp) => {
        alert("Account Created Successfully! Please Login.");
        navigate("/login");
        handleClose();
      })
      .catch((e) => {
        // console.log(e)
        let err = "";
        if (!e.response?.data?.success) {
          if (e.response?.data?.message) {
            err += e.response?.data?.message;
          }
          if (e.response?.data?.error) {
            err += e.response?.data?.error;
          }
          alert(err);
        } else {
          alert("Some thing went wrong");
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (disabled) {
      return onFormSubmit();
    }

    setLoading(true);
    setError("");

    // Input validation
    if (
      formData.password !== formData.confirmPassword ||
      formData.password.trim() === ""
    ) {
      alert("Confirm Password doesn't match!");
      setLoading(false);
      return;
    }

    if (!formData.name || formData.name.trim() === "") {
      alert("Enter your name");
      setLoading(false);
      return;
    }

    if (!formData.phoneNumber || formData.phoneNumber.length !== 10) {
      alert("Enter a valid 10-digit phone number.");
      setLoading(false);
      return;
    }

    if (!formData.email || !formData.email.includes("@")) {
      alert("Enter a valid email address.");
      setLoading(false);
      return;
    }

    const data = {
      name: formData.name,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      password: formData.password,
      userType: formData.userType,
      profileType: formData.profileType,
      fcmToken: "test",
    };
    console.log(data);
    try {
      // Send OTP if phone number and email do not exist
      await axios.post(`${url}user/signup/sendotp`, data);
      alert("OTP sent successfully!");
      setInputOtp(true);
    } catch (e) {
      let err = "";
      if (!e.response?.data?.success) {
        if (e.response?.data?.message) {
          err += e.response?.data?.message;
        }
        if (e.response?.data?.errors) {
          err += e.response?.data?.errors.toString();
        }
        alert(err);
      } else {
        alert("Some thing went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  // const onFormSubmit = async () => {
  //   setLoading(true);
  //   try {
  //     await axios.post(url + "user/signup", formData);
  // alert("Account Created Successfully! Please Login.");
  // navigate("/login");
  //   } catch (err) {
  //     const errorMessage =
  //       err.response?.data?.message || "Something went wrong!";
  //     alert(errorMessage);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const onGroupButtonClick = useCallback(() => {
    navigate("/event-listing");
  }, [navigate]);

  return (
    <div
      style={{ width: "100vw" }}
      className={`flex absolute z-50 flex-row items-center justify-center py-0 pt-5 box-border max-w-full text-left text-base text-black font-poppins ${className}`}
    >
      {loading && <Loader />}
      <div className="w-[512px] shadow-[0px_4px_35px_rgba(0,_0,_0,_0.08)] rounded-xl bg-white flex flex-col items-center justify-center py-[10px] pr-5 pl-5 align-items-center box-border gap-[20px] max-w-full z-[6] mq750:gap-[22px] mq1050:pb-[30px] mq1050:box-border mq450:pb-5 mq450:box-border">
        <div className="self-stretch flex flex-row items-center justify-center py-0 pr-px pl-[7px] box-border max-w-full">
          <div className="flex-1 flex flex-col items-center justify-center gap-[10px] max-w-full">
            <div className="self-stretch flex flex-row flex-wrap items-start justify-around">
              <div className="flex-1 flex flex-col items-center justify-start min-w-[165px] shrink-0">
                <div className="self-stretch h-[29.5px] flex justify-center relative w-full pl-10 shrink-0 z-[7]">
                  <span>{`Welcome to `}</span>
                  <span className="text-orangered">Satsang Seva</span>
                </div>
                <h1 className="m-0 relative text-10xl font-inherit pl-10 shrink-0 z-[7] mq1050:text-10xl mq450:text-3xl w-full flex justify-center">
                  Host Sign up
                </h1>
              </div>
              <div className="flex gap-10">
                {/* <div
                onClick={() => navigate("/login")}
                className="cursor-pointer relative text-smi inline-block shrink-0 z-[7] text-gray-200"
              >
                <p className="m-0">Already have an account?</p>
                <p className="m-0 text-cornflowerblue">Log In</p>
              </div> */}
                <div className="w-full flex justify-end">
                  <Link to="/">
                    <IoIosCloseCircleOutline size={30} />
                  </Link>
                </div>
              </div>
            </div>
            <GoogleLogin
              theme="filled_blue"
              text="signup_with"
              shape="pill"
              onSuccess={(credentialResponse) => {
                const decoded = jwtDecode(credentialResponse?.credential);
                // console.log(decoded);
                setFormData({
                  ...formData,
                  email: decoded.email,
                  name: decoded.name,
                });
                setDisabled(true);
                alert("Account Verified! Fill the details and click SignUp.");
                // console.log(decoded.picture);
              }}
              onError={() => {
                console.log("Login Failed");
              }}
            />
          </div>
        </div>
        <Modal show={inputOtp} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>Verify OTP</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <p>
              OTP sent successfully to{" "}
              <span style={{ fontWeight: "bold" }}>
                +91-{formData.phoneNumber}
              </span>
            </p>
            <form>
              <div className="form-group">
                <input
                  value={otp}
                  onChange={(e) => {
                    setOtp(e.target.value);
                  }}
                  type="number"
                  className="form-control"
                  id="otp"
                  placeholder="Enter 6 digit OTP"
                  maxLength="6"
                />
              </div>
            </form>
          </Modal.Body>
          <Modal.Footer>
            <Btn variant="secondary" onClick={handleClose}>
              Cancel
            </Btn>
            <Btn variant="outline-primary" onClick={handleCheckOtp}>
              Verify
            </Btn>
          </Modal.Footer>
        </Modal>
        <form
          onSubmit={handleVerify}
          className="w-[429.7px] flex flex-row items-start justify-start py-0 px-[7px] box-border max-w-full"
        >
          <div className="flex-1 flex flex-col items-start justify-start gap-[14px] max-w-full">
            <div className="flex w-full justify-between">
              {/* <label htmlFor="userType">User Type: </label> */}
              <select
                className="form-control"
                value={formData.userType}
                onChange={onInputChange}
                name="userType"
              >
                <option value="Host&Participant">Host & Participant</option>
                <option value="Participant">Participant</option>
              </select>
            </div>
            <div className="flex w-full gap-2 justify-between items-center">
              {/* <label htmlFor="profileType">Profile: </label> */}
              <select
                className="form-control"
                value={formData.profileType}
                onChange={onInputChange}
                name="profileType"
              >
                <option value="" defaultValue={"select profile type"}>select profile type</option>
                <option value="Artist">Artist</option>
                <option value="Orator">Orator</option>
                <option value="Organizer">Organizer</option>
              </select>
            </div>
            <TextField
              label="Enter your name"
              name="name"
              value={formData.name}
              onChange={onInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              placeholder="Name"
            />
            <TextField
              label="Enter your email address"
              name="email"
              value={formData.email}
              onChange={onInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              placeholder="Email"
              disabled={disabled}
            />
            <TextField
              label="+91 | Enter your phone number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={onInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              placeholder="Contact"
              disabled={inputOtp}
            />
            <TextField
              label="Enter your password"
              name="password"
              value={formData.password}
              onChange={onInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              type="password"
            />
            <TextField
              label="Re-enter your password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={onInputChange}
              fullWidth
              required
              variant="outlined"
              size="small"
              type="password"
            />

            <div className="flex gap-2">
              <span>
                <input
                  type="checkbox"
                  id="terms"
                  name="terms"
                  value="terms"
                  label="terms"
                  required
                />
              </span>
              <p>
                By Signing up I accept the{" "}
                <Link to="/terms">
                  <span>
                    Terms & Conditions<span>*</span>
                  </span>
                </Link>{" "}
              </p>
            </div>
            <Button
              className="w-[414.7px] h-[49.8px] shadow-[0px_4px_19px_rgba(119,_147,_65,_0.3)] max-w-full cursor-pointer z-[7] mq450:pl-5 mq450:pr-5 mq450:box-border"
              variant="contained"
              sx={{
                textTransform: "none",
                color: "#fff",
                fontSize: "16",
                background: "#ff5f17",
                borderRadius: "10px",
                "&:hover": { background: "#ff5f17" },
                width: 414.7,
                height: 49.8,
              }}
              type="submit"
              disabled={loading}
            >
              Sign up
            </Button>
            {error && <div className="text-red-500">{error}</div>}
            <div
              onClick={() => {
                navigate("/login");
              }}
              className="w-full flex cursor-pointer justify-center"
            >
              <p className="m-0">Already have an Account ? </p>
              <p className="m-0 text-cornflowerblue pl-2"> Log In</p>
            </div>
          </div>
        </form>
        {/* {signupData && (
        <div>
          <p>User ID: {signupData.id}</p>
          <p>Created At: {new Date(signupData.createdAt).toLocaleString()}</p>
        </div>
      )} */}
      </div>
    </div>
  );
};

SignUpComponent.propTypes = {
  className: PropTypes.string,
};

export default SignUpComponent;
