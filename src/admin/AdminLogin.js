import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from '../components/Popup';

const AdminLogin = ({ setAdmin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [emailFocus, setEmailFocus] = useState(false);
  const [passFocus, setPassFocus] = useState(false);
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const admin = JSON.parse(localStorage.getItem("admin") || "null");
    if (token && admin?.designation === "admin") navigate("/admin/dashboard");
    const saved = localStorage.getItem("admin_email");
    if (saved) { setEmail(saved); setRemember(true); }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await axios.post(url + "admin/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));
      if (remember) localStorage.setItem("admin_email", email);
      else localStorage.removeItem("admin_email");
      setAdmin(data.admin);
      toast("Welcome back!", "success");
      navigate("/admin/dashboard");
    } catch (err) {
      toast(err.response?.data?.message || "Invalid credentials. Please try again.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:translateY(0)} }
        @keyframes spin     { to{transform:rotate(360deg)} }
        @keyframes float    { 0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)} }
        @keyframes pulse    { 0%,100%{opacity:0.6;transform:scale(1)}50%{opacity:1;transform:scale(1.05)} }

        .al-page {
          min-height: 100vh;
          background: url('https://images.unsplash.com/photo-1545389336-cf090694435e?w=1920&q=80') center center / cover no-repeat fixed;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
        }
        .al-page::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.55);
          backdrop-filter: blur(2px);
          z-index: 0;
        }

        /* Soft background shapes */
        .al-shape {
          position: absolute;
          border-radius: 50%;
          filter: blur(60px);
          pointer-events: none;
          z-index: 0;
        }

        .al-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 440px;
          background: rgba(15, 10, 5, 0.75);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow:
            0 0 0 1px rgba(210,102,0,0.25),
            0 8px 32px rgba(0,0,0,0.5),
            0 32px 64px rgba(0,0,0,0.4);
          animation: fadeUp 0.45s cubic-bezier(.16,1,.3,1) forwards;
        }

        .al-brand {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 28px;
        }
        .al-logo {
          width: 40px; height: 40px;
          background: linear-gradient(135deg, #D26600, #f59e0b);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          box-shadow: 0 4px 12px rgba(210,102,0,0.3);
          flex-shrink: 0;
        }
        .al-brand-name { font-size:1rem; font-weight:700; color:#fff; letter-spacing:-0.3px; }
        .al-brand-sub  { font-size:0.7rem; color:rgba(255,255,255,0.45); font-weight:500; letter-spacing:0.05em; text-transform:uppercase; }
        .al-heading { font-size:1.5rem; font-weight:800; color:#fff; letter-spacing:-0.5px; margin-bottom:4px; }
        .al-subtext { font-size:0.875rem; color:rgba(255,255,255,0.5); margin-bottom:28px; }

        .al-field { margin-bottom: 16px; }
        .al-label { display:block; font-size:0.78rem; font-weight:600; color:rgba(255,255,255,0.7); margin-bottom:6px; }
        .al-input-wrap {
          position:relative; display:flex; align-items:center;
          border:1.5px solid rgba(255,255,255,0.12);
          border-radius:10px; background:rgba(255,255,255,0.07);
          transition:all 0.18s; overflow:hidden;
        }
        .al-input-wrap.focused { border-color:#D26600; background:rgba(255,255,255,0.1); box-shadow:0 0 0 3px rgba(210,102,0,0.2); }
        .al-icon { padding:0 12px 0 14px; color:rgba(255,255,255,0.3); display:flex; align-items:center; flex-shrink:0; }
        .al-input-wrap.focused .al-icon { color:#D26600; }
        .al-input { flex:1; padding:12px 12px 12px 0; border:none; background:transparent; font-size:0.9rem; color:#fff; outline:none; font-family:inherit; width:100%; }
        .al-input::placeholder { color:rgba(255,255,255,0.25); }
        .al-eye { padding:0 14px; background:none; border:none; cursor:pointer; color:rgba(255,255,255,0.3); display:flex; align-items:center; transition:color 0.18s; flex-shrink:0; }
        .al-eye:hover { color:#D26600; }

        .al-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
          margin-top: 4px;
        }
        .al-remember { display:flex; align-items:center; gap:7px; cursor:pointer; font-size:0.8rem; color:rgba(255,255,255,0.6); font-weight:500; user-select:none; }
        .al-remember input[type=checkbox] { width:15px; height:15px; accent-color:#D26600; cursor:pointer; }
        .al-forgot { font-size:0.8rem; color:#f59e0b; font-weight:600; text-decoration:none; transition:opacity 0.18s; }
        .al-forgot:hover { opacity:0.75; }

        .al-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #D26600, #f59e0b);
          color: #fff;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.2s;
          font-family: inherit;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(210,102,0,0.35);
          position: relative;
          overflow: hidden;
        }
        .al-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, #bf5e00, #d97706);
          opacity: 0;
          transition: opacity 0.2s;
        }
        .al-btn:hover:not(:disabled)::before { opacity: 1; }
        .al-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(210,102,0,0.4); }
        .al-btn:active:not(:disabled) { transform: translateY(0); }
        .al-btn:disabled { background: #e2e8f0; color: #a0aec0; cursor: not-allowed; box-shadow: none; transform: none; }
        .al-btn span { position: relative; z-index: 1; display: flex; align-items: center; justify-content: center; gap: 8px; }

        .al-divider { display:flex; align-items:center; gap:12px; margin:22px 0; color:rgba(255,255,255,0.25); font-size:0.75rem; font-weight:500; }
        .al-divider::before, .al-divider::after { content:''; flex:1; height:1px; background:rgba(255,255,255,0.1); }
        .al-footer { text-align:center; font-size:0.82rem; color:rgba(255,255,255,0.4); margin-top:20px; }
        .al-footer a { color:#f59e0b; font-weight:600; text-decoration:none; }
        .al-footer a:hover { text-decoration:underline; }

        .al-spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          display: inline-block;
        }

        @media (max-width: 480px) {
          .al-card { padding: 28px 20px; }
        }
      `}</style>

      <div className="al-page">
        <div className="al-card">
          {/* Brand */}
          <div className="al-brand">
            <div className="al-logo">🙏</div>
            <div>
              <div className="al-brand-name">SatsangSeva</div>
              <div className="al-brand-sub">Admin Portal</div>
            </div>
          </div>

          {/* Heading */}
          <h1 className="al-heading">Welcome Back</h1>
          <p className="al-subtext">Sign in to manage your platform</p>

          <form onSubmit={handleLogin}>
            {/* Email */}
            <div className="al-field">
              <label className="al-label">Email Address</label>
              <div className={`al-input-wrap ${emailFocus ? "focused" : ""}`}>
                <span className="al-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <input className="al-input" type="email" value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="admin@satsangseva.com" required autoComplete="username"
                  onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)} />
              </div>
            </div>

            {/* Password */}
            <div className="al-field">
              <label className="al-label">Password</label>
              <div className={`al-input-wrap ${passFocus ? "focused" : ""}`}>
                <span className="al-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </span>
                <input className="al-input" type={showPass ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Enter your password"
                  required autoComplete="current-password"
                  onFocus={() => setPassFocus(true)} onBlur={() => setPassFocus(false)} />
                <button type="button" className="al-eye" onClick={() => setShowPass(!showPass)}>
                  {showPass ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                      <line x1="1" y1="1" x2="23" y2="23"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember + Forgot */}
            <div className="al-row">
              <label className="al-remember">
                <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                Remember me
              </label>
              <Link to="/admin" className="al-forgot">Forgot password?</Link>
            </div>

            {/* Submit */}
            <button className="al-btn" type="submit" disabled={loading}>
              <span>
                {loading && <span className="al-spinner" />}
                {loading ? "Signing in..." : "Sign In"}
              </span>
            </button>
          </form>

          {/* Divider */}
          <div className="al-divider">or continue with</div>

          {/* Signup */}
          <div className="al-footer">
            Don't have an account?{" "}
            <Link to="/admin/signup">Create admin</Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
