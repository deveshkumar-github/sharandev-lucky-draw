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
  }) => d)
  .handler(async ({ data }) => {
    verify(data.password);
    if (!data.full_name?.trim() || !data.phone?.trim() || !data.whatsapp?.trim()) {
      throw new Error("Missing required fields");
    }
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("registrations")
      .insert({
        full_name: data.full_name.trim(),
        phone: data.phone.trim(),
        whatsapp: data.whatsapp.trim(),
        is_cloud9: !!data.is_cloud9,
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