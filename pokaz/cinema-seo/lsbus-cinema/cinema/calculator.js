/* Match capacity against the supplied catalogue. Prices remain preliminary. */
(function(root){
  function calculateTrip({fleet,passengers,occasion='tour',hours=4}){
    const pax=Number(passengers),hrs=Number(hours);
    if(!Number.isInteger(pax)||pax<1||pax>500)throw new RangeError('Укажите от 1 до 500 пассажиров');
    if(!Number.isInteger(hrs)||hrs<4||hrs>14)throw new RangeError('Укажите от 4 до 14 часов');
    const F=id=>fleet.find(c=>c.id===id);
    let car,n=1;
    if(pax<=3)car=F('maybach');
    else if(pax<=19)car=F(occasion==='wedding'?'sprinter-black':'sprinter-leather');
    else if(pax>53&&pax<=55)car=F('higer-v12-pro');
    if(!car||car.seats<pax){
      car=F('yutong-6122h9');
      if(car) n=Math.ceil(pax/car.seats);
    }
    if(!car)throw new Error('Не найдены данные транспорта');
    let total=car.price*hrs*n,unit='за '+hrs+' ч с подачей';
    if(occasion==='kids'){const per=car.seats>=49?12200:car.seats>=19?8400:8000;total=per*n;unit='за детскую экскурсию, от';}
    if(occasion==='intercity'){total=null;unit='расчёт по маршруту';}
    return{car,count:n,capacity:car.seats*n,passengers:pax,hours:hrs,occasion,total,unit};
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={calculateTrip};
  else root.LSCalculator={calculateTrip};
})(typeof window!=='undefined'?window:globalThis);
