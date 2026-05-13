const Badge = ({ count }) => {
  if (!count) return null;
  return (
    <span style={{
      marginLeft: "auto",
      minWidth: 18, height: 18,
      borderRadius: 9,
      background: "#ef4444",
      color: "#fff",
      fontSize: "0.6rem",
      fontWeight: 800,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "0 5px",
      flexShrink: 0,
    }}>
      {count > 99 ? "99+" : count}
    </span>
  );
};

export default Badge;
