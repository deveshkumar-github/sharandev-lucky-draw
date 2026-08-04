import { createFileRoute, Link } from "@tanstack/react-router";
import { FloatingGifts } from "@/components/festive-bg";

export const Route = createFileRoute("/")({
  component: Landing,
  head: () => ({
    meta: [
      { title: "Sharandev Fashions Saree Exhibition — Lucky Draw" },
      {
        name: "description",
        content:
          "Register free for the Sharandev Fashions SAREE EXHIBITION Lucky Draw. 3 winners — 1st prize a ₹5000 saree plus 2 exciting gifts.",
      },
      { property: "og:title", content: "Sharandev Fashions Saree Exhibition — Lucky Draw" },
      {
        property: "og:description",
        content: "3 winners. 1st prize ₹5000 worth saree + 2 exciting gifts. Register in 30 seconds.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-red-hero px-5 py-10 text-white">
      <FloatingGifts />
      {/* Decorative gold rings */}
      <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full border border-gold/30 opacity-40" />
      <div className="pointer-events-none absolute -right-32 top-40 h-96 w-96 rounded-full border border-gold/20 opacity-40" />
      <div className="pointer-events-none absolute bottom-10 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full border border-gold/20 opacity-30" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-6 flex h-28 w-28 items-center justify-center rounded-[34px] gradient-gold shadow-gold animate-float-gift">
          <span className="text-5xl drop-shadow-lg">🎁</span>
        </div>

        <h1 className="font-display text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl">
          Sharandev Fashions
          <br />
          <span className="text-shimmer italic">SAREE EXHIBITION</span>
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-px w-10 bg-gold/60" />
          <span className="font-serif-lux text-xl italic text-gold">Lucky Draw</span>
          <span className="h-px w-10 bg-gold/60" />
        </div>

        <p className="mt-6 max-w-xs text-base text-white/85">
          Register in <b className="text-gold">30 seconds</b> and win luxurious festive gifts at the Sharandev Fashions Saree Exhibition.
        </p>

        <div className="mt-8 w-full space-y-3 text-left">
          <div className="text-center text-[11px] font-bold uppercase tracking-[0.3em] text-gold">
            3 Lucky Winners
          </div>
          {[
            { p: "1st Prize", d: "Saree worth ₹5,000/-", i: "🥇" },
            { p: "2nd Prize", d: "Exciting Gift", i: "🥈" },
            { p: "3rd Prize", d: "Exciting Gift", i: "🥉" },
          ].map((w) => (
            <div
              key={w.p}
              className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-white/5 px-4 py-3 backdrop-blur-sm"
            >
              <span className="text-2xl">{w.i}</span>
              <div className="min-w-0">
                <div className="text-[10px] font-bold uppercase tracking-[0.22em] text-gold">{w.p}</div>
                <div className="font-serif-lux text-lg italic text-white">{w.d}</div>
              </div>
            </div>
          ))}
        </div>

        <Link
          to="/register"
          className="mt-10 inline-flex w-full items-center justify-center rounded-2xl gradient-gold px-8 py-5 text-lg font-black text-[color:var(--maroon)] shadow-gold animate-pulse-glow transition active:scale-95"
        >
          🎁  Join the Lucky Draw
        </Link>

        <div className="mt-8 grid w-full grid-cols-3 gap-3 text-center text-white/90">
          {[
            { n: "30s", l: "Quick Entry" },
            { n: "🎁", l: "Premium Gifts" },
            { n: "100%", l: "Free" },
          ].map((s) => (
            <div key={s.l} className="rounded-2xl border border-gold/30 bg-white/5 px-2 py-3 backdrop-blur-sm">
              <div className="font-display text-2xl font-bold text-gold">{s.n}</div>
              <div className="mt-0.5 text-[10px] font-semibold uppercase tracking-widest text-white/70">{s.l}</div>
            </div>
          ))}
        </div>

        <p className="mt-8 text-[11px] font-semibold uppercase tracking-[0.3em] text-white/60">
          Sharandev Fashions SAREE EXHIBITION · 2026
        </p>
      </div>
    </div>
  );
}