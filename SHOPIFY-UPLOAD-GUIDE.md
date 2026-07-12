# AUREA Mykonos → Shopify — Upload Guide

Your site was designed in Claude's design tool, which produces a **React-based
static mockup** (custom `<x-dc>` / `<sc-if>` tags, a `support.js` runtime, and
`{{ ... }}` placeholders). Shopify can't read that format — and worse, Shopify's
own Liquid language *also* uses `{{ }}`, so uploading the raw files makes the
design and content break or render inaccurately. That is exactly the problem you
were hitting.

This folder contains a **real Shopify theme** built from your design. Every page
was rendered to its true final HTML (so all the `{{ }}` placeholders and
`<sc-if>` logic are already resolved away), then converted into proper Liquid
sections and templates. It looks pixel-identical to your mockup on both desktop
and mobile.

## What's in here

| Path | What it is |
|------|-----------|
| `shopify-theme/` | The theme **source** (version-controlled, editable) |
| `AUREA-Mykonos-Shopify-Theme.zip` | The **ready-to-upload** theme package |
| `Mykonos Aurea 2.zip` | Your original Claude design (kept for reference) |

### Pages included (desktop + mobile, responsive)
Home, Collection, Product, About, Contact, Tracking, Privacy Policy, Shipping
Policy, Return Policy, Terms & Conditions.

## How to upload it to Shopify

1. In Shopify admin, go to **Online Store → Themes**.
2. Scroll to **Add theme → Upload zip file**.
3. Choose **`AUREA-Mykonos-Shopify-Theme.zip`** and upload.
4. Once it appears in your theme library, click **Customize** to preview, or
   **Publish** to make it live.

## After uploading: connect your pages

The design pages are ready; you now point Shopify's content at them:

- **Home** — already wired to the store homepage (`templates/index.json`).
- **Product / Collection** — these templates render the AUREA product & collection
  layouts. In **phase two** we connect them to your real products so the
  placeholder image slots fill with live product photos, prices, and variants.
- **About / Contact / Tracking / Policies** — create a Page in
  **Online Store → Pages** for each, then in the page editor set the **Theme
  template** to the matching one:
  - About → `page.about`
  - Contact → `page.contact`
  - Tracking → `page.tracking`
  - Privacy Policy → `page.privacy-policy`
  - Shipping Policy → `page.shipping-policy`
  - Return Policy → `page.return-policy`
  - Terms & Conditions → `page.terms`

## This is "phase one: look first"

Per the plan, phase one gets the **design live and accurate** on Shopify. The
pages currently show the design's built-in placeholder image slots (the diagonal
striped boxes) in the product grids — that's intentional.

**Phase two (wire it up)** connects the theme to live Shopify data:
- Replace the static product/collection markup with Liquid loops over your real
  products (`{% for product in collection.products %}` …), so photos, names,
  prices, and variants come from your catalog.
- Make **Add to Cart**, the cart, and checkout fully functional.
- Refactor the shared nav + footer into a single reusable snippet so edits apply
  everywhere at once (right now each page carries its own faithful copy).

## Notes / known trade-offs (phase one)

- **Fonts**: Manrope loads from Google Fonts; the "Milanesa Serif" display font
  is bundled in `assets/` and loaded via `@font-face`.
- **Desktop vs mobile**: your design had separate desktop and mobile layouts, so
  the theme includes both and shows the right one via a CSS breakpoint at 768px.
  It's slightly heavier but guarantees the look matches your mockup exactly.
- **Interactivity**: menus/animations that were pure CSS still work. Anything the
  old React runtime powered is reconnected as native Shopify behaviour in phase
  two.
