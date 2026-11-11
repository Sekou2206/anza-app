const CFG = window.ANZA_CONFIG || {};
const ONLINE = !!(CFG.supabaseUrl && CFG.supabaseAnonKey && window.supabase && window.supabase.createClient);
let sb = null, user = null, plan = ONLINE ? 'attente' : (CFG.defaultPlan || 'stand'), pushTimer = null, booted = false;
let syncState = 'ok';

let base = null, remoteAt = null, dirty = false, pushing = null;
const HIST_KEY = 'anza-hist-local', HIST_MAX = 30;

const clone = o => o == null ? o : JSON.parse(JSON.stringify(o));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const isObj = o => o && typeof o === 'object' && !Array.isArray(o);
const idList = a => Array.isArray(a) && a.every(x => isObj(x) && x.id != null);

function merge3(b, l, r, key) {
  if (same(l, r)) return l;
  if (same(l, b)) return r;
  if (same(r, b)) return l;
  if (key === 'quoteSeq' && typeof l === 'number' && typeof r === 'number') return Math.max(l, r);
  if (isObj(l) && isObj(r)) {
    const bo = isObj(b) ? b : {}, out = {};
    new Set([...Object.keys(l), ...Object.keys(r)]).forEach(k => { const v = merge3(bo[k], l[k], r[k], k); if (v !== undefined) out[k] = v; });
    return out;
  }
  if (Array.isArray(l) && Array.isArray(r)) {
    const bb = Array.isArray(b) ? b : [];
    if (idList(l) && idList(r) && idList(bb)) {
      const bm = new Map(bb.map(x => [x.id, x])), lm = new Map(l.map(x => [x.id, x])), rm = new Map(r.map(x => [x.id, x]));
      const out = [];
      [...l.map(x => x.id), ...r.filter(x => !lm.has(x.id)).map(x => x.id)].forEach(id => {
        const bi = bm.get(id), li = lm.get(id), ri = rm.get(id);
        if (li && ri) out.push(merge3(bi, li, ri));
        else if (li) { if (!bi || !same(li, bi)) out.push(li); }
        else if (ri) { if (!bi || !same(ri, bi)) out.push(ri); }
      });
      return out;
    }
    const k = x => JSON.stringify(x);
    const bk = new Set(bb.map(k)), lk = new Set(l.map(k)), rk = new Set(r.map(k));
    return [...l.filter(x => !(bk.has(k(x)) && !rk.has(k(x)))), ...r.filter(x => !bk.has(k(x)) && !lk.has(k(x)))];
  }
  return l;
}

function cacheKey() { return 'anza-cache-' + (user ? user.id : 'local'); }
function readCache() { try { const r = localStorage.getItem(cacheKey()); return r ? JSON.parse(r) : null; } catch (e) { return null; } }
function writeCache() { try { localStorage.setItem(cacheKey(), JSON.stringify(ONLINE ? { data: st, base, remoteAt, dirty, plan, at: Date.now() } : { data: st, at: Date.now() })); } catch (e) {} }

function localHist() { try { return JSON.parse(localStorage.getItem(HIST_KEY)) || []; } catch (e) { return []; } }
function localSnap(data, force) {
  if (!data) return;
  const list = localHist();
  if (!force && list[0] && Date.now() - list[0].at < 3600000) return;
  if (list[0] && same(list[0].data, data)) return;
  list.unshift({ at: Date.now(), data: clone(data) });
  list.length = Math.min(list.length, HIST_MAX);
  while (list.length) { try { localStorage.setItem(HIST_KEY, JSON.stringify(list)); return; } catch (e) { if (list.length <= 1) return; list.pop(); } }
}

function setSync(s) {
  syncState = s;
  const el = document.getElementById('sync'); if (!el) return;
  const t = { ok: 'Enregistré', saving: 'Enregistrement', offline: 'Hors ligne, enregistré sur cet appareil', error: 'Synchronisation en attente', local: 'Enregistré sur cet appareil' }[s] || '';
  el.textContent = t; el.className = 'sync ' + s;
}

function save() {
  if (!ONLINE) { const c = readCache(); if (c) localSnap(c.data, false); }
  dirty = ONLINE;
  writeCache();
  if (!ONLINE || !user) { setSync('local'); return; }
  setSync('saving');
  clearTimeout(pushTimer); pushTimer = setTimeout(push, 900);
}

