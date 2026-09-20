/* Laffha marketing & gameplay tracking
   Configure GA4 by setting window.LAFFHA_GA_ID = 'G-XXXXXXXXXX' before this file.
   The tracker also keeps campaign attribution (UTM/referrer) in localStorage. */
(function(){
  const KEY='laffha_attribution_v1';
  const SESSION='laffha_session_v1';
  const qs=new URLSearchParams(location.search);
  const campaignKeys=['utm_source','utm_medium','utm_campaign','utm_content','utm_term'];
  let saved={};
  try{ saved=JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(_){}
  const incoming={};
  campaignKeys.forEach(k=>{ if(qs.get(k)) incoming[k]=qs.get(k); });
  if(qs.get('ref')) incoming.ref=qs.get('ref');
  if(Object.keys(incoming).length){
    saved={...saved,...incoming,landing_page:location.pathname,first_seen:saved.first_seen||new Date().toISOString(),last_seen:new Date().toISOString()};
    localStorage.setItem(KEY,JSON.stringify(saved));
  }
  let sid=sessionStorage.getItem(SESSION);
  if(!sid){ sid=(crypto.randomUUID?crypto.randomUUID():Date.now()+'-'+Math.random().toString(36).slice(2)); sessionStorage.setItem(SESSION,sid); }

  window.dataLayer=window.dataLayer||[];
  window.gtag=window.gtag||function(){dataLayer.push(arguments)};
  const ga=window.LAFFHA_GA_ID;
  if(ga){
    const s=document.createElement('script'); s.async=true; s.src='https://www.googletagmanager.com/gtag/js?id='+encodeURIComponent(ga); document.head.appendChild(s);
    gtag('js',new Date()); gtag('config',ga,{send_page_view:true});
  }

  function clean(params){
    const out={};
    Object.entries(params||{}).forEach(([k,v])=>{ if(v!==undefined&&v!==null&&v!=='') out[k]=v; });
    return out;
  }
  window.laffhaTrack=function(name,params){
    const payload=clean({...saved,...params,session_id:sid});
    if(ga) gtag('event',name,payload);
    window.dispatchEvent(new CustomEvent('laffha:analytics',{detail:{name,params:payload}}));
    if(location.hostname==='localhost'||location.hostname==='127.0.0.1') console.info('[Laffha analytics]',name,payload);
  };

  laffhaTrack('landing_view',{page_location:location.href,referrer:document.referrer||undefined});

  // UI-level events that do not require changing game logic.
  document.addEventListener('click',function(e){
    const el=e.target.closest('button,a'); if(!el)return;
    if(el.id==='start') laffhaTrack('start_clicked');
    if(el.id==='begin') laffhaTrack('game_created',{team_count:window.state?.teamCount,rounds:window.state?.rounds});
    if(el.id==='spinBtn') laffhaTrack('spin_started',{round:window.state?.currentRound});
    if(el.matches('[data-diff]')) laffhaTrack('difficulty_selected',{difficulty:el.dataset.diff});
    if(el.matches('[data-life]')) laffhaTrack('lifeline_used',{lifeline:el.dataset.life});
    if(el.id==='again') laffhaTrack('second_game_started');
    if(el.id==='setupAgain') laffhaTrack('new_setup_started');
  },true);
})();