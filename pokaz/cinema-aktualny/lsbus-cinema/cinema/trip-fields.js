'use strict';
(() => {
  // Calendar, ten-minute slots and address lookup follow the Merc-SPb trip form.
  const pad = n => String(n).padStart(2, '0');
  const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  const moscowClock = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Moscow', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
  });
  const months = new Intl.DateTimeFormat('ru', { month: 'long', timeZone: 'UTC' });
  const days = new Intl.DateTimeFormat('ru', { day: 'numeric', month: 'long', timeZone: 'UTC' });
  const dateUTC = (year, month, day) => new Date(Date.UTC(year, month, day));
  const iso = date => date.toISOString().slice(0, 10);
  const today = () => {
    const parts = Object.fromEntries(moscowClock.formatToParts().map(part => [part.type, part.value]));
    return { date: `${parts.year}-${parts.month}-${parts.day}`, minutes: Number(parts.hour) * 60 + Number(parts.minute) };
  };
  const asDate = value => new Date(value + 'T00:00:00Z');
  const showDate = value => value.split('-').reverse().join('.');
  let nextId = 0;

  function readDate(value) {
    const text = value.trim();
    const typed = /^(\d{2})[.\/]?(\d{2})[.\/]?(\d{4})$/.exec(text);
    const normalized = typed ? `${typed[3]}-${typed[2]}-${typed[1]}` : text;
    if (!/^\d{4}-\d\d-\d\d$/.test(normalized) || normalized < today().date) return '';
    const date = asDate(normalized);
    return Number.isFinite(date.getTime()) && iso(date) === normalized ? normalized : '';
  }

  function readTime(value) {
    const typed = /^(\d{1,2}):?(\d{2})$/.exec(value.trim());
    return typed && Number(typed[1]) < 24 && Number(typed[2]) < 60 ? `${pad(typed[1])}:${typed[2]}` : '';
  }

  function makePopup(input, kind, label) {
    const wrapper = document.createElement('span');
    wrapper.className = 'trip-control';
    input.before(wrapper);
    wrapper.append(input);
    const popup = document.createElement('div');
    popup.className = 'trip-popup trip-popup--' + kind;
    popup.id = 'trip-popup-' + ++nextId;
    popup.hidden = true;
    popup.setAttribute('aria-label', label);
    wrapper.append(popup);
    input.setAttribute('aria-controls', popup.id);
    input.setAttribute('aria-expanded', 'false');
    function close() {
      popup.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
    }
    function open() {
      popup.hidden = false;
      input.setAttribute('aria-expanded', 'true');
      const box = wrapper.getBoundingClientRect();
      const parent = wrapper.closest('dialog')?.getBoundingClientRect();
      const left = Math.max(8, (parent?.left ?? 0) + 8);
      const right = Math.min(window.innerWidth - 8, (parent?.right ?? window.innerWidth) - 8);
      const shift = Math.max(left, Math.min(box.left, right - popup.offsetWidth)) - box.left;
      popup.style.setProperty('--trip-shift', shift + 'px');
      const above = box.top - Math.max(0, parent?.top ?? 0) - 12;
      const below = Math.min(window.innerHeight, parent?.bottom ?? window.innerHeight) - box.bottom - 12;
      popup.style.maxHeight = '';
      const up = below < popup.offsetHeight && above > below;
      popup.classList.toggle('trip-popup--up', up);
      popup.style.maxHeight = Math.max(110, up ? above : below) + 'px';
    }
    wrapper.addEventListener('focusout', event => {
      if (!wrapper.contains(event.relatedTarget)) close();
    });
    wrapper.addEventListener('keydown', event => {
      if (event.key !== 'Escape' || popup.hidden) return;
      event.preventDefault();
      event.stopPropagation();
      input.focus({ preventScroll: true });
      close();
    });
    document.addEventListener('pointerdown', event => {
      if (!wrapper.contains(event.target)) close();
    });
    return { wrapper, popup, open, close };
  }

  function makeList(input, kind, label, onChoose) {
    const { popup, open, close } = makePopup(input, kind, label);
    const list = document.createElement('div');
    list.className = 'trip-options';
    list.id = popup.id + '-options';
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', label);
    popup.append(list);
    input.setAttribute('role', 'combobox');
    input.setAttribute('aria-autocomplete', 'list');
    input.setAttribute('aria-controls', list.id);
    let options = [];
    let active = -1;
    const choose = index => {
      if (!options[index]) return;
      onChoose(options[index].value);
      close();
    };
    popup.addEventListener('mousedown', event => {
      if (event.target.closest('[data-option]')) event.preventDefault();
    });
    popup.addEventListener('click', event => {
      const option = event.target.closest('[data-option]');
      if (option) {
        event.preventDefault();
        choose(Number(option.dataset.option));
      }
    });
    input.addEventListener('keydown', event => {
      if (popup.hidden || !options.length) return;
      if (event.key === 'Enter' && active >= 0) {
        event.preventDefault();
        choose(active);
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp' ||
          (active >= 0 && kind === 'time' && ['ArrowLeft', 'ArrowRight'].includes(event.key))) {
        event.preventDefault();
        const directions = { ArrowDown: kind === 'time' ? 4 : 1, ArrowUp: kind === 'time' ? -4 : -1, ArrowLeft: -1, ArrowRight: 1 };
        active = active < 0 ? (directions[event.key] > 0 ? 0 : options.length - 1) :
          Math.max(0, Math.min(options.length - 1, active + directions[event.key]));
        [...list.children].forEach((item, index) => item.setAttribute('aria-selected', String(index === active)));
        input.setAttribute('aria-activedescendant', list.children[active].id);
        list.children[active].scrollIntoView({ block: 'nearest' });
      }
    });
    return {
      show(items, credit = false, preferred = '') {
        const previous = credit ? options[active]?.value : undefined;
        options = items;
        active = items.findIndex(item => item.value === previous);
        if (active >= 0) input.setAttribute('aria-activedescendant', list.id + '-' + active);
        else input.removeAttribute('aria-activedescendant');
        if (!items.length) { close(); return; }
        list.replaceChildren(...items.map((item, index) => {
          const row = document.createElement('div');
          row.dataset.option = index;
          row.id = list.id + '-' + index;
          row.setAttribute('role', 'option');
          row.setAttribute('aria-selected', String(index === active));
          const name = document.createElement('strong');
          name.textContent = item.name;
          row.append(name);
          if (item.detail) {
            const detail = document.createElement('small');
            detail.textContent = item.detail;
            row.append(detail);
          }
          return row;
        }));
        popup.querySelector('.trip-attribution')?.remove();
        if (credit) {
          const source = document.createElement('a');
          source.className = 'trip-attribution';
          source.href = 'https://www.openstreetmap.org/copyright';
          source.target = '_blank';
          source.rel = 'noopener';
          source.textContent = '© OpenStreetMap';
          popup.append(source);
        }
        list.scrollTop = 0;
        open();
        const index = items.findIndex(item => item.value === preferred);
        if (index >= 0) {
          const item = list.children[index];
          list.scrollTop = item.getBoundingClientRect().top - list.getBoundingClientRect().top -
            (list.clientHeight - item.offsetHeight) / 2;
        }
      },
      close,
    };
  }

  const places = [
    ['Аэропорт Пулково (LED)', 'Пулковское шоссе, 41 · Санкт-Петербург', 'пулково аэропорт led pulkovo airport'],
    ['Московский вокзал', 'Невский проспект, 85 · Санкт-Петербург', 'вокзал мос moskovsky station'],
    ['Ладожский вокзал', 'Заневский проспект, 73 · Санкт-Петербург', 'вокзал лад ladozhsky station'],
    ['Финляндский вокзал', 'площадь Ленина, 6 · Санкт-Петербург', 'вокзал фин finlyandsky station'],
    ['Витебский вокзал', 'Загородный проспект, 52 · Санкт-Петербург', 'вокзал vitebsky station'],
    ['Балтийский вокзал', 'набережная Обводного канала, 120 · Санкт-Петербург', 'вокзал baltiysky station'],
    ['Экспофорум', 'Петербургское шоссе, 64/1 · Санкт-Петербург', 'пмэф expoforum spief форум'],
    ['Аэропорт Шереметьево (SVO)', 'Химки · Московская область', 'аэропорт svo sheremetyevo москва'],
    ['Аэропорт Внуково (VKO)', 'Москва', 'аэропорт vko vnukovo'],
    ['Аэропорт Домодедово (DME)', 'Домодедово · Московская область', 'аэропорт dme domodedovo москва'],
  ].map(([name, detail, aliases]) => ({
    name, detail, words: name + ' ' + detail + ' ' + aliases,
    value: name + ', ' + detail.replaceAll(' · ', ', ')
  }));
  const normal = value => value.toLowerCase().replace(/ё/g, 'е').replace(/[^a-zа-я0-9]+/g, ' ').trim();
  function localMatches(query) {
    const tokens = normal(query).split(' ').filter(Boolean);
    if (!tokens.length) return [];
    return places.filter(place => {
      const words = normal(place.words).split(' ');
      return tokens.every(token => words.some(word => word.startsWith(token)));
    }).slice(0, 6);
  }
  const addressCache = new Map();
  let lastLookup = 0;

  async function findAddresses(query, signal) {
    const key = normal(query);
    if (addressCache.has(key)) return addressCache.get(key);
    const params = new URLSearchParams({ q: query, limit: '7', lat: '59.94', lon: '30.31' });
    lastLookup = Date.now();
    const response = await fetch('https://photon.komoot.io/api/?' + params, { signal, credentials: 'omit', referrerPolicy: 'no-referrer' });
    if (!response.ok) throw new Error('Address lookup unavailable');
    const data = await response.json();
    const found = (data.features || []).map(({ properties: place }) => {
      const street = [place.street, place.housenumber].filter(Boolean).join(', ');
      const name = place.type === 'house' && street ? street : place.name || street;
      if (!name) return null;
      const parts = [street, place.city || place.locality, place.state, place.countrycode !== 'RU' && place.country];
      const detail = [...new Set(parts.filter(part => part && part !== name))].join(', ');
      return { name, detail, value: [name, detail].filter(Boolean).join(', ') };
    }).filter(Boolean);
    if (addressCache.size >= 60) addressCache.delete(addressCache.keys().next().value);
    addressCache.set(key, found);
    return found;
  }

  function enhanceAddress(input) {
    input.autocomplete = 'off';
    if (!input.hasAttribute('aria-label')) {
      input.setAttribute('aria-label', input.labels?.[0]?.textContent.trim() || 'Адрес');
    }
    let controller, timer;
    const stopLookup = () => {
      clearTimeout(timer);
      controller?.abort();
    };
    const list = makeList(input, 'address', 'Подсказки адресов', value => {
      stopLookup();
      input.value = value;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
    function show(search) {
      stopLookup();
      const query = input.value.trim();
      const local = localMatches(query);
      list.show(local);
      if (!search || query.length < 3 || query.length > 80 || document.documentElement.hasAttribute('data-pages-demo')) return;
      timer = setTimeout(async () => {
        controller = new AbortController();
        const signal = controller.signal;
        try {
          const found = await findAddresses(query, signal);
          if (signal.aborted || input.value.trim() !== query || document.activeElement !== input) return;
          const known = new Set(local.map(place => normal(place.name)));
          const remote = found.filter(place => {
            const key = normal(place.name + ' ' + (place.detail || ''));
            if (known.has(key) || local.some(item => normal(item.name) === normal(place.name) &&
                normal(place.detail).includes(normal(item.detail.split(' · ').at(-1))))) return false;
            known.add(key);
            return true;
          }).slice(0, 8 - local.length);
          if (remote.length) list.show([...local, ...remote], true);
        } catch (_) {
          // A typed address remains valid when the address service is unavailable.
        }
      }, Math.max(400, 1000 - (Date.now() - lastLookup)));
    }
    input.addEventListener('input', () => show(true));
    input.addEventListener('focus', () => show(false));
    input.addEventListener('blur', stopLookup);
    input.addEventListener('keydown', event => { if (event.key === 'Escape') stopLookup(); });
  }

  const timeSlots = Array.from({ length: 144 }, (_, index) => `${pad(Math.floor(index / 6))}:${pad((index % 6) * 10)}`);

  function enhancePicker(original) {
    const date = original.type === 'date';
    const label = original.getAttribute('aria-label') || (date ? 'Дата поездки' : original.name === 'end_time' ? 'Время окончания' : 'Время подачи');
    const textbox = document.createElement('input');
    textbox.type = 'text';
    textbox.className = 'trip-picker-display';
    textbox.required = original.required;
    textbox.autocomplete = 'off';
    textbox.inputMode = 'numeric';
    textbox.placeholder = date ? 'ДД.ММ.ГГГГ' : 'ЧЧ:ММ';
    textbox.maxLength = date ? 10 : 5;
    textbox.setAttribute('aria-label', label);
    original.type = 'hidden';
    original.before(textbox);
    original.tripSync = () => {
      textbox.value = date ? showDate(original.value) : original.value;
      textbox.setCustomValidity('');
    };
    function assign(value) {
      original.value = value;
      original.dispatchEvent(new Event('change', { bubbles: true }));
    }
    function type() {
      const value = date ? readDate(textbox.value) : readTime(textbox.value);
      assign(value);
      textbox.setCustomValidity(!textbox.value || value ? '' : date ? 'Укажите актуальную дату в формате ДД.ММ.ГГГГ.' : 'Укажите время в формате ЧЧ:ММ.');
    }
    function pick(value) {
      assign(value);
      original.tripSync();
    }
    textbox.addEventListener('blur', () => {
      if (original.value) original.tripSync();
    });
    original.tripSync();
    if (date) {
      makeCalendar(textbox, original, type, pick);
      return;
    }
    const list = makeList(textbox, 'time', label, pick);
    const showTimes = query => {
      const now = today();
      const isPickupToday = original.name === 'time' && original.form?.elements.date?.value === now.date;
      const typed = query.replace(/[^\d:]/g, '');
      const exact = readTime(typed);
      const filter = slot => !typed || slot.startsWith(typed) || slot.replace(/^0/, '').startsWith(typed) ||
        slot.replace(':', '').startsWith(typed) || slot.replace(/^0/, '').replace(':', '').startsWith(typed);
      let matches = timeSlots.filter(slot => (!isPickupToday || Number(slot.slice(0, 2)) * 60 + Number(slot.slice(3)) >= now.minutes) && filter(slot));
      if (exact && !matches.includes(exact)) matches = [exact, ...matches];
      const preferred = typed ? '' : original.value || '09:00';
      list.show(matches.map(value => ({ name: value, value })), false, preferred);
    };
    textbox.addEventListener('focus', () => showTimes(''));
    textbox.addEventListener('click', () => { if (textbox.getAttribute('aria-expanded') === 'false') showTimes(''); });
    textbox.addEventListener('input', () => {
      type();
      showTimes(textbox.value);
    });
  }

  function makeCalendar(textbox, original, type, pick) {
    const { popup, open, close } = makePopup(textbox, 'date', 'Календарь');
    textbox.setAttribute('aria-haspopup', 'dialog');
    popup.setAttribute('role', 'dialog');
    let month;
    function render(value) {
      const reference = asDate(value || today().date);
      const year = reference.getUTCFullYear();
      const index = reference.getUTCMonth();
      month = dateUTC(year, index, 1);
      const current = today().date;
      const offset = (month.getUTCDay() + 6) % 7;
      const count = dateUTC(year, index + 1, 0).getUTCDate();
      const selected = original.value;
      popup.innerHTML = `<div class="trip-calendar-head">
        <button type="button" data-month="-1" aria-label="Предыдущий месяц"${iso(dateUTC(year, index + 1, 0)) < current || current.startsWith(iso(month).slice(0, 7)) ? ' disabled' : ''}>‹</button>
        <strong aria-live="polite">${months.format(month)} ${year}</strong>
        <button type="button" data-month="1" aria-label="Следующий месяц">›</button>
        </div><div class="trip-calendar-grid">${weekdays.map(day => `<span>${day}</span>`).join('')}
        ${'<span></span>'.repeat(offset)}${Array.from({ length: count }, (_, i) => {
          const day = dateUTC(year, index, i + 1);
          const value = iso(day);
          return `<button type="button" data-date="${value}" aria-label="${days.format(day)}" aria-pressed="${value === selected}"${value < current ? ' disabled' : ''}${value === current ? ' aria-current="date"' : ''}>${i + 1}</button>`;
        }).join('')}</div>`;
      open();
    }
    const show = () => render(original.value || today().date);
    textbox.addEventListener('focus', show);
    textbox.addEventListener('click', () => { if (popup.hidden) show(); });
    textbox.addEventListener('input', () => { type(); show(); });
    textbox.addEventListener('keydown', event => {
      if (event.key !== 'ArrowDown') return;
      event.preventDefault();
      if (popup.hidden) show();
      (popup.querySelector('[aria-pressed="true"]') || popup.querySelector('[data-date]:not([disabled])'))?.focus();
    });
    popup.addEventListener('keydown', event => {
      const key = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 }[event.key];
      const current = event.target.closest('[data-date]');
      if (!current || key === undefined) return;
      event.preventDefault();
      const day = asDate(current.dataset.date);
      day.setUTCDate(day.getUTCDate() + key);
      const value = iso(day);
      if (value < today().date) return;
      if (day.getUTCMonth() !== month.getUTCMonth()) render(value);
      popup.querySelector(`[data-date="${value}"]`)?.focus();
    });
    popup.addEventListener('click', event => {
      const control = event.target.closest('button');
      if (!control) return;
      event.preventDefault();
      if (control.dataset.date) {
        pick(control.dataset.date);
        textbox.focus({ preventScroll: true });
        close();
      } else {
        const shift = Number(control.dataset.month);
        render(iso(dateUTC(month.getUTCFullYear(), month.getUTCMonth() + shift, 1)));
        const next = popup.querySelector(`[data-month="${shift}"]:not([disabled])`) || popup.querySelector('[data-date]:not([disabled])');
        next?.focus({ preventScroll: true });
      }
    });
  }

  function formatPhone(value) {
    const hasPrefix = /^\s*\+7/.test(value);
    let digits = (hasPrefix ? value.replace(/^\s*\+7/, '') : value).replace(/\D/g, '');
    if (digits.length > 10 && /^[78]/.test(digits)) digits = digits.slice(1);
    return '+7 ' + [digits.slice(0, 3), digits.slice(3, 6), digits.slice(6, 8), digits.slice(8, 10)].filter(Boolean).join(' ');
  }

  function enhancePhone(input) {
    input.placeholder = '+7 999 999 99 99';
    input.addEventListener('focus', () => {
      if (!input.value) input.value = '+7 ';
      if (input.value === '+7 ') input.setSelectionRange(3, 3);
    });
    input.addEventListener('beforeinput', event => {
      const caret = input.selectionStart;
      if (event.inputType !== 'deleteContentBackward' || caret !== input.selectionEnd || input.value[caret - 1] !== ' ' || caret <= 3) return;
      event.preventDefault();
      input.setRangeText('', caret - 2, caret, 'end');
      input.dispatchEvent(new Event('input', { bubbles: true }));
    });
    input.addEventListener('input', () => {
      const text = input.value;
      const before = text.slice(0, input.selectionStart);
      const formatted = formatPhone(text);
      const nationalBefore = before.replace(/^\s*\+7/, '').replace(/\D/g, '').length;
      const last = before.length === text.length;
      input.value = formatted;
      let caret = 3;
      for (let seen = 0; caret < formatted.length && seen < nationalBefore; caret++) {
        if (/\d/.test(formatted[caret])) seen++;
      }
      const position = last ? formatted.length : caret;
      input.setSelectionRange(position, position);
      input.setCustomValidity(/^\+7 \d{3} \d{3} \d{2} \d{2}$/.test(formatted) ? '' : 'Введите 10 цифр после +7.');
    });
    input.addEventListener('blur', () => {
      if (input.value === '+7 ') {
        input.value = '';
        input.setCustomValidity('');
      }
    });
  }

  window.LSCinemaForm = {
    enhance(form) {
      if (!form) return;
      form.querySelectorAll('input[name="pickup"], input[name="dropoff"], input[name="end_place"]').forEach(enhanceAddress);
      form.querySelectorAll('input[type="date"], input[type="time"]').forEach(enhancePicker);
      form.querySelectorAll('input[type="tel"]').forEach(enhancePhone);
    },
    sync(form) {
      form.querySelectorAll('input[type="hidden"]').forEach(input => input.tripSync?.());
    }
  };
})();
