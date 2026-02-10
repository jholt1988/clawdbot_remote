---
title: "Meta‑Scheduler — Notion API Schema Bootstrap"
owner: "Jordan"
status: "canonical"
version: "v1.0"
notion_api_target: "v2022-06-28+"
last_updated_utc: "2026-02-10"
notes: |
  Canonical API-ready bootstrap payloads for creating Notion databases.
  This file is the source of truth for DB names, property payloads, select options,
  and creation order.
---

# NOTION API SCHEMA BOOTSTRAP — Meta‑Scheduler System (v1.0)

**Target:** Notion API v2022-06-28+
**Assumption:** One Notion workspace, new databases

## CREATION ORDER (MANDATORY)
1. Projects (Global)
2. Tickets (Global)
3. Calendar (Global)
4. Scheduler Drift Log
5. Wire relations (IDs required)

You cannot safely reorder this.

---

## 1) DATABASE: Projects (Global)

### Database Name
```json
"Projects (Global)"
```

### Properties Payload
```json
{
  "Project ID": { "title": {} },

  "Project Name": { "rich_text": {} },

  "Primary Domain": {
    "select": {
      "options": [
        { "name": "Personal" },
        { "name": "PMS" },
        { "name": "Library" },
        { "name": "R&D" },
        { "name": "Other" }
      ]
    }
  },

  "Owning Team": {
    "select": {
      "options": [
        { "name": "Personal" },
        { "name": "PMS Dev" },
        { "name": "PMS Build" },
        { "name": "PMS Business" },
        { "name": "PMS Marketing" },
        { "name": "Library" },
        { "name": "R&D" },
        { "name": "Panel" }
      ]
    }
  },

  "Status": {
    "select": {
      "options": [
        { "name": "Idea" },
        { "name": "Active" },
        { "name": "Blocked" },
        { "name": "Archived" }
      ]
    }
  },

  "Risk Sensitivity": {
    "select": {
      "options": [
        { "name": "Low" },
        { "name": "Medium" },
        { "name": "High" }
      ]
    }
  },

  "Current Phase": {
    "select": {
      "options": [
        { "name": "Discovery" },
        { "name": "Design" },
        { "name": "Build" },
        { "name": "Review" },
        { "name": "Demo" },
        { "name": "Complete" }
      ]
    }
  },

  "Last Updated By": { "rich_text": {} },

  "Last Sync Time": { "date": {} },

  "Notes": { "rich_text": {} }
}
```

---

## 2) DATABASE: Tickets (Global)

### Database Name
```json
"Tickets (Global)"
```

### Properties Payload
```json
{
  "Ticket ID": { "title": {} },

  "CTS Task ID": { "rich_text": {} },

  "Ticket Name": { "rich_text": {} },

  "Project": {
    "relation": {
      "database_id": "{{PROJECTS_DB_ID}}"
    }
  },

  "Owning Team": {
    "select": {
      "options": [
        { "name": "Personal" },
        { "name": "PMS Dev" },
        { "name": "PMS Build" },
        { "name": "PMS Business" },
        { "name": "PMS Marketing" },
        { "name": "Library" },
        { "name": "R&D" }
      ]
    }
  },

  "Planner Agent": { "rich_text": {} },

  "Status": {
    "select": {
      "options": [
        { "name": "Backlog" },
        { "name": "Planned" },
        { "name": "In-Progress" },
        { "name": "Blocked" },
        { "name": "Done" }
      ]
    }
  },

  "Source": {
    "select": {
      "options": [
        { "name": "Manual" },
        { "name": "Trigger" },
        { "name": "Agent" }
      ]
    }
  },

  "Priority (Declared)": {
    "select": {
      "options": [
        { "name": "Low" },
        { "name": "Medium" },
        { "name": "High" }
      ]
    }
  },

  "Start Date (Proposed)": { "date": {} },

  "Due Date (Proposed)": { "date": {} },

  "Date Confidence": {
    "select": {
      "options": [
        { "name": "Low" },
        { "name": "Medium" },
        { "name": "High" }
      ]
    }
  },

  "Dependencies": {
    "relation": {
      "database_id": "{{TICKETS_DB_ID}}"
    }
  },

  "Risk Notes": { "rich_text": {} },

  "Assumptions": { "rich_text": {} },

  "Last Updated By": { "rich_text": {} },

  "Last Sync Time": { "date": {} }
}
```

