(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
// Reveal complete lines, rather than scattering individual characters.
if(!reduce&&'IntersectionObserver'in window){
  $$('.reveal-lines').forEach(el=>{[...el.children].forEach(line=>{const content=document.createElement('b');while(line.firstChild)content.append(line.firstChild);line.append(content);});});
  const reveal=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('in-view');reveal.unobserve(entry.target);}}),{threshold:.2});
  $$('.reveal-lines').forEach(el=>reveal.observe(el));document.documentElement.classList.add('motion-ready');
  let pending=false;const update=()=>{pending=false;const hero=$('.hero');hero.style.setProperty('--hero-travel',String(Math.min(1,Math.max(0,scrollY/hero.offsetHeight))));};
  addEventListener('scroll',()=>{if(!pending){pending=true;requestAnimationFrame(update);}},{passive:true});update();
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

function bindSequence(sequence) {
  const stage = sequence.querySelector('.sequence-stage');
  const strip = sequence.querySelector('.program-strip');
  const counter = sequence.querySelector('#strip-counter');
  const buttons = [...sequence.querySelectorAll(strip ? '.program-frame' : '[data-showroom]')];
  const controls = [...sequence.querySelectorAll('[data-strip-step]')];
  let current = -1;
  const clamp = (value, max) => Math.max(0, Math.min(value, max));
  const stickyTop = () => parseFloat(getComputedStyle(stage).top) || 0;
  const travel = () => sequence.offsetHeight - stage.offsetHeight;
  const cardOffset = index => strip ? clamp(buttons[index].offsetLeft - buttons[0].offsetLeft,
    strip.scrollWidth - strip.clientWidth) : 0;

  function select(index) {
    if (index === current) return;
    current = index;
    sequence.dispatchEvent(new CustomEvent('cinema:select', {detail: buttons[index]}));
    if (counter) counter.textContent = [index + 1, buttons.length]
      .map(number => String(number).padStart(2, '0')).join(' / ');
    controls.forEach(button => {
      button.disabled = Number(button.dataset.stripStep) < 0 ? index === 0 : index === buttons.length - 1;
    });
  }

  function draw() {
    const distance = travel();
    if (reduce || distance <= 0) return;
    const progress = clamp((stickyTop() - sequence.getBoundingClientRect().top) / distance, 1);
    const step = progress * (buttons.length - 1);
    const lower = Math.floor(step);
    const offset = cardOffset(lower);
    if (strip) strip.scrollLeft = offset + (cardOffset(Math.min(lower + 1, buttons.length - 1)) - offset) * (step - lower);
    select(Math.round(step));
  }

  function goTo(index, behavior = 'smooth') {
    index = clamp(index, buttons.length - 1);
    if (reduce || travel() <= 0) {
      if (strip) strip.scrollLeft = cardOffset(index);
      select(index);
      return;
    }
    const top = sequence.getBoundingClientRect().top + scrollY - stickyTop();
    window.scrollTo({top: top + travel() * index / (buttons.length - 1), behavior});
  }

  if (!reduce) {
    sequence.style.setProperty('--sequence-steps', buttons.length - 1);
    sequence.classList.add('is-scroll-driven');
  }
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => goTo(index));
    button.addEventListener('focus', () => {
      // Tabbing to an offscreen card brings its scroll position into view.
      if (strip && button.matches(':focus-visible') && current !== index && !reduce) goTo(index, 'instant');
    });
  });
  controls.forEach(button => button.addEventListener('click', () => goTo(current + Number(button.dataset.stripStep))));
  strip?.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    event.preventDefault();
    goTo(current + (event.key === 'ArrowRight' ? 1 : -1));
  });
  if (reduce && strip) strip.addEventListener('scroll', () => {
    const index = buttons.reduce((closest, _, i) =>
      Math.abs(cardOffset(i) - strip.scrollLeft) < Math.abs(cardOffset(closest) - strip.scrollLeft) ? i : closest, 0);
    select(index);
  }, {passive: true});
  select(0);
  return draw;
}

const sequenceUpdates = $$('[data-sequence]').map(bindSequence);
if (!reduce) {
  let scheduled = false;
  const draw = () => {
    scheduled = false;
    if (cabin) drawCabin();
    sequenceUpdates.forEach(update => update());
  };
  const schedule = () => {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(draw);
    }
  };
  addEventListener('scroll', schedule, {passive: true});
  addEventListener('resize', schedule);
  new ResizeObserver(schedule).observe(document.body);
  draw();

  const fleetImage = $('#showroom-image');
  if (fleetImage) {
    let revision = 0;
    new MutationObserver(() => {
      const current = ++revision;
      fleetImage.decode().then(() => {
        if (current !== revision) return;
        fleetImage.animate(
          [{opacity: .48}, {opacity: 1}],
          {duration: 480, easing: 'cubic-bezier(.22,.68,.16,1)'}
        );
      }).catch(() => {});
    }).observe(fleetImage, {attributes: true, attributeFilter: ['src']});
  }
}
})();
