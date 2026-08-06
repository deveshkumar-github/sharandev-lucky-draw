import { createServerFn } from "@tanstack/react-start";

function verify(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new Error("ADMIN_PASSWORD is not configured");
  if (password !== expected) throw new Error("Invalid admin password");
}

export const adminLogin = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    return { ok: true as const };
  });

export const adminListRegistrations = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminAddRegistration = createServerFn({ method: "POST" })
  .inputValidator((d: {
    password: string;
    full_name: string;
    phone: string;
    whatsapp: string;
    is_cloud9: boolean;
    bill_no?: string;
    total_bill?: number;
    total_paid?: number;
    fully_paid?: boolean;
  }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    if (!data.full_name?.trim() || !data.phone?.trim() || !data.whatsapp?.trim()) {
      throw new Error("Missing required fields");
    }
    const bill = Math.max(0, Number(data.total_bill ?? 0));
    let paid = Math.max(0, Number(data.total_paid ?? 0));
    if (data.fully_paid) paid = bill;
    if (paid > bill) paid = bill;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        whatsapp: data.whatsapp.trim(),
        is_cloud9: !!data.is_cloud9,
        bill_no: (data.bill_no ?? "").trim().slice(0, 40),
        total_bill: bill,
        total_paid: paid,
        fully_paid: bill > 0 && paid >= bill,
      })
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminDeleteRegistration = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; id: string }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.from("registrations").delete().eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const adminListTemplates = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: rows, error } = await supabaseAdmin.from("app_settings").select("key,value");
    if (error) throw new Error(error.message);
    return rows ?? [];
  });

export const adminSaveTemplate = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; key: string; value: string }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const allowed = [
      "wa_register_template",
      "wa_customer_template",
      "wa_winner_template",
      "coupon_title",
      "coupon_subtitle",
    ];
    if (!allowed.includes(data.key)) throw new Error("Unknown template");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("app_settings")
      .upsert({ key: data.key, value: data.value }, { onConflict: "key" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });
export const adminUpdatePayment = createServerFn({ method: "POST" })
  .inputValidator((d: {
    password: string;
    id: string;
    total_bill: number;
    total_paid: number;
    fully_paid: boolean;
  }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const bill = Math.max(0, Number(data.total_bill ?? 0));
    let paid = Math.max(0, Number(data.total_paid ?? 0));
    if (data.fully_paid) paid = bill;
    if (paid > bill) paid = bill;
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .update({ total_bill: bill, total_paid: paid, fully_paid: bill > 0 && paid >= bill })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });
