import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  assembleApplication,
  draftAppeal,
  draftComplaint,
  draftRequests,
  reviseLetter,
  reviseRequests,
  routeGrievance,
  translateLetterToKannada,
  wardLine,
  type FalseClosure,
  type RtiRequest,
  type WardIdentity,
} from "./rti.server";
import { buildSeedRows } from "./seed.server";
import { addDays } from "./rti-data";

/** Routing pass: proposes the owning authority before the user is asked to choose. */
export const suggestRouting = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { grievance: string }) => input)
  .handler(async ({ data }) => {
    if (!data.grievance || data.grievance.trim().length < 15) return null;
    return routeGrievance(data.grievance);
  });

export const generateComplaint = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      grievance: string;
      authority: string;
      ward?: WardIdentity | null;
      lang?: "en" | "kn";
    }) => input,
  )
  .handler(async ({ data }) =>
    draftComplaint({
      grievance: data.grievance,
      authority: data.authority,
      ward: data.ward ?? null,
      lang: data.lang === "kn" ? "kn" : "en",
    }),
  );

export const generateDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      grievance: string;
      authority: string;
      ward?: WardIdentity | null;
      language?: string;
      lang?: "en" | "kn";
      focusSubject?: string | null;
      falseClosure?: FalseClosure | null;
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const draft = await draftRequests({
      grievance: data.grievance,
      authority: data.authority,
      ward: data.ward ?? null,
      focusSubject: data.focusSubject ?? null,
      falseClosure: data.falseClosure ?? null,
    });

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name, address, phone, email, is_bpl")
      .eq("id", context.userId)
      .maybeSingle();

    const body = assembleApplication({
      authority: data.authority,
      wardName: data.ward?.name ?? null,
      wardLine: wardLine(data.ward ?? null) || null,
      requests: draft.requests,
      applicantName: profile?.full_name ?? null,
      applicantAddress: profile?.address ?? null,
      applicantPhone: profile?.phone ?? null,
      applicantEmail: profile?.email ?? null,
      isBpl: profile?.is_bpl ?? false,
    });

    // The Kannada letter is the postal version; the English one stays for the portal.
    const bodyKn = data.lang === "kn" ? await translateLetterToKannada(body) : null;

    return { draft, body, bodyKn };
  });


export const reviseDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      grievance: string;
      authority: string;
      ward?: WardIdentity | null;
      subject: string;
      requests: RtiRequest[];
      instruction: string;
      lang?: "en" | "kn";
    }) => input,
  )
  .handler(async ({ data, context }) => {
    const draft = await reviseRequests({
      grievance: data.grievance,
      authority: data.authority,
      ward: data.ward ?? null,
      subject: data.subject,
      requests: data.requests,
      instruction: data.instruction,
    });

    const { data: profile } = await context.supabase
      .from("profiles")
      .select("full_name, address, phone, email, is_bpl")
      .eq("id", context.userId)
      .maybeSingle();

    const body = assembleApplication({
      authority: data.authority,
      wardName: data.ward?.name ?? null,
      wardLine: wardLine(data.ward ?? null) || null,
      requests: draft.requests,
      applicantName: profile?.full_name ?? null,
      applicantAddress: profile?.address ?? null,
      applicantPhone: profile?.phone ?? null,
      applicantEmail: profile?.email ?? null,
      isBpl: profile?.is_bpl ?? false,
    });

    // The Kannada letter is the postal version; the English one stays for the portal.
    const bodyKn = data.lang === "kn" ? await translateLetterToKannada(body) : null;

    return { draft, body, bodyKn };
  });

export const generateAppealDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: {
      applicationId: string;
      tier: "first" | "second";
      reason: string;
      portalGround?: string | undefined;
      lang?: "en" | "kn";
    }) => input,
  )

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

    const bodyKn = data.lang === "kn" ? await translateLetterToKannada(body) : null;

    const { data: inserted, error: insertError } = await context.supabase
      .from("appeals")
      .insert({
        application_id: data.applicationId,
        tier: data.tier,
        grounds: data.reason,
        body,
        body_kn: bodyKn,
        due_date: null,
        portal_ground: data.portalGround ?? null,
      })
      .select()

      .single();
    if (insertError) throw new Error(insertError.message);

    return inserted;
  });

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: { force?: boolean } | undefined) => input ?? {})
  .handler(async ({ data, context }) => {
    const force = data.force === true;
    const rows = buildSeedRows(context.userId);

    if (force) {
      // Re-runnable on demand: wipe only previously seeded rows, never real ones.
      const { error: delError } = await context.supabase
        .from("applications")
        .delete()
        .eq("user_id", context.userId)
        .eq("is_seeded", true);
      if (delError) throw new Error(delError.message);
    } else {
      const { count } = await context.supabase
        .from("applications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", context.userId)
        .eq("is_seeded", true);
      if ((count ?? 0) === rows.length) return { seeded: 0 };

      // Repair missing or older partial seed sets without touching real filings.
      if ((count ?? 0) > 0) {
        const { error: delError } = await context.supabase
          .from("applications")
          .delete()
          .eq("user_id", context.userId)
          .eq("is_seeded", true);
        if (delError) throw new Error(delError.message);
      }
    }

    const inserts = rows.map(({ _first_appeal_date, ...row }) => row);
    const { data: created, error } = await context.supabase
      .from("applications")
      .insert(inserts)
      .select("id, grievance_text");
    if (error) throw new Error(error.message);

    // Link the appeal to its own seed row by grievance text, not by authority guesswork.
    const appeals = rows
      .filter((r) => r._first_appeal_date)
      .map((r) => ({
        filed: r._first_appeal_date as string,
        id: created?.find((c) => c.grievance_text === r.grievance_text)?.id,
      }))
      .filter((a): a is { filed: string; id: string } => Boolean(a.id));

    if (appeals.length) {
      await context.supabase.from("appeals").insert(
        appeals.map((a) => ({
          application_id: a.id,
          tier: "first",
          grounds: "No reply within 30 days — deemed refusal under Section 7(2).",
          body: "[Demo record] First appeal under Section 19(1) filed with the First Appellate Authority on the ground of deemed refusal under Section 7(2).",
          filed_date: a.filed,
          due_date: addDays(a.filed, 45),
        })),
      );
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
