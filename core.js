let st = null;
const AI_NAME = (window.ANZA_CONFIG && window.ANZA_CONFIG.aiName) || 'Claude';

const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m])); }
function eur(n) { n = Math.round((+n || 0) * 100) / 100; return n.toLocaleString('fr-FR', { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 }) + ' €'; }
function toDate(d) { if (typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d)) { const [y, m, j] = d.split('-').map(Number); return new Date(y, m - 1, j); } return new Date(d); }
function fdate(d) { const x = toDate(d); return isNaN(x) ? '' : `${x.getDate()} ${MONTHS[x.getMonth()]}`; }
function fdateL(d) { const x = toDate(d); return isNaN(x) ? '' : `${DAYS[x.getDay()]} ${x.getDate()} ${MONTHS[x.getMonth()]}`; }
function since(d) { return Math.floor((Date.now() - new Date(d).getTime()) / DAY); }
function initials(n) { return String(n || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase(); }
function phoneIntl(p) { const d = String(p || '').replace(/\D/g, ''); return d.startsWith('0') ? '33' + d.slice(1) : d; }
function wa(p, text) { return `https://wa.me/${phoneIntl(p)}?text=${encodeURIComponent(text || '')}`; }
function clientById(id) { return st.clients.find(c => c.id === id); }
function quoteTotal(q) { const t = q.lines.reduce((a, l) => a + l.qty * l.price, 0); return t * (1 - (+q.discount || 0) / 100); }
function plural(n, a, b) { return n + ' ' + (n > 1 ? b : a); }

const PLAN = { attente: 0, stand: 1, boutique: 2, magasin: 3 };
const PLAN_NAME = { stand: 'Le Stand', boutique: 'La Boutique', magasin: 'Le Magasin' };
function has(level) { return (plan in PLAN ? PLAN[plan] : 1) >= level; }

const ICON = {
  home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.8-3.6 3.3-5.5 6.5-5.5s5.7 1.9 6.5 5.5"/><path d="M16 4.6a3.5 3.5 0 010 6.8M21.5 20c-.5-2.6-1.9-4.3-3.8-5"/>',
  bell: '<path d="M6 16V11a6 6 0 1112 0v5l1.5 2h-15z"/><path d="M10 20.5a2 2 0 004 0"/>',
  file: '<path d="M6 3h8l4 4v14H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>',
  chat: '<path d="M4 5h16v11H9l-5 4z"/>',
  spark: '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18"/>',
  book: '<path d="M4 4h7a3 3 0 013 3v13a2 2 0 00-2-2H4z"/><path d="M20 4h-4a3 3 0 00-2 1"/>',
  story: '<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M10 6h4"/>',
  grid: '<rect x="3.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="3.5" width="7" height="7" rx="1.5"/><rect x="3.5" y="13.5" width="7" height="7" rx="1.5"/><rect x="13.5" y="13.5" width="7" height="7" rx="1.5"/>',
  cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
  chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  palette: '<path d="M12 3a9 9 0 100 18c1.2 0 1.5-1 1-2-.6-1.3.2-2.5 1.6-2.5H17a4 4 0 004-4C21 7 17 3 12 3z"/><circle cx="7.5" cy="11" r="1"/><circle cx="10" cy="7" r="1"/><circle cx="15" cy="7.5" r="1"/>',
  page: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 8.5h18M7 13h10M7 16.5h6"/>',
  brain: '<path d="M9 4a3 3 0 00-3 3 3 3 0 00-2 5 3 3 0 002 5 3 3 0 006 0V4a3 3 0 00-3 0zM15 4a3 3 0 013 3 3 3 0 012 5 3 3 0 01-2 5 3 3 0 01-6 0"/>',
  team: '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1-3.8 3.8-6 7-6s6 2.2 7 6"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.5v3M12 18.5v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2.5 12h3M18.5 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  wa: '<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
  dl: '<path d="M12 4v11M7 10l5 5 5-5M5 20h14"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 00-1-1H5a1 1 0 00-1 1v10a1 1 0 001 1h3"/>',
  print: '<path d="M7 9V3h10v6M7 17H4v-7h16v7h-3M7 14h10v7H7z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
  msg: '<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/><path d="M8.5 12h.01M12 12h.01M15.5 12h.01"/>',
  send: '<path d="M4 12l16-8-6 16-3-7z"/>'
};
const ic = n => `<svg viewBox="0 0 24 24">${ICON[n]}</svg>`;

const NAV = [
  ['Piloter', [['accueil', 'Accueil', 'home']]],
  ['Vendre', [['crm', 'Clients', 'users'], ['relances', 'Relances', 'bell', 'rel'], ['devis', 'Devis', 'file']]],
  ['Nia, brand manager', [['parler', 'Parler à Nia', 'msg', null, 3], ['nia', 'Entretien de départ', 'chat'], ['semaine', 'Question de la semaine', 'spark', 'week'], ['journal', 'Journal', 'book']]],
  ['Attirer', [['stories', 'Séquenceur de stories', 'story'], ['posts', 'Carrousels et posts', 'grid'], ['calendrier', 'Calendrier', 'cal'], ['bilan', 'Bilan du mois', 'chart'], ['charte', 'Charte et bio', 'palette'], ['landing', 'Landing page', 'page', null, 2]]],
  ['Magasin', [['ia', 'Mon IA personnelle', 'brain', null, 3], ['equipe', 'Accompagnement', 'team', null, 3]]],
  ['', [['reglages', 'Réglages', 'gear']]]
];

let route = { name: 'accueil', id: null, q: {} };
function parseHash() {
  const h = (location.hash || '#/accueil').slice(2);
  const [path, qs] = h.split('?');
  const [name, id] = path.split('/');
  const q = {}; (qs || '').split('&').filter(Boolean).forEach(kv => { const [k, v] = kv.split('='); q[k] = decodeURIComponent(v || ''); });
  route = { name: name || 'accueil', id: id || null, q };
}
function go(h) { location.hash = h; }

function weekKey() { const d = mondayOf(Date.now()); return iso(d); }
function weeklyDone() { return st.weekly.some(w => since(w.date) < 7 && iso(mondayOf(w.date)) === weekKey()); }

function layout() {
  const rel = computeFollow().length;
  const navHTML = NAV.map(([g, items]) => `<div class="navg">${g ? `<p>${g}</p>` : ''}${items.map(([k, label, icon, badge, lvl]) => {
    const locked = lvl && !has(lvl);
    const cnt = badge === 'rel' && rel ? `<span class="cnt">${rel}</span>` : badge === 'week' && !weeklyDone() ? '<span class="cnt">1</span>' : '';
    const on = route.name === k || (k === 'crm' && route.name === 'client');
    return `<a href="#/${k}" class="${on ? 'on' : ''}"><i>${ic(icon)}</i>${label}${locked ? `<span class="lock">${lvl === 2 ? 'BOUTIQUE' : 'MAGASIN'}</span>` : cnt}</a>`;
  }).join('')}</div>`).join('');
  $('#side').innerHTML = `<a class="logo" href="#/accueil">${LOGO}anza</a>${navHTML}
  <div class="side-bot"><div class="planbox"><p>Votre formule</p><b>${PLAN_NAME[plan] || 'Le Stand'}</b>${plan !== 'magasin' ? `<a href="${CFG.plansUrl}" target="_blank" rel="noopener">Voir les autres formules</a>` : '<small>Accompagnement mensuel actif</small>'}</div>
  <button class="side-out" data-a="logout">${ONLINE ? 'Se déconnecter' : 'Fermer la session'}</button></div>`;
  $('#planTag').textContent = PLAN_NAME[plan] || 'Le Stand';
  $('#me').innerHTML = `<span>${esc(st.profile.business || st.profile.first)}</span><div class="av">${initials(st.profile.name || st.profile.first || st.profile.business || 'A')}</div>`;
}

function render() {
  if (!st) return;
  parseHash();
  document.body.classList.toggle('onb', route.name === 'bienvenue');
  document.body.classList.remove('nav-open');
  const r = $('#results'); if (r) r.classList.remove('show'); const qi = $('#q'); if (qi) qi.value = '';
  layout();
  const v = VIEWS[route.name] || VIEWS.accueil;
  $('#view').innerHTML = v();
  if (AFTER[route.name]) AFTER[route.name]();
  window.scrollTo(0, 0);
}
function refresh() { const y = scrollY; layout(); const v = VIEWS[route.name] || VIEWS.accueil; $('#view').innerHTML = v(); if (AFTER[route.name]) AFTER[route.name](); window.scrollTo(0, y); }

function toast(m) { const t = $('#toast'); t.textContent = m; t.classList.add('show'); clearTimeout(t._t); t._t = setTimeout(() => t.classList.remove('show'), 2200); }
function modal(title, body, wide) {
  closeModal();
  const m = document.createElement('div'); m.className = 'modal'; m.id = 'modal';
  m.innerHTML = `<div class="box ${wide ? 'wide' : ''}" role="dialog" aria-modal="true"><h2><span>${title}</span><button class="x" data-a="close" aria-label="Fermer">×</button></h2>${body}</div>`;
  m.addEventListener('mousedown', e => { if (e.target === m) closeModal(); });
  document.body.appendChild(m);
  const f = $('input,select,textarea', m); if (f) f.focus();
}
function closeModal() { const m = $('#modal'); if (m) m.remove(); }
function confirmBox(text, label, fn) {
  window._confirm = fn;
  modal('Confirmer', `<p>${text}</p><div class="btns" style="margin-top:20px;justify-content:flex-end"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="confirm">${label}</button></div>`);
}
function copyText(t) {
  const done = () => toast('Copié');
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(done, () => fallbackCopy(t));
  else fallbackCopy(t);
  function fallbackCopy(x) { const a = document.createElement('textarea'); a.value = x; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); done(); } catch (e) {} a.remove(); }
}
function download(name, data, type) {
  const a = document.createElement('a');
  a.href = data.startsWith('data:') ? data : URL.createObjectURL(new Blob([data], { type: type || 'text/plain' }));
  a.download = name; document.body.appendChild(a); a.click(); a.remove();
}
function val(id) { const e = document.getElementById(id); return e ? e.value : ''; }

