(function(){
const L = window.LS, d = document, H = d.documentElement;
H.classList.remove('no-js');
const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g,' ') + ' ₽';
const img = id => `../img/${id}.jpg`;
const I = {
  arr:'<path d="M4 12h16M14 6l6 6-6 6"/>', left:'<path d="M20 12H4M10 6l-6 6 6 6"/>', x:'<path d="M6 6l12 12M18 6L6 18"/>',
  ac:'<path d="M12 2v20M3.5 7l17 10M3.5 17l17-10M9 3.5l3 2 3-2M9 20.5l3-2 3 2"/>', water:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',
  fridge:'<rect x="5" y="2.5" width="14" height="19" rx="1.5"/><path d="M5 10h14M9 6v1.5M9 13v3"/>', mic:'<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4"/>',
  guide:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>', wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>',
  usb:'<path d="M12 22V6M8 6l4-4 4 4M7 11v3l5 3M17 9v3l-5 3"/>', tv:'<rect x="2.5" y="5" width="19" height="13" rx="1"/><path d="M8 21h8M12 18v3"/>',
  leather:'<path d="M6 11V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5"/><path d="M4 11a2 2 0 0 1 4 0v3h8v-3a2 2 0 0 1 4 0v6H4zM6 17v3M18 17v3"/>',
  doc:'<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/>',
  shield:'<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z"/><path d="M8.5 12l2.5 2.5 4.5-5"/>',
  pct:'<path d="M19 5L5 19"/><circle cx="7" cy="7" r="2.5"/><circle cx="17" cy="17" r="2.5"/>', users:'<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.6a3.5 3.5 0 0 1 0 6.8M21.5 20a6.5 6.5 0 0 0-4-6"/>'
};
const ic = (n, s=18) => `<svg class="ic" width="${s}" height="${s}" viewBox="0 0 24 24" aria-hidden="true">${I[n]||''}</svg>`;
Object.assign(window, {rub, imgp: img, ic});

const nav = [['Автопарк','index.html#park'],['Услуги','index.html#uslugi'],['Тарифы','index.html#tarify'],['О компании','index.html#o-kompanii'],['Контакты','index.html#kontakty']];
d.body.insertAdjacentHTML('afterbegin', `<div class="pl"><div class="t"><span class="logo"><b>LS</b>bus</span><span class="lbl">Санкт-Петербург</span></div><div class="c">000</div><i class="ln2"></i></div><div class="curt"><span class="logo" style="font-size:26px"><b>LS</b>bus</span></div><div class="cd"></div><div class="cr"><span></span></div>`);
d.body.insertAdjacentHTML('afterbegin', `
<header class="hd"><div class="wrap">
  <a href="index.html" class="logo" aria-label="LSBUS"><b>LS</b>bus</a>
  <nav>${nav.map(([t,h])=>`<a href="${h}">${t}</a>`).join('')}</nav>
  <div class="r"><div class="tel"><a href="${L.phoneHref}">${L.phone}</a><small>Круглосуточно</small></div><a class="btn" href="#" data-order>Заказать ${ic('arr')}</a><button class="burger" aria-label="Меню"><i></i><i></i></button></div>
</div></header>
<div class="mm">${nav.map(([t,h])=>`<a class="i" href="${h}">${t}${ic('arr')}</a>`).join('')}
  <div class="b"><a class="btn line" href="${L.phoneHref}">${L.phone} ${ic('arr')}</a><a class="btn" href="#" data-order>Заказать ${ic('arr')}</a></div></div>`);
d.body.insertAdjacentHTML('beforeend', `
<footer class="ft"><div class="wrap">
  <div class="cols">
    <div><a href="index.html" class="logo"><b>LS</b>bus</a><p style="margin-top:18px;color:var(--k2);max-width:320px">ООО «Логистик Систем». Аренда автобусов и микроавтобусов с водителем в Санкт-Петербурге и Ленинградской области.</p></div>
    <div><h5>Разделы</h5><ul>${nav.map(([t,h])=>`<li><a href="${h}">${t}</a></li>`).join('')}</ul></div>
    <div><h5>Услуги</h5><ul>${L.services.map(s=>`<li><a href="index.html#uslugi">${s.name}</a></li>`).join('')}</ul></div>
    <div><h5>Связь</h5><ul><li><a href="${L.phoneHref}">${L.phone}</a></li><li><a href="tel:+79959975080">${L.mobile}</a> · <a href="${L.wa}" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="mailto:${L.email}">${L.email}</a></li><li>${L.address}</li></ul></div>
  </div>
  <div class="bt"><span>© 2026 ООО «Логистик Систем»</span><span>Прототип KIRIW · фото и данные — lsbus.spb.ru</span></div>
</div></footer>
<div class="mbar"><a href="${L.phoneHref}">Позвонить</a><a href="${L.wa}" target="_blank" rel="noopener">WhatsApp</a><button class="o" data-order>Заказать</button></div>
<div class="md" role="dialog" aria-modal="true" aria-label="Заявка"><div class="bg"></div><div class="pn">
  <button class="x" type="button" aria-label="Закрыть">${ic('x')}</button>
  <span class="lbl">Заявка на перевозку</span><h3 class="h-l">Рассчитаем стоимость</h3><p class="sub">Оператор перезвонит, уточнит маршрут и назовёт точную сумму.</p>
  <div class="selc" hidden></div>
  <form class="fm" novalidate>
    <div class="fd w"><label>Транспорт</label><select name="car"><option value="">Подберите за меня</option>${L.fleet.map(c=>`<option value="${c.id}">${c.name} — ${c.seats} мест</option>`).join('')}</select></div>
    <div class="fd"><label>Дата</label><input type="date" name="date"></div>
    <div class="fd"><label>Пассажиров</label><input type="number" min="1" name="pax" placeholder="20"></div>
    <div class="fd w"><label>Маршрут</label><input name="route" placeholder="Откуда — куда"></div>
    <div class="fd"><label>Имя</label><input name="name" placeholder="Как к вам обращаться"></div>
    <div class="fd tel"><label>Телефон</label><input type="tel" name="phone" placeholder="+7"></div>
    <div class="sb"><p>Прототип: заявка не отправляется. В рабочей версии — оператору, туда же, где ведутся заказы.</p><button class="btn" type="submit">Отправить ${ic('arr')}</button></div>
    <p class="ok">Заявка принята. Оператор перезвонит в ближайшее время.</p>
  </form>
</div></div>`);

/* header behaviour */
const hd = d.querySelector('.hd'), mbar = d.querySelector('.mbar'); let lastY = 0;
const onScroll = y => { hd.classList.toggle('sh', y > 10); hd.classList.toggle('hide', y > lastY && y > 300 && !H.classList.contains('menu-open')); lastY = y; mbar.classList.toggle('on', y > 500); rv(); };
d.querySelector('.burger').onclick = () => H.classList.toggle('menu-open');

/* modal */
const md = d.querySelector('.md'), sel = md.querySelector('select[name=car]'), sc = md.querySelector('.selc');
const setCar = id => { sel.value = id || ''; const c = L.fleet.find(x=>x.id===sel.value); sc.hidden = !c;
  if (c) sc.innerHTML = `<img src="${img(c.photos[0])}" alt=""><div><b>${c.name}</b><span>${c.seats} мест · от ${rub(c.price)} в час</span></div>`; };
window.openOrder = (id, extra={}) => { md.querySelector('form').classList.remove('done'); setCar(id);
  Object.entries(extra).forEach(([k,v]) => { const f = md.querySelector(`[name=${k}]`); if (f) f.value = v; });
  md.classList.add('open'); H.classList.remove('menu-open'); lenis && lenis.stop(); };
const close = () => { md.classList.remove('open'); lenis && lenis.start(); };
sel.onchange = () => setCar(sel.value);
d.addEventListener('click', e => {
  const o = e.target.closest('[data-order]'); if (o) { e.preventDefault(); openOrder(o.dataset.order || ''); }
  if (e.target.closest('.md .x, .md .bg')) close();
  if (e.target.closest('.mm a.i')) H.classList.remove('menu-open');
});
d.addEventListener('keydown', e => { if (e.key === 'Escape') { close(); H.classList.remove('menu-open'); } });
d.addEventListener('submit', e => { const f = e.target; if (!f.classList.contains('fm')) return; e.preventDefault();
  const p = f.querySelector('[name=phone]'); if (p && p.value.replace(/\D/g,'').length < 11) { p.closest('.fd').classList.add('err'); p.focus(); return; }
  f.classList.add('done'); });
d.addEventListener('input', e => { if (e.target.type !== 'tel') return; e.target.closest('.fd') && e.target.closest('.fd').classList.remove('err');
  let v = e.target.value.replace(/\D/g,''); if (v[0]==='8') v='7'+v.slice(1); if (v && v[0]!=='7') v='7'+v; v=v.slice(0,11);
  const m=[v.slice(1,4),v.slice(4,7),v.slice(7,9),v.slice(9,11)];
  e.target.value = v ? '+7' + (m[0]?' ('+m[0]:'') + (m[0].length===3?') ':'') + m[1] + (m[2]?'-'+m[2]:'') + (m[3]?'-'+m[3]:'') : ''; });

/* smooth scroll (gentle) */
let lenis = null;
if (window.Lenis && !matchMedia('(prefers-reduced-motion:reduce)').matches) {
  lenis = new Lenis({duration:1.05, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t))});
  if (window.gsap && window.ScrollTrigger) { gsap.registerPlugin(ScrollTrigger); lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t => lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0); }
  else (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
  lenis.on('scroll', e => onScroll(e.scroll));
} else addEventListener('scroll', () => onScroll(scrollY), {passive:true});
window.LENIS = lenis;
d.addEventListener('click', e => { const a = e.target.closest('a[href*="#"]'); if (!a) return;
  const h = a.getAttribute('href'), hash = h.slice(h.indexOf('#')); if (hash.length < 2) return;
  if (h.startsWith('index.html') && d.body.dataset.page !== 'home') return;
  const t = d.querySelector(hash); if (!t) return; e.preventDefault(); H.classList.remove('menu-open');
  lenis ? lenis.scrollTo(t, {offset:-80, duration:1.4}) : t.scrollIntoView({behavior:'smooth'}); });

