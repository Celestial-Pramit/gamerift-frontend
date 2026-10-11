import { useState } from "react";
import Modal from "../Modal.jsx";
import Toggle from "../Toggle.jsx";
import Avatar from "../Avatar.jsx";
import FormError from "../ui/FormError.jsx";
import { alertBox } from "../../utils/cdn.js";

const chips = { PAID: "tag", FAILED: "tag tag-end", REFUNDED: "tag tag-pro", LIVE: "tag tag-live", ADMIN: "tag tag-pro" };
const inputCls = "mt-1 h-11 w-full rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon disabled:opacity-50";

// One table cell, drawn according to the column type
function Cell({ col, row, onToggle }) {
  const v = row[col.key];
  if (col.type === "toggle") return <Toggle on={!!v} onChange={(x) => onToggle(row.id, col.key, x)} label={col.label} />;
  if (col.type === "chip") return <span className={chips[v] || "tag tag-mute"}>{String(v)}</span>;
  if (col.type === "money") return <b className="font-display text-neon">৳{v}</b>;
  if (col.type === "avatar") return <span className="flex items-center gap-2"><Avatar name={String(v)} size={28} /><b>{v}</b></span>;
  return <span className="break-words">{String(v ?? "")}</span>;
}

// One form field (text, number, textarea, select, date, toggle)
export function Field({ f, value, onChange }) {
  const opt = (o) => (Array.isArray(o) ? o : [o, o]);
  if (f.type === "toggle") {
    return <label className="flex items-center justify-between gap-3 text-sm"><span>{f.label}</span><Toggle on={!!value} onChange={onChange} label={f.label} /></label>;
  }
  const types = { datetime: "datetime-local", date: "date", number: "number" };
  return (
    <label className="block text-sm">
      <span className="text-muted">{f.label}{f.required && " *"}</span>
      {f.type === "textarea" ? (
        <textarea rows={3} value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-card p-3 text-sm outline-none focus:border-neon" />
      ) : f.type === "select" ? (
        <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
          {f.options.map((o) => { const [v, l] = opt(o); return <option key={v} value={v}>{l}</option>; })}
        </select>
      ) : (
        <input type={types[f.type] || "text"} value={value ?? ""} disabled={f.readOnly} onChange={(e) => onChange(f.type === "number" ? Number(e.target.value) : e.target.value)} className={inputCls} />
      )}
    </label>
  );
}

const toast = (title) => alertBox({ toast: true, position: "bottom-end", icon: "success", title, showConfirmButton: false, timer: 1800 });

