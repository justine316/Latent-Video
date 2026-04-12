document.addEventListener('DOMContentLoaded', function () {
  const gate      = document.getElementById('gate');
  const doors     = document.getElementById('doors');
  const enterBtn  = document.getElementById('enter-btn');
  const enterHint = document.querySelector('.enter-hint');

  if (!gate || !doors || !enterBtn) return;

  enterBtn.addEventListener('click', openGate);

  function openGate() {
    enterBtn.disabled = true;
    gate.classList.add('open');
    enterBtn.classList.add('hidden');
    if (enterHint) enterHint.classList.add('hidden');
    setTimeout(function () {
      doors.classList.add('visible');
    }, 800);
  }
});
