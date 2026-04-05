import React, { useState } from "react";
import { signInWithGoogle } from "../service/authService";
import google_icon from "../img/google.svg";

const GoogleSignInButton = ({ onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      const userData = await signInWithGoogle();
      if (onSuccess) onSuccess(userData);
    } catch (error) {
      if (onError) onError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSignIn}
      disabled={loading}
      className="google-signin-button"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "10px 16px",
        backgroundColor: "white",
        color: "#757575",
        border: "1px solid #ddd",
        borderRadius: "4px",
        fontWeight: 500,
        cursor: loading ? "default" : "pointer",
        width: "240px",
        opacity: loading ? 0.7 : 1,
      }}
    >
      {loading ? (
        "Signing in..."
      ) : (
        <>
          <img
            src={google_icon}
            alt="Google logo"
            style={{ marginRight: "10px" }}
          />
          Sign in with Google
        </>
      )}
    </button>
  );
};

export default GoogleSignInButton;
