# Task 1 Redo — Open Loops Document Processing

Date: 2026-02-28
Sources:
- `/home/jordanh316/home_downloads`
- `/home/jordanh316/home_documents`

## 1) Inventory status
Completed initial inventory + categorization pass.

Artifacts created:
- `pms-plans/open-loops-task1-inventory-2026-02-28.tsv` (master list)

Totals from inventory (likely-relevant subset):
- **73 files** identified
  - **24** AI / systems
  - **9** property-suite
  - **18** repertoire / vocal
  - **1** brand-business
  - **21** other personal docs (mostly finance and agent docs)

## 2) High-value clusters found

### A. Repertoire / Vocal (strong cluster)
Found a substantial set of vocal-training and resonance docs (PDF-heavy), including:
- JXT Vocal Blueprint books (multiple)
- Vocal resonance analyses (Delilah, JukeBoxHero, Show Must Go On)
- Grand Codex variants

### B. Property / PM suite (active cluster)
Found PM/PMS planning and strategy docs, including:
- `PMS_MVP_Master_Plan_NOTION.md`
- `PROPERTY_MANAGEMENT_SUITE_MARKETING.md`
- Lease lifecycle / rental application / tenant screening docs
- Gap analysis and related planning docs

### C. AI systems / assistant planning
Found:
- `Unified_AI_Assistant_Plan` (MD + DOCX variants)
- A large AI implementation corpus inside archived PMS repo tree

### D. Personal finance / underwriting
Found:
- Multiple personal financial statement PDFs
- `Portfolio_Underwriting_Model.xlsx`
- `gig_rental_budget.xlsx`

## 3) Open loops identified (action-oriented)

### Priority 1 (Now)
1. **Consolidate duplicate strategic docs**
   - Keep canonical copy of `Unified_AI_Assistant_Plan` (likely MD as source of truth).
2. **Choose single canonical PMS master-plan doc**
   - Anchor on `PMS_MVP_Master_Plan_NOTION.md` and link supporting docs.
3. **Create repertoire index**
   - One index file listing each vocal PDF + purpose + practice output.

### Priority 2 (Next)
4. **Finance packet normalization**
   - Pick the one lender-ready financial statement version; archive superseded variants.
5. **Property legal/admin docs folderization**
   - Lease templates, screening docs, and PM plans into one clean structure.

### Priority 3 (Later)
6. **Deep summarize each PDF/docx**
   - Generate concise digest + extracted actions per doc.

## 4) Proposed clean folder structure

```text
OpenLoops/
  01_Strategy/
    AI_Assistant/
    Property_Suite/
    Brand_Business/
  02_Repertoire/
    Vocal_Blueprints/
    Resonance_Analyses/
    Practice_Protocols/
  03_Finance/
    Statements/
    Underwriting/
  04_Legal_Operations/
    Lease_Templates/
    Screening/
  99_Archive/
```

## 5) Recommended immediate execution sequence
1. Generate canonical-file shortlist (keep/archive decisions).
2. Build `OpenLoops/` folder scaffold.
3. Move/copy files into structure (non-destructive first pass).
4. Create index files per cluster:
   - `repertoire-index.md`
   - `property-suite-index.md`
   - `ai-systems-index.md`
   - `finance-index.md`
5. Produce one-page “Top 10 loops to close this month.”

---

Status: **Task 1 restarted and initial inventory complete. Ready for organization/move pass.**
