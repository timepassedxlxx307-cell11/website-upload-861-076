import { H as Hls } from './video-player.js';

function initPlayer(root) {
  var video = root.querySelector('video');
  var button = root.querySelector('[data-play-button]');
  var cover = root.querySelector('.player-cover');
  var config = root.querySelector('.player-config');
  var source = '';
  var loaded = false;
  var hls = null;

  if (!video || !config) {
    return;
  }

  try {
    source = JSON.parse(config.textContent).src;
  } catch (error) {
    source = '';
  }

  function loadSource() {
    if (!source || loaded) {
      return;
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
    } else if (Hls && Hls.isSupported()) {
      hls = new Hls({ enableWorker: true, lowLatencyMode: true });
      hls.loadSource(source);
      hls.attachMedia(video);
    } else {
      video.src = source;
    }

    loaded = true;
  }

  function start() {
    loadSource();
    root.classList.add('is-ready');
    video.play().then(function () {
      root.classList.add('is-playing');
    }).catch(function () {});
  }

  if (button) {
    button.addEventListener('click', function (event) {
      event.preventDefault();
      event.stopPropagation();
      start();
    });
  }

  if (cover) {
    cover.addEventListener('click', function () {
      start();
    });
  }

  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  video.addEventListener('play', function () {
    root.classList.add('is-playing');
  });

  video.addEventListener('pause', function () {
    root.classList.remove('is-playing');
  });

  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
}

document.addEventListener('DOMContentLoaded', function () {
  Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
});
