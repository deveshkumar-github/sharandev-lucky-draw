import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/festive-bg";
import { clearReg, loadReg, type PendingReg } from "@/lib/session";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
  head: () => ({
    meta: [
      { title: "You're In! — Cloud9 Lucky Draw" },
      { name: "description", content: "You are entered in the Cloud9 Saree Exhibition Lucky Draw." },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SuccessPage() {
  const navigate = useNavigate();
  const [reg, setReg] = useState<PendingReg | null>(null);

  useEffect(() => {
    const r = loadReg();
    if (!r) navigate({ to: "/" });
    else setReg(r);
  }, [navigate]);

  if (!reg) return null;
  const date = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });

  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-10">
      <Confetti />
      <div className="relative mx-auto flex min-h-[85vh] max-w-md flex-col items-center justify-center text-center">
        <div className="animate-gift-open mb-6 grid h-36 w-36 place-items-center rounded-[36px] gradient-festive shadow-festive">
          <span className="text-7xl">🎉</span>
        </div>
        <h1 className="text-4xl font-black leading-tight">
          <span className="text-shimmer">Congratulations!</span>
        </h1>
        <p className="mt-3 text-lg text-maroon">
          You have successfully entered the Lucky Draw.
        </p>

        <div className="mt-8 w-full rounded-3xl glass-card p-6 shadow-festive">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            🎟 Entry Number
          </div>
          <div className="mt-1 text-4xl font-black text-primary">{reg.entry_number}</div>
          <div className="mt-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            📅 Registered On
          </div>
          <div className="mt-1 text-base font-semibold text-maroon">{date}</div>
          <div className="mt-5 rounded-2xl bg-primary/5 p-3 text-sm text-maroon">
            Thank you, <b>{reg.full_name}</b>! Winners will be contacted on your
            registered WhatsApp number.
          </div>
        </div>

        <Link
          to="/"
          onClick={() => clearReg()}
          className="mt-8 inline-flex w-full items-center justify-center rounded-2xl gradient-gold px-8 py-5 text-lg font-black text-[color:var(--maroon)] shadow-gold transition active:scale-95"
        >
          Visit Exhibition ✨
        </Link>
      </div>
    </div>
  );
}