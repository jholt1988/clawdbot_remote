# PMS Plans Reorganization Summary

Date: 2026-03-12 (UTC)

## What changed

- Applied a topic-first directory structure with delivery artifacts further split by status type.
- Used `git mv` for file moves to preserve history.
- Added `README.md` index for discoverability.
- Checked markdown internal links after moves; no broken local links detected.

## Move log (old -> new)

- `pms-plans/DEMO_GUIDE.md` -> `pms-plans/evidence/DEMO_GUIDE.md`  
  Rationale: Grouped demo/evidence documentation.
- `pms-plans/PMS-A-03_EVIDENCE_2026-03-01.md` -> `pms-plans/evidence/PMS-A-03_EVIDENCE_2026-03-01.md`  
  Rationale: Grouped demo/evidence documentation.
- `pms-plans/demo-evidence.md` -> `pms-plans/evidence/demo-evidence.md`  
  Rationale: Grouped demo/evidence documentation.
- `pms-plans/demo-runbook.md` -> `pms-plans/evidence/demo-runbook.md`  
  Rationale: Grouped demo/evidence documentation.
- `pms-plans/blog-post-mvp-launch-draft.md` -> `pms-plans/marketing/blog-post-mvp-launch-draft.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/brand-logo-concept-classic.md` -> `pms-plans/marketing/brand-logo-concept-classic.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/brand-logo-concept-modern.md` -> `pms-plans/marketing/brand-logo-concept-modern.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/email-launch-announcement-draft-v2.md` -> `pms-plans/marketing/email-launch-announcement-draft-v2.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/email-launch-announcement-draft.md` -> `pms-plans/marketing/email-launch-announcement-draft.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/hero-image-prompt-blog.md` -> `pms-plans/marketing/hero-image-prompt-blog.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/marketing-copy-mvp.md` -> `pms-plans/marketing/marketing-copy-mvp.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/onboarding-sequence.md` -> `pms-plans/marketing/onboarding-sequence.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/personal-brand-launch-brief-v1.md` -> `pms-plans/marketing/personal-brand-launch-brief-v1.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/product-hunt-creative-briefs.md` -> `pms-plans/marketing/product-hunt-creative-briefs.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/production-company-launch-brief-v1.md` -> `pms-plans/marketing/production-company-launch-brief-v1.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/social-media-launch-posts.md` -> `pms-plans/marketing/social-media-launch-posts.md`  
  Rationale: Grouped launch/brand/content marketing material.
- `pms-plans/pms-plans-pdfs.zip` -> `pms-plans/references/archive/pms-plans-pdfs.zip`  
  Rationale: Archived bundled export artifact.