function computeFollow() {
  const out = [];
  const rules = Object.fromEntries(st.rules.map(r => [r.id, r]));
  st.clients.forEach(c => {
    const lastHist = c.history.length ? c.history.reduce((a, h) => h.date > a ? h.date : a, c.history[0].date) : c.lastContact;
    const cand = [];
    if (rules.prospect.on && c.status === 'prospect' && since(c.lastContact) >= rules.prospect.days) cand.push(['prospect', since(c.lastContact)]);
    if (rules.devis.on && c.status === 'devis' && since(c.lastContact) >= rules.devis.days) cand.push(['devis', since(c.lastContact)]);
    if (rules.revoir.on && (c.status === 'client' || c.status === 'fidele') && !c.next && c.history.some(h => h.amount > 0) && since(lastHist) >= rules.revoir.days) cand.push(['revoir', since(lastHist)]);
    if (rules.avis.on && c.satisfied && !c.review && since(c.lastContact) >= rules.avis.days) cand.push(['avis', since(c.lastContact)]);
    cand.forEach(([r, d]) => {
      if (st.done.some(x => x.cid === c.id && x.rule === r && x.date >= c.lastContact)) return;
      out.push({ c, rule: r, days: d, label: rules[r].label });
    });
  });
  return out.sort((a, b) => b.days - a.days);
}

