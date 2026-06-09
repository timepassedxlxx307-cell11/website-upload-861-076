(function () {
    var form = document.querySelector('.search-page-form');
    var input = document.getElementById('site-search-input');
    var results = document.getElementById('search-results');
    var items = [];

    function escapeHtml(value) {
        return String(value || '').replace(/[&<>"]/g, function (char) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;'
            }[char];
        });
    }

    function card(item) {
        var tagHtml = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '<article class="movie-card">' +
            '<a class="movie-card-link" href="' + escapeHtml(item.url) + '">' +
                '<span class="cover-frame">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="card-badge">' + escapeHtml(item.type || '影片') + '</span>' +
                '</span>' +
                '<span class="movie-card-body">' +
                    '<strong>' + escapeHtml(item.title) + '</strong>' +
                    '<em>' + escapeHtml([item.year, item.region, item.type].filter(Boolean).join(' · ')) + '</em>' +
                    '<span class="movie-tags">' + tagHtml + '</span>' +
                    '<small>' + escapeHtml(item.oneLine || item.genre || '') + '</small>' +
                '</span>' +
            '</a>' +
        '</article>';
    }

    function render(query) {
        if (!results) {
            return;
        }

        var keyword = (query || '').trim().toLowerCase();
        if (!keyword) {
            results.innerHTML = '<div class="no-results">请输入关键词开始搜索</div>';
            return;
        }

        var matched = items.filter(function (item) {
            return [
                item.title,
                item.region,
                item.type,
                item.year,
                item.genre,
                (item.tags || []).join(' '),
                item.oneLine
            ].join(' ').toLowerCase().indexOf(keyword) !== -1;
        }).slice(0, 120);

        if (!matched.length) {
            results.innerHTML = '<div class="no-results">没有找到相关影片</div>';
            return;
        }

        results.innerHTML = matched.map(card).join('');
        results.querySelectorAll('.cover-frame img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.classList.add('image-missing');
            }, { once: true });
        });
    }

    function initialQuery() {
        var params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }

    fetch('assets/movies.json')
        .then(function (response) {
            return response.json();
        })
        .then(function (data) {
            items = data;
            var query = initialQuery();
            if (input) {
                input.value = query;
            }
            render(query);
        });

    if (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            render(input ? input.value : '');
        });
    }
})();
