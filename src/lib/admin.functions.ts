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
    const billNo = (data.bill_no ?? "").trim().slice(0, 40);
    if (billNo) {
      const { data: dupe } = await supabaseAdmin
        .from("registrations")
        .select("id")
        .ilike("bill_no", billNo)
        .limit(1);
      if (dupe && dupe.length > 0) throw new Error(`Bill No ${billNo} is already registered`);
    }
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        whatsapp: data.whatsapp.trim(),
        is_cloud9: !!data.is_cloud9,
        bill_no: billNo,
        total_bill: bill,
        total_paid: paid,
        fully_paid: bill > 0 && paid >= bill,
      })
      .select("*")
      .single();
    if (error) {
      throw new Error(
        error.code === "23505" ? `Bill No ${billNo} is already registered` : error.message,
      );
    }
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
      "bill_target",
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

export const adminSetFlags = createServerFn({ method: "POST" })
  .inputValidator((d: {
    password: string;
    id: string;
    saved_done?: boolean;
    followup_done?: boolean;
  }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const patch: { saved_done?: boolean; followup_done?: boolean } = {};
    if (typeof data.saved_done === "boolean") patch.saved_done = data.saved_done;
    if (typeof data.followup_done === "boolean") patch.followup_done = data.followup_done;
    if (!Object.keys(patch).length) throw new Error("Nothing to update");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .update(patch)
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return row;
  });

export const adminUpdateRegistration = createServerFn({ method: "POST" })
  .inputValidator((d: {
    password: string;
    id: string;
    full_name: string;
    phone: string;
    whatsapp: string;
    is_cloud9: boolean;
    bill_no?: string;
    total_bill: number;
    total_paid: number;
    fully_paid: boolean;
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
    const billNo = (data.bill_no ?? "").trim().slice(0, 40);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    if (billNo) {
      const { data: dupe } = await supabaseAdmin
        .from("registrations")
        .select("id")
        .ilike("bill_no", billNo)
        .neq("id", data.id)
        .limit(1);
      if (dupe && dupe.length > 0) throw new Error(`Bill No ${billNo} is already registered`);
    }
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .update({
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        whatsapp: data.whatsapp.trim(),
        is_cloud9: !!data.is_cloud9,
        bill_no: billNo,
        total_bill: bill,
        total_paid: paid,
        fully_paid: bill > 0 && paid >= bill,
      })
      .eq("id", data.id)
      .select("*")
      .single();
    if (error) {
      throw new Error(
        error.code === "23505" ? `Bill No ${billNo} is already registered` : error.message,
      );
    }
    return row;
  });

export const adminMergeRegistrations = createServerFn({ method: "POST" })
  .inputValidator((d: { password: string; primaryId: string; mergeIds: string[] }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    const others = (data.mergeIds ?? []).filter((id) => id && id !== data.primaryId);
    if (!others.length) throw new Error("Select at least two entries to merge");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const ids = [data.primaryId, ...others];
    const { data: rows, error: readErr } = await supabaseAdmin
      .from("registrations")
      .select("*")
      .in("id", ids);
    if (readErr) throw new Error(readErr.message);
    const primary = rows?.find((r) => r.id === data.primaryId);
    if (!primary || !rows) throw new Error("Primary entry not found");

    const bill = rows.reduce((s, r) => s + Number(r.total_bill || 0), 0);
    const paid = rows.reduce((s, r) => s + Number(r.total_paid || 0), 0);
    const billNos = Array.from(
      new Set(rows.map((r) => (r.bill_no ?? "").trim()).filter(Boolean)),
    ).join(", ").slice(0, 40);

    const { error: delErr } = await supabaseAdmin
      .from("registrations")
      .delete()
      .in("id", others);
    if (delErr) throw new Error(delErr.message);

    const { data: merged, error } = await supabaseAdmin
      .from("registrations")
      .update({
        bill_no: billNos,
        total_bill: bill,
        total_paid: paid,
        fully_paid: bill > 0 && paid >= bill,
        is_cloud9: rows.some((r) => r.is_cloud9),
        whatsapp_done: rows.some((r) => r.whatsapp_done),
        instagram1_done: rows.some((r) => r.instagram1_done),
        instagram2_done: rows.some((r) => r.instagram2_done),
        youtube_done: rows.some((r) => r.youtube_done),
        saved_done: rows.some((r) => r.saved_done),
        followup_done: rows.some((r) => r.followup_done),
      })
      .eq("id", data.primaryId)
      .select("*")
      .single();
    if (error) throw new Error(error.message);
    return { merged, removedIds: others };
  });
