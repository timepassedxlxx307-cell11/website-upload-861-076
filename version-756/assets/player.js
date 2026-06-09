(function () {
  var players = Array.prototype.slice.call(document.querySelectorAll('.js-player'));
  players.forEach(function (box) {
    var video = box.querySelector('video');
    var overlay = box.querySelector('.player-overlay');
    var stream = box.getAttribute('data-stream');
    var started = false;
    var hlsInstance = null;

    function playVideo() {
      if (!video || !stream) {
        return;
      }
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
      if (!started) {
        started = true;
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else if (window.Hls && window.Hls.isSupported()) {
          hlsInstance = new window.Hls({ enableWorker: true });
          hlsInstance.loadSource(stream);
          hlsInstance.attachMedia(video);
        } else {
          video.src = stream;
        }
      }
      var promise = video.play();
      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {});
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playVideo);
    }
    if (video) {
      video.addEventListener('click', function () {
        if (!started) {
          playVideo();
        }
      });
    }
    window.addEventListener('pagehide', function () {
      if (hlsInstance && typeof hlsInstance.destroy === 'function') {
        hlsInstance.destroy();
      }
    });
  });
})();
