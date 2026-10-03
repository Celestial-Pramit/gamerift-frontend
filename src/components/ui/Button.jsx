export default function Button({ children, variant = "primary", loading = false, disabled, className = "", ...props }) {
  const styles = {
    primary: "btn-pri",
    outline: "border border-line text-white hover:border-brand",
    ghost: "text-muted hover:text-white",
    danger: "bg-live text-white",
  };
  return (
    <button
      disabled={loading || disabled}
      className={"btn-cut px-4 py-2.5 disabled:opacity-50 " + styles[variant] + " " + className}
      {...props}
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}
