# PMS-A-09 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-09
- **Title:** Messaging threads tenant<->PM with attachments + audit trail
- **Dependency:** PMS-A-04

## Definition of Done
1. Tenant and PM can exchange threaded messages in shared conversation context.
2. Message attachments are supported and persisted with message linkage.
3. Message actions are audit-recorded (create/send/attachment events).
4. Validation covers send/read flow and attachment visibility by role/scope.

## Execution Plan
1. Audit current messaging models/controllers/services and attachment support.
2. Implement/patch threaded conversation API paths and scope checks.
3. Add attachment handling/linking in message flow.
4. Add/verify audit log entries for message + attachment events.
5. Validate end-to-end tenant↔PM thread behavior and document evidence.
