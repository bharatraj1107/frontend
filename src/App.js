import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import PrivateRoute from "./components/PrivateRoute";
import DashboardRouter from "./pages/DashboardRouter";
import Tasks from "./pages/Tasks";
import Stock from "./pages/Inventory";
import Reports from "./pages/Reports";
import AuditLogs from "./pages/AuditLogs";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import Signout from "./pages/Signout";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/signout" element={<Signout />} />

        {/* Protected routes */}
        <Route path="/dashboard" element={<PrivateRoute><Layout><DashboardRouter /></Layout></PrivateRoute>} />
        <Route path="/tasks" element={<PrivateRoute><Layout><Tasks /></Layout></PrivateRoute>} />
        <Route path="/inventory" element={<PrivateRoute><Layout><Stock /></Layout></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Layout><Reports /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/audit-logs" element={<PrivateRoute><Layout><AuditLogs /></Layout></PrivateRoute>} />

        {/* 404 catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
