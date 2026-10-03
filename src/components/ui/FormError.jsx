export default function FormError({ text }) {
  return text ? <p className="rounded bg-live/10 p-2 text-sm text-live">{text}</p> : null;
}
