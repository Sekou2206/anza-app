const ROLE_NAME = { owner: 'Responsable', admin: 'Administrateur', membre: 'Membre', lecture: 'Lecture seule' };
const ROLE_HELP = { admin: 'Tout, sauf gérer l’équipe et supprimer le compte.', membre: 'Clients, devis, relances, contenus et notes. Ne publie pas la page et ne change pas la formule.', lecture: 'Voit tout, ne modifie rien.' };
const NOTE_CAT = { idee: 'Idée', memo: 'Mémo', client: 'Client', contenu: 'Contenu', afaire: 'À faire' };
const TEAM_ERR = { 'seat limit': 'Toutes les places de votre formule sont utilisées.', 'own email': 'C’est votre propre adresse : vous êtes déjà le responsable.', 'bad email': 'Cette adresse email n’est pas valide.' };
let teamRows = null, noteQuery = '';
(() => { const t = toast; toast = m => { if (ONLINE && user && !canWrite() && Date.now() - roNotice < 1500 && !/lecture seule/.test(m)) return; t(m); }; })();

function seatsMax() { return plan === 'magasin' ? Infinity : plan === 'boutique' ? 3 : 1; }
function seatsLabel(used) { return plan === 'magasin' ? `${plural(used, 'personne', 'personnes')}, places illimitées` : plan === 'boutique' ? `${used} sur 3 places` : '1 place'; }
function meName() {
  if (MY_NAME) return MY_NAME;
  if (!ONLINE || !user || ROLE === 'owner') return (st && (st.profile.first || st.profile.name)) || 'Vous';
  return String(user.email || '').split('@')[0];
}
function teamMode() { return ONLINE && user && (ROLE !== 'owner' || SEATS_USED > 1); }
function ago(t) {
  const d = (Date.now() - new Date(t).getTime()) / 60000;
  if (isNaN(d)) return '';
  if (d < 1) return 'à l’instant';
  if (d < 60) return `il y a ${Math.round(d)} min`;
  if (d < 1440) return `il y a ${Math.round(d / 60)} h`;
  if (d < 2880) return 'hier';
  return 'le ' + fdate(t);
}
function logAct(text, h) {
  if (!st || (ONLINE && user && !canWrite())) return;
  st.activity = Array.isArray(st.activity) ? st.activity : [];
  st.activity.unshift({ id: uid(), at: new Date().toISOString(), by: meName(), text: String(text).slice(0, 160), h: h || '' });
  st.activity = st.activity.slice(0, 150);
}

