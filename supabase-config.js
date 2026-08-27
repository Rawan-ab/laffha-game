// Laffha multiplayer — public browser Supabase configuration.
// Publishable keys are safe in the browser; database access is protected by RLS.
(function () {
  const SUPABASE_URL = 'https://ntklwkzrozyfgzwwkvfr.supabase.co';
  const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_FBTPjHlnOBumsqw340LF3Q_KGhmYCDp';

  if (!window.supabase || !window.supabase.createClient) {
    throw new Error('Supabase browser library did not load.');
  }

  const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });

  async function ensureSession() {
    const { data: current, error: sessionError } = await client.auth.getSession();
    if (sessionError) throw sessionError;
    if (current?.session?.user) return current.session.user;
    const { data, error } = await client.auth.signInAnonymously();
    if (error) throw error;
    if (!data?.user) throw new Error('تعذر إنشاء جلسة مؤقتة.');
    return data.user;
  }

  function readableError(error) {
    const message = String(error?.message || error || 'خطأ غير معروف');
    const lower = message.toLowerCase();
    if (lower.includes('anonymous') && (lower.includes('disabled') || lower.includes('not enabled'))) {
      return 'لازم تفعيل Anonymous Sign-Ins في Supabase.';
    }
    if (lower.includes('failed to fetch') || lower.includes('network')) {
      return 'تعذر الاتصال بالسيرفر. تأكدوا من الإنترنت وحاولوا مرة ثانية.';
    }
    return message;
  }

  window.LaffhaRealtime = { client, ensureSession, readableError, projectUrl: SUPABASE_URL };

  // The controller is a standalone page, so load its small V60 visual-prompt helper here.
  if (/controller\.html$/i.test(location.pathname) && !document.querySelector('script[data-laffha-controller-v60]')) {
    const s=document.createElement('script');
    s.src='controller-prompt-v60.js?v=60';
    s.dataset.laffhaControllerV60='1';
    s.defer=true;
    document.head.appendChild(s);
  }
})();