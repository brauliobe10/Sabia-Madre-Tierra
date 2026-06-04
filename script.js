(function () {
  "use strict";

  var mqCoarse = window.matchMedia("(max-width: 767px)");
  var mqDesktopNav = window.matchMedia("(min-width: 1024px)");

  function initMobileNav() {
    var toggle = document.querySelector("[data-nav-toggle]");
    var nav = document.getElementById("site-nav");
    var backdrop = document.querySelector(".nav-backdrop");
    if (!toggle || !nav) return;

    function setOpen(open) {
      if (mqDesktopNav.matches) return;

      document.body.classList.toggle("nav-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
      nav.setAttribute("aria-hidden", open ? "false" : "true");

      if (backdrop) {
        backdrop.hidden = !open;
      }
    }

    toggle.addEventListener("click", function () {
      setOpen(!document.body.classList.contains("nav-open"));
    });

    if (backdrop) {
      backdrop.addEventListener("click", function () {
        setOpen(false);
      });
    }

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        if (!mqDesktopNav.matches) setOpen(false);
      });
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setOpen(false);
    });

    mqDesktopNav.addEventListener("change", function (e) {
      if (e.matches) {
        setOpen(false);
        nav.removeAttribute("aria-hidden");
      } else if (!document.body.classList.contains("nav-open")) {
        nav.setAttribute("aria-hidden", "true");
      }
    });

    if (!mqDesktopNav.matches) {
      nav.setAttribute("aria-hidden", "true");
    }
  }

  initMobileNav();

  function initCarousel(root) {
    var track = root.querySelector("[data-carousel-track]");
    var btnPrev = root.querySelector("[data-carousel-prev]");
    var btnNext = root.querySelector("[data-carousel-next]");
    var viewport = track && track.parentElement;
    if (!track || !btnPrev || !btnNext || !viewport) return;

    var index = 0;

    function isMobileLayout() {
      return mqCoarse.matches;
    }

    function getGap() {
      var g = parseFloat(window.getComputedStyle(track).columnGap || window.getComputedStyle(track).gap);
      return isNaN(g) ? 0 : g;
    }

    function cardStepWidth() {
      var first = track.querySelector(".av-card");
      if (!first) return 0;
      return first.getBoundingClientRect().width + getGap();
    }

    function visibleCardCount() {
      var vw = viewport.getBoundingClientRect().width;
      var step = cardStepWidth();
      if (step <= 0) return 1;
      return Math.max(1, Math.min(track.children.length, Math.floor((vw + getGap()) / step)));
    }

    function maxIndex() {
      var total = track.querySelectorAll(".av-card").length;
      return Math.max(0, total - visibleCardCount());
    }

    function update() {
      if (isMobileLayout()) {
        track.style.transform = "";
        btnPrev.disabled = true;
        btnNext.disabled = true;
        return;
      }

      var step = cardStepWidth();
      var max = maxIndex();
      if (index > max) index = max;
      track.style.transform = "translateX(" + -index * step + "px)";
      btnPrev.disabled = index <= 0;
      btnNext.disabled = index >= max;
    }

    btnPrev.addEventListener("click", function () {
      if (isMobileLayout()) return;
      index = Math.max(0, index - 1);
      update();
    });

    btnNext.addEventListener("click", function () {
      if (isMobileLayout()) return;
      index = Math.min(maxIndex(), index + 1);
      update();
    });

    var resizeTimer;
    function onReflow() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () {
        index = Math.min(index, maxIndex());
        update();
      }, 100);
    }

    window.addEventListener("resize", onReflow, { passive: true });
    mqCoarse.addEventListener("change", function () {
      if (isMobileLayout()) index = 0;
      update();
    });

    if (window.ResizeObserver) {
      new ResizeObserver(onReflow).observe(viewport);
    }

    update();
  }

  document.querySelectorAll("[data-carousel]").forEach(initCarousel);

  document.querySelectorAll("[data-scroll-target]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var sel = btn.getAttribute("data-scroll-target");
      if (!sel) return;
      var el = document.querySelector(sel);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });

  var form = document.querySelector(".newsletter-form");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (input && input.checkValidity()) {
        alert("¡Gracias! Pronto recibirás novedades en " + input.value);
        input.value = "";
      }
    });
  }

  // Funcionalidad de arrastrar y deslizar para el carrusel de la revista
const carousel = document.querySelector('.cronica-carousel');

if (carousel) {
  let isDown = false;
  let startX;
  let scrollLeft;

  carousel.addEventListener('mousedown', (e) => {
    isDown = true;
    carousel.classList.add('active');
    startX = e.pageX - carousel.offsetLeft;
    scrollLeft = carousel.scrollLeft;
    // Desactiva temporalmente el comportamiento "smooth" para un arrastre directo
    carousel.style.scrollBehavior = 'auto';
  });

  carousel.addEventListener('mouseleave', () => {
    isDown = false;
  });

  carousel.addEventListener('mouseup', () => {
    isDown = false;
    // Reactiva el comportamiento suave para que se acomode solo en la foto actual
    carousel.style.scrollBehavior = 'smooth';
  });

  carousel.addEventListener('mousemove', (e) => {
    if (!isDown) return;
    e.preventDefault();
    const x = e.pageX - carousel.offsetLeft;
    const walk = (x - startX) * 1.5; // Multiplicador de velocidad de arrastre
    carousel.scrollLeft = scrollLeft - walk;
  });
}

})();
