# Specification

## Summary
**Goal:** Create an in-app privacy/anti-tracking dashboard with a VPN-like experience (explicitly not a real VPN) that simulates tracker detection and blocking based on user-provided destinations, with persistent per-user settings and a simple protection log.

**Planned changes:**
- Build a Privacy Dashboard main screen with clear “not a real VPN” messaging, protection status (On/Off), and a primary “Auto-stop tracking” toggle.
- Add a URL/domain (and optional list) scanner that checks inputs against a built-in tracker blocklist and shows matched trackers vs non-tracker domains, including summary counts and Blocked/Allowed labels based on toggle state.
- Implement a single Motoko actor backend to get/set the Auto-stop tracking setting, return the effective blocklist (default + user custom), add/remove custom blocked domains, and reset to defaults (keyed by caller principal; handle anonymous gracefully).
- Connect frontend to backend using React Query with optimistic updates for toggles and custom block entries, plus loading/disabled states and English error messages with retry.
- Add a client-side “Protection Log” view that records recent scans (timestamp, input, detected count, blocked count) and supports clearing the log.
- Apply a cohesive privacy/security visual theme with accessible contrast, avoiding blue/purple as primary accents.
- Add and render generated static logo and hero images from `frontend/public/assets/generated` in header/empty-state areas.

**User-visible outcome:** Users can turn Auto-stop tracking on/off, scan domains/URLs to see which trackers would be blocked, manage a custom blocklist that persists per user, and review/clear a local protection log—all within a clearly labeled simulated (non-VPN) privacy dashboard.
