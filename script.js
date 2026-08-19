const gate = document.querySelector('.entry-gate');
const enterControls = document.querySelectorAll('.intro-cat, .enter-button');
const cursor = document.querySelector('.cursor-orbit');
const progress = document.querySelector('.scroll-progress span');
const topbar = document.querySelector('.topbar');
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const floats = [...document.querySelectorAll('[data-float]')];
let pointer = { x: .5, y: .5 };
let ticking = false;

function enterSite() {
  if (!gate || gate.classList.contains('is-leaving')) return;
  gate.classList.add('is-leaving');
  document.body.classList.remove('is-entering');
  window.setTimeout(() => gate.setAttribute('aria-hidden', 'true'), 1100);
}

if (reduced) enterSite();
else {
  enterControls.forEach((control) => control.addEventListener('click', enterSite));
  window.setTimeout(enterSite, 3600);
}

function paintMotion() {
  ticking = false;
  const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const scroll = scrollY;
  const ratio = scroll / max;
  if (progress) progress.style.setProperty('--progress', ratio.toFixed(4));
  topbar?.classList.toggle('is-scrolled', scroll > 22);
  if (!reduced) {
    floats.forEach((node) => {
      const speed = Number(node.dataset.float || 0);
      const shift = Math.max(-70, Math.min(70, scroll * speed));
      node.style.setProperty('--scroll-shift', `${shift}px`);
      node.style.transform = `translate3d(0,var(--scroll-shift),0)`;
    });
  }
}
function requestPaint() { if (!ticking) { ticking = true; requestAnimationFrame(paintMotion); } }
addEventListener('scroll', requestPaint, { passive: true });
addEventListener('resize', requestPaint, { passive: true });
requestPaint();

addEventListener('pointermove', (event) => {
  pointer = { x: event.clientX / innerWidth, y: event.clientY / innerHeight };
  if (cursor && !reduced) cursor.style.transform = `translate3d(${event.clientX - 72}px,${event.clientY - 72}px,0)`;
}, { passive: true });

const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
  if (entry.isIntersecting) entry.target.classList.add('in');
}), { threshold: .12 });
document.querySelectorAll('.reveal').forEach((node) => observer.observe(node));

document.querySelectorAll('[data-split]').forEach((heading) => {
  [...heading.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) {
      const wrap = document.createElement('span');
      wrap.className = 'reveal-line';
      const inner = document.createElement('span');
      inner.textContent = node.textContent;
      wrap.append(inner); node.replaceWith(wrap);
    }
  });
});

if (!reduced) {
  document.querySelectorAll('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (event) => {
      const box = card.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      card.style.setProperty('--tilt-x', `${x * 13}px`);
      card.style.setProperty('--tilt-y', `${y * 13}px`);
    });
    card.addEventListener('pointerleave', () => { card.style.setProperty('--tilt-x', '0px'); card.style.setProperty('--tilt-y', '0px'); });
  });
  document.querySelectorAll('.magnetic').forEach((node) => {
    node.addEventListener('pointermove', (event) => {
      const box = node.getBoundingClientRect();
      const x = (event.clientX - box.left) / box.width - .5;
      const y = (event.clientY - box.top) / box.height - .5;
      node.style.transform = `translate3d(${x * 7}px,${y * 7}px,0)`;
    });
    node.addEventListener('pointerleave', () => { node.style.transform = ''; });
  });
}
