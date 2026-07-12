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

    var overlay = el('div', 'position:fixed;inset:0;background:rgba(20,18,16,.4);z-index:5000;opacity:0;visibility:hidden;transition:opacity .3s ease;');
    var drawer = el('div', "position:fixed;top:0;left:0;height:100%;width:min(86%,360px);background:#fff;z-index:5001;box-shadow:18px 0 50px rgba(0,0,0,.22);transform:translateX(-100%);transition:transform .38s cubic-bezier(.4,0,.2,1);display:flex;flex-direction:column;");
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