function monthRevenue(offset) {
  const now = new Date(); const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const m = d.getMonth(), y = d.getFullYear();
  let v = 0;
  st.clients.forEach(c => c.history.forEach(h => { const x = new Date(h.date); if (x.getMonth() === m && x.getFullYear() === y) v += +h.amount || 0; }));
  return { m, y, v };
}

const VIEWS = {}, AFTER = {}, A = {}, I = {}, C = {};

A.close = () => closeModal();
A.confirm = () => { const f = window._confirm; closeModal(); if (f) f(); };
A.burger = () => document.body.classList.toggle('nav-open');
A.overlay = () => document.body.classList.remove('nav-open');
A.go = el => go(el.dataset.h);
I.set = el => {
  const path = el.dataset.path.split('.'); let o = st;
  for (let i = 0; i < path.length - 1; i++) o = o[path[i]];
  const k = path[path.length - 1];
  o[k] = el.type === 'checkbox' ? el.checked : el.dataset.num != null ? +el.value : el.value;
  save();
  if (el.dataset.live) refresh();
};
C.set = I.set;

function lockView(level, title, text) {
  return `<div class="lockview"><div class="card"><div class="av lg" style="margin:0 auto;background:var(--soft);color:var(--navy)">${ic(level === 2 ? 'page' : 'brain').replace('<svg', '<svg style="width:26px;height:26px;stroke:currentColor;fill:none;stroke-width:1.8"')}</div>
  <h2>${title}</h2><p>${text}</p><div class="btns"><a class="btn pri" href="${CFG.calendly}" target="_blank" rel="noopener">Passer ${level === 2 ? 'à la Boutique' : 'au Magasin'}</a><a class="btn sec" href="${CFG.plansUrl}" target="_blank" rel="noopener">Comparer les formules</a></div></div></div>`;
}
A.logout = () => confirmBox('Se déconnecter de cet appareil ?', 'Se déconnecter', () => signOut());

