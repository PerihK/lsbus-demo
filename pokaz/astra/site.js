const feature = $('video', film);
function initFilm() {
  const keys = ['square','embankment','highway'];
  const layers = $$('.film-layers video');
  const portrait = matchMedia('(max-aspect-ratio: 2/3)');
  const tablet = matchMedia('(max-aspect-ratio: 4/3)');
  const pause = $('.pause');
  let index = 0, active = 0, inView = true, stopped = reduced.matches, generation = 0;
  const allowed = () => !stopped && inView && !document.hidden && !$('dialog[open]');
  const source = i => 'media/' + keys[i] + (portrait.matches ? '-portrait' : tablet.matches ? '-tablet' : '') + '.mp4';
  function load(video, i) {
    if (video.getAttribute('src') === source(i)) return;
    video.preload = 'auto'; video.src = source(i); video.load();
  }
  function reflect() {
    pause.setAttribute('aria-label', stopped ? 'Воспроизвести видео' : 'Приостановить видео');
    $('span', pause).textContent = stopped ? '▷' : 'Ⅱ';
    $$('[data-shot]').forEach((b,i) => b.setAttribute('aria-pressed',String(index === i)));
  }
  function poster(i) {
    $('.backdrop .portrait').srcset = 'media/' + keys[i] + '-portrait.jpg';
    $('.backdrop .tablet').srcset = 'media/' + keys[i] + '-tablet.jpg';
    $('.backdrop img').src = 'media/' + keys[i] + '.jpg';
  }
  function playCurrent() {
    const token = ++generation;
    if (!allowed()) { layers.forEach(v => v.pause()); return; }
    const v = layers[active];
    load(v,index);
    v.play().then(() => {
      if (generation !== token || !allowed()) return;
      v.classList.add('visible');
      const prev = layers[1-active];
      prev.classList.remove('visible');
      // Keep the outgoing frame painted through the dissolve.
      setTimeout(() => {
        if (generation !== token) return;
        prev.pause(); load(prev,(index+1)%keys.length);
      },650);
    }).catch(error => {
      if (generation !== token || error.name === 'AbortError') return;
      stopped = true; layers.forEach(layer => layer.classList.remove('visible'));poster(index); reflect();
    });
  }
  function change(i) {
    if (i === index) return;
    active = 1-active; index = i; reflect(); poster(i);
    if (allowed()) {load(layers[active],i); layers[active].currentTime = 0;}
    else layers.forEach(v => v.classList.remove('visible'));
    playCurrent();
  }
  layers.forEach((v,i) => {v.onended = () => {if (active === i && allowed()) change((index+1)%keys.length);};});
  $$('[data-shot]').forEach((b,i) => b.onclick = () => change(i));
  pause.onclick = () => {stopped = !stopped; reflect(); playCurrent();};
  reduced.onchange = () => {stopped = reduced.matches; reflect(); playCurrent();};
  portrait.onchange = tablet.onchange = () => {layers.forEach(v => v.classList.remove('visible')); poster(index); playCurrent();};
  document.addEventListener('visibilitychange',playCurrent);
  new MutationObserver(playCurrent).observe(document.body,{attributes:true,attributeFilter:['class']});
  new IntersectionObserver(([entry]) => {inView=entry.isIntersecting;playCurrent();}).observe($('.opening'));
  $('.play-film').onclick = () => {
    openDialog(film); if (!feature.getAttribute('src')) feature.src='../media/film.mp4';
    feature.play().catch(() => {});
  };
  const expand = $('.expand', film);
  expand.hidden = !(feature.requestFullscreen || feature.webkitEnterFullscreen);
  expand.onclick = async () => {
    if (document.fullscreenElement) await document.exitFullscreen();
    else if (feature.requestFullscreen) await feature.requestFullscreen().catch(() => {});
    else if (feature.webkitEnterFullscreen) feature.webkitEnterFullscreen();
  };
  document.addEventListener('fullscreenchange', () => {
    expand.textContent = document.fullscreenElement === feature ? 'Выйти из полного экрана' : 'Во весь экран';
  });
  film.addEventListener('close',() => feature.pause());
  reflect();
}
initFilm();

