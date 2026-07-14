import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Confetti } from "@/components/festive-bg";
import { toast } from "sonner";

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

function AdminPage() {
  const [session, setSession] = useState<{ user_id: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ? { user_id: data.session.user.id } : null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s ? { user_id: s.user.id } : null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) { setIsAdmin(null); return; }
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user_id)
      .eq("role", "admin")
      .maybeSingle()
      .then(({ data }) => setIsAdmin(!!data));
  }, [session]);

  if (!session) return <Login />;
  if (isAdmin === null) return <Center>Loading…</Center>;
  if (!isAdmin) return <NotAdmin />;
  return <Dashboard />;
}

function Center({ children }: { children: React.ReactNode }) {
  return <div className="grid min-h-screen place-items-center px-5 text-maroon">{children}</div>;
}

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    const fn = mode === "signin"
      ? supabase.auth.signInWithPassword({ email, password })
      : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin + "/admin" } });
    const { error } = await fn;
    setLoading(false);
    if (error) return toast.error(error.message);
    if (mode === "signup") toast.success("Account created. Ask an existing admin to grant you access.");
  }

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-sm rounded-3xl glass-card p-6 shadow-festive">
        <h1 className="text-2xl font-black text-maroon">Admin {mode === "signin" ? "Login" : "Sign Up"}</h1>
        <p className="mt-1 text-sm text-muted-foreground">Sharandev Fashions Lucky Draw</p>
        <div className="mt-5 space-y-3">
          <input className="input-lg" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input className="input-lg" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button disabled={loading} onClick={submit} className="w-full rounded-2xl gradient-festive px-6 py-4 text-base font-bold text-primary-foreground shadow-festive active:scale-95 disabled:opacity-50">
            {loading ? "…" : mode === "signin" ? "Sign in" : "Create account"}
          </button>
          <button onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="w-full text-sm font-semibold text-primary">
            {mode === "signin" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </div>
      </div>
      <style>{`.input-lg{width:100%;padding:14px 16px;border-radius:14px;border:1.5px solid var(--border);background:white;font-size:16px;outline:none}.input-lg:focus{border-color:var(--gold)}`}</style>
    </div>
  );
}

function NotAdmin() {
  return (
    <div className="grid min-h-screen place-items-center px-5 text-center">
      <div className="max-w-sm rounded-3xl glass-card p-8 shadow-festive">
        <div className="text-4xl">🔒</div>
        <h1 className="mt-3 text-2xl font-black text-maroon">Not an admin</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your account has no admin access. Ask the Sharandev Fashions team to grant you admin role.
        </p>
        <button
          onClick={() => supabase.auth.signOut()}
          className="mt-5 w-full rounded-2xl bg-primary px-6 py-3 text-sm font-bold text-primary-foreground"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}

function Dashboard() {
  const [rows, setRows] = useState<Row[]>([]);
  const [q, setQ] = useState("");
  const [winner, setWinner] = useState<Row | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Row[]));
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
    // Simple .xls via HTML table (Excel-compatible)
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
            <h1 className="truncate text-2xl font-black text-maroon sm:text-3xl">Lucky Draw Dashboard</h1>
            <p className="text-sm text-muted-foreground">Sharandev Fashions — Cloud9 Saree Exhibition</p>
          </div>
          <button onClick={() => supabase.auth.signOut()} className="shrink-0 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-maroon">
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

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto_auto_auto]">
          <input
            placeholder="Search name, phone, entry…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-2xl border-1.5 border-border bg-white px-4 py-3 text-base outline-none focus:border-gold"
          />
          <button onClick={exportExcel} className="rounded-2xl bg-white px-5 py-3 font-bold text-maroon border border-border">📊 Excel</button>
          <button onClick={exportCSV} className="rounded-2xl bg-white px-5 py-3 font-bold text-maroon border border-border">📄 CSV</button>
          <button onClick={pickWinner} className="rounded-2xl gradient-festive px-5 py-3 font-black text-primary-foreground shadow-festive">🎲 Pick Random Winner</button>
        </div>

        <div className="mt-4 overflow-hidden rounded-3xl border border-border bg-white shadow-festive">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="gradient-festive text-primary-foreground">
                <tr>
                  {["Entry", "Name", "Phone", "WhatsApp", "Cloud9", "Date & Time"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">{h}</th>
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
                    <td className="px-4 py-3">{new Date(r.created_at).toLocaleString()}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-10 text-center text-muted-foreground">No registrations yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {winner && (
        <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-5" onClick={() => setWinner(null)}>
          <div className="animate-gift-open w-full max-w-md rounded-3xl glass-card p-8 text-center shadow-festive" onClick={(e) => e.stopPropagation()}>
            <div className="text-6xl">🏆</div>
            <div className="mt-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Lucky Winner</div>
            <div className="mt-2 text-3xl font-black text-shimmer">{winner.full_name}</div>
            <div className="mt-1 text-lg font-bold text-primary">{winner.entry_number}</div>
            <div className="mt-4 space-y-1 text-sm text-maroon">
              <div>📱 {winner.phone}</div>
              <div>💬 {winner.whatsapp}</div>
              <div>🏠 {winner.is_cloud9 ? "Cloud9 Member" : "Outside Visitor"}</div>
            </div>
            <button onClick={() => setWinner(null)} className="mt-6 w-full rounded-2xl gradient-festive px-6 py-3 font-bold text-primary-foreground">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className={`rounded-2xl p-4 shadow-gold ${accent ? "gradient-festive text-primary-foreground" : "bg-white text-maroon border border-border"}`}>
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 text-3xl font-black">{value}</div>
    </div>
  );
}

function csv(s: string) { return `"${s.replace(/"/g, '""')}"`; }
function esc(s: string) { return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!)); }
function download(name: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}