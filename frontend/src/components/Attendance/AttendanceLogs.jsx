import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  Alert,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";

import { getAttendanceLogs } from "../../services/attendance.service";
import { isAdmin } from "../../services/auth.service";

const AttendanceLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [status, setStatus] = useState("all");
  const [totalRecords, setTotalRecords] = useState(0);

  const admin = isAdmin();

  useEffect(() => {
    fetchLogs();
  }, [page, rowsPerPage, startDate, endDate, status]);

  const fetchLogs = async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page: page + 1,
        page_size: rowsPerPage,
        search: searchQuery || undefined,
        status: status !== "all" ? status : undefined,
        start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
        end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      };

      const response = await getAttendanceLogs(params);
      setLogs(response.results);
      setTotalRecords(response.count);
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to fetch attendance logs");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(0);
    fetchLogs();
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return "-";
    const date = new Date(dateTimeString);
    return date.toLocaleString();
  };

  return (
    <Box sx={{ maxWidth: 1200, mx: "auto" }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          {admin ? "Attendance Logs" : "My Attendance Logs"}
        </Typography>

        <form onSubmit={handleSearch}>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={admin ? 4 : 6}>
              <TextField
                fullWidth
                label="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton type="submit" edge="end">
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={admin ? 4 : 6}>
              <FormControl fullWidth>
                <InputLabel id="status-select-label">Status</InputLabel>
                <Select
                  labelId="status-select-label"
                  id="status-select"
                  value={status}
                  label="Status"
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <MenuItem value="all">All</MenuItem>
                  <MenuItem value="present">Present</MenuItem>
                  <MenuItem value="absent">Absent</MenuItem>
                  <MenuItem value="late">Late</MenuItem>
                  <MenuItem value="half_day">Half Day</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            {admin && (
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="User"
                  placeholder="Filter by username"
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
          </Grid>
        </form>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    {admin && <TableCell>User</TableCell>}
                    <TableCell>Check In</TableCell>
                    <TableCell>Check Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Working Hours</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {logs.length > 0 ? (
                    logs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>
                          {new Date(log.date).toLocaleDateString()}
                        </TableCell>
                        {admin && <TableCell>{log.user_name}</TableCell>}
                        <TableCell>
                          {formatDateTime(log.check_in_time)}
                        </TableCell>
                        <TableCell>
                          {formatDateTime(log.check_out_time)}
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "inline-block",
                              px: 1,
                              py: 0.5,
                              borderRadius: 1,
                              bgcolor:
                                log.status === "present"
                                  ? "success.light"
                                  : log.status === "absent"
                                  ? "error.light"
                                  : log.status === "late"
                                  ? "warning.light"
                                  : "info.light",
                              color: "white",
                              textTransform: "capitalize",
                            }}
                          >
                            {log.status}
                          </Box>
                        </TableCell>
                        <TableCell>{log.working_hours || "-"}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={admin ? 6 : 5} align="center">
                        No records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>
    </Box>
  );
};

export default AttendanceLogs;
