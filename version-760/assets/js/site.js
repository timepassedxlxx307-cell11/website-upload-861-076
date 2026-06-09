(function () {
  function selectAll(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return String(value || '').toLowerCase().trim();
  }

  document.addEventListener('DOMContentLoaded', function () {
    var nav = document.querySelector('[data-site-nav]');
    var menuButton = document.querySelector('[data-menu-toggle]');

    if (menuButton && nav) {
      menuButton.addEventListener('click', function () {
        nav.classList.toggle('is-open');
      });
    }

    var slides = selectAll('[data-hero-slide]');
    var dots = selectAll('[data-hero-dot]');
    var current = 0;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    if (slides.length) {
      showSlide(0);
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
          showSlide(dotIndex);
        });
      });
      window.setInterval(function () {
        showSlide(current + 1);
      }, 5200);
    }

    var filterInput = document.querySelector('[data-filter-input]');
    var cards = selectAll('[data-movie-card]');
    var empty = document.querySelector('[data-empty-result]');

    function applyFilter() {
      var keyword = normalize(filterInput ? filterInput.value : '');
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-search'));
        var matched = !keyword || haystack.indexOf(keyword) !== -1;
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.style.display = visible ? 'none' : 'block';
      }
    }

    if (filterInput) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        filterInput.value = q;
      }
      filterInput.addEventListener('input', applyFilter);
      applyFilter();
    }
  });
})();
