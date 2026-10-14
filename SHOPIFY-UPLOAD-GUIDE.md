# AUREA Mykonos — Shopify theme

This branch **is** the Shopify theme: the theme folders (`assets/`, `config/`,
`layout/`, `locales/`, `sections/`, `snippets/`, `templates/`) live at the repo
root, which is what Shopify's GitHub integration requires.

There are two ways to get it into Shopify. **Option A (GitHub) is recommended** —
connect once and every fix syncs automatically.

---

## Option A — Connect via GitHub (recommended, auto-syncs)

1. In Shopify admin: **Online Store → Themes**.
2. **Add theme → Connect from GitHub**.
3. Choose this repository and the branch
   **`claude/shopify-theme-upload-issue-f9jxe0`**.
4. Shopify imports the theme. From now on, any commit pushed to this branch
   updates the Shopify theme automatically.
5. Click **Customize** to preview, or **Publish** to go live.

> If you previously saw **"Branch isn't a valid theme"**, that was because the
> theme used to sit in a `shopify-theme/` subfolder. It's now at the repo root,
> so the branch is a valid theme and the connect will succeed.

## Option B — Upload the zip (manual)

Use `design-source/AUREA-Mykonos-Shopify-Theme.zip`:
**Online Store → Themes → Add theme → Upload zip file** → select it →
**Customize** or **Publish**.

---

## What was fixed (why the homepage was empty)

Shopify enforces a **256 KB limit per Liquid file**. The original build put both
the desktop and mobile layouts in one section file, so `aurea-home.liquid`
(285 KB) and `aurea-product.liquid` (359 KB) were over the limit. Shopify
**silently dropped** those two files on import, so the homepage template pointed
at a section that didn't exist — leaving only the store name on screen.

Fix: each page's desktop and mobile markup now lives in its own **snippet**
(`snippets/aurea-*-desktop.liquid`, `snippets/aurea-*-mobile.liquid`), and the
section just renders them. Every Liquid file is now comfortably under 256 KB.
Verified: the home and product pages render pixel-accurately again.

---

## After it's in Shopify: connect your pages

- **Home** — already wired to the store homepage (`templates/index.json`).
- **Product / Collection** — show the AUREA layout with placeholder image slots
  for now; **phase two** connects them to your real products.
- **About / Contact / Tracking / Policies** — create a Page in
  **Online Store → Pages** for each, then set its **Theme template**:

  | Page | Theme template |
  |------|----------------|
  | About | `page.about` |
  | Contact | `page.contact` |
  | Track Order | `page.tracking` |
  | Shipping Policy | `page.shipping-policy` |
  | Return Policy | `page.return-policy` |
  | Privacy Policy | `page.privacy-policy` |
  | Terms & Conditions | `page.terms` |

- **Navigation** — **Online Store → Navigation → Main menu**: point each menu
  item at the Page you created.

## Phase two (when your products are in)

Wire the product/collection templates to live Shopify data (real photos, prices,
variants), make Add to Cart + checkout functional, and refactor the shared
nav/footer into a single reusable snippet.

## Repo layout

```
assets/ config/ layout/ locales/ sections/ snippets/ templates/   ← the theme
design-source/
  ├─ Mykonos Aurea 2.zip                 ← original Claude design (source)
  └─ AUREA-Mykonos-Shopify-Theme.zip     ← packaged theme (manual-upload option)
SHOPIFY-UPLOAD-GUIDE.md
```
