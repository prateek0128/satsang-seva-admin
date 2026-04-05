import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Csss/AdminLogin.css';
import { toast } from '../components/Popup';

const AdminLogin = ({ setAdmin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = localStorage.getItem("admin");
    if (token && admin) {
      try {
        const parsed = JSON.parse(admin);
        if (parsed?.designation === "admin") navigate("/admin/dashboard");
      } catch {}
    }
  }, [navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(`${url}admin/login`, { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      setAdmin(data.admin);
      toast("Logged in successfully!", "success");
      navigate("/admin/dashboard");
    } catch (err) {
      toast(err.response?.data?.message || "Something went wrong. Please try again later.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleLogin}>
        <h2 className="text-center"><span className="text-tomato"> Admin </span>Login</h2>
        <div>
          <label className="form-label" htmlFor="email">Email:</label>
          <input className="form-control" id="email" type="email" placeholder="Admin Email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
        </div>
        <div>
          <label className="form-label" htmlFor="password">Password:</label>
          <input className="form-control" id="password" type="password" placeholder="Admin Password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        <button type="submit" disabled={loading}>{loading ? "Logging in..." : "Login"}</button>
        <p className="text-center mt-3" style={{ fontSize: "0.9rem" }}>
          No account? <Link to="/admin/signup">Create Admin</Link>
        </p>
      </form>
    </div>
  );
};

export default AdminLogin;
