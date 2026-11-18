const publicDemo = document.documentElement.hasAttribute('data-pages-demo');
if (publicDemo) {
  $('.local-note', request).textContent = 'Демонстрация формы. Данные заявки не отправляются.';
  $('.consent', request).lastChild.textContent = ' Понимаю, что это демонстрация формы.';
  request.elements.name.placeholder = 'Тестовое имя';
  request.elements.phone.placeholder = 'Тестовый номер';
  for (const field of ['name', 'phone']) request.elements[field].autocomplete = 'off';
  $('[type=submit]', request).textContent = 'Проверить заявку';
  $('#receipt p').textContent = 'Демонстрация завершена. Заявка не отправлена.';
}

const draftKey = 'lsbus-astra-route-v1';
let chosenPassengers = false;
function saveRoute() {
  const fields = request.elements;
  const route = {passengers:trip.passengers,hours:trip.hours,occasion:trip.occasion,chosenPassengers,
    pickup:fields.pickup.value,dropoff:fields.dropoff.value,date:fields.date.value};
  try {sessionStorage.setItem(draftKey,JSON.stringify(route));} catch {}
}
function restoreRoute() {
  let saved;
  try {saved=JSON.parse(sessionStorage.getItem(draftKey));} catch {return;}
  if (!saved) return;
  if (Number.isInteger(saved.passengers) && saved.passengers>=1 && saved.passengers<=500) {
    trip.passengers=saved.passengers;chosenPassengers=saved.chosenPassengers===true;
  }
  if (Number.isInteger(saved.hours) && saved.hours>=4 && saved.hours<=14) trip.hours=saved.hours;
  if (Object.hasOwn(purposeNames,saved.occasion)) trip.occasion=saved.occasion;
  for (const key of ['pickup','dropoff','date']) {
    if (typeof saved[key]!=='string') continue;
    request.elements[key].value=saved[key];
    if (journey) journey.elements[key].value=saved[key];
  }
}
restoreRoute();
function fillOptions(select, values) {
  for (const [value,label] of values) select.add(new Option(label,value));
}
for (const el of [$('#purpose'),request.elements.occasion]) el && fillOptions(el,Object.entries(purposeNames));
const durations = Array.from({length:11},(_,i) => [String(i+4),(i+4)+' ч']);
for (const el of [$('#hours'),request.elements.hours]) el && fillOptions(el,durations);
function estimate(preferred) {
  const result = LSCalculator.calculateTrip({fleet,...trip});
  const car = preferred && fleet.find(c => c.id === preferred);
  if (!car) return result;
  const count = Math.ceil(trip.passengers/car.seats);
  let total = car.price*count*trip.hours;
  if (trip.occasion === 'intercity') total = null;
  if (trip.occasion === 'kids') total = (car.seats>=49?12200:car.seats>=19?8400:8000)*count;
  return {...result,car,count,total,capacity:car.seats*count};
}
const estimatePrice = r => r.total === null ? 'По маршруту' : 'от '+money(r.total);
function update() {
  const r = estimate(null), choice = estimate(trip.preferred);
  for (const el of [$('#pax'),$('#pax-number'),journey?.elements.passengers,request.elements.passengers]) {
    if (el && el.value !== String(trip.passengers)) el.value = trip.passengers;
  }
  request.elements.occasion.value=trip.occasion;request.elements.hours.value=trip.hours;
  if ($('#ticket-model')) {
  $('#purpose').value=trip.occasion;
  $('#hours').value=trip.hours;
  const photo = $('#quote-photo');
  const file = 'media/vehicles/'+r.car.photos[0]+'.jpg';
  if (photo.getAttribute('src') !== file) {
    photo.src=file;photo.alt=r.car.name;
  }
  $('#quote-link').href='vehicle-'+r.car.id+'.html';
  $('#ticket-model').textContent=(r.count>1 ? r.count+' × ' : '')+r.car.name;
  const composition=$('#composition');composition.replaceChildren();
  let remaining = r.passengers;
  for (let i=0;i<Math.min(3,r.count);i++) {
    const used=Math.min(remaining,r.car.seats);remaining-=used;
    const row=document.createElement('div'),bar=document.createElement('i');row.className='occupancy';bar.className='capacity-bar';bar.style.setProperty('--used',100*used/r.car.seats+'%');
    row.append(bar,document.createTextNode(used+' из '+r.car.seats+' мест'));composition.append(row);
  }
  if (remaining>0) composition.append('Ещё пассажиров: '+remaining);
  $('#ticket-cost').textContent=estimatePrice(r);
  $('#ticket-unit').textContent=r.total===null?'Стоимость уточнит менеджер':r.occasion==='kids'?'За детскую экскурсию':'За '+r.hours+' ч с подачей';
  }
  $('#booking-model').textContent=(choice.count>1?choice.count+' × ':'')+choice.car.name;
  $('#booking-cost').textContent=estimatePrice(choice)+' · '+trip.passengers+' пасс.';
  $('#auto-model').hidden=!trip.preferred;
}
function watchPax(el) {
  el.addEventListener('input',() => {
    const n=Number(el.value);
    if (Number.isInteger(n) && n>=1 && n<=500) {trip.passengers=n;chosenPassengers=true;update();saveRoute();}
  });
  el.addEventListener('change',() => {if (!el.validity.valid) el.reportValidity();});
}
for (const el of [$('#pax'),$('#pax-number'),journey?.elements.passengers,request.elements.passengers]) el && watchPax(el);
for (const el of [$('#hours'),request.elements.hours]) if (el) el.onchange=() => {trip.hours=Number(el.value);update();saveRoute();};
for (const el of [$('#purpose'),request.elements.occasion]) if (el) el.onchange=() => {trip.occasion=el.value;update();saveRoute();};
for (const field of ['pickup','dropoff','date']) {
  if (journey) journey.elements[field].oninput=() => {
    request.elements[field].value=journey.elements[field].value;saveRoute();
  };
  request.elements[field].oninput=() => {
    if (journey) journey.elements[field].value=request.elements[field].value;
    saveRoute();
  };
}
function newId() {return Array.from(crypto.getRandomValues(new Uint8Array(16)),b => b.toString(16).padStart(2,'0')).join('');}
function openBooking(preferred = null) {
  if (!$('#receipt').hidden) {
    request.reset(); $('#receipt').hidden=true;request.hidden=false;
  }
  trip.preferred=preferred;
  const model = preferred && fleet.find(car=>car.id===preferred);
  if (model && !chosenPassengers) trip.passengers=Math.min(19,model.seats);
  update();
  if (journey) for (const field of ['pickup','dropoff','date']) request.elements[field].value=journey.elements[field].value;
  if (!requestId) requestId=newId();
  $('.error',request).textContent='';openDialog(booking);booking.scrollTop=0;
}
if (journey) journey.onsubmit=e => {e.preventDefault();openBooking();};
$$('[data-book]').forEach(b=>b.onclick=() => {if (b.dataset.occasion) trip.occasion=b.dataset.occasion;openBooking(b.dataset.model || null);saveRoute();});

$('#auto-model').onclick=() => {trip.preferred=null;update();};
$('#receipt button').onclick=() => booking.close();
request.elements.date.min=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Moscow'}).format(new Date());
if (journey) journey.elements.date.min=request.elements.date.min;
request.onsubmit=async e => {
  e.preventDefault();
  const submit=$('[type=submit]',request), error=$('.error',request);
  const fields=Object.fromEntries(new FormData(request));
  const phone=fields.phone.replace(/\D/g,'');
  if (phone.length<10 || phone.length>15) {error.textContent='Проверьте номер телефона.';request.elements.phone.focus();return;}
  if (publicDemo) {
    request.hidden = true;
    $('#receipt strong').textContent = estimatePrice(estimate(trip.preferred));
    $('#receipt').hidden = false;
    booking.scrollTop = 0;
    $('#receipt button').focus();
    return;
  }
  submit.disabled=true;error.textContent='';
  try {
    const api='api/request.php';
    const session=await fetch(api,{cache:'no-store'});if (!session.ok) throw Error('Не удалось открыть форму. Попробуйте ещё раз.');
    const {csrf}=await session.json();
    const response=await fetch(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...fields,csrf,request_id:requestId,consent:'1',car_id:estimate(trip.preferred).car.id})});
    const data=await response.json();
    if (!response.ok || !data.ok) throw Error(data.message || 'Не удалось сохранить заявку.');
    try {sessionStorage.removeItem(draftKey);} catch {}
    $('#receipt strong').textContent=data.reference;request.hidden=true;$('#receipt').hidden=false;requestId='';booking.scrollTop=0;$('#receipt button').focus();
  } catch (err) {error.textContent=err instanceof TypeError?'Проверьте подключение и повторите отправку.':err.message;}
  finally {submit.disabled=false;}
};
update();


if(journey){
  const date = journey.elements.date;
  const display = $('.date-display',journey);
  const presentDate = () => {
    display.textContent = date.value ? new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'short',year:'2-digit'}).format(new Date(date.value+'T12:00:00')) : 'Выбрать';
  };
  date.addEventListener('input',presentDate);
  request.elements.date.addEventListener('input',presentDate);
  presentDate();
}
