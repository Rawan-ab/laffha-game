// V51 — Top 10 special event: 3 hearts per team, event points are added once when the event ends.
(function(){
  const CHALLENGES=[
    {
      id:'land-area',
      title:'أكبر 10 دول في العالم من حيث المساحة البرية',
      answers:[
        ['روسيا',['روسيا','روسيا الاتحادية']],
        ['الصين',['الصين','جمهورية الصين الشعبية']],
        ['الولايات المتحدة',['الولايات المتحدة','الولايات المتحدة الأمريكية','الولايات المتحدة الامريكية','أمريكا','امريكا','USA']],
        ['كندا',['كندا']],
        ['البرازيل',['البرازيل']],
        ['أستراليا',['أستراليا','استراليا']],
        ['الهند',['الهند']],
        ['الأرجنتين',['الأرجنتين','الارجنتين','ارجنتين']],
        ['كازاخستان',['كازاخستان','كازخستان']],
        ['الجزائر',['الجزائر']]
      ]
    },
    {
      id:'mountains',
      title:'أعلى 10 قمم جبلية في العالم',
      answers:[
        ['إيفرست',['إيفرست','افرست','جبل إيفرست','جبل افرست','Everest']],
        ['K2',['K2','كي 2','كي تو','جبل كي 2']],
        ['كانغشينجونغا',['كانغشينجونغا','كانشينجونغا','Kangchenjunga']],
        ['لوتسي',['لوتسي','Lhotse']],
        ['ماكالو',['ماكالو','Makalu']],
        ['تشو أويو',['تشو أويو','تشو اويو','Cho Oyu']],
        ['دهاولاغيري',['دهاولاغيري','دولاغيري','Dhaulagiri']],
        ['ماناسلو',['ماناسلو','Manaslu']],
        ['نانغا باربات',['نانغا باربات','نانجا باربات','Nanga Parbat']],
        ['أنابورنا 1',['أنابورنا','انابورنا','أنابورنا 1','انابورنا 1','Annapurna I']]
      ]
    },
    {
      id:'islands',
      title:'أكبر 10 جزر في العالم من حيث المساحة (باستثناء القارات)',
      answers:[
        ['غرينلاند',['غرينلاند','جرينلاند','Greenland']],
        ['غينيا الجديدة',['غينيا الجديدة','نيو غينيا','New Guinea']],
        ['بورنيو',['بورنيو','Borneo']],
        ['مدغشقر',['مدغشقر','مدغسكر','Madagascar']],
        ['بافن',['بافن','جزيرة بافن','Baffin Island']],
        ['سومطرة',['سومطرة','سوماترا','Sumatra']],
        ['هونشو',['هونشو','Honshu']],
        ['فيكتوريا',['فيكتوريا','جزيرة فيكتوريا','Victoria Island']],
        ['بريطانيا العظمى',['بريطانيا العظمى','جزيرة بريطانيا العظمى','Great Britain']],
        ['إلسمير',['إلسمير','السمير','جزيرة إلسمير','Ellesmere Island']]
      ]
    },
    {
      id:'lakes',
      title:'أكبر 10 بحيرات في العالم من حيث المساحة السطحية',
      answers:[
        ['بحر قزوين',['بحر قزوين','قزوين','بحيرة قزوين','Caspian Sea']],
        ['سوبيريور',['سوبيريور','بحيرة سوبيريور','Superior']],
        ['فيكتوريا',['فيكتوريا','بحيرة فيكتوريا','Victoria']],
        ['هورون',['هورون','بحيرة هورون','Huron']],
        ['ميشيغان',['ميشيغان','ميشيجان','بحيرة ميشيغان','Michigan']],
        ['تنجانيقا',['تنجانيقا','تنجانيكا','بحيرة تنجانيقا','Tanganyika']],
        ['بايكال',['بايكال','بحيرة بايكال','Baikal']],
        ['الدب العظيم',['الدب العظيم','بحيرة الدب العظيم','Great Bear Lake']],
        ['ملاوي',['ملاوي','بحيرة ملاوي','نياسا','Lake Malawi']],
        ['العبد العظيم',['العبد العظيم','بحيرة العبد العظيم','Great Slave Lake']]
      ]
    }
  ];

  const baseRender=render;
  let ctx={gameKey:null,started:false,done:false,challenge:null,revealed:new Set(),lives:[],eventScores:[],turn:0,ended:false,feedback:null,applied:false};

  function norm(s){
    return String(s||'').trim().toLowerCase()
      .replace(/[ًٌٍَُِّْـ]/g,'')
      .replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/ى/g,'ي')
      .replace(/[.,،!؟?؛:()\-_/]/g,' ')
      .replace(/\s+/g,' ').trim();
  }
  function distance(a,b){
    a=norm(a);b=norm(b);const m=a.length,n=b.length;const d=Array.from({length:m+1},()=>Array(n+1).fill(0));
    for(let i=0;i<=m;i++)d[i][0]=i;for(let j=0;j<=n;j++)d[0][j]=j;
    for(let i=1;i<=m;i++)for(let j=1;j<=n;j++)d[i][j]=Math.min(d[i-1][j]+1,d[i][j-1]+1,d[i-1][j-1]+(a[i-1]===b[j-1]?0:1));
    return d[m][n];
  }
  function matches(guess,aliases){
    const g=norm(guess);if(!g)return false;
    return aliases.some(a=>{const x=norm(a);return g===x || (g.length>=6&&x.length>=6&&Math.abs(g.length-x.length)<=1&&distance(g,x)<=1)});
  }
  function resetCtx(gameKey){
    ctx={gameKey,started:false,done:false,challenge:null,revealed:new Set(),lives:[],eventScores:[],turn:0,ended:false,feedback:null,applied:false};
  }
  function syncGame(){if(ctx.gameKey!==state.usedQuestions)resetCtx(state.usedQuestions)}
  function triggerRound(){return Math.floor(Number(state.rounds||7)/2)+1}
  function shouldStart(){
    syncGame();
    return !ctx.started&&!ctx.done&&state.teams.length>=2&&state.screen==='spin'&&state.currentTeam===0&&state.currentRound===triggerRound();
  }
  function pickChallenge(){
    let hist=[];try{hist=JSON.parse(localStorage.getItem('laffhaTop10History')||'[]')}catch(e){}
    let pool=CHALLENGES.filter(c=>!hist.includes(c.id));if(!pool.length){hist=[];pool=[...CHALLENGES]}
    const c=pool[Math.floor(Math.random()*pool.length)];hist.push(c.id);
    try{localStorage.setItem('laffhaTop10History',JSON.stringify(hist.slice(-CHALLENGES.length)))}catch(e){}
    return c;
  }
  function startEvent(){
    ctx.started=true;
    ctx.challenge=pickChallenge();
    ctx.revealed=new Set();
    ctx.lives=state.teams.map(()=>3);
    ctx.eventScores=state.teams.map(()=>0);
    ctx.turn=0;
    ctx.ended=false;
    ctx.applied=false;
    ctx.feedback={type:'neutral',text:'اكتبوا إجابة من القائمة ثم اضغطوا تحقق.'};
    state.screen='top10';
  }
  function hearts(n){return Array.from({length:3},(_,i)=>`<span class="top10-heart ${i>=n?'off':''}">♥</span>`).join('')}
  function boardHtml(){
    const rows=ctx.challenge.answers.map((a,i)=>({rank:i+1,name:a[0]}));
    const slot=x=>`<div class="top10-slot ${ctx.revealed.has(x.rank)?'revealed':''}"><div class="top10-rank">${x.rank}</div><div class="top10-answer">${ctx.revealed.has(x.rank)?x.name:'••••••••'}</div><div class="top10-pts">+${x.rank}</div></div>`;
    return `<div class="top10-col">${rows.slice(0,5).map(slot).join('')}</div><div class="top10-col">${rows.slice(5).map(slot).join('')}</div>`;
  }
  function applyEventScores(){
    if(ctx.applied)return;
    ctx.eventScores.forEach((score,i)=>{if(state.teams[i])state.teams[i].score+=score});
    ctx.applied=true;
  }
  function endEventNow(){
    applyEventScores();
    ctx.ended=true;
    top10Screen();
  }
  function top10Screen(){
    clearInterval(state.timerId);
    const count=Math.min(state.teams.length,6);
    const teamsHtml=state.teams.map((t,i)=>`<div class="top10-team ${i===ctx.turn&&!ctx.ended&&ctx.lives[i]>0?'active':''} ${ctx.lives[i]<=0?'out':''}"><div class="top10-team-name"><span class="top10-team-dot" style="background:${t.color}"></span>${t.name}</div><div class="top10-team-row"><div class="top10-event-score">+${ctx.eventScores[i]}<small>نقاط توب 10 · المجموع ${t.score}</small></div><div class="top10-hearts">${hearts(ctx.lives[i])}</div></div></div>`).join('');
    const input=ctx.ended
      ?`<div class="top10-end"><h3>انتهى حدث توب 10 👑</h3><p>${resultText()}</p><button class="top10-back" id="top10Back">العودة للعبة</button></div>`
      :`<div class="top10-entry-wrap"><div class="top10-turn">دور <strong>${state.teams[ctx.turn].name}</strong></div><div class="top10-entry"><input id="top10Guess" autocomplete="off" placeholder="اكتبوا إجابتكم هنا…"><button class="top10-submit" id="top10Submit">تحقق</button></div><div class="top10-feedback ${ctx.feedback.type}">${ctx.feedback.text}</div></div>`;
    gameLayout(`<div class="top10-event-wrap"><div class="top10-event-head"><div class="top10-crown">👑 توب 10</div><div class="top10-kicker">حدث خاص · لا يحسب من عدد الجولات</div><h2 class="top10-title">${ctx.challenge.title}</h2><div class="top10-sub">كلما كانت الإجابة <strong>أقل توقعًا وأسفل القائمة</strong>، كانت نقاطها أعلى.</div></div><div class="top10-teams" style="--top10-team-count:${count}">${teamsHtml}</div><div class="top10-board">${boardHtml()}</div>${input}<div class="top10-rules-mini"><span class="top10-rule-pill">❤️ 3 أخطاء لكل فريق</span><span class="top10-rule-pill">✅ الصحيح يكشف ترتيبه</span><span class="top10-rule-pill">❌ الخطأ ينقص قلبًا</span><span class="top10-rule-pill">🔁 المكرر لا يخصم قلبًا</span></div></div>`);
    if(ctx.ended){document.getElementById('top10Back').onclick=finishEvent;return}
    const inp=document.getElementById('top10Guess'),btn=document.getElementById('top10Submit');
    btn.onclick=submit;inp.onkeydown=e=>{if(e.key==='Enter')submit()};setTimeout(()=>inp.focus(),0);
  }
  function resultText(){
    const max=Math.max(...ctx.eventScores),wins=ctx.eventScores.map((s,i)=>s===max?state.teams[i].name:null).filter(Boolean);
    const scoreSummary=ctx.eventScores.map((s,i)=>`${state.teams[i].name}: +${s}`).join(' · ');
    if(wins.length>1)return `تعادل في الحدث بين ${wins.join(' و ')} بـ ${max} نقطة. تم إضافة النتائج للمجموع: ${scoreSummary}`;
    return `${wins[0]} جمع ${max} نقطة في الحدث. تم إضافة النتائج للمجموع: ${scoreSummary}`;
  }
  function findGuess(v){
    return ctx.challenge.answers.map((a,i)=>({rank:i+1,name:a[0],aliases:a[1]})).find(x=>matches(v,[x.name,...x.aliases]));
  }
  function nextAlive(from){
    for(let step=1;step<=ctx.lives.length;step++){
      const i=(from+step)%ctx.lives.length;
      if(ctx.lives[i]>0)return i;
    }
    return -1;
  }
  function checkEnd(){return ctx.revealed.size===10 || ctx.lives.every(x=>x<=0)}
  function submit(){
    if(ctx.ended)return;
    const inp=document.getElementById('top10Guess');
    const v=inp.value.trim();
    if(!v){ctx.feedback={type:'neutral',text:'اكتبوا إجابة أولًا.'};top10Screen();return}
    const hit=findGuess(v);
    if(hit&&ctx.revealed.has(hit.rank)){
      ctx.feedback={type:'repeat',text:`🔁 «${hit.name}» إجابة صحيحة لكنها انكشفت مسبقًا — لا يُخصم قلب.`};
    }else if(hit){
      ctx.revealed.add(hit.rank);
      ctx.eventScores[ctx.turn]+=hit.rank;
      ctx.feedback={type:'good',text:`✅ صحيحة! «${hit.name}» في المركز ${hit.rank} — +${hit.rank} نقطة.`};
    }else{
      ctx.lives[ctx.turn]=Math.max(0,ctx.lives[ctx.turn]-1);
      ctx.feedback={type:'bad',text:`❌ الإجابة غير موجودة في توب 10 — خسر ${state.teams[ctx.turn].name} قلبًا.`};
    }
    if(checkEnd()){endEventNow();return}
    const nxt=nextAlive(ctx.turn);
    if(nxt<0){endEventNow();return}
    ctx.turn=nxt;
    top10Screen();
  }
  function finishEvent(){
    applyEventScores();
    ctx.done=true;ctx.ended=true;state.screen='spin';baseRender();
  }
  function decorateSetup(){
    if(state.screen!=='setup'||document.querySelector('.top10-setup-note'))return;
    const begin=document.getElementById('begin');if(!begin)return;
    begin.insertAdjacentHTML('afterend','<div class="top10-setup-note">👑 <strong>توب 10:</strong> حدث مفاجئ يظهر مرة واحدة في منتصف المباراة، بلا مؤقت، ولكل فريق 3 أخطاء.</div>');
  }
  render=function(){
    syncGame();
    if(shouldStart())startEvent();
    if(state.screen==='top10')return top10Screen();
    const out=baseRender();decorateSetup();return out;
  };
  console.info('Laffha V51 Top 10: 3 hearts + award points at end');
})();