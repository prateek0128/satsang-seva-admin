import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { toast, confirmDialog } from "../components/Popup";
import {
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, Chip, Tooltip, IconButton, Box, Typography, TablePagination,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/VisibilityRounded";
import EditIcon from "@mui/icons-material/EditRounded";
import DeleteIcon from "@mui/icons-material/DeleteRounded";
import AddIcon from "@mui/icons-material/AddRounded";
import { useSortable, SortCell, PlainCell } from "./sortable";

const cellSx = { fontSize: "0.82rem", color: "#334155", py: 1.5, px: 2 };

const PAGE_SIZE = 15;

const Blog = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const { sorted, orderBy, order, handleSort } = useSortable(blogs, "createdAt", "desc");

  useEffect(() => {
    const token = localStorage.getItem("token");
    axios.get(`${url}blogs`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setBlogs(r.data.data || r.data.blogs || []))
      .catch(e => toast(e.response?.data?.message || e.message, "error"))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!await confirmDialog("Delete this blog? This action is irreversible.")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${url}blogs/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setBlogs(b => b.filter(x => x._id !== id));
      toast("Blog deleted", "success");
    } catch (e) { toast(e.response?.data?.message || e.message, "error"); }
  };

  return (
    <Box sx={{ p: "28px 32px", minHeight: "100vh", background: "linear-gradient(145deg,#fff8f2 0%,#fff3e6 30%,#fef9f5 60%,#fff0e0 100%)", fontFamily: "var(--font-admin)" }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
        <Box>
          <Typography sx={{ fontSize: "1.4rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.04em", fontFamily: "var(--font-admin)" }}>Blogs</Typography>
          <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8", mt: 0.3 }}>{blogs.length} published posts</Typography>
        </Box>
        <button onClick={() => navigate("/admin/createblog")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 20px", borderRadius: 10, border: "none", background: "linear-gradient(135deg,#D26600,#f58021,#ffa726)", color: "#fff", fontWeight: 700, fontSize: "0.84rem", cursor: "pointer", fontFamily: "var(--font-admin)", boxShadow: "0 4px 18px rgba(245,128,33,0.35)" }}>
          <AddIcon style={{ fontSize: 18 }} /> New Blog Post
        </button>
      </Box>

      <Paper elevation={0} sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: "calc(100vh - 320px)", overflowX: "auto" }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <SortCell label="ID"        field="blogId"     orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Title"     field="title"      orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Preview" />
                <SortCell label="Shared By" field="uploadedBy" orderBy={orderBy} order={order} onSort={handleSort} />
                <SortCell label="Published" field="createdAt"  orderBy={orderBy} order={order} onSort={handleSort} />
                <PlainCell label="Actions" />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>Loading blogs…</TableCell></TableRow>
              ) : blogs.length === 0 ? (
                <TableRow><TableCell colSpan={6} sx={{ textAlign: "center", py: 6, color: "#94a3b8" }}>No blog posts yet</TableCell></TableRow>
              ) : sorted.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(blog => (
                <TableRow key={blog._id} hover sx={{ "&:hover": { background: "#fafbff" } }}>
                  <TableCell sx={cellSx}>
                    <Tooltip title="Click to copy" arrow>
                      <Box component="span" onClick={() => { navigator.clipboard.writeText(blog.blogId || blog._id || ""); toast("Blog ID copied", "success"); }}
                        sx={{ fontFamily: "monospace", fontSize: "0.72rem", color: "#64748b", fontWeight: 700, cursor: "pointer", px: 1, py: 0.3, borderRadius: "6px", background: "#f8fafc", border: "1px solid #e2e8f0", display: "inline-block", "&:hover": { background: "#f1f5f9", color: "#334155" }, transition: "all 0.15s" }}>
                        {blog.blogId || blog._id || "—"}
                      </Box>
                    </Tooltip>
                  </TableCell>
                  <TableCell sx={{ ...cellSx, maxWidth: 220 }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                      {blog.images?.[0] ? (
                        <img src={blog.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 8, objectFit: "cover", flexShrink: 0 }} onError={e => e.target.style.display = "none"} />
                      ) : (
                        <Box sx={{ width: 36, height: 36, borderRadius: "8px", background: "#f1f5f9", flexShrink: 0 }} />
                      )}
                      <Typography sx={{ fontWeight: 600, color: "#0f172a", fontSize: "0.82rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{blog.title || "—"}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ ...cellSx, maxWidth: 300, color: "#64748b" }}>
                    <Typography sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: "0.82rem", color: "#64748b" }}>
                      {blog.content ? blog.content.substring(0, 80) + "…" : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell sx={cellSx}><Typography sx={{ fontSize: "0.82rem", fontWeight: blog.uploadedBy ? 600 : 400, color: blog.uploadedBy ? "#334155" : "#94a3b8" }}>{blog.uploadedBy || "—"}</Typography></TableCell>
                  <TableCell sx={cellSx}>{blog.createdAt ? dayjs(blog.createdAt).format("DD MMM YYYY") : "—"}</TableCell>
                  <TableCell sx={cellSx}>
                    <Box sx={{ display: "flex", gap: 0.6 }}>
                      <Tooltip title="Edit"><IconButton size="small" onClick={() => navigate(`/admin/editblog/${blog._id}`)} sx={{ background: "#f0fdf4", color: "#16a34a", borderRadius: "8px", "&:hover": { background: "#dcfce7" } }}><EditIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      <Tooltip title="View"><IconButton size="small" onClick={() => navigate(`/admin/viewblog/${blog._id}`)} sx={{ background: "#eff6ff", color: "#2563eb", borderRadius: "8px", "&:hover": { background: "#dbeafe" } }}><VisibilityIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                      <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDelete(blog._id)} sx={{ background: "#fef2f2", color: "#dc2626", borderRadius: "8px", "&:hover": { background: "#fee2e2" } }}><DeleteIcon sx={{ fontSize: 15 }} /></IconButton></Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ borderTop: "1px solid #f1f5f9", display: "flex", alignItems: "center", justifyContent: "space-between", px: 2, flexWrap: "wrap" }}>
          <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", py: 1 }}>Showing {Math.min(page * rowsPerPage + 1, sorted.length)}–{Math.min((page + 1) * rowsPerPage, sorted.length)} of {sorted.length}</Typography>
          <TablePagination component="div" count={sorted.length} page={page} onPageChange={(_, p) => setPage(p)} rowsPerPage={rowsPerPage} onRowsPerPageChange={e => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }} rowsPerPageOptions={[10, 25, 50]} sx={{ border: "none", "& .MuiTablePagination-toolbar": { px: 0 }, "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": { fontSize: "0.78rem", color: "#64748b" } }} />
        </Box>
      </Paper>
    </Box>
  );
};

export default Blog;
