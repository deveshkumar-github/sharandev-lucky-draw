import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Confetti } from "@/components/festive-bg";
import { clearReg, loadReg, type PendingReg } from "@/lib/session";
import { getSettings, DEFAULT_TEMPLATES, money } from "@/lib/templates";

export const Route = createFileRoute("/success")({
  component: SuccessPage,
  head: () => ({
    meta: [
      { title: "You're In! — Sharandev Fashions Saree Exhibition Lucky Draw" },
      {
        name: "description",
        content: "You are entered in the Sharandev Fashions SAREE EXHIBITION Lucky Draw.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
});

function SuccessPage() {
  const navigate = useNavigate();
  const [reg, setReg] = useState<PendingReg | null>(null);
  const [title, setTitle] = useState(DEFAULT_TEMPLATES.coupon_title);
  const [subtitle, setSubtitle] = useState(DEFAULT_TEMPLATES.coupon_subtitle);

  useEffect(() => {
    const r = loadReg();
    if (!r) navigate({ to: "/" });
    else setReg(r);
    getSettings(["coupon_title", "coupon_subtitle"]).then((s) => {
      if (s.coupon_title) setTitle(s.coupon_title);
      if (s.coupon_subtitle) setSubtitle(s.coupon_subtitle);
    });
  }, [navigate]);

  if (!reg) return null;
  const date = new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
  const bill = Number(reg.total_bill ?? 0);
  const paid = Number(reg.total_paid ?? 0);
  const pending = Math.max(0, bill - paid);

  return (
    <div className="relative min-h-screen overflow-hidden bg-red-hero px-5 py-10 text-white">
      <Confetti />
      <div className="relative mx-auto flex min-h-[90vh] max-w-md flex-col items-center justify-center text-center">
        <div className="animate-gift-open mb-5 grid h-24 w-24 place-items-center rounded-[32px] gradient-gold shadow-gold">
          <span className="text-5xl">🎉</span>
        </div>
        <h1 className="font-display text-4xl font-black italic leading-tight">
          <span className="text-shimmer">Congratulations!</span>
        </h1>
        <p className="mt-2 font-serif-lux text-xl italic text-gold">
          You&apos;re entered in the Lucky Draw
        </p>

        {/* Modern coupon */}
        <div className="animate-gift-open relative mt-8 w-full">
          <div className="rounded-[30px] gradient-gold p-[1.5px] shadow-gold">
            <div className="coupon-paper relative overflow-hidden rounded-[29px] text-maroon">
              {/* header band */}
              <div className="gradient-festive px-6 py-5 text-primary-foreground">
                <div className="font-ticket text-[9px] font-black uppercase tracking-[0.42em] opacity-80">
                  {subtitle}
                </div>
                <div className="mt-1 font-display text-lg font-black uppercase leading-tight tracking-[0.12em]">
                  {title}
                </div>
              </div>

              {/* notches */}
              <div className="relative">
                <div className="absolute -left-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-red-hero" />
                <div className="absolute -right-3 top-0 h-6 w-6 -translate-y-1/2 rounded-full bg-red-hero" />
                <div className="mx-6 border-t-2 border-dashed border-maroon/25" />
              </div>

              <div className="px-6 pb-7 pt-6">
                <div className="font-ticket text-[10px] font-bold uppercase tracking-[0.4em] text-maroon/50">
                  Entry Number
                </div>
                <div className="mt-1 font-ticket text-[58px] font-black leading-none tracking-[0.08em] tabular-nums text-maroon">
                  {reg.entry_number}
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                  <Cell label="Name" value={reg.full_name} />
                  <Cell label="Issued" value={date} small />
                  <Cell label="Total Bill" value={`₹${money(bill)}`} />
                  <Cell
                    label={pending > 0 ? "Pending" : "Status"}
                    value={pending > 0 ? `₹${money(pending)}` : "Fully Paid ✓"}
                  />
                </div>

                <div className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-maroon/5 py-3 font-ticket text-[10px] font-bold uppercase tracking-[0.24em] text-maroon/70">
                  3 Winners · 1st Prize ₹5,000 Saree
                </div>
              </div>
            </div>
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

function Cell({ label, value, small }: { label: string; value: string; small?: boolean }) {
  return (
    <div className="rounded-2xl border border-maroon/10 bg-white/60 px-3 py-2">
      <div className="font-ticket text-[9px] font-bold uppercase tracking-widest text-maroon/45">{label}</div>
      <div
        className={`font-ticket font-black leading-tight text-maroon ${small ? "text-xs" : "text-base"}`}
      >
        {value}
      </div>
    </div>
  );
}
