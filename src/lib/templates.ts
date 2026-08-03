import { supabase } from "@/integrations/supabase/client";

export const DEFAULT_TEMPLATES: Record<string, string> = {
  wa_register_template:
    "Hello Sharandev Fashions! 👋\nI have registered for the Cloud9 Saree Exhibition Lucky Draw.\n\nName: {name}\nPhone: {phone}\nWhatsApp: {whatsapp}\nCloud9 Resident: {cloud9}\nFlat No: {flat}\n\nThank you! 🎁",
  wa_customer_template:
    "Hi {name}! 🎁\n\nThank you for registering for the Sharandev Fashions Cloud9 Saree Exhibition Lucky Draw.\n\nYour Entry Number: {entry}\n\nWinners will be announced soon — stay tuned!",
  wa_winner_template:
    "Congratulations {name}! 🏆\n\nYou have WON in the Sharandev Fashions Cloud9 Saree Exhibition Lucky Draw!\n\nEntry Number: {entry}\nPrize: {prize}\n\nPlease visit our stall to collect your prize. 🎉",
};

export function fillTemplate(tpl: string, vars: Record<string, string>) {
  return tpl.replace(/\{(\w+)\}/g, (_m, k: string) => vars[k] ?? "");
}

export async function getTemplate(key: string): Promise<string> {
  try {
    const { data } = await supabase
      .from("app_settings")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    return data?.value || DEFAULT_TEMPLATES[key] || "";
  } catch {
    return DEFAULT_TEMPLATES[key] || "";
  }
}

export function waLink(number: string, message: string) {
  const num = number.replace(/\D/g, "");
  const clean = num.length === 10 ? `91${num}` : num;
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}