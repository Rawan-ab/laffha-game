// V38 — clear, color-preserving logo set. Removes unclear/broken/wordmark-heavy items.
(function(){
  for(let i=QUESTIONS.length-1;i>=0;i--) if(QUESTIONS[i]?.category==='logos') QUESTIONS.splice(i,1);

  const rows=[
    ['log38-e01','easy','Apple','apple','تقنية'],
    ['log38-e02','easy','YouTube','youtube','فيديو'],
    ['log38-e03','easy','Instagram','instagram','تواصل اجتماعي'],
    ['log38-e04','easy','TikTok','tiktok','فيديو قصير'],
    ['log38-e05','easy','WhatsApp','whatsapp','مراسلة'],
    ['log38-e06','easy','Snapchat','snapchat','تواصل اجتماعي'],
    ['log38-e07','easy','Spotify','spotify','موسيقى'],
    ['log38-e08','easy','Netflix','netflix','مشاهدة'],
    ['log38-e09','easy','Nike','nike','رياضة'],
    ['log38-e10','easy','Adidas','adidas','رياضة'],

    ['log38-m01','medium','Telegram','telegram','مراسلة'],
    ['log38-m02','medium','Reddit','reddit','مجتمعات'],
    ['log38-m03','medium','Pinterest','pinterest','صور وأفكار'],
    ['log38-m04','medium','PayPal','paypal','مدفوعات'],
    ['log38-m05','medium','Mastercard','mastercard','مدفوعات'],
    ['log38-m06','medium','Audi','audi','سيارات'],
    ['log38-m07','medium','BMW','bmw','سيارات'],
    ['log38-m08','medium','Mercedes-Benz','mercedes','سيارات'],
    ['log38-m09','medium','Porsche','porsche','سيارات'],
    ['log38-m10','medium','Ferrari','ferrari','سيارات'],

    ['log38-h01','hard','GitHub','github','تطوير'],
    ['log38-h02','hard','Discord','discord','مجتمعات ومحادثة'],
    ['log38-h03','hard','Twitch','twitch','بث مباشر'],
    ['log38-h04','hard','Airbnb','airbnb','سفر وسكن'],
    ['log38-h05','hard','Uber','uber','نقل'],
    ['log38-h06','hard','Zoom','zoom','اجتماعات'],
    ['log38-h07','hard','Dropbox','dropbox','تخزين سحابي'],
    ['log38-h08','hard','Slack','slack','عمل وتواصل'],
    ['log38-h09','hard','Figma','figma','تصميم'],
    ['log38-h10','hard','Notion','notion','إنتاجية']
  ];

  QUESTIONS.push(...rows.map(r=>({
    questionID:r[0],category:'logos',difficulty:r[1],points:r[1]==='easy'?200:r[1]==='medium'?400:600,
    questionType:'logo',questionText:'وش هذا الشعار؟',correctAnswer:r[2],wrongAnswers:[],hint:r[4],
    regionTag:'Global',countryRegionTags:['International'],eraTag:'Modern',subCategory:r[4],
    mediaURL:`https://cdn.simpleicons.org/${r[3]}`,logoSub:''
  })));

  window.laffhaLogoBroken=function(){
    const q=state?.currentQuestion;
    if(!q)return;
    q._brokenLogo=true;
    const idx=QUESTIONS.indexOf(q);
    if(idx>=0)QUESTIONS.splice(idx,1);
    setTimeout(()=>pickQuestion(state.drawnDifficulty||q.difficulty,true),0);
  };

  finalLogo=function(q){
    return `<div class="logo-question logo-question-v38"><div class="logo-media"><img src="${q.mediaURL}" alt="" aria-label="شعار" onerror="window.laffhaLogoBroken&&window.laffhaLogoBroken()"></div></div>`;
  };

  console.info('Laffha V38 colored logo set ready');
})();