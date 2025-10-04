// Landing page interactions
const landing = document.getElementById('landing');
const hintButton = document.getElementById('hint');

function startJoin() {
  // Prevent re-trigger
  if (landing.classList.contains('play')) return;
  landing.classList.add('play');

  // After pieces 'join', go to catalogue
  const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--join-duration'));
  setTimeout(() => {
    window.location.href = 'catalogue.html';
  }, duration + 600); // small cushion
}

landing.addEventListener('click', startJoin);
hintButton?.addEventListener('click', (e) => {
  e.stopPropagation();
  startJoin();
});