---

## 3) DATABASE: Calendar (Global)

### Database Name
```json
"Calendar (Global)"
```

### Properties Payload
```json
{
  "Calendar Item ID": { "title": {} },

  "Item Name": { "rich_text": {} },

  "Item Type": {
    "select": {
      "options": [
        { "name": "Milestone" },
        { "name": "Deadline" },
        { "name": "Demo" },
        { "name": "Personal" },
        { "name": "Review" }
      ]
    }
  },

  "Project": {
    "relation": {
      "database_id": "{{PROJECTS_DB_ID}}"
    }
  },

  "Linked Tickets": {
    "relation": {
      "database_id": "{{TICKETS_DB_ID}}"
    }
  },

  "Owner": {
    "select": {
      "options": [
        { "name": "Human" },
        { "name": "Team" },
        { "name": "System" }
      ]
    }
  },

  "Start Date": { "date": {} },

  "End Date": { "date": {} },

  "Commitment Type": {
    "select": {
      "options": [
        { "name": "Hard" },
        { "name": "Soft" }
      ]
    }
  },

  "Visibility": {
    "select": {
      "options": [
        { "name": "Public" },
        { "name": "Internal" },
        { "name": "Private" }
      ]
    }
  },

  "Conflict Flag": { "checkbox": {} },

  "Conflict Notes": { "rich_text": {} },

  "Last Sync Time": { "date": {} },

  "Notes": { "rich_text": {} }
}
```

---

## 4) DATABASE: Scheduler Drift Log

### Database Name
```json
"Scheduler Drift Log"
```

### Properties Payload
```json
{
  "Drift ID": { "title": {} },

  "Drift Type": {
    "select": {
      "options": [
        { "name": "Orphaned Ticket" },
        { "name": "Calendar Without Ticket" },
        { "name": "Double-Booked Human" },
        { "name": "Date Conflict" },
        { "name": "Stale Ticket" }
      ]
    }
  },

  "Affected Entity": {
    "select": {
      "options": [
        { "name": "Project" },
        { "name": "Ticket" },
        { "name": "Calendar Item" }
      ]
    }
  },

  "Linked Project": {
    "relation": {
      "database_id": "{{PROJECTS_DB_ID}}"
    }
  },

  "Linked Ticket": {
    "relation": {
      "database_id": "{{TICKETS_DB_ID}}"
    }
  },

  "Linked Calendar Item": {
    "relation": {
      "database_id": "{{CALENDAR_DB_ID}}"
    }
  },

  "Severity": {
    "select": {
      "options": [
        { "name": "Low" },
        { "name": "Medium" },
        { "name": "High" }
      ]
    }
  },

  "Detected By": {
    "select": {
      "options": [
        { "name": "Meta-Scheduler" },
        { "name": "Agent" },
        { "name": "Human" }
      ]
    }
  },

  "Status": {
    "select": {
      "options": [
        { "name": "Open" },
        { "name": "Investigating" },
        { "name": "Resolved" }
      ]
    }
  },

  "First Detected": { "date": {} },

  "Resolved On": { "date": {} },

  "Resolution Notes": { "rich_text": {} }
}
```

---

## REQUIRED RELATION VALIDATION (POST-CREATION)
After creation, verify:

- Projects ↔ Tickets
- Tickets ↔ Calendar
- Projects ↔ Calendar

No rollups. No formulas. Agents read relations; humans reason about rollups later.
