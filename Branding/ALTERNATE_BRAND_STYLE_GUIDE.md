# Alternate Brand Style Guide (PMS)

## 0) Scope and intent
This is an **alternate visual direction** for PMS that stays compatible with existing logo assets and product trust signals, while shifting expression from “tech-forward utility” to “premium operational clarity.”

- Works with current `Branding/Modern_Logo_1.png`
- Keeps the brand pillars implied by the concept doc: **security, simplicity, centrality**
- Designed for implementation in marketing + product surfaces without replacing core identity

---

## 1) Design intent: "Modern Ledger"
### Positioning shift
- **Current direction:** bright SaaS utility, energetic accents
- **Alternate direction:** calm, executive-grade, structured confidence

### Emotional targets
- Reliable under pressure
- Quietly premium
- Operationally precise (not flashy)

### Brand sentence
> PMS is the control layer that makes complex property operations feel ordered, visible, and dependable.

---

## 2) Logo usage adaptations (compatible with existing assets)
Primary source remains: `Branding/Modern_Logo_1.png`

### Allowed contexts in this alternate system
1. **Default on light neutral backgrounds** (`Canvas / Paper` tones below)
2. **Reverse treatment on dark backgrounds** only if legibility is preserved (use provided logo variant if available; if not available, place logo in a light container chip)
3. **Monochrome lockup** for print/documents where color reproduction is limited

### Updated layout behavior
- Clear space: at least **1× logomark height** on all sides (same as current)
- Min size: **120 px digital / 25 mm print** (same as current)
- Prefer left alignment in product UI headers; centered only for title/cover moments

### Not allowed
- Re-drawing key/house geometry
- Applying glow/gradient directly onto logo file
- Cropping into the logomark shape

---

## 3) Alternate color palette (implementation-ready)
> Strategy: keep trust navy lineage, reduce saturation, add premium neutrals and restrained highlight color.

### Core tokens
- **Ink 900 (Primary text):** `#101828`
- **Ink 700 (Secondary text):** `#344054`
- **Canvas (App background):** `#F8F9FB`
- **Paper (Card background):** `#FFFFFF`
- **Line (Borders/dividers):** `#D0D5DD`

### Brand accents
- **Trust Navy (Primary brand):** `#0A2540`  
  (aligned with modern concept doc)
- **Signal Amber (Accent):** `#FFC107`  
  (use sparingly for highlights, not body text)
- **Action Blue (Interactive):** `#1D4ED8`

### Semantic colors
- **Success:** `#0F9D58`
- **Warning:** `#D97706`
- **Danger:** `#C62828`
- **Info:** `#0369A1`

### Usage ratios
- 70% neutrals (Ink/Canvas/Paper/Line)
- 20% Trust Navy + Action Blue
- 10% Signal Amber + semantic statuses

### Accessibility rules
- All body text combinations must meet **WCAG AA (4.5:1)** minimum
- Amber is **not** for long-form text on white; use for badges, micro-highlights, and charts only

---

## 4) Typography pairing
> Distinct from the current all-Inter approach while still easy to ship via web fonts/system fallbacks.

### Primary pairing
- **Headlines:** `Manrope` (600/700)
- **Body/UI:** `Inter` (400/500)
- **Mono/data:** `JetBrains Mono` (400/500)

### Fallback stack
- `Manrope, Inter, -apple-system, Segoe UI, Roboto, Arial, sans-serif`

### Type scale
- Display: 40/48, 700
- H1: 32/40, 700
- H2: 24/32, 600
- H3: 20/28, 600
- Body L: 16/24, 400
- Body M: 14/22, 400
- Label: 12/16, 500

### Typographic behavior
- Tighten headline tracking slightly (-1% to -2%)
- Keep paragraph measure around 60–75 characters

---

## 5) Component style language
### Visual principles
- Structured, quiet, data-forward
- Corners: **8px base radius** (cards), **10px** (modals), **999px** (chips)
- Shadow: soft and low elevation; rely more on border + contrast than heavy drop shadows

### Key components
1. **Buttons**
   - Primary: Trust Navy background, white text
   - Secondary: white background, Ink text, Line border
   - Tertiary: text-only, Action Blue
2. **Cards**
   - Paper background + 1px Line border
   - Optional left accent bar (Action Blue or semantic tone)
3. **Tables**
   - Dense but readable row spacing (44–48px row height)
   - Sticky header in Canvas tone
4. **Forms**
   - Labels always visible above fields
   - Helper text default in Ink 700
   - Error copy concise, action-oriented
5. **Status badges**
   - Subtle tinted backgrounds with dark text
   - Avoid neon fills

### Spacing rhythm
- Base unit: **4px**
- Recommended sequence: 4, 8, 12, 16, 24, 32, 48, 64

---

## 6) Imagery direction
### Style
- Real-world operational scenes: properties, field inspections, leasing interactions, dashboards-in-context
- Slightly desaturated color grade; avoid hyper-saturated stock look

### Composition
- Favor clean architectural lines and centered perspectives
- Use shallow overlays in Trust Navy (`8–16%`) for text legibility

### Avoid
- Generic handshake imagery
- Overly staged smiling office shots
- Heavy duotone effects that conflict with product visuals

---

## 7) Iconography
### System
- Use a consistent outline icon family (1.75–2px stroke)
- Rounded corners on icon paths to mirror UI softness

### Behavioral rules
- Default icon color: Ink 700
- Interactive icons: Action Blue on hover/focus
- Status icons: semantic colors only for true states

### Domain icon set (priority)
- Lease, Unit, Payment, Work Order, Inspection, Compliance, Tenant, Owner, Report

---

## 8) Motion tone
### Personality
- Purposeful, brief, and predictable

### Motion specs
- Duration: 120–220ms for micro-interactions
- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)`
- Entrance: subtle fade + 4–8px translate
- No bounce on enterprise/data screens

### Priority
- Motion should guide attention, not brand decoration

---

## 9) Messaging tone (alternate)
### Voice profile
- Direct, composed, evidence-led
- More “operations brief” than “startup hype”

### Copy guidelines
- Lead with outcome + control
- Use concrete nouns and verbs
- Back claims with visible proof points (time saved, error reduction, occupancy impact)

### Examples
- Instead of: “Reinvent property operations with AI magic.”
- Use: “Track leasing, maintenance, and payments from one operational view.”

- Instead of: “Supercharge your workflows instantly.”
- Use: “Automate routine approvals while keeping manual override where it matters.”

---

## 10) Practical implementation notes
1. Keep existing logo binary unchanged; adapt surrounding layout/color only.
2. Introduce alternate tokens in a parallel theme file (e.g., `theme-modern-ledger`).
3. Roll out by surface:
   - Phase 1: pitch decks + case studies
   - Phase 2: marketing pages
   - Phase 3: product UI opt-in theme
4. Validate contrast and component parity before full adoption.

---

## 11) Assumptions and source grounding
### Grounded in available files
- `Branding/Modern_Logo_1.png`
- `Branding/BRAND_STYLE_GUIDE.md`
- `Branding/BRAND_QUICK_REFERENCE.md`
- `pms-plans/marketing/brand-logo-concept-modern.md`

### Explicit assumptions
1. The current primary logo asset is a modern key/house concept and remains canonical.
2. No separate dark/reverse logo binaries are currently present.
3. “PMS identity compatibility” means preserving trust/security/simplicity cues and logo structure while altering expression.
4. Typography recommendations use widely available web fonts and may require product team approval before shipping.
