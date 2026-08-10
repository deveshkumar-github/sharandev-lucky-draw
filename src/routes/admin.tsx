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
  adminUpdatePayment,
} from "@/lib/admin.functions";
import {
  adminSetFlags,
  adminUpdateRegistration,
  adminMergeRegistrations,
} from "@/lib/admin.functions";
import { DEFAULT_TEMPLATES, fillTemplate, waLink, money } from "@/lib/templates";
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
  bill_no?: string | null;
  total_bill: number;
  total_paid: number;
  fully_paid: boolean;
  saved_done?: boolean;
  followup_done?: boolean;
  whatsapp_done: boolean;
  instagram1_done: boolean;
  instagram2_done: boolean;
  youtube_done: boolean;
  created_at: string;
};

const PW_KEY = "sharandev_admin_pw";
const MONEY_KEY = "sharandev_admin_show_money";

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
  const [editRow, setEditRow] = useState<Row | null>(null);
  const [fullEditRow, setFullEditRow] = useState<Row | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [merging, setMerging] = useState(false);
  const [templates, setTemplates] = useState<Record<string, string>>(DEFAULT_TEMPLATES);

  const [live, setLive] = useState(true);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [showMoney, setShowMoney] = useState(true);
  const [askMoneyPw, setAskMoneyPw] = useState(false);
  const [moneyPw, setMoneyPw] = useState("");
  const [moneyErr, setMoneyErr] = useState(false);
  const [notices, setNotices] = useState<Row[]>([]);
  const [targetDraft, setTargetDraft] = useState("");
  const [savingTarget, setSavingTarget] = useState(false);
  const [prefillBillNo, setPrefillBillNo] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined")
      setShowMoney(sessionStorage.getItem(MONEY_KEY) === "1");
  }, []);

  function toggleMoney() {
    if (showMoney) {
      setShowMoney(false);
      sessionStorage.setItem(MONEY_KEY, "0");
      return;
    }
    setMoneyPw("");
    setMoneyErr(false);
    setAskMoneyPw(true);
  }

  function submitMoneyPw(e: React.FormEvent) {
    e.preventDefault();
    if (moneyPw === "Sharandev@Money") {
      setShowMoney(true);
      sessionStorage.setItem(MONEY_KEY, "1");
      setAskMoneyPw(false);
    } else {
      setMoneyErr(true);
    }
  }

  async function refresh(silent = false) {
    try {
      const data = await adminListRegistrations({ data: { password: pw } });
      setRows((prev) => {
        const next = (data ?? []) as Row[];
        if (silent && prev.length) {
          const known = new Set(prev.map((p) => p.id));
          const fresh = next.filter((n) => !known.has(n.id));
          if (fresh.length) {
            setNotices((cur) => [...fresh, ...cur].slice(0, 6));
            toast.success(`${fresh.length} new registration${fresh.length > 1 ? "s" : ""} 🎉`);
          }
        }
        return next;
      });
      setLastSync(new Date());
    } catch (e: unknown) {
      if (!silent) toast.error(e instanceof Error ? e.message : "Failed to load");
    }
  }

  useEffect(() => {
    if (!live) return;
    const t = setInterval(() => refresh(true), 4000);
    const onFocus = () => refresh(true);
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(t);
      window.removeEventListener("focus", onFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [live, rows.length]);

  useEffect(() => {
    refresh();
    adminListTemplates({ data: { password: pw } })
      .then((list) => {
        const map = { ...DEFAULT_TEMPLATES };
        for (const t of list as { key: string; value: string }[]) map[t.key] = t.value;
        setTemplates(map);
        setTargetDraft(map.bill_target ?? "120");
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter((r) =>
      [r.full_name, r.phone, r.whatsapp, r.entry_number, r.bill_no ?? ""].some((v) =>
        v.toLowerCase().includes(s),
      ),
    );
  }, [q, rows]);

  const stats = useMemo(() => {
    const total = rows.length;
    const cloud9 = rows.filter((r) => r.is_cloud9).length;
    const outside = total - cloud9;
    const wa = rows.filter((r) => r.whatsapp_done).length;
    const billed = rows.reduce((a, r) => a + Number(r.total_bill || 0), 0);
    const collected = rows.reduce((a, r) => a + Number(r.total_paid || 0), 0);
    const pending = Math.max(0, billed - collected);
    const pendingCount = rows.filter(
      (r) => Number(r.total_bill || 0) - Number(r.total_paid || 0) > 0,
    ).length;
    return { total, cloud9, outside, wa, billed, collected, pending, pendingCount };
  }, [rows]);

  const billTarget = Math.max(0, Math.min(5000, Number(templates.bill_target ?? 120) || 0));

  const missingBills = useMemo(() => {
    const used = new Set<number>();
    for (const r of rows) {
      const n = Number(String(r.bill_no ?? "").replace(/[^0-9]/g, ""));
      if (n > 0) used.add(n);
    }
    const miss: number[] = [];
    for (let i = 1; i <= billTarget; i++) if (!used.has(i)) miss.push(i);
    return { miss, usedCount: used.size };
  }, [rows, billTarget]);

  async function saveTarget() {
    setSavingTarget(true);
    try {
      const v = String(Math.max(0, Math.min(5000, Number(targetDraft) || 0)));
      await adminSaveTemplate({ data: { password: pw, key: "bill_target", value: v } });
      setTemplates((p) => ({ ...p, bill_target: v }));
      toast.success("Total bills target saved");
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSavingTarget(false);
    }
  }

  async function toggleFlag(r: Row, field: "saved_done" | "followup_done", value: boolean) {
    setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, [field]: value } : x)));
    try {
      await adminSetFlags({ data: { password: pw, id: r.id, [field]: value } });
    } catch (e: unknown) {
      setRows((prev) => prev.map((x) => (x.id === r.id ? { ...x, [field]: !value } : x)));
      toast.error(e instanceof Error ? e.message : "Update failed");
    }
  }

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

  function toggleSelect(id: string, on: boolean) {
    setSelected((prev) => (on ? [...new Set([...prev, id])] : prev.filter((x) => x !== id)));
  }

  async function mergeSelected() {
    if (selected.length < 2) return toast.error("Select at least 2 entries to merge");
    const chosen = rows.filter((r) => selected.includes(r.id));
    const primary = [...chosen].sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    )[0];
    if (
      !confirm(
        `Merge ${chosen.length} entries into ${primary.entry_number} — ${primary.full_name}?\nBills and payments will be added together and the other entries removed.`,
      )
    )
      return;
    setMerging(true);
    try {
      const res = await adminMergeRegistrations({
        data: { password: pw, primaryId: primary.id, mergeIds: selected },
      });
      const merged = res.merged as Row;
      const removed = new Set(res.removedIds);
      setRows((prev) =>
        prev.filter((x) => !removed.has(x.id)).map((x) => (x.id === merged.id ? merged : x)),
      );
      setSelected([]);
      toast.success(`Merged into ${merged.entry_number}`);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Merge failed");
    } finally {
      setMerging(false);
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
      bill: money(r.total_bill),
      paid: money(r.total_paid),
      pending: money(Math.max(0, Number(r.total_bill || 0) - Number(r.total_paid || 0))),
      prize: prize || "",
    });
    window.open(waLink(r.whatsapp || r.phone, msg), "_blank");
  }

  function exportCSV() {
    const header = ["Entry", "Name", "Phone", "WhatsApp", "Cloud9", "Bill No", "Total Bill", "Total Paid", "Pending", "Fully Paid", "Saved", "Followed Up", "WA Msg", "IG1", "IG2", "YT", "Date"];
    const lines = [header.join(",")].concat(
      filtered.map((r) =>
        [
          r.entry_number,
          csv(r.full_name),
          r.phone,
          r.whatsapp,
          r.is_cloud9 ? "Yes" : "No",
          csv(r.bill_no ?? ""),
          String(r.total_bill ?? 0),
          String(r.total_paid ?? 0),
          String(Math.max(0, Number(r.total_bill || 0) - Number(r.total_paid || 0))),
          r.fully_paid ? "Yes" : "No",
          r.saved_done ? "Yes" : "No",
          r.followup_done ? "Yes" : "No",
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
          }</td><td>${esc(r.bill_no ?? "")}</td><td>${r.total_bill ?? 0}</td><td>${r.total_paid ?? 0}</td><td>${Math.max(0, Number(r.total_bill || 0) - Number(r.total_paid || 0))}</td><td>${r.fully_paid ? "Yes" : "No"}</td><td>${r.whatsapp_done ? "Yes" : "No"}</td><td>${r.instagram1_done ? "Yes" : "No"}</td><td>${
            r.instagram2_done ? "Yes" : "No"
          }</td><td>${r.youtube_done ? "Yes" : "No"}</td><td>${new Date(r.created_at).toLocaleString()}</td></tr>`,
      )
      .join("");
    const html = `<table border="1"><tr><th>Entry</th><th>Name</th><th>Phone</th><th>WhatsApp</th><th>Cloud9</th><th>Bill No</th><th>Total Bill</th><th>Total Paid</th><th>Pending</th><th>Fully Paid</th><th>WA</th><th>IG1</th><th>IG2</th><th>YT</th><th>Date</th></tr>${rowsHtml}</table>`;
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
              Sharandev Fashions SAREE EXHIBITION
            </p>
          </div>
          <button
            onClick={onLogout}
            className="shrink-0 rounded-xl border border-border bg-white px-4 py-2 text-sm font-bold text-maroon"
          >
            Sign out
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label="Total Registrations" value={String(stats.total)} accent />
          <Stat label="Cloud9 Members" value={String(stats.cloud9)} />
          <Stat label="Outside Visitors" value={String(stats.outside)} />
          <Stat label="WhatsApp Messages" value={String(stats.wa)} />
        </div>

        <div className="mt-3 flex justify-end">
          <button
            onClick={toggleMoney}
            className="rounded-xl border border-border bg-white px-4 py-2 text-xs font-bold text-maroon"
          >
            {showMoney ? "🙈 Hide amounts" : "👁️ Show amounts"}
          </button>
        </div>

        {askMoneyPw && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            <form
              onSubmit={submitMoneyPw}
              className="w-full max-w-sm rounded-2xl border border-border bg-white p-5 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-maroon">Protected view</h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Enter the password to view billing amounts.
              </p>
              <input
                type="password"
                autoFocus
                value={moneyPw}
                onChange={(e) => {
                  setMoneyPw(e.target.value);
                  setMoneyErr(false);
                }}
                placeholder="Password"
                className="mt-3 w-full rounded-xl border border-border bg-white px-4 py-3 text-base text-maroon outline-none focus:border-gold"
              />
              {moneyErr && (
                <p className="mt-2 text-xs font-semibold text-destructive">Incorrect password</p>
              )}
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={() => setAskMoneyPw(false)}
                  className="flex-1 rounded-xl border border-border px-4 py-2 text-sm font-bold text-maroon"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-maroon px-4 py-2 text-sm font-bold text-primary-foreground"
                >
                  Unlock
                </button>
              </div>
            </form>
          </div>
        )}

        {showMoney && (
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat label="Total Billed" value={`₹${money(stats.billed)}`} accent />
            <Stat label="Total Collected" value={`₹${money(stats.collected)}`} />
            <Stat label="Pending Amount" value={`₹${money(stats.pending)}`} danger />
            <Stat label="Pending Customers" value={String(stats.pendingCount)} />
          </div>
        )}

        <div className="mt-3 rounded-3xl border-2 border-gold/60 bg-[color:var(--gold)]/10 p-4 shadow-gold">
          <div className="flex flex-wrap items-center gap-3">
            <div className="font-display text-lg font-black text-maroon">🧾 Missing Bill Numbers</div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-bold text-maroon">Total bills</span>
              <input
                value={targetDraft}
                onChange={(e) => setTargetDraft(e.target.value.replace(/[^0-9]/g, ""))}
                className="w-20 rounded-xl border border-border bg-white px-3 py-2 text-center font-ticket font-black text-maroon outline-none focus:border-gold"
              />
              <button
                onClick={saveTarget}
                disabled={savingTarget}
                className="rounded-xl gradient-gold px-3 py-2 text-xs font-black text-[color:var(--maroon)] disabled:opacity-50"
              >
                {savingTarget ? "…" : "Save"}
              </button>
            </div>
          </div>
          <div className="mt-2 text-xs font-semibold text-maroon/70">
            {missingBills.usedCount} of {billTarget} bills entered · {missingBills.miss.length} missing.
            Tap a number to add its details.
          </div>
          <div className="mt-3 flex max-h-40 flex-wrap gap-2 overflow-y-auto">
            {missingBills.miss.length === 0 ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-xs font-bold text-emerald-700">
                All bills entered ✓
              </span>
            ) : (
              missingBills.miss.map((n) => (
                <button
                  key={n}
                  onClick={() => {
                    setPrefillBillNo(String(n));
                    setShowAdd(true);
                  }}
                  className="rounded-full border-2 border-primary/40 bg-white px-3 py-1.5 font-ticket text-sm font-black text-primary transition hover:bg-primary hover:text-primary-foreground active:scale-90"
                >
                  {n}
                </button>
              ))
            )}
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-white px-4 py-3">
          <span className="relative flex h-2.5 w-2.5">
            {live && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            )}
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${live ? "bg-primary" : "bg-muted-foreground"}`} />
          </span>
          <span className="text-sm font-bold text-maroon">
            {live ? "Live — auto updating" : "Live updates paused"}
          </span>
          {lastSync && (
            <span className="text-xs text-muted-foreground">
              Last sync {lastSync.toLocaleTimeString()}
            </span>
          )}
          <button
            onClick={() => setLive((v) => !v)}
            className="ml-auto rounded-xl border border-border px-3 py-1.5 text-xs font-bold text-maroon"
          >
            {live ? "Pause" : "Resume"}
          </button>
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
          {selected.length > 0 && (
            <div className="flex flex-wrap items-center gap-3 border-b border-border bg-[color:var(--gold)]/10 px-4 py-3">
              <span className="text-sm font-bold text-maroon">{selected.length} selected</span>
              <button
                onClick={() => setSelected([])}
                className="rounded-xl border border-border bg-white px-3 py-1.5 text-xs font-bold text-maroon"
              >
                Clear
              </button>
              <button
                onClick={mergeSelected}
                disabled={merging || selected.length < 2}
                className="ml-auto rounded-xl gradient-gold px-4 py-2 text-xs font-black text-[color:var(--maroon)] disabled:opacity-50"
              >
                {merging ? "Merging…" : "🔗 Merge selected entries"}
              </button>
            </div>
          )}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="gradient-festive text-primary-foreground">
                <tr>
                  {[
                    "",
                    "Entry",
                    "Name",
                    "Phone",
                    "WhatsApp",
                    "Cloud9",
                    "Bill No",
                    ...(showMoney ? ["Bill", "Paid", "Pending"] : []),
                    "Date & Time",
                    "Saved",
                    "Follow-up",
                    "Actions",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-bold">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((r, i) => (
                  <tr key={r.id} className={i % 2 ? "bg-muted/40" : ""}>
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        title="Select for merge"
                        className="h-4 w-4 accent-[color:var(--primary)]"
                        checked={selected.includes(r.id)}
                        onChange={(e) => toggleSelect(r.id, e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3 font-ticket font-black text-primary">{r.entry_number}</td>
                    <td className="px-4 py-3">{r.full_name}</td>
                    <td className="px-4 py-3">{r.phone}</td>
                    <td className="px-4 py-3">{r.whatsapp}</td>
                    <td className="px-4 py-3">{r.is_cloud9 ? "✅ Yes" : "❌ No"}</td>
                    <td className="px-4 py-3 font-ticket">{r.bill_no || "—"}</td>
                    {showMoney && (
                      <>
                        <td className="px-4 py-3 font-ticket font-bold">₹{money(r.total_bill)}</td>
                        <td className="px-4 py-3 font-ticket font-bold">₹{money(r.total_paid)}</td>
                        <td className="px-4 py-3">
                          {Number(r.total_bill || 0) - Number(r.total_paid || 0) > 0 ? (
                            <span className="rounded-full bg-primary/10 px-2.5 py-1 font-ticket text-xs font-black text-primary">
                              ₹{money(Number(r.total_bill || 0) - Number(r.total_paid || 0))}
                            </span>
                          ) : (
                            <span className="rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold text-emerald-700">
                              Paid ✓
                            </span>
                          )}
                        </td>
                      </>
                    )}
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString()}</td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        title="Saved"
                        className="h-5 w-5 accent-[color:var(--primary)]"
                        checked={!!r.saved_done}
                        onChange={(e) => toggleFlag(r, "saved_done", e.target.checked)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        title="Followed up"
                        className="h-5 w-5 accent-[color:var(--primary)]"
                        checked={!!r.followup_done}
                        onChange={(e) => toggleFlag(r, "followup_done", e.target.checked)}
                      />
                    </td>
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
                          title="Edit payment"
                          onClick={() => setEditRow(r)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-maroon transition active:scale-90"
                        >
                          💰
                        </button>
                        <button
                          title="Edit entry"
                          onClick={() => setFullEditRow(r)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-border bg-white text-maroon transition active:scale-90"
                        >
                          ✏️
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
                    <td colSpan={showMoney ? 14 : 11} className="px-4 py-10 text-center text-muted-foreground">
                      No registrations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {notices.length > 0 && (
        <div className="fixed bottom-4 right-4 z-50 w-[19rem] space-y-2">
          {notices.map((n) => (
            <div
              key={n.id}
              className="animate-gift-open rounded-2xl border border-gold/50 bg-white p-3 shadow-festive"
            >
              <div className="flex items-start gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-ticket text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                    New Entry · {n.entry_number}
                  </div>
                  <div className="truncate font-display text-lg font-black text-maroon">{n.full_name}</div>
                  <div className="text-xs text-maroon/70">📱 {n.whatsapp || n.phone}</div>
                </div>
                <button
                  onClick={() => setNotices((c) => c.filter((x) => x.id !== n.id))}
                  className="text-sm text-muted-foreground"
                  title="Dismiss"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={() => openChat(n)}
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-3 py-2 text-sm font-bold text-white active:scale-95"
              >
                <WhatsAppIcon className="h-4 w-4" /> Send WhatsApp
              </button>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddEntryModal
          initialBillNo={prefillBillNo}
          pw={pw}
          onClose={() => {
            setShowAdd(false);
            setPrefillBillNo("");
          }}
          onAdded={(row) => {
            setRows((prev) => [row, ...prev]);
            setShowAdd(false);
            toast.success(`Added ${row.entry_number}`);
          }}
        />
      )}

      {editRow && (
        <PaymentModal
          pw={pw}
          row={editRow}
          onClose={() => setEditRow(null)}
          onSaved={(row) => {
            setRows((prev) => prev.map((x) => (x.id === row.id ? row : x)));
            setEditRow(null);
            toast.success("Payment updated");
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
                    📱 {w.phone} · {w.is_cloud9 ? "Cloud9" : "Visitor"} · Bill ₹{money(w.total_bill)}
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
    { key: "coupon_title", label: "Coupon Title (shown on the lucky draw coupon)", vars: "plain text", rows: 2 },
    { key: "coupon_subtitle", label: "Coupon Sub-title", vars: "plain text", rows: 2 },
    { key: "wa_register_template", label: "Customer → Shop (registration message)", vars: "{name} {phone} {whatsapp} {cloud9} {bill} {paid} {pending}", rows: 6 },
    { key: "wa_customer_template", label: "Admin → Customer (thank you)", vars: "{name} {entry} {phone} {bill} {paid} {pending}", rows: 6 },
    { key: "wa_winner_template", label: "Admin → Winner (announcement)", vars: "{name} {entry} {prize}", rows: 6 },
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
        <h2 className="font-display text-2xl font-black text-maroon">Coupon &amp; WhatsApp Settings</h2>
        <p className="mt-1 text-sm text-muted-foreground">Edit the messages sent from the app. Placeholders are replaced automatically.</p>
        <div className="mt-4 space-y-5">
          {items.map((it) => (
            <div key={it.key}>
              <div className="text-sm font-bold text-maroon">{it.label}</div>
              <div className="mb-2 font-ticket text-xs text-muted-foreground">{it.vars}</div>
              <textarea
                rows={it.rows}
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
  initialBillNo = "",
}: {
  pw: string;
  onClose: () => void;
  onAdded: (r: Row) => void;
  initialBillNo?: string;
}) {
  const [full_name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWa] = useState("");
  const [is_cloud9, setC9] = useState(false);
  const [bill, setBill] = useState("");
  const [billNo, setBillNo] = useState(initialBillNo);
  const [paid, setPaid] = useState("");
  const [fullPaid, setFullPaid] = useState(false);
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
          bill_no: billNo,
          total_bill: Number(bill) || 0,
          total_paid: Number(paid) || 0,
          fully_paid: fullPaid,
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
          <input
            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
            placeholder="Total Bill (₹)"
            inputMode="decimal"
            value={bill}
            onChange={(e) => setBill(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <input
            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
            placeholder="Bill No"
            value={billNo}
            maxLength={40}
            onChange={(e) => setBillNo(e.target.value)}
          />
          <label className="flex items-center gap-2 text-sm text-maroon">
            <input type="checkbox" checked={fullPaid} onChange={(e) => setFullPaid(e.target.checked)} />
            Fully paid
          </label>
          {!fullPaid && (
            <input
              className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
              placeholder="Total Paid (₹)"
              inputMode="decimal"
              value={paid}
              onChange={(e) => setPaid(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          )}
          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-2 text-sm">
            <span className="font-semibold text-maroon">Pending</span>
            <span className="font-ticket font-black text-primary">
              ₹{Math.max(0, (Number(bill) || 0) - (fullPaid ? Number(bill) || 0 : Number(paid) || 0)).toLocaleString("en-IN")}
            </span>
          </div>
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

function Stat({
  label,
  value,
  accent,
  danger,
}: {
  label: string;
  value: string;
  accent?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-4 shadow-gold ${
        accent
          ? "gradient-festive text-primary-foreground"
          : danger
            ? "border border-primary/40 bg-primary/5 text-primary"
            : "border border-border bg-white text-maroon"
      }`}
    >
      <div className="text-xs font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className="mt-1 font-display text-2xl font-black sm:text-3xl">{value}</div>
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
function PaymentModal({
  pw,
  row,
  onClose,
  onSaved,
}: {
  pw: string;
  row: Row;
  onClose: () => void;
  onSaved: (r: Row) => void;
}) {
  const [bill, setBill] = useState(String(row.total_bill ?? 0));
  const [paid, setPaid] = useState(String(row.total_paid ?? 0));
  const [fullPaid, setFullPaid] = useState(!!row.fully_paid);
  const [loading, setLoading] = useState(false);
  const pending = Math.max(0, (Number(bill) || 0) - (fullPaid ? Number(bill) || 0 : Number(paid) || 0));

  async function save() {
    setLoading(true);
    try {
      const updated = await adminUpdatePayment({
        data: {
          password: pw,
          id: row.id,
          total_bill: Number(bill) || 0,
          total_paid: Number(paid) || 0,
          fully_paid: fullPaid,
        },
      });
      onSaved(updated as Row);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 px-5" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-festive" onClick={(e) => e.stopPropagation()}>
        <h2 className="font-display text-2xl font-black text-maroon">Update Payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {row.entry_number} · {row.full_name}
        </p>
        <div className="mt-4 space-y-3">
          <input
            className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
            placeholder="Total Bill (₹)"
            inputMode="decimal"
            value={bill}
            onChange={(e) => setBill(e.target.value.replace(/[^0-9.]/g, ""))}
          />
          <label className="flex items-center gap-2 text-sm text-maroon">
            <input type="checkbox" checked={fullPaid} onChange={(e) => setFullPaid(e.target.checked)} />
            Fully paid
          </label>
          {!fullPaid && (
            <input
              className="w-full rounded-xl border border-border px-4 py-3 outline-none focus:border-gold"
              placeholder="Total Paid (₹)"
              inputMode="decimal"
              value={paid}
              onChange={(e) => setPaid(e.target.value.replace(/[^0-9.]/g, ""))}
            />
          )}
          <div className="flex items-center justify-between rounded-xl bg-muted px-4 py-2 text-sm">
            <span className="font-semibold text-maroon">Pending</span>
            <span className="font-ticket font-black text-primary">₹{money(pending)}</span>
          </div>
        </div>
        <div className="mt-6 flex gap-2">
          <button onClick={onClose} className="flex-1 rounded-2xl border border-border bg-white px-4 py-3 font-bold text-maroon">
            Cancel
          </button>
          <button
            disabled={loading}
            onClick={save}
            className="flex-1 rounded-2xl gradient-festive px-4 py-3 font-bold text-primary-foreground disabled:opacity-50"
          >
            {loading ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
