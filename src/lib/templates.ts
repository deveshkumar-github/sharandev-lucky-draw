import { supabase } from "@/integrations/supabase/client";

export const EVENT_NAME = "Sharandev Fashions SAREE EXHIBITION";

export const DEFAULT_TEMPLATES: Record<string, string> = {
  wa_register_template:
    "Hello Sharandev Fashions! 👋\nI have registered for the Sharandev Fashions SAREE EXHIBITION Lucky Draw.\n\nName: {name}\nPhone: {phone}\nWhatsApp: {whatsapp}\nCloud9 Resident: {cloud9}\nTotal Bill: ₹{bill}\nTotal Paid: ₹{paid}\nPending: ₹{pending}\n\nThank you! 🎁",
  wa_customer_template:
    "Hi {name}! 🎁\n\nThank you for registering for the Sharandev Fashions SAREE EXHIBITION Lucky Draw.\n\nYour Entry Number: {entry}\nTotal Bill: ₹{bill}\nPaid: ₹{paid}\nPending: ₹{pending}\n\nWinners will be announced soon — stay tuned!",
  wa_winner_template:
    "Congratulations {name}! 🏆\n\nYou have WON in the Sharandev Fashions SAREE EXHIBITION Lucky Draw!\n\nEntry Number: {entry}\nPrize: {prize}\n\nPlease visit our stall to collect your prize. 🎉",
  coupon_title: "Sharandev Fashions SAREE EXHIBITION",
  coupon_subtitle: "Lucky Draw Entry",
};

export function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? "");
}

export async function getSettings(keys: string[]): Promise<Record<string, string>> {
  const out: Record<string, string> = {};
  for (const k of keys) out[k] = DEFAULT_TEMPLATES[k] ?? "";
  try {
    const { data } = await supabase.from("app_settings").select("key,value").in("key", keys);
    for (const row of data ?? []) if (row.value) out[row.key] = row.value;
  } catch {
    /* fall back to defaults */
  }
  return out;
}

export async function getTemplate(key: string): Promise<string> {
  const s = await getSettings([key]);
  return s[key] ?? "";
}

export function waLink(number: string, message: string) {
  const num = number.replace(/\D/g, "");
  const clean = num.length === 10 ? `91${num}` : num;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function money(n: number | null | undefined) {
  const v = Number(n ?? 0);
  return v.toLocaleString("en-IN", { maximumFractionDigits: 2 });
}
