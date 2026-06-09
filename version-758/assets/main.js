(function () {
    function ready(fn) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", fn);
        } else {
            fn();
        }
    }

    function initMenu() {
        var toggle = document.querySelector(".menu-toggle");
        var panel = document.querySelector(".mobile-panel");
        if (!toggle || !panel) {
            return;
        }
        toggle.addEventListener("click", function () {
            panel.classList.toggle("is-open");
        });
    }

    function initHero() {
        var slides = Array.prototype.slice.call(document.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(document.querySelectorAll(".hero-dot"));
        if (!slides.length || !dots.length) {
            return;
        }
        var current = 0;
        var timer = null;
        function show(index) {
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("is-active", slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("is-active", dotIndex === current);
            });
        }
        function start() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                window.clearInterval(timer);
                show(index);
                start();
            });
        });
        start();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll("[data-filter-panel]"));
        panels.forEach(function (panel) {
            var scope = panel.parentElement;
            var list = scope ? scope.querySelector("[data-filter-list]") : null;
            if (!list) {
                return;
            }
            var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card, .rank-card"));
            var keyword = panel.querySelector("[data-filter-keyword]");
            var region = panel.querySelector("[data-filter-region]");
            var year = panel.querySelector("[data-filter-year]");
            var type = panel.querySelector("[data-filter-type]");
            function apply() {
                var q = (keyword && keyword.value ? keyword.value : "").trim().toLowerCase();
                var r = region && region.value ? region.value : "";
                var y = year && year.value ? year.value : "";
                var t = type && type.value ? type.value : "";
                cards.forEach(function (card) {
                    var text = [card.dataset.title, card.dataset.region, card.dataset.year, card.dataset.type, card.dataset.genre].join(" ").toLowerCase();
                    var ok = true;
                    if (q && text.indexOf(q) === -1) {
                        ok = false;
                    }
                    if (r && card.dataset.region !== r) {
                        ok = false;
                    }
                    if (y && card.dataset.year !== y) {
                        ok = false;
                    }
                    if (t && card.dataset.type !== t) {
                        ok = false;
                    }
                    card.classList.toggle("is-hidden", !ok);
                });
            }
            [keyword, region, year, type].forEach(function (control) {
                if (control) {
                    control.addEventListener("input", apply);
                    control.addEventListener("change", apply);
                }
            });
        });
    }

    function initPlayers() {
        var shells = Array.prototype.slice.call(document.querySelectorAll(".player-shell"));
        shells.forEach(function (shell) {
            var video = shell.querySelector("video");
            var overlay = shell.querySelector(".player-overlay");
            var src = shell.getAttribute("data-play-src");
            var hls = null;
            if (!video || !src) {
                return;
            }
            function attach() {
                if (video.dataset.ready === "1") {
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(src);
                    hls.attachMedia(video);
                } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = src;
                } else {
                    video.src = src;
                }
                video.dataset.ready = "1";
            }
            function play() {
                attach();
                shell.classList.add("is-playing");
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === "function") {
                    promise.catch(function () {});
                }
            }
            if (overlay) {
                overlay.addEventListener("click", play);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    play();
                }
            });
            video.addEventListener("play", function () {
                shell.classList.add("is-playing");
            });
            window.addEventListener("beforeunload", function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    }

    function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
            return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "\"": "&quot;",
                "'": "&#39;"
            }[char];
        });
    }

    function safeUrl(value) {
        return String(value || "").replace(/[^.\/\-a-zA-Z0-9]/g, "");
    }

    function cardTemplate(item) {
        var title = escapeHtml(item.title);
        var region = escapeHtml(item.region);
        var year = escapeHtml(item.year);
        var type = escapeHtml(item.type);
        var genre = escapeHtml(item.genre);
        var category = escapeHtml(item.category);
        var rating = escapeHtml(item.rating);
        var desc = escapeHtml(item.desc);
        var cover = safeUrl(item.cover);
        var url = safeUrl(item.url);
        return [
            '<article class="movie-card" data-title="' + title + '" data-region="' + region + '" data-year="' + year + '" data-type="' + type + '" data-genre="' + genre + '">',
            '    <a class="poster-link" href="' + url + '" aria-label="观看' + title + '">',
            '        <img src="' + cover + '" alt="' + title + '" loading="lazy">',
            '        <span class="poster-glow"></span>',
            '        <span class="play-badge">▶</span>',
            '    </a>',
            '    <div class="card-body">',
            '        <div class="card-badges">',
            '            <span>' + category + '</span>',
            '            <span>' + year + '</span>',
            '        </div>',
            '        <h3><a href="' + url + '">' + title + '</a></h3>',
            '        <p>' + desc + '</p>',
            '        <div class="card-meta">',
            '            <span>评分 ' + rating + '</span>',
            '            <span>' + region + '</span>',
            '        </div>',
            '    </div>',
            '</article>'
        ].join('');
    }

    function initSearchPage() {
        var results = document.getElementById("searchResults");
        var input = document.getElementById("searchInput");
        var title = document.getElementById("searchTitle");
        if (!results || !window.MOVIE_SEARCH_DATA) {
            return;
        }
        var params = new URLSearchParams(window.location.search);
        var q = (params.get("q") || "").trim();
        if (input) {
            input.value = q;
        }
        if (!q) {
            return;
        }
        var lower = q.toLowerCase();
        var found = window.MOVIE_SEARCH_DATA.filter(function (item) {
            return [item.title, item.region, item.type, item.year, item.genre, item.category, item.tags].join(" ").toLowerCase().indexOf(lower) !== -1;
        }).slice(0, 240);
        if (title) {
            title.textContent = '“' + q + '”的搜索结果';
        }
        results.innerHTML = found.length ? found.map(cardTemplate).join('') : '<div class="content-panel"><h2>暂无匹配内容</h2><p>可以换一个剧名、地区、年份或题材继续搜索。</p></div>';
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
        initSearchPage();
    });
})();
