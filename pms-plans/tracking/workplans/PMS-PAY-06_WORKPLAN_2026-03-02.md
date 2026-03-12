# PMS-PAY-06 Workplan (2026-03-02)

## Card
- **ID:** PMS-PAY-06
- **Title:** Ledger finalization from webhooks (append-only), including platform_fee_minor + tier snapshot
- **Dependencies:** PMS-PAY-05, PMS-PAY-04

## Definition of Done
1. Webhook-confirmed payment events append immutable ledger rows.
2. Ledger row includes `platform_fee_minor` and fee-tier snapshot metadata.
3. Duplicate webhook replays do not duplicate finalized ledger entries.
4. Validation demonstrates append-only behavior and replay safety.

## Execution Plan
1. Audit current payment/ledger models and webhook success handlers.
2. Add/patch append-only ledger model fields for fee/tier snapshot.
3. Wire webhook success path to finalize ledger entries.
4. Enforce dedupe/finalization guard on replay.
5. Validate with replay simulation and document evidence.
