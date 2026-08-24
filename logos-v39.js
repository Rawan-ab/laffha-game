// V39 — symbol-only logos. Removes wordmarks that reveal the answer (Uber-style questions).
(function(){
  for(let i=QUESTIONS.length-1;i>=0;i--){
    if(QUESTIONS[i]?.category==='logos') QUESTIONS.splice(i,1);
  }

  const rows=[
    // Easy — iconic symbols, but never the full brand name.
    ['log39-e01','easy','Apple','apple','000000','تقنية'],
    ['log39-e02','easy','YouTube','youtube','FF0000','فيديو'],
    ['log39-e03','easy','Instagram','instagram','E4405F','تواصل اجتماعي'],
    ['log39-e04','easy','TikTok','tiktok','000000','فيديو قصير'],
    ['log39-e05','easy','WhatsApp','whatsapp','25D366','مراسلة'],
    ['log39-e06','easy','Snapchat','snapchat','FFFC00','تواصل اجتماعي'],
    ['log39-e07','easy','Spotify','spotify','1ED760','موسيقى'],
    ['log39-e08','easy','Nike','nike','111111','رياضة'],
    ['log39-e09','easy','Adidas','adidas','000000','رياضة'],
    ['log39-e10','easy','Netflix','netflix','E50914','مشاهدة'],

    // Medium — recognizable marks/monograms, still no complete written answer.
    ['log39-m01','medium','Telegram','telegram','26A5E4','مراسلة'],
    ['log39-m02','medium','Reddit','reddit','FF4500','مجتمعات'],
    ['log39-m03','medium','Pinterest','pinterest','BD081C','صور وأفكار'],
    ['log39-m04','medium','PayPal','paypal','003087','مدفوعات'],
    ['log39-m05','medium','Mastercard','mastercard','EB001B','مدفوعات'],
    ['log39-m06','medium','Mercedes-Benz','mercedes','000000','سيارات'],
    ['log39-m07','medium','Audi','audi','BB0A30','سيارات'],
    ['log39-m08','medium','GitHub','github','181717','تطوير'],
    ['log39-m09','medium','Discord','discord','5865F2','محادثة ومجتمعات'],
    ['log39-m10','medium','Twitch','twitch','9146FF','بث مباشر'],

    // Hard — less immediate symbols for 600-point questions.
    ['log39-h01','hard','Airbnb','airbnb','FF5A5F','سفر وسكن'],
    ['log39-h02','hard','Dropbox','dropbox','0061FF','تخزين سحابي'],
    ['log39-h03','hard','Slack','slack','4A154B','عمل وتواصل'],
    ['log39-h04','hard','Figma','figma','F24E1E','تصميم'],
    ['log39-h05','hard','Android','android','3DDC84','أنظمة تشغيل'],
    ['log39-h06','hard','Firefox','firefoxbrowser','FF7139','متصفح'],
    ['log39-h07','hard','Docker','docker','2496ED','تطوير'],
    ['log39-h08','hard','Kubernetes','kubernetes','326CE5','تقنية'],
    ['log39-h09','hard','Ubuntu','ubuntu','E95420','أنظمة تشغيل'],
    ['log39-h10','hard','Steam','steam','000000','ألعاب']
  ];

  QUESTIONS.push(...rows.map(r=>({
    questionID:r[0],category:'logos',difficulty:r[1],points:r[1]==='easy'?200:r[1]==='medium'?400:600,
    questionType:'logo',questionText:'وش هذا الشعار؟',correctAnswer:r[2],wrongAnswers:[],hint:r[5],
    regionTag:'Global',countryRegionTags:['International'],eraTag:'Modern',subCategory:r[5],
    mediaURL:`https://cdn.simpleicons.org/${r[3]}/${r[4]}`,logoSub:'',contentScope:'global'
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
    return `<div class="logo-question logo-question-v38"><div class="logo-media"><img src="${q.mediaURL}" alt="" aria-label="شعار بدون اسم" onerror="window.laffhaLogoBroken&&window.laffhaLogoBroken()"></div></div>`;
  };

  console.info('Laffha V39 symbol-only logo bank ready', rows.length);
})();