(() => {
  const saveClient = A.saveClient;
  A.saveClient = el => {
    const isNew = !clientById(el.dataset.id), n = st.clients.length;
    saveClient(el);
    if (isNew && st.clients.length > n) { const c = st.clients[st.clients.length - 1]; c.addedBy = meName(); logAct('a ajouté le contact ' + c.name, '#/client/' + c.id); save(); }
  };
  const saveVisit = A.saveVisit;
  A.saveVisit = el => {
    const c = clientById(el.dataset.id), n = c ? c.history.length : 0;
    saveVisit(el);
    if (c && c.history.length > n) { c.history[c.history.length - 1].by = meName(); logAct('a ajouté une prestation pour ' + c.name, '#/client/' + c.id); save(); }
  };
  const saveQuote = A.saveQuote;
  A.saveQuote = (el, quiet) => {
    const isNew = draft && draft.id === 'new', old = draft && st.quotes.find(q => q.id === draft.id), prev = old ? old.status : '';
    saveQuote(el, quiet);
    const q = draft && st.quotes.find(x => x.id === draft.id); if (!q) return;
    if (isNew) { q.by = meName(); logAct('a créé le devis ' + q.num, '#/devis/' + q.id); save(); }
    else if (prev && prev !== q.status) { logAct(`a passé le devis ${q.num} en ${QSTATUS[q.status]}`, '#/devis/' + q.id); save(); }
  };
  const ff = finishFollow;
  finishFollow = (id, rule) => {
    ff(id, rule);
    const c = clientById(id);
    if (c && rule !== 'rappel') { logAct('a relancé ' + c.name, '#/client/' + c.id); save(); }
  };
  A.delClient = el => confirmBox('Supprimer ce contact et son historique ?', 'Supprimer', () => {
    const c = clientById(el.dataset.id);
    st.clients = st.clients.filter(x => x.id !== el.dataset.id);
    st.notes = st.notes.map(n => n.clientId === el.dataset.id ? Object.assign({}, n, { clientId: '' }) : n);
    if (c) logAct('a supprimé le contact ' + c.name, '#/crm');
    save(); toast('Contact supprimé'); go('#/crm');
  });
  const pagePub = A.pagePub;
  A.pagePub = el => { if (ONLINE && user && !isAdmin()) { toast('Seul le responsable ou un administrateur peut publier la page'); return; } return pagePub(el); };
  const pageOff = A.pageOff;
  A.pageOff = el => { if (ONLINE && user && !isAdmin()) { toast('Seul le responsable ou un administrateur peut retirer la page'); return; } return pageOff(el); };
  const hc = histCard;
  histCard = () => (!ONLINE || !user || ROLE === 'owner') ? hc() : '';
  const lay = layout;
  layout = () => {
    lay();
    if (!ONLINE || !user) return;
    const pb = $('.planbox'); if (!pb) return;
    const max = seatsMax();
    pb.insertAdjacentHTML('beforeend', ROLE !== 'owner' ? `<small>Espace d’équipe · ${ROLE_NAME[ROLE]}</small>` : `<small>${max === Infinity ? 'Utilisateurs illimités' : max === 1 ? '1 utilisateur' : SEATS_USED + ' sur ' + max + ' utilisateurs'}</small>`);
  };
  const search = I.search;
  I.search = el => {
    search(el);
    const q = el.value.trim().toLowerCase(), r = $('#results'); if (!q || !r) return;
    const ns = st.notes.filter(n => (n.title + ' ' + n.body).toLowerCase().includes(q)).slice(0, 3);
    if (!ns.length) return;
    const empty = $('.empty', r); if (empty) empty.remove();
    r.insertAdjacentHTML('beforeend', ns.map(n => `<a href="#/notes?open=${n.id}"><span>${esc(n.title || noteFirstLine(n))}</span><span class="mute">Note</span></a>`).join(''));
    r.classList.add('show');
  };
})();

