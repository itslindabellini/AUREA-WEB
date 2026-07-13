/* AUREA Mykonos — interactivity restored as vanilla JS.
 * The original design was a React app; the static port froze its behavior.
 * This re-implements the key interactions natively. No dependencies. */
(function () {
  'use strict';

  var MENUS = {
    'Summer Clothes': ['Shop All', 'Dresses', 'Skirts', 'Pants', 'Sets', 'Tunics', 'Bikini'],
    'Footwear':       ['Shop All', 'Sneakers', 'Heels', 'Flats', 'Boots', 'Sandals'],
    'Jewelry':        ['Shop All', 'Necklaces', 'Earrings', 'Bracelets', 'Rings', 'Sunglasses'],
    'Bags':           ['Shop All', 'Crossbody Bags', 'Handbags', 'Tote Bags'],
    'Winter Clothes': ['Shop All', 'Coats', 'Jackets', 'Sweaters', 'Jeans']
  };
  var TOP_LINKS = [
    ['Home', '/'], ['About Us', '/pages/about-us'],
    ['Contact', '/pages/contact'], ['Tracking', '/pages/tracking']
  ];
  var FAQ = [
    { q: 'Are the clothes true to size?',
      a: 'Yes, our clothes are designed to fit true to size.\n\nTo ensure the best possible fit, we recommend checking our Size Guide on each product page before placing your order. As every style and body is unique, comparing your measurements with our size chart is the best way to find your perfect fit.' },
    { q: 'How should I care for my clothing?',
      a: 'To keep your pieces looking their best, we recommend following the care instructions on the label.\n\nIn general, we suggest washing on a gentle cycle with cold water or hand washing when appropriate. Avoid using bleach, tumble drying on high heat, and prolonged exposure to direct sunlight, as these may affect the fabric and color over time.\n\nWith the right care, your AUREA Mykonos pieces will stay beautiful and remain a part of your wardrobe for years to come.' },
    { q: 'How long does shipping take?',
      a: 'We aim to process and ship all orders as quickly as possible. Once your order has been dispatched, delivery typically takes 6–12 business days, depending on your location.\n\nOnce your order ships, you’ll receive a confirmation email with tracking information so you can follow its journey every step of the way.' },
    { q: 'Can I return my order?',
      a: 'Yes. If you’re not completely satisfied with your order, you may return your item(s) within 30 days of delivery, provided they are unworn, unwashed, and in their original condition with all tags attached.\n\nIf you have any questions, our customer support team is always happy to assist you.' }
  ];

  // For now every category/sub-item points at the full catalog; phase two maps
  // these to real collection handles once collections exist.
  function itemUrl() { return '/collections/all'; }

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
        var label = a.textContent.trim();
        if (!MENUS[label] || !a.querySelector('svg')) return;
        var host = a.parentElement;
        if (!host) return;
        if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
        if (host.getAttribute('data-aurea-dd')) return;
        host.setAttribute('data-aurea-dd', '1');

        var panel = el('div', 'position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:16px;z-index:600;opacity:0;visibility:hidden;transition:opacity .18s ease;pointer-events:none;');
        var card = el('div', "background:#fff;border:1px solid #EFEAE2;box-shadow:0 18px 44px rgba(20,18,16,.13);min-width:200px;padding:8px 0;display:flex;flex-direction:column;");
        MENUS[label].forEach(function (item) {
          var link = el('a', "padding:11px 24px;font-family:'Manrope',sans-serif;font-weight:500;font-size:11.5px;letter-spacing:.12em;text-transform:uppercase;color:#4A4A4A;white-space:nowrap;transition:background .15s ease,color .15s ease;", item);
          link.href = itemUrl(item);
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
      var subs = MENUS[cat].map(function (item) {
        return '<a href="' + itemUrl(item) + '" style="padding:10px 8px 10px 22px;font-family:\'Manrope\',sans-serif;font-weight:500;font-size:14px;letter-spacing:.01em;color:#6E675E;text-decoration:none;">' + item + '</a>';
      }).join('');
      return '<div style="border-bottom:1px solid #F5F0EB;">' +
        '<button class="aurea-mm-cat" style="width:100%;display:flex;align-items:center;justify-content:space-between;background:none;border:none;cursor:pointer;padding:15px 4px;font-family:\'Manrope\',sans-serif;font-weight:600;font-size:13.5px;letter-spacing:.14em;text-transform:uppercase;color:#4A4A4A;text-align:left;">' +
          '<span>' + cat + '</span>' +
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
        '<a href="/collections/all" style="display:block;text-align:center;font-family:\'Manrope\',sans-serif;font-weight:700;font-size:13px;letter-spacing:.22em;text-transform:uppercase;background:#111;color:#fff;padding:18px;text-decoration:none;transition:opacity .2s ease;">Shop Now</a>' +
        '<div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-top:15px;font-family:\'Manrope\',sans-serif;font-weight:500;font-size:11.5px;color:#9A948C;">' +
          '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="5" y="10" width="14" height="10" rx="1.2"></rect><path d="M8 10V7a4 4 0 0 1 8 0v3"></path></svg>' +
          'Secure checkout · Free shipping to Greece' +
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
      if (!id) { window.location.href = '/cart'; return; }
      var orig = btn.textContent;
      btn.textContent = 'Adding…';
      fetch('/cart/add.js', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, quantity: 1 }) })
        .then(function (r) { if (!r.ok) throw new Error('add failed'); return r.json(); })
        .then(function () {
          btn.textContent = 'Added ✓';
          document.dispatchEvent(new CustomEvent('aurea:cart-updated'));
          setTimeout(function () { btn.textContent = orig; }, 1600);
        })
        .catch(function () { window.location.href = '/cart'; });
    });
  }

  function init() {
    try { hoverPolish(); } catch (e) {}
    try { buildDropdowns(); } catch (e) {}
    try { buildMobileMenu(); } catch (e) {}
    try { buildFAQ(); } catch (e) {}
    try { restoreHovers(); } catch (e) {}
    try { quickAdd(); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