function push() {
  clearTimeout(pushTimer); pushTimer = null;
  if (!pushing) pushing = doPush().finally(() => { pushing = null; });
  return pushing;
}

async function doPush() {
  if (!ONLINE || !user) return true;
  if (!dirty) { setSync('ok'); return true; }
  if (!navigator.onLine) { setSync('offline'); return false; }
  try {
    for (let i = 0; i < 3; i++) {
      const snap = clone(st);
      let q = sb.from('anza_state').update({ data: snap, updated_at: new Date().toISOString() }).eq('user_id', user.id);
      if (remoteAt) q = q.eq('updated_at', remoteAt);
      const { data, error } = await q.select('updated_at');
      if (error) throw error;
      if (data && data.length) {
        remoteAt = data[0].updated_at; base = snap;
        if (same(snap, st)) dirty = false;
        writeCache();
        if (dirty) { setSync('saving'); pushTimer = setTimeout(push, 900); return false; }
        setSync('ok'); return true;
      }
      const before = JSON.stringify(st);
      await pullMerge();
      if (JSON.stringify(st) !== before && booted) refresh();
    }
    throw new Error('conflict');
  } catch (e) {
    setSync(navigator.onLine ? 'error' : 'offline');
    pushTimer = setTimeout(push, 15000);
    return false;
  }
}

async function pullMerge() {
  const { data, error } = await sb.from('anza_state').select('data, plan, updated_at').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('missing');
  const remote = data.data && Object.keys(data.data).length ? migrate(clone(data.data)) : null;
  if (remote) {
    st = dirty ? migrate(base ? merge3(base, st, remote) : st) : clone(remote);
    if (same(st, remote)) dirty = false;
  }
  base = remote; remoteAt = data.updated_at;
  writeCache();
}

async function loadRemote() {
  const meta = user.user_metadata || {};
  const fresh = () => blankState(meta.first_name || '', user.email);
  const cache = readCache();
  try {
    const { data, error } = await sb.from('anza_state').select('data, plan, updated_at').eq('user_id', user.id).maybeSingle();
    if (error) throw error;
    if (data) {
      plan = data.plan || 'attente';
      const remote = data.data && Object.keys(data.data).length ? migrate(clone(data.data)) : null;
      remoteAt = data.updated_at; base = remote;
      if (cache && cache.dirty && cache.data) {
        st = migrate(clone(remote && cache.base ? merge3(cache.base, cache.data, remote) : cache.data));
        dirty = !same(st, remote);
      } else { st = remote ? clone(remote) : fresh(); dirty = !remote; }
    } else {
      st = fresh();
      const ins = await sb.from('anza_state').insert({ user_id: user.id, data: st }).select('updated_at');
      if (ins.error) throw ins.error;
      remoteAt = ins.data && ins.data[0] ? ins.data[0].updated_at : null; base = clone(st); dirty = false;
    }
    writeCache();
    if (dirty) push(); else setSync('ok');
  } catch (e) {
    st = cache && cache.data ? migrate(cache.data) : fresh();
    base = cache ? cache.base || null : null; remoteAt = cache ? cache.remoteAt || null : null; if (cache && cache.plan) plan = cache.plan; dirty = !!(cache && cache.dirty);
    setSync('offline');
  }
}

function loadLocal() {
  const c = readCache();
  st = c ? migrate(c.data) : blankState();
  setSync('local');
}

async function checkRemote(silent) {
  if (!ONLINE || !user || !st || pushing || !navigator.onLine) return;
  try {
    const { data } = await sb.from('anza_state').select('updated_at').eq('user_id', user.id).maybeSingle();
    if (!data) return;
    if (data.updated_at !== remoteAt) {
      const before = JSON.stringify(st);
      await pullMerge();
      if (JSON.stringify(st) !== before && booted) { refresh(); if (!silent) toast('Vos données ont été mises à jour depuis un autre appareil'); }
    }
    if (dirty) push();
    checkPlan(true);
  } catch (e) {}
}

