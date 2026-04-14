/* ============================================================
   FIDELIS ACADEMY — Gate Opening Sequence
   ============================================================ */

(function () {
  'use strict';

  var enterBtn      = document.getElementById('enter-btn');
  var landingUI     = document.getElementById('landing-ui');
  var landingHint   = document.getElementById('landing-hint');
  var arrivalScene  = document.getElementById('arrival-scene');
  var colorBurst    = document.getElementById('color-burst');
  var footer        = document.getElementById('landing-footer');
  var bgVideo       = document.getElementById('bg-video');
  var bgPhoto       = document.getElementById('bg-photo');
  var gateLeft      = document.getElementById('gate-left');
  var gateRight     = document.getElementById('gate-right');
  var gateContainer = document.getElementById('gate-container');

  if (!enterBtn) return;

  /* ---- Show video if a source is provided, else use photo ---- */
  if (bgVideo) {
    var hasSrc   = bgVideo.src && bgVideo.src !== window.location.href;
    var hasSrcEl = bgVideo.querySelector('source[src]');
    if (hasSrc || hasSrcEl) {
      bgVideo.style.display = 'block';
      if (bgPhoto) bgPhoto.style.display = 'none';
    }
  }

  /* ---- Enter button — cinematic gate-opening sequence ---- */
  enterBtn.addEventListener('click', function () {
    enterBtn.disabled = true;

    /* Step 1: hide landing UI */
    if (landingHint) landingHint.classList.add('hidden');
    if (landingUI)   landingUI.classList.add('hidden');
    if (footer)      footer.classList.add('hidden');

    /* Step 2 (100ms): swing the gate open */
    setTimeout(function () {
      if (gateLeft)  gateLeft.classList.add('open');
      if (gateRight) gateRight.classList.add('open');
    }, 100);

    /* Step 3 (900ms): gold color burst flash */
    setTimeout(function () {
      if (colorBurst) {
        colorBurst.classList.add('flash');
        setTimeout(function () {
          colorBurst.classList.add('fade-out');
        }, 180);
      }
    }, 900);

    /* Step 4 (1500ms): hide gate, reveal arrival doors */
    setTimeout(function () {
      if (gateContainer) gateContainer.classList.add('hidden');
      if (arrivalScene)  arrivalScene.classList.add('visible');
    }, 1500);
  });

}());
