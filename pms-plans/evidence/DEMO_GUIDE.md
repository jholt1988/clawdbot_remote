# PMS Demo User Guide

**Version:** 1.0  
**Date:** 2026-02-23  
**Purpose:** User-facing guide for running the Property Management Suite demo

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker & Docker Compose
- PostgreSQL (managed)
- Redis

### Start the Demo

```bash
# From workspace root
bash scripts/pms-dev/demo-reset.sh --root ./pms-master
```

This command:
1. Stops any running services
2. Resets the database
3. Seeds demo data (Morgan, Taylor/Alex, Jordan, Sunset Apartments)
4. Starts backend + frontend

### Access URLs
| Service | URL | Credentials |
|---------|-----|-------------|
| Property Manager | http://localhost:3001 | morgan@pms-demo.com / Demo123! |
| Tenant Portal | http://localhost:3001/tenant | alex@email.com / Demo123! |
| Owner Portal | http://localhost:3001/owner | jordan@owner.com / Demo123! |

---

## 📁 Key Paths

### Project Structure
```
/home/jordanh316/.openclaw/workspace/
├── pms-master/                    # Main PMS codebase
│   ├── tenant_portal_app/         # Frontend (Vite + React)
│   └── tenant_portal_backend/     # Backend (Express + Prisma)
├── scripts/pms-dev/
│   ├── demo-reset.sh              # Hard reset + reseed
│   └── dev-managed-up.sh          # Start services only
└── pms-plans/
    ├── demo-runbook.md             # Detailed demo steps
    └── DEMO_GUIDE.md              # This file
```

### Demo Scripts
| Script | Purpose |
|--------|---------|
| `bash scripts/pms-dev/demo-reset.sh --root ./pms-master` | Full reset + seed |
| `bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master` | Start services only |
| `DEMO_RESET_VERIFY=0 bash scripts/pms-dev/demo-reset.sh --root ./pms-master` | Skip verification |

---

## 🎯 Demo Features

### Path A: Full Story (Applicant → Tenant)
Complete tenant lifecycle from application to payment.

1. **Property Setup** — Create Sunset Apartments with 12 units
2. **Application** — Taylor submits rental application
3. **Approval** — Morgan approves → auto-generates lease
4. **Lease** — Alex views and accepts lease
5. **Payments** — Stripe integration for rent payment
6. **Maintenance** — Tenant submits request, PM triages

### Path B: AI Inspections
AI-powered property inspections with cost estimates.

| Inspection Type | Description |
|-----------------|-------------|
| Move-In | Pre-tenant move inspection |
| Routine | Quarterly checkup |
| Move-Out | Deposit assessment |

Each generates:
- Work Plan with priorities
- Cost Estimate (min/max range)
- Timeline recommendations

### Path C: Owner Portal
Jordan's view as property owner.

- Property overview dashboard
- Maintenance history
- Comment on requests (read-only actions)

---

## 👤 Demo Users

| Role | Name | Email | Password |
|------|------|-------|----------|
| Property Manager | Morgan | morgan@pms-demo.com | Demo123! |
| Applicant → Tenant | Taylor → Alex | alex@email.com | Demo123! |
| Owner | Jordan | jordan@owner.com | Demo123! |

---

## 🏢 Demo Property

**Sunset Apartments**  
- Location: 1234 Sunset Lane, Wichita, KS 67203
- Units: 12 (2BR, 1BA each)
- Rent: $1,200/month
- Focus Unit: Unit 204

---

## 🔧 Troubleshooting

### Database Issues
```bash
# Check DATABASE_URL is set
cat pms-master/tenant_portal_backend/.env | grep DATABASE_URL
```

### Redis Modes
```bash
# Skip Redis
PMS_REDIS_MODE=skip bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master

# Use system Redis
PMS_REDIS_MODE=system bash scripts/pms-dev/dev-managed-up.sh --root ./pms-master
```

### Verify Demo Data
```bash
cd pms-master/tenant_portal_backend
npm run seed:verify:demo
```

---

## 📖 More Details

- Full demo script: `pms-plans/demo-runbook.md`
- Acceptance checklist: `pms-plans/demo-runbook.md#acceptance-checklist`