async function listVersions() {
  if (ONLINE && user) {
    const { data, error } = await sb.rpc('my_versions');
    if (error) throw error;
    return (data || []).map(v => ({ id: v.id, at: v.created_at, contacts: v.contacts, devis: v.devis, rdv: v.rendez_vous }));
  }
  return localHist().map((h, i) => ({ id: i, at: h.at, contacts: (h.data.clients || []).length, devis: (h.data.quotes || []).length, rdv: (h.data.calendar || []).length }));
}

async function restoreVersion(id) {
  if (ONLINE && user) {
    if (dirty && !(await push())) throw new Error('offline');
    const { error } = await sb.rpc('restore_my_version', { version_id: id });
    if (error) throw error;
    dirty = false;
    await pullMerge();
    setSync('ok');
  } else {
    const h = localHist()[id]; if (!h) throw new Error('missing');
    localSnap(st, true);
    st = migrate(clone(h.data));
    writeCache(); setSync('local');
  }
}

const AUTH_ERR = {
  'Invalid login credentials': 'Email ou mot de passe incorrect.',
  'User already registered': 'Un compte existe déjà avec cet email. Connectez vous.',
  'Email not confirmed': 'Confirmez d’abord votre email : le lien vous a été envoyé.',
  'Password should be at least 6 characters.': 'Le mot de passe doit faire au moins 8 caractères.',
  'Email rate limit exceeded': 'Trop de tentatives. Réessayez dans quelques minutes.'
};
function authErr(e) { const m = (e && e.message) || ''; return AUTH_ERR[m] || (/network|fetch/i.test(m) ? 'Connexion impossible. Vérifiez votre réseau.' : 'Une erreur est survenue. Réessayez.'); }

function authView(mode, msg, err) {
  mode = mode || 'login';
  document.body.className = 'auth-on';
  const t = { login: 'Connexion', signup: 'Créer mon compte', forgot: 'Mot de passe oublié', reset: 'Nouveau mot de passe' }[mode];
  const pw = (id, ac) => `<div class="field"><label for="${id}">Mot de passe</label><input id="${id}" type="password" autocomplete="${ac}" minlength="8" required></div>`;
  $('#auth').innerHTML = `<div class="auth-card">
  <div class="auth-logo">${LOGO}<span>anza</span></div>
  ${mode === 'login' || mode === 'signup' ? `<div class="seg auth-tabs"><button class="${mode === 'login' ? 'on' : ''}" data-a="authMode" data-m="login">Connexion</button><button class="${mode === 'signup' ? 'on' : ''}" data-a="authMode" data-m="signup">Créer un compte</button></div>` : `<h1>${t}</h1>`}
  ${msg ? `<div class="auth-msg">${msg}</div>` : ''}${err ? `<div class="auth-err" role="alert">${err}</div>` : ''}
  <form class="form" data-form="${mode}" novalidate>
    ${mode === 'signup' ? '<div class="field"><label for="a-first">Prénom</label><input id="a-first" autocomplete="given-name" required></div>' : ''}
    ${mode !== 'reset' ? '<div class="field"><label for="a-email">Email</label><input id="a-email" type="email" autocomplete="email" required></div>' : ''}
    ${mode === 'login' ? pw('a-pw', 'current-password') : ''}${mode === 'signup' || mode === 'reset' ? pw('a-pw', 'new-password') + '<small class="mute">8 caractères minimum.</small>' : ''}
    ${mode === 'signup' ? `<label class="row auth-consent"><input type="checkbox" id="a-ok"><span>J’accepte les <a href="${CFG.termsUrl || CFG.legalUrl}" target="_blank" rel="noopener">conditions</a> et la <a href="${CFG.privacyUrl}" target="_blank" rel="noopener">politique de confidentialité</a>.</span></label>` : ''}
    <button class="btn pri" type="submit" style="height:46px">${{ login: 'Se connecter', signup: 'Créer mon compte', forgot: 'Recevoir le lien', reset: 'Enregistrer' }[mode]}</button>
  </form>
  ${mode === 'login' ? '<button class="btn ghost" data-a="authMode" data-m="forgot">Mot de passe oublié ?</button>' : ''}
  ${mode === 'forgot' ? '<button class="btn ghost" data-a="authMode" data-m="login">Retour à la connexion</button>' : ''}
  <p class="auth-foot">Un projet SAUTI et SC Project · <a href="mailto:${CFG.contactEmail}">${CFG.contactEmail}</a></p></div>`;
  const f = $('#auth input'); if (f) f.focus();
}
A.authMode = el => authView(el.dataset.m);

