/* ============================================================
   FIDELIS ACADEMY — Landing Page Interactions
   ============================================================ */

(function () {
  'use strict';

  var enterBtn     = document.getElementById('enter-btn');
  var landingUI    = document.getElementById('landing-ui');
  var landingHint  = document.getElementById('landing-hint');
  var arrivalScene = document.getElementById('arrival-scene');
  var colorBurst   = document.getElementById('color-burst');
  var footer       = document.getElementById('landing-footer');
  var bgVideo      = document.getElementById('bg-video');
  var bgPhoto      = document.getElementById('bg-photo');

  if (!enterBtn) return;

  /* ---- Show video if a source is provided, else use photo ---- */
  if (bgVideo) {
    var hasSrc = bgVideo.src && bgVideo.src !== window.location.href;
    var hasSrcEl = bgVideo.querySelector('source[src]');
    if (hasSrc || hasSrcEl) {
      bgVideo.style.display = 'block';
      if (bgPhoto) bgPhoto.style.display = 'none';
    }
  }

  /* ---- Enter button click — cinematic color-burst sequence ---- */
  enterBtn.addEventListener('click', function () {
    enterBtn.disabled = true;

    /* Step 1: hide UI */
    if (landingHint)  landingHint.classList.add('hidden');
    if (landingUI)    landingUI.classList.add('hidden');
    if (footer)       footer.classList.add('hidden');

    /* Step 2 (200ms): gold/white color burst flash */
    setTimeout(function () {
      if (colorBurst) {
        colorBurst.classList.add('flash');
        setTimeout(function () {
          colorBurst.classList.add('fade-out');
        }, 180);
      }
    }, 200);

    /* Step 3 (600ms): reveal arrival doors */
    setTimeout(function () {
      if (arrivalScene) arrivalScene.classList.add('visible');
    }, 600);
  });

}());
