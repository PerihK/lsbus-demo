'use strict';
(() => {
const d=document, $=id=>d.getElementById(id), L=window.LS;
if(!L)return;
const home=d.body.dataset.page==='home';
const slot=$('catalog-search-slot');
if(slot){slot.append($('header-search'));$('catalog-actions').append(d.querySelector('.header-tools'));}
if(!home)return;
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const rub=n=>Math.round(n).toLocaleString('ru-RU')+' ₽';
const serviceLabels={tour:'Туристическим группам',staff:'Служебная развозка',transfer:'Трансферные перевозки',kids:'Перевозка детей',wedding:'Автобусы на свадьбу',intercity:'Междугородние поездки'};
$('service-menu').innerHTML=L.services.map((s,i)=>`<button class="service-item ${i?'':'active'}" type="button" data-service="${s.id}" aria-pressed="${!i}"><span class="service-n">0${i+1}</span><span>${serviceLabels[s.id]}</span></button>`).join('');
let selected=-1;
function selectService(i){if(selected===i)return;selected=i;const s=L.services[i],im=$('service-photo');im.src=`../img/${s.img}.jpg`;im.alt=s.name;$('service-name').textContent=serviceLabels[s.id];$('service-description').textContent=s.text;$('service-price').textContent=s.price;$('service-position').textContent=`0${i+1} / 06`;$('service-order').dataset.route=serviceLabels[s.id];$('service-order').setAttribute('data-order','');d.querySelectorAll('.service-item').forEach((b,j)=>{b.classList.toggle('active',j===i);b.setAttribute('aria-pressed',String(j===i));});if(!matchMedia('(prefers-reduced-motion:reduce)').matches){im.animate([{transform:'scale(1.035)',opacity:.6},{transform:'scale(1)',opacity:1}],{duration:650,easing:'cubic-bezier(.2,.7,.2,1)'});$('service-name').animate([{transform:'translateY(12px)',opacity:.3},{transform:'translateY(0)',opacity:1}],{duration:400,easing:'ease-out'});}}
d.querySelectorAll('.service-item').forEach((b,i)=>{b.onclick=()=>selectService(i);b.onmouseenter=()=>{if(matchMedia('(hover:hover)').matches)selectService(i);};});
selectService(0);
$('fare-table').innerHTML=L.fleet.map(c=>`<a class="fare-row" href="kartochka.html?v=9&id=${c.id}"><img src="../img/${c.photos[0]}.jpg" alt="${esc(c.name)}" loading="lazy"><h3>${esc(c.name.replace('Mercedes-Benz ',''))}</h3><span class="fare-amenities">${c.amen.slice(0,3).map(a=>L.amen[a]).join(' · ')||'Оснащение уточняйте'}</span><span class="fare-capacity">${c.seats}${c.guide?' + гид':''}</span><span class="fare-price">${rub(c.price)} <small>/ час, от</small></span></a>`).join('');
const scene=$('journey-scene'),svg=$('journey-mask'),text=$('mask-type'),group=$('mask-group');let geometry={x:0,y:0,sw:30};
function fitMask(){const w=scene.clientWidth,h=scene.clientHeight;svg.setAttribute('viewBox',`0 0 ${w} ${h}`);['mask-base','mask-cover'].forEach(id=>{$(id).setAttribute('width',w);$(id).setAttribute('height',h);});const mobile=w<701,lines=mobile?['LS','BUS']:['LSBUS'];const cv=d.createElement('canvas');cv.width=w;cv.height=h;const c=cv.getContext('2d',{willReadFrequently:true});c.font='800 100px InterTight';const natural=Math.max(...lines.map(s=>c.measureText(s).width-2*s.length));const fs=Math.min(100*w*.94/natural,h*(mobile?.26:.60));const center=h*(mobile?.36:.47);const first=center+fs*.35-(lines.length-1)*fs*.84/2;text.setAttribute('font-size',fs);text.setAttribute('letter-spacing',-fs*.025);text.innerHTML=lines.map((s,i)=>`<tspan x="${w/2}" y="${first+i*fs*.84}">${s}</tspan>`).join('');c.font=`800 ${fs}px InterTight`;c.textAlign='center';if('letterSpacing' in c)c.letterSpacing=`${-fs*.025}px`;c.fillText(lines[0],w/2,first);const y=Math.max(0,Math.round(first-fs*.4)),row=c.getImageData(0,y,w,1).data;let a=-1,b=-1;for(let x=0;x<w;x++){const on=row[x*4+3]>128;if(on&&a<0)a=x;if(!on&&a>=0){b=x;break;}}geometry={x:a>=0?(a+b)/2:w*.15,y,sw:a>=0?Math.max(2,b-a):fs*.12};}
fitMask();
const fonts=d.fonts?d.fonts.ready:Promise.resolve();
fonts.then(()=>{
 fitMask();const G=window.gsap,ST=window.ScrollTrigger;
 if(!G||!ST||matchMedia('(prefers-reduced-motion:reduce)').matches){addEventListener('resize',fitMask);return;}
 G.registerPlugin(ST);
 const z={s:1};const transform=()=>group.setAttribute('transform',`translate(${geometry.x} ${geometry.y}) scale(${z.s}) translate(${-geometry.x} ${-geometry.y})`);
 const headerHeight=()=>$('site-header').offsetHeight;
 const mm=G.matchMedia();
 mm.add({mobile:'(max-width:700px)',desktop:'(min-width:701px)'},()=>{
  fitMask();z.s=1;transform();
  const tl=G.timeline({scrollTrigger:{trigger:'#journey-hero',start:()=>`top ${headerHeight()}px`,end:()=>'+='+Math.min(scene.clientHeight*.85,680),pin:scene,scrub:.65,anticipatePin:1,invalidateOnRefresh:true}});
  tl.to('#journey-intro',{autoAlpha:0,y:-15,duration:.18,ease:'none'},0)
    .to(z,{s:()=>Math.max(scene.clientWidth,scene.clientHeight)*2.5/geometry.sw,duration:.76,ease:'power2.in',onUpdate:transform},0)
    .to('#mask-cover',{opacity:0,duration:.30,ease:'power1.inOut'},.25)
    .to('#journey-panorama',{scale:1,duration:.85,ease:'none'},0)
    .fromTo('#journey-reveal',{autoAlpha:0,y:25},{autoAlpha:1,y:0,duration:.25,ease:'power1.out'},.5)
    .to({},{duration:.1});
  const cabin=G.timeline({scrollTrigger:{trigger:'#cabin-editorial',start:()=>`top ${headerHeight()}px`,end:()=>'+='+Math.min(innerHeight*.42,420),pin:'.cabin-scene',scrub:.65,anticipatePin:1}});
  cabin.fromTo('#cabin-photo',{clipPath:'inset(13% 25% 13% 25%)',scale:1.12},{clipPath:'inset(0% 0% 0% 0%)',scale:1,duration:1,ease:'power2.inOut'},0)
    .fromTo('.cabin-type span:first-child',{xPercent:0},{xPercent:-12,duration:1,ease:'none'},0)
    .fromTo('.cabin-type span:last-child',{xPercent:0},{xPercent:12,duration:1,ease:'none'},0)
    .fromTo('.cabin-caption',{opacity:0},{opacity:1,duration:.3},.65);
  return()=>{group.removeAttribute('transform');};
 });
 let resize;addEventListener('resize',()=>{clearTimeout(resize);resize=setTimeout(()=>{fitMask();transform();ST.refresh();},180);});
 addEventListener('load',()=>ST.refresh(),{once:true});
});
})();
