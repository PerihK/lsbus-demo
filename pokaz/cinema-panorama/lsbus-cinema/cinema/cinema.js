(()=>{'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const L=window.LS,fleet=window.LSCinemaFleet,esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rub=n=>Math.round(n).toLocaleString('ru-RU')+' ₽';
const publicRoutes=JSON.parse(document.getElementById('public-routes')?.textContent||'null');
const homeHref=publicRoutes?'/lsbus-demo/pokaz/cinema-panorama/':'index.html';
const fleetHref=publicRoutes?'/lsbus-demo/pokaz/cinema-panorama/avtopark.html':'fleet.html';
const vehicleHref=id=>publicRoutes?.[id]||'transport.html?id='+encodeURIComponent(id);
const asset=path=>publicRoutes?'/lsbus-demo/pokaz/cinema-panorama/lsbus-cinema/cinema/'+path:path;
const requestUrl=publicRoutes?'/lsbus-cinema/request':'api/request.php';
const release=document.documentElement.hasAttribute('data-cinema-release');
const photoUrl=src=>asset(src.startsWith('assets/')?src:'../img/'+src+'.jpg');
const carCapacity=car=>car.seats===null?'Места уточнит диспетчер':car.seats+' '+plural(car.seats,['место','места','мест'])+(car.guide?' + гид':'');
const home=document.body.dataset.page==='home',anchor=id=>(home?'':homeHref)+'#'+id;
const plural=(n,forms)=>forms[n%100>=11&&n%100<=14?2:n%10===1?0:n%10>=2&&n%10<=4?1:2];
const state={passengers:18,occasion:'tour',hours:4,service:'По часам',pickup:'',dropoff:'',date:'',time:'',end_time:'',end_place:'',carId:null};
const OCC=[['tour','Экскурсия'],['transfer','Трансфер'],['wedding','Свадьба'],['staff','Развозка'],['kids','Дети'],['intercity','Межгород']];
const trip=()=>window.LSCalculator.calculateTrip({fleet,...state});
const currentCar=()=>state.carId?fleet.find(c=>c.id===state.carId):trip().car;
let csrf='',deliveryMode='preview',tokenPromise=null,submissionId='',lastFocus=null;
document.querySelector('[data-header]').innerHTML=`<header class="site-header" id="site-header"><div class="shell"><div class="header-menu"><button class="menu-toggle" aria-label="Меню" aria-expanded="false" aria-controls="mobile-nav"><span>Меню</span><i></i><i></i></button></div><a class="brand" href="${homeHref}" aria-label="LSBUS — главная"><span class="brand-mark" aria-hidden="true"><b>LS</b>bus</span></a>${home ? `<nav class="cover-links" aria-label="Разделы главной"><a href="#fleet">Автопарк</a><a href="#services">Маршруты</a><a href="#inside">Салоны</a><a href="#contacts">Контакты</a></nav>` : ''}<div class="header-contact"><a class="header-phone" href="${L.phoneHref}">${esc(L.phone)}</a><button class="button" data-book>Заказать поездку</button></div></div></header><nav class="mobile-nav" id="mobile-nav" aria-label="Меню разделов" hidden><div class="nav-links"><a href="${anchor('trip')}"><small>01</small>Ваша поездка</a><a href="${anchor('fleet')}"><small>02</small>Автопарк</a><a href="${anchor('people')}"><small>03</small>Подбор состава</a><a href="${anchor('services')}"><small>04</small>Маршруты</a><a href="${anchor('contacts')}"><small>05</small>Контакты</a>${publicRoutes?'<a href="https://lsbus.spb.ru/blog"><small>06</small>Блог</a>':''}</div><div class="nav-aside"><img src="${asset('assets/palace-sm.webp')}" alt="Транспорт LSBUS на Дворцовой площади"><a href="${L.phoneHref}">${esc(L.phone)}</a><p>Пассажирские перевозки / Санкт-Петербург<br>На связи круглосуточно</p></div></nav>`;
document.querySelector('[data-footer]').innerHTML=`<footer class="site-footer" id="contacts"><div class="footer-top"><div class="footer-company"><a class="footer-brand" href="${homeHref}"><b>LS</b>bus</a><p>ООО «Логистик Систем»<br>Автобусы и микроавтобусы с водителем.<br>Санкт-Петербург и Ленинградская область.</p></div><div class="footer-navigation"><h3>Продолжить знакомство</h3><nav><a href="${fleetHref}">Автопарк</a><a href="${anchor('services')}">Маршруты</a><a href="${anchor('people')}">Подбор состава</a><a href="${anchor('inside')}">Внутри салона</a>${publicRoutes?'<a href="/lsbus-demo/pokaz/cinema-panorama/film-lsbus.html">Фильм</a><a href="https://lsbus.spb.ru/blog">Блог</a><a href="https://lsbus.spb.ru/uslugi">Услуги</a><a href="https://lsbus.spb.ru/kontakty">Контакты</a>':''}</nav></div><div class="footer-contact"><h3>На связи круглосуточно</h3><a href="${L.phoneHref}">${esc(L.phone)}</a><br><a href="mailto:${L.email}">${esc(L.email)}</a><p style="margin-top:12px">${esc(L.address)}</p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ООО «Логистик Систем»</span><button class="text-button" data-privacy>О данных формы</button><span>${release?'Фотографии и фильм LSBUS':'Фотографии и фильм LSBUS / Концепция KIRIW'}</span></div></footer><div class="mobile-cta"><a href="${L.phoneHref}">Позвонить</a><button class="button dark" data-book>Спланировать поездку</button></div>`;
document.querySelector('[data-dialogs]').innerHTML=`<dialog class="booking-dialog" id="booking-dialog" aria-labelledby="booking-title"><div class="dialog-inner"><div class="dialog-top"><p class="overline"><span class="red-dot"></span> Ваша поездка с LSBUS</p><button class="dialog-close" data-close aria-label="Закрыть заявку">×</button></div><h2 id="booking-title">Параметры поездки.</h2><p class="dialog-lead">Оставьте параметры и контакты. Маршрут, наличие транспорта и окончательную стоимость согласуем с вами.</p><form class="booking-form" id="booking-form"><div class="field-pair"><label>Повод поездки<select name="occasion">${OCC.map(([id,name])=>`<option value="${id}">${name}</option>`).join('')}</select></label><label>Количество пассажиров<input type="number" name="passengers" min="1" max="500" value="18" required inputmode="numeric"></label></div><div class="field-pair"><label>Дата поездки<input name="date" type="date" required></label><label>Время подачи<input name="time" type="time" required></label></div><label>Откуда забрать<input name="pickup" placeholder="Адрес, аэропорт, вокзал, отель" maxlength="255" minlength="3" required autocomplete="street-address"></label><label>Куда едем<input name="dropoff" placeholder="Адрес или маршрут поездки" maxlength="255" required minlength="3"></label><div class="field-pair"><label>Время окончания, если известно<input name="end_time" type="time"></label><label>Место окончания, если известно<input name="end_place" maxlength="300" placeholder="Для почасовой поездки"></label></div><div class="field-pair"><label>Ваше имя<input name="name" placeholder="Как к вам обращаться" minlength="2" maxlength="80" required autocomplete="name"></label><label>Телефон<input type="tel" name="phone" placeholder="+7 999 999 99 99" required autocomplete="tel" inputmode="tel" maxlength="24"></label></div><label>Email, если удобно ответить письмом<input type="email" name="email" autocomplete="email" placeholder="mail@example.ru" maxlength="254"></label><label>Расскажите о поездке<textarea name="comment" maxlength="1200" placeholder="Номер рейса, остановки, багаж, пожелания"></textarea></label><div class="booking-preview" id="booking-preview" aria-live="polite"></div><label class="consent"><input type="checkbox" name="consent" value="1" required><span>Согласен передать указанные данные для расчёта моей поездки. <button type="button" class="text-button" data-privacy>О данных формы</button></span></label><label class="trap" aria-hidden="true">Ваш сайт<input name="website" tabindex="-1" autocomplete="off"></label><button type="submit" class="button red wide">Отправить заявку на расчёт</button><p class="delivery-note" id="delivery-note">${release?'Проверяем подключение формы.':'Демонстрационная версия: заявка сохраняется только для проверки формы и не отправляется менеджеру.'}</p><div class="form-status" id="form-status" role="status" hidden></div></form></div></dialog><dialog class="film-dialog" id="film-dialog" aria-label="Фильм о LSBUS"><div class="film-top"><span>LSBUS / Петербург в движении</span><button class="dialog-close" data-close aria-label="Закрыть фильм">×</button></div><video id="full-film" controls playsinline preload="none"></video></dialog><dialog class="booking-dialog" id="privacy-dialog" aria-labelledby="privacy-title"><div class="dialog-inner"><div class="dialog-top"><p class="overline">О данных формы</p><button class="dialog-close" data-close aria-label="Закрыть информацию">×</button></div><h2 id="privacy-title">${release?'О данных<br>заявки.':'О демонстрационной<br>форме.'}</h2><div class="privacy-copy">${release?`<p>ООО «Логистик Систем» использует контакты и параметры поездки, чтобы рассчитать заказ и связаться с вами. По вопросам о заявке пишите на <a class="underlined" href="mailto:${L.email}">${esc(L.email)}</a>.</p>`:'<p>В локальной версии сохраняется тестовая заявка. Для проверки используйте вымышленные контакты.</p>'}<p style="margin-top:18px">Для подсказок сервису Photon передаётся текст из адресного поля.</p><p style="margin-top:18px">По реальной поездке свяжитесь с LSBUS: <a class="underlined" href="${L.phoneHref}">${esc(L.phone)}</a>.</p></div></div></dialog>`;
const booking=$('#booking-dialog'),bookingForm=$('#booking-form'),filmDialog=$('#film-dialog'),heroVideo=$('#hero-video');
const publicDemo = document.documentElement.hasAttribute('data-pages-demo');
window.LSCinemaForm?.enhance($('#quick-book'));
window.LSCinemaForm?.enhance(bookingForm);
if (publicDemo) {
  $('.dialog-lead').textContent = 'Попробуйте указать маршрут и параметры поездки. Для проверки используйте вымышленные контакты.';
  $('#delivery-note').textContent = 'Демонстрация формы. Данные заявки не отправляются.';
  $('.consent > span').firstChild.textContent = 'Понимаю, что это демонстрация формы. ';
  bookingForm.elements.name.placeholder = 'Тестовое имя';
  for (const field of ['name', 'phone', 'email']) bookingForm.elements[field].autocomplete = 'off';
  $('#booking-form [type=submit]').textContent = 'Проверить заявку';
  const privacy = $('.privacy-copy');
  privacy.firstElementChild.textContent = 'Эта форма показывает, как будет выглядеть заявка. Публичная демоверсия не отправляет данные.';
  privacy.children[1].textContent = 'Используйте вымышленные контакты для проверки.';
}

function openDialog(dialog){lastFocus=document.activeElement;pauseHero();dialog.showModal();document.body.classList.add('dialog-open');}
$$('dialog').forEach(dialog=>{
  dialog.addEventListener('click',e=>{if(e.target===dialog||e.target.closest('[data-close]'))dialog.close();});
  dialog.addEventListener('close',()=>{if(!$$('dialog[open]').length)document.body.classList.remove('dialog-open');if(lastFocus?.isConnected)lastFocus.focus({preventScroll:true});playHero();});
});
function getToken(){
  if(tokenPromise)return tokenPromise;
  tokenPromise=fetch(requestUrl,{credentials:'same-origin',cache:'no-store'}).then(async r=>{if(!r.ok)throw Error('API');const d=await r.json();if(!d.csrf)throw Error('API');csrf=d.csrf;deliveryMode=d.mode||'preview';$('#delivery-note').textContent=deliveryMode==='preview'?'Демонстрационная версия: заявка сохраняется только для проверки формы и не отправляется менеджеру.':'Заявку получит менеджер LSBUS. После отправки мы свяжемся с вами.';return d;}).catch(()=>{tokenPromise=null;throw Error('В этой копии приём заявок не подключён. Для поездки позвоните по номеру в шапке сайта.');});return tokenPromise;
}
function syncBooking(){
  const t=trip(),car=currentCar();
  const capacity=state.carId?car.seats:t.capacity;
  const passengerField=bookingForm.elements.passengers;
  const passengerCount=passengerField.validity.valid?passengerField.valueAsNumber:null;
  const seats=capacity===null?'Вместимость уточнит диспетчер':capacity+' мест '+(state.carId?'в машине':'всего');
  const passengers=passengerCount===null?'':passengerCount+' '+plural(passengerCount,['пассажир','пассажира','пассажиров'])+' · ';
  const extra=capacity!==null&&passengerCount>capacity?'<br>Для группы потребуется дополнительный транспорт.':'';
  const name=state.carId||t.count===1?car.name:t.count+' × '+t.car.name;
  $('#booking-preview').innerHTML=`<b>${esc(name)}</b><br>${passengers}${seats}${extra}<br><span>Предварительный подбор. Наличие на дату подтвердит менеджер.</span>`;
}
function openBooking(carId=null){
  state.carId=carId;$$('#quick-book input').forEach(f=>{if(f.name&&f.name!=='passengers')state[f.name]=f.value;});
  for(const [key,val]of Object.entries(state)){const f=bookingForm.elements.namedItem(key);if(f)f.value=val;}
  window.LSCinemaForm?.sync(bookingForm);
  if(carId&&currentCar().seats===null) bookingForm.elements.passengers.value='';
  $('#form-status').hidden=true;submissionId=crypto.randomUUID().replace(/-/g,'');syncBooking();openDialog(booking);if(!publicDemo)getToken().catch(err=>{$('#delivery-note').textContent=err.message;});
}
document.addEventListener('click',e=>{const b=e.target.closest('[data-book]');if(b){e.preventDefault();if(!$('#mobile-nav').hidden)setMenu(false);openBooking(b.dataset.car||null);}if(e.target.closest('[data-privacy]'))openDialog($('#privacy-dialog'));});
function setMenu(open){
  $('.menu-toggle').setAttribute('aria-expanded',String(open));$('#mobile-nav').hidden=!open;
  $('main').inert=open;$('[data-footer]').inert=open;
  document.body.classList.toggle('dialog-open',open||!!$$('dialog[open]').length);
  if(open){
    pauseHero();
    $('#mobile-nav a').focus({preventScroll:true});
  }else{
    playHero();
  }
}
$('.menu-toggle').addEventListener('click',()=>setMenu($('.menu-toggle').getAttribute('aria-expanded')!=='true'));
$$('#mobile-nav a').forEach(a=>a.addEventListener('click',()=>setMenu(false)));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#mobile-nav').hidden){setMenu(false);$('.menu-toggle').focus();}});
let scrollQueued=false;addEventListener('scroll',()=>{if(scrollQueued)return;scrollQueued=true;requestAnimationFrame(()=>{$('#site-header').classList.toggle('solid',scrollY>120);$('.mobile-cta').classList.toggle('is-visible',scrollY>600);scrollQueued=false;});},{passive:true});
document.body.insertAdjacentHTML('beforeend','<datalist id="lsbus-places"><option value="Аэропорт Пулково"><option value="Московский вокзал"><option value="Ладожский вокзал"><option value="Финляндский вокзал"><option value="Гранд Отель Европа"></datalist>');
$$('input[name=pickup],input[name=dropoff],input[name=end_place]').forEach(f=>f.setAttribute('list','lsbus-places'));
$$('input[type=time]').forEach(f=>f.step='600');
const now=new Date(),today=[now.getFullYear(),String(now.getMonth()+1).padStart(2,'0'),String(now.getDate()).padStart(2,'0')].join('-');$$('input[type=date]').forEach(f=>f.min=today);
function setPax(value,{keepCar=false}={}){const n=Number(value);if(!Number.isInteger(n)||n<1||n>500)return false;state.passengers=n;if(!keepCar)state.carId=null;renderPlan();return true;}
function drawCapacity(t){
  const count=Math.min(t.count,3),kind=t.car.group==='bus'?'Автобус':t.car.group==='mini'?'Микроавтобус':'Автомобиль';
  return Array.from({length:count},(_,i)=>{
    const occupied=Math.min(t.car.seats,Math.max(0,state.passengers-i*t.car.seats)),ratio=occupied/t.car.seats;
    const bus=`<svg viewBox="0 0 420 98" aria-hidden="true"><defs><clipPath id="load-window-${i}"><path d="M28 23H365Q375 23 379 34L387 51H28Z"/></clipPath></defs><path d="M14 19Q14 11 24 11H364Q388 11 396 34L408 67V77H14Z" fill="none" stroke="currentColor" stroke-width="1.3"/><path d="M28 23H365Q375 23 379 34L387 51H28Z" fill="none" stroke="currentColor" opacity=".2"/><g clip-path="url(#load-window-${i})"><rect x="28" y="23" width="${360*ratio}" height="29" fill="currentColor" opacity=".72"/>${Array.from({length:9},(_,k)=>`<path d="M${65+k*35} 21V53" stroke="#eeeae1" stroke-width="3"/>`).join('')}</g><path d="M14 63H408M348 55V76M370 55V76M393 57H400M21 59H27" fill="none" stroke="currentColor" stroke-width="1" opacity=".45"/><circle cx="76" cy="77" r="12" fill="#eeeae1" stroke="currentColor" stroke-width="1.4"/><circle cx="76" cy="77" r="5" fill="none" stroke="currentColor" opacity=".5"/><circle cx="330" cy="77" r="12" fill="#eeeae1" stroke="currentColor" stroke-width="1.4"/><circle cx="330" cy="77" r="5" fill="none" stroke="currentColor" opacity=".5"/></svg>`;
    const car=`<svg viewBox="0 0 420 98" aria-hidden="true"><path d="M20 63L38 49 109 37 149 13H258L311 40 378 49 402 66V79H20Z" fill="none" stroke="currentColor" stroke-width="1.4"/><path d="M124 37L154 20H252L288 39Z" fill="currentColor" opacity="${.3+ratio*.5}"/><path d="M207 19V39M25 65H397" fill="none" stroke="currentColor" opacity=".4"/><circle cx="89" cy="77" r="15" fill="#eeeae1" stroke="currentColor" stroke-width="1.4"/><circle cx="89" cy="77" r="6" fill="none" stroke="currentColor" opacity=".4"/><circle cx="335" cy="77" r="15" fill="#eeeae1" stroke="currentColor" stroke-width="1.4"/><circle cx="335" cy="77" r="6" fill="none" stroke="currentColor" opacity=".4"/></svg>`;
    return `<div class="capacity-unit">${t.car.group==='car'?car:bus}<div class="unit-label"><span>${kind}${t.count>1?' / '+String(i+1).padStart(2,'0'):''}</span><b>${occupied} из ${t.car.seats} мест</b></div></div>`;
  }).join('')+(t.count>count?`<p class="capacity-more">Ещё ${t.count-count} ${plural(t.count-count,['машина','машины','машин'])} в составе. Всего ${t.capacity} мест.</p>`:'');
}
function renderPlan(){
  const t=trip();if($('#hero-passengers'))$('#hero-passengers').value=state.passengers;if($('#planner-passengers'))$('#planner-passengers').value=state.passengers;if($('#people-range'))$('#people-range').value=Math.min(160,state.passengers);
  const title=t.count>1?t.count+' '+plural(t.count,['автобус','автобуса','автобусов'])+' Yutong':t.car.group==='bus'?'Туристический автобус':t.car.group==='mini'?'Mercedes-Benz Sprinter':t.car.name;
  if($('#quick-recommendation'))$('#quick-recommendation').textContent=t.count>1?'Подойдут '+t.count+' '+plural(t.count,['автобус','автобуса','автобусов'])+' · '+t.capacity+' мест всего':'Подойдёт '+(t.car.group==='bus'?'автобус':t.car.group==='mini'?'микроавтобус':'автомобиль')+' на '+t.car.seats+' мест';
  if($('#recommend-title')){
    $('#recommend-title').textContent=title;$('#recommend-description').textContent=t.count>1?`${t.count} × ${t.car.name}. Весь состав под один маршрут.`:`${t.car.name} · ${t.car.seats} пассажирских мест`;
    $('#recommend-count').textContent=String(t.count).padStart(2,'0')+' '+plural(t.count,['машина','машины','машин']);$('#recommend-capacity').textContent=t.capacity+' мест всего';
    $('#capacity').innerHTML=drawCapacity(t);
    $('#planner-amount').textContent=t.total===null?'от 75 ₽/км':rub(t.total);$('#planner-price-note').textContent=t.total===null?'Междугородние перевозки · расчёт по километражу':`${t.unit} · ориентировочно`;
    $('#planner-hours-row').hidden=['kids','intercity'].includes(state.occasion);$('#planner-hours').textContent=state.hours;
    $$('[data-occasion]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.occasion===state.occasion)));$$('[data-people]').forEach(b=>b.classList.toggle('is-active',Number(b.dataset.people)===state.passengers));
  }
  if(booking.open)syncBooking();
}
if(home){
  const consoleEl=$('.people-console');consoleEl.insertAdjacentHTML('afterbegin',`<div class="occasion-label overline">Повод поездки</div><div class="occasion-options" role="group" aria-label="Повод поездки">${OCC.map(([id,label])=>`<button type="button" data-occasion="${id}" aria-pressed="${id==='tour'}">${label}</button>`).join('')}</div>`);
  $('#people-range').insertAdjacentHTML('beforebegin','<p class="overline planner-pax-label">Пассажиров</p>');
  $('.people-shortcuts').insertAdjacentHTML('afterend',`<div class="planner-hours-row" id="planner-hours-row"><span>Часов с подачей<small>Минимум 3 часа + 1 час подачи</small></span><div class="number-control"><button type="button" data-hours="-1" aria-label="Меньше часов">−</button><output id="planner-hours">4</output><button type="button" data-hours="1" aria-label="Больше часов">+</button></div></div><div class="planner-total"><strong id="planner-amount"></strong><span id="planner-price-note"></span></div>`);
  $$('#hero-passengers,#planner-passengers,#people-range').forEach(input=>input.addEventListener('input',e=>setPax(e.target.value)));
  $$('[data-step]').forEach(b=>b.addEventListener('click',()=>setPax(Math.min(500,Math.max(1,state.passengers+Number(b.dataset.step))))));
  $$('[data-people]').forEach(b=>b.addEventListener('click',()=>setPax(Number(b.dataset.people))));
  $$('[data-occasion]').forEach(b=>b.addEventListener('click',()=>{state.occasion=b.dataset.occasion;state.carId=null;renderPlan();}));
  $$('[data-hours]').forEach(b=>b.addEventListener('click',()=>{state.hours=Math.max(4,Math.min(14,state.hours+Number(b.dataset.hours)));renderPlan();}));
  $$('[data-service]').forEach(b=>b.addEventListener('click',()=>{state.service=b.dataset.service;$('#quick-book [name=service]').value=state.service;state.occasion=state.service==='Трансфер'?'transfer':state.service==='Событие'?'wedding':'tour';$$('[data-service]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));const transfer=state.service==='Трансфер';$('.transfer-field').hidden=!transfer;$('.transfer-field input').disabled=!transfer;renderPlan();}));
  $('#quick-book').addEventListener('submit',e=>{e.preventDefault();if(!$('#quick-book').reportValidity())return;openBooking();});
  const showroom = {
    bus: {seats:'55', label:'пассажирских мест', models:'Higer · Yutong · Zhong Tong', description:'Для экскурсий, делегаций и больших групп. Можно собрать несколько автобусов на один маршрут.'},
    mini: {seats:'19', label:'пассажирских мест', models:'Mercedes-Benz Sprinter', description:'Для трансферов, экскурсий и выездов небольшой группой.'},
    car: {seats:'до 7', label:'пассажиров', models:'Mercedes-Maybach · Mercedes-Benz Vito', description:'Для индивидуальных трансферов. В Maybach три пассажирских места, в Vito — до семи.'}
  };
  $('[data-sequence=fleet]').addEventListener('cinema:select', ({detail: button}) => {
    const group = button.dataset.showroom;
    const entry = showroom[group];
    const prices = fleet.filter(car => car.group === group && car.price !== null).map(car => car.price);
    $('.fleet-theatre').dataset.group = group;
    $('#showroom-seats').textContent = entry.seats;
    $('#showroom-seats-label').textContent = entry.label;
    $('#showroom-description').textContent = entry.description;
    $('#showroom-models').textContent = entry.models;
    $('#showroom-price').innerHTML = prices.length ? 'от ' + rub(Math.min(...prices)) + ' <small>/ час</small>' : 'По запросу';
    $('#showroom-link').href = fleetHref + '?group=' + group;
    $$('[data-fleet-photo]').forEach(photo => {
      const active = photo.dataset.fleetPhoto === group;
      photo.classList.toggle('is-current', active);
      photo.setAttribute('aria-hidden', String(!active));
    });
  });
  const serviceViews = {
    tour: ['Обзорные экскурсии по Петербургу и поездки в пригороды. Подберём транспорт по размеру группы.', 'Обсудить экскурсию'],
    transfer: ['Встретим в аэропорту, на вокзале или у отеля. При подборе учтём число гостей, багаж и время прибытия.', 'Обсудить трансфер'],
    wedding: ['Соберём гостей по нужным адресам. Можно заказать общий транспорт и индивидуальные трансферы.', 'Обсудить событие'],
    staff: ['Регулярная доставка сотрудников до места работы и обратно. Согласуем адреса, смены и график.', 'Обсудить развозку'],
    kids: ['Поездки для школ, лагерей и детских групп. Уточним число детей и сопровождающих, маршрут и время подачи.', 'Обсудить детскую поездку'],
    intercity: ['Поездки по Ленинградской области и городам России. Стоимость зависит от маршрута и программы.', 'Обсудить маршрут']
  };
  let viewedService = 'tour';
  $('[data-sequence=stories]').addEventListener('cinema:select', ({detail: button}) => {
    viewedService = button.dataset.serviceView;
    const [description, action] = serviceViews[viewedService];
    $('#service-description').textContent = description;
    $('#service-book').textContent = action;
  });
  $('#service-book').addEventListener('click',()=>{state.occasion=viewedService;renderPlan();openBooking();});
  renderPlan();
}
bookingForm.addEventListener('input',e=>{
  if(e.target.name==='passengers'&&!setPax(e.target.value,{keepCar:true})) syncBooking();
  if(e.target.name==='occasion'){state.occasion=e.target.value;renderPlan();}
});
bookingForm.addEventListener('submit',async e=>{
  e.preventDefault();if(!bookingForm.reportValidity())return;
  const payload=Object.fromEntries(new FormData(bookingForm));const btn=bookingForm.querySelector('[type=submit]'),status=$('#form-status');
  if(!/^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(payload.phone)){status.className='form-status error';status.textContent='Введите 10 цифр после +7.';status.hidden=false;bookingForm.elements.phone.focus();return;}
  if (publicDemo) {
    status.className = 'form-status';
    status.textContent = 'Демонстрация завершена. Заявка не отправлена.';
    status.hidden = false;
    status.scrollIntoView({block:'nearest'});
    return;
  }
  btn.disabled=true;status.hidden=true;
  try{await getToken();payload.csrf=csrf;payload.request_id=submissionId;payload.hours=state.hours;payload.car_id=state.carId||'';const res=await fetch(requestUrl,{method:'POST',credentials:'same-origin',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});const result=await res.json();if(!res.ok||!result.ok)throw Error(result.message||'Не удалось отправить заявку.');status.className='form-status';status.textContent=result.mode==='preview'?`Тестовая заявка № ${result.reference} сохранена. Это проверка формы; менеджеру она не отправлена.`:`Заявка № ${result.reference} отправлена. Менеджер уточнит маршрут и условия поездки.`;status.hidden=false;status.scrollIntoView({behavior:'smooth',block:'nearest'});}
  catch(err){status.className='form-status error';status.textContent=err.message||'Не удалось отправить заявку. Позвоните нам, чтобы обсудить поездку.';status.hidden=false;}
  finally{btn.disabled=false;}
});
// The two video layers crossfade between the scenes.
let heroUserPaused=matchMedia('(prefers-reduced-motion: reduce)').matches||!!navigator.connection?.saveData;
const sceneOrder = ['city', 'road', 'detail'];
let activeReel = heroVideo, sceneKey = sceneOrder[0], heroVisible = true, pendingScene = null;
const nextScene = () => sceneOrder[(sceneOrder.indexOf(sceneKey) + 1) % sceneOrder.length];
const standbyReel = () => activeReel === heroVideo ? $('#hero-buffer') : heroVideo;
const sceneSource=key=>asset('assets/scene-'+key+(innerWidth<700?'-mobile':'')+'.mp4');
function updateFilmControl(){if(!heroVideo)return;$('#hero-pause').textContent=heroUserPaused?'Включить видео':'Пауза';$('#hero-pause').setAttribute('aria-label',heroUserPaused?'Включить фоновое видео':'Приостановить фоновое видео');}
function pauseHero(){if(heroVideo){heroVideo.pause();$('#hero-buffer').pause();}}
function playHero() {
  if (!activeReel || heroUserPaused || !heroVisible || document.hidden ||
      !$('#mobile-nav').hidden || $('dialog[open]')) return;
  if (activeReel.ended) {
    if (!pendingScene) loadScene(nextScene());
    return;
  }
  const playing = activeReel;
  playing.play().catch(error => {
    if (playing === activeReel && error.name === 'NotAllowedError') {
      heroUserPaused = true;
      updateFilmControl();
    }
  });
}
function warmNextScene() {
  if (pendingScene || heroUserPaused || !heroVisible || document.hidden) return;
  const buffer = standbyReel();
  const source = sceneSource(nextScene());
  if (buffer.getAttribute('src') === source) return;
  buffer.preload = 'auto';
  buffer.src = source;
  buffer.load();
}
function loadScene(key) {
  if (!heroVideo || !sceneOrder.includes(key)) return;
  const buffer = standbyReel();
  pendingScene = null;
  buffer.onloadeddata = null;
  buffer.onerror = null;
  if (key === sceneKey && activeReel.getAttribute('src')) {
    if (activeReel.ended) activeReel.currentTime = 0;
    playHero();
    return;
  }

  pendingScene = key;
  const source = sceneSource(key);
  const swap = () => {
    if (pendingScene !== key) return;
    pendingScene = null;
    buffer.onloadeddata = null;
    buffer.onerror = null;
    const previous = activeReel;
    activeReel = buffer;
    sceneKey = key;
    activeReel.classList.add('is-active');
    previous.classList.remove('is-active');
    previous.pause();
    playHero();
  };
  $('#scene-status').textContent = '';
  if (buffer.getAttribute('src') === source && buffer.readyState >= 2 && !buffer.error) {
    if (buffer.currentTime) buffer.currentTime = 0;
    swap();
    return;
  }
  buffer.onloadeddata = swap;
  buffer.onerror = () => {
    if (pendingScene !== key) return;
    pendingScene = null;
    $('#scene-status').textContent = 'Не удалось загрузить следующий фрагмент видео.';
  };
  buffer.preload = 'auto';
  if (buffer.getAttribute('src') !== source || buffer.error) {
    buffer.src = source;
    buffer.load();
  }
}
if(heroVideo){
  updateFilmControl();
  if(!heroUserPaused){heroVideo.src=sceneSource('city');heroVideo.muted=true;playHero();}
  $('#hero-pause').addEventListener('click',()=>{
    heroUserPaused=!heroUserPaused;updateFilmControl();
    if(heroUserPaused)pauseHero();else{if(!activeReel.getAttribute('src'))activeReel.src=sceneSource(sceneKey);playHero();}
  });
  $$('.reel').forEach(reel => {
    reel.addEventListener('ended', () => {
      if (reel === activeReel && !pendingScene) playHero();
    });
    reel.addEventListener('timeupdate', () => {
      if (reel !== activeReel || !reel.duration) return;
      if (!reel.paused && reel.duration - reel.currentTime < 3) warmNextScene();
    });
  });
  document.addEventListener('visibilitychange',()=>document.hidden?pauseHero():playHero());
  new IntersectionObserver(([entry])=>{heroVisible=entry.isIntersecting;if(heroVisible)playHero();else pauseHero();},{threshold:.08}).observe($('.hero'));
}
$$('[data-film]').forEach(b=>b.addEventListener('click',()=>{const film=$('#full-film');if(!film.src)film.src=asset('assets/film.mp4');pauseHero();openDialog(filmDialog);film.play().catch(()=>{});}));
filmDialog.addEventListener('close',()=>{$('#full-film').pause();playHero();});
const blogList = $('[data-blog-list]');
if (blogList && !publicDemo) {
  fetch('/lsbus-cinema/news', { headers: { Accept: 'application/json' } })
    .then(response => response.ok ? response.json() : null)
    .then(entries => {
      if (!Array.isArray(entries) || !entries.length) return;
      const articles = entries.filter(entry => entry && /^\/blog\/[a-z0-9-]+$/.test(entry.path) && entry.name);
      if (articles.length) {
        blogList.innerHTML = articles.slice(0, 3).map(({ path, name, description }) =>
          `<article><h3><a href="${path}">${esc(name)}</a></h3>${description ? '<p>'+esc(description)+'</p>' : ''}</article>`).join('');
      }
    }).catch(() => { /* Keep the published links when the CMS is unavailable. */ });
}
if(document.body.dataset.page==='fleet'){
  let group=new URLSearchParams(location.search).get('group')||'all';if(!['all','bus','mini','car'].includes(group))group='all';
  const names={bus:'Автобус',mini:'Микроавтобус',car:'Автомобиль'};
  function renderCatalog(){const pax=Number($('#catalog-passengers').value)||0;const cars=fleet.filter(c=>(group==='all'||c.group===group)&&(!pax||c.seats>=pax));$('#catalog-count').textContent=cars.length+' из '+fleet.length+' моделей';$$('[data-group]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.group===group)));$('#catalog-grid').innerHTML=cars.length?cars.map(c=>`<article class="vehicle-card"><a href="${vehicleHref(c.id)}"><div class="vehicle-image"><img src="${esc(photoUrl(c.photos[0]))}" alt="${esc(c.name)}" loading="lazy"></div><div class="vehicle-meta"><span>${names[c.group]}</span><span>${carCapacity(c)}</span></div><h2>${esc(c.name)}</h2><div class="price-row"><strong>${c.price===null?'По запросу':'от '+rub(c.price)+' / ч'}</strong><span>Подробнее о машине</span></div></a></article>`).join(''):`<div class="empty-state"><h2>Для ${esc(pax)} человек<br>подберём несколько машин.</h2><p>Расскажите о маршруте — согласуем состав транспорта.</p><button class="button dark" data-book>Рассчитать поездку</button><button class="button" id="catalog-reset">Сбросить фильтры</button></div>`;$('#catalog-reset')?.addEventListener('click',()=>{group='all';$('#catalog-passengers').value='';renderCatalog();});}
  $$('[data-group]').forEach(b=>b.addEventListener('click',()=>{group=b.dataset.group;renderCatalog();}));$('#catalog-passengers').addEventListener('input',e=>{if(Number(e.target.value)>0&&Number(e.target.value)<=500)state.passengers=Number(e.target.value);renderCatalog();});renderCatalog();
}
if(document.body.dataset.page==='transport'){
  const id=document.body.dataset.vehicle||new URLSearchParams(location.search).get('id')||'yutong-6122h9',car=fleet.find(c=>c.id===id);if(!car){$('#transport-content').innerHTML=`<section class="page-intro shell"><h1>Машина не найдена.</h1><a class="underlined" href="${fleetHref}">Вернуться в автопарк</a></section>`;}
  else{if(!publicRoutes)document.title=car.name+' с водителем — LSBUS';let slide=0,hours=4;$('#transport-name').textContent=car.name;$('#transport-breadcrumb').textContent=car.name;$('#transport-category').textContent=carCapacity(car)+' · Санкт-Петербург';$('#transport-copy').innerHTML=car.text.split('\n\n').map(paragraph=>'<p>'+esc(paragraph)+'</p>').join('');$('#transport-equipment').innerHTML=car.amen.map(a=>`<span>${esc(L.amen[a])}</span>`).join('');$('#transport-specs').innerHTML=[...car.specs,['Водитель','Включён в аренду']].map(([k,v])=>`<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');$('#transport-price').innerHTML=car.price===null?'По запросу':`от ${rub(car.price)} <small>за час</small>`;
    const priced=car.price!==null; $('.hours-control').hidden=!priced; $('.price-total').hidden=!priced;$('#transport-book').dataset.car=car.id;
    $('#gallery-dots').innerHTML=car.photos.map((src,i)=>`<button type="button" data-photo="${i}" aria-label="Фото ${i+1}" aria-pressed="${i===0}"><img src="${esc(photoUrl(src))}" alt="" loading="lazy"></button>`).join('');
    const drawGallery=()=>{$('#vehicle-photo').src=photoUrl(car.photos[slide]);$('#vehicle-photo').alt=car.name+' — '+(car.photoLabels?.[slide]||'фото '+(slide+1));$$('[data-photo]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.photo)===slide)));$('#gallery-count').textContent=(slide+1)+' / '+car.photos.length;};
    $$('[data-photo]').forEach(b=>b.addEventListener('click',()=>{slide=Number(b.dataset.photo);drawGallery();}));$('#gallery-previous').addEventListener('click',()=>{slide=(slide-1+car.photos.length)%car.photos.length;drawGallery();});$('#gallery-next').addEventListener('click',()=>{slide=(slide+1)%car.photos.length;drawGallery();});
    const drawPrice=()=>{$('#vehicle-hours').textContent=hours;$('#vehicle-total').textContent=rub(car.price*hours);$('#hours-less').disabled=hours===4;$('#hours-more').disabled=hours===14;state.hours=hours;};$('#hours-less').addEventListener('click',()=>{hours=Math.max(4,hours-1);drawPrice();});$('#hours-more').addEventListener('click',()=>{hours=Math.min(14,hours+1);drawPrice();});drawGallery();if(priced)drawPrice();
  }
}
})();
