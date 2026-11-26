const menu = document.querySelector('.site-menu');
const menuToggle = document.querySelector('.menu-toggle');
if (typeof menu.showModal === 'function') {
  menuToggle.hidden = false;
  menuToggle.addEventListener('click', () => menu.showModal());
}

if ('IntersectionObserver' in window) {
  const reveal = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.08 });

  document.documentElement.classList.add('motion-ready');
  for (const element of document.querySelectorAll('.rise')) reveal.observe(element);
}

const story = document.querySelector('.story');
if (story) {
  const steps = Array.from(story.querySelectorAll('[data-step]'));
  const pictures = Array.from(story.querySelectorAll('[data-picture]'));
  const controls = Array.from(story.querySelectorAll('.story-stage nav a'));
  let active = -1;
  let frame = 0;

  function setScene(index) {
    if (index === active) return;
    active = index;
    steps.forEach((step, position) => step.classList.toggle('is-active', position === index));
    pictures.forEach((picture, position) => picture.classList.toggle('is-current', position === index));
    controls.forEach((control, position) => {
      if (position === index) control.setAttribute('aria-current', 'step');
      else control.removeAttribute('aria-current');
    });
    story.style.setProperty('--route-progress', ((index + 1) / steps.length) * 100 + '%');
  }

  function updateScene() {
    frame = 0;
    const sightLine = window.innerHeight * 0.53;
    let nearest = 0;
    let distance = Infinity;
    steps.forEach((step, index) => {
      const box = step.getBoundingClientRect();
      const centerDistance = Math.abs((box.top + box.bottom) * 0.5 - sightLine);
      if (centerDistance < distance) {
        nearest = index;
        distance = centerDistance;
      }
    });
    setScene(nearest);
  }

  function scheduleSceneUpdate() {
    if (!frame) frame = requestAnimationFrame(updateScene);
  }

  story.classList.add('is-enhanced');
  updateScene();
  window.addEventListener('scroll', scheduleSceneUpdate, { passive: true });
  window.addEventListener('resize', scheduleSceneUpdate);
  window.addEventListener('load', scheduleSceneUpdate, { once: true });
}

const form = document.querySelector('.booking-page-layout #request');
if (form) {
  const service = form.elements.service;
  const format = form.elements.format;
  const phone = form.elements.phone;
  const vehicle = form.elements.vehicle;
  const status = form.querySelector('.form-status');
  const vehicleLabel = form.querySelector('[data-vehicle-label]');
  const guideSections = document.querySelectorAll('[data-guide]');
  const parkNote = document.querySelector('.park-note');
  const params = new URLSearchParams(location.search);

  const requestedService = params.get('service');
  if (Array.from(service.options).some(option => option.value === requestedService)) {
    service.value = requestedService;
  }
  if (params.get('format') === 'park') format.value = 'park';

  function updateGuide() {
    const isPark = format.value === 'park';
    const key = ['to', 'diagnostika', 'remont'].includes(service.value) ? service.value : 'default';
    for (const guide of guideSections) guide.hidden = guide.dataset.guide !== key;
    parkNote.hidden = !isPark;
    vehicleLabel.textContent = isPark ? 'Количество машин и модели' : 'Марка и модель';
    vehicle.placeholder = isPark ? 'Например, 3 автобуса Yutong' : 'Например, Yutong';
  }

  form.addEventListener('input', () => {
    status.hidden = true;
  });
  form.addEventListener('change', updateGuide);
  phone.addEventListener('input', () => phone.setCustomValidity(''));
  form.addEventListener('submit', event => {
    event.preventDefault();
    const digits = phone.value.replace(/\D/g, '');
    if (digits.length < 10 || digits.length > 15) {
      phone.setCustomValidity('Введите телефон с кодом.');
      phone.reportValidity();
      return;
    }
    status.textContent = 'Данные проверены. Это демо, заявка не отправлена.';
    status.hidden = false;
  });

  updateGuide();
  form.querySelector('fieldset').disabled = false;
}

const finder = document.querySelector('.service-finder');
if (finder) {
  const results = Array.from(finder.querySelectorAll('[data-result]'));
  const announcement = finder.querySelector('[role="status"]');

  function showRecommendation(announce = false) {
    const selected = finder.querySelector('input[name="situation"]:checked');
    for (const result of results) {
      result.hidden = result.dataset.result !== selected.value;
      if (!result.hidden && announce) {
        announcement.textContent = 'Подходящая услуга: ' + result.querySelector('h3').textContent;
      }
    }
  }

  finder.addEventListener('change', () => showRecommendation(true));
  showRecommendation();
  finder.querySelector('fieldset').disabled = false;
}
