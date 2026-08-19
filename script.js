const gate = document.querySelector('.entry-gate');
const enterControls = document.querySelectorAll('.intro-cat, .enter-button');
const cursor = document.querySelector('.cursor-orbit');
const progress = document.querySelector('.scroll-progress span');
const topbar = document.querySelector('.topbar');
const blancaGuide = document.querySelector('.blanca-guide');
const blancaSpeech = document.querySelector('.blanca-guide__speech');
const blancaZones = [...document.querySelectorAll('[data-blanca-zone]')];
const blancaCameos = [...document.querySelectorAll('[data-blanca-cameo]')];
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const floats = [...document.querySelectorAll('[data-float]')];
const blancaStations = [
  { id: 'inicio', selector: '#inicio', x: 84, y: 74, facing: -1, note: 'Aquí empieza la libreta de Emy: imágenes que se quedan mirando.' },
  { id: 'manifesto', selector: '.manifesto', x: 13, y: 72, facing: 1, note: 'Una idea comienza cuando le hacemos un lugar.' },
  { id: 'obra', selector: '#obra', x: 83, y: 68, facing: -1, note: 'Voy caminando entre las imágenes para mirar sus detalles contigo.' },
  { id: 'mapping', selector: '#mapping', x: 12, y: 64, facing: 1, note: 'Aquí salto cerca de la luz: la imagen también puede ocupar el espacio.' },
  { id: 'archivo', selector: '#archivo', x: 82, y: 72, facing: -1, note: 'Bajo despacito al archivo para cuidar estas notas.' },
  { id: 'materialidades', selector: '#materialidades', x: 14, y: 70, facing: 1, note: 'Sigo el hilo: el material también sabe guiar el camino.' },
  { id: 'casos', selector: '#casos', x: 83, y: 65, facing: -1, note: 'La creatividad de Emy también camina hacia otras comunidades.' },
  { id: 'libreta', selector: '#libreta', x: 16, y: 72, facing: 1, note: 'Y aquí seguimos: una libreta nunca se queda quieta.' }
].map((station) => ({ ...station, node: document.querySelector(station.selector) })).filter((station) => station.node);
let pointer = { x: .5, y: .5 };
let ticking = false;
let blancaTalking = false;
let activeStation = -1;
let previousScroll = window.scrollY;
let walkTimer;
let jumpTimer;

function wakeBlanca() {
  document.body.classList.add('blanca-awake');
  blancaGuide?.setAttribute('aria-expanded', 'false');
  requestPaint();
}

function enterSite() {
  if (!gate || gate.classList.contains('is-leaving')) return;
  gate.classList.add('is-leaving');
  document.body.classList.remove('is-entering');
  window.setTimeout(() => { gate.setAttribute('aria-hidden', 'true'); wakeBlanca(); }, 920);
}

if (reduced) { enterSite(); wakeBlanca(); }
else {
  enterControls.forEach((control) => control.addEventListener('click', enterSite));
  window.setTimeout(enterSite, 3600);
}

function setBlancaStation(nextIndex) {
  if (!blancaGuide || nextIndex === activeStation || !blancaStations[nextIndex]) return;
  activeStation = nextIndex;
  const station = blancaStations[nextIndex];
  blancaGuide.dataset.station = station.id;
  blancaGuide.style.setProperty('--blanca-x', `${station.x}vw`);
  blancaGuide.style.setProperty('--blanca-y', `${station.y}vh`);
  blancaGuide.style.setProperty('--blanca-facing', station.facing);
  if (blancaSpeech && !blancaTalking) blancaSpeech.textContent = station.note;
  if (reduced) return;
  blancaGuide.classList.remove('is-jumping');
  void blancaGuide.offsetWidth;
  blancaGuide.classList.add('is-jumping');
  window.clearTimeout(jumpTimer);
  jumpTimer = window.setTimeout(() => blancaGuide.classList.remove('is-jumping'), 760);
}

function resolveBlancaStation() {
  if (!blancaStations.length) return;
  const anchor = innerHeight * .48;
  let nextIndex = 0;
  let nearest = Number.POSITIVE_INFINITY;
  blancaStations.forEach((station, index) => {
    const rect = station.node.getBoundingClientRect();
    const distance = Math.abs((rect.top + Math.min(rect.height * .38, innerHeight * .42)) - anchor);
    if (distance < nearest) { nearest = distance; nextIndex = index; }
  });
  setBlancaStation(nextIndex);
}

function signalBlancaWalk(delta) {
  if (!blancaGuide || reduced || Math.abs(delta) < 1.5) return;
  blancaGuide.classList.add('is-walking');
  blancaGuide.style.setProperty('--blanca-lean', `${Math.max(-1, Math.min(1, delta / 36))}`);
  window.clearTimeout(walkTimer);
  walkTimer = window.setTimeout(() => blancaGuide.classList.remove('is-walking'), 560);
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
    if (document.body.classList.contains('blanca-awake')) {
      signalBlancaWalk(scroll - previousScroll);
      resolveBlancaStation();
    }
  }
  previousScroll = scroll;
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

if (blancaGuide) {
  const blancaModel = blancaGuide.querySelector('.blanca-character');
  blancaCameos.forEach((cameo) => {
    const copy = blancaModel?.cloneNode(true);
    if (copy) { copy.setAttribute('aria-hidden', 'true'); cameo.prepend(copy); }
    cameo.addEventListener('click', () => {
      if (!blancaSpeech) return;
      blancaSpeech.textContent = cameo.dataset.blancaNote || 'Sigo las huellas de este archivo.';
      blancaGuide.classList.add('is-talking');
      blancaGuide.setAttribute('aria-expanded', 'true');
    });
  });
  blancaGuide.addEventListener('click', () => {
    blancaTalking = !blancaTalking;
    blancaGuide.classList.toggle('is-talking', blancaTalking);
    blancaGuide.setAttribute('aria-expanded', String(blancaTalking));
  });
  const blancaObserver = new IntersectionObserver((entries) => entries.forEach((entry) => {
    if (!entry.isIntersecting || !blancaSpeech || blancaTalking) return;
    blancaSpeech.textContent = entry.target.dataset.blancaNote || 'Sigo las huellas de este archivo.';
  }), { threshold: .48 });
  blancaZones.forEach((zone) => blancaObserver.observe(zone));
}

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