// Generic admin table: search, filter, add, edit, delete (mock data, or the backend when onSave/onDelete/onToggle are given)
export default function CrudSection({ title, singular, rows, setRows, columns, fields = [], searchKeys, filter, canCreate = true, canEdit = true, canDelete = true, makeNew, renderForm, onSave, onDelete, onToggle }) {
  const [q, setQ] = useState("");
  const [f, setF] = useState("all");
  const [editing, setEditing] = useState(null);
  const [isNew, setIsNew] = useState(false);
  const [error, setError] = useState("");

  const shown = (rows || []).filter((r) =>
    (!filter || f === "all" || String(r[filter.key]) === f) &&
    (!q || searchKeys.some((k) => String(r[k]).toLowerCase().includes(q.toLowerCase())))
  );

  function openNew() {
    const blank = Object.fromEntries(fields.map((x) => [x.key, x.type === "toggle" ? false : x.type === "number" ? 0 : x.options ? (Array.isArray(x.options[0]) ? x.options[0][0] : x.options[0]) : ""]));
    setEditing(makeNew ? makeNew() : blank);
    setIsNew(true);
    setError("");
  }

  function openEdit(row) { setEditing({ ...row }); setIsNew(false); setError(""); }

  async function save(e) {
    e.preventDefault();
    const missing = fields.find((x) => x.required && !String(editing[x.key] ?? "").trim());
    if (missing) return setError(missing.label + " is required");
    if (!renderForm && !fields.length) return;
    if (onSave) {
      setError("");
      try {
        await onSave(isNew ? null : editing.id, editing);
        setEditing(null);
        toast(singular + (isNew ? " created" : " updated"));
      } catch (err) {
        setError(err.message);
      }
      return;
    }
    setRows(isNew ? [{ ...editing, id: Date.now() }, ...rows] : rows.map((r) => (r.id === editing.id ? editing : r)));
    setEditing(null);
    toast(singular + (isNew ? " created" : " updated"));
  }

  async function remove(row) {
    const res = await alertBox({ icon: "warning", title: "Delete this " + singular + "?", text: "This cannot be undone.", showCancelButton: true, confirmButtonText: "Delete", confirmButtonColor: "#ff3b5c" });
    const ok = res ? res.isConfirmed : window.confirm("Delete this " + singular + "?");
    if (!ok) return;
    if (onDelete) {
      try { await onDelete(row.id); toast(singular + " deleted"); }
      catch (err) { alertBox({ icon: "error", title: err.message }); }
      return;
    }
    setRows(rows.filter((r) => r.id !== row.id));
    toast(singular + " deleted");
  }

  function toggle(id, key, val) {
    setRows(rows.map((r) => (r.id === id ? { ...r, [key]: val } : r)));
    if (onToggle) onToggle(id, key, val).catch((err) => alertBox({ icon: "error", title: err.message }));
  }

  const actions = (r) => (
    <div className="flex gap-3">
      {canEdit && <button onClick={() => openEdit(r)} className="mono text-[10px] text-neon hover:text-white">Edit</button>}
      {canDelete && <button onClick={() => remove(r)} className="mono text-[10px] text-live hover:text-white">Delete</button>}
    </div>
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={"Search " + title.toLowerCase() + "..."} className="h-11 min-w-48 flex-1 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon sm:max-w-sm" />
        {filter && (
          <select value={f} onChange={(e) => setF(e.target.value)} className="h-11 rounded-lg border border-line bg-card px-3 text-sm outline-none focus:border-neon">
            <option value="all">{filter.label}</option>
            {filter.options.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        {canCreate && <button onClick={openNew} className="btn-cut btn-pri ml-auto px-5 py-2.5 text-sm">+ Add {singular}</button>}
      </div>

      <div className="panel overflow-hidden">
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <thead className="mono text-[10px] text-muted">
              <tr>{columns.map((c) => <th key={c.key} className="px-4 py-3 text-left">{c.label}</th>)}{(canEdit || canDelete) && <th className="px-4 py-3 text-left">Actions</th>}</tr>
            </thead>
            <tbody className="divide-y divide-line">
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-white/5">
                  {columns.map((c) => <td key={c.key} className="max-w-xs px-4 py-3"><Cell col={c} row={r} onToggle={toggle} /></td>)}
                  {(canEdit || canDelete) && <td className="px-4 py-3">{actions(r)}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-line md:hidden">
          {shown.map((r) => (
            <div key={r.id} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 font-bold"><Cell col={columns[0]} row={r} onToggle={toggle} /></div>
                {actions(r)}
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                {columns.slice(1).map((c) => <div key={c.key}><div className="mono text-[9px] text-muted">{c.label}</div><Cell col={c} row={r} onToggle={toggle} /></div>)}
              </div>
            </div>
          ))}
        </div>
        {shown.length === 0 && <p className="p-10 text-center text-sm text-muted">Nothing found.</p>}
      </div>
      <p className="mono text-[10px] text-muted">{shown.length} of {rows.length} {title.toLowerCase()}</p>

      {editing && (
        <Modal title={(isNew ? "Add " : "Edit ") + singular} onClose={() => setEditing(null)} wide={!!renderForm}>
          <form onSubmit={save} className="space-y-4">
            {renderForm ? renderForm(editing, setEditing) : fields.map((x) => <Field key={x.key} f={x} value={editing[x.key]} onChange={(v) => setEditing({ ...editing, [x.key]: v })} />)}
            <FormError text={error} />
            <div className="flex gap-3">
              <button className="btn-cut btn-pri px-6 py-3 text-sm">Save</button>
              <button type="button" onClick={() => setEditing(null)} className="btn-cut btn-sec px-6 py-3 text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
