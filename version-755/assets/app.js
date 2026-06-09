(function () {
  var body = document.body;
  var menuButton = document.querySelector('[data-menu-toggle]');

  if (menuButton) {
    menuButton.addEventListener('click', function () {
      body.classList.toggle('nav-open');
    });
  }

  document.querySelectorAll('[data-search-form]').forEach(function (form) {
    form.addEventListener('submit', function (event) {
      var input = form.querySelector('input[name="q"]');
      var keyword = input ? input.value.trim() : '';
      if (keyword.length > 0) {
        event.preventDefault();
        window.location.href = './search.html?q=' + encodeURIComponent(keyword);
      }
    });
  });

  document.querySelectorAll('[data-hero]').forEach(function (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      if (!slides.length) {
        return;
      }
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('active', dotIndex === current);
      });
    }

    function start() {
      if (slides.length < 2) {
        return;
      }
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });

    show(0);
    start();
  });

  document.querySelectorAll('[data-list-filter]').forEach(function (wrap) {
    var input = wrap.querySelector('[data-filter-input]');
    var cards = Array.prototype.slice.call(wrap.querySelectorAll('[data-card]'));
    var buttons = Array.prototype.slice.call(wrap.querySelectorAll('[data-type-filter]'));
    var empty = wrap.querySelector('[data-empty]');
    var activeType = 'all';

    function normalize(value) {
      return (value || '').toString().toLowerCase().trim();
    }

    function applyFilter() {
      var keyword = normalize(input ? input.value : '');
      var visible = 0;
      cards.forEach(function (card) {
        var haystack = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.getAttribute('data-region') + ' ' + card.getAttribute('data-genre'));
        var typeValue = normalize(card.getAttribute('data-type'));
        var passKeyword = keyword.length === 0 || haystack.indexOf(keyword) !== -1;
        var passType = activeType === 'all' || typeValue.indexOf(activeType) !== -1;
        var showCard = passKeyword && passType;
        card.style.display = showCard ? '' : 'none';
        if (showCard) {
          visible += 1;
        }
      });
      if (empty) {
        empty.style.display = visible === 0 ? 'block' : 'none';
      }
    }

    if (input) {
      input.addEventListener('input', applyFilter);
    }

    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        activeType = normalize(button.getAttribute('data-type-filter'));
        buttons.forEach(function (item) {
          item.classList.toggle('active', item === button);
        });
        applyFilter();
      });
    });

    applyFilter();
  });

  var searchInput = document.querySelector('[data-page-search]');
  if (searchInput) {
    var params = new URLSearchParams(window.location.search);
    var q = params.get('q') || '';
    searchInput.value = q;
    searchInput.dispatchEvent(new Event('input'));
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var video = shell.querySelector('video');
    var trigger = shell.querySelector('[data-play-trigger]');
    var started = false;

    function playVideo() {
      if (!video) {
        return;
      }
      var url = video.getAttribute('data-video-url');
      if (!url) {
        return;
      }
      shell.classList.add('is-playing');
      if (started) {
        video.play().catch(function () {});
        return;
      }
      started = true;
      if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({ enableWorker: true });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          video.play().catch(function () {});
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', function () {
          video.play().catch(function () {});
        }, { once: true });
      } else {
        video.src = url;
        video.play().catch(function () {});
      }
    }

    if (trigger) {
      trigger.addEventListener('click', playVideo);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
    }
  });
})();
