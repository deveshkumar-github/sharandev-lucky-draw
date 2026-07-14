import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { StepHeader } from "@/components/step-header";
import { loadReg, saveReg, type PendingReg } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/connect")({
  component: ConnectPage,
  head: () => ({
    meta: [
      { title: "Connect With Us — Cloud9 Lucky Draw" },
      { name: "description", content: "Follow us on WhatsApp, Instagram and YouTube to complete your Lucky Draw entry." },
    ],
  }),
});

type Key = "whatsapp_done" | "instagram1_done" | "instagram2_done" | "youtube_done";

const WA_PHONE = "9394104671";
const IG1 = "https://www.instagram.com/sharandev.creations/";
const IG2 = "https://www.instagram.com/sharandev_creations/";
const YT = "https://www.youtube.com/@sharandev_creations";

function ConnectPage() {
  const navigate = useNavigate();
  const [reg, setReg] = useState<PendingReg | null>(null);
  const [state, setState] = useState<Record<Key, boolean>>({
    whatsapp_done: false,
    instagram1_done: false,
    instagram2_done: false,
    youtube_done: false,
  });

  useEffect(() => {
    const r = loadReg();
    if (!r) {
      navigate({ to: "/register" });
      return;
    }
    setReg(r);
  }, [navigate]);

  if (!reg) return null;

  const total = 4;
  const done = Object.values(state).filter(Boolean).length;
  const pct = (done / total) * 100;

  async function mark(key: Key) {
    if (state[key]) return;
    const next = { ...state, [key]: true };
    setState(next);
    await supabase
      .from("registrations")
      .update({ [key]: true } as Record<string, boolean>)
      .eq("id", reg!.id);
  }

  function openWhatsApp() {
    const msg =
      `Hello Sharandev Fashions! 👋\nI have registered for the Cloud9 Saree Exhibition Lucky Draw.\n\n` +
      `Name: ${reg!.full_name}\nPhone: ${reg!.phone}\nWhatsApp: ${reg!.whatsapp}\n` +
      `Cloud9 Resident: ${reg!.is_cloud9 ? "Yes" : "No"}\n\nThank you! 🎁`;
    const url = `https://wa.me/${WA_PHONE}?text=${encodeURIComponent(msg)}`;
    window.open(url, "_blank");
    mark("whatsapp_done");
  }

  function openExternal(url: string, key: Key) {
    window.open(url, "_blank");
    mark(key);
  }

  async function finish() {
    if (done < 1) {
      toast.error("Please complete at least the WhatsApp step");
      return;
    }
    saveReg(reg!);
    navigate({ to: "/success" });
  }

  const cards: { key: Key; icon: string; title: string; sub: string; action: () => void }[] = [
    { key: "whatsapp_done", icon: "💬", title: "WhatsApp Us", sub: "Send your details", action: openWhatsApp },
    { key: "instagram1_done", icon: "📷", title: "Follow @sharandev.creations", sub: "Instagram", action: () => openExternal(IG1, "instagram1_done") },
    { key: "instagram2_done", icon: "📷", title: "Follow @sharandev_creations", sub: "Instagram", action: () => openExternal(IG2, "instagram2_done") },
    { key: "youtube_done", icon: "▶", title: "Subscribe on YouTube", sub: "@sharandev_creations", action: () => openExternal(YT, "youtube_done") },
  ];

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <StepHeader step={2} total={3} title="Connect With Us" />
        <div className="mb-4 rounded-2xl bg-white/60 p-4 text-center backdrop-blur">
          <div className="text-sm text-muted-foreground">Progress</div>
          <div className="text-2xl font-black text-primary">{done} / {total}</div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full gradient-gold transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="space-y-3">
          {cards.map((c) => (
            <button
              key={c.key}
              onClick={c.action}
              className={`flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-left transition active:scale-[.98] ${
                state[c.key]
                  ? "border-[color:var(--success)] bg-[color:var(--success)]/10"
                  : "border-border bg-white hover:border-gold shadow-gold/40"
              }`}
            >
              <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl gradient-festive text-2xl text-primary-foreground shadow-festive">
                {c.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-base font-bold text-maroon">{c.title}</div>
                <div className="truncate text-sm text-muted-foreground">{c.sub}</div>
              </div>
              <div className="shrink-0 text-sm font-bold">
                {state[c.key] ? <span className="text-[color:var(--success)]">✅ Done</span> : <span className="text-primary">Open →</span>}
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={finish}
          className="mt-6 w-full rounded-2xl gradient-festive px-6 py-4 text-lg font-bold text-primary-foreground shadow-festive transition active:scale-95"
        >
          Finish & See My Entry 🎟
        </button>
      </div>
    </div>
  );
}