(function () {
  var toggle = document.querySelector('[data-menu-toggle]');
  var nav = document.querySelector('[data-main-nav]');
  var headerSearch = document.querySelector('.header-search');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('is-open');
      if (headerSearch) {
        headerSearch.classList.toggle('is-open');
      }
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === current);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === current);
      });
    }

    function move(step) {
      show(current + step);
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        move(1);
      }, 5600);
    }

    if (prev) {
      prev.addEventListener('click', function () {
        move(-1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        move(1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    restart();
  }

  var localInput = document.querySelector('[data-local-search]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-card]'));
  var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-year-filter]'));
  var activeYear = 'all';

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function applyLocalFilter() {
    var query = normalize(localInput ? localInput.value : '');
    cards.forEach(function (card) {
      var text = normalize(card.getAttribute('data-search'));
      var year = card.getAttribute('data-year') || '';
      var matchQuery = !query || text.indexOf(query) !== -1;
      var matchYear = activeYear === 'all' || year === activeYear;
      card.style.display = matchQuery && matchYear ? '' : 'none';
    });
  }

  if (localInput && cards.length) {
    localInput.addEventListener('input', applyLocalFilter);
  }

  filterButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      activeYear = button.getAttribute('data-year-filter') || 'all';
      filterButtons.forEach(function (item) {
        item.classList.toggle('is-active', item === button);
      });
      applyLocalFilter();
    });
  });

  function text(value) {
    return String(value || '').replace(/[&<>"']/g, function (char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }

  var searchResults = document.querySelector('[data-search-results]');
  if (searchResults && window.SEARCH_MOVIES) {
    var params = new URLSearchParams(window.location.search);
    var query = normalize(params.get('q') || '');
    var input = document.querySelector('[data-search-page-input]');
    if (input) {
      input.value = params.get('q') || '';
    }
    var resultList = window.SEARCH_MOVIES.filter(function (movie) {
      if (!query) {
        return true;
      }
      return normalize([movie.title, movie.region, movie.year, movie.genre, movie.tags, movie.oneLine].join(' ')).indexOf(query) !== -1;
    });
    if (!resultList.length) {
      searchResults.innerHTML = '<div class="search-empty">暂无匹配内容</div>';
    } else {
      searchResults.innerHTML = resultList.map(function (movie) {
        return '<article class="movie-card" data-card>' +
          '<a class="movie-cover" href="' + text(movie.url) + '">' +
          '<img loading="lazy" src="' + text(movie.cover) + '" alt="' + text(movie.title) + '">' +
          '<span class="cover-shadow"></span>' +
          '</a>' +
          '<div class="movie-body">' +
          '<div class="movie-meta-row"><span>' + text(movie.year) + '</span><span>' + text(movie.region) + '</span><span>' + text(movie.type) + '</span></div>' +
          '<h3><a href="' + text(movie.url) + '">' + text(movie.title) + '</a></h3>' +
          '<p>' + text(movie.oneLine) + '</p>' +
          '<div class="tag-row">' + movie.tags.slice(0, 4).map(function (tag) { return '<span>' + text(tag) + '</span>'; }).join('') + '</div>' +
          '<div class="card-foot"><span>' + text(movie.genre) + '</span><strong>' + text(movie.rating) + '</strong></div>' +
          '</div>' +
          '</article>';
      }).join('');
    }
  }
})();
