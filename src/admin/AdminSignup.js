import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import '../Csss/AdminLogin.css';
import { toast } from '../components/Popup';

const AdminSignup = () => {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post(url + "admin/signup", form);
      toast("Admin account created successfully! Please login.", "success");
      navigate("/admin");
    } catch (err) {
      toast(err.response?.data?.message || "Something went wrong. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <form className="admin-login-form" onSubmit={handleSubmit}>
        <h2 className="text-center"><span className="text-tomato">Admin</span> Signup</h2>
        <label htmlFor="name">Name:</label>
        <input id="name" name="name" type="text" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        <label htmlFor="email">Email:</label>
        <input id="email" name="email" type="email" placeholder="Admin Email" value={form.email} onChange={handleChange} required autoComplete="username" />
        <label htmlFor="phone">Phone:</label>
        <input id="phone" name="phone" type="tel" placeholder="10-digit Phone" value={form.phone} onChange={handleChange} pattern="\d{10}" required />
        <label htmlFor="password">Password:</label>
        <input id="password" name="password" type="password" placeholder="Password (min 6 chars)" value={form.password} onChange={handleChange} minLength={6} required autoComplete="new-password" />
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create Admin"}</button>
        <p className="text-center mt-3" style={{ fontSize: "0.9rem" }}>
          Already have an account? <Link to="/admin">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default AdminSignup;
