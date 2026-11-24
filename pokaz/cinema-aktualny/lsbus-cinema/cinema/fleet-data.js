/* The revised LSBUS catalogue applies to Cinema only. */
(() => {
  const maybach = {
    id: 'maybach',
    group: 'car',
    name: 'Mercedes-Benz S 560 4MATIC (Maybach)',
    seats: 3,
    price: 4000,
    amen: [],
    photos: ['assets/maybach.webp', 'assets/maybach-interior.webp'],
    specs: [['Модель', 'Mercedes-Benz S 560 4MATIC (Maybach)'], ['Пассажирские места', '3']]
  };
  const higer = {
    id: 'higer-v12-pro',
    group: 'bus',
    name: 'Higer V12 PRO',
    seats: 55,
    guide: true,
    price: 3000,
    amen: [],
    photos: ['assets/higer-v12-pro-livery.webp', 'assets/higer-v12-pro-front.webp',
      'assets/higer-v12-pro-interior.webp', 'assets/higer-v12-pro-interior-lit.webp'],
    photoLabels: ['иллюстрация внешнего вида', 'вид спереди', 'пассажирский салон', 'салон с вечерней подсветкой'],
    coverNote: 'Внешний вид — иллюстрация',
    specs: [['Пассажирские места', '55'], ['Место для гида', '1 отдельно']]
  };
  const iveco = {
    id: 'iveco-daily',
    group: 'mini',
    name: 'Iveco Daily',
    seats: null,
    price: 1900,
    amen: [],
    photos: ['assets/iveco-daily-cover.webp', 'assets/iveco-daily-rear.webp',
      'assets/iveco-daily-cabin.webp', 'assets/iveco-daily-chairs.webp'],
    photoLabels: ['внешний вид спереди', 'внешний вид сзади', 'пассажирский салон', 'пассажирские кресла'],
    specs: [['Посадочные места', 'Уточнит диспетчер']]
  };
  const vClass = {
    id: 'v-class',
    group: 'car',
    name: 'Mercedes-Benz V-Class',
    seats: null,
    price: 3000,
    amen: [],
    photos: ['assets/mercedes-v-class-cover.webp', 'assets/mercedes-v-class-cabin.webp'],
    photoLabels: ['внешний вид', 'пассажирский салон'],
    specs: [['Пассажирские места', 'Уточнит диспетчер']]
  };
  const vehiclePhotos = {
    'yutong-6128': {
      name: 'Yutong ZK6128H',
      photos: ['assets/yutong-zk6128h-cover-dscf4892.webp', 'assets/yutong-zk6128h-cabin.webp',
        'assets/yutong-zk6128h-seats.webp', 'assets/yutong-zk6128h-luggage.webp'],
      photoLabels: ['внешний вид', 'пассажирский салон', 'кресла', 'багажное отделение']
    },
    'yutong-6122h9': {
      name: 'Yutong ZK6122H9',
      photos: ['assets/yutong-zk6122h9-cover.webp', 'assets/yutong-zk6122h9-cabin.webp',
        'assets/yutong-zk6122h9-seats.webp', 'assets/yutong-zk6122h9-luggage.webp'],
      photoLabels: ['внешний вид', 'пассажирский салон', 'кресла', 'багажное отделение']
    },
    'sprinter-black': {
      price: 2000,
      photos: ['assets/sprinter-black-cover.webp', 'assets/sprinter-black-side.webp',
        'assets/sprinter-black-cabin.webp', 'assets/sprinter-black-seats.webp', 'assets/sprinter-black-luggage.webp'],
      photoLabels: ['внешний вид спереди', 'вид сбоку', 'пассажирский салон', 'кресла', 'багажное отделение']
    },
    'sprinter-leather': {
      name: 'Mercedes-Benz Sprinter (907)',
      price: 2000,
      photos: ['assets/sprinter-907-cover.webp', 'assets/sprinter-907-front.webp',
        'assets/sprinter-907-cabin.webp', 'assets/sprinter-907-seats.webp'],
      photoLabels: ['внешний вид сбоку', 'вид спереди', 'пассажирский салон', 'кресла']
    }
  };
  const descriptions = {
    'iveco-daily': [
      'Пассажирский Iveco Daily с водителем для поездок по Петербургу и Ленинградской области. В галерее собраны фотографии микроавтобуса LSBUS снаружи и его пассажирского салона.',
      'Подходит для трансферов и групповых поездок. Укажите маршрут, число пассажиров и объём багажа. Диспетчер подтвердит вместимость, наличие машины на нужную дату и стоимость.'
    ],
    'higer-v12-pro': [
      'Higer V12 PRO — туристический автобус LSBUS на 55 пассажиров с отдельным местом для гида. В галерее есть иллюстрация внешнего вида, фотографии кресел и салона с вечерней подсветкой.',
      'Подходит для экскурсионных групп, корпоративных выездов и междугородних маршрутов. Для расчёта укажите дату, время подачи, число пассажиров и точки маршрута. Диспетчер подтвердит наличие автобуса и стоимость поездки.'
    ],
    'yutong-6128': [
      'Yutong ZK6128H — 12-метровый туристический автобус с отдельным местом для гида. В салоне 53 пассажирских места, а багажное отделение объёмом 11 м³ находится отдельно от салона.',
      'В салоне есть регулируемые кресла, климатическая установка, USB, телевизор, холодильник и кулер. Этот вариант подходит, если большой группе нужно забрать багаж в аэропорту или на вокзале и продолжить поездку по городу, пригородам или между городами.'
    ],
    'yutong-6122h9': [
      'Yutong ZK6122H9 вмещает до 53 пассажиров. Предусмотрены отдельные места для гида и багажа. Микрофон позволяет вести экскурсию по ходу маршрута, а в салоне есть кондиционер, кулер и холодильник.',
      'Автобус можно заказать для экскурсии, корпоративного выезда или междугородней перевозки. При заявке на большую группу укажите фактическое число пассажиров, остановки и нужное время подачи.'
    ],
    'sprinter-black': [
      'Mercedes-Benz Sprinter Black — чёрный микроавтобус на 19 пассажиров. В галерее можно посмотреть кузов и салон с креслами и телевизором. В машине предусмотрены кондиционер и микрофон.',
      'Sprinter Black удобно заказать для свадебных гостей, делегации или небольшой экскурсионной группы. Если пассажиров нужно собрать по нескольким адресам, добавьте остановки к маршруту заявки.'
    ],
    'sprinter-leather': [
      'Mercedes-Benz Sprinter (907) с кожаным салоном рассчитан на 19 пассажиров. В комплектации есть кондиционер, микрофон и Wi‑Fi. В карточке можно сравнить этот вариант с другими микроавтобусами LSBUS.',
      'Подходит для трансфера, экскурсии и выезда команды. Если вам важна именно эта комплектация, отправьте заявку из карточки и укажите дату, маршрут и время подачи.'
    ],
    maybach: [
      'Mercedes-Benz S 560 4MATIC (Maybach) — седан с водителем на трёх пассажиров. Подходит для индивидуальных встреч в аэропорту, поездок между отелем и площадкой мероприятия, а также деловых поездок по Петербургу.',
      'Начальная ставка — 4 000 ₽ в час. Для трансфера укажите место встречи и конечный адрес. Если едете втроём с крупным багажом, напишите об этом диспетчеру, чтобы он сверил вместимость.'
    ],
    'v-class': [
      'Mercedes-Benz V-Class — минивэн с водителем для встреч в аэропорту и на вокзале, поездок по городу и трансферов на мероприятия.',
      'Аренда от 3 000 ₽ в час. Укажите количество пассажиров и багажа, чтобы диспетчер подтвердил подходящую комплектацию и стоимость маршрута.'
    ]
  };
  const existing = window.LS.fleet;
  const buses = existing.filter(car => car.group === 'bus' && car.id !== 'zhong-tong');
  const sprinters = existing.filter(car => car.id === 'sprinter-black' || car.id === 'sprinter-leather');
  window.LSCinemaFleet = [higer, ...buses, ...sprinters, iveco, maybach, vClass].map(car => ({
    ...car,
    ...vehiclePhotos[car.id],
    text: descriptions[car.id].join('\n\n')
  }));
})();
