# Changelog - PMS Mobile Portals

## [Unreleased] - 2026-02-26

### Added
- **Dynamic Inspections:** Implemented `loadInspections` to fetch real-time inspection data from the API. The UI now correctly separates "Upcoming" and "Completed" inspections with appropriate status indicators and sorting by date.
- **Unit Search & Filtering:** Added real-time filtering for the Units list.
  - Search by unit number or tenant name.
  - Filter chips for "All", "Occupied", "Vacant", and "Late Rent".
- **Interactive Elements:**
  - "Start AI Inspection" button now triggers a mock camera workflow.
  - "Sign Out" button implements secure token clearing and reload.
  - Management grid buttons (Tenants, Payments, etc.) now provide user feedback (placeholders).
- **Navigation State:** Persisted navigation state handles page switching and lazy loading of data.

### Technical
- Refactored `AdminApp` to include `unitFilters` in state.
- Added `setupInteractions` to centralize event listeners for static UI elements.
- Improved `renderInspections` with robust Tailwind class generation for status colors.
