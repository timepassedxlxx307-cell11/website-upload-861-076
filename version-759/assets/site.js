(function () {
    function normalize(value) {
        return (value || "").toString().toLowerCase().trim();
    }

    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");

    if (toggle && panel) {
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, idx) {
                slide.classList.toggle("is-active", idx === current);
            });
            dots.forEach(function (dot, idx) {
                dot.classList.toggle("is-active", idx === current);
            });
        }

        function startTimer() {
            if (timer) {
                clearInterval(timer);
            }
            timer = setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        dots.forEach(function (dot, idx) {
            dot.addEventListener("click", function () {
                showSlide(idx);
                startTimer();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        showSlide(0);
        startTimer();
    }

    function applyFilters(form) {
        var section = form.closest("section") || document;
        var cards = Array.prototype.slice.call(section.querySelectorAll(".movie-card"));
        if (!cards.length) {
            cards = Array.prototype.slice.call(document.querySelectorAll(".movie-card"));
        }
        var keywordInput = form.querySelector("[data-filter-keyword]");
        var typeInput = form.querySelector("[data-filter-type]");
        var yearInput = form.querySelector("[data-filter-year]");
        var keyword = normalize(keywordInput && keywordInput.value);
        var type = normalize(typeInput && typeInput.value);
        var year = normalize(yearInput && yearInput.value);

        cards.forEach(function (card) {
            var haystack = normalize([
                card.dataset.title,
                card.dataset.region,
                card.dataset.type,
                card.dataset.year,
                card.dataset.tags,
                card.textContent
            ].join(" "));
            var matchedKeyword = !keyword || haystack.indexOf(keyword) !== -1;
            var matchedType = !type || normalize(card.dataset.type + " " + card.dataset.tags).indexOf(type) !== -1;
            var matchedYear = !year || normalize(card.dataset.year).indexOf(year) === 0;
            card.classList.toggle("is-hidden", !(matchedKeyword && matchedType && matchedYear));
        });
    }

    Array.prototype.slice.call(document.querySelectorAll("[data-filter-form]")).forEach(function (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            applyFilters(form);
        });
        Array.prototype.slice.call(form.querySelectorAll("input, select")).forEach(function (field) {
            field.addEventListener("input", function () {
                applyFilters(form);
            });
            field.addEventListener("change", function () {
                applyFilters(form);
            });
        });

        var params = new URLSearchParams(window.location.search);
        var q = params.get("q");
        var keywordInput = form.querySelector("[data-filter-keyword]");
        if (q && keywordInput) {
            keywordInput.value = q;
            applyFilters(form);
        }
    });
})();
