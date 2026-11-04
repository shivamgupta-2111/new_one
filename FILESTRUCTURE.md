# File structure

```
ceph-crm/
├─ app/                          Next.js routes
│  ├─ (auth)/login/page.js
│  ├─ (dashboard)/
│  │  ├─ rep/page.js
│  │  ├─ admin/page.js
│  │  └─ ceo/page.js
│  ├─ api/health/route.js        liveness check
│  ├─ globals.css                styles, responsive layer
│  ├─ layout.js                  root layout, fonts, viewport
│  └─ page.js
├─ components/
│  ├─ layout/CrmShell.js         header, nav, main mount; loads the runtime
│  └─ shared/Overlays.js         #modal and #toast mounts
├─ lib/
│  ├─ currency.js
│  ├─ database.js
│  └─ permissions.js
├─ modules/                      runtime source, one folder per domain
│  ├─ manifest.json              load order (do not reorder)
│  ├─ core/                      helpers, seed, state, render, sync
│  ├─ auth/                      roles, login, role-picker, portal-nav, portal-render
│  ├─ users/                     users, admin
│  ├─ leads/                     leads, status
│  ├─ accounts/                  accounts, account-info
│  ├─ contacts/                  contacts, mobile, primary, edit
│  ├─ opportunities/             board, fields, detail, attachments, modals,
│  │                             new-opportunity, portal-views, ownership, slack, tabs, permissions, record-page, files-upload
│  ├─ products/                  products, catalogue-view, price-book (tiers, bundles, min/max)
│  ├─ quotations/                quote-base, records, builder, list-view, status, discount-policy, quote-flow,
│  │                             cart, send-quote (email/WhatsApp, customer link #cq/, tracking, expiry)
│  ├─ approvals/                 approvals-view, approval-flow, others-select, popups
│  ├─ invoices/                  create, submit-and-send, views, payment,
│  │                             billing (payments, GST invoice, overdue, Close Won prompt)
│  ├─ header/                    panels, launcher, render-hook
│  ├─ settings/                  settings, theme
│  └─ teams/                     teams, home-board, rep-detail
├─ public/ceph-crm.js            generated from modules/, do not edit
├─ scripts/build-runtime.js      joins modules/ into public/ceph-crm.js
├─ jsconfig.json
├─ next.config.js
├─ package.json
├─ .gitignore
├─ .prettierignore
└─ .prettierrc.json
```