const showroomGroups = {
  bus: {file:'media/collection/riverside.webp', title:'Туристические автобусы', heading:'Модели автобусов', limit:53},
  mini: {file:'media/hotel.webp', title:'Микроавтобусы с водителем', heading:'Модели микроавтобусов', limit:20},
  car: {file:'media/motorcade.webp', title:'Седаны и минивэны', heading:'Седаны и минивэны', limit:7}
};
let currentSlide = 0;
const slides = [
  {src:'media/collection/sprinter-interior.webp',label:'Салон микроавтобуса'},
  {src:'media/collection/coach-interior.webp',label:'Пассажирские кресла туристического автобуса'},
  {src:'media/vehicles/yutong-6128-bagazh.jpg',label:'Багажное отделение Yutong'}
];
function drawSlide(i) {
  currentSlide = (i + slides.length) % slides.length;
  const slide = slides[currentSlide];
  $('#detail-img').src = slide.src; $('#detail-img').alt = slide.label;
  $('#photo-count').textContent = (currentSlide+1) + ' / ' + slides.length;
  $('.gallery-steps').hidden = slides.length < 2;
}
$('#prev').onclick = () => drawSlide(currentSlide-1);
$('#next').onclick = () => drawSlide(currentSlide+1);
gallery.addEventListener('keydown',event => {
  if (event.key === 'ArrowLeft') drawSlide(currentSlide-1);
  if (event.key === 'ArrowRight') drawSlide(currentSlide+1);
});
$('#see-interior').onclick = () => {drawSlide(0);openDialog(gallery);};
$('#detail-book').onclick = () => {gallery.close();openBooking();};
function modelCard(car) {
  const card = document.createElement('article');
  card.className = 'model-tile';
  const url = 'vehicle-'+car.id+'.html';
  const exterior = car.photos[0], cabin = car.photos.find(photo => photo.includes('salon'));
  const name = car.name + (car.id==='sprinter-leather' ? ' · кожа' : '');
  card.innerHTML = `<div class="model-visual"><a href="${url}" aria-label="${name} — фотографии и характеристики">
    <img loading="lazy" src="media/vehicles/${exterior}.jpg" alt="${name}"></a></div>
    <div class="model-meta"><span>${car.seats} мест</span><span>от ${money(car.price)}/ч</span></div>
    <h4><a href="${url}">${name}</a></h4><div class="model-actions"><a href="${url}">Подробнее</a><button type="button">Заказать</button></div>`;
  $('.model-actions button',card).onclick = () => openBooking(car.id);
  if (cabin) {
    const toggle = document.createElement('button');
    toggle.type='button';toggle.className='cabin-switch';toggle.textContent='Салон';
    toggle.setAttribute('aria-label','Показать салон '+name);
    toggle.onclick=()=>{
      const inside = toggle.textContent==='Салон';
      const image=$('img',card);
      image.src='media/vehicles/'+(inside ? cabin : exterior)+'.jpg';
      image.alt=inside ? 'Салон '+name : name;
      toggle.textContent=inside?'Кузов':'Салон';
      toggle.setAttribute('aria-label','Показать '+toggle.textContent.toLowerCase()+' '+name);
    };
    $('.model-visual',card).append(toggle);
  }
  return card;
}
function drawGroup(id, animate=false) {
  const group=showroomGroups[id], scene=$('.motor-scene'), image=$('#group-photo');
  image.src=group.file;image.alt=group.title+' LSBUS';
  scene.dataset.current=id;
  $('#seat-limit').textContent=group.limit;
  $('#group-name').textContent=group.title;
  $('#models-heading').textContent=group.heading;
  $$('[data-class]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.class===id)));
  $('#model-list').replaceChildren(...fleet.filter(c=>c.group===id).map(modelCard));
  if(animate && !reduced.matches){
    image.animate([{opacity:.5},{opacity:1}],{duration:520,easing:'cubic-bezier(.16,1,.3,1)'});
  }
}
$$('[data-class]').forEach(b=>b.onclick=()=>drawGroup(b.dataset.class,true));
drawGroup('bus');


// Scrolling edits a sequence of three stills, with a fixed camera frame.
const inside = $('#inside');
const wall = $('.interior-wall');
const layers = $$('.story-layer');
const episodes = [
  ['У места подачи','В заявке можно указать отель, вокзал или точный адрес встречи.'],
  ['По Петербургу','Для экскурсии добавьте в маршрут остановки и место, где забрать группу.'],
  ['За городом','Для междугородней поездки укажите город назначения и дату обратного рейса.']
];
const dial = $$('.story-dial button');
let sequenceVisible = false, pendingFrame = false, episode = -1;
function renderEpisode(index) {
  if (index === episode) return;
  episode = index;
  const [title,caption] = episodes[index];
  $('#inside-title').textContent=title;
  $('#inside-caption').textContent=caption;
  dial.forEach((el,i)=>el.setAttribute('aria-pressed',String(index===i)));
}
function frame() {
  pendingFrame=false;
  if(!sequenceVisible || reduced.matches) return;
  const bounds=inside.getBoundingClientRect();
  const travel=bounds.height-$('.interlude',inside).offsetHeight;
  const progress=Math.max(0,Math.min(1,-bounds.top/Math.max(1,travel)));
  const mix=(a,b)=>Math.max(0,Math.min(1,(progress-a)/(b-a)));
  layers[0].style.opacity=mix(.22,.41);layers[1].style.opacity=mix(.61,.81);
  wall.style.setProperty('--drift',(progress-.5)*25+'px');
  renderEpisode(progress<.32?0:progress<.71?1:2);
}
function schedule() {if(!pendingFrame && sequenceVisible){pendingFrame=true;requestAnimationFrame(frame);}}
dial.forEach((button,i)=>button.onclick=()=>{
  if(reduced.matches){layers.forEach((im,j)=>im.style.opacity=Number(j<i));renderEpisode(i);return;}
  const travel=inside.offsetHeight-$('.interlude',inside).offsetHeight;
  window.scrollTo({top:scrollY+inside.getBoundingClientRect().top+travel*[0,.50,1][i],behavior:'smooth'});
});
new IntersectionObserver(([entry])=>{sequenceVisible=entry.isIntersecting;schedule();}).observe(inside);
addEventListener('scroll',schedule,{passive:true});addEventListener('resize',schedule);
reduced.addEventListener('change',()=>{if(reduced.matches){layers.forEach(im=>im.style.opacity=0);renderEpisode(0);}else schedule();});
