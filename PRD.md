# Home Expense App — Product Requirements Document (v1)

**Status:** Draft
**Owner:** tayyabulislam16up@gmail.com
**Last updated:** 2026-05-26

---

## 1. Summary

A multi-platform (mobile + web) expense-tracking app where individuals log daily expenses privately and admins (group creators) consolidate expenses across family, friends, roommates, or team groups. Members log; admins oversee, budget, and report.

The product is **not** a Splitwise-style settle-up tool. There is no peer-to-peer debt calculation. The unit of value is a shared, role-scoped ledger.

## 2. Goals & non-goals

### Goals (v1)
- Frictionless daily expense entry from phone (including offline).
- Group-scoped collaboration with admin oversight and configurable member visibility.
- Reliable monthly reporting and budget tracking for admins.
- Single source of truth across mobile and web.

### Non-goals (v1)
- Splitwise-style settle-up / debt graph between members.
- Multi-currency or FX conversion.
- Bank or SMS auto-import of transactions.
- Biometric / PIN app lock.
- Multi-language UI (English only).
- Public group discovery / open join.

## 3. Personas

- **Admin** — Creates a group (household head, trip organizer, team lead). Sees all expenses in their group, manages members, sets budgets, exports reports.
- **Member** — Invited by an admin. Logs their own expenses. May or may not see other members' entries depending on group setting.
- **Solo user** — Uses the app only for personal tracking. Operates entirely within their auto-created Personal group.

## 4. Core concepts

| Concept | Definition |
|---|---|
| **User** | An individual account. Signs up once, can belong to many groups. |
| **Group** | A container for expenses with one admin + N members. Has its own currency, categories, budgets, audit log. |
| **Personal group** | A private group auto-created for every user on signup. Only they can see it. |
| **Admin** | The user who created the group, or who admin role was transferred to. Exactly one per group. |
| **Member** | A user invited into a group by the admin. |
| **Expense** | A single entry: amount, category, tags, date, note, payer, payment method, optional photos. Belongs to exactly one group, owned by exactly one user. |
| **Audit log** | Append-only record of every create/edit/delete on an expense, retained 12 months. |

## 5. Functional requirements

### 5.1 Authentication & onboarding
- Sign up with **Email + password** or **Google** OAuth.
- On first sign-in:
  1. App auto-creates a private **Personal** group with the user as admin.
  2. User lands in the Personal group dashboard.
  3. App offers a "Create shared group" CTA.
- Email verification required for email/password signup.

### 5.2 Groups
- Any signed-in user can create a group; creator becomes admin.
- A user can belong to unlimited groups. UI provides a group switcher.
- Admin sets at creation: **group name**, **currency** (immutable after first expense logged).
- **Admin transfer:** Admin can transfer admin role to any current member. Required step before account deletion if the user is sole admin of any non-Personal group.
- **Soft delete:** Admin can delete a group. Group is hidden for 30 days, fully recoverable by admin; auto-purged after 30 days.
- Personal group cannot be deleted or have members added.

### 5.3 Membership
- Open signup: anyone can register without an invite.
- **Invites:** Admin invites an existing user by email or username. Invitee receives an in-app notification and accepts/declines.
- **Removal:** Admin can remove a member. Removed member's past expenses remain in the group; their display name is marked "(removed)" in lists and reports.

### 5.4 Visibility (per group, admin-configurable)
- **Mode A — Members see only their own:** Members see their own entries + group-wide totals only.
- **Mode B — Members see everything:** Members see all entries in the group.
- Admin always sees everything regardless of mode.

