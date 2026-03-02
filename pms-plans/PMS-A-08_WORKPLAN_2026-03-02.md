# PMS-A-08 Workplan (2026-03-02)

## Card
- **ID:** PMS-A-08
- **Title:** Maintenance state machine + assignment + closure with validated transitions
- **Dependency:** PMS-A-07

## Definition of Done
1. Maintenance status transitions are validated against explicit state rules.
2. Assignment flow enforces role/scope constraints.
3. Closure requires completion criteria and records audit-ready metadata.
4. Validation covers valid/invalid transitions and assignment/closure edge cases.

## Execution Plan
1. Audit current maintenance status/assignment/closure endpoints and service logic.
2. Implement explicit transition map + guards.
3. Harden assignment and closure preconditions.
4. Add/update tests for transition/assignment/closure behavior.
5. Run verification and document results.
