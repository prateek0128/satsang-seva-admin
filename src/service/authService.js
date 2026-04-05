// import { signInWithPopup } from "firebase/auth";
const signInWithPopup = () => ({});
import { auth, googleProvider } from "../Controller/firebaseClient";

const API_URL = process.env.REACT_APP_BACKEND || "http://localhost:8080/";

export const signInWithGoogle = async () => {
  alert("Google Sign-in is currently disabled because Firebase is commented out.");
  return { success: false };
  /*
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();

    // Send the Firebase token to your backend
    const response = await fetch(`${API_URL}user/auth/firebase`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "Authentication failed");
    }

    // Store the JWT token in localStorage
    localStorage.setItem("token", data.token);
    localStorage.setItem("userId", data.userId);

    return data;
  } catch (error) {
    // console.error("Google sign-in error:", error);
    throw error;
  }
  */
};

export const logout = () => {
  // return auth.signOut();
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  window.location.reload();
};