- `pms-plans/finance-normalization-log-2026-02-28.tsv` -> `pms-plans/references/finance-normalization-log-2026-02-28.tsv`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-canonical-recommendations-2026-02-28.md` -> `pms-plans/references/open-loops-canonical-recommendations-2026-02-28.md`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-copy-log-2026-02-28.tsv` -> `pms-plans/references/open-loops-copy-log-2026-02-28.tsv`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-dedupe-execution-log-2026-02-28.tsv` -> `pms-plans/references/open-loops-dedupe-execution-log-2026-02-28.tsv`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-duplicates-by-hash-2026-02-28.tsv` -> `pms-plans/references/open-loops-duplicates-by-hash-2026-02-28.tsv`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-organization-summary-2026-02-28.md` -> `pms-plans/references/open-loops-organization-summary-2026-02-28.md`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-task1-inventory-2026-02-28.tsv` -> `pms-plans/references/open-loops-task1-inventory-2026-02-28.tsv`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/open-loops-top-10-this-month-2026-02-28.md` -> `pms-plans/references/open-loops-top-10-this-month-2026-02-28.md`  
  Rationale: Grouped supporting datasets and reference analysis logs.
- `pms-plans/PMS-D-01_DEMO_FINALIZATION_2026-03-01.md` -> `pms-plans/roadmap/PMS-D-01_DEMO_FINALIZATION_2026-03-01.md`  
  Rationale: Grouped milestone/changelog/finalization docs.
- `pms-plans/STABILITY_SPRINT_CHANGELOG_2026-03-02.md` -> `pms-plans/roadmap/STABILITY_SPRINT_CHANGELOG_2026-03-02.md`  
  Rationale: Grouped milestone/changelog/finalization docs.
- `pms-plans/MVP_LAUNCH_READINESS.md` -> `pms-plans/strategy/MVP_LAUNCH_READINESS.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/PMS_EXECUTION_BOARD.md` -> `pms-plans/strategy/PMS_EXECUTION_BOARD.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/PROPERTY_OS_FUTURE_ASSETS_INTEGRATION_MAP.md` -> `pms-plans/strategy/PROPERTY_OS_FUTURE_ASSETS_INTEGRATION_MAP.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/business-plan.html` -> `pms-plans/strategy/business-plan.html`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/business-plan.pdf` -> `pms-plans/strategy/business-plan.pdf`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/long-term-goals-2026-02-28-task1-redo.md` -> `pms-plans/strategy/long-term-goals-2026-02-28-task1-redo.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/long-term-goals-2026-02-28.md` -> `pms-plans/strategy/long-term-goals-2026-02-28.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/long-term-goals-execution-board-2026-02-28.md` -> `pms-plans/strategy/long-term-goals-execution-board-2026-02-28.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/pms-pricing-decisions.md` -> `pms-plans/strategy/pms-pricing-decisions.md`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/product-launch-plan.html` -> `pms-plans/strategy/product-launch-plan.html`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/product-launch-plan.pdf` -> `pms-plans/strategy/product-launch-plan.pdf`  
  Rationale: Grouped product/business strategy and long-horizon planning docs.
- `pms-plans/package-lock.json` -> `pms-plans/technical/package-lock.json`  
  Rationale: Grouped tooling/runtime files used to generate artifacts.
- `pms-plans/package.json` -> `pms-plans/technical/package.json`  
  Rationale: Grouped tooling/runtime files used to generate artifacts.
- `pms-plans/render-pdfs.mjs` -> `pms-plans/technical/render-pdfs.mjs`  
  Rationale: Grouped tooling/runtime files used to generate artifacts.
- `pms-plans/PMS-R-03_AUDIT_LOG_COVERAGE_MATRIX_2026-03-01.md` -> `pms-plans/tracking/audit/PMS-R-03_AUDIT_LOG_COVERAGE_MATRIX_2026-03-01.md`  
  Rationale: Grouped audit-specific implementation and coverage records.
- `pms-plans/PMS-R-04_AUDIT_LOG_IMPLEMENTATION_2026-03-01.md` -> `pms-plans/tracking/audit/PMS-R-04_AUDIT_LOG_IMPLEMENTATION_2026-03-01.md`  
  Rationale: Grouped audit-specific implementation and coverage records.
- `pms-plans/PMS-A-03_EXECUTION_CHECKLIST.md` -> `pms-plans/tracking/checklists/PMS-A-03_EXECUTION_CHECKLIST.md`  
  Rationale: Grouped actionable checklists/completion records.
- `pms-plans/PMS-A-05_COMPLETION_2026-03-02.md` -> `pms-plans/tracking/checklists/PMS-A-05_COMPLETION_2026-03-02.md`  
  Rationale: Grouped actionable checklists/completion records.
- `pms-plans/PMS-L-01_LAUNCH_DAY_CHECKLIST.md` -> `pms-plans/tracking/checklists/PMS-L-01_LAUNCH_DAY_CHECKLIST.md`  
  Rationale: Grouped actionable checklists/completion records.
- `pms-plans/QA_ACCEPTANCE_SWEEP_CHECKLIST_2026-03-02.md` -> `pms-plans/tracking/checklists/QA_ACCEPTANCE_SWEEP_CHECKLIST_2026-03-02.md`  
  Rationale: Grouped actionable checklists/completion records.
- `pms-plans/PMS-A-05_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-05_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-06_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-06_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-07_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-07_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-08_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-08_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-09_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-09_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-10_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-10_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-11_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-11_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-12_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-A-12_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-B-02_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-B-02_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-B-03_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-B-03_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-B-04_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-B-04_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-C-01_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-C-01_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-C-02_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-C-02_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-F-01_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-F-01_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-01_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-01_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-02_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-02_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-03_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-03_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-04_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-04_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-05_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-05_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-06_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-06_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-07_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-07_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-08_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PAY-08_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PAY-MAN-05_PROGRESS_2026-03-06.md` -> `pms-plans/tracking/progress/PMS-PAY-MAN-05_PROGRESS_2026-03-06.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PRIC-01_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PRIC-01_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PRIC-02_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PRIC-02_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-PRIC-03_PROGRESS_2026-03-02.md` -> `pms-plans/tracking/progress/PMS-PRIC-03_PROGRESS_2026-03-02.md`  
  Rationale: Grouped delivery execution updates (progress).
- `pms-plans/PMS-A-02_STARTUP_AND_SEED_VERIFICATION_2026-03-02.md` -> `pms-plans/tracking/verification/PMS-A-02_STARTUP_AND_SEED_VERIFICATION_2026-03-02.md`  
  Rationale: Grouped validation/startup verification artifacts.
- `pms-plans/PMS-A-04_VERIFICATION_2026-03-01.md` -> `pms-plans/tracking/verification/PMS-A-04_VERIFICATION_2026-03-01.md`  
  Rationale: Grouped validation/startup verification artifacts.
- `pms-plans/PMS-B-01_VERIFICATION_2026-03-01.md` -> `pms-plans/tracking/verification/PMS-B-01_VERIFICATION_2026-03-01.md`  
  Rationale: Grouped validation/startup verification artifacts.
- `pms-plans/PMS-A-05_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-05_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-06_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-06_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-07_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-07_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-08_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-08_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-09_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-09_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-10_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-10_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-11_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-11_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-A-12_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-A-12_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-B-02_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-B-02_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-B-03_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-B-03_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-B-04_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-B-04_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-C-01_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-C-01_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-C-02_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-C-02_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-F-01_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-F-01_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-01_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-01_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-02_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-02_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-03_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-03_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-04_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-04_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-05_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-05_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-06_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-06_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-07_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-07_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-08_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PAY-08_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-MAN-01_WORKPLAN_2026-03-06.md` -> `pms-plans/tracking/workplans/PMS-PAY-MAN-01_WORKPLAN_2026-03-06.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-MAN-02_WORKPLAN_2026-03-06.md` -> `pms-plans/tracking/workplans/PMS-PAY-MAN-02_WORKPLAN_2026-03-06.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-MAN-03_WORKPLAN_2026-03-06.md` -> `pms-plans/tracking/workplans/PMS-PAY-MAN-03_WORKPLAN_2026-03-06.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PAY-MAN-04_WORKPLAN_2026-03-06.md` -> `pms-plans/tracking/workplans/PMS-PAY-MAN-04_WORKPLAN_2026-03-06.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PRIC-01_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PRIC-01_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PRIC-02_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PRIC-02_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).
- `pms-plans/PMS-PRIC-03_WORKPLAN_2026-03-02.md` -> `pms-plans/tracking/workplans/PMS-PRIC-03_WORKPLAN_2026-03-02.md`  
  Rationale: Grouped delivery planning artifacts (workplans).

## New files

- `pms-plans/README.md`
- `pms-plans/REORG_SUMMARY.md`

## Unresolved / intentionally left in place

- None. All files under `pms-plans` were assigned to a topical folder with conservative naming retained.
