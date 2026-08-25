// V50 — General logo bank: restaurants, cars, brands, retail, companies + Arab/Gulf brands.
// Medium/hard logos are intentionally cropped/zoomed so the answer is not obvious.
(function(){
  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(QUESTIONS[i]?.category==='logos') QUESTIONS.splice(i,1);
  }

  const si=(slug,color)=>`https://cdn.simpleicons.org/${slug}/${color||'111111'}`;
  const local=(domain)=>`https://manifest.im/icon/${domain}`;
  const rows=[
    // 200 — familiar, broad real-world brands. Accessible but not gaming/app-heavy.
    ['lg50-e01','easy','McDonald’s',['Burger King','KFC','Hardee’s'],'مطاعم سريعة',si('mcdonalds','FFC72C')],
    ['lg50-e02','easy','Starbucks',['Costa Coffee','Tim Hortons','Dunkin’'],'مقاهي',si('starbucks','00754A')],
    ['lg50-e03','easy','KFC',['Popeyes','Texas Chicken','Jollibee'],'مطاعم دجاج',si('kfc','F40027')],
    ['lg50-e04','easy','Burger King',['McDonald’s','Hardee’s','Wendy’s'],'مطاعم سريعة',si('burgerking','D62300')],
    ['lg50-e05','easy','Domino’s',['Pizza Hut','Papa John’s','Little Caesars'],'بيتزا',si('dominos','006491')],
    ['lg50-e06','easy','Pizza Hut',['Domino’s','Papa John’s','Little Caesars'],'بيتزا',si('pizzahut','EE3A43')],
    ['lg50-e07','easy','Toyota',['Nissan','Honda','Mazda'],'سيارات يابانية',si('toyota','EB0A1E')],
    ['lg50-e08','easy','BMW',['Mercedes-Benz','Audi','Volvo'],'سيارات أوروبية',si('bmw','0066B1')],
    ['lg50-e09','easy','Mercedes-Benz',['BMW','Audi','Lexus'],'سيارات فاخرة',si('mercedes','000000')],
    ['lg50-e10','easy','Audi',['BMW','Mercedes-Benz','Volkswagen'],'سيارات ألمانية',si('audi','BB0A30')],
    ['lg50-e11','easy','Honda',['Toyota','Nissan','Mazda'],'سيارات يابانية',si('honda','E40521')],
    ['lg50-e12','easy','Nissan',['Toyota','Honda','Mitsubishi'],'سيارات يابانية',si('nissan','C3002F')],
    ['lg50-e13','easy','Nike',['Adidas','Puma','Under Armour'],'ملابس رياضية',si('nike','111111')],
    ['lg50-e14','easy','Adidas',['Nike','Puma','New Balance'],'ملابس رياضية',si('adidas','000000')],
    ['lg50-e15','easy','Puma',['Adidas','Nike','New Balance'],'ملابس رياضية',si('puma','242B2F')],
    ['lg50-e16','easy','IKEA',['Home Centre','West Elm','Pottery Barn'],'أثاث ومتاجر منزلية',si('ikea','0058A3')],
    ['lg50-e17','easy','Pepsi',['Coca-Cola','RC Cola','Dr Pepper'],'مشروبات غازية',si('pepsi','2151A1')],
    ['lg50-e18','easy','Mastercard',['Visa','American Express','UnionPay'],'بطاقات ومدفوعات',si('mastercard','EB001B')],

    // 400 — same-sector distractors and a tighter logo crop.
    ['lg50-m01','medium','Subway',['Quiznos','Jimmy John’s','Jersey Mike’s'],'مطاعم ساندويتشات',si('subway','009743')],
    ['lg50-m02','medium','Ferrari',['Lamborghini','McLaren','Maserati'],'سيارات رياضية',si('ferrari','FF2800')],
    ['lg50-m03','medium','Lamborghini',['Ferrari','McLaren','Maserati'],'سيارات رياضية',si('lamborghini','DDB321')],
    ['lg50-m04','medium','Porsche',['BMW','Mercedes-AMG','Audi'],'سيارات ألمانية',si('porsche','B12B28')],
    ['lg50-m05','medium','Hyundai',['Kia','Genesis','Nissan'],'سيارات كورية وآسيوية',si('hyundai','002C5F')],
    ['lg50-m06','medium','Kia',['Hyundai','Nissan','Mazda'],'سيارات آسيوية',si('kia','05141F')],
    ['lg50-m07','medium','Mazda',['Subaru','Honda','Nissan'],'سيارات يابانية',si('mazda','101010')],
    ['lg50-m08','medium','Volvo',['Saab','Audi','Volkswagen'],'سيارات أوروبية',si('volvo','003057')],
    ['lg50-m09','medium','Volkswagen',['Skoda','SEAT','Opel'],'سيارات أوروبية',si('volkswagen','151F5D')],
    ['lg50-m10','medium','Peugeot',['Renault','Citroën','Opel'],'سيارات فرنسية وأوروبية',si('peugeot','1E398D')],
    ['lg50-m11','medium','Renault',['Peugeot','Citroën','Fiat'],'سيارات أوروبية',si('renault','FFCC33')],
    ['lg50-m12','medium','New Balance',['ASICS','Saucony','Brooks'],'أحذية وملابس رياضية',si('newbalance','CF0A2C')],
    ['lg50-m13','medium','Under Armour',['Nike','Adidas','Reebok'],'ملابس رياضية',si('underarmour','1D1D1D')],
    ['lg50-m14','medium','Walmart',['Target','Costco','Carrefour'],'متاجر تجزئة',si('walmart','0071CE')],
    ['lg50-m15','medium','Target',['Walmart','Costco','Macy’s'],'متاجر تجزئة',si('target','CC0000')],
    ['lg50-m16','medium','Carrefour',['Tesco','Auchan','Lulu Hypermarket'],'هايبرماركت',si('carrefour','004E9F')],
    ['lg50-m17','medium','Shell',['BP','TotalEnergies','ExxonMobil'],'طاقة ومحطات وقود',si('shell','FFD500')],
    ['lg50-m18','medium','Airbnb',['Booking.com','Vrbo','Expedia'],'سفر وحجوزات',si('airbnb','FF5A5F')],

    // 600 — less immediate logos + regional brands. Crop is strongest here.
    ['lg50-h01','hard','Skoda',['SEAT','Opel','Renault'],'سيارات أوروبية',si('skoda','0E3A2F')],
    ['lg50-h02','hard','Bentley',['Rolls-Royce','Aston Martin','Maserati'],'سيارات فاخرة',si('bentley','333333')],
    ['lg50-h03','hard','Opel',['Peugeot','Renault','Skoda'],'سيارات أوروبية',si('opel','F7FF14')],
    ['lg50-h04','hard','MG',['Geely','Chery','Great Wall'],'سيارات',si('mg','FF0000')],
    ['lg50-h05','hard','Bosch',['Siemens','Philips','Electrolux'],'شركات وأجهزة',si('bosch','EA0016')],
    ['lg50-h06','hard','Decathlon',['Intersport','JD Sports','Sports Direct'],'متاجر رياضية',si('decathlon','0082C3')],
    ['lg50-h07','hard','Sephora',['Ulta Beauty','Douglas','MAC Cosmetics'],'تجميل ومتاجر',si('sephora','000000')],
    ['lg50-h08','hard','Red Bull',['Monster Energy','Rockstar Energy','Burn'],'مشروبات طاقة',si('redbull','DB0A40')],

    ['lg50-h09','hard','STC',['موبايلي','زين','du'],'اتصالات خليجية',local('stc.com.sa'),'regional'],
    ['lg50-h10','hard','موبايلي',['STC','زين','du'],'اتصالات خليجية',local('mobily.com.sa'),'regional'],
    ['lg50-h11','hard','البيك',['كودو','هرفي','شاورمر'],'مطاعم سعودية',local('albaik.com'),'regional'],
    ['lg50-h12','hard','جرير',['Virgin Megastore','eXtra','SACO'],'متاجر سعودية',local('jarir.com'),'regional'],
    ['lg50-h13','hard','مصرف الراجحي',['مصرف الإنماء','بنك الرياض','البنك الأهلي السعودي'],'بنوك سعودية',local('alrajhibank.com.sa'),'regional'],
    ['lg50-h14','hard','أرامكو',['سابك','ADNOC','QatarEnergy'],'طاقة خليجية',local('aramco.com'),'regional'],
    ['lg50-h15','hard','السعودية',['Emirates','Qatar Airways','Gulf Air'],'طيران خليجي',local('saudia.com'),'regional'],
    ['lg50-h16','hard','طيران ناس',['flyadeal','Air Arabia','Jazeera Airways'],'طيران اقتصادي خليجي',local('flynas.com'),'regional'],
    ['lg50-h17','hard','نون',['Amazon','Namshi','Trendyol'],'تجارة إلكترونية',local('noon.com'),'regional'],
    ['lg50-h18','hard','كريم',['Uber','Jeeny','Kaiian'],'نقل وتطبيقات تنقل',local('careem.com'),'regional'],
    ['lg50-h19','hard','طلبات',['هنقرستيشن','جاهز','ToYou'],'توصيل طعام',local('talabat.com'),'regional'],
    ['lg50-h20','hard','هنقرستيشن',['جاهز','طلبات','ToYou'],'توصيل طعام',local('hungerstation.com'),'regional']
  ];

  QUESTIONS.push(...rows.map(r=>({
    questionID:r[0], category:'logos', difficulty:r[1], points:r[1]==='easy'?200:r[1]==='medium'?400:600,
    questionType:'logo', questionText:'وش هذا الشعار؟', correctAnswer:r[2], wrongAnswers:r[3], hint:r[4],
    regionTag:r[6]==='regional'?'Arab-Gulf':'Global',
    countryRegionTags:r[6]==='regional'?['Saudi Arabia','Gulf','Arab']:['International'],
    eraTag:'Modern', subCategory:r[4], mediaURL:r[5], logoSub:'', contentScope:r[6]==='regional'?'regional-brand':'general-brand',
    logoRegional:r[6]==='regional'
  })));

  window.laffhaLogoBroken=function(){
    const q=state?.currentQuestion;
    if(!q || q.category!=='logos') return;
    q._brokenLogo=true;
    const idx=QUESTIONS.indexOf(q);
    if(idx>=0) QUESTIONS.splice(idx,1);
    setTimeout(()=>pickQuestion(state.drawnDifficulty||q.difficulty,true),0);
  };

  finalLogo=function(q){
    const diff=q.difficulty==='hard'?'logo-hard':q.difficulty==='medium'?'logo-medium':'logo-easy';
    const regional=q.logoRegional?'logo-regional':'';
    return `<div class="logo-question logo-question-v50 ${diff} ${regional}"><div class="logo-general-frame"><img src="${q.mediaURL}" alt="" aria-label="جزء من شعار" onerror="window.laffhaLogoBroken&&window.laffhaLogoBroken()"></div></div>`;
  };

  console.info('Laffha V50 general/harder logo bank ready', rows.length);
})();
