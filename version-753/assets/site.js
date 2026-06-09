(function () {
    var nav = document.querySelector('.nav-links');
    var toggle = document.querySelector('.menu-toggle');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    document.querySelectorAll('.cover-frame img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.classList.add('image-missing');
        }, { once: true });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
    var current = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        current = (index + slides.length) % slides.length;
        slides.forEach(function (slide, idx) {
            slide.classList.toggle('active', idx === current);
        });
        dots.forEach(function (dot, idx) {
            dot.classList.toggle('active', idx === current);
        });
    }

    function startHero() {
        if (timer) {
            window.clearInterval(timer);
        }
        if (slides.length > 1) {
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }
    }

    dots.forEach(function (dot, index) {
        dot.addEventListener('click', function () {
            showSlide(index);
            startHero();
        });
    });

    var prev = document.querySelector('.hero-prev');
    var next = document.querySelector('.hero-next');

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(current - 1);
            startHero();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(current + 1);
            startHero();
        });
    }

    startHero();

    document.querySelectorAll('.filter-bar').forEach(function (bar) {
        var input = bar.querySelector('.filter-input');
        var chips = Array.prototype.slice.call(bar.querySelectorAll('.filter-chip'));
        var grid = bar.parentElement.querySelector('.movie-grid');
        var typeValue = '';

        function applyFilter() {
            if (!grid) {
                return;
            }
            var query = input ? input.value.trim().toLowerCase() : '';
            var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
            var visible = 0;

            cards.forEach(function (card) {
                var text = card.getAttribute('data-search') || '';
                var cardType = card.getAttribute('data-type') || '';
                var matchedText = !query || text.indexOf(query) !== -1;
                var matchedType = !typeValue || cardType === typeValue;
                var matched = matchedText && matchedType;
                card.classList.toggle('is-hidden-card', !matched);
                if (matched) {
                    visible += 1;
                }
            });

            var empty = grid.querySelector('.no-results');
            if (!visible) {
                if (!empty) {
                    empty = document.createElement('div');
                    empty.className = 'no-results';
                    empty.textContent = '没有找到相关影片';
                    grid.appendChild(empty);
                }
            } else if (empty) {
                empty.remove();
            }
        }

        if (input) {
            input.addEventListener('input', applyFilter);
        }

        chips.forEach(function (chip) {
            chip.addEventListener('click', function () {
                chips.forEach(function (item) {
                    item.classList.remove('active');
                });
                chip.classList.add('active');
                typeValue = chip.getAttribute('data-type-value') || '';
                applyFilter();
            });
        });
    });
})();
