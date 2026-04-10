import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";

const S = {
  page: { padding: "28px 32px", background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter',-apple-system,sans-serif" },
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", boxShadow: "0 1px 2px rgba(0,0,0,0.04)", overflow: "hidden" },
  th: { padding: "11px 16px", fontSize: "0.7rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", background: "#f8fafc", borderBottom: "1px solid #e2e8f0", whiteSpace: "nowrap", textAlign: "left" },
  td: { padding: "14px 16px", fontSize: "0.82rem", color: "#334155", borderBottom: "1px solid #f1f5f9", verticalAlign: "middle" },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: "5px", borderRadius: 6, display: "inline-flex", alignItems: "center", color: "#94a3b8", transition: "all 0.15s" },
};

const Blog = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await axios.get(`${url}blogs`, { headers });
        setBlogs(res.data.data || res.data.blogs || []);
      } catch (e) {
        toast(e.response?.data?.message || e.message, "error");
      } finally { setLoading(false); }
    };
    fetchBlogs();
  }, []);

  const handleDelete = async (id) => {
    const ok = await confirmDialog("Delete this blog? This action is irreversible.");
    if (!ok) return;
    try {
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.delete(`${url}blogs/${id}`, { headers });
      setBlogs(blogs.filter(b => b._id !== id));
      toast("Blog deleted successfully", "success");
    } catch (e) {
      toast(e.response?.data?.message || e.message, "error");
    }
  };

  return (
    <div style={S.page}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ margin: "0 0 4px", fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.3px" }}>Blogs</h1>
          <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>{blogs.length} published posts</p>
        </div>
        <button onClick={() => navigate("/admin/createblog")}
          style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: "#D26600", color: "#fff", fontWeight: 600, fontSize: "0.82rem", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 2px 8px rgba(210,102,0,0.25)", transition: "background 0.15s" }}
          onMouseEnter={e => e.currentTarget.style.background = "#b85a00"}
          onMouseLeave={e => e.currentTarget.style.background = "#D26600"}>
          + New Blog Post
        </button>
      </div>

      <div style={S.card}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", color: "#94a3b8", fontSize: "0.875rem" }}>Loading blogs...</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["ID", "Title", "Preview", "Published", "Actions"].map(h => (
                    <th key={h} style={S.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {blogs.length === 0 ? (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", padding: 40, color: "#94a3b8" }}>No blog posts yet</td></tr>
                ) : blogs.map(blog => (
                  <tr key={blog._id}
                    onMouseEnter={e => e.currentTarget.style.background = "#fafafa"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    style={{ transition: "background 0.12s" }}>
                    <td style={S.td}>
                      <span onClick={() => navigator.clipboard.writeText(blog._id)} title="Copy ID"
                        style={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#94a3b8", cursor: "pointer" }}>
                        ...{blog._id?.slice(-6)}
                      </span>
                    </td>
                    <td style={{ ...S.td, maxWidth: 220 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        {blog.images?.[0] ? (
                          <img src={blog.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
                            onError={e => { e.target.style.display = "none"; }} />
                        ) : (
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#f1f5f9", flexShrink: 0 }} />
                        )}
                        <span style={{ fontWeight: 600, color: "#0f172a", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {blog.title || "—"}
                        </span>
                      </div>
                    </td>
                    <td style={{ ...S.td, maxWidth: 300, color: "#64748b" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>
                        {blog.content ? blog.content.substring(0, 80) + "..." : "—"}
                      </span>
                    </td>
                    <td style={S.td}>{blog.createdAt ? dayjs(blog.createdAt).format("DD MMM YYYY") : "—"}</td>
                    <td style={S.td}>
                      <div style={{ display: "flex", gap: 4 }}>
                        <button style={S.iconBtn} title="View"
                          onClick={() => window.open(`${process.env.REACT_APP_FRONTEND}/blog?q=${blog._id}`, "_blank")}
                          onMouseEnter={e => e.currentTarget.style.color = "#2563eb"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                        </button>
                        <button style={S.iconBtn} title="Delete"
                          onClick={() => handleDelete(blog._id)}
                          onMouseEnter={e => e.currentTarget.style.color = "#ef4444"}
                          onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}>
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Blog;
