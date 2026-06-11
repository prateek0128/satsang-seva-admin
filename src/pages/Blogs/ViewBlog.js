import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import Loader from "../../components/Loader";
import { toast } from "../../components/Popup";
import usePermission from "../../hooks/usePermission";

const ViewBlog = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const url = process.env.REACT_APP_BACKEND;
  const { can } = usePermission();
  const canEdit = can("blog", "edit");
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${url}admin/blog/${id}`, { headers });
        setBlog(res.data.data);
      } catch (err) {
        toast("Failed to load blog", "error");
        navigate("/admin/blog");
      } finally {
        setLoading(false);
      }
    };
    fetchBlog();
  }, [id, url]);

  if (loading) return <Loader />;
  if (!blog) return null;

  const coverImage = blog.images?.[0];
  const galleryImages = blog.images?.slice(1) || [];

  return (
    <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter',-apple-system,sans-serif" }}>

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 9999,
          display: "flex", alignItems: "center", justifyContent: "center", padding: "20px",
        }}>
          <img src={lightbox} alt="" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: "12px", objectFit: "contain" }} />
          <button onClick={() => setLightbox(null)} style={{
            position: "absolute", top: 20, right: 24, background: "rgba(255,255,255,0.15)",
            border: "none", color: "#fff", fontSize: "1.5rem", cursor: "pointer",
            width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>
        </div>
      )}

      {/* Top Bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", padding: "14px 32px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => navigate("/admin/blog")} style={{
          background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center",
          gap: "8px", fontSize: "0.85rem", fontWeight: 600, color: "#64748b", padding: 0,
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
          All Blogs
        </button>
        {canEdit && (
          <button onClick={() => navigate(`/admin/editblog/${id}`)} style={{
            background: "linear-gradient(135deg,#D26600,#ea580c)", color: "#fff", border: "none",
            borderRadius: "8px", padding: "9px 20px", fontWeight: 700, fontSize: "0.85rem",
            cursor: "pointer", display: "flex", alignItems: "center", gap: "7px",
            boxShadow: "0 3px 10px rgba(210,102,0,0.3)",
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
            Edit Blog
          </button>
        )}
      </div>

      {/* Cover Image Banner */}
      {coverImage && (
        <div style={{ width: "100%", height: "420px", overflow: "hidden", position: "relative", cursor: "pointer" }} onClick={() => setLightbox(coverImage)}>
          <img src={coverImage} alt={blog.title} style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={(e) => { e.target.parentElement.style.display = "none"; }} />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.65) 100%)",
          }} />
          <div style={{ position: "absolute", bottom: 32, left: 0, right: 0, padding: "0 40px" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "6px",
              background: "rgba(210,102,0,0.9)", color: "#fff", borderRadius: "999px",
              padding: "4px 14px", fontSize: "0.7rem", fontWeight: 700,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px",
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="10"/></svg>
              Blog Post
            </div>
            <h1 style={{ margin: 0, fontSize: "2.2rem", fontWeight: 800, color: "#fff", lineHeight: 1.2, letterSpacing: "-0.4px", textShadow: "0 2px 8px rgba(0,0,0,0.3)" }}>
              {blog.title}
            </h1>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "36px 24px" }}>

        {/* Meta Bar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "#fff", borderRadius: "12px", border: "1px solid #e2e8f0",
          padding: "16px 24px", marginBottom: "28px", flexWrap: "wrap", gap: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
            {blog.uploadedBy && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "linear-gradient(135deg,#D26600,#ea580c)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "0.95rem" }}>
                  {blog.uploadedBy[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 600 }}>Published by</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>{blog.uploadedBy}</div>
                </div>
              </div>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#64748b", fontSize: "0.85rem" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              <span style={{ fontWeight: 600 }}>{dayjs(blog.createdAt).format("MMMM D, YYYY")}</span>
            </div>
            {blog.updatedAt !== blog.createdAt && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#94a3b8", fontSize: "0.82rem" }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
                Updated {dayjs(blog.updatedAt).format("MMM D, YYYY")}
              </div>
            )}
          </div>
          {blog.images?.length > 0 && (
            <div style={{ background: "#fff7ed", color: "#D26600", borderRadius: "8px", padding: "6px 12px", fontSize: "0.78rem", fontWeight: 700, border: "1px solid #ffedd5" }}>
              {blog.images.length} Photo{blog.images.length > 1 ? "s" : ""}
            </div>
          )}
        </div>

        {/* Blog Content */}
        <div style={{
          background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0",
          padding: "36px 40px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: "28px",
        }}>
          {!coverImage && (
            <h1 style={{ margin: "0 0 24px", fontSize: "1.8rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.3, borderBottom: "2px solid #f1f5f9", paddingBottom: "20px" }}>
              {blog.title}
            </h1>
          )}
          <p style={{ margin: 0, fontSize: "1.05rem", color: "#334155", lineHeight: 1.9, whiteSpace: "pre-wrap" }}>
            {blog.content}
          </p>
        </div>

        {/* Gallery */}
        {galleryImages.length > 0 && (
          <div style={{
            background: "#fff", borderRadius: "14px", border: "1px solid #e2e8f0",
            padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D26600" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>Photo Gallery</span>
              <span style={{ fontSize: "0.78rem", color: "#94a3b8", fontWeight: 500 }}>({galleryImages.length} photos)</span>
            </div>
            <div style={{
              display: "grid",
              gridTemplateColumns: galleryImages.length === 1 ? "1fr" : galleryImages.length === 2 ? "1fr 1fr" : "repeat(3, 1fr)",
              gap: "10px",
            }}>
              {galleryImages.map((img, i) => (
                <div key={i} style={{ borderRadius: "10px", overflow: "hidden", cursor: "pointer", position: "relative" }}
                  onClick={() => setLightbox(img)}
                  onMouseEnter={(e) => { e.currentTarget.querySelector("img").style.transform = "scale(1.06)"; e.currentTarget.querySelector(".overlay").style.opacity = "1"; }}
                  onMouseLeave={(e) => { e.currentTarget.querySelector("img").style.transform = "scale(1)"; e.currentTarget.querySelector(".overlay").style.opacity = "0"; }}>
                  <img src={img} alt={`Photo ${i + 1}`} style={{
                    width: "100%", height: galleryImages.length === 1 ? "320px" : "180px",
                    objectFit: "cover", display: "block", transition: "transform 0.3s",
                  }} onError={(e) => { e.target.parentElement.style.display = "none"; }} />
                  <div className="overlay" style={{
                    position: "absolute", inset: 0, background: "rgba(210,102,0,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    opacity: 0, transition: "opacity 0.2s",
                  }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewBlog;
