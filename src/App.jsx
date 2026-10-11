import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import BootScreen from "./components/BootScreen.jsx";
import AppShell from "./components/AppShell.jsx";
import Landing from "./pages/Landing.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";
import ComingSoon from "./pages/ComingSoon.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Discover from "./pages/Discover.jsx";
import Events from "./pages/Events.jsx";
import NotFound from "./pages/NotFound.jsx";
import Stream from "./pages/Stream.jsx";
import Notifications from "./pages/Notifications.jsx";
import Pro from "./pages/Pro.jsx";
import Checkout from "./pages/Checkout.jsx";
import PaymentResult from "./pages/PaymentResult.jsx";
import Settings from "./pages/Settings.jsx";
import Admin from "./pages/Admin.jsx";

// Only logged-in users can open /app pages
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  // Boot screen shows once per browser session
  const [booted, setBooted] = useState(sessionStorage.getItem("gr_boot") === "1");

  if (!booted) {
    return <BootScreen onDone={() => { sessionStorage.setItem("gr_boot", "1"); setBooted(true); }} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/app" element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="discover" element={<Discover />} />
        <Route path="events" element={<Events />} />
        <Route path="stream/:id" element={<Stream />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="settings" element={<Settings />} />
        <Route path="admin" element={<Admin />} />
        <Route path="admin/:section" element={<Admin />} />
        <Route path="pro" element={<Pro />} />
        <Route path="pro/checkout/:planId" element={<Checkout />} />
        <Route path="pro/result/:status" element={<PaymentResult />} />
        <Route path="*" element={<ComingSoon title="This page" />} />
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
