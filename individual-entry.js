// A separate phone game; the existing one-device and team modes keep their original setup.
(() => {
  function attach(){
    const row=document.querySelector('.play-mode-options');
    if(!row||row.querySelector('[data-individual-entry]'))return;
    const link=document.createElement('a');
    link.href='individual.html';
    link.className='play-mode-btn';
    link.dataset.individualEntry='1';
    link.style.cssText='display:flex;flex-direction:column;align-items:center;justify-content:center;text-decoration:none;text-align:center;color:inherit;gap:5px';
    link.innerHTML='👤 كل لاعب بجواله<small>غرفة واحدة، وكل شخص يلعب باسمه</small>';
    row.appendChild(link);
  }
  new MutationObserver(attach).observe(document.getElementById('app')||document.body,{subtree:true,childList:true});
  attach();
})();
