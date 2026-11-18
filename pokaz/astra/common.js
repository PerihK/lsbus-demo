'use strict';

const $ = (selector, scope = document) => scope.querySelector(selector);
const $$ = (selector, scope = document) => Array.from(scope.querySelectorAll(selector));
const money = value => new Intl.NumberFormat('ru-RU').format(value) + ' ₽';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const fleet = window.LS.fleet;
const journey = $('#journey');
const request = $('#request');
const booking = $('#booking');
const gallery = $('#gallery');
const film = $('#film-dialog');
const purposeNames = {tour:'Экскурсия', transfer:'Трансфер', wedding:'Свадьба', staff:'Развозка', kids:'Детская поездка', intercity:'Межгород'};
const trip = {passengers:19, hours:4, occasion:'tour', preferred:null};
let requestId = '';

function openDialog(dialog) {
  dialog.showModal();
  document.body.classList.add('modal-open');
}
for (const dialog of $$('dialog')) {
  $('.dismiss', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => document.body.classList.toggle('modal-open', !!$('dialog[open]')));
}
$('.menu-open').onclick = () => openDialog($('#navigation'));
for (const a of $$('#navigation nav a')) a.onclick = () => $('#navigation').close();
