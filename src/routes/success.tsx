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
    <div className="relative min-h-screen overflow-hidden bg-red-hero px-5 py-10 text-white">
      <Confetti />
      <div className="relative mx-auto flex min-h-[90vh] max-w-md flex-col items-center justify-center text-center">
        <div className="animate-gift-open mb-5 grid h-28 w-28 place-items-center rounded-[36px] gradient-gold shadow-gold">
          <span className="text-6xl">🎉</span>
        </div>
        <h1 className="font-display text-4xl font-black italic leading-tight">
          <span className="text-shimmer">Congratulations!</span>
        </h1>
        <p className="mt-2 font-serif-lux text-xl italic text-gold">
          You're entered in the Lucky Draw
        </p>

        {/* Premium Coupon */}
        <div className="animate-gift-open relative mt-8 w-full">
          {/* Outer gold frame */}
          <div className="rounded-[28px] gradient-gold p-[2px] shadow-gold">
            <div className="coupon-paper relative overflow-hidden rounded-[26px] px-6 py-7 text-maroon">
              {/* Perforation line */}
              <div className="absolute left-6 right-6 top-1/2 border-t border-dashed border-maroon/30" />
              {/* Corner ornaments */}
              <div className="pointer-events-none absolute left-3 top-3 text-gold text-lg">✦</div>
              <div className="pointer-events-none absolute right-3 top-3 text-gold text-lg">✦</div>
              <div className="pointer-events-none absolute left-3 bottom-3 text-gold text-lg">✦</div>
              <div className="pointer-events-none absolute right-3 bottom-3 text-gold text-lg">✦</div>

              <div className="text-[10px] font-bold uppercase tracking-[0.4em] text-maroon/70">
                Sharandev Fashions
              </div>
              <div className="font-serif-lux text-sm italic text-maroon/80">
                Cloud9 Saree Exhibition
              </div>

              <div className="mt-5 text-[11px] font-semibold uppercase tracking-[0.35em] text-maroon/60">
                🎟 Lucky Draw Entry
              </div>
              <div
                className="font-display text-6xl font-black tracking-wider"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.32 0.14 22), oklch(0.5 0.22 22), oklch(0.72 0.14 75))",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                }}
              >
                {reg.entry_number}
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3 text-left">
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-maroon/50">Name</div>
                  <div className="font-serif-lux text-lg font-semibold leading-tight text-maroon">
                    {reg.full_name}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold uppercase tracking-widest text-maroon/50">Issued</div>
                  <div className="font-serif-lux text-sm font-semibold text-maroon">{date}</div>
                </div>
              </div>

              <div className="mt-5 border-t border-dashed border-maroon/20 pt-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-maroon/60">
                Winners will be contacted on WhatsApp
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