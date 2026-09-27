(() => {
  const root = document.getElementById('solo-app');
  const api = window.LaffhaRealtime;
  const categories = [['tv','📺 مسلسلات'],['movies','🎬 أفلام'],['songs','🎵 أغاني'],['artists','🎤 فنانين'],['cartoons','🧸 كرتون وطفولة'],['sports','⚽ رياضة'],['general','🌍 معلومات عامة'],['countries','🌎 دول العالم']];
  const avatars = ['😄','😎','😮','😊','😉','😴'];
  const avatarLabels = {'😄':'متحمس','😎':'رايق','😮':'مندهش','😊':'سعيد','😉':'مرح','😴':'نعسان'};
  const avatarFaces = {
    '😄': ['#FFD56F','<path d="M21 34q5-6 10 0m12 0q5-6 10 0"/><path d="M23 47q15 22 30 0z" fill="#241B38" stroke="#241B38"/>'],
    '😎': ['#FFA858','<path d="M15 32h22v9q-11 8-22-1zm24 0h22v8q-11 9-22 1z" fill="#241B38" stroke="#241B38"/><path d="M37 35h3m-13 19q11 9 22 0"/>'],
    '😮': ['#FFB19C','<circle cx="27" cy="34" r="4" fill="#241B38" stroke="none"/><circle cx="49" cy="34" r="4" fill="#241B38" stroke="none"/><ellipse cx="38" cy="53" rx="9" ry="11" fill="#241B38" stroke="none"/>'],
    '😊': ['#FFCD6D','<path d="M21 34q6-8 12 0m10 0q6-8 12 0m-28 16q11 12 22 0"/><circle cx="20" cy="45" r="5" fill="#F28989" opacity=".7" stroke="none"/><circle cx="56" cy="45" r="5" fill="#F28989" opacity=".7" stroke="none"/>'],
    '😉': ['#86C990','<path d="M19 35q7-7 14 0"/><circle cx="49" cy="34" r="3.5" fill="#241B38" stroke="none"/><path d="M27 51q12 13 24 0"/>'],
    '😴': ['#BFE4D1','<path d="M20 35q7 5 14 0m10 0q7 5 14 0"/><ellipse cx="39" cy="53" rx="6" ry="8" fill="#241B38" stroke="none"/><text x="52" y="20" font-size="14" fill="#694488" stroke="none">Z</text>']
  };
  const avatarArt = value => {
    const face=avatarFaces[value];
    if(!face) return esc(value);
    return `<svg viewBox="0 0 76 76" role="img" aria-label="${avatarLabels[value]}" xmlns="http://www.w3.org/2000/svg"><rect x="2" y="2" width="72" height="72" rx="20" fill="${face[0]}"/><g fill="none" stroke="#241B38" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">${face[1]}</g></svg>`;
  };
  const errorText = {unauthorized:'تعذر الدخول. حدّث الصفحة وحاول مرة ثانية.',room_unavailable:'الغرفة غير متاحة. تأكد من الرقم.',room_full:'الغرفة ممتلئة.',need_two_players:'انتظر دخول لاعب آخر.',not_your_turn:'الدور على لاعب آخر.',question_closed:'انتهى وقت السؤال.',already_answered:'أرسلت إجابتك بالفعل.',no_questions:'ما لقينا أسئلة مناسبة لهذه الجولة.',invalid_join:'أدخل رقم غرفة صحيح واسمك.',not_a_player:'جلستك تغيرت. ادخل الغرفة من جديد.'};
  const invitedCode=new URLSearchParams(location.search).get('room')||'';
  let screen=/^\d{6}$/.test(invitedCode)?'join':'home', joinCode=/^\d{6}$/.test(invitedCode)?invitedCode:'', chosenAvatar=avatars[0], state=null, roomId=/^\d{6}$/.test(invitedCode)?null:sessionStorage.getItem('laffha-individual-room'), selected='', busy=false, message='', polling=null, ticking=null, lastView='', userId='';
  const esc = v => String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const top = () => `<header class="top"><a class="brand" href="./">لفّها ✨</a><a class="back" href="./">الرجوع للعبة</a></header>`;
  const err = () => message ? `<div class="error" role="alert">${esc(message)}</div>` : '';
  const button=(label,act,cls='primary',disabled=false)=>`<button class="${cls}" data-act="${act}" ${disabled?'disabled':''}>${label}</button>`;
  const playerRows=players=>`<div class="list">${players.map(p=>`<div class="person"><span class="avatar">${avatarArt(p.avatar)}</span><strong>${esc(p.display_name)}</strong><span class="score">${Number(p.score)||0} نقطة</span></div>`).join('')}</div>`;
  const inviteUrl=code=>{const url=new URL('individual.html',location.href);url.searchParams.set('room',code);return url.toString()};
  function renderInviteQr(code){
    const target=document.getElementById('room-qr');if(!target)return;
    if(window.QRCode)new QRCode(target,{text:inviteUrl(code),width:164,height:164,colorDark:'#241b38',colorLight:'#ffffff',correctLevel:QRCode.CorrectLevel.M});
    else target.innerHTML='<span class="muted">شارك رقم الغرفة للدخول</span>';
  }
  function view(next){screen=next;lastView='';render();}
  function render(){
    if(!api){root.innerHTML=top()+`<div class="error">تعذر تحميل الاتصال. حدّث الصفحة.</div>`;return;}
    if(!state){
      if(screen==='home') root.innerHTML=top()+`<div class="hero center"><h1>ابدأ اللعبة</h1></div><div class="card stack center">${button('إنشاء غرفة','createForm')}${button('دخول برقم الغرفة','codeForm','secondary')}</div>`+err();
      else if(screen==='code') root.innerHTML=top()+`<div class="hero center"><h1>دخول الغرفة</h1></div><div class="card"><label class="field" for="code">رقم الغرفة</label><input id="code" class="input code-input" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="6" autocomplete="one-time-code" value="${esc(joinCode)}"><div class="space"></div>${button('متابعة','joinForm')}</div>`+err();
      else root.innerHTML=top()+`<div class="hero center"><h1>${screen==='create'?'جهّز غرفتك':'اختار شكلك واسمك'}</h1></div><div class="card">${screen==='join'?`<p class="pill">الغرفة ${esc(joinCode)}</p>`:''}<label class="field" for="name">اسم اللاعب</label><input id="name" class="input" maxlength="24" placeholder="اكتب اسمك" autocomplete="nickname"><label class="field">اختر شكلك</label><div class="avatars">${avatars.map(a=>`<button class="avatar-choice ${a===chosenAvatar?'active':''}" data-avatar="${a}" aria-label="${avatarLabels[a]}" aria-pressed="${a===chosenAvatar}">${avatarArt(a)}</button>`).join('')}</div>${button(screen==='create'?'إنشاء الغرفة':'دخول الغرفة','submitForm','primary',busy)}</div>`+err();
      return;
    }
    const r=state.room, players=state.players, me=players.find(p=>p.user_id===userId), turn=players.find(p=>p.seat===r.turnIndex), category=state.question?.category, catName=categories.find(c=>c[0]===category)?.[1]||'التحدّي';
    const header=top()+`<div class="question-top"><span class="pill">الغرفة ${esc(r.code)} · الجولة ${Math.min(r.round,r.rounds)}/${r.rounds}</span><span class="pill personal-score">${avatarArt(me?.avatar||'')} نقاطك: <b>${Number(me?.score)||0}</b></span></div>`;
    let content='';
    if(r.phase==='lobby') content=`<div class="card center"><h1>الغرفة جاهزة!</h1><p class="muted">شارك الرقم أو خلّ أصحابك يمسحون الرمز</p><div class="big-code">${esc(r.code)}</div><div class="invite-qr" id="room-qr" aria-label="رمز QR لدخول الغرفة"></div><button class="copy-link" data-act="copyLink">نسخ رابط الدعوة</button>${playerRows(players)}${state.isHost?button('ابدأ اللعبة','start','primary',players.length<2||busy)+(players.length<2?'<p class="muted tiny">ننتظر أحد يدخل الغرفة ✨</p>':''):'<p class="muted">ننتظر صاحب الغرفة يبدأ اللعبة ✨</p>'}</div>`;
    if(r.phase==='spin') content=`<div class="card center"><h1>اختاروا التحدّي</h1><p class="muted">ضغطة واحدة تختار فئة عشوائية</p><div class="board">${categories.map(c=>`<div class="category">${c[1]}</div>`).join('')}</div>${me?.seat===r.turnIndex?`<button class="spin" data-act="spin" ${busy?'disabled':''}>ابدأ<br>الاختيار</button>`:`<div class="spin" aria-label="بانتظار اللاعب">دور<br>${esc(turn?.display_name||'اللاعب')}</div>`}<p class="muted">كلما كانت الإجابة الصحيحة أسرع، زادت نقاطها</p></div>`;
    if(r.phase==='question'){
      const q=state.question, seconds=Math.max(0,Math.ceil((Date.parse(r.deadline)-Date.now())/1000)), opened=Date.now()>=Date.parse(r.openedAt), answered=!!state.ownAnswer;
      content=`<div class="card"><div class="question-top"><strong>${esc(catName)}</strong><span id="solo-timer" class="timer ${seconds<=10?'urgent':''}" aria-label="الوقت المتبقي">${seconds}</span></div><h2 class="question-text">${opened?esc(q?.text):'استعدوا للسؤال…'}</h2>${opened?`<div class="stack">${(q?.options||[]).map(o=>`<button class="option ${selected===o?'selected':''}" data-option="${esc(o)}" ${answered||seconds===0?'disabled':''}>${esc(o)}</button>`).join('')}</div><div class="space"></div>${answered?`<p class="center muted">وصلت إجابتك! ننتظر الباقين ✨</p>`:button('أرسل الإجابة','answer','primary',!selected||seconds===0||busy)}`:''}</div>`;
    }
    if(r.phase==='result'||r.phase==='finished'){
      const ordered=[...players].sort((a,b)=>b.score-a.score||a.seat-b.seat);
      content=`<div class="card center"><h1>${r.phase==='finished'?'النتيجة النهائية 🏆':'نتيجة الجولة ✨'}</h1>${r.phase==='result'?`<p class="muted">الإجابة: <b>${esc(state.question?.correctAnswer||'')}</b></p>`:''}<div class="list">${ordered.map((p,i)=>`<div class="rank ${i<3?'medal':''}"><span class="place">${['🥇','🥈','🥉'][i]||''}</span><span class="avatar">${avatarArt(p.avatar)}</span><strong>${esc(p.display_name)}</strong><span class="score">${Number(p.score)||0} نقطة</span></div>`).join('')}</div>${r.phase==='result'?(state.isHost?button(r.round>=r.rounds?'عرض النتيجة النهائية':'الجولة التالية','next','primary',busy):'<p class="muted">ننتظر صاحب الغرفة للجولة التالية</p>'):button('الرجوع للبداية','home','secondary')}</div>`;
    }
    root.innerHTML=header+content+err();lastView=`${r.phase}:${r.round}:${state.question?.id||''}`;
    if(r.phase==='lobby')renderInviteQr(r.code);
  }
  async function call(action, extra={}){
    await api.ensureSession();
    const {data,error}=await api.client.functions.invoke('laffha-individual',{body:{action,roomId,...extra}});
    if(error){let detail=error.message;try{const body=await error.context?.json();detail=body?.error||detail}catch(_){}throw new Error(errorText[detail]||detail)}
    if(data?.error)throw new Error(errorText[data.error]||data.error);
    return data;
  }
  async function refresh(){if(!roomId||busy)return;try{const incoming=await call('state');userId=incoming.userId;const key=`${incoming.room.phase}:${incoming.room.round}:${incoming.question?.id||''}`;if(key!==lastView)selected='';const changed=JSON.stringify(incoming)!==JSON.stringify(state);state=incoming;if(changed)render();message=''}catch(e){message=String(e.message);if(/غير متاحة|تغيرت/.test(message)){roomId='';sessionStorage.removeItem('laffha-individual-room');state=null;view('home')}else if(!state)render()}}
  async function action(act){
    if(busy)return;message='';
    if(act==='createForm')return view('create');
    if(act==='codeForm')return view('code');
    if(act==='copyLink'){try{await navigator.clipboard.writeText(inviteUrl(state.room.code));const el=root.querySelector('[data-act="copyLink"]');if(el)el.textContent='تم نسخ الرابط ✓'}catch(_){message='تعذر النسخ. شارك رقم الغرفة الظاهر فوق.';render()}return}
    if(act==='joinForm'){joinCode=(document.getElementById('code')?.value||'').replace(/\D/g,'').slice(0,6);if(joinCode.length!==6){message='اكتب رقم الغرفة المكوّن من 6 أرقام';render();return}return view('join')}
    if(act==='home'){sessionStorage.removeItem('laffha-individual-room');roomId='';state=null;selected='';return view('home')}
    const submittedName=act==='submitForm'?(document.getElementById('name')?.value||'').trim():'';
    busy=true;try{
      let response;
      if(act==='submitForm'){
        const name=submittedName;
        if(!name)throw new Error('اكتب اسمك أولاً');
        response=await call(screen==='create'?'create':'join',{name,avatar:chosenAvatar,code:joinCode});
        roomId=response.room.id;sessionStorage.setItem('laffha-individual-room',roomId);
      }else if(act==='answer'){
        if(!selected)return;await call('answer',{answer:selected});selected='';
      }else await call(act);
      await refreshForce();
    }catch(e){message=String(e.message);render()}finally{busy=false;render()}
  }
  async function refreshForce(){const incoming=await call('state');state=incoming;userId=incoming.userId;selected='';lastView='';render()}
  root.addEventListener('click',e=>{
    const avatar=e.target.closest('[data-avatar]');if(avatar){chosenAvatar=avatar.dataset.avatar;root.querySelectorAll('[data-avatar]').forEach(el=>{el.classList.toggle('active',el===avatar);el.setAttribute('aria-pressed',String(el===avatar))});return}
    const option=e.target.closest('[data-option]');if(option&&!option.disabled){selected=option.dataset.option;root.querySelectorAll('[data-option]').forEach(el=>el.classList.toggle('selected',el===option));const send=root.querySelector('[data-act="answer"]');if(send)send.disabled=false;return}
    const act=e.target.closest('[data-act]');if(act)action(act.dataset.act);
  });
  ticking=setInterval(()=>{const el=document.getElementById('solo-timer'),r=state?.room;if(!el||r?.phase!=='question')return;if(root.querySelector('.question-text')?.textContent==='استعدوا للسؤال…'&&Date.now()>=Date.parse(r.openedAt)){render();return}const seconds=Math.max(0,Math.ceil((Date.parse(r.deadline)-Date.now())/1000));el.textContent=seconds;el.classList.toggle('urgent',seconds<=10);if(seconds===0){root.querySelectorAll('[data-option],[data-act="answer"]').forEach(x=>x.disabled=true);refresh()}},250);
  polling=setInterval(refresh,1500);
  if(roomId)refresh();else render();
})();
