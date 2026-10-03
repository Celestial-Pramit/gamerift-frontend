import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import Button from "../components/ui/Button.jsx";
import FormError from "../components/ui/FormError.jsx";
import { resetPassword } from "../api/authApi.js";
import { alertBox } from "../utils/cdn.js";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!token) return setError("This reset link is not valid");
    if (password.length < 8) return setError("Password needs at least 8 characters");
    if (password !== confirm) return setError("Passwords do not match");
    setError("");
    setLoading(true);
    try {
      await resetPassword(token, password);
      await alertBox({ icon: "success", title: "Password changed", text: "Log in with your new password." });
      navigate("/login");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <AuthLayout title="Reset password" subtitle="Choose a new password.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <PasswordInput label="New password" value={password} onChange={(e) => setPassword(e.target.value)} showMeter required />
        <PasswordInput label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required />
        <FormError text={error} />
        <Button type="submit" loading={loading} className="w-full">Change password</Button>
      </form>
    </AuthLayout>
  );
}
