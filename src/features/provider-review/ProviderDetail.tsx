import Link from "next/link";
import { shortTxHash, stellarTxUrl } from "@/lib/stellar";
import { DocumentViewer } from "./DocumentViewer";
import { OnChainSyncStatus } from "./OnChainSyncStatus";
import { DetailField, SectionCard } from "./SectionCard";
import { ProviderActions } from "./ProviderActions";
import { ProviderStatusBadge } from "./ProviderStatusBadge";
import { StaffTable } from "./StaffTable";
import { StatusTimeline } from "./StatusTimeline";
import { VerifyOnChainStatus } from "./VerifyOnChainStatus";
import { formatDate, formatDateTime, truncateMiddle } from "./format";
import {
  PROVIDER_STATUS_CODE,
  PROVIDER_STATUS_LABEL,
  PROVIDER_TYPE_LABEL,
  hasAuthorizedStaff,
} from "./status";
import type { ProviderApplication, ProviderHistoryEntry, ProviderStaff } from "./types";

export interface ProviderDetailProps {
  provider: ProviderApplication;
  history: ProviderHistoryEntry[];
  staff: ProviderStaff[];
  /** Back link into the queue, carrying the filters the admin arrived with. */
  backHref: string;
}

export function ProviderDetail({ provider, history, staff, backHref }: ProviderDetailProps) {
  const showStaff = hasAuthorizedStaff(provider.status);

  return (
    <div className="flex flex-col gap-5">
      <Link
        href={backHref}
        className="w-fit rounded text-sm text-foreground/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-locka-cyan/50"
      >
        ← Back to applications
      </Link>

      <div className="glass-bright flex flex-wrap items-start justify-between gap-4 rounded-xl p-5">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">{provider.name}</h1>
            <ProviderStatusBadge status={provider.status} />
          </div>
          <p className="text-sm text-foreground/60">
            {PROVIDER_TYPE_LABEL[provider.type]} · {provider.country} · Submitted{" "}
            {formatDate(provider.submittedAt)}
          </p>
        </div>
        <ProviderActions provider={provider} />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="flex flex-col gap-5 lg:col-span-2">
          <SectionCard
            title="Registration details"
            description="Everything the provider submitted when registering."
          >
            <dl className="grid gap-4 sm:grid-cols-2">
              <DetailField label="Provider type" value={PROVIDER_TYPE_LABEL[provider.type]} />
              <DetailField label="Country" value={provider.country} />
              <DetailField label="License number" value={provider.licenseNumber} mono />
              <DetailField
                label="License hash"
                value={
                  provider.licenseHash ? truncateMiddle(provider.licenseHash, 12, 8) : undefined
                }
                title={provider.licenseHash}
                mono
              />
              <DetailField
                label="Wallet address"
                value={
                  provider.walletAddress ? truncateMiddle(provider.walletAddress, 12, 8) : undefined
                }
                title={provider.walletAddress}
                mono
              />
              <DetailField label="Submitted" value={formatDateTime(provider.submittedAt)} />
              <DetailField label="Contact email" value={provider.contactEmail} />
              <DetailField label="Contact phone" value={provider.contactPhone} />
              <DetailField
                label="Website"
                value={
                  provider.website && (
                    <a
                      href={provider.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-locka-cyan hover:underline"
                    >
                      {provider.website}
                    </a>
                  )
                }
              />
              <DetailField label="Address" value={provider.addressLine} />
              {provider.decidedAt && (
                <DetailField label="Decided" value={formatDateTime(provider.decidedAt)} />
              )}
              {provider.decisionReason && (
                <DetailField
                  label="Decision note"
                  value={provider.decisionReason}
                  className="sm:col-span-2"
                />
              )}
            </dl>
          </SectionCard>

          <SectionCard
            title="License & credential documents"
            description="Supporting files submitted with the application."
          >
            <DocumentViewer providerId={provider.id} documents={provider.documents ?? []} />
          </SectionCard>

          {showStaff && (
            <SectionCard
              title="Authorized staff"
              description="Individual staff members acting under this provider organization."
            >
              <StaffTable providerId={provider.id} staff={staff} />
            </SectionCard>
          )}
        </div>

        <div className="flex flex-col gap-5">
          <SectionCard title="On-chain status">
            <div className="flex flex-col gap-4">
              <OnChainSyncStatus provider={provider} />

              {provider.onChainStatus ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <ProviderStatusBadge status={provider.onChainStatus} />
                    <span className="font-mono text-xs text-foreground/50">
                      ProviderRegistry status {PROVIDER_STATUS_CODE[provider.onChainStatus]}
                    </span>
                  </div>

                  <dl className="flex flex-col gap-4">
                    <DetailField
                      label="Last synced"
                      value={formatDateTime(provider.onChainSyncedAt)}
                    />
                    {provider.lastTxHash && (
                      <DetailField
                        label="Last transaction"
                        mono
                        value={
                          <a
                            href={stellarTxUrl(provider.lastTxHash)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-locka-cyan hover:underline"
                          >
                            {shortTxHash(provider.lastTxHash)}
                          </a>
                        }
                      />
                    )}
                  </dl>

                  {provider.onChainStatus !== provider.status && (
                    <p className="rounded-lg border border-brand-amber/30 bg-brand-amber/10 px-3 py-2 text-xs text-brand-amber">
                      The registry still reads {PROVIDER_STATUS_LABEL[provider.onChainStatus]} while
                      this application is {PROVIDER_STATUS_LABEL[provider.status]} — the transaction
                      may still be settling.
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-foreground/50">
                  Not recorded in the ProviderRegistry yet. Approving this application writes the
                  provider&apos;s verified status on-chain.
                </p>
              )}

              <VerifyOnChainStatus walletAddress={provider.walletAddress} />
            </div>
          </SectionCard>

          <SectionCard title="History" description="Every decision recorded against this provider.">
            <StatusTimeline entries={history} />
          </SectionCard>
        </div>
      </div>
    </div>
  );
}
