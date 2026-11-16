'use strict';
(() => {
const L = window.LS, d = document;
if (!L) return;
const $ = id => d.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money = n => Math.round(n).toLocaleString('ru-RU') + ' ₽';
const photo = id => `../img/${id}.jpg`;
const carBy = id => L.fleet.find(c => c.id === id);
const isHome = d.body.dataset.page === 'home';
const shortName = c => c.name.replace('Mercedes-Benz ', '');
const kind = c => c.group === 'bus' ? 'Автобус' : c.group === 'mini' ? 'Микроавтобус' : c.id === 'vito' ? 'Минивэн' : 'Седан';
const shapes = {
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 compare:'<path d="M5 20V10M12 20V4M19 20V7M3 20h18"/>',
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
 trip:'<rect x="4" y="6" width="16" height="15" rx="3"/><path d="M8 6V3h8v3M4 11h16M9 16h6"/>',
 seat:'<path d="M6 3v13h12M9 3v10h9v6M6 19v2M18 19v2"/>',
 ac:'<path d="M12 2v20M3.5 7l17 10M3.5 17l17-10M9 3.5l3 2 3-2M9 20.5l3-2 3 2"/>',
 wifi:'<path d="M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01"/>',
 leather:'<path d="M6 11V6a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5M4 11a2 2 0 0 1 4 0v3h8v-3a2 2 0 0 1 4 0v6H4ZM6 17v3M18 17v3"/>',
 guide:'<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
 mic:'<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5v4"/>',
 water:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11Z"/>',
 fridge:'<rect x="5" y="2.5" width="14" height="19" rx="1.5"/><path d="M5 10h14M9 6v1.5M9 13v3"/>',
 usb:'<path d="M12 22V6M8 6l4-4 4 4M7 11v3l5 3M17 9v3l-5 3"/>',
 tv:'<rect x="2.5" y="5" width="19" height="13" rx="1"/><path d="M8 21h8M12 18v3"/>'
};
const icon = name => `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${shapes[name] || shapes.seat}</svg>`;
const getStored = (key, fallback) => {try {const a = JSON.parse(localStorage.getItem(key)); return Array.isArray(a) ? a.filter(id => carBy(id)) : fallback;} catch {return fallback;}};
let favorites = getStored('lsbus-catalog-favorites', []);
let compared = getStored('lsbus-catalog-compare', []).slice(0, 3);
let journey = {pax:18, date:'', occasion:'tour'};
let lastFocus;
const store = () => {try {localStorage.setItem('lsbus-catalog-favorites',JSON.stringify(favorites)); localStorage.setItem('lsbus-catalog-compare',JSON.stringify(compared));} catch {}};
const homeLink = hash => isHome ? hash : `index.html?v=9${hash}`;
const brand = '<span class="brand-box">LS</span><span class="brand-tail">bus</span>';
$('site-header').innerHTML = `<header class="site-header"><div class="identity-top"><div class="wrap"><span>Логистик Систем · пассажирские перевозки</span><div><span>Санкт-Петербург</span><a href="https://lsbus.msk.ru/" target="_blank" rel="noopener">Москва</a><a href="https://lsbus.spb.ru/user/login" target="_blank" rel="noopener">Вход для сотрудников</a></div></div></div><div class="identity-nav wrap"><a class="brand" href="index.html?v=9" aria-label="LSBUS — главная"><img src="../img/logo.png" alt="LSbus"></a><nav class="identity-links" aria-label="Основная навигация"><a href="${homeLink('#uslugi')}">Услуги</a><a href="${homeLink('#park')}">Автопарк</a><a href="${homeLink('#tarify')}">Цены</a><a href="${homeLink('#o-kompanii')}">О компании</a><a href="${homeLink('#kontakty')}">Контакты</a><a href="https://lsbus.spb.ru/blog" target="_blank" rel="noopener">Блог</a></nav><div class="identity-phone"><a href="${L.phoneHref}">${L.phone}</a><small>Круглосуточно · с водителем</small></div><button class="button button-red nav-order" data-order>Рассчитать поездку</button><button type="button" class="identity-menu" aria-label="Открыть навигацию"><span></span><span></span></button></div><div class="header-main wrap"><form class="header-search" id="header-search" role="search"><button class="search-menu" type="button" id="catalog-menu" aria-label="Открыть меню"><span class="menu-lines" aria-hidden="true"><i></i><i></i><i></i></span><span>Каталог</span></button><input type="search" id="site-search" aria-label="Найти транспорт" placeholder="Название модели, марка или вместимость" autocomplete="off"><button type="submit" class="search-submit" aria-label="Искать">${icon('search')}</button></form><div class="header-tools"><button class="header-tool" id="header-favorites" aria-label="Избранное">${icon('heart')}<span>Избранное</span><span class="tool-count zero" id="favorites-count">0</span></button><button class="header-tool" id="header-compare" aria-label="Сравнить транспорт">${icon('compare')}<span>Сравнение</span><span class="tool-count zero" id="compare-count">0</span></button></div></div></header>`;
$('site-footer').innerHTML = `<footer class="footer"><div class="wrap"><div class="footer-top"><p>ООО «Логистик Систем»<br>Пассажирские перевозки в Санкт-Петербурге и области</p><div class="footer-links"><a href="${homeLink('#park')}">Автопарк</a><a href="${homeLink('#uslugi')}">Услуги</a><a href="${homeLink('#kontakty')}">Контакты</a><a href="${L.wa}" target="_blank" rel="noopener">WhatsApp</a></div></div><div class="footer-wordmark">LS<span>bus</span><small>Петербург.<br>С водителем.</small></div><div class="footer-bottom"><span>© 2026 LSBUS</span><span>Концепция сайта. Данные и фотографии — lsbus.spb.ru.<br>Цены и условия требуют подтверждения.</span></div></div></footer>`;
$('site-overlays').innerHTML = `<dialog class="order-dialog" id="order-dialog" aria-labelledby="order-title"><div class="dialog-head"><h2 id="order-title">Соберём вашу поездку</h2><button class="close-button" type="button" data-close aria-label="Закрыть заявку">×</button></div><div class="order-content"><div id="order-context" class="order-context" hidden></div><form class="order-form" id="order-form"><label class="form-field full"><span>Транспорт</span><select name="car" id="order-car"><option value="">Помогите выбрать</option>${L.fleet.map(c => `<option value="${c.id}">${esc(c.name)} · ${c.seats} мест</option>`).join('')}</select></label><label class="form-field"><span>Дата поездки</span><input type="date" name="date"></label><label class="form-field"><span>Пассажиров</span><input type="number" name="pax" min="1" max="500" inputmode="numeric" required></label><label class="form-field full"><span>Откуда и куда едем</span><textarea name="route" placeholder="Например: Петербург — Петергоф — Петербург" maxlength="1000"></textarea></label><label class="form-field"><span>Ваше имя</span><input name="name" autocomplete="name" placeholder="Как к вам обращаться" maxlength="100"></label><label class="form-field"><span>Телефон</span><input name="phone" type="tel" autocomplete="tel" placeholder="+7 (___) ___-__-__" required minlength="10" maxlength="22"></label><div class="demo-note full"><b>Демонстрационная форма.</b> Заявка никуда не отправляется. В рабочем сайте способ обработки согласуем с LSBUS.</div><button class="button button-red full" type="submit">Проверить заявку</button></form><div class="order-success" id="order-success" hidden><span class="success-mark">✓</span><h3>Так будет выглядеть<br>ваша заявка.</h3><p id="success-details"></p><p>Это демонстрация: данные не отправлены<br>и автомобиль не забронирован.</p><button class="button button-ink" type="button" data-close>Готово</button></div></div></dialog><dialog class="compare-dialog" id="compare-dialog" aria-labelledby="compare-title"><div class="dialog-head"><h2 id="compare-title">Сравним по существу</h2><button class="close-button" type="button" data-close aria-label="Закрыть сравнение">×</button></div><div id="compare-content" class="compare-table"></div></dialog><dialog class="menu-dialog" id="menu-dialog" aria-labelledby="menu-title"><div class="dialog-head"><h2 id="menu-title">Куда отправимся?</h2><button class="close-button" type="button" data-close aria-label="Закрыть меню">×</button></div><nav class="mobile-menu-panel"><a href="${homeLink('#park')}">Весь автопарк</a><a href="index.html?v=9&group=bus#park">Автобусы</a><a href="index.html?v=9&group=mini#park">Микроавтобусы</a><a href="index.html?v=9&group=car#park">Минивэны и седаны</a><a href="${homeLink('#uslugi')}">Услуги</a><a href="${homeLink('#raschet')}">Расчёт стоимости</a><a href="${homeLink('#tarify')}">Цены</a><a href="${homeLink('#o-kompanii')}">О компании</a><a href="${homeLink('#kontakty')}">Контакты</a><a href="${L.phoneHref}">${L.phone}</a></nav></dialog><dialog class="photo-dialog" id="photo-dialog" aria-labelledby="photo-title"><div class="dialog-head"><h2 id="photo-title">Фотографии транспорта</h2><button class="close-button" type="button" data-close aria-label="Закрыть фотографии">×</button></div><div class="photo-view"><img id="viewer-photo" alt=""></div><div class="photo-controls"><button type="button" id="viewer-prev">Предыдущее</button><span id="viewer-counter"></span><button type="button" id="viewer-next">Следующее</button></div></dialog><div class="compare-tray" id="compare-tray" hidden><div class="tray-photos" id="tray-photos"></div><div class="tray-info"><span id="tray-count"></span><small>Можно выбрать до трёх</small></div><button class="button" type="button" id="tray-open">Сравнить</button><button class="tray-clear" type="button" id="tray-clear" aria-label="Очистить сравнение">×</button></div><div class="toast" role="status" aria-live="polite" id="toast"></div>`;
let toastTimer;
function toast(s) {clearTimeout(toastTimer); $('toast').textContent=s; $('toast').classList.add('show'); toastTimer=setTimeout(()=>$('toast').classList.remove('show'),2800);}
function openDialog(id) {d.querySelectorAll('dialog[open]').forEach(x => x.close()); lastFocus=d.activeElement; $(id).showModal(); d.body.classList.add('locked');}
d.querySelectorAll('dialog').forEach(dialog => {
 dialog.addEventListener('click', e => {if(e.target===dialog){const r=dialog.getBoundingClientRect(); if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
 dialog.addEventListener('close',()=>{if(!d.querySelector('dialog[open]'))d.body.classList.remove('locked'); if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});});
});
d.addEventListener('click',e=>{const close=e.target.closest('[data-close]'); if(close)close.closest('dialog').close(); const menuLink=e.target.closest('.mobile-menu-panel a'); if(menuLink)$('menu-dialog').close();});
function syncSelection() {
 store();
 [['favorites-count',favorites.length],['compare-count',compared.length]].forEach(([id,n])=>{ $(id).textContent=n; $(id).classList.toggle('zero',!n); });
 d.querySelectorAll('[data-favorite]').forEach(b=>{const on=favorites.includes(b.dataset.favorite);b.setAttribute('aria-pressed',String(on));b.setAttribute('aria-label',`${on?'Убрать из избранного':'В избранное'}: ${carBy(b.dataset.favorite)?.name||''}`);});
 d.querySelectorAll('[data-compare]').forEach(x=>{const on=compared.includes(x.dataset.compare);if(x.type==='checkbox')x.checked=on;else x.setAttribute('aria-pressed',String(on));});
 $('compare-tray').hidden=!compared.length; d.body.classList.toggle('has-tray',!!compared.length);
 $('tray-photos').innerHTML=compared.map(id=>`<img src="${photo(carBy(id).photos[0])}" alt="${esc(carBy(id).name)}">`).join('');
 $('tray-count').textContent=`В сравнении: ${compared.length}`;
}
function favorite(id) {if(favorites.includes(id)){favorites=favorites.filter(x=>x!==id);toast('Убрано из избранного');}else{favorites.push(id);toast('Сохранено в избранное');}syncSelection(); if(isHome&&catalog.favorite)renderCatalog();}
function compare(id) {if(compared.includes(id))compared=compared.filter(x=>x!==id); else if(compared.length<3)compared.push(id); else toast('Для сравнения можно выбрать до трёх машин');syncSelection();}
function openComparison() {
 if(!compared.length){$('compare-content').innerHTML='<div class="compare-empty">Выберите машины в каталоге с помощью отметки «Сравнить».<br><br><a class="button button-ink" href="index.html#park">Открыть автопарк</a></div>';}
 else $('compare-content').innerHTML=`<div class="compare-columns" style="grid-template-columns:repeat(${compared.length},minmax(0,1fr))">${compared.map(id=>{const c=carBy(id);return `<article class="compare-column"><img src="${photo(c.photos[0])}" alt="${esc(c.name)}"><h3>${esc(shortName(c))}</h3><div class="compare-price">${money(c.price)} <small>/ час, от</small></div><div class="compare-spec"><small>Вместимость</small>${c.seats} мест${c.guide?' + гид':''}</div><div class="compare-spec"><small>Категория</small>${kind(c)}</div>${['ac','wifi','leather','guide','usb','tv'].map(a=>`<div class="compare-spec"><small>${L.amen[a]}</small>${c.amen.includes(a)?'Есть':'Не указано'}</div>`).join('')}<a class="button button-ink" href="kartochka.html?v=9&id=${c.id}">Подробнее о машине</a><button class="button button-line" type="button" data-remove-compare="${c.id}">Убрать из сравнения</button></article>`;}).join('')}</div>`;
 openDialog('compare-dialog');
}
$('header-compare').onclick=openComparison; $('tray-open').onclick=openComparison;
$('tray-clear').onclick=()=>{compared=[];syncSelection();};
$('catalog-menu').onclick=()=>openDialog('menu-dialog');
$('header-favorites').onclick=()=>{if(isHome){catalog.favorite=!catalog.favorite; $('favorite-filter').setAttribute('aria-pressed',String(catalog.favorite));renderCatalog();$('park').scrollIntoView({behavior:'smooth'});}else location.href='index.html?v=9&favorites=1#park';};
$('header-search').onsubmit=e=>{e.preventDefault();const q=$('site-search').value.trim();if(isHome){catalog.search=q;catalog.favorite=false;$('favorite-filter').setAttribute('aria-pressed','false');renderCatalog();$('park').scrollIntoView({behavior:'smooth'});}else location.href=`index.html?v=9&q=${encodeURIComponent(q)}#park`;};
function updateOrderContext() {const c=carBy($('order-car').value);$('order-context').hidden=!c;if(c)$('order-context').innerHTML=`<img src="${photo(c.photos[0])}" alt="${esc(c.name)}"><div><b>${esc(c.name)}</b><p>${c.seats} мест · от ${money(c.price)} / час</p></div>`;}
function openOrder(id='',extra={}) {
 const form=$('order-form'); form.reset(); form.hidden=false; $('order-success').hidden=true;
 $('order-car').value=id;const vals={...journey,...extra};
 for(const key of ['date','pax','route','name'])if(vals[key]!==undefined)form.elements[key].value=vals[key];
 updateOrderContext();openDialog('order-dialog');
}
$('order-car').onchange=updateOrderContext;
d.addEventListener('click',e=>{
 const fav=e.target.closest('[data-favorite]');if(fav){favorite(fav.dataset.favorite);return;}
 const cp=e.target.closest('button[data-compare]');if(cp){compare(cp.dataset.compare);return;}
 const rm=e.target.closest('[data-remove-compare]');if(rm){compared=compared.filter(id=>id!==rm.dataset.removeCompare);syncSelection();openComparison();return;}
 const order=e.target.closest('[data-order]');if(order)openOrder(order.dataset.order||'',{route:order.dataset.route||''});
});
d.addEventListener('change',e=>{if(e.target.matches('input[data-compare]'))compare(e.target.dataset.compare);});
$('order-form').onsubmit=e=>{
 e.preventDefault();const f=e.currentTarget;const phone=f.elements.phone; const digits=phone.value.replace(/\D/g,'');
 if(digits.length<10||digits.length>15){phone.setCustomValidity('Укажите номер телефона, не менее 10 цифр');phone.reportValidity();return;}
 phone.setCustomValidity('');if(!f.reportValidity())return;
 const c=carBy(f.elements.car.value);$('success-details').textContent=`${c?c.name:'Подбор транспорта'} · ${f.elements.pax.value} пассажиров${f.elements.date.value?' · '+new Date(f.elements.date.value+'T12:00:00').toLocaleDateString('ru-RU'):''}${f.elements.route.value?' · '+f.elements.route.value:''}`;
 f.hidden=true;$('order-context').hidden=true;$('order-success').hidden=false;$('order-dialog').scrollTop=0;
};
$('order-form').elements.phone.addEventListener('input',e=>e.target.setCustomValidity(''));
function fleetCard(c) {return `<article class="fleet-card"><a class="car-photo-link" href="kartochka.html?v=9&id=${c.id}" aria-label="${esc(c.name)} — подробнее"><img src="${photo(c.photos[0])}" alt="${esc(c.name)}" loading="lazy"><span class="car-type">${kind(c)}</span></a><button class="car-save" type="button" data-favorite="${c.id}" aria-pressed="${favorites.includes(c.id)}" aria-label="В избранное: ${esc(c.name)}">${icon('heart')}</button><div class="car-body"><div class="car-price"><b>${money(c.price)}</b><span>/ час, от</span></div><a class="car-name" href="kartochka.html?v=9&id=${c.id}">${esc(shortName(c))}</a><span class="car-brand">${esc(c.brand)}</span><div class="car-info">${icon('seat')}<span>${c.seats} мест${c.guide?' + гид':''}</span><span class="amenity-short">${c.amen.includes('wifi')?'Wi-Fi':c.id==='vito'?'Минивэн':'С водителем'}</span></div><div class="car-actions"><a class="car-details" href="kartochka.html?v=9&id=${c.id}">Посмотреть</a><label class="compare-choice"><input type="checkbox" data-compare="${c.id}" ${compared.includes(c.id)?'checked':''} aria-label="Сравнить ${esc(c.name)}"><span>Сравнить</span></label></div></div></article>`;}
d.querySelector('.identity-menu').onclick=()=>$('catalog-menu').click();
const catalog={group:'all',search:'',seats:0,amen:[],favorite:false,sort:'default'};
function renderCatalog() {
 if(!isHome)return;
 let list=L.fleet.filter(c=>(catalog.group==='all'||c.group===catalog.group)&&c.seats>=catalog.seats&&catalog.amen.every(a=>c.amen.includes(a))&&(!catalog.favorite||favorites.includes(c.id)));
 const q=catalog.search.toLowerCase().replace(/ё/g,'е');
 const aliases=c=>{const n=c.name.toLowerCase();return (n.includes('sprinter')?' спринтер мерседес':n.includes('yutong')?' ютонг ютунг':n.includes('vito')?' вито мерседес минивэн':n.includes('camry')?' камри тойота':n.includes('zhong')?' жонг тонг':'');};
 if(q)list=list.filter(c=>[c.name,kind(c),c.brand,aliases(c),...c.amen.map(a=>L.amen[a]),c.seats].join(' ').toLowerCase().replace(/ё/g,'е').includes(q));
 if(catalog.sort==='price-up')list.sort((a,b)=>a.price-b.price);if(catalog.sort==='price-down')list.sort((a,b)=>b.price-a.price);if(catalog.sort==='seats-down')list.sort((a,b)=>b.seats-a.seats);
 $('fleet-grid').innerHTML=list.map(fleetCard).join('');$('empty-state').hidden=!!list.length;$('fleet-grid').hidden=!list.length;
 const n=list.length;const word=n%10===1&&n%100!==11?'модель':n%10>=2&&n%10<=4&&!(n%100>=12&&n%100<=14)?'модели':'моделей';$('result-count').textContent=`${n} ${word}`;
 d.querySelectorAll('.category-tab').forEach(b=>{const on=b.dataset.group===catalog.group;b.classList.toggle('active',on);b.setAttribute('aria-pressed',String(on));});
 $('search-summary').hidden=!catalog.search&&!catalog.favorite; $('search-summary').textContent=[catalog.search?`Поиск: «${catalog.search}»`:'',catalog.favorite?'Избранные машины':''].filter(Boolean).join(' · ');
 syncSelection();
}
function resetFilters(){Object.assign(catalog,{group:'all',search:'',seats:0,amen:[],favorite:false,sort:'default'});$('site-search').value='';$('min-seats').value='';$('sort').value='default';$('favorite-filter').setAttribute('aria-pressed','false');d.querySelectorAll('[name=amen]').forEach(x=>x.checked=false);renderCatalog();}
if(isHome){
 const url=new URLSearchParams(location.search);catalog.group=L.groups.some(g=>g.id===url.get('group'))?url.get('group'):'all';catalog.search=url.get('q')||'';catalog.favorite=url.get('favorites')==='1';$('site-search').value=catalog.search;$('favorite-filter').setAttribute('aria-pressed',String(catalog.favorite));
 d.querySelectorAll('.category-tab').forEach(b=>b.onclick=()=>{catalog.group=b.dataset.group;renderCatalog();});
 $('min-seats').oninput=e=>{catalog.seats=Math.max(0,Math.min(500,+e.target.value||0));renderCatalog();};
 d.querySelectorAll('[name=amen]').forEach(x=>x.onchange=()=>{catalog.amen=[...d.querySelectorAll('[name=amen]:checked')].map(el=>el.value);renderCatalog();});
 $('sort').onchange=e=>{catalog.sort=e.target.value;renderCatalog();};
 $('favorite-filter').onclick=()=>{catalog.favorite=!catalog.favorite;$('favorite-filter').setAttribute('aria-pressed',String(catalog.favorite));renderCatalog();};
 $('reset-filters').onclick=resetFilters;$('empty-reset').onclick=resetFilters;
 $('filter-toggle').onclick=()=>{const on=$('filters').classList.toggle('open');$('filter-toggle').setAttribute('aria-expanded',String(on));};
 $('trip-form').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;const pax=+f.elements.pax.value;journey={pax,date:f.elements.date.value,occasion:f.elements.occasion.value};Object.assign(catalog,{seats:pax,search:'',group:'all',favorite:false,amen:[]});$('min-seats').value=pax;$('site-search').value='';$('favorite-filter').setAttribute('aria-pressed','false');d.querySelectorAll('[name=amen]').forEach(x=>x.checked=false);renderCatalog();$('park').scrollIntoView({behavior:'smooth'});};
 d.querySelectorAll('[data-occasion]').forEach(b=>b.onclick=()=>{journey.occasion=b.dataset.occasion;const s=L.services.find(x=>x.id===b.dataset.occasion);openOrder('',{route:s?s.name:''});});
 $('partner-logos').innerHTML=['sberbank','vtb','lukoil','rosneft','reso','neptun'].map(name=>`<img src="../img/logos/${name}.svg" alt="${({sberbank:'Сбербанк',vtb:'ВТБ',lukoil:'Лукойл',rosneft:'Роснефть',reso:'РЕСО',neptun:'Нептун'})[name]}" loading="lazy">`).join('');
 let calcChoice;
 function calculate(){const pax=+$('calc-pax').value,hours=+$('calc-hours').value;const valid=L.fleet.filter(c=>c.seats>=pax).sort((a,b)=>a.price-b.price||a.seats-b.seats);let c,n=1;if(valid.length)c=valid[0];else{c=L.fleet.filter(c=>c.group==='bus').sort((a,b)=>b.seats-a.seats)[0];n=Math.ceil(pax/c.seats);}calcChoice={c,n,pax,hours};$('calc-pax-value').value=pax;$('calc-hours-value').value=hours;$('calc-image').src=photo(c.photos[0]);$('calc-image').alt=c.name;$('calc-kind').textContent=n>1?'Для большой группы':'Подходит для вашей группы';$('calc-model').textContent=(n>1?n+' × ':'')+c.name;$('calc-formula').textContent=`${c.seats} мест · ${money(c.price)} × ${hours} ч${n>1?' × '+n:''}`;$('calc-total').textContent=money(c.price*hours*n);}
 $('calc-pax').oninput=calculate;$('calc-hours').oninput=calculate;$('calc-order').onclick=()=>{const {c,n,pax,hours}=calcChoice;openOrder(c.id,{pax,route:`${hours} ч с подачей${n>1?`, ${n} автобуса`:''}`});};calculate();renderCatalog();
}
let viewerCar=null, photoIndex=0;
function viewPhoto(index){photoIndex=(index+viewerCar.photos.length)%viewerCar.photos.length;$('viewer-photo').src=photo(viewerCar.photos[photoIndex]);$('viewer-photo').alt=`${viewerCar.name}, фото ${photoIndex+1}`;$('viewer-counter').textContent=`${photoIndex+1} / ${viewerCar.photos.length}`;}
$('viewer-prev').onclick=()=>viewPhoto(photoIndex-1);$('viewer-next').onclick=()=>viewPhoto(photoIndex+1);
$('photo-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowLeft'){e.preventDefault();viewPhoto(photoIndex-1);}if(e.key==='ArrowRight'){e.preventDefault();viewPhoto(photoIndex+1);}});
if(!isHome){
 const c=carBy(new URLSearchParams(location.search).get('id'))||carBy('sprinter-black');
 d.title=`${c.name} с водителем — LSBUS`;$('card-breadcrumb').textContent=shortName(c);$('card-type').textContent=`${kind(c)} с водителем · Санкт-Петербург`;$('card-title').textContent=c.name;
 $('card-tools').innerHTML=`<button type="button" class="save-product" data-favorite="${c.id}" aria-pressed="${favorites.includes(c.id)}">${icon('heart')}<span>В избранное</span></button><button type="button" data-compare="${c.id}" aria-pressed="${compared.includes(c.id)}">${icon('compare')}<span>Сравнить</span></button>`;
 let activePhoto=0;
 function showPhoto(i){activePhoto=i;$('main-photo').src=photo(c.photos[i]);$('main-photo').alt=`${c.name}, фото ${i+1}`;$('photo-count').textContent=`${i+1} / ${c.photos.length}`;d.querySelectorAll('.gallery-thumbnails button').forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i));});}
 $('gallery-thumbnails').innerHTML=c.photos.map((p,i)=>`<button type="button" data-photo="${i}" class="${i?'':'active'}" aria-label="Показать фото ${i+1}" aria-pressed="${!i}"><img src="${photo(p)}" alt="${esc(c.name)}, ракурс ${i+1}"></button>`).join('');
 $('gallery-thumbnails').onclick=e=>{const b=e.target.closest('[data-photo]');if(b)showPhoto(+b.dataset.photo);};showPhoto(0);
 $('gallery-main').onclick=()=>{viewerCar=c;$('photo-title').textContent=c.name;viewPhoto(activePhoto);openDialog('photo-dialog');};
 let touchStart; $('gallery-main').addEventListener('touchstart',e=>touchStart=e.touches[0].clientX,{passive:true});$('gallery-main').addEventListener('touchend',e=>{if(touchStart===undefined)return;const dx=e.changedTouches[0].clientX-touchStart;if(Math.abs(dx)>40)showPhoto((activePhoto+(dx<0?1:-1)+c.photos.length)%c.photos.length);touchStart=undefined;},{passive:true});
 $('product-summary').innerHTML=[['Пассажирских мест',c.seats+(c.guide?' + гид':'')],['Транспорт',kind(c)],['Водитель','Включён']].map(([label,val])=>`<div class="summary-item"><span>${label}</span><b>${val}</b></div>`).join('');
 $('card-description').textContent=c.text;$('equipment-grid').innerHTML=c.amen.length?c.amen.map(a=>`<div class="equipment-item">${icon(a)}<span>${L.amen[a]}</span></div>`).join(''):'<p class="fineprint">Оснащение этой модели уточните у менеджера.</p>';
 const specs=[['Тип',kind(c)],['Вместимость',c.seats+' мест'+(c.guide?' + место гида':'')],...c.specs.filter(x=>x[0]!=='Места'),['Стоимость часа','от '+money(c.price)],['Водитель','Включён в аренду']];
 $('spec-list').innerHTML=specs.map(([k,v])=>`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
 $('card-price').textContent=money(c.price);$('booking-pax').value=Math.min(18,c.seats);$('booking-pax').max=c.seats;
 let hours=4;const hoursUpdate=()=>{$('booking-hours').value=hours;$('booking-total').textContent=money(c.price*hours);$('hours-minus').disabled=hours===4;$('hours-plus').disabled=hours===16;};
 $('hours-minus').onclick=()=>{hours=Math.max(4,hours-1);hoursUpdate();};$('hours-plus').onclick=()=>{hours=Math.min(16,hours+1);hoursUpdate();};hoursUpdate();
 $('book-car').onclick=()=>{const p=$('booking-pax');if(!p.reportValidity())return;openOrder(c.id,{pax:+p.value,date:$('booking-date').value,route:`Аренда на ${hours} ч с подачей`});};
 const sims=L.fleet.filter(x=>x.id!==c.id).sort((a,b)=>(a.group===c.group?0:1)-(b.group===c.group?0:1)||Math.abs(a.seats-c.seats)-Math.abs(b.seats-c.seats)).slice(0,3);$('similar-grid').innerHTML=sims.map(fleetCard).join('');
}
// Keep the card visible immediately. Animations never gate access to content.
if(!matchMedia('(prefers-reduced-motion: reduce)').matches&&'IntersectionObserver' in window){
 const obs=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.animate([{transform:'translateY(13px)'},{transform:'translateY(0)'}],{duration:550,easing:'cubic-bezier(.2,.7,.2,1)'});obs.unobserve(e.target);}});},{threshold:.08});
 d.querySelectorAll('.occasion-tile,.inside-photo,.estimate-panel').forEach(el=>obs.observe(el));
}
syncSelection();
})();
