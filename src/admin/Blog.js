import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import View from "@mui/icons-material/VisibilityTwoTone";
import Delete from "@mui/icons-material/DeleteForeverTwoTone";
import Loader from "../components/Loader"; // Assuming you have a Loader component
import dayjs from "dayjs"; // For date formatting
import { toast, confirmDialog } from "../components/Popup";

const Blog = () => {
  const url = process.env.REACT_APP_BACKEND;
  const navigate = useNavigate();

  // State variables
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentBlogId, setCurrentBlogId] = useState(null);

  // Fetch blogs on component mount
  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    setLoading(true);
    try {
      const headers = {
        "Content-Type": "application/json",
      };
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.get(`${url}blogs`, { headers });
      setBlogs(response.data.data || response.data.blogs || []);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      toast("Error fetching blogs: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  // Handle blog creation
  const handleCreateBlog = () => {
    navigate("/admin/createblog");
  };


  // Handle blog deletion
  const handleDelete = async () => {
    try {
      setLoading(true);
      const headers = {
        "Content-Type": "application/json",
      };
      const token = localStorage.getItem("token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await axios.delete(`${url}blogs/${currentBlogId}`, { headers });
      setBlogs(blogs.filter((blog) => blog._id !== currentBlogId));
      toast(response.data.message || "Blog deleted successfully!", "success");
      setShowDeleteDialog(false);
      setCurrentBlogId(null);
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast("Error deleting blog: " + (error.response?.data?.message || error.message), "error");
    } finally {
      setLoading(false);
    }
  };

  // Helper function to copy text to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  };

  return (
    <div className="px-2">
      {loading && <Loader />}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-[#EE7D45]">Blogs</h1>
        <button
          className="bg-[#EE7D45] text-white px-4 py-2 rounded hover:bg-[#D26600] transition-colors"
          onClick={handleCreateBlog}
        >
          Create A New Blog
        </button>
      </div>

      <div className="overflow-x-auto">
        <div className="">
          {/* Header Row */}
          <div className="flex bg-[#EE7D45] text-white font-bold">
            <div className="p-3 w-16 flex-shrink-0">ID</div>
            <div className="p-3 w-64 flex-shrink-0">Title</div>
            <div className="p-3 flex-grow">Content</div>
            <div className="p-3 w-24 flex-shrink-0">Created At</div>
            <div className="p-3 w-24 flex-shrink-0">Actions</div>
          </div>

          {/* Data Rows */}
          {blogs && blogs.length > 0 ? (
            blogs.map((blog) => (
              <div
                key={blog._id}
                className="flex border-b border-gray-200 hover:bg-gray-50 text-gray-700 text-sm"
              >
                <div
                  className="p-3 w-16 flex-shrink-0 cursor-pointer"
                  title="Click to copy ID"
                  onClick={() => copyToClipboard(blog._id)}
                >
                  {blog._id ? `${blog._id.slice(-5)}...` : "--"}
                </div>
                <div
                  className="p-3 w-64 flex-shrink-0 cursor-pointer truncate"
                  title="Click to copy title"
                  onClick={() => copyToClipboard(blog.title)}
                >
                  {blog.title || "--"}
                </div>
                <div
                  className="p-3 flex-grow cursor-pointer truncate"
                  title="Click to copy content"
                  onClick={() => copyToClipboard(blog.content)}
                >
                  {blog.content.length > 100
                    ? `${blog.content.substring(0, 100)}...`
                    : blog.content || "--"}
                </div>
                <div
                  className="p-3 w-24 flex-shrink-0 cursor-pointer"
                  title="Click to copy created date"
                  onClick={() => copyToClipboard(new Date(blog.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }))}
                >
                  {blog.createdAt ? dayjs(blog.createdAt).format("DD-MM-YYYY") : "--"}
                </div>
                <div className="p-3 w-24 flex-shrink-0 flex space-x-3">
                  <View
                    onClick={() => {
                      window.open(`${process.env.REACT_APP_FRONTEND}/blog?q=${blog._id}`, "_blank", "noopener,noreferrer")
                    }}
                    titleAccess="View Blog"
                    className="text-[#D26600] cursor-pointer"
                  />
                  <Delete
                    onClick={() => {
                      setCurrentBlogId(blog._id);
                      setShowDeleteDialog(true);
                    }}
                    titleAccess="Delete Blog"
                    className="text-[#D26600] cursor-pointer"
                  />
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-center border-b">No blogs found</div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="mb-6">
              Are you sure you want to DELETE this blog?
              <br />
              This action is irreversible.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 transition-colors"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setCurrentBlogId(null);
                }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-500 text-white hover:bg-red-600 transition-colors"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? "Deleting..." : "DELETE"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blog;