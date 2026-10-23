import { AUDIT_ACTION_LABEL, auditTarget, type AuditLogEntry } from "./types";

const COLUMNS = [
  "Timestamp (UTC)",
  "Actor",
  "Actor email",
  "Action",
  "Target",
  "Reason / note",
  "Transaction hash",
  "Entry ID",
] as const;

/**
 * Neutralizes spreadsheet formula injection. An audit note is free text written by an admin,
 * but a leading `=`, `+`, `-` or `@` makes Excel/Sheets treat the cell as a formula when the
 * CSV is opened — prefixing with a single quote keeps the value literal.
 */
function safeCell(value: string | undefined): string {
  const text = value ?? "";
  const neutralized = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${neutralized.replace(/"/g, '""')}"`;
}

export function auditLogToCsv(entries: AuditLogEntry[]): string {
  const rows = entries.map((entry) =>
    [
      entry.occurredAt,
      entry.actorName,
      entry.actorEmail,
      AUDIT_ACTION_LABEL[entry.action] ?? entry.action,
      auditTarget(entry),
      entry.reason,
      entry.txHash,
      entry.id,
    ]
      .map(safeCell)
      .join(","),
  );

  return [COLUMNS.map(safeCell).join(","), ...rows].join("\r\n") + "\r\n";
}

export function auditCsvFilename(now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return `locka-audit-log-${date}.csv`;
}
