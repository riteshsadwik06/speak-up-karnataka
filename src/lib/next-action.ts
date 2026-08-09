/**
 * Single source of truth for "what does this record need from the user now?".
 *
 * The registry list and the application detail page both read from here, so a
 * row can never say one thing in the list and another on its own page.
 * This reads state only — it never changes the statutory arithmetic in
 * rti-data.ts, it only classifies the result of it.
 */
import { clockFor, consistencyIssue } from "@/lib/rti-data";

export type Triage = "needs" | "waiting" | "done";

export type NextActionKind =
  | "inconsistent"
  | "send_complaint"
  | "false_closure"
  | "complaint_waiting"
  | "complaint_done"
  | "file"
  | "waiting"
  | "overdue_appeal"
  | "second_appeal"
  | "record_reply"
  | "reply_check"
  | "done";

/** The minimum a row must carry for triage. Both the list and detail rows satisfy it. */
export type TriageRow = {
  status: string;
  stage?: string | null;
  filed_date: string | null;
  response_due_date: string | null;
  reply_received_date: string | null;
  complaint_filed_date?: string | null;
  closure_claimed_date?: string | null;
  transfer_date?: string | null;
  escalation_count?: number | null;
};

export type Appealish = { tier: string; filed_date: string | null };

export function nextActionKind(row: TriageRow, appeals?: Appealish[]): NextActionKind {
  const list = appeals ?? [];
  if (consistencyIssue(row, list)) return "inconsistent";

  if (row.stage === "complaint") {
    if (row.status === "closed") return "complaint_done";
    if (row.closure_claimed_date) return "false_closure";
    if (row.status === "draft" || !row.complaint_filed_date) return "send_complaint";
    return "complaint_waiting";
  }

  if (row.status === "closed") return "done";
  if (row.status === "draft") return "file";

  if (row.status === "replied") {
    if (!row.reply_received_date) return "record_reply";
    return list.some((a) => a.tier === "first") ? "waiting" : "reply_check";
  }

  const clock = clockFor(row, list);
  if (clock.tone === "danger") {
    return list.some((a) => a.tier === "first") ? "second_appeal" : "overdue_appeal";
  }
  return "waiting";
}

const NEEDS: NextActionKind[] = [
  "inconsistent",
  "send_complaint",
  "false_closure",
  "file",
  "overdue_appeal",
  "second_appeal",
  "record_reply",
  "reply_check",
];

export function triageOf(row: TriageRow, appeals?: Appealish[]): Triage {
  const kind = nextActionKind(row, appeals);
  if (kind === "done" || kind === "complaint_done") return "done";
  return NEEDS.includes(kind) ? "needs" : "waiting";
}
