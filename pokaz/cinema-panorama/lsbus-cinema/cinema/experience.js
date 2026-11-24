(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
// Reveal complete lines, rather than scattering individual characters.
if(!reduce&&'IntersectionObserver'in window){
  $$('.reveal-lines').forEach(el=>{[...el.children].forEach(line=>{const content=document.createElement('b');while(line.firstChild)content.append(line.firstChild);line.append(content);});});
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');reveal.unobserve(entry.target);}}),{threshold:.2});
  $$('.reveal-lines').forEach(el=>reveal.observe(el));document.documentElement.classList.add('motion-ready');
}
// Keep the original editorial gallery's three speeds and opposing directions.
const cabin = $('.cabin-grid');
const cabinColumns = cabin ? [...cabin.querySelectorAll('[data-speed]')] : [];
function drawCabin() {
  const {top, bottom, height} = cabin.getBoundingClientRect();
  if (top >= innerHeight || bottom <= 0) return;
  const progress = (innerHeight - top) / (height + innerHeight);
  cabinColumns.forEach(column => {
    const shift = Number(column.dataset.speed) * (progress - .5);
    column.style.transform = `translate3d(0,${shift}%,0)`;
  });
}

const shortScreen = matchMedia('(max-height: 640px)');
const clamp = (value, max) => Math.max(0, Math.min(value, max));

function bindSequence(sequence) {
  const stage = sequence.querySelector('.sequence-stage');
  const strip = sequence.querySelector('.program-strip');
  const buttons = [...sequence.querySelectorAll(strip ? '.program-frame' : '[data-showroom]')];
  const controls = [...sequence.querySelectorAll('[data-strip-index]')];
  let current = -1;
  let position = null;
  let lastFrame = 0;

  const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 0;
  const travel = () => sequence.offsetHeight - stage.offsetHeight;
  const isPinned = () => sequence.classList.contains('is-scroll-driven');
  const cardOffset = index => strip
    ? clamp(buttons[index].offsetLeft - buttons[0].offsetLeft, strip.scrollWidth - strip.clientWidth)
    : 0;

  function select(index) {
    if (index === current) return;
    current = index;
    buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    controls.forEach((button, i) => button.setAttribute('aria-pressed', String(i === index)));
    sequence.dispatchEvent(new CustomEvent('cinema:select', {detail: buttons[index]}));
  }

  function draw(now) {
    if (!isPinned()) return false;
    const distance = travel();
    if (distance <= 0) return false;
    const top = sequence.getBoundingClientRect().top;
    const target = clamp((stickyTop() - top) / distance, 1) * (buttons.length - 1);
    if (!strip) {
      select(Math.round(target));
      return false;
    }
    // Follow the native page scroll with a short ease, including on trackpads.
    const elapsed = Math.min(80, now - lastFrame);
    lastFrame = now;
    const offscreen = top >= innerHeight || top + sequence.offsetHeight <= 0;
    if (position === null || offscreen || Math.abs(target - position) < .002) {
      position = target;
    } else {
      position += (target - position) * (1 - Math.exp(-elapsed / 65));
    }
    const lower = Math.floor(position);
    const offset = cardOffset(lower);
    const next = cardOffset(Math.min(lower + 1, buttons.length - 1));
    strip.scrollLeft = offset + (next - offset) * (position - lower);
    select(Math.round(position));
    return position !== target;
  }

  function goTo(index, behavior = 'smooth') {
    index = clamp(index, buttons.length - 1);
    if (!isPinned()) {
      if (strip) strip.scrollTo({left: cardOffset(index), behavior: 'instant'});
      select(index);
      return;
    }
    const top = sequence.getBoundingClientRect().top + scrollY - stickyTop();
    window.scrollTo({top: top + travel() * index / (buttons.length - 1), behavior});
  }

  function updateLayout() {
    const pinned = !reduce && !shortScreen.matches;
    if (pinned === isPinned()) return;
    sequence.classList.toggle('is-scroll-driven', pinned);
    position = null;
    if (!pinned && strip) strip.scrollLeft = cardOffset(Math.max(current, 0));
  }
  sequence.style.setProperty('--sequence-steps', buttons.length - 1);
  shortScreen.addEventListener('change', updateLayout);
  updateLayout();
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => goTo(index));
    if (strip) button.addEventListener('focus', () => {
      if (button.matches(':focus-visible') && isPinned()) goTo(index, 'instant');
    });
  });
  controls.forEach((button, index) => button.addEventListener('click', () => goTo(index)));
  strip?.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  strip?.addEventListener('scroll', () => {
    if (isPinned()) return;
    const closest = buttons.reduce((index, _, i) =>
      Math.abs(cardOffset(i) - strip.scrollLeft) < Math.abs(cardOffset(index) - strip.scrollLeft) ? i : index, 0);
    select(closest);
  }, {passive: true});
  select(0);
  return draw;
}

const sequenceUpdates = $$('[data-sequence]').map(bindSequence);
if (!reduce) {
  let scheduled = false;
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(draw);
    }
  };
  function draw(now) {
    scheduled = false;
    if (cabin) drawCabin();
    const unsettled = sequenceUpdates.map(update => update(now)).some(Boolean);
    if (unsettled) schedule();
  }
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(document.body);
  schedule();
}
})();
