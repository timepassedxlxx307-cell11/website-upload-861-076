(function () {
  "use strict";

  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function initHeader() {
    var header = document.querySelector("[data-site-header]");
    var menuButton = document.querySelector("[data-menu-button]");
    var mobilePanel = document.querySelector("[data-mobile-panel]");

    function updateHeader() {
      if (!header) {
        return;
      }
      if (window.scrollY > 12) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    }

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });

    if (menuButton && mobilePanel) {
      menuButton.addEventListener("click", function () {
        mobilePanel.classList.toggle("is-open");
      });
    }
  }

  function initHero() {
    var slides = Array.prototype.slice.call(document.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(document.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }

    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    show(0);
    start();
  }

  function initSearchForms() {
    Array.prototype.slice.call(document.querySelectorAll("[data-search-form]")).forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("[data-search-input]");
        if (!input || !input.value.trim()) {
          event.preventDefault();
        }
      });
    });
  }

  function initSearchPage() {
    var pageInput = document.querySelector("[data-page-search-input]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!pageInput || !cards.length) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q") || "";
    pageInput.value = query;

    function apply() {
      var term = normalize(pageInput.value);
      cards.forEach(function (card) {
        var haystack = normalize([
          card.getAttribute("data-title"),
          card.getAttribute("data-type"),
          card.getAttribute("data-region"),
          card.getAttribute("data-year"),
          card.getAttribute("data-tags"),
          card.textContent
        ].join(" "));
        card.classList.toggle("hidden-card", term && haystack.indexOf(term) === -1);
      });
    }

    pageInput.addEventListener("input", apply);
    apply();
  }

  function initFilters() {
    var panel = document.querySelector("[data-filter-panel]");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
    if (!panel || !cards.length) {
      return;
    }

    var state = {};

    function applyFilters() {
      cards.forEach(function (card) {
        var visible = Object.keys(state).every(function (key) {
          var value = state[key];
          if (!value || value === "all") {
            return true;
          }
          return normalize(card.getAttribute("data-" + key)) === normalize(value);
        });
        card.classList.toggle("hidden-card", !visible);
      });
    }

    Array.prototype.slice.call(panel.querySelectorAll("[data-filter-key]")).forEach(function (button) {
      button.addEventListener("click", function () {
        var key = button.getAttribute("data-filter-key");
        var value = button.getAttribute("data-filter-value");
        state[key] = value;
        Array.prototype.slice.call(panel.querySelectorAll('[data-filter-key="' + key + '"]')).forEach(function (item) {
          item.classList.toggle("active", item === button);
        });
        applyFilters();
      });
    });
  }

  window.setupMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-panel]");
    var playButton = document.querySelector("[data-play-button]");
    var readyToPlay = false;
    var hlsInstance = null;

    if (!video || !streamUrl) {
      return;
    }

    function bindStream() {
      if (readyToPlay) {
        var replay = video.play();
        if (replay && typeof replay.catch === "function") {
          replay.catch(function () {});
        }
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }

      readyToPlay = true;
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }

      var playRequest = video.play();
      if (playRequest && typeof playRequest.catch === "function") {
        playRequest.catch(function () {});
      }
    }

    if (cover) {
      cover.addEventListener("click", bindStream);
    }
    if (playButton) {
      playButton.addEventListener("click", bindStream);
    }
    video.addEventListener("click", function () {
      if (!readyToPlay) {
        bindStream();
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance && typeof hlsInstance.destroy === "function") {
        hlsInstance.destroy();
      }
    });
  };

  ready(function () {
    initHeader();
    initHero();
    initSearchForms();
    initSearchPage();
    initFilters();
  });
})();
