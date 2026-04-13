/* ============================================================
   FIDELIS ACADEMY — Cinematic Gate Experience
   Disney-Quality Animation Sequence
   ============================================================ */

(function () {
  'use strict';

  var CFG = {
    stars:       85,
    fireflies:   24,
    parallaxMax: 18
  };

  var scene        = document.getElementById('scene');
  var enterBtn     = document.getElementById('enter-btn');
  var enterHint    = document.getElementById('enter-hint');
  var gate         = document.getElementById('gate');
  var arrivalScene = document.getElementById('arrival-scene');
  var titleOverlay = document.getElementById('title-overlay');
  var footer       = document.getElementById('landing-footer');
  var starsWrap    = document.getElementById('stars-container');
  var fireflyWrap  = document.getElementById('fireflies-container');

  if (!scene || !enterBtn || !gate) return;

  /* ---- Star Generation ---- */
  function spawnStars() {
    if (!starsWrap) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < CFG.stars; i++) {
      var s    = document.createElement('div');
      s.className = 'star';
      var size  = (Math.random() * 2.5 + 0.8).toFixed(1);
      var x     = (Math.random() * 100).toFixed(1);
      var y     = (Math.random() * 62).toFixed(1);
      var dur   = (Math.random() * 3 + 2).toFixed(2);
      var delay = (Math.random() * 5).toFixed(2);
      var minOp = (Math.random() * 0.2 + 0.1).toFixed(2);
      var maxOp = (Math.random() * 0.5 + 0.5).toFixed(2);
      s.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + '%;top:' + y + '%;--dur:' + dur + 's;--delay:-' + delay + 's;--min:' + minOp + ';--max:' + maxOp + ';';
      frag.appendChild(s);
    }
    starsWrap.appendChild(frag);
  }

  /* ---- Firefly Generation ---- */
  function spawnFireflies() {
    if (!fireflyWrap) return;
    var frag = document.createDocumentFragment();
    for (var i = 0; i < CFG.fireflies; i++) {
      var f     = document.createElement('div');
      f.className = 'firefly';
      var size  = (Math.random() * 3 + 2).toFixed(1);
      var x     = (Math.random() * 88 + 6).toFixed(1);
      var y     = (Math.random() * 40 + 35).toFixed(1);
      var dur   = (Math.random() * 8 + 7).toFixed(2);
      var delay = (Math.random() * 10).toFixed(2);
      var bdur  = (Math.random() * 1.4 + 1).toFixed(2);
      var bdel  = (Math.random() * 3).toFixed(2);
      var dx    = ((Math.random() - 0.5) * 80).toFixed(0);
      var dy    = -(Math.random() * 70 + 40).toFixed(0);
      var ex    = ((Math.random() - 0.5) * 40).toFixed(0);
      var ey    = -(Math.random() * 80 + 80).toFixed(0);
      f.style.cssText = 'width:' + size + 'px;height:' + size + 'px;left:' + x + '%;top:' + y + '%;--dur:' + dur + 's;--delay:-' + delay + 's;--bdur:' + bdur + 's;--bdelay:-' + bdel + 's;--dx:' + dx + 'px;--dy:' + dy + 'px;--ex:' + ex + 'px;--ey:' + ey + 'px;';
      frag.appendChild(f);
    }
    fireflyWrap.appendChild(frag);
  }

  /* ---- Mouse Parallax ---- */
  var targetX = 0, targetY = 0, curX = 0, curY = 0, rafId = null;
  var layers = Array.prototype.slice.call(document.querySelectorAll('.layer[data-depth]'));

  function onMouseMove(e) {
    var cx = window.innerWidth  / 2;
    var cy = window.innerHeight / 2;
    targetX = (e.clientX - cx) / cx;
    targetY = (e.clientY - cy) / cy;
  }

  function parallaxLoop() {
    curX += (targetX - curX) * 0.06;
    curY += (targetY - curY) * 0.06;
    for (var i = 0; i < layers.length; i++) {
      var depth = parseFloat(layers[i].dataset.depth) || 0;
      var ox = (curX * CFG.parallaxMax * depth).toFixed(2);
      var oy = (curY * CFG.parallaxMax * depth).toFixed(2);
      layers[i].style.transform = 'translate(' + ox + 'px,' + oy + 'px)';
    }
    rafId = requestAnimationFrame(parallaxLoop);
  }

  window.addEventListener('mousemove', onMouseMove, { passive: true });

  /* ---- Gate Opening Cinematic Sequence ---- */
  function openGate() {
    enterBtn.disabled = true;

    // 0 — latch glow burst
    var latch = document.getElementById('gate-latch');
    if (latch) {
      latch.style.boxShadow = '0 0 60px rgba(255,220,100,1),0 0 120px rgba(255,220,100,0.6)';
      latch.style.transition = 'box-shadow 0.25s ease,opacity 0.4s ease 0.2s';
    }

    // 200ms — gate swings
    setTimeout(function () { gate.classList.add('open'); }, 200);

    // 500ms — hide title overlay
    setTimeout(function () {
      enterBtn.classList.add('hidden');
      if (enterHint)    enterHint.classList.add('hidden');
      if (titleOverlay) titleOverlay.classList.add('hidden');
      if (footer)       footer.classList.add('hidden');
    }, 500);

    // 800ms — fog, driveway, tree cinematic zoom
    setTimeout(function () { scene.classList.add('gate-opened'); }, 800);

    // 2400ms — arrival doors fade in
    setTimeout(function () {
      if (arrivalScene) arrivalScene.classList.add('visible');
    }, 2400);

    // 2700ms — stop parallax
    setTimeout(function () {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener('mousemove', onMouseMove);
    }, 2700);
  }

  /* ---- Init ---- */
  function init() {
    spawnStars();
    spawnFireflies();
    parallaxLoop();
    enterBtn.addEventListener('click', openGate);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());
