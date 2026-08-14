/* Future Foundations PAC — shared nav, footer, breadcrumbs */
(function (global) {
  "use strict";

  var PATHS = {
    shield: '<path d="M12 2l8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/>',
    scale: '<line x1="12" y1="3" x2="12" y2="21"/><path d="M6 7h12"/><path d="M6 7l-3 6a3 3 0 0 0 6 0z"/><path d="M18 7l-3 6a3 3 0 0 0 6 0z"/>',
    users: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>',
    scroll: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>',
    menu: '<line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>',
    chevron: '<polyline points="6 9 12 15 18 9"/>'
  };

  function icon(name, size) {
    var s = size || 22;
    var p = PATHS[name] || PATHS.shield;
    return '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s +
      '" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      p + '</svg>';
  }

  var NAV = [
    { href: "/", label: "Home", match: /^\/$/ },
    { href: "/shows/true-to-the-oath/", label: "True to the Oath", match: /\/shows\/true-to-the-oath/ },
    { href: "/#programs", label: "Programs", match: null },
    { href: "/donate/", label: "Support", match: /\/donate/ }
  ];

  var CRUMB_LABELS = {
    "donate": "Support",
    "thank-you": "Thank you",
    "shows": "Shows",
    "true-to-the-oath": "True to the Oath"
  };

  function currentPath() {
    return (global.location.pathname || "/").replace(/\/+$/, "") || "/";
  }

  function isActive(item) {
    var path = currentPath();
    if (item.match) return item.match.test(path + (path === "/" ? "" : "/"));
    return false;
  }

  function renderNav() {
    var links = NAV.map(function (item) {
      var cls = "ff-nav-link" + (isActive(item) ? " active" : "");
      return '<a class="' + cls + '" href="' + item.href + '">' + item.label + "</a>";
    }).join("");

    return (
      '<nav class="ff-navbar" aria-label="Main">' +
        '<div class="ff-navbar__inner">' +
          '<a class="ff-brand" href="/">' +
            '<span class="ff-brand__mark">' + icon("shield", 20) + "</span>" +
            "<span>Future Foundations PAC</span>" +
          "</a>" +
          '<button type="button" class="ff-nav-toggle" aria-expanded="false" aria-controls="ff-nav-menu" id="ff-nav-toggle">' +
            icon("menu", 22) +
          "</button>" +
          '<div class="ff-nav-links" id="ff-nav-menu">' +
            links +
            '<a class="ff-nav-cta" href="/donate/">Donate</a>' +
          "</div>" +
        "</div>" +
      "</nav>"
    );
  }

  function renderCrumbs() {
    var path = currentPath();
    if (path === "/" || path === "") return "";

    var parts = path.split("/").filter(Boolean);
    var html = '<nav class="ff-crumbs" aria-label="Breadcrumb"><div class="ff-crumbs__inner">';
    html += '<a href="/">Home</a>';
    var built = "";
    for (var i = 0; i < parts.length; i++) {
      built += "/" + parts[i];
      var label = CRUMB_LABELS[parts[i]] || parts[i].replace(/-/g, " ");
      if (i === parts.length - 1) {
        html += " · <span>" + label + "</span>";
      } else {
        html += ' · <a href="' + built + '/">' + label + "</a>";
      }
    }
    html += "</div></nav>";
    return html;
  }

  function renderFooter() {
    var year = new Date().getFullYear();
    return (
      '<footer class="ff-footer">' +
        '<div class="ff-container">' +
          '<div class="ff-footer__grid">' +
            '<div>' +
              '<div class="ff-footer__brand">Future Foundations PAC</div>' +
              '<p class="ff-muted" style="color:rgba(255,255,255,0.65);max-width:36ch">' +
                "Civic covenant and institutional integrity — solemn obligation among citizens, not commercial contract." +
              "</p>" +
            "</div>" +
            '<div class="ff-footer__col">' +
              "<h4>Programs</h4>" +
              '<a href="/shows/true-to-the-oath/">True to the Oath</a>' +
              '<a href="/#programs">Candidate Covenant</a>' +
              '<a href="/#covenant">Renewal Covenant</a>' +
            "</div>" +
            '<div class="ff-footer__col">' +
              "<h4>Support</h4>" +
              '<a href="/donate/">Donate</a>' +
              '<a href="https://www.youtube.com/shorts/4raBrF3lGb4" target="_blank" rel="noopener">Watch the Short</a>' +
            "</div>" +
            '<div class="ff-footer__col">' +
              "<h4>Legal</h4>" +
              "<span>Not tax-deductible</span><br>" +
              "<span>Not a government agency</span><br>" +
              "<span>Covenant fellowship</span>" +
            "</div>" +
          "</div>" +
          '<div class="ff-footer__legal">' +
            "&copy; " + year + " Future Foundations PAC · " +
            '<a href="mailto:info@futurefoundationspac.org">info@futurefoundationspac.org</a>' +
          "</div>" +
        "</div>" +
      "</footer>"
    );
  }

  function bindMobileNav() {
    var toggle = document.getElementById("ff-nav-toggle");
    var menu = document.getElementById("ff-nav-menu");
    if (!toggle || !menu) return;
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function mount() {
    var navMount = document.getElementById("ff-nav");
    var footerMount = document.getElementById("ff-footer");
    var crumbsMount = document.getElementById("ff-crumbs");

    if (navMount) navMount.outerHTML = renderNav();
    if (crumbsMount) crumbsMount.outerHTML = renderCrumbs();
    if (footerMount) footerMount.innerHTML = renderFooter();

    bindMobileNav();
  }

  global.FFShell = { mount: mount, icon: icon };
})(window);
