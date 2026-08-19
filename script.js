const gate = document.querySelector('.entry-gate');
const enterControls = document.querySelectorAll('.intro-cat, .enter-button');
const cursor = document.querySelector('.cursor-orbit');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function enterSite() {
  if (!gate || gate.classList.contains('is-leaving')) return;
  gate.classList.add('is-leaving');
  document.body.classList.remove('is-entering');
  window.setTimeout(() => gate.setAttribute('aria-hidden', 'true'), 1100);
}

if (reduceMotion) enterSite();
else {
  enterControls.forEach((control) => control.addEventListener('click', enterSite));
  window.setTimeout(enterSite, 3200);
}

window.addEventListener('pointermove', (event) => {
  if (cursor) cursor.style.transform = `translate3d(${event.clientX - 72}px,${event.clientY - 72}px,0)`;
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

document.querySelectorAll('[data-tilt]').forEach((card) => {
  card.addEventListener('pointermove', (event) => {
    const box = card.getBoundingClientRect();
    const x = (event.clientX - box.left) / box.width - .5;
    const y = (event.clientY - box.top) / box.height - .5;
    card.style.transform = `rotate(${4 + x * 5}deg) translate3d(${x * 10}px,${y * 10}px,0)`;
  });
  card.addEventListener('pointerleave', () => card.style.transform = 'rotate(4deg)');
});
