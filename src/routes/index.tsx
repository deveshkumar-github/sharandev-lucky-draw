import { createFileRoute, Link } from "@tanstack/react-router";
import { FloatingGifts } from "@/components/festive-bg";

export const Route = createFileRoute("/")({
  component: Landing,
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
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-gold/40 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.28em] text-gold backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse" />
          Sharandev Fashions
        </div>

        <div className="mb-7 flex h-40 w-40 items-center justify-center rounded-[42px] gradient-gold shadow-gold animate-float-gift">
          <span className="text-7xl drop-shadow-lg">🎁</span>
        </div>

        <h1 className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl">
          Saree
          <br />
          <span className="text-shimmer italic">Exhibition</span>
        </h1>
        <div className="mt-4 flex items-center gap-3">
          <span className="h-px w-10 bg-gold/60" />
          <span className="font-serif-lux text-xl italic text-gold">Lucky Draw</span>
          <span className="h-px w-10 bg-gold/60" />
        </div>

        <p className="mt-6 max-w-xs text-base text-white/85">
          Register in <b className="text-gold">30 seconds</b> and win luxurious festive gifts at the Cloud9 Exhibition.
        </p>

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
          Cloud9 Saree Exhibition · 2026
        </p>
      </div>
    </div>
  );
}