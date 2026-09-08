/* AUREA Mykonos — interactivity restored as vanilla JS.
 * The original design was a React app; the static port froze its behavior.
 * This re-implements the key interactions natively. No dependencies. */
(function () {
  'use strict';

  var MENUS = {
    'Summer Clothes': ['Shop All', { label: 'Dresses', children: ['Summer Dresses', 'Casual Dresses', 'Evening Dresses', 'Holiday Dresses'] }, { label: 'Bottoms', children: ['Trousers', 'Jeans', 'Skirts', 'Shorts'] }, 'Tops & Blouses', 'Jumpsuits', 'Overalls', 'Swimsuits'],
    'Footwear':       ['Shop All', 'Loafers', 'Sandals', 'Boots'],
    'Jewelry':        ['Shop All', 'Necklaces', 'Earrings', 'Bracelets', 'Rings', '---', 'Gold Jewelry', 'Silver Jewelry', '---', 'Full Sets'],
    'Bags':           ['Shop All'],
    'Winter Clothes': ['Shop All', 'Sweaters', 'Coats', 'Vests']
  };
  // Categories shown as a plain link (no roll-down submenu) — few products for now.
  var FLAT = { 'Bags': true };
  // Greek display labels for the nav. URLs stay keyed by the English names above (so the
  // collection handles are unchanged); we only translate what the shopper sees.
  var NAV_TR = {
    'Shop All': 'Shop All',
    'Summer Clothes': 'Summer Clothes', 'Winter Clothes': 'Winter Clothes', 'Footwear': 'Shoes',
    'Jewelry': 'Jewelry', 'Bags': 'Bags',
    'Necklaces': 'Necklaces', 'Earrings': 'Earrings', 'Bracelets': 'Bracelets', 'Rings': 'Rings',
    'Gold Jewelry': 'Gold Jewelry', 'Silver Jewelry': 'Silver Jewelry', 'Full Sets': 'Full Sets'
  }
  var NAV_EN = {}; Object.keys(NAV_TR).forEach(function (k) { NAV_EN[NAV_TR[k]] = k; });
  function trLabel(en) { return NAV_TR[en] || en; }
  var TOP_LINKS = [
    ['Home', '/'], ['About Us', '/pages/about-us'],
    ['Contact', '/pages/contact'], ['Tracking', '/pages/tracking']
  ];
  var FAQ = [
    { q: 'Είναι τα ρούχα στα κανονικά μεγέθη;',
      a: 'Ναι, τα ρούχα μας είναι σχεδιασμένα να εφαρμόζουν στα κανονικά μεγέθη.\n\nΓια την καλύτερη δυνατή εφαρμογή, σας προτείνουμε να δείτε τον Οδηγό Μεγεθών σε κάθε σελίδα προϊόντος πριν την παραγγελία σας. Καθώς κάθε στιλ και κάθε σώμα είναι μοναδικό, η σύγκριση των διαστάσεών σας με τον πίνακα μεγεθών είναι ο καλύτερος τρόπος να βρείτε το τέλειο μέγεθος.' },
    { q: 'Πώς να φροντίσω τα ρούχα μου;',
      a: 'Για να διατηρήσετε τα κομμάτια σας στην καλύτερη κατάστασή τους, σας προτείνουμε να ακολουθείτε τις οδηγίες φροντίδας στην ετικέτα.\n\nΓενικά, προτείνουμε πλύσιμο σε απαλό πρόγραμμα με κρύο νερό ή στο χέρι όπου χρειάζεται. Αποφύγετε τη χλωρίνη, το στέγνωμα σε υψηλή θερμοκρασία και την παρατεταμένη έκθεση στον ήλιο, καθώς μπορεί να επηρεάσουν το ύφασμα και το χρώμα με τον καιρό.\n\nΜε τη σωστή φροντίδα, τα κομμάτια AUREA Mykonos θα παραμείνουν όμορφα και θα σας συνοδεύουν για χρόνια.' },
    { q: 'Πόσο διαρκεί η αποστολή;',
      a: 'Φροντίζουμε να επεξεργαζόμαστε και να αποστέλλουμε όλες τις παραγγελίες όσο πιο γρήγορα γίνεται. Μόλις αποσταλεί η παραγγελία σας, η παράδοση διαρκεί συνήθως 6–12 εργάσιμες ημέρες, ανάλογα με την περιοχή σας.\n\nΜόλις αποσταλεί η παραγγελία σας, θα λάβετε email επιβεβαίωσης με στοιχεία παρακολούθησης, ώστε να ακολουθείτε το ταξίδι της σε κάθε βήμα.' },
    { q: 'Μπορώ να επιστρέψω την παραγγελία μου;',
      a: 'Ναι. Αν δεν είστε απόλυτα ικανοποιημένοι με την παραγγελία σας, μπορείτε να επιστρέψετε τα προϊόντα εντός 30 ημερών από την παράδοση, εφόσον είναι αφόρετα, άπλυτα και στην αρχική τους κατάσταση με όλες τις ετικέτες.\n\nΑν έχετε οποιαδήποτε απορία, η ομάδα υποστήριξής μας είναι πάντα στη διάθεσή σας.' }
  ];

  // For now every category/sub-item points at the full catalog; phase two maps
  // these to real collection handles once collections exist.
  // Shopify-style handle: lowercase, non-alphanumerics -> hyphens
  function handleize(s) { return String(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); }
  // "Shop All" -> the parent category collection; other items -> their own collection
  function itemUrl(category, item) {
    // "Pants" appears under both Summer Clothes (/collections/pants) and Winter
    // Clothes; the winter one points at its own collection instead.
    if (category === 'Winter Clothes' && item === 'Pants') return '/collections/winter-pants';
    if (category === 'Winter Clothes' && item === 'Sets') return '/collections/winter-sets';
    // No dedicated "sweaters" collection yet — fall back to the Winter Clothes
    // shop-all so the link is never blank. Point this at the real handle once it exists.
    if (category === 'Winter Clothes' && item === 'Sweaters') return '/collections/sweaters';
    if (category === 'Bags' && item === 'Luxury Bags') return '/collections/bags?view=luxury';
    if (category === 'Jewelry' && item === 'Ankle Jewelry') return '/collections/ankle-jewlery';
    if (category === 'Jewelry' && item === 'Full Sets') return '/collections/jewlery-sets';
    if (category === 'Jewelry' && item === 'Gold Jewelry') return '/collections/gold-jewlery';
    if (category === 'Jewelry' && item === 'Silver Jewelry') return '/collections/silver-jewlery';
    if (item === 'Shop All') return catUrl(category);
    return '/collections/' + handleize(item);
  }
  function catUrl(category) {
    return '/collections/' + handleize(category);
  }

  function el(tag, css, text) {
    var e = document.createElement(tag);
    if (css) e.style.cssText = css;
    if (text != null) e.textContent = text;
    return e;
  }

  /* ---------- 1. Desktop nav dropdowns ---------- */
  function buildDropdowns() {
    var scopes = document.querySelectorAll('.aurea-desktop');
    (scopes.length ? scopes : [document]).forEach(function (scope) {
      scope.querySelectorAll('a').forEach(function (a) {
        var raw = a.textContent.trim();
        var label = NAV_EN[raw] || raw; // the label shows Greek; map back to the English key for URLs
        if (!MENUS[label] || !a.querySelector('svg')) return;
        var host = a.parentElement;
        if (!host) return;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        if (host.getAttribute('data-aurea-dd')) return;
        host.setAttribute('data-aurea-dd', '1');
        a.href = catUrl(label); // the category label links to its collection

        // flat categories: just a link to the collection, no roll-down menu or chevron
        if (FLAT[label]) {
          var flatSvg = a.querySelector('svg');
          if (flatSvg) flatSvg.remove();
          return;
        }

        var panel = el('div', 'position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:16px;z-index:600;opacity:0;visibility:hidden;transition:opacity .18s ease;pointer-events:none;');
        var card = el('div', "background:#fff;border:1px solid #EFEAE2;box-shadow:0 18px 44px rgba(20,18,16,.13);min-width:200px;padding:8px 0;display:flex;flex-direction:column;");
        var ITEMCSS = "padding:11px 24px;font-family:'Manrope',sans-serif;font-weight:500;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:#4A4A4A;white-space:nowrap;transition:background .15s ease,color .15s ease;";
        var CARDCSS = "background:#fff;border:1px solid #EFEAE2;box-shadow:0 18px 44px rgba(20,18,16,.13);min-width:200px;padding:8px 0;display:flex;flex-direction:column;";
        MENUS[label].forEach(function (item) {
          if (item === '---') { card.appendChild(el('div', 'height:1px;margin:8px 20px;background:#EFEAE2;')); return; }
          // second-level item: hovering the row rolls a submenu out to the right
          if (item && typeof item === 'object' && item.children) {
            var row = el('div', 'position:relative;');
            var plink = el('a', ITEMCSS + 'display:flex;align-items:center;justify-content:space-between;gap:18px;');
            plink.href = itemUrl(label, item.label);
            plink.appendChild(el('span', '', trLabel(item.label)));
            plink.appendChild(el('span', 'font-size:13px;line-height:1;opacity:.55;', '›'));
            var fly = el('div', 'position:absolute;top:-8px;left:100%;padding-left:6px;z-index:610;opacity:0;visibility:hidden;transition:opacity .16s ease;pointer-events:none;');
            var flycard = el('div', CARDCSS);
            item.children.forEach(function (ch) {
              var cl = el('a', ITEMCSS, trLabel(ch));
              cl.href = itemUrl(label, ch);
              cl.setAttribute('data-aurea-hv', '1');
              cl.addEventListener('mouseenter', function () { cl.style.background = '#F5F0EB'; cl.style.color = '#111'; });
              cl.addEventListener('mouseleave', function () { cl.style.background = ''; cl.style.color = '#4A4A4A'; });
              flycard.appendChild(cl);
            });
            fly.appendChild(flycard);
            row.appendChild(plink); row.appendChild(fly);
            row.addEventListener('mouseenter', function () { fly.style.opacity = '1'; fly.style.visibility = 'visible'; fly.style.pointerEvents = 'auto'; plink.style.background = '#F5F0EB'; plink.style.color = '#111'; });
            row.addEventListener('mouseleave', function () { fly.style.opacity = '0'; fly.style.visibility = 'hidden'; fly.style.pointerEvents = 'none'; plink.style.background = ''; plink.style.color = '#4A4A4A'; });
            card.appendChild(row);
            return;
          }
          var link = el('a', ITEMCSS, trLabel(item));
          link.href = itemUrl(label, item);
          // own hover here; flag so the generic hover-restore pass skips it (avoids double-binding that made items stick)
          link.setAttribute('data-aurea-hv', '1');
          link.addEventListener('mouseenter', function () { link.style.background = '#F5F0EB'; link.style.color = '#111'; });
          link.addEventListener('mouseleave', function () { link.style.background = ''; link.style.color = '#4A4A4A'; });
          card.appendChild(link);
        });
        panel.appendChild(card);
        host.appendChild(panel);

        var chevron = a.querySelector('svg');
        var open = function () {
          panel.style.opacity = '1'; panel.style.visibility = 'visible'; panel.style.pointerEvents = 'auto';
          if (chevron) chevron.style.transform = 'rotate(180deg)';
        };
        var close = function () {
          panel.style.opacity = '0'; panel.style.visibility = 'hidden'; panel.style.pointerEvents = 'none';
          if (chevron) chevron.style.transform = '';
        };
        if (chevron) chevron.style.transition = 'transform .2s ease';
        host.addEventListener('mouseenter', open);
        host.addEventListener('mouseleave', close);
        a.addEventListener('click', function (e) { // click the label = go to catalog; keep default
        });
      });
    });
  }

  /* ---------- 2. Mobile slide-in menu (matches original design) ---------- */
  function buildMobileMenu() {
    var btn = document.querySelector('.aurea-mobile [aria-label="Menu"], .aurea-mobile button[aria-label*="enu"]');
    if (!btn || btn.getAttribute('data-aurea-mm')) return;
    btn.setAttribute('data-aurea-mm', '1');

    // mobile category order differs from desktop: summer, winter, footwear, jewelry, bags
    var ORDER = ['Summer Clothes', 'Winter Clothes', 'Footwear', 'Jewelry', 'Bags'];
    var LINK = "padding:15px 4px;font-family:'Manrope',sans-serif;font-weight:600;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;color:#4A4A4A;text-decoration:none;display:block;";

    var catHtml = ORDER.map(function (cat) {
      // flat categories: a single link row, no expand +/- and no submenu
      if (FLAT[cat]) {
        return '<a href="' + catUrl(cat) + '" style="' + LINK + 'border-bottom:1px solid #F5F0EB;">' + trLabel(cat) + '</a>';
      }
      var subs = MENUS[cat].map(function (item) {
        if (item === '---') return '<div style="height:1px;margin:9px 22px;background:#F0EAE0;"></div>';
        if (item && typeof item === 'object' && item.children) {
          var head = '<a href="' + itemUrl(cat, item.label) + '" style="padding:10px 8px 10px 22px;font-family:\'Manrope\',sans-serif;font-weight:600;font-size:14px;letter-spacing:.01em;color:#4A4A4A;text-decoration:none;">' + trLabel(item.label) + '</a>';
          var kids = item.children.map(function (ch) {
            return '<a href="' + itemUrl(cat, ch) + '" style="padding:8px 8px 8px 40px;font-family:\'Manrope\',sans-serif;font-weight:500;font-size:13px;letter-spacing:.01em;color:#8A7F70;text-decoration:none;">' + trLabel(ch) + '</a>';
          }).join('');
          return head + kids;
        }
        return '<a href="' + itemUrl(cat, item) + '" style="padding:10px 8px 10px 22px;font-family:\'Manrope\',sans-serif;font-weight:500;font-size:14px;letter-spacing:.01em;color:#6E675E;text-decoration:none;">' + trLabel(item) + '</a>';
      }).join('');
      return '<div style="border-bottom:1px solid #F5F0EB;">' +
        '<button class="aurea-mm-cat" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;padding:15px 4px;font-family:\'Manrope\',sans-serif;font-weight:600;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;color:#4A4A4A;text-align:left;">' +
          '<span>' + trLabel(cat) + '</span>' +
          '<span class="aurea-mm-sign" style="font-family:\'Manrope\',sans-serif;font-weight:400;font-size:18px;color:#8A7F70;line-height:1;flex:0 0 auto;">+</span>' +
        '</button>' +
        '<div class="aurea-mm-sub" style="display:none;padding:2px 4px 14px;flex-direction:column;gap:2px;">' + subs + '</div>' +
      '</div>';
    }).join('');

    // scoped reset so inherited margins/line-height on the live site can't
    // distort the drawer spacing — it renders exactly like the design.
    if (!document.getElementById('aurea-mm-style')) {
      var st = document.createElement('style'); st.id = 'aurea-mm-style';
      st.textContent =
        '.aurea-mm,.aurea-mm *{box-sizing:border-box;margin:0;}' +
        '.aurea-mm a,.aurea-mm button,.aurea-mm span{line-height:1.2;text-decoration:none;}' +
        '.aurea-mm a:hover,.aurea-mm .aurea-mm-cat:hover>span:first-child{color:#111;}';
      document.head.appendChild(st);
    }

    var overlay = el('div', 'position:fixed;inset:0;background:rgba(20,18,16,.4);z-index:5000;opacity:0;visibility:hidden;transition:opacity .3s ease;');
    var drawer = el('div', "position:fixed;top:0;left:0;height:100%;width:min(86%,360px);background:#fff;z-index:5001;box-shadow:18px 0 50px rgba(0,0,0,.22);transform:translateX(-100%);transition:transform .38s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;");
    drawer.className = 'aurea-mm';
    drawer.innerHTML =
      '<div style="display:flex;align-items:center;justify-content:space-between;padding:26px;border-bottom:1px solid #EFEAE2;">' +
        '<span style="font-family:\'Milanesa Serif\',Georgia,serif;font-weight:500;font-size:21px;color:#111;">Menu</span>' +
        '<button class="aurea-mm-close" aria-label="Close" style="width:38px;height:38px;border:none;background:transparent;color:#4A4A4A;cursor:pointer;display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><line x1="6" y1="6" x2="18" y2="18"></line><line x1="18" y1="6" x2="6" y2="18"></line></svg></button>' +
      '</div>' +
      '<div style="flex:1 1 auto;overflow-y:auto;padding:14px 26px 6px;display:flex;flex-direction:column;">' +
        '<a href="/" style="' + LINK + 'border-bottom:1px solid #F5F0EB;">Home</a>' +
        '<div style="height:36px;flex:0 0 auto;"></div>' +
        catHtml +
        '<div style="height:36px;flex:0 0 auto;"></div>' +
        '<a href="/pages/about-us" style="' + LINK + 'border-bottom:1px solid #F5F0EB;">About Us</a>' +
        '<a href="/pages/tracking" style="' + LINK + 'border-bottom:1px solid #F5F0EB;">Tracking</a>' +
        '<a href="/pages/contact" style="' + LINK + '">Contact</a>' +
      '</div>' +
      '<div style="margin-top:auto;padding:22px 20px;border-top:1px solid #EFEAE2;">' +
        '<a href="/collections/all" style="display:block;text-align:center;font-family:\'Manrope\',sans-serif;font-weight:700;font-size:13px;letter-spacing:.14em;text-transform:uppercase;background:#111;color:#fff;padding:18px;text-decoration:none;transition:opacity .2s ease;">Shop Now</a>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:15px;font-family:\'Manrope\',sans-serif;font-weight:500;font-size:11.5px;color:#9A948C;white-space:nowrap;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="10" width="14" height="10" rx="1.2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>' +
          'Secure payment · Free shipping' +
        '</div>' +
      '</div>';
    overlay.appendChild(drawer);
    document.body.appendChild(overlay);

    drawer.querySelectorAll('.aurea-mm-cat').forEach(function (row) {
      row.addEventListener('click', function () {
        var sub = row.nextElementSibling, sign = row.querySelector('.aurea-mm-sign');
        var openNow = sub.style.display === 'none' || !sub.style.display;
        sub.style.display = openNow ? 'flex' : 'none';
        if (sign) sign.textContent = openNow ? '–' : '+';
      });
    });

    var openM = function () { overlay.style.visibility = 'visible'; overlay.style.opacity = '1'; requestAnimationFrame(function () { drawer.style.transform = 'translateX(0)'; }); document.body.style.overflow = 'hidden'; };
    var closeM = function () { drawer.style.transform = 'translateX(-100%)'; overlay.style.opacity = '0'; document.body.style.overflow = ''; setTimeout(function () { overlay.style.visibility = 'hidden'; }, 320); };
    btn.addEventListener('click', function (e) { e.preventDefault(); openM(); });
    drawer.querySelector('.aurea-mm-close').addEventListener('click', closeM);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeM(); });
  }

  /* ---------- 3. FAQ accordion (answer inside the card, +/- sign) ---------- */
  function buildFAQ() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('button'));
    FAQ.forEach(function (item) {
      buttons.forEach(function (btn) {
        if (btn.getAttribute('data-aurea-faq')) return;
        if (btn.textContent.replace(/\s+/g, ' ').trim().indexOf(item.q) !== 0) return;
        btn.setAttribute('data-aurea-faq', '1');
        btn.style.cursor = 'pointer';

        // answer expands INSIDE the card, right after the button
        var ans = el('div', 'max-height:0;overflow:hidden;transition:max-height .34s ease;');
        var inner = el('div', "padding:0 26px 26px;max-width:640px;text-wrap:pretty;font-family:'Manrope',sans-serif;font-weight:500;font-size:14.5px;line-height:1.75;color:#6E675E;white-space:pre-line;");
        inner.textContent = item.a;
        ans.appendChild(inner);
        btn.parentNode.insertBefore(ans, btn.nextSibling);

        // the sign is a span reading "+"; toggle it to "–"
        var sign = null, spans = btn.querySelectorAll('span');
        for (var i = 0; i < spans.length; i++) {
          if (/^[+–−\-]$/.test(spans[i].textContent.trim())) { sign = spans[i]; break; }
        }
        if (!sign) sign = btn.lastElementChild;

        btn.addEventListener('click', function () {
          var openNow = ans.style.maxHeight === '0px' || !ans.style.maxHeight;
          ans.style.maxHeight = openNow ? (inner.offsetHeight + 4) + 'px' : '0px';
          if (sign) sign.textContent = openNow ? '–' : '+';
        });
      });
    });
  }

  /* ---------- 4. Restore hover animations ----------
   * The design's hover end-states (style-hover) were dropped in the static
   * port, but the CSS transitions survived. Re-attach each hover by matching
   * the element's transition to its original hover — Shop-by-Collection cards,
   * CTA lifts/fills, product/category cards, etc. */
  function restoreHovers() {
    // key = transitionProperty | transitionDuration  (reliable across browsers)
    var MAP = {
      'transform,filter|.55s,.55s': 'transform:scale(1.012);filter:brightness(.93)',
      'transform|.45s': 'transform:translateY(-4px)',
      'transform,box-shadow|.45s,.45s': 'transform:scale(1.03);box-shadow:0 22px 46px rgba(20,18,16,.14)',
      'transform,box-shadow|.25s,.25s': 'transform:translateY(-4px);box-shadow:0 14px 30px rgba(0,0,0,.28)',
      'transform,box-shadow|.2s,.2s': 'transform:translateY(-4px);box-shadow:0 12px 26px rgba(0,0,0,.14)',
      'background,color|.15s,.15s': 'background:#F5F0EB;color:#111',
      'background|.25s': 'background:rgba(255,255,255,.06)',
      'opacity|.4s': 'opacity:1'
    };
    var norm = function (t) { return (t || '').toLowerCase().replace(/\s+/g, '').replace(/(^|[^0-9])0\./g, '$1.'); };
    var isLight = function (c) { var m = (c || '').match(/\d+/g); if (!m) return false; return (0.2126 * +m[0] + 0.7152 * +m[1] + 0.0722 * +m[2]) > 140; };

    document.querySelectorAll('.aurea-page [style*="transition"]').forEach(function (el) {
      if (el.getAttribute('data-aurea-hv')) return;
      var t = norm(el.style.transitionProperty) + '|' + norm(el.style.transitionDuration);
      var hov = MAP[t];
      if (!hov && t === 'color|.2s') hov = isLight(getComputedStyle(el).color) ? 'color:#fff' : 'color:#111';
      if (!hov) return;
      el.setAttribute('data-aurea-hv', '1');
      var decls = hov.split(';').filter(Boolean).map(function (d) { var i = d.indexOf(':'); return [d.slice(0, i).trim(), d.slice(i + 1).trim()]; });
      var saved = null;
      el.addEventListener('mouseenter', function () {
        saved = decls.map(function (d) { return el.style.getPropertyValue(d[0]); });
        decls.forEach(function (d) { el.style.setProperty(d[0], d[1]); });
      });
      el.addEventListener('mouseleave', function () {
        if (!saved) return;
        decls.forEach(function (d, i) { if (saved[i]) el.style.setProperty(d[0], saved[i]); else el.style.removeProperty(d[0]); });
      });
    });
  }

  function hoverPolish() {
    var s = document.createElement('style');
    s.textContent = '.aurea-desktop [data-aurea-dd]>a:hover{color:#111 !important;}';
    document.head.appendChild(s);
  }

  /* ---------- 5. Quick Add to cart (collection cards) ---------- */
  function quickAdd() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-aurea-add]') : null;
      if (!btn) return;
      e.preventDefault(); e.stopPropagation();
      var id = btn.getAttribute('data-aurea-add');
      var orig = btn.textContent;
      if (!id) { btn.textContent = 'Μη διαθέσιμο'; setTimeout(function () { btn.textContent = orig; }, 1600); return; }
      btn.textContent = 'Προσθήκη…';
      fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ id: id, quantity: 1 }) })
        .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
        .then(function (res) {
          if (!res.ok) {
            // Surface Shopify's real reason instead of always claiming "out of stock".
            var reason = (res.body && (res.body.description || res.body.message)) || 'Δεν προστέθηκε';
            console.error('[AUREA cart/add] ' + res.status, res.body);
            btn.textContent = reason.length > 34 ? reason.slice(0, 34) + '…' : reason;
            setTimeout(function () { btn.textContent = orig; }, 3000);
            return;
          }
          btn.textContent = 'Προστέθηκε ✓';
          document.dispatchEvent(new CustomEvent('aurea:cart-updated'));
          setTimeout(function () { btn.textContent = orig; }, 1600);
        })
        .catch(function () { btn.textContent = 'Δοκιμάστε ξανά'; setTimeout(function () { btn.textContent = orig; }, 1800); });
    });
  }

  /* ---------- 6. Product page: variant selection + Add to Cart ----------
   * Scope-based: the page renders both the desktop and mobile product blocks,
   * so we wire each wrapper independently (class hooks, not shared ids). Both
   * the main and sticky-bar Add-to-Cart feed the same side cart. */
  function productPage() {
    var dataEls = document.querySelectorAll('.pdp-data');
    if (!dataEls.length) return;
    Array.prototype.forEach.call(dataEls, function (dataEl) {
      var scope = (dataEl.closest && dataEl.closest('.aurea-desktop, .aurea-mobile')) || document;
      var data; try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
      wireScope(scope, data);
    });
  }
  function wireScope(scope, data) {
    var opts = data.options || [];
    var variants = data.variants || [];
    var selected = {};
    var buttons = Array.prototype.slice.call(scope.querySelectorAll('.pdp-opt'));
    var atcs = Array.prototype.slice.call(scope.querySelectorAll('.pdp-atc, .pdp-sticky'));
    var mainImg = scope.querySelector('.pdp-main-img');
    var imgByColor = {};
    buttons.forEach(function (b) {
      // any option button carrying a data-img is a colour swatch (language-agnostic);
      // clicking it swaps the big product image so the choice is shown immediately.
      var src = b.getAttribute('data-img');
      if (src) imgByColor[b.getAttribute('data-val')] = src;
    });

    function matchVariant() {
      var complete = opts.every(function (n) { return selected[n] !== undefined; });
      var v = variants.find(function (v) { return opts.every(function (n, i) { return v.options[i] === selected[n]; }); });
      return { variant: v, complete: complete };
    }
    function paint() {
      buttons.forEach(function (b) {
        var isSel = selected[b.getAttribute('data-opt')] === b.getAttribute('data-val');
        var sw = b.querySelector('.pdp-sw');
        if (sw) { sw.style.borderColor = isSel ? '#111' : 'transparent'; }
        else {
          b.style.background = isSel ? 'rgb(110,103,94)' : 'rgb(255,255,255)';
          b.style.color = isSel ? '#fff' : 'rgb(74,74,74)';
          b.style.borderColor = isSel ? 'rgb(110,103,94)' : 'rgb(220,211,198)';
        }
      });
      var m = matchVariant();
      if (m.variant) {
        atcs.forEach(function (atc) {
          atc.setAttribute('data-variant', m.variant.id);
          // Do NOT gate the button on the availability flag — on this store Shopify
          // reports untracked (dropship) variants as available:false, which is wrong.
          // Keep the button active; the actual /cart/add call is the source of truth
          // (untracked variants add fine; a genuine rejection surfaces inline below).
          atc.disabled = false; atc.textContent = 'Προσθήκη στο Καλάθι'; atc.style.opacity = '1'; atc.style.cursor = 'pointer';
        });
      }
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        selected[b.getAttribute('data-opt')] = b.getAttribute('data-val');
        var img = imgByColor[b.getAttribute('data-val')];
        if (img && mainImg) mainImg.src = img;
        paint();
      });
    });
    // preselect the first available variant
    var first = variants.find(function (v) { return v.available; }) || variants[0];
    if (first) opts.forEach(function (n, i) { selected[n] = first.options[i]; });
    paint();

    atcs.forEach(function (atc) {
      atc.addEventListener('click', function (e) {
        e.preventDefault();
        var m = matchVariant();
        if (!m.complete) { atc.textContent = 'Επιλέξτε τις επιλογές σας'; setTimeout(paint, 1400); return; }
        if (!m.variant) return;
        atc.textContent = 'Προσθήκη…';
        fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ id: m.variant.id, quantity: 1 }) })
          .then(function (r) { return r.json().then(function (j) { return { ok: r.ok, body: j }; }); })
          .then(function (res) {
            if (!res.ok) {
              // Surface Shopify's real reason (full text) below the button instead of
              // truncating it onto the button or claiming a blanket "out of stock".
              var reason = (res.body && (res.body.description || res.body.message)) || 'Δεν προστέθηκε';
              console.error('[AUREA cart/add] ' + res.status, res.body);
              var note = atc.parentNode && atc.parentNode.querySelector('.pdp-atc-err');
              if (!note && atc.parentNode) {
                note = document.createElement('div');
                note.className = 'pdp-atc-err';
                note.style.cssText = 'margin-top:10px;font-family:Manrope,sans-serif;font-size:12.5px;line-height:1.45;color:#B23A2E;';
                atc.parentNode.insertBefore(note, atc.nextSibling);
              }
              if (note) note.textContent = reason;
              atc.textContent = 'Δεν προστέθηκε';
              setTimeout(function () { paint(); if (note) note.textContent = ''; }, 8000);
              return;
            }
            atc.textContent = 'Προστέθηκε ✓'; document.dispatchEvent(new CustomEvent('aurea:cart-updated')); setTimeout(paint, 1700);
          })
          .catch(function () { atc.textContent = 'Δοκιμάστε ξανά'; setTimeout(paint, 1800); });
      });
    });

    // Reveal the sticky add-to-cart bar only once the shopper scrolls down to the
    // reviews section — keep it hidden through the whole product / buy-box / accordion area.
    var stickyBar = scope.querySelector('.pdp-sticky-bar');
    var reviews = scope.querySelector('#reviews');
    if (stickyBar && reviews) {
      var ticking = false;
      var syncSticky = function () {
        ticking = false;
        var show = reviews.getBoundingClientRect().top <= 0;
        stickyBar.style.transform = show ? 'translateY(0)' : 'translateY(120%)';
      };
      window.addEventListener('scroll', function () {
        if (!ticking) { ticking = true; window.requestAnimationFrame(syncSticky); }
      }, { passive: true });
      window.addEventListener('resize', syncSticky, { passive: true });
      syncSticky();
    } else if (stickyBar && 'IntersectionObserver' in window) {
      // fallback (no reviews section): reveal once the main button leaves view
      var mainAtc = scope.querySelector('.pdp-atc');
      if (mainAtc) {
        new IntersectionObserver(function (entries) {
          stickyBar.style.transform = entries[0].isIntersecting ? 'translateY(120%)' : 'translateY(0)';
        }, { threshold: 0 }).observe(mainAtc);
      }
    }
  }

  /* ---------- 7. Cart drawer (functional, desktop + mobile) ---------- */
  function cartDrawer() {
    var MF = (window.AUREA && window.AUREA.moneyFormat) || '€{{amount_with_comma_separator}}';

    // Shopify's canonical money formatter, so prices match the storefront exactly.
    function money(cents) {
      if (typeof cents === 'string') cents = cents.replace('.', '');
      var re = /\{\{\s*(\w+)\s*\}\}/;
      function fmt(number, precision, thousands, decimal) {
        precision = precision == null ? 2 : precision;
        thousands = thousands || ','; decimal = decimal || '.';
        if (isNaN(number) || number == null) return '0';
        number = (number / 100).toFixed(precision);
        var parts = number.split('.');
        var whole = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1' + thousands);
        return whole + (parts[1] ? decimal + parts[1] : '');
      }
      var val = '', m = MF.match(re);
      switch (m ? m[1] : 'amount') {
        case 'amount': val = fmt(cents, 2); break;
        case 'amount_no_decimals': val = fmt(cents, 0); break;
        case 'amount_with_comma_separator': val = fmt(cents, 2, '.', ','); break;
        case 'amount_no_decimals_with_comma_separator': val = fmt(cents, 0, '.', ','); break;
        case 'amount_with_space_separator': val = fmt(cents, 2, ' ', ','); break;
        case 'amount_with_apostrophe_separator': val = fmt(cents, 2, "'", '.'); break;
        default: val = fmt(cents, 2);
      }
      return MF.replace(re, val);
    }
    function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
    function img(url, w) { if (!url) return ''; return url.replace(/(\.(?:jpg|jpeg|png|webp|gif))(\?|$)/i, '_' + w + 'x$1$2'); }

    // Locate every baked "Your Bag" drawer (one per visible wrapper).
    var drawers = Array.prototype.filter.call(
      document.querySelectorAll('div[style*="translateX(100%)"]'),
      function (d) { return /Το Καλάθι/.test(d.textContent); }
    );
    if (!drawers.length) return;

    var CLOSE_SVG = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"><line x1="5" y1="5" x2="19" y2="19"></line><line x1="19" y1="5" x2="5" y2="19"></line></svg>';

    function headerHtml(count) {
      return '<div style="display:flex;align-items:center;justify-content:space-between;padding:26px 30px;border-bottom:1px solid #EFEAE2;flex:0 0 auto;">' +
        '<div style="font-family:\'Milanesa Serif\',Georgia,serif;font-weight:500;font-size:22px;color:#111;">Το Καλάθι σας <span style="font-family:Manrope;font-weight:500;font-size:14px;color:#9A948C;">(' + count + ')</span></div>' +
        '<button class="aurea-cart-close" aria-label="Close" style="width:36px;height:36px;border:none;background:transparent;color:#4A4A4A;cursor:pointer;display:flex;align-items:center;justify-content:center;">' + CLOSE_SVG + '</button>' +
      '</div>';
    }
    function emptyHtml() {
      return '<div style="flex:1 1 0%;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;text-align:center;">' +
        '<svg width="46" height="46" viewBox="0 0 24 24" fill="none" stroke="#C9BFB1" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" style="margin-bottom:22px;"><path d="M2 3h2.3l1.4 12.1a1 1 0 0 0 1 .9h9.1a1 1 0 0 0 1-.8l1.5-7.4H5.2"></path><circle cx="9" cy="20.2" r="1.35"></circle><circle cx="16.6" cy="20.2" r="1.35"></circle></svg>' +
        '<div style="font-family:\'Milanesa Serif\',Georgia,serif;font-weight:500;font-size:20px;color:#111;margin-bottom:10px;">Το καλάθι σας είναι άδειο</div>' +
        '<div style="font-family:Manrope;font-weight:500;font-size:13.5px;color:#9A948C;margin-bottom:28px;">Φαίνεται πως δεν έχετε προσθέσει κάτι ακόμη.</div>' +
        '<button class="aurea-cart-continue" style="background:#111;color:#fff;border:1px solid #111;padding:14px 34px;font-family:Manrope;font-weight:600;font-size:11.5px;letter-spacing:.13em;text-transform:uppercase;cursor:pointer;">Συνέχεια Αγορών</button>' +
      '</div>';
    }
    // Reservation urgency bar: one-time 15-min countdown that starts on the first add
    // (persisted). It does NOT loop — once it hits zero the bar switches to a
    // "no longer reserved" message. It only restarts if the cart is emptied.
    var RWIN = 15 * 60 * 1000;
    function reserveEnd() {
      var e = 0; try { e = parseInt(localStorage.getItem('aurea-reserve-end-15') || '0', 10); } catch (x) {}
      if (!e) { e = Date.now() + RWIN; try { localStorage.setItem('aurea-reserve-end-15', String(e)); } catch (x) {} }
      return e;
    }
    var CLOCK_SVG = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#B23A2E" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 8v4l2.5 2"></path></svg>';
    function reserveBarInner() {
      var left = Math.round((reserveEnd() - Date.now()) / 1000);
      if (left > 0) {
        var m = Math.floor(left / 60), s = left % 60;
        var disp = (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
        return CLOCK_SVG + '<span style="font-family:Manrope;font-weight:500;font-size:12.5px;letter-spacing:.01em;color:#B23A2E;white-space:nowrap;">Τα προϊόντα σας κρατούνται για <strong style="font-weight:700;font-variant-numeric:tabular-nums;">' + disp + '</strong></span>';
      }
      return CLOCK_SVG + '<span style="font-family:Manrope;font-weight:500;font-size:12.5px;letter-spacing:.01em;color:#B23A2E;">Τα προϊόντα δεν κρατούνται πλέον — αγοράστε γρήγορα πριν εξαντληθούν</span>';
    }
    function reserveHtml() {
      return '<div class="aurea-reserve-bar" style="display:flex;align-items:center;justify-content:center;gap:9px;padding:11px 30px;background:rgba(178,58,46,.08);border-bottom:1px solid rgba(178,58,46,.16);flex:0 0 auto;">' + reserveBarInner() + '</div>';
    }

    // Bundle-progress roadmap (2 / 3 / 4 items -> 15 / 20 / 25% off).
    function roadmapHtml(count, msg) {
      var gold = '#C7A867', dark = '#111', line = '#EAE2D6', nBg = '#F5F0EB', nFg = '#9A948C';
      var r1 = count >= 2, r2 = count >= 3, r3 = count >= 4;
      function dot(num, bg, fg) { return '<div style="width:30px;height:30px;border-radius:50%;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-family:Manrope;font-weight:700;font-size:11px;background:' + bg + ';color:' + fg + ';">' + num + '</div>'; }
      return '<div style="margin-bottom:16px;">' +
        '<div style="font-family:Manrope;font-weight:700;font-size:13px;color:#111;text-align:center;margin-bottom:16px;">' + msg + '</div>' +
        '<div style="display:flex;align-items:center;">' +
          dot(2, r1 ? dark : nBg, r1 ? '#fff' : nFg) +
          '<div style="flex:1;height:2px;background:' + (r1 ? dark : line) + ';"></div>' +
          dot(3, r2 ? dark : nBg, r2 ? '#fff' : nFg) +
          '<div style="flex:1;height:2px;background:' + (r2 ? dark : line) + ';"></div>' +
          dot(4, r3 ? gold : nBg, r3 ? '#1A160F' : nFg) +
        '</div>' +
        '<div style="display:flex;justify-content:space-between;margin-top:8px;font-family:Manrope;font-weight:600;font-size:10.5px;letter-spacing:.04em;color:#9A948C;">' +
          '<span style="width:30px;text-align:center;">15%</span>' +
          '<span style="width:30px;text-align:center;margin-left:auto;margin-right:auto;">20%</span>' +
          '<span style="width:30px;text-align:center;">25%</span>' +
        '</div>' +
      '</div>';
    }
    function bannerHtml(pct) {
      return '<div style="margin-bottom:20px;background:#F5F0EB;padding:16px 18px;display:flex;align-items:center;gap:12px;">' +
        '<span style="font-family:\'Milanesa Solid\',\'Milanesa Serif\',Georgia,serif;font-weight:600;font-size:18px;color:#111;">' + pct + '%</span>' +
        '<span style="font-family:Manrope;font-weight:500;font-size:12.5px;color:#4A4A4A;line-height:1.4;">Η έκπτωση πακέτου εφαρμόζεται αυτόματα</span>' +
      '</div>';
    }
    function lineHtml(it, line) {
      var variant = (it.variant_title && it.variant_title !== 'Default Title') ? it.variant_title : '';
      var priceCol = '<span style="color:#111;font-weight:600;">' + money(it.final_price) + '</span>';
      if (it._cmp && it._cmp > it.final_price) {
        priceCol = '<span style="color:#B0A99E;text-decoration:line-through;">' + money(it._cmp) + '</span> <span style="color:#B23A2E;font-weight:600;">' + money(it.final_price) + '</span>';
      }
      return '<div style="display:flex;gap:16px;padding:18px 0;border-bottom:1px solid #F2EDE5;">' +
        '<a href="' + esc(it.url) + '" style="width:78px;height:96px;flex:0 0 auto;background:#F5F0EB;overflow:hidden;display:block;">' +
          (it.image ? '<img src="' + esc(img(it.image, 200)) + '" alt="' + esc(it.product_title) + '" style="width:100%;height:100%;object-fit:cover;">' : '') +
        '</a>' +
        '<div style="flex:1 1 auto;min-width:0;display:flex;flex-direction:column;justify-content:space-between;">' +
          '<div>' +
            '<a href="' + esc(it.url) + '" style="font-family:Manrope;font-weight:600;font-size:14.5px;color:#111;text-decoration:none;line-height:1.3;">' + esc(it.product_title) + '</a>' +
            (variant ? '<div style="font-family:Manrope;font-size:12px;letter-spacing:.02em;color:#9A948C;margin-top:4px;">' + esc(variant) + '</div>' : '') +
            '<div style="display:flex;align-items:center;gap:8px;margin-top:4px;font-family:Manrope;font-size:13px;">' + priceCol + '</div>' +
          '</div>' +
          '<div style="display:flex;align-items:center;justify-content:space-between;margin-top:10px;gap:12px;">' +
            '<div style="display:inline-flex;align-items:center;border:1px solid #EAE2D6;">' +
              '<button class="aurea-qty" data-line="' + line + '" data-qty="' + (it.quantity - 1) + '" aria-label="Decrease" style="width:30px;height:30px;border:none;background:none;cursor:pointer;font-family:Manrope;font-size:15px;color:#4A4A4A;line-height:1;">–</button>' +
              '<span style="min-width:26px;text-align:center;font-family:Manrope;font-weight:600;font-size:12.5px;color:#111;">' + it.quantity + '</span>' +
              '<button class="aurea-qty" data-line="' + line + '" data-qty="' + (it.quantity + 1) + '" aria-label="Increase" style="width:30px;height:30px;border:none;background:none;cursor:pointer;font-family:Manrope;font-size:15px;color:#4A4A4A;line-height:1;">+</button>' +
            '</div>' +
            '<button class="aurea-qty" data-line="' + line + '" data-qty="0" style="background:none;border:none;cursor:pointer;font-family:Manrope;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A948C;padding:0;">Αφαίρεση</button>' +
          '</div>' +
        '</div>' +
      '</div>';
    }
    function bundlePctFor(count) { return count >= 4 ? 25 : (count === 3 ? 20 : (count === 2 ? 15 : 0)); }
    function totalsHtml(cart, saleSavings) {
      var subtotal = cart.items_subtotal_price;
      var realDisc = cart.total_discount || 0;
      var pct, bundle, total;
      if (realDisc > 0) { bundle = realDisc; pct = subtotal > 0 ? Math.round(realDisc / subtotal * 100) : 0; total = cart.total_price; }
      else { pct = bundlePctFor(cart.item_count); bundle = Math.round(subtotal * pct / 100); total = subtotal - bundle; }
      var bcode = (realDisc <= 0 && pct > 0) ? ('BUNDLE' + pct) : '';
      var rows = '<div style="display:flex;justify-content:space-between;font-family:Manrope;font-weight:500;font-size:14px;color:#4A4A4A;margin-bottom:10px;"><span>Υποσύνολο</span><span>' + money(subtotal + saleSavings) + '</span></div>';
      if (saleSavings > 0) rows += '<div style="display:flex;justify-content:space-between;font-family:Manrope;font-weight:500;font-size:14px;color:#B23A2E;margin-bottom:10px;"><span>Έκπτωση προσφοράς</span><span>&minus;' + money(saleSavings) + '</span></div>';
      if (bundle > 0) rows += '<div style="display:flex;justify-content:space-between;font-family:Manrope;font-weight:500;font-size:14px;color:#B23A2E;margin-bottom:10px;"><span>Έκπτωση πακέτου (' + pct + '%)</span><span>&minus;' + money(bundle) + '</span></div>';
      rows += '<div style="display:flex;justify-content:space-between;font-family:Manrope;font-weight:700;font-size:17px;color:#111;padding-top:14px;border-top:1px solid #EFEAE2;margin-bottom:22px;"><span>Σύνολο</span><span>' + money(total) + '</span></div>';
      return '<div style="flex:0 0 auto;padding:20px 30px 24px;border-top:1px solid #EFEAE2;">' + rows +
        '<button class="aurea-cart-checkout" data-bundle="' + bcode + '" style="width:100%;background:#111;color:#fff;border:1px solid #111;padding:17px;font-family:Manrope;font-weight:600;font-size:12px;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:transform .2s ease,box-shadow .2s ease;">Ολοκλήρωση Αγοράς &rarr;</button>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:16px;font-family:Manrope;font-weight:500;font-size:11.5px;color:#9A948C;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="10" width="14" height="10" rx="1.2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>' +
          'Secure payment &middot; Free shipping' +
        '</div>' +
      '</div>';
    }

    var instances = drawers.map(function (drawer) {
      var wrapper = (drawer.closest && drawer.closest('.aurea-desktop, .aurea-mobile')) || document.body;
      var dimAlpha = (wrapper.classList && wrapper.classList.contains('aurea-mobile')) ? '0' : '.4';
      var overlay = el('div', 'position:fixed;inset:0;background:rgba(20,18,16,' + dimAlpha + ');z-index:999;opacity:0;visibility:hidden;transition:opacity .3s ease;');
      document.body.appendChild(overlay);
      var inst = { drawer: drawer, overlay: overlay, wrapper: wrapper };
      overlay.addEventListener('click', function () { close(inst); });
      return inst;
    });

    function open(inst) {
      inst.overlay.style.visibility = 'visible'; inst.overlay.style.opacity = '1';
      inst.drawer.style.transform = 'translateX(0)';
      document.body.style.overflow = 'hidden';
    }
    function close(inst) {
      inst.drawer.style.transform = 'translateX(100%)';
      inst.overlay.style.opacity = '0';
      document.body.style.overflow = '';
      setTimeout(function () { inst.overlay.style.visibility = 'hidden'; }, 300);
    }

    function nextTierMsg(count, pct) {
      if (count === 1) return 'Προσθέστε 1 ακόμη προϊόν για 15% έκπτωση';
      if (count === 2) return 'Προσθέστε 1 ακόμη προϊόν για 20% έκπτωση';
      if (count === 3) return 'Προσθέστε 1 ακόμη προϊόν για 25% έκπτωση';
      if (count >= 4) return "Εξοικονομείτε " + (pct || 25) + '% σε αυτή την παραγγελία!';
      return '';
    }
    function render(inst, cart) {
      var d = inst.drawer;
      var body;
      if (!cart.item_count) {
        try { localStorage.removeItem('aurea-reserve-end-15'); } catch (x) {}
        body = emptyHtml();
      } else {
        var saleSavings = cart.items.reduce(function (a, it) {
          return a + ((it._cmp && it._cmp > it.final_price) ? (it._cmp - it.final_price) * it.quantity : 0);
        }, 0);
        var bundlePct = cart.total_discount > 0
          ? (cart.items_subtotal_price > 0 ? Math.round(cart.total_discount / cart.items_subtotal_price * 100) : 0)
          : bundlePctFor(cart.item_count);
        var items = cart.items.map(function (it, i) { return lineHtml(it, i + 1); }).join('');
        var scroll = '<div style="flex:1 1 0%;overflow-y:auto;padding:16px 30px;">' +
          roadmapHtml(cart.item_count, nextTierMsg(cart.item_count, bundlePct)) +
          (bundlePct > 0 ? bannerHtml(bundlePct) : '') +
          items + '</div>';
        body = reserveHtml() + scroll + totalsHtml(cart, saleSavings);
      }
      d.innerHTML = headerHtml(cart.item_count) + body;

      var closeBtn = d.querySelector('.aurea-cart-close');
      if (closeBtn) closeBtn.addEventListener('click', function () { close(inst); });
      var cont = d.querySelector('.aurea-cart-continue');
      if (cont) cont.addEventListener('click', function () { close(inst); });
      var co = d.querySelector('.aurea-cart-checkout');
      if (co) co.addEventListener('click', function () { var bc = co.getAttribute('data-bundle'); window.location.href = bc ? ('/discount/' + bc + '?redirect=/checkout') : '/checkout'; });
      d.querySelectorAll('.aurea-qty').forEach(function (b) {
        b.addEventListener('click', function () {
          changeLine(parseInt(b.getAttribute('data-line'), 10), parseInt(b.getAttribute('data-qty'), 10), b);
        });
      });
    }

    var lastCart = null;
    function renderAll(cart) { lastCart = cart; instances.forEach(function (inst) { render(inst, cart); }); updateBadges(cart.item_count); }

    function changeLine(line, qty, btn) {
      // Optimistic: reflect the new quantity + totals instantly, then reconcile with the server.
      if (lastCart && lastCart.items && lastCart.items[line - 1]) {
        var oc = JSON.parse(JSON.stringify(lastCart));
        if (qty <= 0) { oc.items.splice(line - 1, 1); }
        else { oc.items[line - 1].quantity = qty; }
        var sub = 0, cnt = 0;
        oc.items.forEach(function (x) { sub += (x.final_price || 0) * x.quantity; cnt += x.quantity; });
        oc.items_subtotal_price = sub; oc.total_price = sub; oc.total_discount = 0; oc.item_count = cnt;
        renderAll(oc);
      }
      fetch('/cart/change.js', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify({ line: line, quantity: qty }) })
        .then(function (r) { return r.json(); })
        .then(function (cart) { return enrich(cart); })
        .then(function (cart) { renderAll(cart); })
        .catch(function () { getCart().then(renderAll).catch(function () {}); });
    }

    // compare_at prices aren't in cart.js — fetch each product once and cache the map.
    var CMP = {};
    function enrich(cart) {
      if (!cart.items || !cart.items.length) return Promise.resolve(cart);
      var handles = {};
      cart.items.forEach(function (it) { if (it.handle && !(it.handle in CMP)) handles[it.handle] = 1; });
      var hs = Object.keys(handles);
      return Promise.all(hs.map(function (h) {
        return fetch('/products/' + h + '.js', { headers: { 'Accept': 'application/json' } })
          .then(function (r) { return r.json(); })
          .then(function (p) { CMP[h] = {}; (p.variants || []).forEach(function (v) { CMP[h][v.id] = v.compare_at_price; }); })
          .catch(function () { CMP[h] = {}; });
      })).then(function () {
        cart.items.forEach(function (it) { it._cmp = (CMP[it.handle] || {})[it.id] || (CMP[it.handle] || {})[it.variant_id] || 0; });
        return cart;
      });
    }
    function getCart() {
      return fetch('/cart.js', { headers: { 'Accept': 'application/json' } })
        .then(function (r) { return r.json(); })
        .then(function (cart) { return enrich(cart); });
    }

    // Count badges on the header cart triggers.
    var badges = [];
    function findTrigger(inst) {
      var w = inst.wrapper;
      var t = w.querySelector('[aria-label="Cart"]');
      if (t) return t;
      var svgs = w.querySelectorAll('svg');
      for (var i = 0; i < svgs.length; i++) {
        var p = svgs[i].querySelector('path');
        if (p && /^M2 3h2\.3/.test(p.getAttribute('d') || '') && !inst.drawer.contains(svgs[i])) {
          var c = svgs[i].closest('span,button,a');
          if (c && !inst.drawer.contains(c)) return c;
        }
      }
      return null;
    }
    instances.forEach(function (inst) {
      var trig = findTrigger(inst);
      if (!trig) return;
      trig.style.cursor = 'pointer';
      if (getComputedStyle(trig).position === 'static') trig.style.position = 'relative';
      trig.addEventListener('click', function (e) { e.preventDefault(); getCart().then(function (c) { render(inst, c); updateBadges(c.item_count); open(inst); }); });
      var isMob = inst.wrapper && inst.wrapper.classList && inst.wrapper.classList.contains('aurea-mobile');
      var badge = el('span', isMob
        ? 'margin-left:7px;flex:0 0 auto;min-width:19px;height:19px;padding:0 5px;box-sizing:border-box;background:#B23A2E;color:#fff;border-radius:10px;font-family:Manrope;font-weight:700;font-size:10.5px;line-height:19px;text-align:center;display:none;'
        : 'position:absolute;top:-6px;right:-6px;min-width:17px;height:17px;padding:0 4px;box-sizing:border-box;background:#B23A2E;color:#fff;border-radius:9px;font-family:Manrope;font-weight:700;font-size:10px;line-height:17px;text-align:center;display:none;');
      trig.appendChild(badge);
      badges.push(badge);
    });
    function updateBadges(count) {
      badges.forEach(function (b) { b.textContent = count; b.style.display = count > 0 ? 'block' : 'none'; });
    }

    // When something is added, refresh, update counts, and reveal the visible drawer.
    document.addEventListener('aurea:cart-updated', function () {
      getCart().then(function (cart) {
        renderAll(cart);
        var vis = instances.filter(function (inst) { return inst.wrapper === document.body || inst.wrapper.offsetParent !== null; })[0] || instances[0];
        if (vis) open(vis);
      });
    });

    // Live reservation countdown — updates every open drawer's timer once a second.
    setInterval(function () {
      var bars = document.querySelectorAll('.aurea-reserve-bar');
      if (!bars.length) return;
      var inner = reserveBarInner();
      bars.forEach(function (bar) { bar.innerHTML = inner; });
    }, 1000);

    // Seed badge counts on load without opening anything.
    getCart().then(function (cart) { updateBadges(cart.item_count); }).catch(function () {});
  }

  /* ---------- 8. Product page accordions (Description etc.) — closed by default ---------- */
  function productAccordion() {
    document.querySelectorAll('.pdp-acc-body').forEach(function (body) {
      if (body.getAttribute('data-aurea-pacc')) return;
      body.setAttribute('data-aurea-pacc', '1');
      var btn = body.previousElementSibling;
      if (!btn || btn.tagName !== 'BUTTON') return;
      var sign = null, spans = btn.querySelectorAll('span');
      for (var i = 0; i < spans.length; i++) { if (/^[+−-]$/.test(spans[i].textContent.trim())) { sign = spans[i]; break; } }
      var inner = body.firstElementChild || body;
      btn.style.cursor = 'pointer';
      btn.addEventListener('click', function () {
        var open = body.style.maxHeight && body.style.maxHeight !== '0px';
        if (!open) {
          /* accordion behaviour: only one open at a time within this scope */
          var scope = (body.closest && body.closest('.aurea-desktop, .aurea-mobile')) || document;
          scope.querySelectorAll('.pdp-acc-body').forEach(function (other) {
            if (other === body) return;
            other.style.maxHeight = '0px';
            var obtn = other.previousElementSibling, ospans = obtn ? obtn.querySelectorAll('span') : [];
            for (var j = 0; j < ospans.length; j++) { if (/^[+−-]$/.test(ospans[j].textContent.trim())) { ospans[j].textContent = '+'; break; } }
          });
        }
        body.style.maxHeight = open ? '0px' : (inner.scrollHeight + 24) + 'px';
        if (sign) sign.textContent = open ? '+' : '−';
      });
    });
  }

  /* ---------- 9. Product gallery: thumbnail click swaps the main image ---------- */
  function productGallery() {
    document.querySelectorAll('.pdp-thumb').forEach(function (thumb) {
      if (thumb.getAttribute('data-aurea-gal')) return;
      thumb.setAttribute('data-aurea-gal', '1');
      thumb.addEventListener('click', function () {
        var scope = (thumb.closest && thumb.closest('.aurea-desktop, .aurea-mobile')) || document;
        var main = scope.querySelector('.pdp-main-img');
        var src = thumb.getAttribute('data-img');
        if (main && src) { main.src = src; if (main.parentElement) main.parentElement.scrollTop = 0; }
        scope.querySelectorAll('.pdp-thumb').forEach(function (t) { t.style.borderColor = 'rgb(234, 226, 214)'; });
        thumb.style.borderColor = 'rgb(17, 17, 17)';
      });
    });
  }

  /* ---------- 9b. Product gallery bottom-pin (desktop) ----------
     The left image is intentionally taller than the viewport. CSS sticky
     with a `bottom` inset never pins a taller-than-viewport element, so we
     use sticky-top with a negative offset: top = viewportHeight - galleryHeight.
     That makes the image scroll normally until its bottom reaches the viewport
     bottom, pin there while the description scrolls past, then release when the
     column (track) bottom is reached — no white space beneath the image. */
  function pdpStickyPin() {
    var el = document.querySelector('.pdp-gallery-sticky');
    if (!el) return;
    function update() {
      /* use fractional height and bias 1px so the image bottom lands flush or a
         hair below the viewport bottom — never above it (which would show a
         white sliver from sub-pixel rounding). */
      var h = el.getBoundingClientRect().height;
      var top = Math.ceil(window.innerHeight - h) + 1;
      if (top > 24) top = 24; /* short gallery: pin near top instead */
      el.style.top = top + 'px';
      /* cap the thumbnail rail to the main image height: thumbnails keep a fixed
         portrait size, the rail grows with them but never past the image bottom
         (it scrolls instead) — so products with few/many images look consistent. */
      var rail = el.querySelector('.pdp-thumbrail');
      var mainImg = el.querySelector('.pdp-main-img');
      if (rail && mainImg && mainImg.parentElement) {
        rail.style.maxHeight = Math.round(mainImg.parentElement.getBoundingClientRect().height) + 'px';
      }
    }
    update();
    window.addEventListener('resize', update, { passive: true });
    var img = el.querySelector('.pdp-main-img');
    if (img) {
      if (img.complete) update();
      img.addEventListener('load', update);
    }
    if (window.ResizeObserver) {
      try { new ResizeObserver(update).observe(el); } catch (e) {}
    }
  }

  /* ---------- 9c. Reviews carousel: infinite loop, finger + mouse drag + arrows ----------
     The track scrolls natively (so touch/finger works). To make it a full circle with
     no start/end, we clone a viewport-worth of cards onto each side and silently wrap the
     scroll position back into the middle band whenever it drifts into a clone — because the
     clones are pixel-identical, the wrap is invisible. Works the same for finger, mouse
     drag, and the Previous/Next arrows. */
  function reviewsCarousel() {
    document.querySelectorAll('[aria-label="Previous"]').forEach(function (prev) {
      var wrap = prev.parentElement;
      if (!wrap || wrap.getAttribute('data-rev-init')) return;
      var next = wrap.querySelector('[aria-label="Next"]');
      var container = wrap.previousElementSibling;
      if (!container) return;
      var track = (container.matches && container.matches('[style*="overflow-x"]'))
        ? container : container.querySelector('[style*="overflow-x"]');
      if (!track) return;
      var originals = Array.prototype.slice.call(track.children);
      if (originals.length < 3) return;
      wrap.setAttribute('data-rev-init', '1');

      var gapCss = getComputedStyle(track);
      var gap = parseFloat(gapCss.columnGap || gapCss.gap) || 0;
      var step = originals[0].getBoundingClientRect().width + gap;   // one-card advance
      // clone enough on each side to cover ~2 viewports of overshoot
      var K = Math.min(originals.length, Math.ceil((track.clientWidth * 2) / step) + 1);
      var i, cl;
      for (i = 0; i < K; i++) {                                       // append copies of the first K
        cl = originals[i].cloneNode(true); cl.setAttribute('data-rev-clone', '1'); cl.setAttribute('aria-hidden', 'true');
        track.appendChild(cl);
      }
      for (i = 0; i < K; i++) {                                       // prepend copies of the last K (in order)
        cl = originals[originals.length - K + i].cloneNode(true); cl.setAttribute('data-rev-clone', '1'); cl.setAttribute('aria-hidden', 'true');
        track.insertBefore(cl, track.children[i]);
      }

      var firstReal = originals[0];
      var base = firstReal.offsetLeft;                                // scrollLeft that shows card #1 at the left
      var setW = track.children[K + originals.length].offsetLeft - base; // exact width of one full real set
      track.scrollLeft = base;

      var animating = false;
      function normalize() {
        if (animating) return;
        if (track.scrollLeft < base) track.scrollLeft += setW;
        else if (track.scrollLeft >= base + setW) track.scrollLeft -= setW;
      }
      var ticking = false;
      track.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        window.requestAnimationFrame(function () { ticking = false; normalize(); });
      }, { passive: true });

      function page(dir) {
        var amount = Math.max(step, Math.round((track.clientWidth * 0.8) / step) * step);
        // pre-wrap so the smooth animation stays inside the cloned buffer, then re-enable wrapping
        if (track.scrollLeft < base + step) track.scrollLeft += setW;
        else if (track.scrollLeft > base + setW - step) track.scrollLeft -= setW;
        animating = true;
        track.scrollBy({ left: dir * amount, behavior: 'smooth' });
        setTimeout(function () { animating = false; normalize(); }, 550);
      }
      if (next) next.addEventListener('click', function () { page(1); });
      prev.addEventListener('click', function () { page(-1); });

      /* unified drag-to-scroll: works for both finger and mouse */
      var down = false, startX = 0, startLeft = 0, moved = false;
      track.style.cursor = 'grab';
      track.addEventListener('pointerdown', function (e) {
        down = true; moved = false; startX = e.clientX; startLeft = track.scrollLeft;
        track.style.cursor = 'grabbing';
        if (e.pointerType === 'mouse') { try { track.setPointerCapture(e.pointerId); } catch (_) {} }
      });
      track.addEventListener('pointermove', function (e) {
        if (!down) return;
        var dx = e.clientX - startX;
        if (Math.abs(dx) > 4) moved = true;
        if (e.pointerType === 'mouse') track.scrollLeft = startLeft - dx; // touch pans natively
      });
      function end() { down = false; track.style.cursor = 'grab'; }
      track.addEventListener('pointerup', end);
      track.addEventListener('pointercancel', end);
      /* swallow the click that ends a drag so it doesn't trigger a card link */
      track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); e.stopPropagation(); } }, true);

      window.addEventListener('resize', function () {
        step = originals[0].getBoundingClientRect().width + gap;
        base = firstReal.offsetLeft;
        setW = track.children[K + originals.length].offsetLeft - base;
      });
    });
  }

  /* ---------- 9d. Collection filter dropdown (Color) ---------- */
  function collectionFilters() {
    document.querySelectorAll('.aurea-filter-btn').forEach(function (btn) {
      if (btn.getAttribute('data-af-init')) return;
      btn.setAttribute('data-af-init', '1');
      var wrap = btn.closest('.aurea-filter') || btn.parentElement;
      var menu = wrap ? wrap.querySelector('.aurea-filter-menu') : null;
      if (!menu) return;
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
      });
      document.addEventListener('click', function (e) {
        if (!wrap.contains(e.target)) menu.style.display = 'none';
      });
    });
  }

  /* ---------- 9e. Size chart modal (product page) ---------- */
  function sizeChart() {
    document.querySelectorAll('.pdp-sizechart').forEach(function (btn) {
      if (btn.getAttribute('data-sc-init')) return;
      btn.setAttribute('data-sc-init', '1');
      var scope = (btn.closest && btn.closest('.aurea-desktop, .aurea-mobile')) || document;
      var modal = scope.querySelector('.pdp-sizechart-modal');
      if (!modal) return;
      function open() { modal.style.display = 'flex'; document.body.style.overflow = 'hidden'; }
      function close() { modal.style.display = 'none'; document.body.style.overflow = ''; }
      btn.addEventListener('click', open);
      modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
      var x = modal.querySelector('.pdp-sizechart-close');
      if (x) x.addEventListener('click', close);
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && modal.style.display === 'flex') close(); });
      modal.querySelectorAll('.pdp-sc-unit').forEach(function (u) {
        u.addEventListener('click', function () {
          var unit = u.getAttribute('data-unit');
          modal.querySelectorAll('.pdp-sc-unit').forEach(function (o) { o.style.color = (o === u) ? '#111' : '#C9BFB0'; });
          modal.querySelectorAll('[data-cm]').forEach(function (cell) {
            cell.textContent = (unit === 'in') ? cell.getAttribute('data-in') : cell.getAttribute('data-cm');
          });
        });
      });
    });
  }

  /* ---------- 9f. Product recommendations: shuffle + limit (different each visit) ---------- */
  function productReco() {
    document.querySelectorAll('.pdp-reco').forEach(function (grid) {
      if (grid.getAttribute('data-reco-init')) return;
      grid.setAttribute('data-reco-init', '1');
      var cards = Array.prototype.slice.call(grid.querySelectorAll('.pdp-reco-card'));
      for (var i = cards.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var t = cards[i]; cards[i] = cards[j]; cards[j] = t;
      }
      var SHOW = 4;
      cards.forEach(function (c, idx) {
        if (idx < SHOW) { c.style.display = ''; grid.appendChild(c); }
        else { c.style.display = 'none'; }
      });
    });
  }

  /* ---------- 9g. Collection grid: full mix of EVERYTHING, STABLE across visits ----------
     The collection is paginated server-side (48/page) so the first paint stays light. To show a true
     mix of every category (dresses, sets, skirts, swimwear, …) rather than upload order, the visible
     grid then background-loads ALL remaining pages, appends them, and does a single global shuffle
     across the whole set. The shuffle is SEEDED from the collection (id + product count), so the order
     is identical on every refresh/return — it only re-mixes once when the product count changes (new
     products added). Load More shows 10 rows initially, then reveals 10 rows at a time from that stable mix.
     A hidden grid (the inactive desktop/mobile variant) falls back to on-demand per-click fetching. */
  function collectionGrid() {
    document.querySelectorAll('.aurea-shuffle').forEach(function (grid) {
      if (grid.getAttribute('data-lm')) return;
      grid.setAttribute('data-lm', '1');
      // the Load More button (.scp6) lives in a sibling wrapper after the grid
      var btn = null, sib = grid.nextElementSibling;
      while (sib && !btn) {
        btn = (sib.matches && sib.matches('.scp6')) ? sib : (sib.querySelector ? sib.querySelector('.scp6') : null);
        sib = sib.nextElementSibling;
      }
      if (!btn) return;
      var wrap = btn.parentElement;
      function cards() { return Array.prototype.slice.call(grid.children).filter(function (c) { return c.tagName === 'A'; }); }
      // rows -> products, based on this grid's column count (desktop 4, mobile 2)
      var cols = 4, st = grid.getAttribute('style') || '', m = st.match(/grid-template-columns:\s*([^;]+)/);
      if (m) { var rep = m[1].match(/repeat\(\s*(\d+)/); cols = rep ? parseInt(rep[1], 10) : m[1].trim().split(/\s+/).length; }
      if (!cols || cols < 1) cols = 4;
      var INITIAL = 10 * cols, STEP = 10 * cols, shown = 0, loading = false;
      var scope = grid.closest('.aurea-mobile') ? '.aurea-mobile' : '.aurea-desktop';
      var pages = parseInt(btn.getAttribute('data-pages') || '1', 10) || 1;
      var firstNext = (btn.getAttribute('data-next') || '').trim();

      // Seeded, STABLE shuffle: the mix is derived from the collection's seed
      // (its id + product count) so it stays identical on every refresh/return,
      // and only re-mixes when the product count changes (e.g. new products added).
      function hashSeed(str) {
        var h = 2166136261 >>> 0;
        for (var i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
        return h >>> 0;
      }
      function mulberry32(a) {
        return function () {
          a = a + 0x6D2B79F5 | 0;
          var t = Math.imul(a ^ a >>> 15, 1 | a);
          t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
          return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
      }
      var seedInt = hashSeed(grid.getAttribute('data-seed') || 'aurea');
      // The first PIN products (in the collection's own Shopify order) are PINNED to the
      // front so the shop owner can hand-curate the opening rows; everything after that is
      // seeded-shuffled. Set the collection to "Manually" sorted in Shopify and drag the
      // hero products into the first PIN slots.
      var PIN = 8;
      function shuffle(nodes) {
        var pinned = [], rest = [];
        nodes.forEach(function (c) {
          var o = parseInt(c.getAttribute('data-ord'), 10);
          if (!isNaN(o) && o < PIN) pinned.push(c); else rest.push(c);
        });
        // pinned keep the exact Shopify manual order
        pinned.sort(function (a, b) {
          return (parseInt(a.getAttribute('data-ord') || '0', 10)) - (parseInt(b.getAttribute('data-ord') || '0', 10));
        });
        // sort the rest by product id first so the seeded keys are deterministic regardless of
        // page-load timing -> same result every refresh
        rest.sort(function (a, b) {
          return (parseInt(a.getAttribute('data-pid') || '0', 10)) - (parseInt(b.getAttribute('data-pid') || '0', 10));
        });
        var rng = mulberry32(seedInt);
        // Weighted mix (Efraimidis–Spirakis): key = r^(1/weight). Higher-weight products
        // (dresses, esp. bestsellers) trend toward the top; lower-weight (swimwear) toward the
        // back — but it stays interleaved, so it's still a mix of dresses, sets, etc.
        rest.forEach(function (c) {
          var w = parseFloat(c.getAttribute('data-w')); if (!(w > 0)) w = 12;
          var r = rng(); if (r <= 0) r = 1e-9;
          c._k = Math.pow(r, 1 / w);
        });
        rest.sort(function (a, b) { return b._k - a._k; });
        return pinned.concat(rest);
      }
      function nextUrl() { return (btn.getAttribute('data-next') || '').trim(); }
      function apply() {
        var cs = cards();
        cs.forEach(function (c, i) { c.style.display = i < shown ? '' : 'none'; });
        wrap.style.display = (shown >= cs.length && !nextUrl()) ? 'none' : '';
      }
      function relayout(nodes) { nodes.forEach(function (c) { grid.appendChild(c); }); }

      // --- remember scroll position + how many rows were revealed, so the browser Back button
      //     from a product returns the shopper exactly where they were (not the top of the page) ---
      var cgVisible = grid.offsetParent !== null;
      var storeKey = 'aurea-cg:' + location.pathname + location.search;
      function saveState() {
        if (!cgVisible) return;
        try { sessionStorage.setItem(storeKey, JSON.stringify({ shown: shown, y: window.scrollY || window.pageYOffset || 0 })); } catch (e) {}
      }
      // Did we arrive on this collection by coming back from a product page (same store)?
      function cameFromProduct() {
        try {
          if (!document.referrer) return false;
          var u = new URL(document.referrer, location.href);
          return u.host === location.host && /\/products\//.test(u.pathname);
        } catch (e) { return false; }
      }
      // A return to this page = either the referrer is a product (breadcrumb/link back)
      // OR the browser reports a back/forward navigation (Back button, fresh reload).
      function isReturnNav() {
        if (cameFromProduct()) return true;
        try {
          var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
          if (nav && nav.type === 'back_forward') return true;
        } catch (e) {}
        return false;
      }
      function restoreState() {
        if (!cgVisible) return;
        var st = null;
        try { st = JSON.parse(sessionStorage.getItem(storeKey) || 'null'); } catch (e) {}
        // Only restore the previous position when returning from a product page.
        // Arriving fresh from the navigation (or anywhere else) starts at the top.
        if (!st || !isReturnNav()) { try { sessionStorage.removeItem(storeKey); } catch (e) {} return; }
        try { sessionStorage.removeItem(storeKey); } catch (e) {} // one-shot
        if (typeof st.shown === 'number' && st.shown > shown) { shown = Math.min(st.shown, cards().length); apply(); }
        if (typeof st.y === 'number' && st.y > 0) {
          var go = function () { window.scrollTo(0, st.y); };
          requestAnimationFrame(function () { go(); requestAnimationFrame(go); });
          setTimeout(go, 130); setTimeout(go, 360);
        }
      }
      if (cgVisible) {
        try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
        // Save the position only when opening a PRODUCT from this collection, so that
        // returning from that product restores it — while arriving from the nav does not.
        grid.addEventListener('click', function (e) {
          var a = e.target && e.target.closest && e.target.closest('a');
          if (a && /\/products\//.test(a.getAttribute('href') || '')) saveState();
        });
        // Back button often restores this page straight from the bfcache WITHOUT
        // re-running the script, so restoreState() never fires and (because scroll
        // restoration is manual) the shopper lands at the top. Put them back here.
        window.addEventListener('pageshow', function (e) {
          if (!e.persisted) return;
          var s = null;
          try { s = JSON.parse(sessionStorage.getItem(storeKey) || 'null'); } catch (e2) {}
          try { sessionStorage.removeItem(storeKey); } catch (e2) {}
          if (s && typeof s.y === 'number' && s.y > 0) {
            var go = function () { window.scrollTo(0, s.y); };
            go(); requestAnimationFrame(go); setTimeout(go, 120);
          }
        });
      }

      // instant: shuffle the first page so the initial screen is already mixed, then reveal
      relayout(shuffle(cards()));
      shown = Math.min(INITIAL, cards().length);
      apply();
      // single-page grids are complete now; multi-page grids restore after the global shuffle settles
      if (!(cgVisible && pages > 1 && firstNext)) restoreState();

      // build the URL for page N from the "next" URL, preserving any active filter params
      function pageUrl(n) {
        var u = firstNext;
        if (/[?&]page=\d+/.test(u)) return u.replace(/([?&])page=\d+/, '$1page=' + n);
        return u + (u.indexOf('?') > -1 ? '&' : '?') + 'page=' + n;
      }
      function extractCards(html) {
        var doc = new DOMParser().parseFromString(html, 'text/html');
        var g = doc.querySelector(scope + ' .aurea-shuffle');
        if (!g) return [];
        return Array.prototype.slice.call(g.children)
          .filter(function (c) { return c.tagName === 'A'; })
          .map(function (c) { var n = document.importNode(c, true); n.style.display = 'none'; return n; });
      }

      var visible = grid.offsetParent !== null;
      if (visible && pages > 1 && firstNext) {
        // ---- primary path: load every remaining page, then GLOBAL shuffle across all of them ----
        // Deferred to browser-idle so the fetch-storm doesn't compete with the initial paint;
        // the final global-shuffle result is byte-identical, only its timing shifts slightly.
        var loadRest = function () {
        var reqs = [];
        for (var n = 2; n <= pages; n++) {
          reqs.push(fetch(pageUrl(n), { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(function (r) { return r.text(); }).then(extractCards).catch(function () { return []; }));
        }
        Promise.all(reqs).then(function (lists) {
          var added = 0;
          lists.forEach(function (list) { list.forEach(function (c) { grid.appendChild(c); added++; }); });
          if (!added) return;
          btn.setAttribute('data-next', '');  // everything is now in the DOM
          // fade, globally shuffle the whole grid, re-reveal the same number of rows from the full mix
          grid.style.transition = 'opacity .22s ease';
          grid.style.opacity = '0';
          setTimeout(function () {
            relayout(shuffle(cards()));
            apply();
            grid.style.opacity = '1';
            try { savingsTags(grid); } catch (e) {}  // badge the newly fetched cards
            restoreState();  // now the full stable mix is in place — return to where the shopper was
          }, 180);
        });
        };
        if (window.requestIdleCallback) { requestIdleCallback(loadRest, { timeout: 1500 }); } else { setTimeout(loadRest, 400); }
        // Load More is now a pure reveal (all cards are local)
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          shown = Math.min(shown + STEP, cards().length);
          apply();
        });
      } else {
        // ---- fallback path (hidden grid or single page): reveal, fetching the next page on demand ----
        function fetchNext(done) {
          var url = nextUrl();
          if (!url || loading) { done(false); return; }
          loading = true;
          var label = btn.textContent;
          btn.textContent = 'Φόρτωση…'; btn.style.opacity = '0.6';
          fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
            .then(function (r) { return r.text(); })
            .then(function (html) {
              extractCards(html).forEach(function (c) { grid.appendChild(c); });
              try { savingsTags(grid); } catch (e) {}  // badge the newly fetched cards
              var doc = new DOMParser().parseFromString(html, 'text/html');
              var srcBtn = doc.querySelector(scope + ' .scp6');
              btn.setAttribute('data-next', srcBtn ? (srcBtn.getAttribute('data-next') || '') : '');
              btn.textContent = label; btn.style.opacity = '';
              loading = false; done(true);
            })
            .catch(function () { btn.textContent = label; btn.style.opacity = ''; loading = false; done(false); });
        }
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          if (loading) return;
          var target = shown + STEP;
          if (target > cards().length && nextUrl()) {
            fetchNext(function () { shown = Math.min(target, cards().length); apply(); });
          } else {
            shown = Math.min(target, cards().length);
            apply();
          }
        });
      }
    });
  }

  /* ---------- Order tracking form ---------- */
  // The tracking form redirects to the URL in its data-aurea-track attribute,
  // substituting {order} with the entered number. Change that attribute to your
  // tracking app's page URL once the app is installed (keep the {order} token).
  function trackForm() {
    document.querySelectorAll('form[data-aurea-track]').forEach(function (form) {
      if (form.getAttribute('data-aurea-bound')) return;
      form.setAttribute('data-aurea-bound', '1');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var input = form.querySelector('input[type="text"], input:not([type])');
        var val = input ? input.value.trim() : '';
        if (!val) { if (input) input.focus(); return; }
        var tpl = form.getAttribute('data-aurea-track') || '';
        if (!tpl) return;
        var url = tpl.indexOf('{order}') >= 0
          ? tpl.replace('{order}', encodeURIComponent(val))
          : tpl + encodeURIComponent(val);
        // Same-site tracking pages (e.g. the ParcelPanel app proxy) navigate in
        // place; fully-qualified external trackers open in a new tab.
        var external = /^https?:\/\//i.test(url) && url.indexOf(location.host) === -1;
        if (external) window.open(url, '_blank', 'noopener');
        else window.location.assign(url);
      });
    });
  }

  /* ---------- Savings tag: white "you saved €X" badge on every product card ---------- */
  function parseMoney(t) {
    if (!t) return NaN;
    var s = ('' + t).replace(/[^\d.,]/g, '');
    if (!s) return NaN;
    // EU/Greek format: dot = thousands separator, comma = decimal.
    if (s.indexOf(',') > -1) s = s.replace(/\./g, '').replace(',', '.');
    return parseFloat(s);
  }
  function fmtMoney(n) { return '€' + Math.round(n); }
  function savingsTags(root) {
    // On a dedicated bags/footwear collection page every card is a bag/shoe,
    // so we can force the tag top-right without relying on the per-card flag.
    var pageJb = /\/bags|handbag|crossbody|tote-bag|\/footwear|\/sandals|\/flats|\/heels|\/boots|\/sneakers|\/shoes/i.test(location.pathname);
    (root || document).querySelectorAll('a[href*="/products/"]').forEach(function (card) {
      if (card.getAttribute('data-aurea-saved')) return;
      var strike = card.querySelector('[style*="line-through"]');
      if (!strike) return;
      var orig = parseMoney(strike.textContent);
      var saleEl = strike.nextElementSibling;
      var sale = saleEl ? parseMoney(saleEl.textContent) : NaN;
      if (!(orig > 0) || !(sale >= 0) || !(orig > sale)) return;
      var saved = orig - sale;
      if (!(saved > 0)) return;
      card.setAttribute('data-aurea-saved', '1');
      // pin the tag inside the card's image wrapper (first positioned box); fall back to the card
      var wrap = card.querySelector('div[style*="position: relative"]') || card.querySelector('div[style*="position:relative"]');
      if (!wrap) { wrap = card; if (getComputedStyle(card).position === 'static') card.style.position = 'relative'; }
      // Mobile default: bottom-right (keeps the tag off the model's face). Bags &
      // footwear cards (data-jb) look better top-right, matching desktop.
      var onMobile = card.closest && card.closest('.aurea-mobile');
      var isJb = pageJb || card.getAttribute('data-jb') === '1';
      var tagPos = (onMobile && !isJb) ? 'bottom:12px;right:12px' : 'top:12px;right:12px';
      var tag = el('div', 'position:absolute;' + tagPos + ';z-index:4;background:#111;color:#fff;font-family:Manrope;font-weight:700;font-size:12px;letter-spacing:.02em;line-height:1;padding:8px 12px;border-radius:2px;white-space:nowrap;pointer-events:none;');
      tag.textContent = 'εκτός ' + fmtMoney(saved);
      wrap.appendChild(tag);
    });
  }

  // Recommendation / analytics apps append long tracking params to product links
  // (e.g. ?_su_rec=…&_su_rec_id=…&pb=0), which bloats the URL a shopper (or the shop
  // owner) copies to share or advertise. Once the page has loaded — so the app has
  // already read its attribution — strip those junk params from the address bar,
  // leaving the short canonical URL. Underscore-prefixed keys are Shopify/app tracking
  // params by convention; functional keys (variant, selling_plan, filter.*, sort_by,
  // page, q) never start with "_" and are preserved.
  function stripTrackingParams() {
    try {
      if (!window.history || !history.replaceState || !window.URL) return;
      var u = new URL(location.href);
      if (!u.search) return;
      var keys = [], removed = false;
      u.searchParams.forEach(function (v, k) { keys.push(k); });
      keys.forEach(function (k) {
        if (k.charAt(0) === '_' || k === 'pb') { u.searchParams.delete(k); removed = true; }
      });
      if (removed) {
        var qs = u.searchParams.toString();
        history.replaceState(history.state, '', u.pathname + (qs ? '?' + qs : '') + u.hash);
      }
    } catch (e) {}
  }

  function init() {
    // Interaction-critical (nav, cart, product buy-box, gallery): run now so the
    // first screen is fully responsive to taps.
    try { buildDropdowns(); } catch (e) {}
    try { buildMobileMenu(); } catch (e) {}
    try { cartDrawer(); } catch (e) {}
    try { productPage(); } catch (e) {}
    try { productGallery(); } catch (e) {}
    // Everything else decorates below-the-fold / non-critical UI. Defer it to idle so
    // it doesn't block the main thread during load — invisible in the first screen,
    // but it lowers Total Blocking Time on the throttled mobile Lighthouse run.
    var deferred = function () {
      try { stripTrackingParams(); } catch (e) {}
      try { hoverPolish(); } catch (e) {}
      try { trackForm(); } catch (e) {}
      try { buildFAQ(); } catch (e) {}
      try { restoreHovers(); } catch (e) {}
      try { quickAdd(); } catch (e) {}
      try { productAccordion(); } catch (e) {}
      try { pdpStickyPin(); } catch (e) {}
      try { reviewsCarousel(); } catch (e) {}
      try { collectionFilters(); } catch (e) {}
      try { sizeChart(); } catch (e) {}
      try { productReco(); } catch (e) {}
      try { collectionGrid(); } catch (e) {}
      try { savingsTags(); } catch (e) {}
    };
    if (window.requestIdleCallback) requestIdleCallback(deferred, { timeout: 1200 });
    else setTimeout(deferred, 150);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* build: nav dresses flyout 100831 */
