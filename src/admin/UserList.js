import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import View from "@mui/icons-material/VisibilityTwoTone";
import Delete from "@mui/icons-material/DeleteForeverTwoTone";
import Loader from "../components/Loader";
import dayjs from "dayjs";
import { Button, Divider, IconButton } from "@mui/material";
import { Edit } from "@mui/icons-material";
import { toast, confirmDialog } from "../components/Popup";


const UserList = () => {
  const url = process.env.REACT_APP_BACKEND;
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const userResponse = await axios.get(url + "users", { headers });
        const usersData = userResponse.data.data?.users || userResponse.data.users;
        setUsers(usersData);
      } catch (error) {
        console.error("Error fetching users:", error);
        toast("Error fetching users: " + error.message, "error");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [url]);

  const handleDelete = async (user) => {
    const ok = await confirmDialog(`Delete ${user.name || "--"}? This action is irreversible.`);
    if (ok) {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const resp = await axios.delete(url + "users/" + user._id, { headers });
        setUsers(users.filter((u) => u._id !== user._id));
        toast(resp.data.message || "User deleted successfully!", "success");
      } catch (error) {
        console.error("Error deleting user:", error);
        toast("Error deleting user: " + (error.response?.data?.message || error.message), "error");
      } finally {
        setLoading(false);
      }
    }
  };

  // Custom styles for header cells and regular cells
  const cellHeaderStyle = {
    flex: "1",
    // padding: "8px",
    fontWeight: "bold",
    minWidth: "80px",
  };

  const cellStyle = {
    color: "#555555",
    padding: 0,
    fontSize: "14px",
    cursor: "pointer"
  };

  // Style for the delete button
  const deleteButtonStyle = {
    opacity: 0.3,
    transition: "opacity 0.3s",
    border: "none",
    background: "none",
    cursor: "pointer",
  };



  return (
    <div style={{ padding: "0.5rem" }}>
      {loading && <Loader />}
      <h1>Total Users</h1>
      <div style={{ overflowX: "auto", marginTop: "1rem" }}>
        {/* Header Row */}
        <div className="bg-[#EE7D45] grid grid-cols-[1fr_1fr_1fr_2fr_1fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-1">
          <div className="" style={cellHeaderStyle}>ID</div>
          <div className="" style={cellHeaderStyle}>Name</div>
          <div className="" style={cellHeaderStyle}>UserType</div>
          <div className="" style={cellHeaderStyle}>Email</div>
          <div className="" style={cellHeaderStyle}>Phone</div>
          <div className="" style={cellHeaderStyle}>Profile</div>
          <div className="" style={cellHeaderStyle}>Events</div>
          <div className="" style={cellHeaderStyle}>Created At</div>
          <div className="" style={cellHeaderStyle}>Edit</div>
          <div className="" style={cellHeaderStyle}>Delete</div>
        </div>
        {/* Data Rows */}
        {users && users.length > 0 ? (
          users.map((user) => (
            <>
              <div
                key={user._id}
                className="grid grid-cols-[1fr_1fr_1fr_2fr_1fr_0.5fr_0.5fr_0.5fr_0.5fr_0.5fr] gap-1"
                onMouseEnter={(e) => {
                  const btn = e.currentTarget.querySelector(".delete-btn");
                  if (btn) btn.style.opacity = 1;
                }}
                onMouseLeave={(e) => {
                  const btn = e.currentTarget.querySelector(".delete-btn");
                  if (btn) btn.style.opacity = 0.3;
                }}
              >
                <Button title="Click to copy" className="" style={cellStyle} onClick={() => { navigator.clipboard.writeText(user._id) }}>{user._id ? user._id.slice(-5) + "..." : "--"}</Button>
                <Button title="Click to copy" onClick={() => { navigator.clipboard.writeText(user.name) }} className="" style={cellStyle}>{user.name || "--"}</Button>
                <Button title="Click to copy" onClick={() => { navigator.clipboard.writeText(user.userType) }} className="" style={cellStyle}>{user.userType || "--"}</Button>
                <Button title="Click to copy" onClick={() => { navigator.clipboard.writeText(user.email) }} className="" style={cellStyle}>{user.email || "--"}</Button>
                <Button title="Click to copy" onClick={() => { navigator.clipboard.writeText(user.phone) }} className="" style={cellStyle}>{user.phone || "--"}</Button>
                <Button className="" style={cellStyle}>
                  <View
                    titleAccess="View Public Profile"
                    style={{ color: "#D26600", cursor: "pointer" }}
                    onClick={() => {
                      window.open(`${process.env.REACT_APP_FRONTEND}/public-profile?q=${user._id}`, "_blank", "noopener,noreferrer")
                    }
                    }
                  />
                </Button>
                <Button className="" style={cellStyle}>
                  {user.events && user.events.length > 0 ? user.events.length : (
                    "--"
                  )}
                </Button>
                <Button title="Click to copy" onClick={() => { navigator.clipboard.writeText(user.createdAt) }}
                  style={cellStyle}
                  className=" flex flex-col gap-0 items-center justify-center"  >
                  <p className="block !text-xs">
                    {user.createdAt ? dayjs(user.createdAt).format("DD-MM-YYYY") : "--"}
                  </p>
                  <p className="block !text-xs">
                    {user.createdAt ? dayjs(user.createdAt).format("hh:mm:ss") : "--"}
                  </p>
                </Button>
                <IconButton
                  color="#D26600"
                  // onClick={() => navigate(`updateuser/${user._id}`)}
                  onClick={() => navigate(`/admin/updateuser/${user._id}`)}
                  title="Update User"
                >
                  <Edit />
                </IconButton>
                <Button className="" style={cellStyle}>
                  <button
                    className="delete-btn"
                    style={deleteButtonStyle}
                    onClick={() => handleDelete(user)}
                  >
                    <Delete titleAccess="Delete User" style={{ color: "#D26600" }} />
                  </button>
                </Button>
              </div>
              <Divider />
            </>

          ))
        ) : (
          <div style={{ padding: "8px 0", textAlign: "center" }}>
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserList;
