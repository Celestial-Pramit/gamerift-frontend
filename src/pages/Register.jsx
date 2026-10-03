import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import PasswordInput from "../components/ui/PasswordInput.jsx";
import Button from "../components/ui/Button.jsx";
import FormError from "../components/ui/FormError.jsx";
import { register } from "../api/authApi.js";
import { alertBox } from "../utils/cdn.js";

const countries = ["Bangladesh", "India", "Pakistan", "United Kingdom", "United States", "Germany", "France", "Ukraine", "Other"];

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "", country: "Bangladesh" });
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function change(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (form.username.length < 3) return setError("Username needs at least 3 characters");
    if (form.password.length < 8) return setError("Password needs at least 8 characters");
    if (!agree) return setError("Please accept the terms");
    setError("");
    setLoading(true);
    try {
      await register(form);
      await alertBox({ icon: "success", title: "Account created", text: "Enter the OTP we sent to your email." });
      navigate("/verify-otp", { state: { email: form.email } });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <AuthLayout title="Create account" subtitle="Join Gamerift in under a minute.">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input label="Username" name="username" value={form.username} onChange={change} required />
        <Input label="Email" name="email" type="email" value={form.email} onChange={change} required />
        <PasswordInput name="password" value={form.password} onChange={change} showMeter required />
        <label className="block text-sm">
          <span className="text-muted">Country</span>
          <select name="country" value={form.country} onChange={change} className="mt-1 block w-full rounded-lg border border-line bg-card px-3 py-2.5 outline-none focus:border-neon">
            {countries.map((c) => <option key={c}>{c}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm text-muted">
          <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="accent-[#a24bff]" />
          I agree to the Terms
        </label>
        <FormError text={error} />
        <Button type="submit" loading={loading} className="w-full">Sign up</Button>
        <p className="text-center text-sm text-muted">
          Already a member? <Link to="/login" className="text-neon">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
