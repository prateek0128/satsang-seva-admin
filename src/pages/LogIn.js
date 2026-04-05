import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import { Button, TextField } from "@mui/material";
import FirstFold from "../components/FirstFold4";
import { useNavigate } from "react-router-dom";
import Loader from "../components/Loader";

import { Modal, Button as Btn } from "react-bootstrap";
import { IoIosCloseCircleOutline } from "react-icons/io";
import { Link } from "react-router-dom";
import GoogleSignInButton from "../components/GoogleSignInButton";

const LogIn = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [userId, setUserId] = useState(localStorage.getItem("userId"));
  const [loading, setLoading] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    fcmToken: "test",
  });
  const [sendOtp, setSendOtp] = useState(false);
  const [otp, setOtp] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");

  useEffect(() => {
    if (userId) {
      navigate("/profile-page");
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const onNoAccountClick = useCallback(() => {
    navigate("/sign-in");
  }, [navigate]);

  const onGroupButtonClick = useCallback(() => {
    navigate("/profile-page");
  }, [navigate]);

  const handleLogin = async (verified = false) => {
    if (formData.email && formData.password) {
      setLoading(true);
      if (verified) {
        await axios
          .put(url + "user/" + formData.email, formData)
          .then((resp) => {
            console.log("Update Successfull! " + resp.data);
            alert(resp.data.message + "!");
            window.location.reload();
          })
          .catch((e) => {
            alert("Error in Password Reset: " + e.response);
            console.log(e);
            window.location.reload();
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        await axios
          .post(url + "user/login", formData)
          .then((resp) => {
            const token = resp.data.token;
            const userId = resp.data.user?.id;
            setUserId(userId);
            localStorage.setItem("token", token);
            localStorage.setItem("userId", userId);
            alert(resp.data.message + "!");
            window.location.reload();
          })
          .catch((e) => {
            if (e.response) {
              alert(e.response.data.message);
              if (e.response.status === 404) {
                console.log("redirected");
                navigate("/sign-in");
              }
            } else {
              alert(e.message);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      }
    } else {
      alert("Please Enter email & password!");
    }
  };

  const handleClose = () => {
    setFormData({
      email: "",
      password: "",
    });
    setSendOtp(false);
    setOtp("");
    setForgotPassword(false);
  };

  const handleSendOtp = async () => {
    if (formData.email) {
      setLoading(true);
      // alert("route is pending to hendle");
      // return;
      const data = { email: formData.email };
      await axios
        .post(url + "user/password-reset/send-otp", data)
        .then((resp) => {
          // console.log(resp);
          setRegisterNumber("resp.data.to");
          setSendOtp(true);
        })
        .catch((e) => {
          console.log(e);
          alert(e.response.data.message);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      alert("Enter Email");
      return;
    }
  };

  const handleCheckOtp = async () => {
    setLoading(true);
    if (otp.length !== 4) {
      alert("OTP is of 4-Digits");
      return setLoading(false);
    }
    if (formData.password.length < 8) {
      alert("Password should be of atleast 8 characters");
      return setLoading(false);
    }
    const data = {
      email: formData.email,
      otp,
      newPassword: formData.password,
    };
    // console.log(data);
    await axios
      .post(url + "user/password-reset/verify", data)
      .then((resp) => {
        // console.log(resp);
        alert("Phone Number Verified Successfully! Reseting Your Password.");
        // handleLogin(true);
        setForgotPassword(false)
      })
      .catch((e) => {
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
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const [error, setError] = useState(null);

  const handleLoginSuccess = (userData) => {
    console.log("User logged in successfully:", userData);
    navigate("/profile-page");
    window.location.reload();
  };

  const handleLoginError = (error) => {
    console.error("Login error:", error);
    setError(error.message || "Failed to sign in with Google");
  };
  return (
    <div
      style={{ marginTop: "-5rem" }}
      className="w-full relative bg-white overflow-hidden flex flex-col items-center justify-center gap-[55px] leading-[normal] tracking-[normal] mq750:gap-[27px]"
    >
      <section className="self-stretch flex flex-col items-center justify-center pt-0 px-0 box-border max-w-full text-left text-[21px] text-black font-poppins">
        {loading && <Loader />}
        <FirstFold iconsxCircle="/iconsxcircle1.svg" />
        <div
          style={{ width: "100vw" }}
          className="absolute flex flex-row items-center justify-center p-0 box-border max-w-full"
        >
          <Modal show={forgotPassword} onHide={handleClose}>
            <Modal.Header closeButton>
              <Modal.Title>Forgot Password</Modal.Title>
            </Modal.Header>
            {!sendOtp && (
              <>
                <Modal.Body>
                  <p>
                    Verification OTP will be sent to your Registered Phone
                    Number
                  </p>
                  <form>
                    <div className="form-group">
                      <label htmlFor="email">Enter Your Email: </label>
                      <input
                        value={formData.email}
                        onChange={(e) => {
                          setFormData({ ...formData, email: e.target.value });
                        }}
                        type="email"
                        className="form-control"
                        id="email"
                        placeholder="Enter Your Email"
                        autoComplete="username"
                        required
                      />
                    </div>
                  </form>
                </Modal.Body>
                <Modal.Footer>
                  <Btn variant="secondary" onClick={handleClose}>
                    Cancel
                  </Btn>
                  <Btn variant="outline-primary" onClick={handleSendOtp}>
                    Send OTP
                  </Btn>
                </Modal.Footer>
              </>
            )}
            {sendOtp && (
              <>
                <Modal.Body>
                  <p>
                    OTP sent successfully to{" "}
                    <span style={{ fontWeight: "bold" }}>
                      +91-{registerNumber}
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
                        placeholder="Enter 4 digit OTP"
                        maxLength="4"
                      />
                      <label className="pt-3" htmlFor="pass">
                        Enter New Password:{" "}
                      </label>
                      <input
                        value={formData.password}
                        onChange={(e) => {
                          setFormData({
                            ...formData,
                            password: e.target.value,
                          });
                        }}
                        type="password"
                        className="form-control"
                        id="pass"
                        placeholder="Reset Password"
                        required
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
              </>
            )}
          </Modal>
          <div className="w-[539px] h-[620px] shadow-[0px_4px_35px_rgba(0,_0,_0,_0.08)] rounded-xl bg-white flex flex-col items-center justify-center pt-[34px] pb-[34px] pr-[43px] pl-11 box-border gap-[20px] max-w-full z-[6] mq750:gap-[19px] mq750:pb-[34px] mq750:pr-[21px] mq750:pl-[22px] mq750:box-border">
            <div className="w-[539px] relative shadow-[0px_4px_35px_rgba(0,_0,_0,_0.08)] rounded-xl bg-white hidden max-w-full" />
            <div className="self-stretch flex flex-col items-start justify-start gap-[22px]">
              <div className="w-full flex justify-end">
                <Link to="/">
                  <IoIosCloseCircleOutline size={30} />
                </Link>
              </div>
              <div className="self-stretch flex flex-col items-center justify-center gap-[15px]">
                <div className="self-stretch flex flex-row items-start justify-between gap-[20px] mq450:flex-wrap">
                  <div className="flex flex-col items-start justify-start gap-[11px]">
                    <div className="relative z-[7] mq450:text-[17px]">
                      <span>{`Welcome to `}</span>
                      <span className="text-orangered">Satsang Seva</span>
                    </div>
                    <h1 className="m-0 relative text-21xl font-medium font-inherit inline-block min-w-[118px] whitespace-nowrap z-[7] mq1050:text-13xl mq450:text-5xl">
                      Log in
                    </h1>
                  </div>
                  <div className="flex flex-col items-start justify-start pt-1.5 px-0 pb-0 text-smi text-gray-200">
                    <div
                      className="relative cursor-pointer z-[7]"
                      onClick={onNoAccountClick}
                    >
                      <p className="m-0">No Account ?</p>
                      <p className="m-0 text-cornflowerblue">Sign up</p>
                    </div>
                  </div>
                </div>
                <div style={{ margin: "30px auto" }}>
                  <GoogleSignInButton
                    onSuccess={handleLoginSuccess}
                    onError={handleLoginError}
                  />
                </div>

                {error && (
                  <div style={{ color: "red", marginTop: "20px" }}>{error}</div>
                )}
              </div>
              <div className="self-stretch h-[92px] flex flex-col items-start justify-start pt-[35px] px-0 pb-0 box-border relative gap-[13px] z-[7] text-base">
                <div className="mt-[-37px] relative shrink-0">
                  Enter your email address
                </div>
                <TextField
                  id="email"
                  className="[border:none] bg-[transparent] self-stretch h-[57px] relative shrink-0"
                  variant="outlined"
                  sx={{
                    "& fieldset": { borderColor: "#2c9cf0" },
                    "& .MuiInputBase-root": {
                      height: "57px",
                      backgroundColor: "#fff",
                      borderRadius: "9px",
                    },
                  }}
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Email address"
                />
              </div>
            </div>
            <div className="self-stretch flex flex-col items-start justify-start pt-0 px-0 pb-1.5 gap-[12px] text-base">
              <div className="self-stretch h-[92px] flex flex-col items-start justify-start pt-[35px] px-0 pb-0 box-border relative gap-[13px] z-[7]">
                <div className="mt-[-37px] relative shrink-0">
                  {"Enter your Password"}
                </div>
                <TextField
                  id="password"
                  className="[border:none] bg-[transparent] self-stretch h-[57px] relative shrink-0"
                  variant="outlined"
                  sx={{
                    "& fieldset": { borderColor: "#adadad" },
                    "& .MuiInputBase-root": {
                      height: "57px",
                      backgroundColor: "#fff",
                      borderRadius: "9px",
                    },
                  }}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder={"Your Password"}
                  type="password"
                />
              </div>
              <div className="self-stretch flex flex-row items-start justify-end text-smi text-cornflowerblue">
                <div
                  onClick={() => {
                    setForgotPassword(true);
                    setFormData({ ...formData, password: "" });
                  }}
                  className="relative cursor-pointer inline-block min-w-[108px] z-[7]"
                >
                  Forgot Password
                </div>
              </div>
            </div>
            <Button
              type="submit"
              className="self-stretch h-[54px] shadow-[0px_4px_19px_rgba(119,_147,_65,_0.3)] cursor-pointer z-[7] mq450:pl-5 mq450:pr-5 mq450:box-border"
              variant="contained"
              sx={{
                textTransform: "none",
                color: "#fff",
                fontSize: "16",
                background: "#ff5f17",
                borderRadius: "10px",
                "&:hover": { background: "#ff5f17" },
                height: 54,
              }}
              onClick={() => {
                handleLogin(false);
              }}
            >
              {"Log in"}
            </Button>
            <div
              onClick={() => {
                navigate("/sign-in");
              }}
              className="flex cursor-pointer"
            >
              <p className="m-0">No Account? &nbsp;</p>
              <p className="m-0 text-cornflowerblue">Sign up</p>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full h-full absolute !m-[0] top-[0px] right-[0px] bottom-[0px] left-[0px] bg-gray-700 z-[5]" />
    </div>
  );
};

export default LogIn;
