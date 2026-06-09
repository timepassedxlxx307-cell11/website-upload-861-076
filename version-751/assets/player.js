(function () {
    window.initMoviePlayer = function (source) {
        var video = document.getElementById('movie-player');
        var cover = document.getElementById('play-cover');
        if (!video || !source) {
            return;
        }
        var started = false;
        var hls = null;

        function playVideo() {
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {});
            }
        }

        function begin() {
            if (cover) {
                cover.classList.add('is-hidden');
            }
            if (started) {
                playVideo();
                return;
            }
            started = true;

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
                playVideo();
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(source);
                hls.attachMedia(video);
                hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                    playVideo();
                });
                hls.on(window.Hls.Events.ERROR, function (event, data) {
                    if (!data || !data.fatal) {
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.NETWORK_ERROR) {
                        hls.startLoad();
                        return;
                    }
                    if (data.type === window.Hls.ErrorTypes.MEDIA_ERROR) {
                        hls.recoverMediaError();
                        return;
                    }
                    hls.destroy();
                });
                return;
            }

            video.src = source;
            playVideo();
        }

        if (cover) {
            cover.addEventListener('click', begin);
        }
        video.addEventListener('click', function () {
            if (!started) {
                begin();
            }
        });
        window.addEventListener('pagehide', function () {
            if (hls) {
                hls.destroy();
            }
        });
    };
})();
