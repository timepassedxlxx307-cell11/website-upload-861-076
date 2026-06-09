(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function normalize(value) {
        return (value || "").toString().trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav]");
        if (!toggle || !nav) {
            return;
        }
        toggle.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function setupSlider() {
        var slider = document.querySelector("[data-slider]");
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(slider.querySelectorAll("[data-slide]"));
        var index = 0;
        var timer;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === index);
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
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-slide")) || 0);
                start();
            });
        });

        slider.addEventListener("mouseenter", stop);
        slider.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupLocalFilters() {
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-card]"));
        if (!cards.length) {
            return;
        }
        var input = document.querySelector("[data-local-search]");
        var year = document.querySelector("[data-year-filter]");
        var region = document.querySelector("[data-region-filter]");

        function apply() {
            var query = normalize(input && input.value);
            var selectedYear = normalize(year && year.value);
            var selectedRegion = normalize(region && region.value);

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-genre")
                ].join(" "));
                var yearValue = normalize(card.getAttribute("data-year"));
                var regionValue = normalize(card.getAttribute("data-region"));
                var matched = true;

                if (query && haystack.indexOf(query) === -1) {
                    matched = false;
                }
                if (selectedYear && yearValue !== selectedYear) {
                    matched = false;
                }
                if (selectedRegion && regionValue !== selectedRegion) {
                    matched = false;
                }
                card.classList.toggle("is-hidden", !matched);
            });
        }

        [input, year, region].forEach(function (control) {
            if (control) {
                control.addEventListener("input", apply);
                control.addEventListener("change", apply);
            }
        });
        apply();
    }

    function createResultCard(movie) {
        var article = document.createElement("article");
        article.className = "movie-card";
        article.innerHTML = [
            '<a class="poster-link" href="' + movie.url + '">',
            '<img src="' + movie.cover + '" alt="' + escapeHtml(movie.title) + '" loading="lazy">',
            '<span class="poster-badge">' + escapeHtml(movie.type) + '</span>',
            '</a>',
            '<div class="card-body">',
            '<div class="movie-meta"><span>' + movie.year + '</span><span>' + escapeHtml(movie.region) + '</span></div>',
            '<h3><a href="' + movie.url + '">' + escapeHtml(movie.title) + '</a></h3>',
            '<p>' + escapeHtml(movie.description) + '</p>',
            '<div class="tag-row"><span>' + escapeHtml(movie.category) + '</span></div>',
            '</div>'
        ].join("");
        return article;
    }

    function escapeHtml(value) {
        return (value || "").toString()
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function setupSearchPage() {
        var results = document.querySelector("[data-search-results]");
        if (!results || !window.SEARCH_MOVIES) {
            return;
        }
        var title = document.querySelector("[data-search-title]");
        var input = document.querySelector("[data-search-input]");
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";
        if (input) {
            input.value = query;
        }

        function render(value) {
            var q = normalize(value);
            var source = window.SEARCH_MOVIES;
            var matched = q ? source.filter(function (movie) {
                return normalize([
                    movie.title,
                    movie.year,
                    movie.region,
                    movie.type,
                    movie.genre,
                    movie.category,
                    movie.description
                ].join(" ")).indexOf(q) !== -1;
            }) : source.slice(0, 48);

            results.innerHTML = "";
            if (title) {
                title.textContent = q ? "搜索结果" : "推荐内容";
            }
            if (!matched.length) {
                var empty = document.createElement("div");
                empty.className = "search-empty";
                empty.textContent = "没有找到匹配内容";
                results.appendChild(empty);
                return;
            }
            matched.slice(0, 120).forEach(function (movie) {
                results.appendChild(createResultCard(movie));
            });
        }

        if (input) {
            input.addEventListener("input", function () {
                render(input.value);
            });
        }
        render(query);
    }

    ready(function () {
        setupMenu();
        setupSlider();
        setupLocalFilters();
        setupSearchPage();
    });
})();
