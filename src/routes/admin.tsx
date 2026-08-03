import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Confetti } from "@/components/festive-bg";
import { toast } from "sonner";
import {
  adminLogin,
  adminListRegistrations,
  adminAddRegistration,
  adminDeleteRegistration,
  adminListTemplates,
  adminSaveTemplate,
} from "@/lib/admin.functions";
import { DEFAULT_TEMPLATES, fillTemplate, waLink } from "@/lib/templates";
import logo from "@/assets/sharandev-logo.png";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
  head: () => ({
    meta: [
      { title: "Admin — Lucky Draw Dashboard" },
      { name: "robots", content: "noindex" },
    ],
  }),
});

type Row = {
  id: string;
  entry_number: string;
  full_name: string;
  phone: string;
  whatsapp: string;
  is_cloud9: boolean;
  flat_no: string | null;
  whatsapp_done: boolean;
  instagram1_done: boolean;
  instagram2_done: boolean;
  youtube_done: boolean;
  created_at: string;
};

const PW_KEY = "sharandev_admin_pw";

const PRIZES = [
  "1st Prize — Saree worth ₹5,000/-",
  "2nd Prize — Exciting Gift",
  "3rd Prize — Exciting Gift",
];

function WhatsAppIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.149-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.148-.669-1.611-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884a9.82 9.82 0 016.988 2.898 9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  );
}

function AdminPage() {
  const [pw, setPw] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => {
    if (typeof window !== "undefined") setPw(sessionStorage.getItem(PW_KEY));
    setHydrated(true);
  }, []);
  if (!hydrated) return null;
  if (!pw)
    return (
      <Login
        onOk={(p) => {
          sessionStorage.setItem(PW_KEY, p);
          setPw(p);
        }}
      />
    );
  return (
    <Dashboard
      pw={pw}
      onLogout={() => {
        sessionStorage.removeItem(PW_KEY);
        setPw(null);
      }}
    />
  );
}

function Login({ onOk }: { onOk: (pw: string) => void }) {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!password) return;
    setLoading(true);
    try {
      await adminLogin({ data: { password } });
      onOk(password);
    } catch {
      toast.error("Invalid password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-red-hero px-5 text-white">
      <div className="w-full max-w-sm rounded-3xl glass-card p-6 shadow-festive">
        <h1 className="font-display text-3xl font-black text-maroon">Admin Login</h1>
        <p className="mt-1 font-serif-lux text-base italic text-maroon/70">
          Sharandev Fashions Lucky Draw
        </p>
        <div className="mt-5 space-y-3">
          <input
            className="input-lg"
            type="password"
            placeholder="Admin Password"
            value={password}
            autoFocus
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
          <button
            disabled={loading}
            onClick={submit}
            className="w-full rounded-2xl gradient-festive px-6 py-4 text-base font-bold text-primary-foreground shadow-festive active:scale-95 disabled:opacity-50"
          >
            {loading ? "…" : "Sign in"}
          </button>
        </div>
      </div>
      <style>{`.input-lg{width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid var(--border);background:white;font-size:16px;outline:none;color:var(--maroon)}.input-lg:focus{border-color:var(--gold)}`}</style>
    </div>
  );
}

