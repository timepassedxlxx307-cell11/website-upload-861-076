(function () {
    var toggle = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (toggle && mobileNav) {
        toggle.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-site-search]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            var input = form.querySelector('input[name="q"]');
            if (!input) {
                return;
            }
            var value = input.value.trim();
            if (value.length === 0) {
                return;
            }
            event.preventDefault();
            var action = form.getAttribute('action') || 'search.html';
            window.location.href = action + '?q=' + encodeURIComponent(value);
        });
    });

    var pageSearchInput = document.querySelector('[data-search-page-input]');
    var params = new URLSearchParams(window.location.search);
    var query = params.get('q') || '';
    if (pageSearchInput && query) {
        pageSearchInput.value = query;
    }

    function normalize(value) {
        return String(value || '').toLowerCase().replace(/\s+/g, ' ').trim();
    }

    function applyFilters(panel) {
        var section = panel.closest('.section-block') || document;
        var list = section.querySelector('[data-filter-list]');
        if (!list) {
            return;
        }
        var cards = Array.prototype.slice.call(list.querySelectorAll('[data-movie-card]'));
        var empty = section.querySelector('[data-empty-state]');
        var input = panel.querySelector('[data-filter-input]');
        var typeField = panel.querySelector('[data-filter-field="type"]');
        var yearField = panel.querySelector('[data-filter-field="year"]');
        var regionField = panel.querySelector('[data-filter-field="region"]');
        var categoryField = panel.querySelector('[data-filter-field="category"]');
        var keyword = normalize(input ? input.value : '');
        var type = normalize(typeField ? typeField.value : '');
        var year = normalize(yearField ? yearField.value : '');
        var region = normalize(regionField ? regionField.value : '');
        var category = normalize(categoryField ? categoryField.value : '');
        var visible = 0;

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.type,
                card.dataset.region,
                card.dataset.year,
                card.dataset.tags,
                card.dataset.category
            ].join(' '));
            var matched = true;
            if (keyword && haystack.indexOf(keyword) === -1) {
                matched = false;
            }
            if (type && normalize(card.dataset.type).indexOf(type) === -1 && normalize(card.dataset.tags).indexOf(type) === -1) {
                matched = false;
            }
            if (year && normalize(card.dataset.year) !== year) {
                matched = false;
            }
            if (region && normalize(card.dataset.region).indexOf(region) === -1) {
                matched = false;
            }
            if (category && normalize(card.dataset.category).indexOf(category) === -1) {
                matched = false;
            }
            card.hidden = !matched;
            if (matched) {
                visible += 1;
            }
        });

        if (empty) {
            empty.classList.toggle('is-visible', visible === 0);
        }
    }

    document.querySelectorAll('[data-filter-panel]').forEach(function (panel) {
        panel.querySelectorAll('input, select').forEach(function (field) {
            field.addEventListener('input', function () {
                applyFilters(panel);
            });
            field.addEventListener('change', function () {
                applyFilters(panel);
            });
        });
        var input = panel.querySelector('[data-filter-input]');
        if (input && query) {
            input.value = query;
        }
        applyFilters(panel);
    });

    var hero = document.querySelector('[data-hero]');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;
        var timer = null;

        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        if (prev) {
            prev.addEventListener('click', function () {
                show(current - 1);
                start();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(current + 1);
                start();
            });
        }
        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                start();
            });
        });
        hero.addEventListener('mouseenter', stop);
        hero.addEventListener('mouseleave', start);
        show(0);
        start();
    }
})();
