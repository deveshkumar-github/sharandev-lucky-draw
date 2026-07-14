import { Link } from "@tanstack/react-router";

export function StepHeader({ step, total, title }: { step: number; total: number; title: string }) {
  const pct = (step / total) * 100;
  return (
    <div className="mb-6">
      <div className="mb-3 flex items-center justify-between">
        <Link to="/" className="text-sm font-semibold text-primary">← Home</Link>
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Step {step} of {total}
        </span>
      </div>
      <h1 className="text-2xl font-black text-maroon">{title}</h1>
      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
        <div
          className="h-full gradient-festive transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}