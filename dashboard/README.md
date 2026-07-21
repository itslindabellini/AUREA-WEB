# AUREA — Expense Dashboard

An interactive dashboard to track your drop-shipping store expenses: totals per
month, total year-to-date, recurring subscriptions, one-time costs, and upcoming
/ overdue payments. Single self-contained file — no build step, no install.

## How to use it

1. Open `index.html` in any browser (double-click, or drag it into a browser tab).
2. Click **Add expense** to log a cost, or **Data → Load sample data** to see it
   populated first.
3. Switch the month/year at the top to see any period. Click a bar in *Monthly
   expenses* to jump to that month.

Each expense is either:
- **One-time** — a single dated cost (a supplier order, a refund, an annual bill).
  Tick *Already paid* if it's settled; leave it unticked for a scheduled bill.
- **Recurring (monthly)** — a fixed subscription that repeats every month from its
  first-charge date (Shopify, ad spend, apps, your VA…). Optionally set an end date.

## What it shows

| Area | Meaning |
|------|---------|
| This month / Year to date | Total spend for the selected month and the whole year |
| Recurring / mo | Your fixed monthly subscription burn |
| Upcoming 30d | Payments due in the next 30 days |
| By payment type / category | Where the money goes, for the selected month |
| Monthly expenses | 12-month bar chart of total spend |
| Spending trend | Cumulative spend across the year |
| Budget health | Share of the year already paid, and annual recurring run-rate |
| Upcoming & due | The next 45 days of payments (overdue shown in red) |
| Expenses table | Every cost — search, filter, sort, edit, delete |

## Where your data is stored

Everything lives **locally in your browser** (`localStorage`) on the device you
use. Nothing is uploaded anywhere and no account is needed — it's private to you.

Because it's tied to that browser, use **Data → Backup (JSON)** now and then to
save a copy, and **Import backup** to restore it or move to another
computer. **Export CSV** gives you a spreadsheet-friendly file for accounting.

## Later upgrades (when you want them)

The single-file/localStorage approach is the fastest way to start and costs
nothing. When you outgrow it, natural next steps are:

- **Sync across devices / share with an accountant** → back it with Google Sheets,
  Airtable, or Supabase (the same UI, data saved to the cloud instead of the browser).
- **Multi-currency, receipts upload, auto-import from Stripe/Shopify** → add a small
  backend + login.

Ask and we can take any of these on from here.
