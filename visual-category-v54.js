// V54 — Curated visual category: symbol-only logos + famous world landmarks.
// Wordmark-heavy logos are intentionally excluded. Landmark images use CC0/public-domain Wikimedia Commons files.
(function(){
  if(typeof QUESTIONS==='undefined') return;

  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(QUESTIONS[i]?.category==='logos') QUESTIONS.splice(i,1);
  }

  if(typeof CATS!=='undefined'){
    CATS.logos={name:'شعارات ومعالم',emoji:'🖼️',color:'#c9b8f4'};
  }
  if(typeof state!=='undefined' && Array.isArray(state.categories) && !state.categories.includes('logos')){
    state.categories.push('logos');
  }

  const si=(slug,color)=>`https://cdn.simpleicons.org/${slug}/${color||'111111'}`;
  const wc=(filename)=>`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(filename)}?width=1000`;
  const pts=d=>d==='easy'?200:d==='medium'?400:600;

  // Only marks selected to avoid a written full brand name inside the image.
  // Deliberately removed wordmark/name-heavy items such as STC, Mobily, Noon, IKEA, KIA, Nissan, Subway, Sephora and similar marks.
  const logos=[
    // 200
    ['vis54-le01','easy','Apple',['Samsung','Huawei','Xiaomi'],'تقنية',si('apple','111111')],
    ['vis54-le02','easy','McDonald’s',['Burger King','KFC','Wendy’s'],'مطاعم سريعة',si('mcdonalds','FFC72C')],
    ['vis54-le03','easy','Starbucks',['Costa Coffee','Dunkin’','Tim Hortons'],'مقاهي',si('starbucks','00754A')],
    ['vis54-le04','easy','Nike',['Adidas','Puma','Under Armour'],'رياضة',si('nike','111111')],
    ['vis54-le05','easy','Mercedes-Benz',['Audi','BMW','Lexus'],'سيارات فاخرة',si('mercedes','111111')],
    ['vis54-le06','easy','Toyota',['Honda','Mazda','Subaru'],'سيارات يابانية',si('toyota','EB0A1E')],
    ['vis54-le07','easy','Mastercard',['Visa','American Express','UnionPay'],'مدفوعات',si('mastercard','EB001B')],
    ['vis54-le08','easy','Spotify',['Apple Music','YouTube Music','Anghami'],'موسيقى',si('spotify','1ED760')],

    // 400
    ['vis54-lm01','medium','Domino’s',['Pizza Hut','Papa John’s','Little Caesars'],'بيتزا',si('dominos','006491')],
    ['vis54-lm02','medium','Puma',['Adidas','Nike','New Balance'],'رياضة',si('puma','242B2F')],
    ['vis54-lm03','medium','Audi',['Mercedes-Benz','BMW','Volvo'],'سيارات أوروبية',si('audi','BB0A30')],
    ['vis54-lm04','medium','Renault',['Peugeot','Citroën','Opel'],'سيارات أوروبية',si('renault','FFCC33')],
    ['vis54-lm05','medium','Shell',['BP','TotalEnergies','ExxonMobil'],'طاقة ومحطات',si('shell','FFD500')],
    ['vis54-lm06','medium','Target',['Walmart','Costco','Carrefour'],'متاجر تجزئة',si('target','CC0000')],
    ['vis54-lm07','medium','Airbnb',['Booking.com','Vrbo','Expedia'],'سفر وسكن',si('airbnb','FF5A5F')],
    ['vis54-lm08','medium','Dropbox',['Google Drive','OneDrive','Box'],'تخزين سحابي',si('dropbox','0061FF')],

    // 600
    ['vis54-lh01','hard','Mazda',['Subaru','Mitsubishi','Suzuki'],'سيارات يابانية',si('mazda','101010')],
    ['vis54-lh02','hard','Peugeot',['Renault','Citroën','Opel'],'سيارات أوروبية',si('peugeot','1E398D')],
    ['vis54-lh03','hard','Carrefour',['Auchan','Tesco','Lulu Hypermarket'],'هايبرماركت',si('carrefour','004E9F')],
    ['vis54-lh04','hard','Red Bull',['Monster Energy','Rockstar Energy','Burn'],'مشروبات طاقة',si('redbull','DB0A40')],
    ['vis54-lh05','hard','Firefox',['Chrome','Opera','Brave'],'متصفحات',si('firefoxbrowser','FF7139')],
    ['vis54-lh06','hard','Slack',['Microsoft Teams','Discord','Asana'],'عمل وتواصل',si('slack','4A154B')],
    ['vis54-lh07','hard','Android',['Linux','Ubuntu','ChromeOS'],'أنظمة تشغيل',si('android','3DDC84')],
    ['vis54-lh08','hard','GitHub',['GitLab','Bitbucket','SourceForge'],'تطوير وبرمجة',si('github','181717')]
  ];

  const landmarks=[
    // 200 — globally iconic silhouettes/buildings.
    ['vis54-pe01','easy','برج إيفل',['بيغ بن','برج بيزا المائل','برج خليفة'],'باريس · فرنسا',wc('Eiffel tower paris france.jpg')],
    ['vis54-pe02','easy','تاج محل',['مسجد الشيخ زايد','قبر همايون','آيا صوفيا'],'أغرا · الهند',wc('Taj mahal Agra India.jpg')],
    ['vis54-pe03','easy','برج خليفة',['برج شنغهاي','تايبيه 101','ون وورلد تريد سنتر'],'دبي · الإمارات',wc('Burj Khalifa Image.jpg')],
    ['vis54-pe04','easy','دار أوبرا سيدني',['دار أوبرا أوسلو','إسبلاناد سنغافورة','رويال ألبرت هول'],'سيدني · أستراليا',wc('Sydney Opera House, 2008.jpg')],

    // 400 — famous, but slightly less instant than the 200 set.
    ['vis54-pm01','medium','الكولوسيوم',['مدرج فيرونا','البانثيون','المدرج الروماني في عمّان'],'روما · إيطاليا',wc('Colosseum, Rome.jpg')],
    ['vis54-pm02','medium','البتراء - الخزنة',['أبو سمبل','الحِجر - مدائن صالح','أفسس'],'الأردن',wc('Petra, Jordan (Unsplash).jpg')],
    ['vis54-pm03','medium','سور الصين العظيم',['سور هادريان','أسوار دوبروفنيك','سور مدينة شيآن'],'الصين',wc('Great Wall of China, China (Unsplash).jpg')],
    ['vis54-pm04','medium','تمثال المسيح الفادي',['تمثال الحرية','تمثال كريستو ري','تمثال الوطن الأم ينادي'],'ريو دي جانيرو · البرازيل',wc('Christ the redeemer.jpg')],

    // 600 — still well-known places, but less giveaway than the easy set.
    ['vis54-ph01','hard','ماتشو بيتشو',['تشيتشن إيتزا','تيكال','بالينكي'],'بيرو',wc('Peru Machu Picchu.jpg')],
    ['vis54-ph02','hard','ساغرادا فاميليا',['كاتدرائية ميلانو','كاتدرائية كولونيا','نوتردام باريس'],'برشلونة · إسبانيا',wc('Sagrada Família, Barcelona.jpg')],
    ['vis54-ph03','hard','مارينا باي ساندز',['أتلانتس النخلة','ذا فينيشيان ماكاو','جميرا بيتش هوتيل'],'سنغافورة',wc('Marina Bay Sands, Singapore (Unsplash).jpg')],
    ['vis54-ph04','hard','أنغكور وات',['بوروبودور','برامبانان','وات آرون'],'كمبوديا',wc('Angkor Wat, Krong Siem Reap, Cambodia (Unsplash).jpg')]
  ];

  QUESTIONS.push(...logos.map(r=>({
    questionID:r[0],category:'logos',difficulty:r[1],points:pts(r[1]),questionType:'logo',visualKind:'brand',
    questionText:'وش هذا الشعار؟',correctAnswer:r[2],wrongAnswers:r[3],hint:r[4],subCategory:r[4],mediaURL:r[5],
    regionTag:'Global',countryRegionTags:['International'],eraTag:'Modern',contentScope:'visual-brand-v54'
  })));

  QUESTIONS.push(...landmarks.map(r=>({
    questionID:r[0],category:'logos',difficulty:r[1],points:pts(r[1]),questionType:'logo',visualKind:'landmark',
    questionText:'وش هذا المعلم أو المكان؟',correctAnswer:r[2],wrongAnswers:r[3],hint:r[4],subCategory:'معالم وأماكن',mediaURL:r[5],
    regionTag:'Global',countryRegionTags:['International'],eraTag:'Mixed',contentScope:'visual-landmark-v54',imageLicense:'CC0/Public Domain'
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
    const kind=q.visualKind==='landmark'?'visual-landmark':'visual-brand';
    const diff=q.difficulty==='hard'?'visual-hard':q.difficulty==='medium'?'visual-medium':'visual-easy';
    return `<div class="visual-question-v54 ${kind} ${diff}"><div class="visual-frame-v54"><img src="${q.mediaURL}" alt="" aria-label="صورة السؤال" referrerpolicy="no-referrer" onerror="window.laffhaLogoBroken&&window.laffhaLogoBroken()"></div></div>`;
  };

  try{ if(typeof render==='function') render(); }catch(e){}
  console.info('Laffha V54 visual logos + landmarks ready', logos.length, landmarks.length);
})();