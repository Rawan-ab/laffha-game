// V73 — Temporarily hold the visual "خمن الصورة" category without deleting its code or question bank.
(function holdVisualCategory(){
  const HELD_CATEGORY='logos';

  function removeHeldCategory(){
    if(typeof state!=='undefined' && Array.isArray(state.categories)){
      state.categories=state.categories.filter(key=>key!==HELD_CATEGORY);
    }
  }

  removeHeldCategory();

  // Keep the category definition and QUESTIONS records intact for a future relaunch.
  // Re-apply after setup/reset flows in case another legacy script rebuilds state.categories.
  document.addEventListener('click',event=>{
    if(event.target.closest('#begin,#start,#again,#setupAgain,[data-teamcount]')){
      removeHeldCategory();
    }
  },true);

  window.laffhaHeldCategories=Object.freeze([HELD_CATEGORY]);
  console.info('Laffha V73: خمن الصورة is on hold; code and question bank preserved.');
})();
