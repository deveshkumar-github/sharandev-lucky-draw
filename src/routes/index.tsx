import { createFileRoute, Link } from "@tanstack/react-router";
import { FloatingGifts } from "@/components/festive-bg";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-hidden px-5 py-10">
      <FloatingGifts />
      <div className="relative mx-auto flex min-h-[90vh] max-w-md flex-col items-center justify-center text-center">
        <div className="mb-3 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
          Sharandev Fashions
        </div>
        <div className="mb-6 flex h-40 w-40 items-center justify-center rounded-[36px] gradient-festive shadow-festive animate-float-gift">
          <span className="text-7xl drop-shadow-lg">🎁</span>
        </div>
        <h1 className="text-4xl font-black leading-tight sm:text-5xl">
          <span className="text-shimmer">Cloud9 Saree</span>
          <br />
          <span className="text-maroon">Exhibition</span>
          <br />
          <span className="text-shimmer">Lucky Draw 🎉</span>
        </h1>
        <p className="mt-5 text-base text-muted-foreground">
          Register in just <b className="text-primary">30 seconds</b> and stand a chance to win exciting gifts!
        </p>
        <Link
          to="/register"
          className="mt-9 inline-flex w-full items-center justify-center rounded-2xl gradient-festive px-8 py-5 text-lg font-bold text-primary-foreground animate-pulse-glow transition active:scale-95"
        >
          🎁 Join Lucky Draw
        </Link>
        <p className="mt-6 text-xs text-muted-foreground">
          A festive celebration by Sharandev Fashions
        </p>
      </div>
    </div>
  );
}