document.addEventListener('click', e => {
  const el = e.target.closest('[data-a]');
  if (!el) { if (!e.target.closest('.search')) $('#results') && $('#results').classList.remove('show'); return; }
  const f = A[el.dataset.a];
  if (f) { if (el.tagName === 'A' && !el.dataset.keep) e.preventDefault(); f(el, e); }
});
document.addEventListener('input', e => { const el = e.target.closest('[data-i]'); if (el && I[el.dataset.i]) I[el.dataset.i](el, e); });
document.addEventListener('change', e => { const el = e.target.closest('[data-c]'); if (el && C[el.dataset.c]) C[el.dataset.c](el, e); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') { closeModal(); document.body.classList.remove('nav-open'); }
  if (e.key === 'Enter' && !e.shiftKey && e.target.dataset.enter) { e.preventDefault(); const f = A[e.target.dataset.enter]; if (f) f(e.target, e); }
});

I.search = el => {
  const q = el.value.trim().toLowerCase(), r = $('#results');
  if (!q) { r.classList.remove('show'); return; }
  const cl = st.clients.filter(c => c.name.toLowerCase().includes(q) || (c.notes || '').toLowerCase().includes(q)).slice(0, 6);
  const qs = st.quotes.filter(x => x.num.toLowerCase().includes(q) || (clientById(x.clientId) || {}).name?.toLowerCase().includes(q)).slice(0, 3);
  r.innerHTML = cl.map(c => `<a href="#/client/${c.id}"><span>${esc(c.name)}</span><span class="tag ${c.status}">${STATUS[c.status]}</span></a>`).join('') +
    qs.map(x => `<a href="#/devis/${x.id}"><span>Devis ${esc(x.num)}</span><span class="mute">${eur(quoteTotal(x))}</span></a>`).join('') || '<div class="empty">Aucun résultat</div>';
  r.classList.add('show');
};

const STATUS = { prospect: 'Prospect', devis: 'Devis envoyé', client: 'Client', fidele: 'Fidèle' };
const QSTATUS = { brouillon: 'Brouillon', envoye: 'Envoyé', accepte: 'Accepté', refuse: 'Refusé' };
