// V60 — make visual prompts explicit.
(function(){
  if(typeof QUESTIONS==='undefined')return;
  for(const q of QUESTIONS){
    if(q.category!=='logos')continue;
    const isLandmark=q.visualKind==='landmark'||q.subCategory==='معالم وأماكن'||String(q.contentScope||'').includes('landmark');
    const isBrand=q.visualKind==='brand'||String(q.contentScope||'').includes('brand');
    if(isLandmark)q.questionText='ما هو المعلم؟';
    else if(isBrand)q.questionText='ما هو الشعار؟';
  }
  console.info('Laffha V60 visual prompts ready');
})();