function Dashboard({ pw, onLogout }: { pw: string; onLogout: () => void }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [winners, setWinners] = useState<Row[] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showTpl, setShowTpl] = useState(false);
  const [templates, setTemplates] = useState<Record<string, string>>(DEFAULT_TEMPLATES);

  async function refresh() {
    try {
      const data = await adminListRegistrations({ data: { password: pw } });
      setRows((data ?? []) as Row[]);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  }
  useEffect(() => {
    refresh();
    adminListTemplates({ data: { password: pw } })
      .then((list) => {
        const map = { ...DEFAULT_TEMPLATES };
        for (const t of list as { key: string; value: string }[]) map[t.key] = t.value;
        setTemplates(map);
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.full_name, r.phone, r.whatsapp, r.entry_number].some((v) => v.toLowerCase().includes(s)),
    );
  }, [q, rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const cloud9 = rows.filter((r) => r.is_cloud9).length;
    const outside = total - cloud9;
    const wa = rows.filter((r) => r.whatsapp_done).length;
    return { total, cloud9, outside, wa };
  }, [rows]);

  function pickWinners() {
    if (!rows.length) return toast.error("No entries yet");
    const pool = [...rows];
    const picked: Row[] = [];
    while (picked.length < 3 && pool.length) {
      picked.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
    }
    setWinners(picked);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 6000);
  }

  async function handleDelete(r: Row) {
    if (!confirm(`Delete ${r.entry_number} — ${r.full_name}?`)) return;
    try {
      await adminDeleteRegistration({ data: { password: pw, id: r.id } });
      setRows((prev) => prev.filter((x) => x.id !== r.id));
      toast.success("Deleted");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Delete failed");
    }
  }

  function openChat(r: Row, prize?: string) {
    const tpl = prize
      ? templates.wa_winner_template || DEFAULT_TEMPLATES.wa_winner_template
      : templates.wa_customer_template || DEFAULT_TEMPLATES.wa_customer_template;
    const msg = fillTemplate(tpl, {
      name: r.full_name,
      phone: r.phone,
      whatsapp: r.whatsapp,
      entry: r.entry_number,
      cloud9: r.is_cloud9 ? "Yes" : "No",
      flat: r.flat_no || "-",
      prize: prize || "",
    });
    window.open(waLink(r.whatsapp || r.phone, msg), "_blank");
  }

  function exportCSV() {
    const header = ["Entry", "Name", "Phone", "WhatsApp", "Cloud9", "Flat No", "WA Msg", "IG1", "IG2", "YT", "Date"];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [
          r.entry_number,
          csv(r.full_name),
          r.phone,
          r.whatsapp,
          r.is_cloud9 ? "Yes" : "No",
          csv(r.flat_no || ""),
          r.whatsapp_done ? "Yes" : "No",
          r.instagram1_done ? "Yes" : "No",
          r.instagram2_done ? "Yes" : "No",
          r.youtube_done ? "Yes" : "No",
          new Date(r.created_at).toLocaleString(),
        ].join(","),
      ),
    );
    download("registrations.csv", lines.join("\n"), "text/csv");
  }

  function exportExcel() {
    const rowsHtml = filtered
      .map(
        (r) =>
          `<tr><td>${r.entry_number}</td><td>${esc(r.full_name)}</td><td>${r.phone}</td><td>${r.whatsapp}</td><td>${
            r.is_cloud9 ? "Yes" : "No"
          }</td><td>${esc(r.flat_no || "")}</td><td>${r.whatsapp_done ? "Yes" : "No"}</td><td>${r.instagram1_done ? "Yes" : "No"}</td><td>${
            r.instagram2_done ? "Yes" : "No"
          }</td><td>${r.youtube_done ? "Yes" : "No"}</td><td>${new Date(r.created_at).toLocaleString()}</td></tr>`,
      )
      .join("");
    const html = `<table border="1"><tr><th>Entry</th><th>Name</th><th>Phone</th><th>WhatsApp</th><th>Cloud9</th><th>Flat No</th><th>WA</th><th>IG1</th><th>IG2</th><th>YT</th><th>Date</th></tr>${rowsHtml}</table>`;
    download("registrations.xls", html, "application/vnd.ms-excel");
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      {showConfetti && <Confetti />}
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3">
          <img src={logo} alt="Sharandev Fashion & Creations" className="h-12 w-auto rounded-xl" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-3xl font-black text-maroon sm:text-4xl">
              Lucky Draw Dashboard
            </h1>
            <p className="font-serif-lux text-base italic text-muted-foreground">
              Sharandev Fashions — Cloud9 Saree Exhibition
            </p>
          </div>
          <button
            onClick={onLogout}
            className="shrink-0 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-maroon"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <Stat label="Total Registrations" value={stats.total} accent />
          <Stat label="Cloud9 Members" value={stats.cloud9} />
          <Stat label="Outside Visitors" value={stats.outside} />
          <Stat label="WhatsApp Messages" value={stats.wa} />
          <Stat label="Lucky Draw Entries" value={stats.total} />
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto_auto]">
          <input
            placeholder="Search name, phone, entry…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="col-span-2 rounded-2xl border border-border bg-white px-4 py-3 text-base outline-none focus:border-gold sm:col-span-1"
          />
          <button
            onClick={() => setShowAdd(true)}
            className="rounded-2xl gradient-gold px-5 py-3 font-black text-[color:var(--maroon)] shadow-gold"
          >
            ➕ Add Entry
          </button>
          <button onClick={exportExcel} className="rounded-2xl bg-white px-5 py-3 font-bold text-maroon border border-border">
            📊 Excel
          </button>
          <button onClick={exportCSV} className="rounded-2xl bg-white px-5 py-3 font-bold text-maroon border border-border">
            📄 CSV
          </button>
          <button
            onClick={() => setShowTpl(true)}
            className="rounded-2xl bg-white px-5 py-3 font-bold text-maroon border border-border"
          >
            ✏️ Templates
          </button>
          <button
            onClick={pickWinners}
            className="rounded-2xl gradient-festive px-5 py-3 font-black text-primary-foreground shadow-festive"
          >
            🎲 Pick 3 Winners
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-white shadow-festive">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="gradient-festive text-primary-foreground">
                <tr>
                  {["Entry", "Name", "Phone", "WhatsApp", "Cloud9", "Flat No", "Date & Time", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? "bg-muted/40" : ""}>
                    <td className="px-4 py-3 font-ticket font-black text-primary">{r.entry_number}</td>
                    <td className="px-4 py-3">{r.full_name}</td>
                    <td className="px-4 py-3">{r.phone}</td>
                    <td className="px-4 py-3">{r.whatsapp}</td>
                    <td className="px-4 py-3">{r.is_cloud9 ? "✅ Yes" : "❌ No"}</td>
                    <td className="px-4 py-3">{r.flat_no || "—"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          title="Open WhatsApp chat"
                          onClick={() => openChat(r)}
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white shadow-md transition hover:brightness-110 active:scale-90"
                        >
                          <WhatsAppIcon />
                        </button>
                        <button
                          title="Delete"
                          onClick={() => handleDelete(r)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-maroon transition active:scale-90"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                      No registrations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddEntryModal
          pw={pw}
          onClose={() => setShowAdd(false)}
          onAdded={(row) => {
            setRows((prev) => [row, ...prev]);
            setShowAdd(false);
            toast.success(`Added ${row.entry_number}`);
          }}
        />
      )}

      {showTpl && (
        <TemplateModal
          pw={pw}
          templates={templates}
          onClose={() => setShowTpl(false)}
          onSaved={(k, v) => setTemplates((prev) => ({ ...prev, [k]: v }))}
        />
      )}

      {winners && (
        <div className="fixed inset-0 z-40 grid place-items-center overflow-y-auto bg-black/70 px-5 py-8" onClick={() => setWinners(null)}>
          <div
            className="animate-gift-open w-full max-w-lg rounded-3xl glass-card p-6 text-center shadow-festive"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-5xl">🏆</div>
            <div className="mt-1 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              Lucky Draw Winners
            </div>
            <div className="mt-4 space-y-3 text-left">
              {winners.map((w, i) => (
                <div key={w.id} className="rounded-2xl border border-border bg-white p-4">
                  <div className="text-[10px] font-black uppercase tracking-[0.22em] text-primary">
                    {PRIZES[i]}
                  </div>
                  <div className="mt-1 font-display text-2xl font-black text-maroon">{w.full_name}</div>
                  <div className="font-ticket text-sm font-bold text-primary">{w.entry_number}</div>
                  <div className="mt-1 text-xs text-maroon/70">
                    📱 {w.phone} · {w.is_cloud9 ? `Cloud9${w.flat_no ? ` · ${w.flat_no}` : ""}` : "Visitor"}
                  </div>
                  <button
                    onClick={() => openChat(w, PRIZES[i])}
                    className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#25D366] px-4 py-2 text-sm font-bold text-white"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> Notify Winner
                  </button>
                </div>
              ))}
            </div>
            <button onClick={() => setWinners(null)} className="mt-5 w-full rounded-2xl gradient-festive px-6 py-3 font-bold text-primary-foreground">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function TemplateModal({
  pw,
  templates,
  onClose,
  onSaved,
}: {
  pw: string;
  templates: Record<string, string>;
  onClose: () => void;
  onSaved: (key: string, value: string) => void;
}) {
  const items = [
    { key: "wa_register_template", label: "Customer → Shop (registration message)", vars: "{name} {phone} {whatsapp} {cloud9} {flat}" },
    { key: "wa_customer_template", label: "Admin → Customer (thank you)", vars: "{name} {entry} {phone} {flat}" },
    { key: "wa_winner_template", label: "Admin → Winner (announcement)", vars: "{name} {entry} {prize}" },
  ];
  const [draft, setDraft] = useState<Record<string, string>>({ ...DEFAULT_TEMPLATES, ...templates });
  const [saving, setSaving] = useState<string | null>(null);

  async function save(key: string) {
    setSaving(key);
    try {
      await adminSaveTemplate({ data: { password: pw, key, value: draft[key] } });
      onSaved(key, draft[key]);
      toast.success("Template saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-start overflow-y-auto bg-black/60 px-4 py-8" onClick={onClose}>
      <div className="mx-auto w-full max-w-2xl rounded-3xl bg-white p-6 shadow-festive" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl font-black text-maroon">WhatsApp Templates</h2>
        <p className="mt-1 text-sm text-muted-foreground">Edit the messages sent from the app. Placeholders are replaced automatically.</p>
        <div className="mt-4 space-y-5">
          {items.map((it) => (
            <div key={it.key}>
              <div className="text-sm font-bold text-maroon">{it.label}</div>
              <div className="mb-2 font-ticket text-xs text-muted-foreground">{it.vars}</div>
              <textarea
                rows={6}
                value={draft[it.key] ?? ""}
                onChange={(e) => setDraft((p) => ({ ...p, [it.key]: e.target.value }))}
                className="w-full rounded-xl border border-border px-4 py-3 text-sm outline-none focus:border-gold"
              />
              <button
                onClick={() => save(it.key)}
                disabled={saving === it.key}
                className="mt-2 rounded-xl gradient-gold px-4 py-2 text-sm font-black text-[color:var(--maroon)] disabled:opacity-50"
              >
                {saving === it.key ? "Saving…" : "Save"}
              </button>
            </div>
          ))}
        </div>
        <button onClick={onClose} className="mt-6 w-full rounded-2xl border border-border bg-white px-4 py-3 font-bold text-maroon">
          Close
        </button>
      </div>
    </div>
  );
}

function AddEntryModal({
  pw,
  onClose,
  onAdded,
}: {
  pw: string;
  onClose: () => void;
  onAdded: (r: Row) => void;
}) {
  const [full_name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWa] = useState("");
  const [is_cloud9, setC9] = useState(false);
  const [flat_no, setFlat] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!full_name.trim() || !phone.trim()) return toast.error("Name & phone required");
    setLoading(true);
    try {
      const row = await adminAddRegistration({
        data: {
          password: pw,
          full_name,
          phone,
          whatsapp: whatsapp || phone,
          is_cloud9,
          flat_no: is_cloud9 ? flat_no : "",
        },
      });
      onAdded(row as Row);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-5" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-festive" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl font-black text-maroon">Add New Entry</h2>
        <p className="mt-1 text-sm text-muted-foreground">Walk-in registration by admin</p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
            placeholder="Full Name *"
            value={full_name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
          <input
            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
            placeholder="Phone Number *"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <input
            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
            placeholder="WhatsApp (blank = same as phone)"
            inputMode="tel"
            value={whatsapp}
            onChange={(e) => setWa(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-maroon">
            <input type="checkbox" checked={is_cloud9} onChange={(e) => setC9(e.target.checked)} />
            Cloud9 Resident
          </label>
          {is_cloud9 && (
            <input
              className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
              placeholder="Flat No. (optional)"
              value={flat_no}
              onChange={(e) => setFlat(e.target.value)}
            />
          )}
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 font-bold text-maroon">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={submit}
            className="flex-1 rounded-2xl gradient-festive px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Adding…" : "Add Entry"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-gold ${
        accent ? "gradient-festive text-primary-foreground" : "border border-border bg-white text-maroon"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 font-display text-3xl font-black">{value}</div>
    </div>
  );
}

function csv(s: string) {
  return `"${s.replace(/"/g, '""')}"`;
}
function esc(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
}
function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}