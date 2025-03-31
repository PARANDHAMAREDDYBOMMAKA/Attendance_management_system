import "./App.css";
import AttendanceLogs from "./components/Attendance/AttendanceLogs";
import UserDashboard from "./components/Dashboard/UserDashboard";
import Navbar from "./components/Layout/Navbar";
import Sidebar from "./components/Layout/Sidebar";

function App() {
  return (
    <>
      <AttendanceLogs />
      <UserDashboard />
      <Navbar />
    </>
  );
}

export default App;
