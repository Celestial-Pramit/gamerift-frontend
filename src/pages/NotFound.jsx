import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-display text-5xl text-live">GAME OVER</h1>
      <p className="text-muted">This page does not exist.</p>
      <Link to="/" className="glow rounded-lg bg-brand px-6 py-2 font-head text-lg font-bold">Respawn</Link>
    </div>
  );
}
