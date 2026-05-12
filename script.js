(function () {
  "use strict";

  var mqCoarse = window.matchMedia("(max-width: 768px)");

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
})();
