import { useMemo } from "react";

export function FloatingGifts() {
  const gifts = useMemo(
    () =>
      Array.from({ length: 8 }).map((_, i) => ({
        left: `${(i * 13 + 5) % 95}%`,
        top: `${(i * 23 + 10) % 85}%`,
        delay: `${(i * 0.4).toFixed(2)}s`,
        size: 18 + ((i * 7) % 22),
        emoji: i % 3 === 0 ? "🎁" : i % 3 === 1 ? "✨" : "🎀",
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {gifts.map((g, i) => (
        <span
          key={i}
          className="absolute animate-float-gift opacity-70"
          style={{
            left: g.left,
            top: g.top,
            fontSize: g.size,
            animationDelay: g.delay,
          }}
        >
          {g.emoji}
        </span>
      ))}
      {Array.from({ length: 14 }).map((_, i) => (
        <span
          key={`s${i}`}
          className="animate-sparkle absolute text-[color:var(--gold-bright)]"
          style={{
            left: `${(i * 17 + 3) % 100}%`,
            top: `${(i * 29 + 7) % 100}%`,
            animationDelay: `${(i * 0.25).toFixed(2)}s`,
            fontSize: 10 + ((i * 3) % 10),
          }}
        >
          ✦
        </span>
      ))}
    </div>
  );
}

export function Confetti() {
  const bits = useMemo(
    () =>
      Array.from({ length: 60 }).map((_, i) => ({
        left: `${Math.random() * 100}%`,
        delay: `${Math.random() * 2}s`,
        duration: `${2 + Math.random() * 3}s`,
        color: ["#c62828", "#e0b64c", "#f7d94c", "#8b1e1e", "#f4a5a5"][i % 5],
        size: 6 + Math.random() * 8,
      })),
    [],
  );
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {bits.map((b, i) => (
        <span
          key={i}
          className="absolute block rounded-sm"
          style={{
            left: b.left,
            top: -20,
            width: b.size,
            height: b.size * 0.4,
            background: b.color,
            animation: `confetti-fall ${b.duration} linear ${b.delay} forwards`,
          }}
        />
      ))}
    </div>
  );
}