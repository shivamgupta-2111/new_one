# Sales Cloud – Next.js CRM prototype

A Next.js App Router port of the supplied Sales Cloud interface. The original Salesforce-style visual language, navigation, opportunity kanban, detail layout, and inline interactions are retained; the project adds three role-specific portals and a quotation approval-to-invoice workflow.

## Run locally

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Demo portals

Use the portal selector in the top bar to switch between:

- **Rep portal** – sees the logged-in rep's opportunities, creates quotes, and can self-approve a blended discount up to 2%.
- **Admin portal** – sees the full team pipeline, can approve quotes routed to Admin up to a 5% discount, and can reject requests.
- **CEO portal** – executive view across the company and final approval authority for any discount percentage.

The portal selector is a prototype role switch, not authentication. Real deployments must use server-side authentication and authorization; a browser dropdown and localStorage are not security controls.

## Quotation → approval → invoice → client

1. Open an opportunity and choose **Generate quote**.
2. Update line items and discounts, then choose **Submit for approval**.
3. Rep quotations are submitted to Admin for approval when within the Admin limit; discounts above 5% route to CEO. Admin can approve up to 5%; anything above that routes to CEO. CEO approval is unlimited. A price below a product minimum always routes to CEO, regardless of discount percentage.
4. An invoice is generated only after approval.
5. Open the invoice and choose **Submit to client**. In this demo the action records the submission status; connect an email or ERP provider for real delivery.

## Added features

- INR formatting with Indian digit grouping throughout the UI.
- Rep / Admin / CEO portal views and navigation.
- Dashboard KPIs for pipeline, weighted forecast, won revenue, win rate, churn watchlist, revenue at risk, pending approvals, and generated invoices.
- Top-deal ranking, upcoming closes, task list, churn-risk account list, and admin/CEO rep performance view.
- Quote discount approval queue and approval / rejection actions.
- Invoice generation after approval, invoice detail, print / save PDF, and client-submission status.
- Opportunity social account fields for LinkedIn, Instagram, Facebook, and X.
- Contact mobile number field, including click-to-call links.

## Demo data and persistence

The prototype uses browser `localStorage` for demo persistence. Use **Reset demo** in the navigation to restore the sample data. The original demo numeric amounts are treated as INR values (they are not converted from USD using an exchange rate).

## Production work still required

Before using this with real customer data, add a database and server APIs, real authentication, server-enforced role/discount permissions, audit logs, concurrent approval handling, configured tax/GST rules and legal invoice numbering, email/CRM/ERP delivery integration, backups, and automated tests. The generated invoice is a workflow preview, not a statutory tax invoice; no GST is calculated by default.


## Product pricing and quotation history updates

- Admin and CEO can manage the product catalogue from **Products**.
- Each product stores a list price, minimum selling price, and maximum selling price.
- The product price range is validated as `minimum ≤ list ≤ maximum`.
- Any quotation line whose discounted unit price falls below that product's minimum selling price is routed to **CEO approval**, regardless of the normal role discount threshold.
- Rep quotations are submitted to Admin for review; discounts above Admin authority route to CEO. Admin/CEO approvals generate the invoice.
- Opportunity details show all quotation numbers and generated invoice numbers. Select a quotation number to reopen that exact quotation; select an invoice number to open that invoice.
- Multiple quotations per opportunity are retained as separate records in the Quotes history.

These workflow records are currently stored in browser localStorage for this prototype. For production, enforce the pricing rules, role permissions, approval actions, and invoice numbering on a server backed by a shared database.


## Login and user account management

The prototype opens on a login screen. Demo credentials:
- CEO: `ceo` / `ceo123`
- Admin: `admin` / `admin123`
- Rep: `rep` / `rep123`

Permissions:
- Admin can create Rep accounts.
- CEO can create Admin and Rep accounts.
- Reps cannot create user accounts.
- Admin and CEO can open **User accounts** from the navigation.

Security note: this is a front-end prototype. Credentials and session state are stored in browser localStorage and are not secure. Before production, replace this with server-side authentication, hashed passwords, secure HTTP-only sessions, and server/database-enforced role-based access control. Never use the demo credentials in production.


## Opportunity social links and contact phone numbers

- Social media fields (LinkedIn, Instagram, Facebook, X) are displayed at the bottom of the opportunity record, after the opportunity sections.
- Contact mobile numbers appear in Contact Roles when saved; missing numbers can be added directly from the opportunity.
- Mobile numbers remain available in the Contacts list and can be clicked to call on supported devices.


## Approval routing and independent browser tabs

- Quote submissions are persisted to shared browser localStorage and appear in the matching approval queue.
- Admin sees quotations with **Pending Admin Approval**; CEO sees escalated **Pending CEO Approval** quotations.
- Approving creates the invoice, updates the quote, and writes an opportunity activity entry. Rejection is persisted too.
- Each browser tab now keeps its own login in sessionStorage. Open the same app URL in three tabs and sign in separately as Rep, Admin, and CEO.
- Business records synchronize between tabs using the browser storage event, so a rep's newly submitted quote can appear in the Admin/CEO tab without sharing the login session.

Prototype limitation: browser localStorage synchronization only works in the same browser profile and origin. It is not a substitute for a shared backend database or server-side authorization in production.


## Opportunity social media placement

The social media accounts card (LinkedIn, Instagram, Facebook, X) now appears immediately below the **Opportunity partners** card in the opportunity detail sidebar, matching the supplied screenshot. The existing social fields and autosave behavior are retained.


## Verified social media position

The social media panel is now part of the original opportunity detail sidebar markup itself, inserted immediately after the Opportunity partners card and before the sidebar/grid closing tags. It is no longer appended after the entire opportunity page. This keeps it visible in the same sidebar column and directly underneath Opportunity partners.


## Modular project structure

The project now includes the requested App Router, components, domain modules, and lib folders.
The original CRM browser runtime remains at `public/sales-cloud.js` so the existing interface and
prototype interactions continue to work unchanged while the codebase is migrated incrementally.

Portal route entry points:
- `/login`
- `/rep`
- `/admin`
- `/ceo`

The current login/role session determines the active portal; these routes reuse the same CRM shell.
The domain folders document the intended ownership of each feature. `lib/database.js` is a placeholder:
the current prototype still stores records in browser localStorage, not a shared production database.
