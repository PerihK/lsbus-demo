const menu = document.querySelector('.site-menu');
const menuControl = document.querySelector('.top-actions .menu-control');
if (typeof menu.showModal === 'function') {
  menuControl.hidden = false;
  menuControl.addEventListener('click', () => menu.showModal());
}

if ('IntersectionObserver' in window) {
  const revealer = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }
  }, { threshold: 0.08 });
  document.documentElement.classList.add('motion');
  for (const item of document.querySelectorAll('.appear')) revealer.observe(item);
}

const engine = document.querySelector('.engine');
if (engine) {
  const descriptions = {
    bay: ['Моторный отсек.', 'У этого автобуса двигатель установлен сзади. К нему подходят через поднятый сервисный люк.'],
    axle: ['Задняя ось.', 'Принимает нагрузку задней части автобуса. У этой компоновки она ведущая: крутящий момент поступает на задние колёса.'],
    diesel: ['Дизельный двигатель.', 'На схеме он вынесен из отсека. Переключитесь на крупный план, чтобы увидеть основные детали.'],
    head: ['Головка блока.', 'В ней находятся клапаны, которые впускают воздух и выпускают отработавшие газы.'],
    block: ['Блок цилиндров.', 'В цилиндрах движутся поршни. Через шатуны они передают усилие коленчатому валу.'],
    turbo: ['Турбокомпрессор.', 'Отработавшие газы вращают турбину. Компрессор подаёт больше воздуха в цилиндры.'],
  };
  const views = engine.querySelectorAll('[data-view]');
  const panels = engine.querySelectorAll('[data-panel]');
  for (const view of views) {
    view.addEventListener('click', () => {
      for (const control of views) control.setAttribute('aria-pressed', String(control === view));
      for (const panel of panels) panel.hidden = panel.dataset.panel !== view.dataset.view;
    });
  }

  for (const panel of panels) {
    const controls = panel.querySelectorAll('[data-part]');
    const note = panel.querySelector('.engine-note');
    panel.addEventListener('click', event => {
      const button = event.target.closest('[data-part]');
      if (!button || button.getAttribute('aria-pressed') === 'true') return;
      const key = button.dataset.part;
      for (const control of controls) control.setAttribute('aria-pressed', String(control.dataset.part === key));
      const [title, text] = descriptions[key];
      const label = document.createElement('strong');
      label.textContent = title;
      note.replaceChildren(label, ' ' + text);
    });
  }
  for (const control of engine.querySelectorAll('.engine-views, .engine-markers, .engine-panel')) {
    control.hidden = false;
  }
}

const viewer = document.querySelector('.photo-viewer');
if (viewer && typeof viewer.showModal === 'function') {
  const thumbnails = Array.from(document.querySelectorAll('[data-photo]'));
  const large = viewer.querySelector('img');
  const caption = viewer.querySelector('figcaption');
  let current = 0;

  function showPhoto(number) {
    current = (number + thumbnails.length) % thumbnails.length;
    const tile = thumbnails[current];
    large.src = tile.href;
    large.alt = tile.querySelector('img').alt;
    caption.textContent = large.alt + ' · Иллюстрация';
  }

  thumbnails.forEach((tile, position) => tile.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    showPhoto(position);
    viewer.showModal();
  }));
  viewer.querySelector('[data-previous]').addEventListener('click', () => showPhoto(current - 1));
  viewer.querySelector('[data-next]').addEventListener('click', () => showPhoto(current + 1));
}

const booking = document.querySelector('.booking');
if (booking) {
  const { service, format, vehicle, phone } = booking.elements;
  const label = booking.querySelector('[data-vehicle-label]');
  const status = booking.querySelector('.form-status');
  const notes = document.querySelectorAll('[data-note]');
  const parkNote = document.querySelector('.park-note');
  const params = new URLSearchParams(location.search);
  const requested = params.get('service');

  if (Array.from(service.options).some(option => option.value === requested)) service.value = requested;
  if (params.get('format') === 'park') format.value = 'park';

  function updateBooking() {
    const park = format.value === 'park';
    const key = !service.value || service.value === 'other' ? 'default' : service.value;
    for (const note of notes) note.hidden = note.dataset.note !== key;
    parkNote.hidden = !park;
    label.textContent = park ? 'Количество машин и модели' : 'Марка и модель';
    vehicle.placeholder = park ? 'Например, 3 автобуса Yutong' : 'Например, Yutong';
  }

  booking.addEventListener('change', updateBooking);
  booking.addEventListener('input', () => { status.textContent = ''; });
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  booking.addEventListener('submit', event => {
    event.preventDefault();
    const length = phone.value.replace(/\D/g, '').length;
    if (length < 10 || length > 15) {
      phone.setCustomValidity('Введите телефон с кодом.');
      phone.reportValidity();
      return;
    }
    status.textContent = 'Данные проверены. Это демо, заявка не отправлена.';
  });

  updateBooking();
  booking.querySelector('.booking-fields').disabled = false;
}