function noteFirstLine(n) { return (String(n.body || '').split('\n').find(l => l.trim()) || 'Note sans titre').replace(/^\[( |x)\]\s?/i, '').slice(0, 60); }
function noteBody(n, limit) {
  const lines = String(n.body || '').split('\n'), out = [];
  let shown = 0;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (limit && shown >= limit) { out.push('<p class="nc-more">…</p>'); break; }
    const m = l.match(/^\[( |x)\]\s?(.*)$/i);
    if (m) { out.push(`<label class="nc-ck ${m[1].toLowerCase() === 'x' ? 'done' : ''}"><input type="checkbox" ${m[1].toLowerCase() === 'x' ? 'checked' : ''} data-c="noteCk" data-id="${n.id}" data-n="${i}"><span>${esc(m[2])}</span></label>`); shown++; }
    else if (l.trim()) { out.push(`<p>${esc(l)}</p>`); shown++; }
  }
  return out.join('');
}
function noteCard(n) {
  const c = n.clientId ? clientById(n.clientId) : null;
  return `<article class="note-card ncat-${n.cat}" data-a="noteOpen" data-id="${n.id}" tabindex="0">
    <div class="nc-top"><span class="nc-cat">${NOTE_CAT[n.cat]}</span>${n.pin ? `<span class="nc-pin" title="Épinglée">${ic('pin')}</span>` : ''}</div>
    ${n.title ? `<h4>${esc(n.title)}</h4>` : ''}
    <div class="nc-body">${noteBody(n, 7) || '<p class="mute">Note vide</p>'}</div>
    <div class="nc-foot"><small>${esc(n.updBy || n.by || '')}${n.updBy || n.by ? ' · ' : ''}${ago(n.upd || n.at)}</small>${c ? `<a class="nc-client" href="#/client/${c.id}">${esc(c.name)}</a>` : ''}</div>
  </article>`;
}
function notesList() {
  const cat = route.q.cat || '', q = noteQuery.trim().toLowerCase();
  return st.notes.filter(n => (!cat || n.cat === cat) && (!q || (n.title + ' ' + n.body + ' ' + ((clientById(n.clientId) || {}).name || '')).toLowerCase().includes(q)))
    .sort((a, b) => (b.pin - a.pin) || String(b.upd || b.at).localeCompare(String(a.upd || a.at)));
}
function notesGrid() {
  const list = notesList();
  if (!st.notes.length) return `<div class="card empty-notes"><h3>Votre bloc notes est vide</h3><p class="mute" style="margin-top:8px">Notez une idée de story, un détail sur une cliente, une liste à faire, un mémo de rendez vous. Tout est enregistré et ${teamMode() ? 'partagé avec votre équipe' : 'retrouvable par la recherche'}.</p><button class="btn pri" style="margin-top:14px" data-a="noteNew">${ic('plus')}Écrire ma première note</button></div>`;
  return list.length ? `<div class="notes-grid">${list.map(noteCard).join('')}</div>` : '<div class="empty">Aucune note ne correspond.</div>';
}
VIEWS.notes = () => {
  const cat = route.q.cat || '', counts = Object.fromEntries(Object.keys(NOTE_CAT).map(k => [k, st.notes.filter(n => n.cat === k).length]));
  return `<div class="head"><div><p class="kick">Piloter</p><h1>Bloc notes</h1><p>Idées, mémos, détails clients et listes à cocher, au même endroit.${teamMode() ? ' Chaque note est signée et visible par votre équipe.' : ''}</p></div>
  <div class="btns"><button class="btn pri" data-a="noteNew">${ic('plus')}Nouvelle note</button></div></div>
  <div class="notes-bar"><div class="notes-search">${ic('search')}<input type="search" placeholder="Rechercher dans les notes" value="${esc(noteQuery)}" data-i="noteSearch" aria-label="Rechercher dans les notes"></div>
  <div class="chips"><a class="chip ${cat ? '' : 'on'}" href="#/notes">Toutes ${st.notes.length}</a>${Object.entries(NOTE_CAT).map(([k, v]) => `<a class="chip ${cat === k ? 'on' : ''}" href="#/notes?cat=${k}">${v} ${counts[k]}</a>`).join('')}</div></div>
  <div id="notesGrid">${notesGrid()}</div>`;
};
AFTER.notes = () => { if (route.q.open && st.notes.some(n => n.id === route.q.open)) noteEditor(route.q.open); };
I.noteSearch = el => { noteQuery = el.value; const g = $('#notesGrid'); if (g) g.innerHTML = notesGrid(); };

