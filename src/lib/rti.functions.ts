import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assembleApplication, draftAppeal, draftRequests, type RtiRequest } from "./rti.server";
import { buildSeedRows } from "./seed.server";
import { addDays } from "./rti-data";

export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: { grievance: string; authority: string; ward?: string | null; language?: string }) => input,
  )
  .handler(async ({ data, context }) => {
    const draft = await draftRequests({
      grievance: data.grievance,
      authority: data.authority,
      ward: data.ward ?? null,
    });

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name, address, phone, is_bpl")
      .eq("id", context.userId)
      .maybeSingle();

    const body = assembleApplication({
      authority: data.authority,
      wardName: data.ward ?? null,
      requests: draft.requests,
      applicantName: profile?.full_name ?? null,
      applicantAddress: profile?.address ?? null,
      applicantPhone: profile?.phone ?? null,
      isBpl: profile?.is_bpl ?? false,
    });

    return { draft, body };
  });

export const generateAppealDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { applicationId: string; tier: "first" | "second"; reason: string }) => input)
  .handler(async ({ data, context }) => {
    const { data: app, error } = await context.supabase
      .from("applications")
      .select("*")
      .eq("id", data.applicationId)
      .single();
    if (error || !app) throw new Error("Application not found.");

    const { data: existing } = await context.supabase
      .from("appeals")
      .select("tier, filed_date, created_at")
      .eq("application_id", data.applicationId);

    const firstAppeal = (existing ?? []).find((a) => a.tier === "first");

    const body = await draftAppeal({
      tier: data.tier,
      reason: data.reason,
      authority: app.public_authority,
      wardName: app.ward_name,
      grievance: app.grievance_text,
      requests: (app.generated_requests as RtiRequest[]) ?? [],
      filedDate: app.filed_date,
      dueDate: app.response_due_date,
      replyDate: app.reply_received_date,
      replyNotes: app.reply_notes,
      firstAppealFiledDate: firstAppeal?.filed_date ?? null,
    });

    const { data: inserted, error: insertError } = await context.supabase
      .from("appeals")
      .insert({
        application_id: data.applicationId,
        tier: data.tier,
        grounds: data.reason,
        body,
        due_date: null,
      })
      .select()
      .single();
    if (insertError) throw new Error(insertError.message);

    return inserted;
  });

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { count } = await context.supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", context.userId);
    if ((count ?? 0) > 0) return { seeded: 0 };

    const rows = buildSeedRows(context.userId);
    const inserts = rows.map(({ _first_appeal_date, ...row }) => row);
    const { data: created, error } = await context.supabase
      .from("applications")
      .insert(inserts)
      .select("id, public_authority, status");
    if (error) throw new Error(error.message);

    const appealRow = rows.findIndex((r) => r._first_appeal_date);
    const appealApp = created?.find(
      (c) => c.public_authority === "BWSSB" && c.status === "first_appeal_filed",
    );
    const filed = appealRow >= 0 ? rows[appealRow]?._first_appeal_date : undefined;
    if (appealApp && filed) {
      await context.supabase.from("appeals").insert({
        application_id: appealApp.id,

        tier: "first",
        grounds: "No reply within 30 days — deemed refusal under Section 7(2).",
        body: "[Demo record] First appeal under Section 19(1) filed with the First Appellate Authority, BWSSB, on the ground of deemed refusal under Section 7(2).",
        filed_date: filed,
        due_date: addDays(filed, 45),
      });
    }

    return { seeded: created?.length ?? 0 };
  });

export const clearDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { error } = await context.supabase
      .from("applications")
      .delete()
      .eq("user_id", context.userId)
      .eq("is_seeded", true);
    if (error) throw new Error(error.message);
    return { ok: true };
  });
