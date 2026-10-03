import { useEffect, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import OTPInput from "../components/ui/OTPInput.jsx";
import Button from "../components/ui/Button.jsx";
import FormError from "../components/ui/FormError.jsx";
import { verifySignupOtp, resendOtp } from "../api/authApi.js";
import { useMock } from "../api/http.js";
import { alertBox } from "../utils/cdn.js";

export default function VerifyOtp() {
  const { state } = useLocation();
  const email = state?.email || "";
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [wait, setWait] = useState(30); // resend cooldown in seconds
  const navigate = useNavigate();

  useEffect(() => {
    if (wait <= 0) return;
    const timer = setTimeout(() => setWait(wait - 1), 1000);
    return () => clearTimeout(timer);
  }, [wait]);

  async function handleVerify(e) {
    e.preventDefault();
    if (code.length < 6) return setError("Enter all 6 digits");
    setError("");
    setLoading(true);
    try {
      await verifySignupOtp(email, code);
      await alertBox({ icon: "success", title: "Email verified", text: "You can log in now." });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  async function handleResend() {
    try {
      await resendOtp(email);
      setWait(30);
    } catch (err) {
      setError(err.message);
    }
  }

  // Opened directly without registering first
  if (!email) return <Navigate to="/register" replace />;

  return (
    <AuthLayout title="Verify your email" subtitle={"We sent a 6-digit code to " + email}>
      <form onSubmit={handleVerify} className="space-y-4">
        <OTPInput value={code} onChange={setCode} />
        <FormError text={error} />
        <Button type="submit" loading={loading} className="w-full">Verify</Button>
        <Button type="button" variant="ghost" disabled={wait > 0} onClick={handleResend} className="w-full">
          {wait > 0 ? "Resend code in " + wait + "s" : "Resend code"}
        </Button>
        {useMock && <p className="text-center text-xs text-muted">Demo code: 123456</p>}
      </form>
    </AuthLayout>
  );
}