document.addEventListener('submit', async e => {
  const f = e.target.closest('[data-form]'); if (!f) return;
  e.preventDefault();
  const mode = f.dataset.form, btn = $('button[type=submit]', f);
  const email = (val('a-email') || '').trim(), pwv = val('a-pw'), first = (val('a-first') || '').trim();
  if (mode !== 'reset' && !/^\S+@\S+\.\S+$/.test(email)) return authView(mode, '', 'Entrez une adresse email valide.');
  if ((mode === 'signup' || mode === 'reset') && pwv.length < 8) return authView(mode, '', 'Le mot de passe doit faire au moins 8 caractères.');
  if (mode === 'signup' && !first) return authView(mode, '', 'Entrez votre prénom.');
  if (mode === 'signup' && !$('#a-ok').checked) return authView(mode, '', 'Merci d’accepter les conditions et la politique de confidentialité.');
  btn.disabled = true; btn.textContent = 'Un instant';
  try {
    const back = location.origin + location.pathname;
    if (mode === 'login') {
      const { data, error } = await sb.auth.signInWithPassword({ email, password: pwv });
      if (error) throw error;
      user = data.user; await enterApp();
    } else if (mode === 'signup') {
      const { data, error } = await sb.auth.signUp({ email, password: pwv, options: { data: { first_name: first }, emailRedirectTo: back } });
      if (error) throw error;
      if (data.session) { user = data.user; await enterApp(); }
      else authView('login', `Presque fini ! Un email de confirmation vient d’être envoyé à <b>${esc(email)}</b>. Cliquez sur le lien, puis connectez vous.`);
    } else if (mode === 'forgot') {
      const { error } = await sb.auth.resetPasswordForEmail(email, { redirectTo: back });
      if (error) throw error;
      authView('login', 'Si un compte existe avec cet email, vous allez recevoir un lien pour choisir un nouveau mot de passe.');
    } else if (mode === 'reset') {
      const { error } = await sb.auth.updateUser({ password: pwv });
      if (error) throw error;
      const { data } = await sb.auth.getUser(); user = data.user;
      history.replaceState(null, '', location.pathname + '#/accueil');
      await enterApp(); toast('Mot de passe mis à jour');
    }
  } catch (err) { authView(mode, '', authErr(err)); }
});

async function enterApp() {
  await loadRemote();
  startApp();
}

let pendingTimer = null;
function pendingView(msg) {
  document.body.className = 'auth-on';
  const first = (user && user.user_metadata && user.user_metadata.first_name) || '';
  $('#auth').innerHTML = `<div class="auth-card">
  <div class="auth-logo">${LOGO}<span>anza</span></div>
  <h1>${first ? 'Bienvenue ' + esc(first) + ' !' : 'Bienvenue !'}</h1>
  <p class="mute" style="font-size:15px;line-height:1.55">Votre compte est créé avec <b>${esc(user.email)}</b>. Il s’ouvre automatiquement sur la formule que vous avez choisie dès que votre commande est validée.</p>
  ${msg ? `<div class="auth-msg">${msg}</div>` : ''}
  <div class="btns" style="flex-direction:column;gap:10px">
    <a class="btn pri" href="${CFG.calendly}" target="_blank" rel="noopener" style="height:46px;justify-content:center">Choisir ma formule</a>
    <button class="btn sec" data-a="pendingCheck" style="height:46px">J’ai déjà commandé, vérifier</button>
    <button class="btn ghost" data-a="pendingOut">Se déconnecter</button>
  </div>
  <p class="auth-foot">Une question ? <a href="mailto:${CFG.contactEmail}">${CFG.contactEmail}</a></p></div>`;
  clearInterval(pendingTimer);
  pendingTimer = setInterval(() => { if (document.visibilityState === 'visible') checkPlan(true); }, 30000);
}

async function fetchPlan() {
  const { data, error } = await sb.from('anza_state').select('plan').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return data ? data.plan : null;
}