### 5.5 Expense entry
Required fields:
- Amount (in group currency)
- Category (from group's category list)
- Date (defaults to today)
- Payer (defaults to current user; admin can attribute to any member)
- Payment method (one of: Cash, Card, Bank, Wallet — fixed global list for v1)

Optional fields:
- Note (free text)
- Tags (free-form, multiple)
- Receipt photos (1 or many; client-side compressed before upload)

### 5.6 Edit & delete rules
- A member can edit or delete **their own** expenses at any time.
- An admin can edit or delete **any** expense in their group.
- Every create / edit / delete writes an audit log entry visible to the admin.

### 5.7 Categories
- Group is seeded with default categories: Groceries, Rent, Utilities, Dining, Transport, Health, Entertainment, Other.
- Admin can add, rename, or hide custom categories per group.
- Categories cannot be hard-deleted if expenses reference them; only hidden.

### 5.8 Tags
- Free-form, multi-select per expense.
- Scoped per group; autocomplete from prior tags in the same group.

### 5.9 Recurring expenses
- Admin or member can mark an expense as recurring with a schedule (daily / weekly / monthly / yearly + day-of).
- On due date, app sends a reminder to the owner. The expense is **not** auto-posted.
- User taps the reminder, reviews/edits, then confirms to log it.

### 5.10 Approval flow (optional per group)
- Admin can toggle "Requires admin approval" on/off per group.
- When ON: member-submitted expenses enter **Pending** state, excluded from totals/reports until admin approves.
- Admin can approve, reject (with reason), or edit-and-approve.
- When OFF: expenses count toward totals immediately.

### 5.11 Budgets (admin only)
- Admin sets a monthly budget per category per group.
- App computes month-to-date spend per category and budget utilisation %.
- **Threshold alerts:** Notifications fire at 80% and 100% utilisation.

### 5.12 Reports (admin only)
- Monthly totals by category (chart + table).
- Per-member breakdown for selected month / range.
- Budget vs actual for selected month.
- Export to **CSV** and **PDF** for any of the above views.

### 5.13 Filters & search (expense list)
- Date range (preset: this week / month / last month / custom).
- Category (multi-select).
- Free-text search on note field.
- Member filter — **admin only**.

### 5.14 Notifications
Triggers (v1):
1. New expense added by a member → admin of that group.
2. Budget threshold crossed (80%, 100%) → admin.
3. Recurring expense due → owner.
4. Group invite received → invitee.

Channels: in-app + push (mobile). Email digest is out of scope for v1.

### 5.15 Offline (mobile only)
- Members can add, edit, view expenses while offline.
- Local writes are queued and synced on reconnect.
- Each expense is owned by its creator → no merge conflicts expected on sync.
- Web app is online-only.

### 5.16 Audit log
- Every expense create / edit / delete is recorded with: actor, timestamp, before/after diff.
- Visible to admin in a per-group audit log view.
- Retained **12 months**, older entries auto-purged.

### 5.17 Receipt photos
- Compressed on the client before upload.
- Multiple photos per expense supported.
- Kept **forever** while the parent expense exists; deleted with the expense.

## 6. Platforms

- **Mobile (iOS + Android)** — primary entry surface, offline-capable.
- **Web (responsive)** — full feature parity except offline.
- Both shipped from day one of v1.

## 7. Non-functional requirements

| Area | Requirement |
|---|---|
| Performance | Expense list opens in < 1 s for groups with ≤ 1000 expenses. Reports render in < 2 s. |
| Sync | Offline writes sync within 10 s of reconnect on a healthy network. |
| Storage | Receipt photos compressed to ≤ 500 KB each before upload. |
| Security | Row-level security enforces visibility rules at the database layer, not just in the UI. |
| Reliability | All destructive actions (delete expense, delete group, remove member) are soft-deletes or recoverable within 30 days where applicable. |
| Privacy | Personal group data is never visible to any other user, including system admins, except via explicit data-export request. |
| Auth | Sessions expire after 30 days of inactivity; refresh on use. |

## 8. Data model (logical)

- **User** (id, email, displayName, authProvider, createdAt)
- **Group** (id, name, currency, adminUserId, visibilityMode, requiresApproval, isPersonal, softDeletedAt, createdAt)
- **GroupMember** (groupId, userId, status, joinedAt, removedAt)
- **Category** (id, groupId, name, isDefault, isHidden)
- **Expense** (id, groupId, ownerUserId, payerUserId, amount, categoryId, date, note, paymentMethod, status [active|pending|rejected], createdAt, updatedAt, softDeletedAt)
- **ExpenseTag** (expenseId, tag)
- **ExpensePhoto** (id, expenseId, storageKey, sizeBytes, createdAt)
- **RecurringTemplate** (id, groupId, ownerUserId, schedule, lastFiredAt, nextDueAt, payloadJson)
- **Budget** (groupId, categoryId, month, amount)
- **AuditLog** (id, groupId, actorUserId, entityType, entityId, action, diffJson, occurredAt)
- **Notification** (id, userId, type, payloadJson, readAt, createdAt)
- **Invite** (id, groupId, invitedByUserId, invitedUserId, status, createdAt, respondedAt)

## 9. Out of scope for v1
- Splitwise-style settle-up between members.
- Multi-currency and exchange-rate handling.
- Bank / SMS auto-import.
- Biometric or PIN app lock.
- Localization beyond English.
- Email digests.
- Public group discovery.
- Comments / chat on expenses.

## 10. Open questions
1. Confirm **Supabase** as the backend (suggested by available tooling).
2. Confirm `apps/mobile` handles both native (iOS/Android) **and** web target (Expo web), or whether a separate `apps/web` is needed.
3. Integration branch name for agent-orchestrated builds (e.g. `integration/v1`).
4. Should v1 ship to public stores or internal TestFlight / closed-track first?

## 11. Success metrics (post-launch)
- 70% of invited members log at least one expense within 7 days.
- Median time to log an expense from app open ≤ 15 s.
- < 1% of expense entries roll back due to sync conflicts.
- Admin opens reports view ≥ 1× per month per active group.

---

## Appendix A — Agent-orchestrated build plan (reference)

Implementation will be executed by a manager agent that delegates to isolated build and QA subagents. See the chat history for the full orchestration design; the dependency-ordered waves are summarised here:

- **Wave 0 — Foundations:** `shared/types`, `db/schema` (Supabase migrations + RLS).
- **Wave 1 — Backend primitives:** auth, groups, expenses, categories/tags, storage.
- **Wave 2 — Backend composites:** budgets, recurring, reports, notifications, audit log.
- **Wave 3 — Client foundations:** auth/onboarding, group switcher, offline queue.
- **Wave 4 — Client features:** expense entry, list, budgets/recurring, reports, notifications, admin panel.
- **Wave 5 — Cross-cutting:** E2E golden paths, hardening (RLS pen-test, perf, retention).

Each task runs in an isolated worktree, builds via a build agent, is verified by a separate QA agent, then reviewed and merged by the manager into an integration branch. Tasks are spawned only when all their dependencies are merged.
