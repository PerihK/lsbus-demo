/* LSBUS prototype — shared shell + motion engine */
(function(){
const L = window.LS, d = document, H = d.documentElement;
const fine = matchMedia('(hover:hover) and (pointer:fine)').matches;
const reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
const rub = n => Math.round(n).toLocaleString('ru-RU').replace(/ |,/g,' ') + ' ₽';
const img = id => `../img/${id}.jpg`;
const arr = '<svg class="ar" viewBox="0 0 24 24"><path d="M5 19L19 5M8 5h11v11"/></svg>';
const arrR = '<svg class="ar" viewBox="0 0 24 24"><path d="M4 12h16M14 6l6 6-6 6"/></svg>';
const pill = (t, cls='', attrs='') => `<a class="pill ${cls}" ${attrs}><span class="t"><i>${t}</i><i>${t}</i></span></a>`;
Object.assign(window, {rub, imgp: img, ARR: arr, ARRR: arrR, PILL: pill});
const page = d.body.dataset.page;

/* ---------- shell ---------- */
const nav = [['Услуги','index.html#uslugi'],['Автопарк','index.html#park'],['Расчёт','index.html#raschet'],['О компании','index.html#o-nas'],['Контакты','#kontakty']];
d.body.insertAdjacentHTML('afterbegin', `
<div class="pre"><div class="top"><span class="logo"><b>LS</b><span>bus</span></span><span class="meta">Санкт-Петербург</span></div><div class="num">000</div><div class="bar"></div></div>
<div class="curtain"></div>
<header class="hd">
  <a href="index.html" class="logo" data-link aria-label="LSBUS — на главную"><b>LS</b><span>bus</span></a>
  <nav>${nav.map(([t,h])=>`<a href="${h}" data-link>${t}</a>`).join('')}</nav>
  <div class="r"><span class="tel"><a href="${L.phoneHref}">${L.phone}</a></span>${pill('Рассчитать поездку','','href="#" data-order')}<button class="menu-btn" aria-label="Меню"><span>Меню</span><i></i></button></div>
</header>
<div class="fm">${nav.map(([t,h],i)=>`<a class="big" href="${h}" data-link><span>${t}</span><sup>0${i+1}</sup></a>`).join('')}
  <div class="fm-b"><a href="${L.phoneHref}">${L.phone}</a><a href="${L.wa}" target="_blank" rel="noopener">WhatsApp</a><span>24/7</span></div></div>
<div class="cur"><span></span></div>`);
d.body.insertAdjacentHTML('beforeend', `
<footer class="ft" id="kontakty">
  <div class="cols">
    <div><p style="max-width:340px;font-size:20px;letter-spacing:-.03em;line-height:1.25">Автобусы и микроавтобусы с водителем в Санкт-Петербурге и Ленинградской области.</p></div>
    <div><h4>Навигация</h4><ul>${nav.map(([t,h])=>`<li><a href="${h}" data-link>${t}</a></li>`).join('')}</ul></div>
    <div><h4>Связь</h4><ul><li><a href="${L.phoneHref}">${L.phone}</a></li><li><a href="tel:+79959975080">${L.mobile}</a></li><li><a href="${L.wa}" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="mailto:${L.email}">${L.email}</a></li></ul></div>
    <div><h4>Офис</h4><ul><li>${L.address}</li><li>Круглосуточно, без выходных</li></ul></div>
  </div>
  <div class="word" aria-hidden="true">LS<i>bus</i></div>
  <div class="bt"><span>© 2026 ООО «Логистик Систем»</span><span>Прототип KIRIW · фото и данные — lsbus.spb.ru</span></div>
</footer>
<div class="mbar"><a href="${L.phoneHref}">Звонок</a><a href="${L.wa}" target="_blank" rel="noopener">WhatsApp</a><button class="o" data-order>Заявка</button></div>
<div class="dw" role="dialog" aria-modal="true" aria-label="Заявка"><div class="bg"></div><div class="pn">
  <button class="x" type="button">Закрыть <i><svg class="ar" viewBox="0 0 24 24" width="16" height="16"><path d="M6 6l12 12M18 6L6 18"/></svg></i></button>
  <h3>Расскажите<br>о <span class="serif red">поездке</span></h3><p class="sub">Оператор перезвонит, уточнит детали и назовёт точную стоимость.</p>
  <div class="selcar" hidden></div>
  <form class="lf" novalidate><div class="lf-in" style="display:contents">
    <div class="f w"><label>Транспорт</label><select name="car"><option value="">Подберите за меня</option>${L.fleet.map(c=>`<option value="${c.id}">${c.name} — ${c.seats} мест</option>`).join('')}</select></div>
    <div class="f"><label>Дата</label><input name="date" type="date"></div>
    <div class="f"><label>Пассажиров</label><input name="pax" type="number" min="1" placeholder="20"></div>
    <div class="f w"><label>Маршрут</label><input name="route" placeholder="Откуда — куда"></div>
    <div class="f"><label>Имя</label><input name="name" placeholder="Анна"></div>
    <div class="f tel"><label>Телефон</label><input name="phone" type="tel" placeholder="+7"></div>
    <div class="sbm"><p>Прототип: заявка никуда не отправляется. В рабочей версии — оператору, туда же, где ведутся заказы.</p>${pill('Отправить заявку','','href="#" data-submit')}</div>
  </div><div class="done-msg">Спасибо. <span class="serif red">Перезвоним</span> в ближайшее время.</div></form>
</div></div>`);

/* ---------- menu, drawer ---------- */
const hd = d.querySelector('.hd');
d.querySelector('.menu-btn').onclick = () => H.classList.toggle('menu-open');
const dw = d.querySelector('.dw'), sel = dw.querySelector('select[name=car]'), sc = dw.querySelector('.selcar');
function setCar(id){ sel.value = id || ''; const c = L.fleet.find(x=>x.id===sel.value); sc.hidden = !c;
  if (c) sc.innerHTML = `<img src="${img(c.photos[0])}" alt=""><div><b>${c.name}</b><span>${c.seats} мест · от ${rub(c.price)} / час</span></div>`; }
window.openOrder = (id, extra={}) => { dw.querySelector('form').classList.remove('done'); setCar(id);
  Object.entries(extra).forEach(([k,v])=>{ const f = dw.querySelector(`[name=${k}]`); if (f) f.value = v; });
  dw.classList.add('open'); H.classList.remove('menu-open'); lenis && lenis.stop(); };
const closeDw = () => { dw.classList.remove('open'); lenis && lenis.start(); };
sel.onchange = () => setCar(sel.value);
d.addEventListener('click', e => {
  const o = e.target.closest('[data-order]'); if (o) { e.preventDefault(); openOrder(o.dataset.order || ''); }
  if (e.target.closest('.dw .x, .dw .bg')) closeDw();
  const s = e.target.closest('[data-submit]'); if (s) { e.preventDefault(); s.closest('form').requestSubmit(); }
  if (e.target.closest('.fm a')) H.classList.remove('menu-open');
});
d.addEventListener('keydown', e => { if (e.key === 'Escape') { closeDw(); H.classList.remove('menu-open'); } });
d.addEventListener('submit', e => { const f = e.target; if (!f.classList.contains('lf')) return; e.preventDefault();
  const p = f.querySelector('[name=phone]'); if (p && p.value.replace(/\D/g,'').length < 11) { p.focus(); p.closest('.f').animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(8px)'},{transform:'translateX(0)'}],{duration:350}); return; }
  f.classList.add('done'); });
d.addEventListener('input', e => { if (e.target.type !== 'tel') return;
  let v = e.target.value.replace(/\D/g,''); if (v[0]==='8') v='7'+v.slice(1); if (v && v[0]!=='7') v='7'+v; v=v.slice(0,11);
  const m=[v.slice(1,4),v.slice(4,7),v.slice(7,9),v.slice(9,11)];
  e.target.value = v ? '+7' + (m[0]?' ('+m[0]:'') + (m[0].length===3?') ':'') + m[1] + (m[2]?'-'+m[2]:'') + (m[3]?'-'+m[3]:'') : ''; });

/* ---------- cursor ---------- */
const cur = d.querySelector('.cur');
if (fine) {
  let x=innerWidth/2,y=innerHeight/2,cx=x,cy=y;
  addEventListener('mousemove', e => { x=e.clientX; y=e.clientY; }, {passive:true});
  (function loop(){ cx+=(x-cx)*.2; cy+=(y-cy)*.2; cur.style.transform=`translate3d(${cx}px,${cy}px,0)`; requestAnimationFrame(loop); })();
  d.addEventListener('mouseover', e => {
    const t = e.target.closest('[data-cursor]'), a = e.target.closest('a,button,input,select,label');
    cur.classList.toggle('big', !!t); cur.querySelector('span').textContent = t ? t.dataset.cursor : '';
    cur.classList.toggle('hov', !t && !!a);
  });
}

/* ---------- motion ---------- */
let lenis = null;
const G = window.gsap, ST = window.ScrollTrigger;
if (G && ST) G.registerPlugin(ST);
if (window.Lenis && !reduce) {
  lenis = new Lenis({duration:1.15, easing:t=>Math.min(1,1.001-Math.pow(2,-10*t)), smoothWheel:true});
  if (G) { lenis.on('scroll', ST.update); G.ticker.add(t=>lenis.raf(t*1000)); G.ticker.lagSmoothing(0); }
  else (function raf(t){ lenis.raf(t); requestAnimationFrame(raf); })(0);
}
window.LENIS = lenis;
d.addEventListener('click', e => { const a = e.target.closest('a[href^="#"], a[href^="index.html#"]'); if (!a) return;
  const h = a.getAttribute('href'), hash = h.slice(h.indexOf('#')); if (hash.length < 2) return;
  if (h.startsWith('index.html') && page !== 'home') return;
  const t = d.querySelector(hash); if (!t) return; e.preventDefault(); e.stopPropagation(); H.classList.remove('menu-open');
  lenis ? lenis.scrollTo(t, {offset: hash==='#kontakty'?0:-20, duration:1.6}) : t.scrollIntoView({behavior:'smooth'}); }, true);

/* header hide / solid, mobile bar */
let lastY = 0; const mbar = d.querySelector('.mbar');
const onScroll = y => { hd.classList.toggle('solid', y > 40); hd.classList.toggle('hide', y > lastY && y > 400 && !H.classList.contains('menu-open')); lastY = y; mbar.classList.toggle('on', y > innerHeight*.6); };
lenis ? lenis.on('scroll', e => onScroll(e.scroll)) : addEventListener('scroll', () => onScroll(scrollY), {passive:true});

/* magnetic */
if (fine) d.querySelectorAll('[data-mag]').forEach(el => {
  const k = +el.dataset.mag || .35;
  el.addEventListener('mousemove', e => { const r = el.getBoundingClientRect(); const dx = e.clientX-(r.left+r.width/2), dy = e.clientY-(r.top+r.height/2);
    G ? G.to(el,{x:dx*k,y:dy*k,duration:.6,ease:'power3.out'}) : 0; });
  el.addEventListener('mouseleave', () => G && G.to(el,{x:0,y:0,duration:1,ease:'elastic.out(1,.4)'}));
});

/* page transitions */
const curtain = d.querySelector('.curtain');
d.addEventListener('click', e => { const a = e.target.closest('a[href]'); if (!a || a.target || e.metaKey || e.ctrlKey) return;
  const h = a.getAttribute('href'); if (!/\.html/.test(h) || (h.startsWith('index.html#') && page==='home')) return;
  e.preventDefault(); if (!G) { location.href = h; return; }
  G.fromTo(curtain,{yPercent:100},{yPercent:0,duration:.8,ease:'expo.inOut',onComplete:()=>location.href=h}); });
addEventListener('pageshow', e => { if (e.persisted && G) G.set(curtain,{yPercent:100}); });

/* word split helper */
window.splitWords = el => { const walk = n => { [...n.childNodes].forEach(c => {
  if (c.nodeType===3) { const f = d.createDocumentFragment(); c.textContent.split(/(\s+)/).forEach(w => { if (!w) return; if (/^\s+$/.test(w)) f.append(w); else { const s=d.createElement('span'); s.className='w'; s.textContent=w; f.append(s);} }); c.replaceWith(f); }
  else if (c.nodeType===1 && !c.classList.contains('w')) walk(c); }); }; walk(el); return el.querySelectorAll('.w'); };

/* intro: preloader or curtain */
function intro(done){
  const pre = d.querySelector('.pre');
  let seen = false; try { seen = sessionStorage.getItem('ls-pre')==='1'; sessionStorage.setItem('ls-pre','1'); } catch(_){}
  if (!G || reduce) { pre.remove(); G && G.set(curtain,{yPercent:100}); done(); return; }
  if (seen || page !== 'home') { pre.remove(); G.set(curtain,{yPercent:0}); G.to(curtain,{yPercent:-100,duration:1,ease:'expo.inOut',delay:.05,onComplete:()=>G.set(curtain,{yPercent:100})}); setTimeout(done,350); return; }
  const num = pre.querySelector('.num'), bar = pre.querySelector('.bar'), o = {v:0};
  lenis && lenis.stop(); scrollTo(0,0);
  const imgs = [...d.images].filter(i => i.loading !== 'lazy').slice(0,2).map(i => i.complete ? Promise.resolve() : new Promise(r => { i.addEventListener('load', r, {once:true}); i.addEventListener('error', r, {once:true}); }));
  imgs.push(new Promise(r => setTimeout(r, 2200)).then(() => 'timeout'));
  const tl = G.timeline();
  tl.to(o,{v:100,duration:1.9,ease:'power2.inOut',onUpdate:()=>{ num.textContent = String(Math.round(o.v)).padStart(3,'0'); bar.style.transform=`scaleX(${o.v/100})`; }});
  Promise.race([Promise.all(imgs.slice(0,-1)), imgs[imgs.length-1]]).then(()=>tl.then(()=>{
    G.to(pre,{yPercent:-100,duration:1.1,ease:'expo.inOut',onComplete:()=>{ pre.remove(); lenis && lenis.start(); }});
    setTimeout(done,350);
  }));
}

/* generic scroll reveals */
function reveals(){
  if (!G) return;
  G.utils.toArray('[data-r=lines]').forEach(el => G.fromTo(el.querySelectorAll('.ln>span'),{yPercent:115,rotate:3},{yPercent:0,rotate:0,duration:1.3,ease:'expo.out',stagger:.08,scrollTrigger:{trigger:el,start:'top 88%'}}));
  G.utils.toArray('[data-r=up]').forEach(el => G.fromTo(el,{y:50,autoAlpha:0},{y:0,autoAlpha:1,duration:1.2,ease:'expo.out',delay:+el.dataset.d||0,scrollTrigger:{trigger:el,start:'top 92%'}}));
  G.utils.toArray('[data-r=stagger]').forEach(el => G.fromTo(el.children,{y:40,autoAlpha:0},{y:0,autoAlpha:1,duration:1.1,ease:'expo.out',stagger:.07,scrollTrigger:{trigger:el,start:'top 88%'}}));
  G.utils.toArray('[data-r=img]').forEach(el => { G.fromTo(el,{clipPath:'inset(100% 0% 0% 0%)'},{clipPath:'inset(0% 0% 0% 0%)',duration:1.5,ease:'expo.inOut',scrollTrigger:{trigger:el,start:'top 85%'}});
    const i = el.querySelector('img'); i && G.fromTo(i,{scale:1.35},{scale:1,duration:1.9,ease:'expo.out',scrollTrigger:{trigger:el,start:'top 85%'}}); });
  G.utils.toArray('[data-par]').forEach(el => G.fromTo(el,{yPercent:-(+el.dataset.par)},{yPercent:+el.dataset.par,ease:'none',scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}}));
  G.utils.toArray('[data-words]').forEach(el => { const w = splitWords(el); G.to(w,{opacity:1,stagger:.06,ease:'none',scrollTrigger:{trigger:el,start:'top 80%',end:'bottom 45%',scrub:true}}); });
  G.utils.toArray('[data-count]').forEach(el => { const to = +el.dataset.count, o={v:0}, suf = el.dataset.suf||'';
    ST.create({trigger:el,start:'top 90%',once:true,onEnter:()=>G.to(o,{v:to,duration:2.2,ease:'expo.out',onUpdate:()=>el.textContent=Math.round(o.v).toLocaleString('ru-RU').replace(/ |,/g,' ')+suf})}); });
  d.querySelectorAll('.ft .word').forEach(w => G.from(w,{yPercent:40,ease:'none',scrollTrigger:{trigger:w,start:'top bottom',end:'bottom bottom',scrub:true}}));
}

addEventListener('load', () => G && ST && ST.refresh());
setInterval(() => { if (!G) return; d.querySelectorAll('[data-r] , [data-r] > *').forEach(el => { if (getComputedStyle(el).visibility==='hidden' && !G.isTweening(el) && el.getBoundingClientRect().top < innerHeight*.9) G.to(el,{y:0,autoAlpha:1,duration:.8,ease:'expo.out'}); }); }, 1200);
window.LSApp = { ready(fn){ const go = () => intro(() => { reveals(); fn && fn(); G && ST.refresh(); }); d.fonts ? d.fonts.ready.then(go) : go(); } };
})();
