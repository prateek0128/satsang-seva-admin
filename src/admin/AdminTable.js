import React from "react";
import {
  Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Typography, Box,
} from "@mui/material";
import AdminTablePagination from "./AdminTablePagination";
import { SortCell, PlainCell } from "./sortable";

/**
 * AdminTable — shared responsive table component.
 *
 * Props:
 *   columns             – [{ label, field?, sortable?, sx? }]
 *                         field present + onSort provided → SortCell; otherwise PlainCell
 *   rows                – pre-sliced row data for current page
 *   loading             – boolean
 *   emptyText           – string shown when rows is empty
 *   renderRow           – (row, index) => <TableRow />
 *   orderBy / order / onSort – sort state from useSortable
 *   count / page / rowsPerPage / onPageChange / onRowsPerPageChange – pagination
 *   rowsPerPageOptions  – default [10, 25, 50]
 *   maxHeight           – TableContainer maxHeight (default "calc(100vh - 340px)")
 *   sx                  – extra sx on outer Paper
 */
const AdminTable = ({
  columns = [],
  rows = [],
  loading = false,
  emptyText = "No data found",
  renderRow,
  orderBy,
  order,
  onSort,
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions,
  maxHeight = "calc(100vh - 340px)",
  sx = {},
}) => {
  const hasPagination =
    count !== undefined && page !== undefined && rowsPerPage !== undefined;

  return (
    <Paper
      elevation={0}
      sx={{ borderRadius: "16px", border: "1px solid #e2e8f0", overflow: "hidden", ...sx }}
    >
      <TableContainer
        sx={{ maxHeight, overflowX: "auto", WebkitOverflowScrolling: "touch" }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col, i) =>
                col.field && onSort ? (
                  <SortCell
                    key={i}
                    label={col.label}
                    field={col.field}
                    orderBy={orderBy}
                    order={order}
                    onSort={onSort}
                    sx={col.sx}
                  />
                ) : (
                  <PlainCell key={i} label={col.label} sx={col.sx} />
                )
              )}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  sx={{ textAlign: "center", py: 6, color: "#94a3b8", fontSize: "0.82rem" }}
                >
                  Loading…
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ textAlign: "center", py: 8 }}>
                  <Typography sx={{ fontWeight: 600, color: "#94a3b8", fontSize: "0.88rem" }}>
                    {emptyText}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, i) => renderRow(row, i))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {hasPagination && (
        <AdminTablePagination
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
          rowsPerPageOptions={rowsPerPageOptions}
        />
      )}
    </Paper>
  );
};

export default AdminTable;
