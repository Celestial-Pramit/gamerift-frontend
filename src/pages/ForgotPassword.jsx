import { useState } from "react";
import { Link } from "react-router-dom";
import AuthLayout from "../components/AuthLayout.jsx";
import Input from "../components/ui/Input.jsx";
import Button from "../components/ui/Button.jsx";
import FormError from "../components/ui/FormError.jsx";
import { forgotPassword } from "../api/authApi.js";
import { useMock } from "../api/http.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  }

  return (
    <AuthLayout title="Forgot password" subtitle="We will email you a reset link.">
      {sent ? (
        <div className="rounded bg-neon/10 p-3 text-sm text-neon">
          If that email exists, a reset link is on its way.
          {useMock && <Link to="/reset-password?token=demo" className="ml-2 underline">Demo link</Link>}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <FormError text={error} />
          <Button type="submit" loading={loading} className="w-full">Send reset link</Button>
        </form>
      )}
      <p className="mt-4 text-center text-sm"><Link to="/login" className="text-muted hover:text-white">Back to login</Link></p>
    </AuthLayout>
  );
}