/* reveals: robust scroll check */
let q = 0;
function rv(){ if (q) return; q = requestAnimationFrame(() => { q = 0; const h = innerHeight * .9;
  d.querySelectorAll('.rv:not(.in), .wipe:not(.in)').forEach(el => { if (el.getBoundingClientRect().top < h) el.classList.add('in'); }); }); }
window.rv = rv;
addEventListener('resize', rv); addEventListener('load', rv); setTimeout(rv, 60);

/* parallax for [data-par] */
const par = () => { d.querySelectorAll('[data-par]').forEach(el => { const r = el.parentElement.getBoundingClientRect(); const p = (r.top + r.height/2 - innerHeight/2) / innerHeight; el.style.transform = `translate3d(0,${p * -(+el.dataset.par)}%,0)`; }); requestAnimationFrame(par); };
requestAnimationFrame(par);

/* ===== cinematic layer ===== */
const G = window.gsap, ST = window.ScrollTrigger;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
/* cursor */
if (fine) { H.classList.add('custom-cursor'); const cd = d.querySelector('.cd'), cr = d.querySelector('.cr'); let x=-100,y=-100,rx=x,ry=y;
  addEventListener('mousemove', e => { x=e.clientX; y=e.clientY; cd.style.transform=`translate3d(${x}px,${y}px,0)`; }, {passive:true});
  (function loop(){ rx+=(x-rx)*.16; ry+=(y-ry)*.16; cr.style.transform=`translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); })();
  d.addEventListener('mouseover', e => { const t = e.target.closest('[data-cursor]'), a = e.target.closest('a,button,input,select');
    cr.classList.toggle('big', !!t); cr.querySelector('span').textContent = t ? t.dataset.cursor : ''; cr.classList.toggle('hov', !t && !!a); cd.style.opacity = t ? 0 : 1; }); }
/* magnetic */
if (fine && G) d.querySelectorAll('[data-mag]').forEach(el => { const k = +el.dataset.mag || .3;
  el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); G.to(el,{x:(e.clientX-r.left-r.width/2)*k, y:(e.clientY-r.top-r.height/2)*k, duration:.6, ease:'power3.out'}); });
  el.addEventListener('mouseleave', () => G.to(el,{x:0,y:0,duration:1,ease:'elastic.out(1,.45)'})); });
/* curtain transitions */
const curt = d.querySelector('.curt');
d.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a || a.target || e.metaKey || e.ctrlKey || e.defaultPrevented) return;
  const h = a.getAttribute('href'); if (!/\.html/.test(h) || (h.startsWith('index.html#') && d.body.dataset.page==='home')) return;
  e.preventDefault(); if (!G) { location.href = h; return; }
  G.fromTo(curt,{yPercent:100},{yPercent:0,duration:.75,ease:'expo.inOut',onComplete:()=>location.href=h}); });
addEventListener('pageshow', e => { if (e.persisted && G) G.set(curt,{yPercent:100}); });
/* odometer */
window.odo = (el, text) => {
  if (!el._init) { el.classList.add('od'); el._init = true; }
  const chars = String(text).split(''); const kids = [...el.children];
  if (kids.length !== chars.length || kids.some((k,i) => /\d/.test(chars[i]) !== k.classList.contains('d'))) {
    el.innerHTML = chars.map(ch => /\d/.test(ch) ? `<span class="d">${'0123456789'.split('').map(n=>`<i>${n}</i>`).join('')}</span>` : `<span class="x">${ch===' '?'&nbsp;':ch}</span>`).join('');
    void el.offsetHeight;
  }
  [...el.children].forEach((k,i) => { if (k.classList.contains('d')) k.style.transform = `translateY(${-(+chars[i])}em)`; });
};
/* word splitter */
window.splitWords = el => { const walk = n => [...n.childNodes].forEach(c => {
  if (c.nodeType===3) { const f = d.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s=d.createElement('span'); s.className='w'; s.textContent=w; f.append(s);} }); c.replaceWith(f); }
  else if (c.nodeType===1) walk(c); }); walk(el); return el.querySelectorAll('.w'); };
/* intro */
function intro(done){ const pl = d.querySelector('.pl'); let seen = false;
  try { seen = sessionStorage.getItem('lsw')==='1'; sessionStorage.setItem('lsw','1'); } catch(_){}
  if (!G) { pl.remove(); done(); return; }
  if (seen || d.body.dataset.page !== 'home') { pl.remove(); G.set(curt,{yPercent:0}); G.to(curt,{yPercent:-100,duration:.9,ease:'expo.inOut',delay:.05,onComplete:()=>G.set(curt,{yPercent:100})}); setTimeout(done,300); return; }
  lenis && lenis.stop(); scrollTo(0,0); const o={v:0}, c = pl.querySelector('.c'), ln = pl.querySelector('.ln2');
  G.timeline({onComplete:()=>{ G.to(pl,{yPercent:-100,duration:1.1,ease:'expo.inOut',onComplete:()=>{ pl.remove(); lenis && lenis.start(); }}); setTimeout(done,250); }})
   .to(o,{v:100,duration:1.6,ease:'power2.inOut',onUpdate:()=>{ c.textContent=String(Math.round(o.v)).padStart(3,'0'); ln.style.transform=`scaleX(${o.v/100})`; }}); }
/* generic reveals */
function reveals(){ if (!G) return;
  G.utils.toArray('.sl').forEach(el => G.fromTo(el.querySelectorAll('.ln>span'),{yPercent:105,y:0},{yPercent:0,y:0,duration:1.3,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:el,start:'top 88%'}}));
  G.utils.toArray('[data-words]').forEach(el => { const w = splitWords(el); G.to(w,{opacity:1,stagger:.05,ease:'none',scrollTrigger:{trigger:el,start:'top 78%',end:'bottom 45%',scrub:true}}); });
  G.utils.toArray('[data-odo]').forEach(el => { odo(el, el.dataset.odo.replace(/\d/g,'0')); ST.create({trigger:el,start:'top 92%',once:true,onEnter:()=>setTimeout(()=>odo(el, el.dataset.odo),80)}); });
  G.utils.toArray('[data-par]').forEach(el => G.fromTo(el,{yPercent:-(+el.dataset.par)},{yPercent:+el.dataset.par,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
}
window.LSApp = { ready(fn){ const go = () => intro(() => { reveals(); fn && fn(); G && ST.refresh(); }); d.fonts ? d.fonts.ready.then(go) : go(); } };
addEventListener('load', () => G && ST && ST.refresh());
})();
