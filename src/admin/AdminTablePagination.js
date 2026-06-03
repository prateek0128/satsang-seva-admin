import React from "react";
import { Box, Typography, TablePagination } from "@mui/material";

const AdminTablePagination = ({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
  background = "transparent",
}) => {
  return (
    <Box
      sx={{
        borderTop: "1px solid #f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        flexWrap: "wrap",
        background: background,
      }}
    >
      <Typography sx={{ fontSize: "0.78rem", color: "#94a3b8", py: 1 }}>
        Showing {Math.min(page * rowsPerPage + 1, count)}–{Math.min((page + 1) * rowsPerPage, count)} of {count}
      </Typography>
      <TablePagination
        component="div"
        count={count}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={rowsPerPageOptions}
        sx={{
          border: "none",
          "& .MuiTablePagination-toolbar": { px: 0, minHeight: 52 },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            fontSize: "0.78rem",
            color: "#64748b",
            margin: "0 !important",
          },
        }}
      />
    </Box>
  );
};

export default AdminTablePagination;
