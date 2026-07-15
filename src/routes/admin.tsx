import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Confetti } from "@/components/festive-bg";
import { toast } from "sonner";
import {
  adminLogin,
  adminListRegistrations,
  adminAddRegistration,
  adminDeleteRegistration,
} from "@/lib/admin.functions";

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
  whatsapp_done: boolean;
  instagram1_done: boolean;
  instagram2_done: boolean;
  youtube_done: boolean;
  created_at: string;
};

const PW_KEY = "sharandev_admin_pw";

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
  const [winner, setWinner] = useState<Row | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

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

  function pickWinner() {
    if (!rows.length) return toast.error("No entries yet");
    const w = rows[Math.floor(Math.random() * rows.length)];
    setWinner(w);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 5000);
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

  function openChat(r: Row) {
    const num = (r.whatsapp || r.phone).replace(/\D/g, "");
    const clean = num.length === 10 ? `91${num}` : num;
    const msg = encodeURIComponent(
      `Hi ${r.full_name}! 🎁\n\nThank you for registering for the Sharandev Fashions Cloud9 Saree Exhibition Lucky Draw.\n\nYour Entry Number: ${r.entry_number}\n\nWinners will be announced soon — stay tuned!`,
    );
    window.open(`https://wa.me/${clean}?text=${msg}`, "_blank");
  }

  function exportCSV() {
    const header = ["Entry", "Name", "Phone", "WhatsApp", "Cloud9", "WA Msg", "IG1", "IG2", "YT", "Date"];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [
          r.entry_number,
          csv(r.full_name),
          r.phone,
          r.whatsapp,
          r.is_cloud9 ? "Yes" : "No",
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
          }</td><td>${r.whatsapp_done ? "Yes" : "No"}</td><td>${r.instagram1_done ? "Yes" : "No"}</td><td>${
            r.instagram2_done ? "Yes" : "No"
          }</td><td>${r.youtube_done ? "Yes" : "No"}</td><td>${new Date(r.created_at).toLocaleString()}</td></tr>`,
      )
      .join("");
    const html = `<table border="1"><tr><th>Entry</th><th>Name</th><th>Phone</th><th>WhatsApp</th><th>Cloud9</th><th>WA</th><th>IG1</th><th>IG2</th><th>YT</th><th>Date</th></tr>${rowsHtml}</table>`;
    download("registrations.xls", html, "application/vnd.ms-excel");
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-8">
      {showConfetti && <Confetti />}
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:flex-wrap">
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

        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-[1fr_auto_auto_auto_auto]">
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
            onClick={pickWinner}
            className="rounded-2xl gradient-festive px-5 py-3 font-black text-primary-foreground shadow-festive"
          >
            🎲 Pick Winner
          </button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-white shadow-festive">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="gradient-festive text-primary-foreground">
                <tr>
                  {["Entry", "Name", "Phone", "WhatsApp", "Cloud9", "Date & Time", "Actions"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? "bg-muted/40" : ""}>
                    <td className="px-4 py-3 font-bold text-primary">{r.entry_number}</td>
                    <td className="px-4 py-3">{r.full_name}</td>
                    <td className="px-4 py-3">{r.phone}</td>
                    <td className="px-4 py-3">{r.whatsapp}</td>
                    <td className="px-4 py-3">{r.is_cloud9 ? "✅ Yes" : "❌ No"}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          title="Open WhatsApp chat"
                          onClick={() => openChat(r)}
                          className="grid h-9 w-9 place-items-center rounded-full bg-[#25D366] text-white shadow-md transition active:scale-90"
                        >
                          💬
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
                    <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
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

      {winner && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-5" onClick={() => setWinner(null)}>
          <div
            className="animate-gift-open w-full max-w-md rounded-3xl glass-card p-8 text-center shadow-festive"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-6xl">🏆</div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Lucky Winner
            </div>
            <div className="mt-2 font-display text-3xl font-black text-shimmer">{winner.full_name}</div>
            <div className="mt-1 text-lg font-bold text-primary">{winner.entry_number}</div>
            <div className="mt-4 space-y-1 text-sm text-maroon">
              <div>📱 {winner.phone}</div>
              <div>💬 {winner.whatsapp}</div>
              <div>🏠 {winner.is_cloud9 ? "Cloud9 Member" : "Outside Visitor"}</div>
            </div>
            <div className="mt-6 flex gap-2">
              <button onClick={() => openChat(winner)} className="flex-1 rounded-2xl bg-[#25D366] px-6 py-3 font-bold text-white">
                💬 WhatsApp
              </button>
              <button onClick={() => setWinner(null)} className="flex-1 rounded-2xl gradient-festive px-6 py-3 font-bold text-primary-foreground">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
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