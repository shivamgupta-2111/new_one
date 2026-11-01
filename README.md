# Ceph CRM

A Next.js (App Router) CRM prototype with role-based portals and a quotation → approval → invoice workflow.

> **Prototype notice:** authentication and data persistence run in the browser (`localStorage` / `sessionStorage`). They are not security controls. See [Production readiness](#production-readiness).

## Getting started

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run start    # serve the production build
npm run format   # format the codebase with Prettier
```

## Demo accounts

| Role  | Username | Password   |
| ----- | -------- | ---------- |
| CEO   | `ceo`    | `ceo123`   |
| Admin | `admin`  | `admin123` |
| Rep   | `rep`    | `rep123`   |

Portal routes: `/login`, `/rep`, `/admin`, `/ceo`. The active portal is determined by the signed-in role. Use **Reset demo** in the navigation to restore sample data.

## Features

- **Role portals** – Rep, Admin and CEO dashboards, navigation and record visibility.
- **Pipeline** – opportunity kanban, detail view, activity log, contact roles, and social accounts (LinkedIn, Instagram, Facebook, X).
- **Quotations** – multiple quotes per opportunity, line-item discounts, and a full history linked from each opportunity.
- **Approvals** – discount routing by authority level (below).
- **Invoices** – generated on approval; print / save as PDF; client-submission status.
- **Product catalogue** – list, minimum and maximum price per product (`min ≤ list ≤ max`), managed by Admin and CEO.
- **User management** – Admin creates Reps; CEO creates Admins and Reps. Admin and CEO can also deactivate / reactivate accounts and reset passwords within their authority.
- **Leads and contacts** – change lead status, convert or delete leads; add, edit and delete contacts.
- **Settings page** – full workspace settings for appearance (System / Light / Dark), signed-in account, sales-team assignment overview, user management shortcut, demo-data reset, and workspace statistics.
- **Opportunity ownership** – assign an active sales representative when creating an opportunity; the assigned rep is visible in list, board and opportunity details. Admins and CEOs can reassign opportunities; reps can only assign to themselves.
- **Header** – app launcher, centred search (Ctrl+K), New, favourites (followed deals), notifications with live count, Settings page, help, and a user menu with sign out.
- **Invoices** – submit to client, then mark as paid.
- **Slack share** – records the share on the opportunity timeline (connect a Slack webhook server-side for real delivery).
- **Localisation** – INR currency with Indian digit grouping.

### Approval rules

| Blended discount                      | Approver           |
| ------------------------------------- | ------------------ |
| Up to 2%                              | Rep (self-approve) |
| Up to 5%                              | Admin              |
| Above 5%                              | CEO                |
| Any line priced below product minimum | CEO (always)       |

## Project structure

```
app/            Routes (login, rep, admin, ceo) and global layout/styles
components/     UI components (layout shell and per-domain folders)
modules/        Domain modules: auth, users, leads, accounts, contacts,
                opportunities, products, quotations, approvals, invoices
lib/            Shared utilities (currency, permissions, database adapter)
public/         Browser runtime (ceph-crm.js)
```

The CRM runtime lives in `public/ceph-crm.js` and is being migrated into the domain modules incrementally. Each module's README describes its intended ownership.

## Production readiness

Before using real customer data, add:

- Server-side authentication (hashed passwords, secure HTTP-only sessions) and server-enforced role / discount permissions
- A shared database and API routes, with audit logging and concurrent-approval handling
- Configured GST / tax rules and legal invoice numbering (generated invoices are workflow previews, not statutory tax invoices)
- Email / ERP delivery integration, backups and automated tests
