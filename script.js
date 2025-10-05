// script.js
const landing = document.getElementById('landing');
const hintButton = document.getElementById('hint');

// The three moving elements (make sure these IDs exist in index.html)
const pieces = [
  document.getElementById('wall-top'),
  document.getElementById('wall-bottom'),
  document.getElementById('slab-right'),
];

function startJoin() {
  if (!landing || landing.classList.contains('play')) return; // prevent double start
  landing.classList.add('play');

  // duration from CSS var --join-duration (e.g. "4000ms" → 4000)
  const joinMs =
    parseFloat(
      getComputedStyle(document.documentElement)
        .getPropertyValue('--join-duration')
    ) || 3000;

  const HOLD_AFTER_JOIN = 1200; // keep the final picture visible a bit longer

  // Fallback redirect in case animationend doesn't fire for some reason
  const safety = setTimeout(() => {
    window.location.href = './intro.html';
  }, joinMs + HOLD_AFTER_JOIN + 200);

  // When all pieces finish, redirect (and cancel fallback)
  let finished = 0;
  const total = pieces.filter(Boolean).length;

  const done = () => {
    finished += 1;
    if (finished >= total) {
      clearTimeout(safety);
      setTimeout(() => (window.location.href = './intro.html'), HOLD_AFTER_JOIN);
    }
  };

  pieces.forEach(el => el && el.addEventListener('animationend', done, { once: true }));
}

landing?.addEventListener('click', startJoin);
hintButton?.addEventListener('click', (e) => { e.stopPropagation(); startJoin(); });
