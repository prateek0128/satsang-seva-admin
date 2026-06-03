import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "../components/Popup";

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
    } finally { setLoading(false); }
  };

  return (
    <>
      <style>{`
        @keyframes loginFadeUp { from{opacity:0;transform:translateY(32px)}to{opacity:1;transform:translateY(0)} }
        @keyframes loginSpin   { to{transform:rotate(360deg)} }
        @keyframes loginOrb1   { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(30px,-20px) scale(1.1)} }
        @keyframes loginOrb2   { 0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-20px,30px) scale(0.95)} }
        @keyframes loginOrb3   { 0%,100%{transform:translate(0,0)}50%{transform:translate(20px,15px)} }
        @keyframes loginShine  { 0%{left:-100%}100%{left:200%} }

        .login-root {
          min-height: 100vh;
          display: flex;
          font-family: 'Plus Jakarta Sans','Inter',-apple-system,sans-serif;
          overflow: hidden;
        }

        /* ── Left panel ── */
        .login-left {
          flex: 1.1;
          background: linear-gradient(145deg, #0a0f1e 0%, #0f172a 40%, #1a0a00 100%);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          padding: 64px 72px;
          position: relative;
          overflow: hidden;
        }
        .login-left::before {
          content:'';
          position:absolute;
          inset:0;
          background: radial-gradient(ellipse at 20% 50%, rgba(210,102,0,0.18) 0%, transparent 60%),
                      radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.12) 0%, transparent 55%);
          pointer-events:none;
        }
        .l-orb { position:absolute; border-radius:50%; filter:blur(70px); pointer-events:none; }
        .l-orb1 { width:320px;height:320px;background:rgba(210,102,0,0.22);top:-60px;left:-80px;animation:loginOrb1 8s ease-in-out infinite; }
        .l-orb2 { width:260px;height:260px;background:rgba(99,102,241,0.15);bottom:-40px;right:-60px;animation:loginOrb2 10s ease-in-out infinite; }
        .l-orb3 { width:180px;height:180px;background:rgba(245,158,11,0.12);top:50%;left:50%;margin:-90px 0 0 -90px;animation:loginOrb3 6s ease-in-out infinite; }

        .l-logo-wrap {
          display:flex;align-items:center;gap:14px;margin-bottom:52px;position:relative;z-index:1;
        }
        .l-logo-icon {
          width:52px;height:52px;border-radius:16px;
          background:linear-gradient(135deg,#D26600,#f59e0b);
          display:flex;align-items:center;justify-content:center;
          font-size:1.5rem;font-weight:900;color:#fff;letter-spacing:-1px;
          box-shadow:0 8px 24px rgba(210,102,0,0.45),inset 0 1px 0 rgba(255,255,255,0.25);
        }
        .l-logo-text { color:#fff;font-size:1.25rem;font-weight:800;letter-spacing:-0.5px; }
        .l-logo-sub  { color:rgba(255,255,255,0.4);font-size:0.65rem;font-weight:700;text-transform:uppercase;letter-spacing:0.14em;margin-top:2px; }

        .l-headline {
          position:relative;z-index:1;
          font-size:2.8rem;font-weight:900;line-height:1.1;letter-spacing:-0.05em;
          color:#fff;margin-bottom:20px;
        }
        .l-headline span {
          background:linear-gradient(135deg,#f59e0b,#D26600);
          -webkit-background-clip:text;-webkit-text-fill-color:transparent;
        }
        .l-desc {
          position:relative;z-index:1;
          color:rgba(255,255,255,0.5);font-size:1rem;line-height:1.7;max-width:380px;margin-bottom:52px;
        }
        .l-pills { display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1; }
        .l-pill {
          display:flex;align-items:center;gap:7px;
          background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);
          border-radius:999px;padding:7px 16px;
          font-size:0.78rem;font-weight:600;color:rgba(255,255,255,0.7);
        }
        .l-pill-dot { width:7px;height:7px;border-radius:50%;background:#4ade80;box-shadow:0 0 8px #4ade80; }

        /* ── Right panel ── */
        .login-right {
          flex:0.9;
          background:#fff;
          display:flex;flex-direction:column;justify-content:center;align-items:center;
          padding:48px 56px;
          position:relative;overflow:hidden;
        }
        .login-right::before {
          content:'';position:absolute;top:0;left:0;right:0;height:3px;
          background:linear-gradient(90deg,#D26600,#f59e0b,#D26600);
          background-size:200% 100%;
        }
        .r-bg-dot {
          position:absolute;width:400px;height:400px;border-radius:50%;
          background:radial-gradient(circle,rgba(210,102,0,0.04) 0%,transparent 70%);
          bottom:-100px;right:-100px;pointer-events:none;
        }

        .r-card { width:100%;max-width:400px;position:relative;z-index:1;animation:loginFadeUp 0.5s cubic-bezier(.16,1,.3,1) both; }

        .r-welcome { font-size:1.75rem;font-weight:900;color:#0f172a;letter-spacing:-0.05em;margin-bottom:6px; }
        .r-sub { font-size:0.875rem;color:#94a3b8;font-weight:500;margin-bottom:36px; }

        .r-field { margin-bottom:18px; }
        .r-label { display:block;font-size:0.75rem;font-weight:700;color:#475569;margin-bottom:7px;letter-spacing:0.03em;text-transform:uppercase; }
        .r-input-wrap {
          display:flex;align-items:center;
          border:2px solid #e2e8f0;border-radius:12px;
          background:#f8fafc;transition:all 0.2s;overflow:hidden;
        }
        .r-input-wrap.focused { border-color:#D26600;background:#fff;box-shadow:0 0 0 4px rgba(210,102,0,0.1); }
        .r-icon { padding:0 14px;color:#94a3b8;display:flex;align-items:center;flex-shrink:0; }
        .r-input-wrap.focused .r-icon { color:#D26600; }
        .r-input { flex:1;padding:13px 12px 13px 0;border:none;background:transparent;font-size:0.9rem;color:#0f172a;outline:none;font-family:inherit; }
        .r-input::placeholder { color:#cbd5e1; }
        .r-eye { padding:0 14px;background:none;border:none;cursor:pointer;color:#94a3b8;display:flex;align-items:center;transition:color 0.18s; }
        .r-eye:hover { color:#D26600; }

        .r-row { display:flex;align-items:center;justify-content:space-between;margin:4px 0 24px; }
        .r-remember { display:flex;align-items:center;gap:8px;cursor:pointer;font-size:0.82rem;color:#64748b;font-weight:500;user-select:none; }
        .r-remember input { width:16px;height:16px;accent-color:#D26600;cursor:pointer;border-radius:4px; }
        .r-forgot { font-size:0.82rem;color:#D26600;font-weight:700;text-decoration:none;transition:opacity 0.18s; }
        .r-forgot:hover { opacity:0.75; }

        .r-btn {
          width:100%;padding:14px;border-radius:12px;border:none;
          background:linear-gradient(135deg,#D26600,#f59e0b);
          color:#fff;font-weight:800;font-size:0.95rem;
          cursor:pointer;transition:all 0.22s;font-family:inherit;letter-spacing:0.01em;
          box-shadow:0 6px 20px rgba(210,102,0,0.35);
          position:relative;overflow:hidden;
        }
        .r-btn::after {
          content:'';position:absolute;top:0;left:-100%;width:60%;height:100%;
          background:linear-gradient(90deg,transparent,rgba(255,255,255,0.18),transparent);
          transition:none;
        }
        .r-btn:hover:not(:disabled) { transform:translateY(-2px);box-shadow:0 10px 30px rgba(210,102,0,0.45); }
        .r-btn:hover:not(:disabled)::after { animation:loginShine 0.6s ease forwards; }
        .r-btn:active:not(:disabled) { transform:translateY(0); }
        .r-btn:disabled { background:#e2e8f0;color:#94a3b8;cursor:not-allowed;box-shadow:none; }
        .r-btn-inner { display:flex;align-items:center;justify-content:center;gap:8px;position:relative;z-index:1; }

        .r-divider { display:flex;align-items:center;gap:12px;margin:24px 0;color:#cbd5e1;font-size:0.75rem;font-weight:600; }
        .r-divider::before,.r-divider::after { content:'';flex:1;height:1.5px;background:#f1f5f9; }

        .r-footer { text-align:center;font-size:0.83rem;color:#94a3b8;margin-top:20px; }
        .r-footer a { color:#D26600;font-weight:700;text-decoration:none; }
        .r-footer a:hover { text-decoration:underline; }

        .r-spinner { width:17px;height:17px;border:2.5px solid rgba(255,255,255,0.35);border-top-color:#fff;border-radius:50%;animation:loginSpin 0.7s linear infinite;display:inline-block; }

        @media(max-width:900px){
          .login-left{display:none;}
          .login-right{flex:1;padding:40px 28px;}
        }
      `}</style>

      <div className="login-root">
        {/* Left decorative panel */}
        <div className="login-left">
          <div className="l-orb l-orb1" /><div className="l-orb l-orb2" /><div className="l-orb l-orb3" />
          <div className="l-logo-wrap">
            <div className="l-logo-icon">🕉</div>
            <div>
              <div className="l-logo-text">SatsangSeva</div>
              <div className="l-logo-sub">Admin Portal</div>
            </div>
          </div>
          <h1 className="l-headline">Manage your<br /><span>spiritual platform</span><br />with ease.</h1>
          <p className="l-desc">A complete admin suite to oversee events, users, bookings, and content — all in one powerful dashboard.</p>
          <div className="l-pills">
            <div className="l-pill"><span className="l-pill-dot" />Live Platform</div>
            <div className="l-pill"><span style={{width:7,height:7,borderRadius:'50%',background:'#60a5fa',boxShadow:'0 0 8px #60a5fa',display:'inline-block'}} />Secure Access</div>
            <div className="l-pill"><span style={{width:7,height:7,borderRadius:'50%',background:'#a78bfa',boxShadow:'0 0 8px #a78bfa',display:'inline-block'}} />Real-time Data</div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="login-right">
          <div className="r-bg-dot" />
          <div className="r-card">
            <h1 className="r-welcome">Welcome back 👋</h1>
            <p className="r-sub">Sign in to your admin account</p>

            <form onSubmit={handleLogin}>
              <div className="r-field">
                <label className="r-label">Email Address</label>
                <div className={`r-input-wrap${emailFocus ? " focused" : ""}`}>
                  <span className="r-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input className="r-input" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@satsangseva.com" required autoComplete="username" onFocus={() => setEmailFocus(true)} onBlur={() => setEmailFocus(false)} />
                </div>
              </div>

              <div className="r-field">
                <label className="r-label">Password</label>
                <div className={`r-input-wrap${passFocus ? " focused" : ""}`}>
                  <span className="r-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input className="r-input" type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required autoComplete="current-password" onFocus={() => setPassFocus(true)} onBlur={() => setPassFocus(false)} />
                  <button type="button" className="r-eye" onClick={() => setShowPass(!showPass)}>
                    {showPass
                      ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>}
                  </button>
                </div>
              </div>

              <div className="r-row">
                <label className="r-remember">
                  <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <Link to="/admin" className="r-forgot">Forgot password?</Link>
              </div>

              <button className="r-btn" type="submit" disabled={loading}>
                <div className="r-btn-inner">
                  {loading && <span className="r-spinner" />}
                  {loading ? "Signing in…" : "Sign In to Dashboard"}
                </div>
              </button>
            </form>

            <div className="r-divider">or</div>
            <div className="r-footer">Don't have an account? <Link to="/admin/signup">Create admin account</Link></div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;
