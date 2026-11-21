/* The revised LSBUS catalogue applies to Cinema only. */
(() => {
  const retired = new Set(['sprinter-classic', 'sprinter-shuttle']);
  const maybach = {
    id: 'maybach',
    group: 'car',
    name: 'Mercedes-Maybach',
    seats: null,
    price: 4000,
    amen: [],
    photos: ['assets/maybach.webp', 'assets/maybach-interior.webp'],
    specs: [['Пассажирские места', 'Уточнит диспетчер']],
    text: 'Представительский автомобиль с водителем для встреч в аэропорту, поездок по Петербургу и индивидуальных трансферов.',
  };

  window.LSCinemaFleet = window.LS.fleet
    .filter(car => !retired.has(car.id))
    .map(car => {
      if (car.id === 'camry') return maybach;
      if (car.group === 'mini') return {...car, price: 2000};
      return car;
    });
})();
