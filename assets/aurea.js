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
      a: 'Yes, our clothes are designed to fit true to size.\n\nTo ensure the best possible fit, we recommend checking our Size Guide on each product page before placing your order. As every style and body shape is unique, comparing your measurements with our size chart is the best way to find your perfect fit.' },
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

        var panel = el('div', 'position:absolute;top:100%;left:50%;transform:translateX(-50%);padding-top:14px;z-index:600;opacity:0;visibility:hidden;transition:opacity .18s ease;pointer-events:none;');
        var card = el('div', 'background:#fff;box-shadow:0 12px 40px rgba(0,0,0,.12);border:1px solid #EFEAE2;border-radius:4px;padding:10px 0;min-width:190px;');
        MENUS[label].forEach(function (item) {
          var link = el('a', 'display:block;padding:9px 22px;font-family:Manrope,sans-serif;font-size:13px;font-weight:500;color:#4A4A4A;white-space:nowrap;transition:background .15s,color .15s;', item);
          link.href = itemUrl(item);
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

  /* ---------- 2. Mobile slide-in menu ---------- */
  function buildMobileMenu() {
    var btn = document.querySelector('.aurea-mobile [aria-label="Menu"], .aurea-mobile button[aria-label*="enu"]');
    if (!btn || btn.getAttribute('data-aurea-mm')) return;
    btn.setAttribute('data-aurea-mm', '1');

    var overlay = el('div', 'position:fixed;inset:0;background:rgba(0,0,0,.4);z-index:2000;opacity:0;visibility:hidden;transition:opacity .25s ease;');
    var drawer = el('div', 'position:absolute;top:0;left:0;bottom:0;width:82%;max-width:340px;background:#fff;transform:translateX(-100%);transition:transform .28s ease;overflow-y:auto;padding:22px 0;font-family:Manrope,sans-serif;');
    overlay.appendChild(drawer);
    document.body.appendChild(overlay);

    var head = el('div', 'display:flex;justify-content:space-between;align-items:center;padding:0 22px 18px;border-bottom:1px solid #EFEAE2;margin-bottom:10px;');
    head.appendChild(el('span', 'font-family:Manrope;font-weight:600;letter-spacing:.18em;font-size:15px;color:#111;', 'AUREA'));
    var x = el('button', 'background:none;border:none;font-size:26px;line-height:1;color:#111;cursor:pointer;', '×');
    head.appendChild(x);
    drawer.appendChild(head);

    TOP_LINKS.forEach(function (l) {
      var a = el('a', 'display:block;padding:13px 24px;font-size:15px;font-weight:600;color:#111;', l[0]);
      a.href = l[1]; drawer.appendChild(a);
    });
    Object.keys(MENUS).forEach(function (cat) {
      var wrap = el('div', 'border-top:1px solid #F1ECE4;');
      var row = el('button', 'width:100%;display:flex;justify-content:space-between;align-items:center;background:none;border:none;padding:13px 24px;font-size:15px;font-weight:600;color:#111;cursor:pointer;text-align:left;');
      row.appendChild(el('span', '', cat));
      var sign = el('span', 'font-size:18px;color:#8A7F70;', '+'); row.appendChild(sign);
      var sub = el('div', 'display:none;padding:2px 0 10px;');
      MENUS[cat].forEach(function (item) {
        var a = el('a', 'display:block;padding:8px 34px;font-size:13.5px;font-weight:500;color:#6E675E;', item);
        a.href = itemUrl(item); sub.appendChild(a);
      });
      row.addEventListener('click', function () {
        var openNow = sub.style.display === 'none';
        sub.style.display = openNow ? 'block' : 'none';
        sign.textContent = openNow ? '–' : '+';
      });
      wrap.appendChild(row); wrap.appendChild(sub); drawer.appendChild(wrap);
    });

    var openM = function () { overlay.style.visibility = 'visible'; overlay.style.opacity = '1'; requestAnimationFrame(function () { drawer.style.transform = 'translateX(0)'; }); document.body.style.overflow = 'hidden'; };
    var closeM = function () { drawer.style.transform = 'translateX(-100%)'; overlay.style.opacity = '0'; document.body.style.overflow = ''; setTimeout(function () { overlay.style.visibility = 'hidden'; }, 260); };
    btn.addEventListener('click', function (e) { e.preventDefault(); openM(); });
    x.addEventListener('click', closeM);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeM(); });
  }

  /* ---------- 3. FAQ accordion ---------- */
  function buildFAQ() {
    var buttons = Array.prototype.slice.call(document.querySelectorAll('button'));
    FAQ.forEach(function (item) {
      buttons.forEach(function (btn) {
        if (btn.getAttribute('data-aurea-faq')) return;
        if (btn.textContent.replace(/\s+/g, ' ').trim().indexOf(item.q) !== 0) return;
        btn.setAttribute('data-aurea-faq', '1');
        btn.style.cursor = 'pointer';

        var ans = el('div', 'max-height:0;overflow:hidden;transition:max-height .3s ease;');
        var inner = el('div', 'padding:0 26px 24px;font-family:Manrope,sans-serif;font-weight:500;font-size:14.5px;line-height:1.75;color:#6E675E;white-space:pre-line;');
        inner.textContent = item.a;
        ans.appendChild(inner);
        // insert answer right after the button (or its wrapping row)
        var anchor = btn;
        if (btn.parentElement && btn.parentElement.children.length === 1) anchor = btn.parentElement;
        anchor.parentNode.insertBefore(ans, anchor.nextSibling);

        var icon = btn.querySelector('svg, span:last-child');
        btn.addEventListener('click', function () {
          var openNow = ans.style.maxHeight === '0px' || !ans.style.maxHeight;
          ans.style.maxHeight = openNow ? (inner.offsetHeight + 8) + 'px' : '0px';
          if (icon) icon.style.transform = openNow ? 'rotate(45deg)' : '';
          if (icon) icon.style.transition = 'transform .2s ease';
        });
      });
    });
  }

  /* ---------- 4. Site-wide hover polish ---------- */
  function hoverPolish() {
    var s = document.createElement('style');
    s.textContent =
      '.aurea-page a{transition:color .2s ease,opacity .2s ease;}' +
      '.aurea-page button{transition:opacity .2s ease,background .2s ease,color .2s ease;}' +
      '.aurea-page button:hover{opacity:.82;}' +
      '.aurea-desktop [data-aurea-dd]>a:hover{color:#111 !important;}' +
      /* gentle image zoom on product/collection/category cards */
      '.aurea-page a img{transition:transform .5s ease;}' +
      '.aurea-page a:hover>img,.aurea-page a:hover img{transform:scale(1.04);}';
    document.head.appendChild(s);
  }

  function init() {
    try { hoverPolish(); } catch (e) {}
    try { buildDropdowns(); } catch (e) {}
    try { buildMobileMenu(); } catch (e) {}
    try { buildFAQ(); } catch (e) {}
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
