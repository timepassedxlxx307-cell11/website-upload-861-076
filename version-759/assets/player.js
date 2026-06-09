(function () {
    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    ready(function () {
        var configNode = document.getElementById("movie-playback");
        var video = document.getElementById("movie-player");
        var starter = document.querySelector("[data-player-start]");

        if (!configNode || !video) {
            return;
        }

        var config = {};
        try {
            config = JSON.parse(configNode.textContent || "{}");
        } catch (error) {
            config = {};
        }

        var stream = config.src;
        var prepared = false;
        var hlsInstance = null;

        function prepare() {
            if (prepared || !stream) {
                return;
            }

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(stream);
                hlsInstance.attachMedia(video);
            } else {
                video.src = stream;
            }

            prepared = true;
        }

        function start() {
            prepare();
            if (starter) {
                starter.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (starter) {
            starter.addEventListener("click", start);
        }

        video.addEventListener("click", function () {
            if (!prepared) {
                start();
            }
        });

        video.addEventListener("play", function () {
            if (starter) {
                starter.classList.add("is-hidden");
            }
        });

        window.addEventListener("beforeunload", function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
