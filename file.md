# Sales Cloud — File Structure and Contents

Each file is listed with a one-line description of what it contains.

```text
sales-cloud-next/
├── .gitignore — Project asset or configuration file; see the source for implementation details.
├── .prettierignore — Project asset or configuration file; see the source for implementation details.
├── .prettierrc.json — Project asset or configuration file; see the source for implementation details.
├── README.md — Project asset or configuration file; see the source for implementation details.
├── jsconfig.json — Project asset or configuration file; see the source for implementation details.
├── next.config.js — Next.js configuration, including build/runtime settings.
├── package-lock.json — Project asset or configuration file; see the source for implementation details.
├── package.json — Project asset or configuration file; see the source for implementation details.
├── app/
│   ├── globals.css — Project asset or configuration file; see the source for implementation details.
│   ├── layout.js — Root application layout, global styles, metadata, and shared page wrapper.
│   ├── page.js — Application landing page and entry-point routing.
│   ├── (auth)/
│   │   ├── login/
│   │   │   ├── page.js — Login screen route and authentication UI.
│   ├── (dashboard)/
│   │   ├── admin/
│   │   │   ├── page.js — Admin dashboard route and its page content.
│   │   ├── ceo/
│   │   │   ├── page.js — CEO dashboard route and its page content.
│   │   ├── rep/
│   │   │   ├── page.js — Sales representative dashboard route and its page content.
│   ├── api/
│   │   ├── health/
│   │   │   ├── route.js — GET health-check endpoint returning service status and timestamp.
├── components/
│   ├── dashboard/
│   │   ├── MetricCard.js — Dashboard KPI card showing a label, value, and optional change.
│   ├── invoices/
│   │   ├── InvoiceSummary.js — Invoice summary card with customer, amount, due date, and status.
│   ├── layout/
│   │   ├── CrmShell.js — Shared CRM shell/navigation layout for authenticated pages.
│   │   ├── PageHeader.js — Reusable page title, description, and action area.
│   │   ├── SectionCard.js — Reusable bordered content section with optional heading and actions.
│   ├── opportunities/
│   │   ├── StagePill.js — Opportunity pipeline stage label with stage-specific styling.
│   ├── quotations/
│   │   ├── QuoteTotals.js — Quotation subtotal, discount, tax, and total display.
│   ├── shared/
│   │   ├── ConfirmButton.js — Client-side button that asks for confirmation before invoking a callback.
│   │   ├── EmptyState.js — Reusable empty-list message with optional action.
│   │   ├── StatusBadge.js — Reusable status label with semantic color variants.
├── lib/
│   ├── currency.js — Currency formatting and monetary display utilities.
│   ├── database.js — Database access, persistence helpers, and data operations.
│   ├── permissions.js — Role-based access rules and permission checks.
├── modules/
│   ├── accounts/
│   │   ├── index.js — Customer account validation, health classification, and account search.
│   ├── approvals/
│   │   ├── index.js — Discount approval routing, authorization checks, and decision audit records.
│   ├── auth/
│   │   ├── index.js — Authentication helpers, demo users, role validation, and access checks.
│   ├── contacts/
│   │   ├── index.js — Contact validation and account-to-contact relationship lookup.
│   ├── invoices/
│   │   ├── index.js — Invoice number generation, GST split/IGST calculations, and payment status.
│   ├── leads/
│   │   ├── index.js — Lead qualification, status definitions, and lead conversion helpers.
│   ├── opportunities/
│   │   ├── index.js — Pipeline stages, validation, pipeline totals, weighted value, and stage changes.
│   ├── products/
│   │   ├── index.js — Product validation and configured price-limit checks.
│   ├── quotations/
│   │   ├── index.js — Quotation line validation, subtotal/discount/tax totals, and submission status.
│   ├── users/
│   │   ├── index.js — User validation, creation, duplicate checks, and active/inactive state updates.
├── public/
│   ├── sales-cloud.js — Main browser-side Sales Cloud application script and interactive UI logic.
```

## Directory summary

- `app/` — Next.js pages, route layouts, and API endpoints.
- `components/` — reusable React UI components grouped by purpose.
- `lib/` — shared infrastructure and utility functions.
- `modules/` — domain-specific business logic, one module per feature area.
- `public/` — static assets served directly by the application.
