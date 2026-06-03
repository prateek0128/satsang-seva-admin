import { useState, useCallback } from "react";
import { TableCell, Box } from "@mui/material";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpwardRounded";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownwardRounded";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMoreRounded";

// Hook: returns { sorted, orderBy, order, handleSort }
export function useSortable(data, defaultKey = "", defaultDir = "asc") {
  const [orderBy, setOrderBy] = useState(defaultKey);
  const [order, setOrder] = useState(defaultDir);

  const handleSort = useCallback((key) => {
    setOrder(prev => (orderBy === key && prev === "asc") ? "desc" : "asc");
    setOrderBy(key);
  }, [orderBy]);

  const sorted = [...data].sort((a, b) => {
    if (!orderBy) return 0;
    let av = a[orderBy] ?? "";
    let bv = b[orderBy] ?? "";
    // numeric coerce
    if (!isNaN(Number(av)) && !isNaN(Number(bv))) { av = Number(av); bv = Number(bv); }
    else { av = String(av).toLowerCase(); bv = String(bv).toLowerCase(); }
    if (av < bv) return order === "asc" ? -1 : 1;
    if (av > bv) return order === "asc" ?  1 : -1;
    return 0;
  });

  return { sorted, orderBy, order, handleSort };
}

// Component: sortable <TableCell> header
export function SortCell({ label, field, orderBy, order, onSort, sx = {} }) {
  const active = orderBy === field;
  return (
    <TableCell
      onClick={() => onSort(field)}
      sx={{
        fontSize: "0.68rem", fontWeight: 800, color: active ? "#D26600" : "#64748b",
        textTransform: "uppercase", letterSpacing: "0.08em",
        background: active ? "#fff7ed" : "#f8fafc",
        py: 1.5, px: 2, whiteSpace: "nowrap",
        cursor: "pointer", userSelect: "none",
        transition: "background 0.15s, color 0.15s",
        "&:hover": { background: "#fff7ed", color: "#D26600" },
        ...sx,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 0.4 }}>
        {label}
        {active
          ? order === "asc"
            ? <ArrowUpwardIcon sx={{ fontSize: 13, color: "#D26600" }} />
            : <ArrowDownwardIcon sx={{ fontSize: 13, color: "#D26600" }} />
          : <UnfoldMoreIcon sx={{ fontSize: 13, color: "#cbd5e1" }} />}
      </Box>
    </TableCell>
  );
}

// Non-sortable plain head cell (for columns like Actions)
export const PlainCell = ({ label, sx = {} }) => (
  <TableCell sx={{ fontSize: "0.68rem", fontWeight: 800, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", background: "#f8fafc", py: 1.5, px: 2, whiteSpace: "nowrap", ...sx }}>
    {label}
  </TableCell>
);
