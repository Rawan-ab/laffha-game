// The first screen chooses the phone game; the team setup stays available afterwards.
(() => {
  if (typeof state === 'undefined' || typeof render !== 'function' || typeof shell !== 'function') return;
  home = function () {
    shell(`<section class="laffha-mode-home" aria-labelledby="mode-title">
      <div class="mode-intro"><span class="mode-kicker">لفّها ✨</span>
        <h1 id="mode-title">كيف تبغون تلعبون؟</h1>
        <p>اختاروا طريقتكم وخلّوا التحدّي يبدأ!</p>
      </div>
      <div class="mode-cards">
        <button type="button" class="mode-card teams" id="chooseTeams">
          <span class="mode-symbol" aria-hidden="true">📱</span>
          <strong>العبوا كفرق</strong>
          <span>شاشة للعبة، والجوالات للتحكّم</span>
          <span class="mode-arrow">ابدأوا ←</span>
        </button>
        <a class="mode-card individuals" href="individual.html">
          <span class="mode-symbol" aria-hidden="true">⚡</span>
          <strong>كل لاعب لحاله</strong>
          <span>التحدّي على جوال الكل، والنقاط للأسرع</span>
          <span class="mode-arrow">ابدأوا ←</span>
        </a>
      </div>
    </section>`);
    document.getElementById('chooseTeams').onclick = () => {
      state.playMode = 'multi';
      state.teamCount = 2;
      if (state.teams.length !== 2 && typeof resetTeams === 'function') resetTeams();
      state.screen = 'setup';
      render();
    };
  };
  const previousRender = render;
  render = function () {
    previousRender();
    if (state.screen !== 'setup') return;
    const card = document.querySelector('.setup-reference');
    if (!card || card.querySelector('.mode-back')) return;
    const back = document.createElement('button');
    back.type = 'button';
    back.className = 'mode-back';
    back.textContent = '← طرق اللعب';
    back.onclick = () => { state.screen = 'home'; render(); };
    card.prepend(back);
  };
  function showLanding() { state.screen = 'home'; render(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showLanding, { once: true });
  else queueMicrotask(showLanding);
})();
