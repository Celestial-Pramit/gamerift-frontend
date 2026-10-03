import { useAuth } from "../context/AuthContext.jsx";

// Placeholder until the real screens are built in the next phases
export default function ComingSoon({ title }) {
  const { user } = useAuth();
  return (
    <div className="cut border border-line bg-card p-8">
      <h1 className="font-head text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-muted">Welcome, {user?.username}. This screen arrives in the next phases. GG!</p>
    </div>
  );
}