function noteEditor(id, preset) {
  const n = st.notes.find(x => x.id === id) || Object.assign({ id: '', title: '', body: '', cat: 'memo', pin: false, clientId: '' }, preset || {});
  const clients = st.clients.slice().sort((a, b) => a.name.localeCompare(b.name));
  modal(n.id ? 'Modifier la note' : 'Nouvelle note', `<div class="form">
    <div class="field"><label for="n-t">Titre</label><input id="n-t" maxlength="120" value="${esc(n.title)}" placeholder="Ex. Idées de stories pour décembre"></div>
    <div class="grid g2"><div class="field"><label for="n-c">Catégorie</label><select id="n-c">${Object.entries(NOTE_CAT).map(([k, v]) => `<option value="${k}" ${n.cat === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
    <div class="field"><label for="n-l">Liée à un client</label><select id="n-l"><option value="">Aucun</option>${clients.map(c => `<option value="${c.id}" ${n.clientId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div></div>
    <div class="field"><label for="n-b">Note</label><textarea id="n-b" rows="10" maxlength="12000" placeholder="Écrivez librement.">${esc(n.body)}</textarea><small class="mute">Astuce : commencez une ligne par [ ] pour en faire une case à cocher.</small></div>
    <label class="row" style="flex-wrap:nowrap"><input type="checkbox" id="n-p" ${n.pin ? 'checked' : ''}> Épingler en haut et sur l’accueil</label>
    ${n.id ? `<p class="mute" style="font-size:12px">Créée par ${esc(n.by || 'vous')} ${ago(n.at)}${n.updBy && n.upd !== n.at ? `, modifiée par ${esc(n.updBy)} ${ago(n.upd)}` : ''}.</p>` : ''}
    <div class="btns" style="justify-content:space-between">${n.id ? `<button class="btn danger sm" data-a="noteDel" data-id="${n.id}">Supprimer</button>` : '<span></span>'}<div class="btns"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="noteSave" data-id="${n.id}">Enregistrer</button></div></div></div>`, true);
}
A.noteNew = el => noteEditor('', el && el.dataset.client ? { clientId: el.dataset.client, cat: 'client' } : (route.q.cat ? { cat: route.q.cat } : null));
A.noteOpen = (el, e) => { if (e && e.target.closest('input,label,a')) return; noteEditor(el.dataset.id); };
A.noteSave = el => {
  const title = val('n-t').trim(), body = val('n-b').replace(/\s+$/, '');
  if (!title && !body.trim()) { toast('Écrivez un titre ou un texte'); return; }
  const now = new Date().toISOString(), me = meName();
  let n = st.notes.find(x => x.id === el.dataset.id);
  if (!n) { n = { id: uid(), by: me, at: now }; st.notes.unshift(n); logAct('a ajouté la note « ' + (title || noteFirstLine({ body })) + ' »', '#/notes?open=' + n.id); }
  Object.assign(n, { title: title.slice(0, 120), body: body.slice(0, 12000), cat: NOTE_CAT[val('n-c')] ? val('n-c') : 'memo', clientId: cleanId(val('n-l')), pin: $('#n-p').checked, upd: now, updBy: me });
  save(); closeModal(); toast('Note enregistrée');
  if (route.q.open) go('#/notes'); else refresh();
};
A.noteDel = el => confirmBox('Supprimer cette note ?', 'Supprimer', () => { st.notes = st.notes.filter(n => n.id !== el.dataset.id); save(); toast('Note supprimée'); if (route.q.open) go('#/notes'); else refresh(); });
C.noteCk = el => {
  const n = st.notes.find(x => x.id === el.dataset.id); if (!n) return;
  const lines = String(n.body).split('\n'), i = +el.dataset.n;
  if (lines[i] != null) lines[i] = lines[i].replace(/^\[( |x)\]/i, el.checked ? '[x]' : '[ ]');
  n.body = lines.join('\n'); n.upd = new Date().toISOString(); n.updBy = meName();
  save(); const g = $('#notesGrid'); if (g) g.innerHTML = notesGrid(); else refresh();
};

(() => {
  const clientView = VIEWS.client;
  VIEWS.client = () => {
    const h = clientView(), c = clientById(route.id);
    if (!c) return h;
    const ns = st.notes.filter(n => n.clientId === c.id).sort((a, b) => String(b.upd || b.at).localeCompare(String(a.upd || a.at)));
    const card = `<div class="card"><h3>Bloc notes <button class="btn ghost sm" data-a="noteNew" data-client="${c.id}">${ic('plus')}Note</button></h3><ul class="list" style="margin-top:8px">${ns.slice(0, 5).map(n => `<li><div class="grow"><a href="#/notes?open=${n.id}" style="text-decoration:none"><b>${esc(n.title || noteFirstLine(n))}</b></a><small>${esc(n.updBy || n.by || '')} · ${ago(n.upd || n.at)}</small></div></li>`).join('') || '<li class="mute">Aucune note pour ce client.</li>'}</ul></div>`;
    const k = h.indexOf('<div class="card"><h3>Satisfaction</h3>');
    return k < 0 ? h : h.slice(0, k) + card + h.slice(k);
  };
  const home = VIEWS.accueil;
  VIEWS.accueil = () => {
    const h = home(), extra = [];
    const pinned = st.notes.filter(n => n.pin).slice(0, 3);
    if (pinned.length) extra.push(`<div class="card" style="margin-top:16px"><h3>Notes épinglées <a class="btn ghost sm" href="#/notes">Bloc notes</a></h3><div class="notes-grid mini" style="margin-top:10px">${pinned.map(noteCard).join('')}</div></div>`);
    const tip = teamInvite();
    if (tip) extra.push(tip);
    const acts = (st.activity || []).slice(0, 6);
    if (teamMode() && acts.length) extra.push(`<div class="card" style="margin-top:16px"><h3>Activité de l’équipe</h3><ul class="list" style="margin-top:8px">${acts.map(a => `<li><div class="av">${initials(a.by)}</div><div class="grow"><b>${esc(a.by)}</b> <span>${esc(a.text)}</span><small style="display:block">${ago(a.at)}</small></div>${a.h ? `<a class="btn ghost sm" href="${esc(a.h)}">Voir</a>` : ''}</li>`).join('')}</ul></div>`);
    if (!extra.length) return h;
    const k = h.indexOf('<div class="card" style="margin-top:16px"><h3>Idées du jour');
    return k < 0 ? h + extra.join('') : h.slice(0, k) + extra.join('') + h.slice(k);
  };
  const reg = VIEWS.reglages;
  VIEWS.reglages = () => {
    if (ONLINE && user && (ROLE === 'membre' || ROLE === 'lecture')) return memberSettings();
    const h = reg(), k = h.indexOf('<div class="grid g2">');
    return k < 0 ? h + teamCard() : h.slice(0, k) + teamCard() + h.slice(k);
  };
  const after = AFTER.reglages;
  AFTER.reglages = () => { if (after) after(); teamLoad(); };
})();

function rolesHelp() { return `<div class="roles-help">${['admin', 'membre', 'lecture'].map(r => `<p><b>${ROLE_NAME[r]}</b> : ${ROLE_HELP[r]}</p>`).join('')}</div>`; }
function teamCard() {
  if (!ONLINE || !user) return `<div class="card" style="margin-bottom:16px"><h3>Votre équipe</h3><p class="mute" style="margin-top:8px;font-size:14px">Le travail à plusieurs est disponible avec un compte Anza en ligne : jusqu’à 3 personnes avec la Boutique, sans limite avec le Magasin.</p></div>`;
  if (plan === 'stand') return `<div class="card" style="margin-bottom:16px"><h3>Votre équipe <small>1 utilisateur</small></h3><p class="mute" style="margin-top:8px;font-size:14px">Le Stand est pensé pour une personne. Avec la Boutique, vous travaillez à 3 dans le même espace : vous et 2 membres, chacun avec son accès et ses droits. Avec le Magasin, toute votre équipe, sans limite.</p><div class="btns" style="margin-top:12px"><a class="btn sec sm" href="${CFG.plansUrl}" target="_blank" rel="noopener">Comparer les formules</a></div></div>`;
  const owner = ROLE === 'owner';
  return `<div class="card team-card" style="margin-bottom:16px"><h3>Votre équipe <small id="teamSeats">${seatsLabel(SEATS_USED)}</small></h3>
  <p class="mute" style="margin-top:8px;font-size:14px">Chaque membre se connecte avec sa propre adresse email et son mot de passe, et travaille dans cet espace : mêmes clients, mêmes devis, mêmes contenus, mêmes notes. Ses actions sont signées de son prénom.</p>
  <div id="teamList" style="margin-top:12px"><p class="mute">Chargement de l’équipe</p></div>
  ${owner ? `<div class="team-add"><b style="font-size:14px">Ajouter une personne</b><div class="grid g3" style="margin-top:8px"><div class="field"><label for="tm-n">Prénom</label><input id="tm-n" maxlength="60" autocomplete="off"></div><div class="field"><label for="tm-e">Email</label><input id="tm-e" type="email" autocomplete="off"></div><div class="field"><label for="tm-r">Accès</label><select id="tm-r"><option value="membre">Membre</option><option value="admin">Administrateur</option><option value="lecture">Lecture seule</option></select></div></div><div class="btns" style="margin-top:8px"><button class="btn pri sm" data-a="teamAdd">${ic('plus')}Ajouter</button></div></div>` : ''}
  ${rolesHelp()}</div>`;
}
async function teamLoad() {
  const box = $('#teamList'); if (!box || !ONLINE || !user) return;
  try {
    const { data, error } = await sb.from('team_members').select('id, email, name, role, user_id, created_at').eq('owner_id', wsId()).order('created_at', { ascending: true });
    if (error) throw error;
    teamRows = data || [];
    SEATS_USED = teamRows.length + 1;
    const seats = $('#teamSeats'); if (seats) seats.textContent = seatsLabel(SEATS_USED);
    const max = seatsMax(), owner = ROLE === 'owner';
    const head = `<li><div class="av">${initials(owner ? meName() : (st.profile.first || st.profile.business || 'R'))}</div><div class="grow"><b>${esc(owner ? meName() + ' (vous)' : (st.profile.first || st.profile.business || 'Responsable'))}</b><small>${owner ? esc(user.email) : 'Responsable du compte'}</small></div><span class="tag client">Responsable</span></li>`;
    const rows = teamRows.map((m, i) => {
      const over = i + 2 > max;
      const roleSel = owner ? `<select data-c="teamRole" data-id="${m.id}" aria-label="Accès de ${esc(m.name || m.email)}">${['admin', 'membre', 'lecture'].map(r => `<option value="${r}" ${m.role === r ? 'selected' : ''}>${ROLE_NAME[r]}</option>`).join('')}</select>` : `<span class="tag">${ROLE_NAME[m.role]}</span>`;
      return `<li><div class="av">${initials(m.name || m.email)}</div><div class="grow"><b>${esc(m.name || m.email.split('@')[0])}${user.id === m.user_id ? ' (vous)' : ''}</b><small>${esc(m.email)} · ${over ? 'Hors formule, accès suspendu' : m.user_id ? 'Compte actif' : 'Invitation en attente'}</small></div>${roleSel}${owner ? `<button class="btn ghost sm" data-a="teamInvite" data-id="${m.id}">Inviter</button><button class="btn ghost sm" data-a="teamDel" data-id="${m.id}" aria-label="Retirer ${esc(m.name || m.email)}">${ic('trash')}</button>` : ''}</li>`;
    }).join('');
    box.innerHTML = `<ul class="list team-list">${head}${rows}</ul>${owner && SEATS_USED >= max ? `<p class="mute" style="font-size:13px;margin-top:8px">Toutes les places de la ${PLAN_NAME[plan]} sont utilisées. Le Magasin permet d’ajouter toute votre équipe.</p>` : ''}`;
  } catch (e) {
    box.innerHTML = '<p class="mute" style="font-size:13px">L’équipe ne peut pas être chargée. Vérifiez votre connexion, ou demandez à l’équipe Anza d’activer le travail à plusieurs sur votre espace.</p>';
  }
}
function inviteText(m) {
  const app = location.origin + location.pathname, who = meName(), biz = st.profile.business || 'mon activité';
  return `Bonjour ${m.name || ''}, je t’ai ajouté à l’espace Anza de ${biz}. Crée ton compte sur ${app} avec l’adresse ${m.email} : tu arriveras directement dans notre espace commun. ${who}`.replace(/\s+/g, ' ').trim();
}
function inviteModal(m) {
  const t = inviteText(m);
  window._invite = t;
  modal('Invitation prête', `<p class="mute" style="font-size:14px">${esc(m.name || m.email)} doit créer son compte avec <b>${esc(m.email)}</b>. Dès sa connexion, il arrive dans votre espace.</p>
  <textarea readonly rows="5" style="width:100%;margin-top:12px;border:1px solid var(--line);border-radius:10px;padding:10px">${esc(t)}</textarea>
  <div class="btns" style="margin-top:12px"><button class="btn pri sm" data-a="inviteCopy">${ic('copy')}Copier</button><a class="btn sec sm" href="mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent('Ton accès Anza')}&body=${encodeURIComponent(t)}">${ic('mail')}Email</a><a class="btn sec sm" href="https://wa.me/?text=${encodeURIComponent(t)}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a></div>`);
}
A.inviteCopy = () => copyText(window._invite || '');
A.teamInvite = el => { const m = (teamRows || []).find(x => String(x.id) === el.dataset.id); if (m) inviteModal(m); };
A.teamAdd = async el => {
  const name = val('tm-n').trim(), email = val('tm-e').trim().toLowerCase(), role = val('tm-r');
  if (!name) { toast('Entrez le prénom'); return; }
  if (!/^\S+@\S+\.\S+$/.test(email)) { toast('Entrez une adresse email valide'); return; }
  if (SEATS_USED >= seatsMax()) { toast(TEAM_ERR['seat limit']); return; }
  el.disabled = true;
  const { data, error } = await sb.from('team_members').insert({ owner_id: user.id, email, name, role }).select('id, email, name, role, user_id, created_at');
  el.disabled = false;
  if (error) { const m = error.message || ''; toast(TEAM_ERR[Object.keys(TEAM_ERR).find(k => m.includes(k))] || (/duplicate|23505|unique/i.test(m + (error.code || '')) ? 'Cette adresse fait déjà partie d’une équipe Anza' : 'Ajout impossible pour le moment')); return; }
  logAct('a ajouté ' + name + ' à l’équipe', '#/reglages'); save();
  await teamLoad(); layout();
  if (data && data[0]) inviteModal(data[0]);
};
C.teamRole = async el => {
  const { error } = await sb.from('team_members').update({ role: el.value }).eq('id', el.dataset.id);
  if (error) { toast('Modification impossible'); teamLoad(); return; }
  toast('Accès mis à jour');
};
A.teamDel = el => {
  const m = (teamRows || []).find(x => String(x.id) === el.dataset.id); if (!m) return;
  confirmBox(`Retirer ${esc(m.name || m.email)} de l’équipe ? Son accès à votre espace est coupé tout de suite. Ce qu’il a fait reste dans vos données.`, 'Retirer', async () => {
    const { error } = await sb.from('team_members').delete().eq('id', m.id);
    if (error) { toast('Suppression impossible'); return; }
    logAct('a retiré ' + (m.name || m.email) + ' de l’équipe', '#/reglages'); save();
    toast('Accès retiré'); await teamLoad(); layout();
  });
};
function memberSettings() {
  return `<div class="head"><div><p class="kick">Réglages</p><h1>Mon compte</h1><p>Vous travaillez dans l’espace de <b>${esc(st.profile.business || st.profile.first || 'votre équipe')}</b>, avec l’accès ${ROLE_NAME[ROLE].toLowerCase()}.</p></div></div>
  <div class="grid g2"><div class="card"><h3>Vous</h3><p class="mute" style="font-size:14px;margin-top:10px">Connecté avec <b>${esc(user.email)}</b>.<br>Vos actions sont signées <b>${esc(meName())}</b>.<br>Accès : <b>${ROLE_NAME[ROLE]}</b>. ${ROLE_HELP[ROLE]}</p>
  <div class="btns" style="margin-top:14px"><button class="btn sec sm" data-a="logout">Se déconnecter</button><button class="btn sec sm" data-a="teamLeave">Quitter l’équipe</button><button class="btn danger sm" data-a="delAccount">Supprimer mon compte</button></div></div>
  <div class="card team-card"><h3>L’équipe <small id="teamSeats">${seatsLabel(SEATS_USED)}</small></h3><div id="teamList" style="margin-top:12px"><p class="mute">Chargement de l’équipe</p></div>${rolesHelp()}</div></div>
  ${mfaCard()}`;
}
A.teamLeave = () => confirmBox('Quitter cette équipe ? Vous n’aurez plus accès à cet espace. Le responsable pourra vous ajouter à nouveau.', 'Quitter', async () => {
  const { error } = await sb.from('team_members').delete().eq('user_id', user.id);
  if (error) { toast('Impossible pour le moment'); return; }
  try { localStorage.removeItem(cacheKey()); } catch (e) {}
  booted = false; await loadRemote(); startApp();
});

function teamInvite() {
  if (!ONLINE || !user || ROLE !== 'owner' || st.teamTipOff || SEATS_USED > 1) return '';
  const icon = `<div class="av" style="background:var(--soft);color:var(--navy)">${ic('team')}</div>`;
  if (plan === 'stand') return `<div class="card teamtip" style="margin-top:16px">${icon}<div class="grow"><h3>Vous travaillez à plusieurs ?</h3><p class="mute">Le Stand est pensé pour une personne. Avec la Boutique, vous êtes 3 : vous et 2 membres, chacun avec son email, son prénom et ses accès. Avec le Magasin, toute votre équipe, sans limite.</p><div class="btns"><a class="btn sec sm" href="${CFG.plansUrl}" target="_blank" rel="noopener">Voir les formules</a><button class="btn ghost sm" data-a="teamTipOff">Plus tard</button></div></div></div>`;
  const left = plan === 'magasin' ? 'autant de personnes que vous voulez' : '2 personnes';
  return `<div class="card teamtip" style="margin-top:16px">${icon}<div class="grow"><h3>Invitez votre équipe</h3><p class="mute">Votre ${PLAN_NAME[plan].replace(/^L[ae] /, '')} inclut ${left} en plus de vous. Chacun se connecte avec son propre email et travaille dans votre espace : mêmes clients, mêmes devis, mêmes notes. Vous choisissez ce que chacun peut faire, et chaque action est signée de son prénom.</p><div class="btns"><a class="btn pri sm" href="#/reglages">${ic('plus')}Ajouter une personne</a><button class="btn ghost sm" data-a="teamTipOff">Plus tard</button></div></div></div>`;
}
A.teamTipOff = () => { st.teamTipOff = true; save(); refresh(); };
