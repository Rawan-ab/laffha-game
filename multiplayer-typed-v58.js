// V59 — typed visual answers accept Arabic/English aliases without revealing the answer.
(function(){
  if(!window.LaffhaRealtime||typeof state==='undefined')return;
  const client=window.LaffhaRealtime.client;
  let channel=null,roomId=null;
  const handled=new Set();

  function norm(v){
    return String(v??'')
      .normalize('NFKD')
      .replace(/[\u064B-\u065F\u0670\u0640]/g,'')
      .replace(/[إأآٱ]/g,'ا')
      .replace(/ى/g,'ي')
      .replace(/ؤ/g,'و')
      .replace(/ئ/g,'ي')
      .replace(/ة/g,'ه')
      .replace(/[^\p{L}\p{N}]+/gu,' ')
      .replace(/\s+/g,' ')
      .trim()
      .toLowerCase();
  }

  // Groups are intentionally explicit so an Arabic name and its English name
  // are treated as the same answer without broad/unsafe translation guessing.
  const aliasGroups=[
    ['Africa','أفريقيا','افريقيا'],['Asia','آسيا','اسيا'],['Europe','أوروبا','اوروبا'],
    ['North America','أمريكا الشمالية','امريكا الشماليه'],['South America','أمريكا الجنوبية','امريكا الجنوبيه'],
    ['Australia','أستراليا','استراليا'],['Oceania','أوقيانوسيا','اوقيانوسيا'],['Antarctica','القارة القطبية الجنوبية','انتاركتيكا'],
    ['Apple','أبل','ابل'],['McDonald’s','McDonalds',"McDonald's",'ماكدونالدز','ماك دونالدز'],
    ['Starbucks','ستاربكس'],['Nike','نايك'],['Mercedes-Benz','Mercedes Benz','Mercedes','مرسيدس بنز','مرسيدس'],
    ['Toyota','تويوتا'],['Mastercard','Master Card','ماستركارد','ماستر كارد'],['Spotify','سبوتيفاي'],
    ['Domino’s',"Domino's",'Dominos','دومينوز','دومينوس'],['Puma','بوما'],['Audi','أودي','اودي'],
    ['Renault','رينو'],['Shell','شل'],['Target','تارغت','تارجت'],['Airbnb','Air BnB','إير بي إن بي','اير بي ان بي','ايربنب'],
    ['Dropbox','Drop Box','دروب بوكس','دروبوكس'],['Mazda','مازدا'],['Peugeot','بيجو'],['Carrefour','كارفور'],
    ['Red Bull','ريد بول'],['Firefox','فايرفوكس'],['Slack','سلاك'],['Android','أندرويد','اندرويد'],
    ['GitHub','Git Hub','جيت هب','جيتهاب','غيت هب'],
    ['برج إيفل','برج ايفل','Eiffel Tower','Eiffel','ايفل تاور'],['تاج محل','Taj Mahal'],
    ['برج خليفة','Burj Khalifa','Khalifa Tower'],['دار أوبرا سيدني','اوبرا سيدني','Sydney Opera House','Sydney Opera'],
    ['الكولوسيوم','كولوسيوم','Colosseum','Coliseum'],['البتراء - الخزنة','البتراء الخزنة','البتراء','الخزنة','Petra','Al Khazneh','The Treasury'],
    ['سور الصين العظيم','سور الصين','Great Wall of China','Great Wall'],
    ['تمثال المسيح الفادي','المسيح الفادي','Christ the Redeemer','Cristo Redentor'],
    ['ماتشو بيتشو','Machu Picchu'],['ساغرادا فاميليا','كنيسة ساغرادا فاميليا','Sagrada Familia','Sagrada Família'],
    ['مارينا باي ساندز','Marina Bay Sands'],['أنغكور وات','انغكور وات','Angkor Wat']
  ];

  function acceptedFor(q){
    const values=[q?.correctAnswer,...(q?.acceptedAnswers||[]),...(q?.aliases||[])].filter(Boolean);
    const correctNorm=norm(q?.correctAnswer);
    const group=aliasGroups.find(g=>g.some(v=>norm(v)===correctNorm));
    if(group)values.push(...group);
    return [...new Set(values.map(norm).filter(Boolean))];
  }

  function closeEnough(input,q){
    const typed=norm(input);
    if(!typed)return false;
    const accepted=acceptedFor(q);
    if(accepted.includes(typed))return true;
    const noArticle=typed.replace(/^ال\s*/,'');
    return accepted.some(a=>a.replace(/^ال\s*/,'')===noArticle);
  }

  function isVisual(){
    const q=state.currentQuestion;
    return !!q&&(q.questionType==='logo'||q.category==='logos');
  }

  function hideHostChoices(){
    if(state.playMode!=='multi'||state.screen!=='question'||!isVisual())return;
    document.querySelectorAll('.question-card .answers,[data-answer]').forEach(el=>el.style.display='none');
    const card=document.querySelector('.question-card');
    if(card&&!card.querySelector('.v58-phone-answer-note')){
      const note=document.createElement('div');
      note.className='v58-phone-answer-note';
      note.textContent='الإجابة تُكتب من جوال الفريق — عربي أو English';
      note.style.cssText='margin:16px 0;padding:12px 14px;border:1px dashed #d6c7e9;border-radius:14px;text-align:center;color:#766a80;background:#faf7fd;font-weight:700';
      const lifelines=card.querySelector('.lifelines');
      if(lifelines)card.insertBefore(note,lifelines);else card.appendChild(note);
    }
  }

  function attach(){
    const room=state.multiRoom;
    if(!room?.id||room.status!=='playing')return;
    if(roomId===room.id&&channel)return;
    if(channel)client.removeChannel(channel);
    roomId=room.id;
    channel=client.channel(`laffha-typed-v59-${room.id}`)
      .on('postgres_changes',{event:'INSERT',schema:'public',table:'room_actions',filter:`room_id=eq.${room.id}`},event=>{
        const a=event.new;
        const typedEvent=a?.action_type==='typed_answer'||(a?.action_type==='answer'&&a?.payload?.typed===true);
        if(!a||!typedEvent||handled.has(a.id))return;
        handled.add(a.id);
        if(state.screen!=='question'||Number(a.team_no)!==state.currentTeam+1||Number(a.revision)!==Number(state.multiRevision))return;
        const q=state.currentQuestion;
        if(!q||!isVisual())return;
        const typed=String(a.payload?.answer??'');
        finishQuestion(closeEnough(typed,q)?'correct':'wrong');
      })
      .subscribe();
  }

  const oldQuestion=window.question;
  if(typeof oldQuestion==='function'){
    window.question=function(){oldQuestion();setTimeout(hideHostChoices,0);};
  }

  setInterval(()=>{attach();hideHostChoices();},700);
  console.info('Laffha V59 bilingual typed visual answers ready');
})();