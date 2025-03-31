import React, { useState, useEffect } from "react";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Divider,
  CircularProgress,
  Alert,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { format } from "date-fns";
import RefreshIcon from "@mui/icons-material/Refresh";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EventBusyIcon from "@mui/icons-material/EventBusy";

import {
  getDashboardStats,
  getAttendanceTrends,
} from "../../services/attendance.service";

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [trendDays, setTrendDays] = useState(30);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  const fetchStats = async () => {
    setLoading(true);
    setError("");
    try {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      const data = await getDashboardStats(formattedDate);
      setStats(data);
    } catch (err) {
      console.error("Error fetching stats:", err);
      setError("Failed to fetch dashboard statistics");
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const data = await getAttendanceTrends(trendDays);
      setTrends(data);
    } catch (err) {
      console.error("Error fetching trends:", err);
      setError("Failed to fetch attendance trends");
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTrends();
  }, [selectedDate, trendDays]);

  const handleRefresh = () => {
    fetchStats();
    fetchTrends();
  };

  // Prepare data for pie chart
  const getPieData = () => {
    if (!stats) return [];
    return [
      { name: "Present", value: stats.present_count },
      { name: "Absent", value: stats.absent_count },
      { name: "Late", value: stats.late_count },
      { name: "Half Day", value: stats.half_day_count },
    ];
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={3}>
        {/* Header with date picker and refresh button */}
        <Grid item xs={12}>
          <Paper
            sx={{
              p: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="h5">Admin Dashboard</Typography>
            <Box sx={{ display: "flex", gap: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Select Date"
                  value={selectedDate}
                  onChange={(newValue) => setSelectedDate(newValue)}
                  renderInput={(params) => <TextField {...params} />}
                />
              </LocalizationProvider>
              <Button
                variant="contained"
                startIcon={<RefreshIcon />}
                onClick={handleRefresh}
              >
                Refresh
              </Button>
            </Box>
          </Paper>
        </Grid>

        {error && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}

        {loading ? (
          <Grid
            item
            xs={12}
            sx={{ display: "flex", justifyContent: "center", py: 10 }}
          >
            <CircularProgress />
          </Grid>
        ) : (
          <>
            {/* Stats Cards */}
            {stats && (
              <>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <PeopleIcon
                        color="primary"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="h5">
                        {stats.total_employees}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Total Employees
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <CheckCircleIcon
                        color="success"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="h5">
                        {stats.present_count}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Present Today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <AccessTimeIcon
                        color="warning"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="h5">{stats.late_count}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Late Today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <EventBusyIcon
                        color="error"
                        sx={{ fontSize: 40, mb: 1 }}
                      />
                      <Typography variant="h5">{stats.absent_count}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        Absent Today
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </>
            )}

            {/* Attendance Distribution */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Typography variant="h6" gutterBottom>
                  Attendance Distribution
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height="85%">
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) =>
                        `${name}: ${(percent * 100).toFixed(0)}%`
                      }
                    >
                      {getPieData().map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => value} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Attendance Trends */}
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2, height: 400 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  <Typography variant="h6">Attendance Trends</Typography>
                  <FormControl sx={{ width: 120 }}>
                    <InputLabel id="trend-days-label">Days</InputLabel>
                    <Select
                      labelId="trend-days-label"
                      id="trend-days"
                      value={trendDays}
                      label="Days"
                      onChange={(e) => setTrendDays(e.target.value)}
                    >
                      <MenuItem value={7}>7 Days</MenuItem>
                      <MenuItem value={30}>30 Days</MenuItem>
                      <MenuItem value={90}>90 Days</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                <Divider sx={{ mb: 2 }} />
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart
                    data={trends}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="present" fill="#00C49F" name="Present" />
                    <Bar dataKey="absent" fill="#FF8042" name="Absent" />
                    <Bar dataKey="late" fill="#FFBB28" name="Late" />
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Recently Active Employees */}
            <Grid item xs={12}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Recently Active Employees
                </Typography>
                <Divider sx={{ mb: 2 }} />
                {stats &&
                stats.recent_activities &&
                stats.recent_activities.length > 0 ? (
                  <Grid container spacing={2}>
                    {stats.recent_activities.map((activity, index) => (
                      <Grid item xs={12} sm={6} md={4} key={index}>
                        <Card variant="outlined">
                          <CardHeader
                            title={activity.user_name}
                            subheader={format(
                              new Date(activity.timestamp),
                              "PPpp"
                            )}
                          />
                          <CardContent>
                            <Typography variant="body2">
                              {activity.action}{" "}
                              {activity.location
                                ? `at ${activity.location}`
                                : ""}
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body1" align="center" sx={{ py: 4 }}>
                    No recent activities found
                  </Typography>
                )}
              </Paper>
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