async function checkPlan(quiet) {
  if (!ONLINE || !user) return;
  try {
    const p = await fetchPlan();
    if (!p || p === plan) { if (!quiet && plan === 'attente') pendingView('Votre commande n’est pas encore validée. Dès qu’elle l’est, votre espace s’ouvre tout seul ici.'); return; }
    const before = plan; plan = p;
    if (plan === 'attente') { booted = false; pendingView(); return; }
    clearInterval(pendingTimer);
    if (before === 'attente' || !booted) { startApp(); toast('Votre formule ' + PLAN_NAME[plan] + ' est active. Bienvenue !'); }
    else { refresh(); toast('Votre formule est maintenant ' + PLAN_NAME[plan]); }
  } catch (e) { if (!quiet) toast('Vérification impossible. Vérifiez votre connexion.'); }
}
A.pendingCheck = () => checkPlan(false);
A.pendingOut = () => { clearInterval(pendingTimer); signOut(); };

function startApp() {
  if (ONLINE && plan === 'attente') { pendingView(); return; }
  clearInterval(pendingTimer);
  document.body.className = '';
  booted = true;
  if (!st.onboarded && !/^#\/bienvenue/.test(location.hash)) location.hash = '#/bienvenue';
  render();
  if ('serviceWorker' in navigator && /^https?:/.test(location.protocol)) navigator.serviceWorker.register('sw.js').catch(() => {});
}

async function signOut() {
  if (ONLINE && user && dirty && !(await push()) && dirty) {
    confirmBox('Vos dernières modifications ne sont pas encore enregistrées en ligne. Si vous vous déconnectez maintenant, elles seront perdues. Vérifiez votre connexion internet puis réessayez.', 'Réessayer', () => signOut());
    return;
  }
  try { localStorage.removeItem(cacheKey()); } catch (e) {}
  if (ONLINE) await sb.auth.signOut();
  clearInterval(pendingTimer); plan = 'attente';
  user = null; st = null; booted = false; base = null; remoteAt = null; dirty = false;
  if (ONLINE) authView('login', 'Vous êtes déconnecté.'); else location.reload();
}

async function deleteAccount() {
  try {
    if (ONLINE) { const { error } = await sb.rpc('delete_my_account'); if (error) throw error; }
    try { localStorage.removeItem(cacheKey()); } catch (e) {}
    if (ONLINE) { await sb.auth.signOut().catch(() => {}); user = null; st = null; authView('login', 'Votre compte et vos données ont été supprimés.'); }
    else location.reload();
  } catch (e) { toast('Suppression impossible pour le moment. Écrivez nous à ' + CFG.contactEmail); }
}

async function teamFetch() {
  if (!ONLINE || !user) return { msgs: st.localMessages.map(m => ({ from_team: m.from === 'team', body: m.text, created_at: m.date })), items: [] };
  const [m, t] = await Promise.all([
    sb.from('messages').select('from_team, body, created_at').eq('user_id', user.id).order('created_at', { ascending: true }),
    sb.from('team_items').select('day, title, status').eq('user_id', user.id).order('day', { ascending: true })
  ]);
  return { msgs: m.data || [], items: t.data || [] };
}
async function teamSend(text) {
  if (!ONLINE || !user) {
    st.localMessages.push({ from: 'me', date: iso(Date.now()), text }); save();
    location.href = `mailto:${CFG.contactEmail}?subject=${encodeURIComponent('Anza, message de ' + (st.profile.business || st.profile.first))}&body=${encodeURIComponent(text)}`;
    return true;
  }
  const { error } = await sb.from('messages').insert({ user_id: user.id, body: text });
  return !error;
}

async function boot() {
  if (!ONLINE) { loadLocal(); startApp(); return; }
  sb = window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseAnonKey, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
  let recovering = /type=recovery/.test(location.hash);
  sb.auth.onAuthStateChange((event, session) => {
    if (event === 'PASSWORD_RECOVERY') { recovering = true; authView('reset'); }
    if (event === 'SIGNED_OUT' && booted) { booted = false; authView('login'); }
  });
  const { data } = await sb.auth.getSession();
  if (recovering) { authView('reset'); return; }
  if (data && data.session) { user = data.session.user; await enterApp(); }
  else authView('login');
}

window.addEventListener('online', () => { if (ONLINE && user) { if (dirty) push(); else checkRemote(false); } });
window.addEventListener('pagehide', () => { if (dirty) push(); });
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') checkRemote(false); else if (dirty) push(); });
setInterval(() => { if (document.visibilityState === 'visible') checkRemote(false); }, 60000);
