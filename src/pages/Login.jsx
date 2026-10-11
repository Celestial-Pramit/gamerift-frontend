import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import OTPInput from "../components/ui/OTPInput.jsx";
import Button from "../components/ui/Button.jsx";
import FormError from "../components/ui/FormError.jsx";
import { login, verifyLoginOtp } from "../api/authApi.js";
import { useMock } from "../api/http.js";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [otpStep, setOtpStep] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { saveLogin } = useAuth();
  const navigate = useNavigate();

  // Step 1: email + password
  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.needsOtp) {
        setOtpStep(true);
      } else {
        saveLogin(data);
        navigate("/app");
      }
    } catch (err) {
      // The e-mail is not verified yet: the backend sent a new code, so go to the OTP page
      if (err.message.toLowerCase().includes("not verified")) {
        navigate("/verify-otp", { state: { email } });
      } else {
        setError(err.message);
      }
    }
    setLoading(false);
  }

  // Step 2: OTP code (only when 2FA is on)
  async function handleOtp(e) {
    e.preventDefault();
    if (code.length < 6) return setError("Enter all 6 digits");
    setError("");
    setLoading(true);
    try {
      const data = await verifyLoginOtp(email, code);
      saveLogin(data);
      navigate("/app");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  if (otpStep) {
    return (
      <AuthLayout title="Verify it's you" subtitle={"Enter the 6-digit code sent to " + email}>
        <form onSubmit={handleOtp} className="space-y-4">
          <OTPInput value={code} onChange={setCode} />
          <FormError text={error} />
          <Button type="submit" loading={loading} className="w-full">Verify</Button>
          {useMock && <p className="text-center text-xs text-muted">Demo code: 123456</p>}
        </form>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title="Welcome back" subtitle="Log in to enter the rift.">
      <form onSubmit={handleLogin} className="space-y-4">
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <PasswordInput value={password} onChange={(e) => setPassword(e.target.value)} required />
        <FormError text={error} />
        <Button type="submit" loading={loading} className="w-full">Login</Button>
        <div className="flex justify-between text-sm">
          <Link to="/forgot-password" className="text-neon">Forgot password?</Link>
          <Link to="/register" className="text-muted hover:text-white">Create account</Link>
        </div>
        {useMock && (
          <p className="text-xs text-muted">Demo: gamer@gamerift.tech / Gamer@123 | admin@gamerift.tech / Admin@123 (OTP 123456)</p>
        )}
      </form>
    </AuthLayout>
  );
}
