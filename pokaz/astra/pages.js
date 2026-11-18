const filters=$$('[data-filter]');
if(filters.length){
  let group='all';const search=$('#car-search');
  function apply(){
    const query=search.value.trim().toLowerCase();let count=0;
    for(const car of $$('.catalog-car')){
      car.hidden=!((group==='all'||car.dataset.group===group)&&car.dataset.name.includes(query));
      if (!car.hidden) count++;
    }
    $('#result-count').textContent='Найдено моделей: '+count;$('#no-cars').hidden=count!==0;
    filters.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.filter===group)));
  }
  search.addEventListener('input',apply);
  filters.forEach(b=>b.onclick=()=>{group=b.dataset.filter;apply();});
  $('#reset-filter').onclick=()=>{group='all';search.value='';apply();search.focus();};apply();
}
const zoom=$('#enlarge');
if(zoom){
  const thumbs=$$('[data-photo]'), image=$('.hero-photo'), box=$('#lightbox'), full=$('img',box);
  let selected=0;
  function select(i){
    if(thumbs.length){
      selected=(i+thumbs.length)%thumbs.length;
      const source=thumbs[selected];image.src=source.dataset.photo;image.alt=source.getAttribute('aria-label');
      thumbs.forEach((b,j)=>b.setAttribute('aria-pressed',String(j===selected)));
    }
    full.src=image.src;full.alt=image.alt;
    $('.lightbox-controls',box).hidden=thumbs.length<2;
    $('.lightbox-controls span',box).textContent=(selected+1)+' / '+thumbs.length;
  }
  thumbs.forEach((b,i)=>b.onclick=()=>select(i));
  $$('[data-slide]',box).forEach(b=>b.onclick=()=>select(selected+Number(b.dataset.slide)));
  box.addEventListener('keydown',e=>{if(e.key==='ArrowRight')select(selected+1);if(e.key==='ArrowLeft')select(selected-1);});
  zoom.onclick=()=>{select(selected);openDialog(box);};
}
