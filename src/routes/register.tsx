import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { StepHeader } from "@/components/step-header";
import { saveReg } from "@/lib/session";
import { toast } from "sonner";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
  head: () => ({
    meta: [
      { title: "Register — Cloud9 Lucky Draw" },
      { name: "description", content: "Register in 30 seconds for the Cloud9 Saree Exhibition Lucky Draw." },
    ],
  }),
});

const schema = z.object({
  full_name: z.string().trim().min(2, "Enter your full name").max(80),
  phone: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid phone number"),
  whatsapp: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid WhatsApp number"),
  is_cloud9: z.boolean(),
});

function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [sameWa, setSameWa] = useState<null | boolean>(null);
  const [wa, setWa] = useState("");
  const [cloud9, setCloud9] = useState<null | boolean>(null);
  const [loading, setLoading] = useState(false);

  const ready =
    name.trim() && phone.trim() && sameWa !== null && (sameWa || wa.trim()) && cloud9 !== null;

  async function submit() {
    const whatsapp = sameWa ? phone : wa;
    const parsed = schema.safeParse({
      full_name: name,
      phone,
      whatsapp,
      is_cloud9: !!cloud9,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.rpc("register_entry", {
      _full_name: parsed.data.full_name,
      _phone: parsed.data.phone,
      _whatsapp: parsed.data.whatsapp,
      _is_cloud9: parsed.data.is_cloud9,
    });
    const row = Array.isArray(data) ? data[0] : data;
    setLoading(false);
    if (error || !row) {
      toast.error(error?.message || "Could not register. Please try again.");
      return;
    }
    saveReg(row);
    navigate({ to: "/connect" });
  }

  return (
    <div className="min-h-screen px-5 py-8">
      <div className="mx-auto max-w-md">
        <StepHeader step={1} total={3} title="Tell us about you" />
        <div className="glass-card space-y-6 rounded-3xl p-6 shadow-festive">
          <Field label="Full Name *">
            <input
              className="input-lg"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your full name"
              autoFocus
              maxLength={80}
            />
          </Field>
          <Field label="Phone Number *">
            <input
              className="input-lg"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="10-digit mobile number"
              maxLength={15}
            />
          </Field>

          <YesNo
            label="Is this your WhatsApp Number?"
            value={sameWa}
            onChange={setSameWa}
          />

          {sameWa === false && (
            <Field label="WhatsApp Number *">
              <input
                className="input-lg"
                inputMode="tel"
                value={wa}
                onChange={(e) => setWa(e.target.value)}
                placeholder="WhatsApp number"
                maxLength={15}
              />
            </Field>
          )}

          <YesNo
            label="Are you from Cloud9?"
            value={cloud9}
            onChange={setCloud9}
          />

          <button
            disabled={!ready || loading}
            onClick={submit}
            className="w-full rounded-2xl gradient-festive px-6 py-4 text-lg font-bold text-primary-foreground shadow-festive transition active:scale-95 disabled:opacity-50"
          >
            {loading ? "Please wait…" : "Continue 🎁"}
          </button>
        </div>
      </div>
      <style>{`
        .input-lg { width:100%; padding:16px 18px; border-radius:16px; border:1.5px solid var(--border); background:white; font-size:17px; outline:none; transition:.2s; }
        .input-lg:focus { border-color: var(--gold); box-shadow: 0 0 0 4px oklch(0.78 0.14 85 / 0.2); }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-maroon">{label}</span>
      {children}
    </label>
  );
}

function YesNo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean | null;
  onChange: (v: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-semibold text-maroon">{label}</div>
      <div className="grid grid-cols-2 gap-3">
        {[
          { v: true, l: "✅ Yes" },
          { v: false, l: "❌ No" },
        ].map((o) => (
          <button
            key={String(o.v)}
            type="button"
            onClick={() => onChange(o.v)}
            className={`rounded-2xl border-2 px-4 py-4 text-base font-bold transition active:scale-95 ${
              value === o.v
                ? "border-primary bg-primary text-primary-foreground shadow-festive"
                : "border-border bg-white text-foreground hover:border-gold"
            }`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}