VIEWS.accueil = () => {
  const p = st.profile, now = new Date();
  const cur = monthRevenue(0), prev = monthRevenue(1);
  const active = st.clients.filter(c => c.status === 'client' || c.status === 'fidele').length;
  const pend = st.quotes.filter(q => q.status === 'envoye');
  const fol = computeFollow();
  const series = [5, 4, 3, 2, 1, 0].map(monthRevenue);
  const max = Math.max(...series.map(s => s.v), 1);
  const year = st.clients.reduce((a, c) => a + c.history.filter(h => new Date(h.date).getFullYear() === now.getFullYear()).reduce((x, h) => x + (+h.amount || 0), 0), 0);
  const pct = Math.min(100, Math.round(year / (p.threshold || 1) * 100));
  const nextDecl = p.period === 'trimestrielle' ? new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3 + 4, 0) : new Date(now.getFullYear(), now.getMonth() + 2, 0);
  const upcoming = st.clients.filter(c => c.next && c.next >= iso(Date.now())).sort((a, b) => String(a.next).localeCompare(String(b.next))).slice(0, 4);
  const today = iso(Date.now()), tomorrow = iso(Date.now() + DAY);
  const posts = st.calendar.filter(e => (e.date === today || e.date === tomorrow) && !e.done);
  const diff = prev.v ? Math.round((cur.v - prev.v) / prev.v * 100) : null;
  const steps = [
    ['Faire l’entretien avec Nia', ivDone(), '#/nia'],
    ['Ajouter vos prestations et vos prix', st.services.length > 0, '#/reglages'],
    ['Ajouter votre premier contact', st.clients.length > 0, '#/crm'],
    ['Créer votre première séquence de stories', !!st.storyMade || st.perf.length > 0, '#/stories'],
    ['Envoyer votre premier devis', st.quotes.some(q => q.status !== 'brouillon'), '#/devis/new'],
    ['Installer Anza sur votre téléphone', !!st.installed, '#/reglages']
  ];
  const left = steps.filter(s => !s[1]).length;
  return `
  <div class="head"><div><p class="kick">${fdateL(now)}</p><h1>Bonjour ${esc(p.first || '')}</h1><p>${st.clients.length ? `Voici votre activité aujourd’hui. ${fol.length ? `${plural(fol.length, 'relance vous attend', 'relances vous attendent')}.` : 'Aucune relance en attente.'}` : 'Bienvenue dans votre espace Anza. Suivez les étapes ci dessous pour bien démarrer.'}</p></div>
  <div class="btns"><a class="btn sec" href="#/devis/new">${ic('file')}Nouveau devis</a><button class="btn pri" data-a="newClient">${ic('plus')}Nouveau contact</button></div></div>
  ${has(3) && !aiOn() ? `<div class="card" style="margin-bottom:16px">${connectBox('home')}</div>` : ''}
  ${left ? `<div class="card" style="margin-bottom:16px"><h3>Bien démarrer <small>${steps.length - left} sur ${steps.length}</small></h3><div class="meter"><i style="width:${(steps.length - left) / steps.length * 100}%"></i></div>
  <ul class="checklist">${steps.map(([t, ok, h]) => `<li class="${ok ? 'ok' : ''}"><span class="ck">${ok ? ic('check') : ''}</span><a href="${h}">${t}</a></li>`).join('')}</ul></div>` : ''}
  <div class="grid g4">
    <div class="card kpi"><p>Chiffre d’affaires, ${MONTHS_FULL[now.getMonth()]}</p><strong>${eur(cur.v)}</strong>${diff == null ? '<span>Ce mois ci</span>' : `<span class="${diff < 0 ? 'w' : ''}">${diff >= 0 ? '+' : ''}${diff} % vs ${MONTHS_FULL[prev.m]}</span>`}</div>
    <div class="card kpi"><p>Clients actifs</p><strong>${active}</strong><span>${st.clients.filter(c => c.status === 'fidele').length} fidèles</span></div>
    <div class="card kpi"><p>Devis en attente</p><strong>${pend.length}</strong><span class="w">${eur(pend.reduce((a, q) => a + quoteTotal(q), 0))} à signer</span></div>
    <div class="card kpi"><p>Prospects</p><strong>${st.clients.filter(c => c.status === 'prospect').length}</strong><span>à convertir</span></div>
  </div>
  <div class="grid g21" style="margin-top:16px">
    <div class="card"><h3>Chiffre d’affaires <small>6 derniers mois</small></h3>
      <div class="bars">${series.map(s => `<div><b>${s.v ? eur(s.v) : ''}</b><i style="height:${Math.max(4, s.v / max * 110)}px"></i></div>`).join('')}</div>
      <div class="months">${series.map(s => `<span>${MONTHS[s.m]}</span>`).join('')}</div>
      ${year ? '' : '<p class="mute" style="font-size:13px;margin-top:12px">Ajoutez des prestations à vos clients ou acceptez un devis : le graphique se remplit tout seul.</p>'}</div>
    <div class="card"><h3>À faire aujourd’hui <a class="btn ghost sm" href="#/relances">Tout voir</a></h3>
      <ul class="list" style="margin-top:8px">${fol.slice(0, 4).map(f => `<li><div class="av">${initials(f.c.name)}</div><div class="grow"><b>${esc(f.c.name)}</b><small>${esc(f.label)}, ${plural(f.days, 'jour', 'jours')}</small></div><a class="btn sec sm" href="#/relances">Relancer</a></li>`).join('')}
      ${posts.map(e => `<li><div class="av" style="background:var(--blue)">${ic('story').replace('<svg', '<svg style="width:16px;height:16px;stroke:#fff;fill:none;stroke-width:2"')}</div><div class="grow"><b>${esc(e.title)}</b><small>${e.date === today ? 'À publier aujourd’hui' : 'Demain'}</small></div><a class="btn sec sm" href="#/calendrier">Voir</a></li>`).join('')}
      ${!fol.length && !posts.length ? '<li class="mute">Rien d’urgent aujourd’hui.</li>' : ''}</ul></div>
  </div>
  <div class="grid g3" style="margin-top:16px">
    <div class="card"><h3>Prochains rendez vous</h3><ul class="list" style="margin-top:8px">${upcoming.map(c => `<li><div class="av">${initials(c.name)}</div><div class="grow"><b>${esc(c.name)}</b><small>${fdateL(c.next)}</small></div><a class="btn ghost sm" href="#/client/${c.id}">Fiche</a></li>`).join('') || '<li class="mute">Aucun rendez vous prévu. Ajoutez en un depuis la fiche d’un client.</li>'}</ul></div>
    <div class="card"><h3>Seuil micro entreprise <small>${now.getFullYear()}</small></h3><p style="margin-top:14px;font-size:26px;font-weight:800;letter-spacing:-.04em">${eur(year)}</p><p class="mute" style="font-size:13px">sur ${eur(p.threshold)}, soit ${pct} %</p><div class="meter"><i style="width:${pct}%"></i></div>
      <div class="tip" style="margin-top:16px"><i>!</i><div>Déclaration ${p.period} à faire avant le <b>${fdate(nextDecl)}</b></div></div></div>
    <div class="card ${weeklyDone() ? '' : 'blue'}"><h3>Nia</h3>${weeklyDone() ? `<p class="mute" style="margin-top:12px">Vous avez répondu à la question de la semaine. Nia a mis à jour votre positionnement.</p><a class="btn sec" style="margin-top:16px" href="#/journal">Voir le journal</a>` :
      `<p style="margin-top:12px;font-size:19px;font-weight:700;letter-spacing:-.02em;line-height:1.3">${esc(currentWeeklyQ().q)}</p><p style="margin-top:8px;opacity:.8;font-size:14px">Deux minutes pour répondre : Nia adapte votre profil et planifie vos prochaines publications.</p><a class="btn sec" style="margin-top:16px" href="#/semaine">Répondre</a>`}</div>
  </div>
  <div class="card" style="margin-top:16px"><div class="tip"><i>€</i><div><b>Suivi facturation.</b> La facturation électronique devient obligatoire pour les petites entreprises en France. Anza ne facture pas à votre place : nous vous aidons à choisir votre plateforme agréée et faisons le point avec vous sur vos factures et vos seuils.</div></div></div>`;
};
function weekIndex() { return Math.floor(mondayOf(Date.now()).getTime() / (7 * DAY)) % WEEKLY_Q.length; }

VIEWS.crm = () => {
  if (!st.clients.length) return `<div class="head"><div><p class="kick">CRM</p><h1>Vos clients</h1><p>Tous vos contacts, du premier message au client fidèle.</p></div></div><div class="card empty-big"><h2>Ajoutez votre premier contact</h2><p class="mute">Un message Instagram, une demande WhatsApp, un ancien client : tout le monde a sa place ici. Anza vous dira ensuite qui relancer et quand.</p><button class="btn pri" data-a="newClient">${ic('plus')}Nouveau contact</button></div>`;
  const mode = route.q.vue || 'liste', f = route.q.f || 'tous';
  const list = st.clients.filter(c => f === 'tous' || c.status === f).sort((a, b) => String(b.lastContact || '').localeCompare(String(a.lastContact || '')));
  const spent = c => c.history.reduce((a, h) => a + (+h.amount || 0), 0);
  const counts = s => st.clients.filter(c => c.status === s).length;
  return `<div class="head"><div><p class="kick">CRM</p><h1>Vos clients</h1><p>Tous vos contacts, du premier message au client fidèle.</p></div>
  <div class="btns"><div class="seg"><button class="${mode === 'liste' ? 'on' : ''}" data-a="go" data-h="#/crm?vue=liste&f=${f}">Liste</button><button class="${mode === 'pipeline' ? 'on' : ''}" data-a="go" data-h="#/crm?vue=pipeline">Pipeline</button></div><button class="btn pri" data-a="newClient">${ic('plus')}Nouveau contact</button></div></div>
  ${mode === 'pipeline' ? `<div class="kanban">${Object.keys(STATUS).map(s => `<div class="col" data-drop="${s}"><h4>${STATUS[s]} <span class="mute">${counts(s)}</span></h4>${st.clients.filter(c => c.status === s).map(c => `<div class="kc" draggable="true" data-drag="${c.id}"><b>${esc(c.name)}</b><small>${esc(c.source)} · ${fdate(c.lastContact)}</small><div class="row"><small>${eur(spent(c))}</small><a class="btn ghost sm" href="#/client/${c.id}">Ouvrir</a></div></div>`).join('')}</div>`).join('')}</div><p class="mute" style="margin-top:10px;font-size:13px">Glissez une carte pour changer son étape. Sur téléphone, changez l’étape depuis la fiche du contact.</p>` :
    `<div class="card" style="padding:0"><div style="padding:14px 16px"><div class="seg">${['tous', ...Object.keys(STATUS)].map(s => `<button class="${f === s ? 'on' : ''}" data-a="go" data-h="#/crm?vue=liste&f=${s}">${s === 'tous' ? 'Tous ' + st.clients.length : STATUS[s] + ' ' + counts(s)}</button>`).join('')}</div></div>
    <div class="tablewrap"><table class="table crm-t"><thead><tr><th>Nom</th><th>Étape</th><th>Source</th><th>Dernier contact</th><th>Dépensé</th><th>Prochain rendez vous</th></tr></thead><tbody>
    ${list.map(c => `<tr class="click" data-a="go" data-h="#/client/${c.id}"><td><div class="row" style="flex-wrap:nowrap"><div class="av">${initials(c.name)}</div><b>${esc(c.name)}</b></div></td><td><span class="tag ${c.status}">${STATUS[c.status]}</span></td><td>${esc(c.source)}</td><td>${fdate(c.lastContact)}</td><td>${eur(spent(c))}</td><td>${c.next ? fdate(c.next) : '<span class="mute">Aucun</span>'}</td></tr>`).join('') || '<tr><td colspan="6" class="empty">Aucun contact ici.</td></tr>'}
    </tbody></table></div></div>`}`;
};
AFTER.crm = () => {
  $$('[data-drag]').forEach(k => k.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', k.dataset.drag); }));
  $$('[data-drop]').forEach(col => {
    col.addEventListener('dragover', e => { e.preventDefault(); col.classList.add('over'); });
    col.addEventListener('dragleave', () => col.classList.remove('over'));
    col.addEventListener('drop', e => {
      e.preventDefault(); const c = clientById(e.dataTransfer.getData('text/plain')); if (!c) return;
      c.status = col.dataset.drop; c.lastContact = iso(Date.now()); save(); toast(`${firstName(c.name)} : ${STATUS[c.status]}`); refresh();
    });
  });
};

function clientForm(c) {
  c = c || { name: '', phone: '', email: '', source: 'Instagram', status: 'prospect', notes: '' };
  return `<div class="form"><div class="grid g2"><div class="field"><label for="f-name">Nom</label><input id="f-name" value="${esc(c.name)}" placeholder="Prénom Nom"></div>
  <div class="field"><label for="f-phone">Téléphone</label><input id="f-phone" value="${esc(c.phone)}" placeholder="06 00 00 00 00"></div></div>
  <div class="grid g2"><div class="field"><label for="f-email">Email</label><input id="f-email" value="${esc(c.email)}"></div>
  <div class="field"><label for="f-source">Source</label><select id="f-source">${['Instagram', 'WhatsApp', 'LinkedIn', 'Bouche à oreille', 'Site', 'Autre'].map(s => `<option ${c.source === s ? 'selected' : ''}>${s}</option>`).join('')}</select></div></div>
  <div class="field"><label for="f-status">Étape</label><select id="f-status">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
  <div class="field"><label for="f-notes">Notes</label><textarea id="f-notes">${esc(c.notes)}</textarea></div>
  <div class="btns" style="justify-content:flex-end"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="saveClient" data-id="${c.id || ''}">Enregistrer</button></div></div>`;
}
A.newClient = () => modal('Nouveau contact', clientForm());
A.editClient = el => modal('Modifier le contact', clientForm(clientById(el.dataset.id)));
A.saveClient = el => {
  const name = val('f-name').trim(); if (!name) { toast('Le nom est obligatoire'); return; }
  let c = clientById(el.dataset.id);
  if (!c) { c = { id: uid(), createdAt: iso(Date.now()), lastContact: iso(Date.now()), next: '', satisfied: false, review: false, history: [] }; st.clients.push(c); }
  Object.assign(c, { name, phone: val('f-phone'), email: val('f-email'), source: val('f-source'), status: val('f-status'), notes: val('f-notes') });
  save(); closeModal(); toast('Contact enregistré'); go('#/client/' + c.id); refresh();
};

VIEWS.client = () => {
  const c = clientById(route.id);
  if (!c) return `<div class="empty">Contact introuvable. <a href="#/crm">Retour aux clients</a></div>`;
  const spent = c.history.reduce((a, h) => a + (+h.amount || 0), 0), visits = c.history.filter(h => h.amount > 0).length;
  const qs = st.quotes.filter(q => q.clientId === c.id);
  return `<div class="head"><div class="row" style="gap:16px;flex-wrap:nowrap"><div class="av lg">${initials(c.name)}</div><div><p class="kick"><a href="#/crm" style="text-decoration:none">Clients</a></p><h1>${esc(c.name)}</h1><p><select data-c="clientStatus" data-id="${c.id}" class="tag ${c.status}" style="border:0;cursor:pointer">${Object.entries(STATUS).map(([k, v]) => `<option value="${k}" ${c.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select> · ${esc(c.source)} · depuis le ${fdate(c.createdAt)}</p></div></div>
  <div class="btns"><a class="btn sec" href="${wa(c.phone, `Bonjour ${firstName(c.name)}, `)}" target="_blank" rel="noopener">${ic('wa')}WhatsApp</a><a class="btn sec" href="mailto:${esc(c.email)}">${ic('mail')}Email</a><a class="btn sec" href="#/devis/new?client=${c.id}">${ic('file')}Devis</a><button class="btn pri" data-a="addVisit" data-id="${c.id}">${ic('plus')}Ajouter une prestation</button></div></div>
  <div class="grid g3">
    <div class="card kpi"><p>Dépensé au total</p><strong>${eur(spent)}</strong></div>
    <div class="card kpi"><p>Visites</p><strong>${visits}</strong></div>
    <div class="card kpi"><p>Panier moyen</p><strong>${eur(visits ? spent / visits : 0)}</strong></div>
  </div>
  <div class="grid g21" style="margin-top:16px">
    <div class="card"><h3>Historique</h3><ul class="list" style="margin-top:8px">${c.history.slice().sort((a, b) => String(b.date || '').localeCompare(String(a.date || ''))).map(h => `<li><div class="grow"><b>${esc(h.text)}</b><small>${fdateL(h.date)}</small></div><b>${h.amount ? eur(h.amount) : ''}</b></li>`).join('') || '<li class="mute">Pas encore d’historique.</li>'}</ul>
      ${qs.length ? `<h3 style="margin-top:20px">Devis</h3><ul class="list" style="margin-top:8px">${qs.map(q => `<li><div class="grow"><b>${esc(q.num)}</b><small>${fdate(q.date)}</small></div><span class="tag ${q.status}">${QSTATUS[q.status]}</span><b>${eur(quoteTotal(q))}</b><a class="btn ghost sm" href="#/devis/${q.id}">Ouvrir</a></li>`).join('')}</ul>` : ''}</div>
    <div class="grid" style="align-content:start">
      <div class="card"><h3>Coordonnées <button class="btn ghost sm" data-a="editClient" data-id="${c.id}">Modifier</button></h3><ul class="list" style="margin-top:8px"><li><small class="grow">Téléphone</small><b>${esc(c.phone) || '…'}</b></li><li><small class="grow">Email</small><b>${esc(c.email) || '…'}</b></li><li><small class="grow">Prochain rendez vous</small><input type="date" value="${c.next}" data-c="clientNext" data-id="${c.id}" style="border:1px solid var(--line);border-radius:8px;padding:5px 8px"></li></ul></div>
      <div class="card"><h3>Notes</h3><textarea data-i="clientNotes" data-id="${c.id}" style="margin-top:10px;width:100%;min-height:110px;border:1px solid var(--line);border-radius:10px;padding:10px" placeholder="Préférences, allergies, détails utiles">${esc(c.notes)}</textarea></div>
      <div class="card"><h3>Satisfaction</h3>
        <label class="row" style="margin-top:12px;flex-wrap:nowrap"><input type="checkbox" ${c.satisfied ? 'checked' : ''} data-c="clientFlag" data-k="satisfied" data-id="${c.id}"> Client satisfait</label>
        <label class="row" style="margin-top:8px;flex-wrap:nowrap"><input type="checkbox" ${c.review ? 'checked' : ''} data-c="clientFlag" data-k="review" data-id="${c.id}"> Avis laissé</label>
        ${c.satisfied ? `<div class="tip" style="margin-top:14px"><i>★</i><div>Un client satisfait, c’est votre meilleure publicité.<br><a class="btn pri sm" style="margin-top:10px" href="#/stories?type=Preuve&subj=${encodeURIComponent(firstName(c.name))}">Créer une story avis</a></div></div>` : ''}</div>
      <button class="btn danger" data-a="delClient" data-id="${c.id}">Supprimer ce contact</button>
    </div>
  </div>`;
};
C.clientStatus = el => { const c = clientById(el.dataset.id); c.status = el.value; c.lastContact = iso(Date.now()); save(); toast('Étape mise à jour'); refresh(); };
C.clientNext = el => { const c = clientById(el.dataset.id); c.next = el.value; save(); toast('Rendez vous enregistré'); };
I.clientNotes = el => { const c = clientById(el.dataset.id); c.notes = el.value; save(); };
C.clientFlag = el => { const c = clientById(el.dataset.id); c[el.dataset.k] = el.checked; save(); refresh(); };
A.delClient = el => confirmBox('Supprimer ce contact et son historique ?', 'Supprimer', () => { st.clients = st.clients.filter(c => c.id !== el.dataset.id); save(); toast('Contact supprimé'); go('#/crm'); });
A.addVisit = el => {
  if (!st.services.length) { toast('Ajoutez d’abord vos prestations dans les Réglages'); go('#/reglages'); return; }
  modal('Ajouter une prestation', `<div class="form"><div class="field"><label for="v-s">Prestation</label><select id="v-s" data-c="visitSvc">${st.services.map(s => `<option value="${s.id}">${esc(s.name)}, ${eur(s.price)}</option>`).join('')}</select></div>
  <div class="grid g2"><div class="field"><label for="v-d">Date</label><input id="v-d" type="date" value="${iso(Date.now())}"></div><div class="field"><label for="v-a">Montant</label><input id="v-a" type="number" step="0.5" value="${st.services[0].price}"></div></div>
  <div class="btns" style="justify-content:flex-end"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="saveVisit" data-id="${el.dataset.id}">Ajouter</button></div></div>`);
};
C.visitSvc = el => { const s = st.services.find(x => x.id === el.value); $('#v-a').value = s.price; };
A.saveVisit = el => {
  const c = clientById(el.dataset.id), s = st.services.find(x => x.id === val('v-s'));
  c.history.push({ date: val('v-d'), text: s.name, amount: +val('v-a') || 0 });
  c.lastContact = val('v-d') > c.lastContact ? val('v-d') : c.lastContact;
  if (c.status === 'prospect' || c.status === 'devis') c.status = 'client';
  if (c.history.filter(h => h.amount > 0).length >= 3) c.status = 'fidele';
  save(); closeModal(); toast('Prestation ajoutée'); refresh();
};

VIEWS.relances = () => {
  const items = computeFollow();
  const doneToday = st.done.filter(d => d.date === iso(Date.now())).length;
  return `<div class="head"><div><p class="kick">Relances</p><h1>Qui relancer aujourd’hui</h1><p>Anza repère qui attend une réponse et prépare le message dans votre ton. Il ne reste qu’à l’envoyer.</p></div>
  <div class="tag fidele" style="font-size:14px;padding:8px 12px">${ic('check').replace('<svg', '<svg style="width:15px;height:15px;stroke:currentColor;fill:none;stroke-width:2.5"')} ${plural(doneToday, 'relance faite', 'relances faites')} aujourd’hui</div></div>
  <div class="grid g21"><div class="grid" style="align-content:start">${items.map((f, i) => `<div class="card"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><div class="row" style="flex-wrap:nowrap"><div class="av">${initials(f.c.name)}</div><div><b>${esc(f.c.name)}</b><div class="mute" style="font-size:13px">${esc(f.label)}, depuis ${plural(f.days, 'jour', 'jours')}</div></div></div><a class="btn ghost sm" href="#/client/${f.c.id}">Fiche</a></div>
    <textarea id="msg-${i}" style="margin-top:14px;width:100%;min-height:96px;border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--soft)">${esc(followMessage(f.rule, f.c))}</textarea>
    <div class="btns" style="margin-top:10px"><button class="btn pri sm" data-a="sendWa" data-i="${i}" data-id="${f.c.id}" data-r="${f.rule}">${ic('wa')}Envoyer sur WhatsApp</button><button class="btn sec sm" data-a="sendMail" data-i="${i}" data-id="${f.c.id}" data-r="${f.rule}">${ic('mail')}Email</button><button class="btn ghost sm" data-a="markDone" data-id="${f.c.id}" data-r="${f.rule}">Marquer comme fait</button>${aiOn() ? `<button class="btn ghost sm" data-a="followAI" data-i="${i}" data-id="${f.c.id}" data-r="${f.rule}">${ic('spark')}Réécrire avec Nia</button>` : ''}</div></div>`).join('') || `<div class="card empty">Aucune relance en attente. Vos contacts sont à jour.</div>`}</div>
  <div class="card" style="align-self:start"><h3>Vos règles</h3><p class="mute" style="font-size:13px;margin-top:6px">Réglées une fois, appliquées tous les jours.</p>
  ${st.rules.map((r, i) => `<div style="padding:14px 0;border-top:1px solid var(--line);margin-top:${i ? 0 : 12}px"><label class="row" style="flex-wrap:nowrap;justify-content:space-between"><b style="font-size:14px">${esc(r.label)}</b><input type="checkbox" ${r.on ? 'checked' : ''} data-c="set" data-path="rules.${i}.on" data-live="1"></label>
  <div class="row" style="margin-top:8px;font-size:13px" class="mute">Après <input type="number" min="1" value="${r.days}" data-c="set" data-num data-path="rules.${i}.days" data-live="1" style="width:64px;border:1px solid var(--line);border-radius:8px;padding:5px 8px"> jours</div></div>`).join('')}</div></div>`;
};
A.followAI = async el => {
  const c = clientById(el.dataset.id), r = st.rules.find(x => x.id === el.dataset.r), ta = $('#msg-' + el.dataset.i);
  el.disabled = true; el.lastChild.textContent = 'Nia écrit';
  try { ta.value = await aiFollow(el.dataset.r, c, r ? r.label : ''); toast('Message personnalisé par Nia'); } catch (e) { toast(aiError(e)); }
  el.disabled = false; el.lastChild.textContent = 'Réécrire avec Nia';
};
function finishFollow(id, rule) {
  const c = clientById(id); st.done.push({ cid: id, rule, date: iso(Date.now()) });
  if (rule === 'avis') c.review = true;
  c.lastContact = iso(Date.now()); save();
}
A.sendWa = el => { const c = clientById(el.dataset.id); window.open(wa(c.phone, val('msg-' + el.dataset.i)), '_blank', 'noopener'); finishFollow(el.dataset.id, el.dataset.r); toast('Relance envoyée'); refresh(); };
A.sendMail = el => { const c = clientById(el.dataset.id); location.href = `mailto:${c.email}?subject=${encodeURIComponent(st.profile.business)}&body=${encodeURIComponent(val('msg-' + el.dataset.i))}`; finishFollow(el.dataset.id, el.dataset.r); toast('Relance envoyée'); setTimeout(refresh, 300); };
A.markDone = el => { finishFollow(el.dataset.id, el.dataset.r); toast('Relance marquée comme faite'); refresh(); };

VIEWS.devis = () => {
  if (route.id) return quoteEditor();
  const qs = st.quotes.slice().sort((a, b) => String(b.num || '').localeCompare(String(a.num || '')));
  const tot = s => qs.filter(q => q.status === s).reduce((a, q) => a + quoteTotal(q), 0);
  return `<div class="head"><div><p class="kick">Devis</p><h1>Vos devis</h1><p>Vos prestations et vos prix sont enregistrés : un devis propre en trente secondes, envoyé par WhatsApp ou email.</p></div><a class="btn pri" href="#/devis/new">${ic('plus')}Nouveau devis</a></div>
  <div class="grid g3"><div class="card kpi"><p>En attente</p><strong>${eur(tot('envoye'))}</strong></div><div class="card kpi"><p>Acceptés</p><strong>${eur(tot('accepte'))}</strong></div><div class="card kpi"><p>Taux d’acceptation</p><strong>${qs.length ? Math.round(qs.filter(q => q.status === 'accepte').length / Math.max(1, qs.filter(q => q.status !== 'brouillon').length) * 100) : 0} %</strong></div></div>
  <div class="card" style="margin-top:16px;padding:0"><div class="tablewrap"><table class="table"><thead><tr><th>Numéro</th><th>Client</th><th>Date</th><th>Montant</th><th>Statut</th></tr></thead><tbody>
  ${qs.map(q => `<tr class="click" data-a="go" data-h="#/devis/${q.id}"><td><b>${esc(q.num)}</b></td><td>${esc((clientById(q.clientId) || {}).name || 'Client supprimé')}</td><td>${fdate(q.date)}</td><td>${eur(quoteTotal(q))}</td><td><span class="tag ${q.status}">${QSTATUS[q.status]}</span></td></tr>`).join('') || '<tr><td colspan="5" class="empty">Aucun devis.</td></tr>'}</tbody></table></div></div>`;
};
let draft = null;
function quoteEditor() {
  if (route.id === 'new') {
    if (!st.clients.length) return `<div class="head"><div><p class="kick"><a href="#/devis" style="text-decoration:none">Devis</a></p><h1>Nouveau devis</h1></div></div><div class="card empty-big"><h2>Ajoutez d’abord un contact</h2><p class="mute">Un devis est toujours adressé à quelqu’un. Créez le contact, puis revenez ici.</p><button class="btn pri" data-a="newClient">${ic('plus')}Nouveau contact</button></div>`;
    if (!draft || draft.id !== 'new') draft = { id: 'new', num: 'D' + new Date().getFullYear() + ' ' + String(st.quoteSeq).padStart(3, '0'), clientId: route.q.client || st.clients[0].id, date: iso(Date.now()), status: 'brouillon', lines: st.services[0] ? [{ sid: st.services[0].id, name: st.services[0].name, qty: 1, price: st.services[0].price }] : [{ sid: '', name: 'Prestation', qty: 1, price: 0 }], discount: 0, note: '' };
  } else {
    const q = st.quotes.find(x => x.id === route.id); if (!q) return '<div class="empty">Devis introuvable.</div>';
    if (!draft || draft.id !== q.id) draft = JSON.parse(JSON.stringify(q));
  }
  const q = draft;
  return `<div class="head"><div><p class="kick"><a href="#/devis" style="text-decoration:none">Devis</a></p><h1>Devis ${esc(q.num)}</h1><p><span class="tag ${q.status}">${QSTATUS[q.status]}</span></p></div>
  <div class="btns"><button class="btn sec" data-a="printQuote">${ic('print')}Imprimer ou PDF</button><button class="btn sec" data-a="waQuote">${ic('wa')}Envoyer</button><button class="btn pri" data-a="saveQuote">Enregistrer</button></div></div>
  <div class="grid g12"><div class="card"><div class="form">
    <div class="field"><label for="q-c">Client</label><select id="q-c" data-c="qField" data-k="clientId">${st.clients.map(c => `<option value="${c.id}" ${q.clientId === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></div>
    <div class="field"><label>Prestations</label><div class="lines">${q.lines.map((l, i) => `<div class="ln"><input value="${esc(l.name)}" data-i="qLine" data-n="${i}" data-k="name" aria-label="Prestation"><input type="number" min="1" value="${l.qty}" data-i="qLine" data-n="${i}" data-k="qty" aria-label="Quantité"><input type="number" step="0.5" value="${l.price}" data-i="qLine" data-n="${i}" data-k="price" aria-label="Prix"><b class="tt" style="text-align:right">${eur(l.qty * l.price)}</b><button class="x" data-a="qDel" data-n="${i}" aria-label="Retirer">×</button></div>`).join('')}</div>
    <select data-c="qAdd" style="margin-top:6px;border:1px dashed var(--line);border-radius:10px;padding:9px 12px;background:#fff"><option value="">Ajouter une prestation</option>${st.services.map(s => `<option value="${s.id}">${esc(s.name)}, ${eur(s.price)}</option>`).join('')}</select></div>
    <div class="grid g2"><div class="field"><label for="q-r">Remise en %</label><input id="q-r" type="number" min="0" max="100" value="${q.discount}" data-i="qField" data-k="discount"></div><div class="field"><label for="q-d">Date</label><input id="q-d" type="date" value="${q.date}" data-c="qField" data-k="date"></div></div>
    <div class="field"><label for="q-n">Message</label><textarea id="q-n" data-i="qField" data-k="note">${esc(q.note)}</textarea></div>
    <div class="field"><label>Statut</label><div class="seg">${Object.entries(QSTATUS).map(([k, v]) => `<button class="${q.status === k ? 'on' : ''}" data-a="qStatus" data-s="${k}">${v}</button>`).join('')}</div><small>Accepté ajoute la prestation à l’historique du client.</small></div>
    ${route.id !== 'new' ? '<button class="btn danger" data-a="qRemove">Supprimer ce devis</button>' : ''}
  </div></div>
  <div class="print-area" id="qdoc">${quoteDoc(q)}</div></div>`;
}
function quoteDoc(q) {
  const c = clientById(q.clientId) || { name: '', email: '', phone: '' }, p = st.profile;
  const sub = q.lines.reduce((a, l) => a + l.qty * l.price, 0), tot = quoteTotal(q);
  return `<div class="quote-doc"><div class="qh"><div><h2>${esc(p.business)}</h2><p class="mute">${esc(p.activity)}<br>${esc(p.address)}<br>${esc(p.phone)} · ${esc(p.email)}${p.siret ? '<br>SIRET ' + esc(p.siret) : ''}</p></div><div style="text-align:right"><b style="font-size:18px">DEVIS</b><p>${esc(q.num)}<br>${fdate(q.date)} ${new Date(q.date).getFullYear()}<br>Valable 30 jours</p></div></div>
  <p><b>Pour :</b> ${esc(c.name)}<br><span class="mute">${esc(c.email)} · ${esc(c.phone)}</span></p>
  <table><thead><tr><th>Prestation</th><th class="r">Qté</th><th class="r">Prix</th><th class="r">Total</th></tr></thead><tbody>${q.lines.map(l => `<tr><td>${esc(l.name)}</td><td class="r">${l.qty}</td><td class="r">${eur(l.price)}</td><td class="r">${eur(l.qty * l.price)}</td></tr>`).join('')}</tbody></table>
  <div class="tot"><div><p><span>Sous total</span><span>${eur(sub)}</span></p>${+q.discount ? `<p><span>Remise ${q.discount} %</span><span>${eur(tot - sub)}</span></p>` : ''}<p class="b"><span>Total</span><span>${eur(tot)}</span></p></div></div>
  ${q.note ? `<p style="margin-top:16px">${esc(q.note)}</p>` : ''}
  <p class="mute" style="margin-top:22px;font-size:11px">${p.vatNote ? 'TVA non applicable, article 293 B du CGI. ' : ''}Bon pour accord : date et signature.</p></div>`;
}
function redrawDoc() { const d = $('#qdoc'); if (d) d.innerHTML = quoteDoc(draft); $$('.lines .ln').forEach((r, i) => { const t = $('.tt', r); if (t && draft.lines[i]) t.textContent = eur(draft.lines[i].qty * draft.lines[i].price); }); }
I.qLine = el => { const l = draft.lines[+el.dataset.n]; l[el.dataset.k] = el.dataset.k === 'name' ? el.value : +el.value || 0; redrawDoc(); };
I.qField = el => { draft[el.dataset.k] = el.dataset.k === 'discount' ? +el.value || 0 : el.value; redrawDoc(); };
C.qField = el => { draft[el.dataset.k] = el.value; redrawDoc(); };
C.qAdd = el => { const s = st.services.find(x => x.id === el.value); if (!s) return; draft.lines.push({ sid: s.id, name: s.name, qty: 1, price: s.price }); refresh(); };
A.qDel = el => { draft.lines.splice(+el.dataset.n, 1); refresh(); };
A.qStatus = el => { draft.status = el.dataset.s; A.saveQuote(null, true); };
A.saveQuote = (el, quiet) => {
  const q = draft; const isNew = q.id === 'new';
  if (isNew) { q.id = uid(); st.quoteSeq++; st.quotes.push(q); }
  else { const i = st.quotes.findIndex(x => x.id === q.id); const old = st.quotes[i]; st.quotes[i] = q; q._booked = old._booked; }
  const c = clientById(q.clientId);
  if (c) {
    if (q.status === 'envoye' && (c.status === 'prospect')) { c.status = 'devis'; c.lastContact = iso(Date.now()); }
    if (q.status === 'accepte' && !q._booked) { q._booked = true; c.history.push({ date: iso(Date.now()), text: q.lines.map(l => l.name).join(', '), amount: Math.round(quoteTotal(q) * 100) / 100 }); if (c.status === 'prospect' || c.status === 'devis') c.status = 'client'; c.lastContact = iso(Date.now()); }
  }
  draft = JSON.parse(JSON.stringify(q)); save(); toast(quiet ? 'Statut : ' + QSTATUS[q.status] : 'Devis enregistré');
  if (isNew) go('#/devis/' + q.id); else refresh();
};
A.printQuote = () => { window.print(); };
A.waQuote = () => {
  const c = clientById(draft.clientId); if (!c) return;
  const t = `Bonjour ${firstName(c.name)}, voici votre devis ${draft.num} :\n${draft.lines.map(l => `• ${l.name} x${l.qty} : ${eur(l.qty * l.price)}`).join('\n')}\nTotal : ${eur(quoteTotal(draft))}\n\n${draft.note || ''}\n${st.profile.business}`;
  window.open(wa(c.phone, t), '_blank', 'noopener');
  if (draft.status === 'brouillon') { draft.status = 'envoye'; A.saveQuote(null, true); }
};
A.qRemove = () => confirmBox('Supprimer ce devis ?', 'Supprimer', () => { st.quotes = st.quotes.filter(q => q.id !== draft.id); draft = null; save(); go('#/devis'); });

let typing = false, busy = false;
function ivDone() { const iv = st.interview; return !!iv.done || iv.step >= INTERVIEW.length; }
function interviewMsgs() {
  const iv = st.interview;
  if (!iv.msgs.length) iv.msgs = [{ f: 'n', t: INTERVIEW[Math.min(iv.step, INTERVIEW.length - 1)].q }];
  return iv.msgs;
}
function summary() {
  const p = P();
  return `Voici votre positionnement : ${p.business}, ${lc(p.activity)}, ${p.city}. Pour ${lc(p.target)}. Votre promesse : ${lc(dot(p.value))} Votre preuve : ${lc(dot(p.proof))} Je m’en sers maintenant pour tous vos contenus, devis et relances.`;
}
function aiBadge() { return aiOn() ? '<span class="tag ai">Connectée à ' + (aiMode() === 'local' ? 'Claude' : AI_NAME) + '</span>' : ''; }
function niaChat(onb) {
  const iv = st.interview, msgs = interviewMsgs(), done = ivDone();
  const prog = iv.covered ? Math.max(iv.covered.length, iv.step) : iv.step;
  return `<div class="row" style="flex-wrap:nowrap"><div class="av nia">N</div><div><b>Nia</b> ${aiBadge()}<div class="mute" style="font-size:13px">Brand manager, intelligence artificielle formée à la méthode SAUTI</div></div></div>
    <div class="steps">${INTERVIEW.map((s, i) => `<i class="${i < prog || done ? 'on' : ''}"></i>`).join('')}</div>
    <div class="chat" id="chat">${msgs.map(m => `<div class="msg ${m.f}">${esc(m.t)}</div>`).join('')}${typing ? '<div class="msg n typing"><i></i><i></i><i></i></div>' : ''}</div>
    ${done ? (onb ? `<div class="btns" style="margin-top:14px;justify-content:flex-end"><a class="btn pri" href="#/bienvenue?e=2">Continuer</a></div>` : `<div class="tip" style="margin-top:14px"><i>✓</i><div>Entretien terminé. Votre profil nourrit maintenant vos stories, posts, devis et relances.</div></div>`) :
      `<div class="compose"><textarea id="iv-in" placeholder="Votre réponse, comme vous parlez" data-enter="ivSend" aria-label="Votre réponse" ${typing ? 'disabled' : ''}></textarea><button class="btn pri" data-a="ivSend" style="height:auto" aria-label="Envoyer">${ic('send')}</button></div>${onb ? '<button class="btn ghost sm" style="margin-top:8px" data-a="ivSkip">Passer cette question</button>' : ''}`}`;
}
function learnedList() {
  const p = st.profile;
  return [['Activité', [p.business, p.activity].filter(Boolean).join(', ')], ['Lieu', p.city], ['Histoire', p.story], ['Clients idéaux', p.target], ['Problème réglé', p.problem], ['Valeur ajoutée', p.value], ['Preuve', p.proof], ['Ton', p.vibe ? p.vibe + (p.tone === 'tu' ? ', tutoiement' : ', vouvoiement') : ''], ['Limites', p.limits]]
    .map(([k, v]) => `<li><b>${k}</b>${v ? esc(v) : '<span class="mute">Pas encore renseigné</span>'}</li>`).join('');
}
VIEWS.nia = () => {
  const done = ivDone();
  return `<div class="head"><div><p class="kick">Nia, votre brand manager</p><h1>L’entretien de départ</h1><p>Une vraie conversation pour que tout ce qu’Anza écrit vous ressemble. Répondez comme vous parlez : Nia rebondit sur chacune de vos réponses.</p></div>${done ? '<button class="btn sec" data-a="restartIv">Refaire l’entretien</button>' : ''}</div>
  <div class="grid g21"><div class="card">${niaChat(false)}</div>
  <div class="card"><h3>Ce que Nia a compris</h3><ul class="learn" style="margin-top:8px">${learnedList()}</ul><p class="mute" style="font-size:12px;margin-top:10px">Vous pouvez tout modifier dans les Réglages.</p></div></div>`;
};
AFTER.nia = () => { const c = $('#chat'); if (c) c.scrollTop = c.scrollHeight; const i = $('#iv-in'); if (i && innerWidth > 900) i.focus(); };
A.restartIv = () => confirmBox('Recommencer l’entretien avec Nia ? Votre profil actuel reste en place jusqu’à vos nouvelles réponses.', 'Recommencer', () => { st.interview = { step: 0, msgs: [{ f: 'n', t: INTERVIEW[0].q }], answers: {}, asked: {} }; save(); refresh(); });
function ivRefresh() { save(); if (route.name === 'nia' || route.name === 'bienvenue') refresh(); }
function ruleTurn(t) {
  const iv = st.interview; iv.asked = iv.asked || {};
  const step = INTERVIEW[iv.step], key = step.key, asked = !!iv.asked[key];
  let r;
  if (key === 'prices') {
    const n = applyAnswer('prices', t) || 0;
    if (!n && !asked && !RX.skip.test(t)) r = { follow: FOLLOW.prices };
    else r = { text: pricesReaction(n) || 'Pas de souci, vous ajouterez vos prestations à l’étape suivante.' };
  } else {
    r = reactTo(key, t, asked);
    if (!RX.skip.test(t) && !RX.unsure.test(t)) { iv.answers[key] = t; applyAnswer(key, t); }
  }
  if (r && r.follow) { iv.asked[key] = true; iv.msgs.push({ f: 'n', t: r.follow }); return; }
  iv.msgs.push({ f: 'n', t: (r && r.text) || step.react[0] });
  iv.step++;
  iv.msgs.push({ f: 'n', t: iv.step < INTERVIEW.length ? INTERVIEW[iv.step].q : summary() });
}
A.ivSend = async () => {
  const t = val('iv-in').trim(); if (!t || typing || ivDone()) return;
  const iv = st.interview; interviewMsgs();
  iv.msgs.push({ f: 'u', t });
  typing = true; ivRefresh();
  if (aiOn()) {
    try {
      const r = await aiInterview();
      applyUpdates(r.updates, 'Entretien');
      (r.services || []).forEach(s => { if (!s || !s.name || !(+s.price >= 0)) return; const ex = st.services.find(x => x.name.toLowerCase() === String(s.name).toLowerCase()); if (ex) ex.price = +s.price; else st.services.push({ id: uid(), name: uc(String(s.name)).slice(0, 80), price: +s.price, duration: +s.duration || 60 }); });
      iv.covered = Array.from(new Set([...(iv.covered || []), ...(r.covered || [])]));
      iv.step = Math.min(INTERVIEW.length - 1, iv.covered.length);
      iv.msgs.push({ f: 'n', t: r.reply });
      if (r.done) { iv.done = true; iv.step = INTERVIEW.length; }
      typing = false; ivRefresh(); return;
    } catch (e) { toast(aiError(e)); }
  }
  setTimeout(() => { typing = false; ruleTurn(t); ivRefresh(); }, 700);
};
A.ivSkip = () => {
  const iv = st.interview; if (ivDone() || typing) return; interviewMsgs();
  iv.msgs.push({ f: 'u', t: 'Je préfère passer.' });
  iv.msgs.push({ f: 'n', t: 'Pas de souci, vous pourrez compléter plus tard dans les Réglages.' });
  iv.step++; if (iv.covered) iv.covered.push(INTERVIEW[iv.step - 1].key);
  iv.msgs.push({ f: 'n', t: iv.step < INTERVIEW.length ? INTERVIEW[iv.step].q : summary() });
  if (iv.step >= INTERVIEW.length) iv.done = true;
  save(); refresh();
};
function applyAnswer(k, t) {
  const p = st.profile, clean = t.replace(/\s+/g, ' ').trim().replace(/[.!]+$/, '');
  if (['business', 'activity', 'city', 'target', 'problem', 'value', 'proof'].includes(k)) p[k] = k === 'business' || k === 'city' ? clean.slice(0, 60) : clean;
  if (k === 'activity') p.activity = uc(clean.replace(/^(je suis|je fais|je propose|je vends|je cr[ée]e|j[’']ai|moi c[’']est|c[’']est)\s+(une?\s+|des\s+|du\s+|de la\s+)?/i, '')).slice(0, 90);
  if (k === 'story') p.story = dot(clean);
  if (k === 'limits') p.limits = dot(clean);
  if (k === 'vibe') { p.vibe = clean; p.tone = /tutoi|\btu\b/i.test(t) && !/vouvoi/i.test(t) ? 'tu' : 'vous'; }
  if (k === 'prices') {
    let n = 0;
    String(t).split(/[,;\n/]|\s+et\s+|\s+puis\s+/i).forEach(chunk => {
      const m = chunk.match(/(\d{1,5}(?:[.,]\d{1,2})?)\s*(?:€|euros?|eur)(?![a-z])/i);
      if (!m) return;
      const price = parseFloat(m[1].replace(',', '.'));
      let name = chunk.replace(m[0], ' ').replace(/\b(à|a|pour|le|la|les|:|=)\s*$/i, '').replace(/^\s*(le|la|les|un|une|des|:|=)\s+/i, '').replace(/\s+(à|pour|:|=)\s*$/i, '').replace(/\s{2,}/g, ' ').trim();
      name = uc(name.replace(/[.:=]+$/, '').trim());
      if (!name || name.length < 2 || !(price > 0)) return;
      const ex = st.services.find(s => s.name.toLowerCase() === name.toLowerCase());
      if (ex) ex.price = price; else st.services.push({ id: uid(), name: name.slice(0, 80), price, duration: 60 });
      n++;
    });
    return n;
  }
}

VIEWS.bienvenue = () => {
  const e = +(route.q.e || 1), p = st.profile;
  const head = (n, t, d) => `<div class="onb-head"><div class="auth-logo">${LOGO}<span>anza</span></div><div class="onb-steps">${[1, 2, 3].map(i => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</div><p class="kick">Étape ${n} sur 3</p><h1>${t}</h1><p class="mute">${d}</p></div>`;
  const askKey = ownKeyAllowed() && has(3) && !aiOn() && !st.aiLater && !(st.interview.msgs || []).some(m => m.f === 'u');
  if (e === 1) return `<div class="onb">${head(1, `Bienvenue${p.first ? ' ' + esc(p.first) : ''} !`, askKey ? 'Avant de commencer, branchez Claude : c’est lui qui donnera à Nia toute son intelligence, dès la première question.' : 'Nia, votre brand manager, va vous poser quelques questions. Comptez une dizaine de minutes. Tout ce que vous direz servira à écrire vos contenus, vos devis et vos relances.')}<div class="card">${askKey ? connectBox('onb') : niaChat(true)}</div></div>`;
  if (e === 2) return `<div class="onb">${head(2, 'Vos prestations et vos prix', 'Ils servent pour vos devis, vos offres et votre landing page. Vous pourrez les modifier à tout moment.')}
    <div class="card"><div class="svc-list">${st.services.map((s, i) => `<div class="svc"><input value="${esc(s.name)}" data-i="set" data-path="services.${i}.name" aria-label="Prestation"><div class="eurin"><input type="number" step="0.5" min="0" value="${s.price}" data-i="set" data-num data-path="services.${i}.price" aria-label="Prix"><span>€</span></div><button class="x" data-a="svcDel" data-n="${i}" aria-label="Supprimer">×</button></div>`).join('') || '<p class="mute">Aucune prestation pour l’instant.</p>'}</div>
    <button class="btn sec" style="margin-top:12px" data-a="svcAdd">${ic('plus')}Ajouter une prestation</button></div>
    <div class="btns onb-nav"><a class="btn ghost" href="#/bienvenue?e=1">Retour</a><a class="btn pri" href="#/bienvenue?e=3">Continuer</a></div></div>`;
  return `<div class="onb">${head(3, 'Votre style', 'Vos couleurs et vos coordonnées. Tout ce qu’Anza produit les respectera.')}
    <div class="card"><div class="row" style="gap:18px">${[['primary', 'Principale'], ['accent', 'Accent'], ['soft', 'Douce'], ['ink', 'Texte']].map(([k, l]) => `<label style="text-align:center;font-size:12px;font-weight:600"><div class="swatch" style="margin:0 auto 6px"><input type="color" value="${st.brand[k]}" data-c="set" data-path="brand.${k}" aria-label="${l}"></div>${l}</label>`).join('')}</div>
    <div class="form" style="margin-top:20px"><div class="field"><label>Vous ou tu</label><div class="seg">${[['vous', 'Vouvoiement'], ['tu', 'Tutoiement']].map(([k, l]) => `<button class="${p.tone === k ? 'on' : ''}" data-a="setTone" data-t="${k}">${l}</button>`).join('')}</div></div>
    <div class="grid g2"><div class="field"><label for="o-fn">Votre prénom</label><input id="o-fn" value="${esc(p.first)}" data-i="onbName"></div><div class="field"><label for="o-ln">Nom complet</label><input id="o-ln" value="${esc(p.name)}" data-i="set" data-path="profile.name"></div></div>
    <div class="grid g2"><div class="field"><label for="o-ig">Compte Instagram</label><input id="o-ig" value="${esc(p.instagram)}" placeholder="sans le @" data-i="set" data-path="profile.instagram"></div><div class="field"><label for="o-ph">Téléphone professionnel</label><input id="o-ph" value="${esc(p.phone)}" data-i="set" data-path="profile.phone"></div></div>
    <div class="field"><label for="o-cta">Texte de vos boutons</label><input id="o-cta" value="${esc(p.cta)}" placeholder="Réserver" data-i="set" data-path="profile.cta"></div></div></div>
    <div class="btns onb-nav"><a class="btn ghost" href="#/bienvenue?e=2">Retour</a><button class="btn pri" data-a="onbDone">C’est parti</button></div></div>`;
};
AFTER.bienvenue = AFTER.nia;
I.onbName = el => { const p = st.profile; if (!p.name || p.name === p.first) { p.name = el.value; const n = $('#o-ln'); if (n) n.value = el.value; } p.first = el.value; save(); };
A.onbDone = () => { st.onboarded = true; planMonth(); save(); toast('Votre espace est prêt'); go('#/accueil'); };

function currentWeeklyQ() { return st.weeklyQ && st.weeklyQ.week === weekKey() ? st.weeklyQ : { q: WEEKLY_Q[weekIndex()], why: '' }; }
function changesHTML(c) {
  if (!c) return '';
  const rows = [];
  (c.fields || []).forEach(f => rows.push(`<li><b>Profil mis à jour</b>${esc(FIELD_LABEL[f.k] || f.k)} : ${esc(f.v)}</li>`));
  (c.events || []).forEach(e => rows.push(`<li><b>Planifié le ${fdateL(e.date)}</b>${esc(e.title)}</li>`));
  (c.memory || []).forEach(m => rows.push(`<li><b>Nia retient</b>${esc(m)}</li>`));
  if (c.focus) rows.push(`<li><b>Focus de la semaine</b>${esc(c.focus)}</li>`);
  return rows.length ? `<div class="card" style="margin-top:16px"><h3>Ce que Nia a changé <a class="btn ghost sm" href="#/calendrier">Voir le calendrier</a></h3><ul class="learn" style="margin-top:8px">${rows.join('')}</ul></div>` : '';
}
VIEWS.semaine = () => {
  const cq = currentWeeklyQ(), done = weeklyDone(), last = st.weekly[0];
  const q = done ? last.q : cq.q;
  return `<div class="head"><div><p class="kick">Nia, tous les 7 jours</p><h1>La question de la semaine</h1><p>Deux minutes, une fois par semaine. Votre réponse change vraiment ce que Nia fait pour vous : profil, mémoire et prochaines publications.</p></div></div>
  <div class="grid g21"><div><div class="card"><div class="row" style="flex-wrap:nowrap"><div class="av nia">N</div><b>Nia</b> ${aiBadge()}</div>
    <div class="chat" style="margin-top:14px">${weekLoading ? '<div class="msg n typing"><i></i><i></i><i></i></div>' : `<div class="msg n">${esc(q)}</div>`}
    ${done ? `<div class="msg u">${esc(last.a)}</div><div class="msg n">${esc(last.idea)}</div>` : ''}${typing && !done ? '<div class="msg n typing"><i></i><i></i><i></i></div>' : ''}</div>
    ${done ? `<div class="btns" style="margin-top:14px"><a class="btn sec" href="#/journal">Voir le journal</a></div>` :
      `<div class="compose"><textarea id="wk-in" placeholder="Votre réponse, comme elle vient" data-enter="wkSend" aria-label="Votre réponse"></textarea><button class="btn pri" data-a="wkSend" style="height:auto" aria-label="Envoyer">${ic('send')}</button></div><p class="mute" style="font-size:12px;margin-top:8px">Vos réponses restent privées. Rien n’est publié sans votre accord, ni sans celui des personnes dont vous parlez.</p>`}
  </div>${done ? changesHTML(last.changes) : ''}</div>
  <div class="card" style="align-self:start"><h3>Pourquoi cette question ?</h3><p class="mute" style="margin-top:10px">${esc(cq.why || 'Les contenus qui marchent le mieux parlent de ce que vous vivez vraiment. Chaque réponse affine votre profil et devient une publication planifiée.')}</p>
  <div class="tip" style="margin-top:16px"><i>${st.weekly.length}</i><div>${plural(st.weekly.length, 'réponse', 'réponses')} depuis le début. ${st.focus ? `Focus actuel : <b>${esc(st.focus)}</b>.` : ''}</div></div></div></div>`;
};
let weekLoading = false;
AFTER.semaine = async () => {
  if (!aiOn() || weeklyDone() || weekLoading || (st.weeklyQ && st.weeklyQ.week === weekKey())) return;
  weekLoading = true; refresh();
  try { const r = await aiWeeklyQuestion(); st.weeklyQ = { week: weekKey(), q: r.question, why: r.why || '' }; save(); } catch (e) {}
  weekLoading = false; if (route.name === 'semaine') refresh();
};
A.wkSend = async () => {
  const t = val('wk-in').trim(); if (!t || typing) return;
  const q = currentWeeklyQ().q;
  typing = true; refresh();
  let r = null, src = 'Question de la semaine';
  if (aiOn()) { try { r = await aiWeeklyAnswer(q, t); } catch (e) { toast(aiError(e)); } }
  if (!r) r = weeklyImpact(q, t);
  const fields = applyUpdates(r.updates, src).map(k => ({ k, v: st.profile[k] }));
  addMemory(r.memory, src);
  const events = addActions(r.actions, src).map(e => ({ date: e.date, title: e.title }));
  if (r.focus) st.focus = r.focus;
  st.weekly.unshift({ date: iso(Date.now()), q, a: t, idea: r.reply, changes: { fields, events, memory: r.memory || [], focus: r.focus || '' } });
  typing = false; save(); toast('Nia a mis à jour votre stratégie'); refresh();
};

VIEWS.journal = () => {
  const p = st.profile, ev = st.evolution || [], mem = (st.memory || []).slice().reverse();
  return `<div class="head"><div><p class="kick">Nia</p><h1>Le journal</h1><p>Vos réponses, ce que Nia retient de vous, et comment votre positionnement évolue.</p></div></div>
  <div class="grid g21"><div class="grid" style="align-content:start"><div class="card"><h3>Vos réponses</h3><ul class="list" style="margin-top:8px">${st.weekly.map(w => `<li style="align-items:flex-start"><div class="av nia" style="width:30px;height:30px;font-size:12px">N</div><div class="grow"><small>${fdateL(w.date)}</small><b style="white-space:normal;margin-top:2px">${esc(w.q)}</b><p style="margin-top:6px">${esc(w.a)}</p><p class="mute" style="margin-top:6px;font-size:13px">${esc(w.idea)}</p>${w.changes && w.changes.events && w.changes.events.length ? `<p style="margin-top:6px;font-size:13px">${w.changes.events.map(e => `<span class="tag" style="margin:2px 4px 0 0">${fdate(e.date)} · ${esc(e.title.slice(0, 40))}</span>`).join('')}</p>` : ''}</div></li>`).join('') || '<li class="mute">Pas encore de réponse.</li>'}</ul></div>
  <div class="card"><h3>Évolution de votre profil</h3><ul class="list" style="margin-top:8px">${ev.slice(0, 20).map(e => `<li style="align-items:flex-start"><div class="grow"><small>${fdate(e.date)} · ${esc(e.source)}</small><b style="white-space:normal">${esc(FIELD_LABEL[e.field] || e.field)}</b><p style="margin-top:4px;font-size:14px">${esc(e.to)}</p></div></li>`).join('') || '<li class="mute">Le profil évoluera au fil de vos réponses.</li>'}</ul></div></div>
  <div class="grid" style="align-content:start"><div class="card dark"><h3>Votre positionnement</h3><p style="margin-top:12px;line-height:1.55">${esc(summary())}</p>${st.focus ? `<p style="margin-top:12px" class="mute">Focus du moment : ${esc(st.focus)}</p>` : ''}</div>
  <div class="card"><h3>Ce que Nia retient</h3><ul class="learn" style="margin-top:8px">${mem.slice(0, 12).map(m => `<li><b>${fdate(m.date)}</b>${esc(m.text)}</li>`).join('') || '<li class="mute">Rien pour l’instant.</li>'}</ul></div></div></div>`;
};

let gen = null;
VIEWS.stories = () => {
  const type = route.q.type || (gen && gen.type) || 'Offre', style = (gen && gen.style) || 'Bleu', subj = route.q.subj != null ? route.q.subj : (gen && gen.subj) || '';
  if (!gen || gen.type !== type || route.q.subj != null && gen.subj !== subj) gen = { type, style, subj, frames: storyFrames(type, subj) };
  const c = palette(gen.style);
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Séquenceur de stories</h1><p>Une idée, un type d’histoire : Anza écrit six stories qui racontent et qui vendent, dans votre ton. Cliquez sur un texte pour le modifier.</p></div>
  <div class="btns"><button class="btn sec" data-a="storyCal">${ic('cal')}Planifier</button><button class="btn pri" data-a="storyDl">${ic('dl')}Télécharger les images</button></div></div>
  <div class="grid g12"><div class="card"><div class="form">
    <div class="field"><label>Type d’histoire</label><div class="seg">${STORY_TYPES.map(t => `<button class="${gen.type === t ? 'on' : ''}" data-a="storyType" data-t="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label for="sj">Sujet ou détail</label><input id="sj" value="${esc(gen.subj)}" placeholder="${gen.type === 'Preuve' ? 'Prénom du client' : 'Exemple : places du mois de mars'}"><small>Facultatif. Laissez vide pour la version de base.</small></div>
    <div class="field"><label>Style</label><div class="seg">${['Bleu', 'Nuit', 'Clair'].map(t => `<button class="${gen.style === t ? 'on' : ''}" data-a="storyStyle" data-t="${t}">${t}</button>`).join('')}</div></div>
    <button class="btn pri" data-a="storyGen" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : aiOn() ? 'Écrire avec Nia' : 'Écrire la séquence'}</button>
    <div class="tip"><i>N</i><div>${st.profile.value ? `Nia s’appuie sur votre promesse : « ${esc(st.profile.value)} ».` : 'Faites l’entretien avec Nia pour des textes vraiment personnalisés.'}</div></div></div></div>
  <div class="card ${busy ? 'loading' : ''}"><h3>Votre séquence <small>${gen.frames.length} stories ${gen.ai ? '· écrite par Nia avec ' + AI_NAME : ''}</small></h3><div class="frames" style="margin-top:14px">${gen.frames.map((f, i) => `<div class="frame" style="background:${c.bg};color:${c.fg};font-family:${fontFam()}"><div class="bars2">${gen.frames.map((x, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div><p class="who">${esc(P().handle)}</p><span class="num">${i + 1}</span>
  <p class="ft" contenteditable="true" data-i="frameEdit" data-n="${i}" data-k="t">${esc(f.t)}</p>${f.s ? `<p class="fs" contenteditable="true" data-i="frameEdit" data-n="${i}" data-k="s">${esc(f.s)}</p>` : ''}${f.c ? `<p class="fc" style="background:${c.cb};color:${c.cf}">${esc(f.c)}</p>` : ''}</div>`).join('')}</div></div></div>`;
};
A.storyType = el => { gen.type = el.dataset.t; gen.subj = val('sj'); gen.frames = storyFrames(gen.type, gen.subj); history.replaceState(null, '', '#/stories'); route.q = {}; refresh(); };
A.storyStyle = el => { gen.style = el.dataset.t; refresh(); };
A.storyGen = async () => {
  if (busy) return; gen.subj = val('sj'); history.replaceState(null, '', '#/stories'); route.q = {};
  if (aiOn()) { busy = true; refresh(); try { gen.frames = await aiStory(gen.type, gen.subj); gen.ai = true; busy = false; refresh(); toast('Séquence écrite par Nia'); return; } catch (e) { busy = false; toast(aiError(e)); } }
  gen.frames = storyFrames(gen.type, gen.subj); gen.ai = false; refresh(); toast('Séquence écrite');
};
I.frameEdit = el => { gen.frames[+el.dataset.n][el.dataset.k] = el.textContent; };
A.storyDl = () => {
  if (!st.storyMade) { st.storyMade = true; save(); }
  const imgs = gen.frames.map((f, i) => drawStory(f, i, gen.frames.length, gen.style));
  showImages(imgs, `story-${gen.type.toLowerCase().replace(/\s/g, '-')}`, '9/16');
};
A.storyCal = () => planModal('Story', gen.type, 'Story ' + gen.type.toLowerCase() + ', ' + gen.frames[0].t);
function showImages(imgs, base, ratio) {
  window._imgs = { imgs, base };
  modal('Vos images', `<p class="mute" style="margin-bottom:14px">Format prêt pour Instagram et LinkedIn. Cliquez sur une image pour la télécharger.</p><div class="frames">${imgs.map((d, i) => `<a href="${d}" download="${base}-${i + 1}.png" data-keep="1" style="aspect-ratio:${ratio};border-radius:12px;overflow:hidden;display:block"><img src="${d}" alt="Image ${i + 1}" style="width:100%;height:100%;object-fit:cover"></a>`).join('')}</div><div class="btns" style="margin-top:16px;justify-content:flex-end"><button class="btn pri" data-a="dlAll">${ic('dl')}Tout télécharger</button></div>`, true);
}
A.dlAll = () => { const { imgs, base } = window._imgs; imgs.forEach((d, i) => setTimeout(() => download(`${base}-${i + 1}.png`, d), i * 350)); };
function planModal(type, angle, title, pick) {
  window._plan = { type, angle, title, pick: !!pick };
  const kinds = [['Story', 'Story'], ['Carrousel', 'Carrousel Instagram'], ['LinkedIn', 'Post LinkedIn']];
  const angles = Array.from(new Set([...STORY_TYPES, ...ANGLES]));
  modal(pick ? 'Ajouter une publication' : 'Planifier', `<div class="form">${pick ? `<div class="grid g2"><div class="field"><label for="pl-k">Type</label><select id="pl-k">${kinds.map(([k, l]) => `<option value="${k}" ${k === type ? 'selected' : ''}>${l}</option>`).join('')}</select></div><div class="field"><label for="pl-a">Angle</label><select id="pl-a">${angles.map(a => `<option ${a === angle ? 'selected' : ''}>${a}</option>`).join('')}</select></div></div>` : ''}<div class="field"><label for="pl-t">${pick ? 'Sujet' : 'Titre'}</label><input id="pl-t" value="${esc(title)}" placeholder="${pick ? 'Par exemple : mes créneaux de la semaine' : ''}"></div><div class="field"><label for="pl-d">Date de publication</label><input id="pl-d" type="date" value="${nextFreeDate(Date.now() + DAY)}" min="${iso(Date.now())}"></div><div class="btns" style="justify-content:flex-end"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="planSave">Ajouter au calendrier</button></div></div>`);
}
A.planSave = () => {
  const p = window._plan || {}, date = val('pl-d'), raw = val('pl-t').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) { toast('Choisissez une date'); return; }
  const type = p.pick ? val('pl-k') || 'Story' : p.type || 'Story', angle = p.pick ? val('pl-a') || 'Offre' : p.angle || 'Offre';
  const label = type === 'LinkedIn' ? 'Post LinkedIn' : type;
  const title = p.pick ? `${label}, ${raw || angle.toLowerCase()}` : (raw || `${label}, ${angle.toLowerCase()}`);
  st.calendar.push({ id: uid(), date, type, angle, title, done: false });
  save(); closeModal(); toast('Ajouté au calendrier le ' + fdateL(date));
  if (route.name === 'calendrier' || route.name === 'accueil') refresh();
};

let pgen = null;
VIEWS.posts = () => {
  if (!pgen) pgen = { net: 'Instagram', format: 'Carrousel', angle: 'Erreurs', subj: '', style: 'Bleu' };
  if (route.q.angle) { pgen.angle = route.q.angle; pgen.net = route.q.net || pgen.net; if (route.q.subj) pgen.subj = route.q.subj; pgen.ai = false; }
  const key = [pgen.net, pgen.format, pgen.angle, pgen.subj, st.profile.tone].join('|');
  if (!pgen.out || pgen.key !== key) { pgen.out = postContent(pgen.net, pgen.format, pgen.angle, pgen.subj); pgen.key = key; }
  const out = pgen.out, font = fontFam();
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Carrousels et posts</h1><p>Pour Instagram et LinkedIn, à votre charte et dans votre ton. Choisissez un angle, Anza écrit les slides et la légende. Cliquez sur un texte pour le modifier.</p></div>
  <div class="btns"><button class="btn sec" data-a="postCal">${ic('cal')}Planifier</button><button class="btn pri" data-a="postDl">${ic('dl')}Télécharger ${out.slides.length > 1 ? 'les slides' : 'l’image'}</button></div></div>
  <div class="grid g12"><div class="card"><div class="form">
    <div class="field"><label>Réseau</label><div class="seg">${['Instagram', 'LinkedIn'].map(t => `<button class="${pgen.net === t ? 'on' : ''}" data-a="pSet" data-k="net" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label>Format</label><div class="seg">${['Carrousel', 'Post'].map(t => `<button class="${pgen.format === t ? 'on' : ''}" data-a="pSet" data-k="format" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label>Angle</label><div class="seg">${ANGLES.map(t => `<button class="${pgen.angle === t ? 'on' : ''}" data-a="pSet" data-k="angle" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label for="psj">Titre personnalisé</label><input id="psj" value="${esc(pgen.subj)}" placeholder="Laissez vide pour la proposition de Nia"></div>
    <div class="field"><label>Style</label><div class="seg">${['Bleu', 'Nuit', 'Clair'].map(t => `<button class="${pgen.style === t ? 'on' : ''}" data-a="pStyle" data-v="${t}">${t}</button>`).join('')}</div></div>
    <button class="btn pri" data-a="pGen" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : aiOn() ? 'Écrire avec Nia' : 'Réécrire'}</button>
    ${pgen.angle === 'Preuve' ? '<div class="tip"><i>!</i><div>Collez les vrais mots de vos clients dans les slides, avec leur accord.</div></div>' : ''}</div></div>
  <div class="grid" style="align-content:start"><div class="card ${busy ? 'loading' : ''}"><h3>Slides <small>${out.slides.length} ${pgen.ai ? '· écrites par Nia avec ' + AI_NAME : ''}</small></h3><div class="slides" style="margin-top:14px">${out.slides.map((s, i) => { const c = palette(i === 0 ? pgen.style : (i % 2 ? 'Clair' : pgen.style)); return `<div class="slide" style="background:${c.bg};color:${c.fg};font-family:${font}"><small>${esc(s.k)}</small><b contenteditable="true" data-i="slideEdit" data-n="${i}" data-k="t">${esc(s.t)}</b><p contenteditable="true" data-i="slideEdit" data-n="${i}" data-k="p">${esc(s.p)}</p></div>`; }).join('')}</div></div>
  <div class="card"><h3>Légende ${pgen.net} <button class="btn sec sm" data-a="copyCap">${ic('copy')}Copier</button></h3><textarea class="caption" id="cap" data-i="capEdit" style="width:100%;border:0;min-height:260px;margin-top:12px;font:inherit">${esc(out.caption)}</textarea></div></div></div>`;
};
A.pSet = el => { pgen[el.dataset.k] = el.dataset.v; pgen.ai = false; pgen.subj = val('psj'); history.replaceState(null, '', '#/posts'); route.q = {}; refresh(); };
A.pStyle = el => { pgen.style = el.dataset.v; refresh(); };
A.pGen = async () => {
  if (busy) return; pgen.subj = val('psj'); history.replaceState(null, '', '#/posts'); route.q = {};
  if (aiOn()) { busy = true; refresh(); try { const r = await aiPost(pgen.net, pgen.format, pgen.angle, pgen.subj); pgen.out = { slides: r.slides.map(x => ({ k: x.k || '', t: x.t || '', p: x.p || '' })), caption: r.caption || '' }; pgen.key = [pgen.net, pgen.format, pgen.angle, pgen.subj, st.profile.tone].join('|'); pgen.ai = true; busy = false; refresh(); toast('Contenu écrit par Nia'); return; } catch (e) { busy = false; toast(aiError(e)); } }
  pgen.key = null; pgen.ai = false; refresh(); toast('Contenu réécrit');
};
I.slideEdit = el => { pgen.out.slides[+el.dataset.n][el.dataset.k] = el.textContent; };
I.capEdit = el => { pgen.out.caption = el.value; };
A.copyCap = () => copyText(pgen.out.caption);
A.postDl = () => { const s = pgen.out.slides; showImages(s.map((x, i) => drawSlide(x, i, s.length, pgen.style)), `${pgen.net.toLowerCase()}-${pgen.angle.toLowerCase()}`, '4/5'); };
A.postCal = () => planModal(pgen.net === 'LinkedIn' ? 'LinkedIn' : pgen.format === 'Carrousel' ? 'Carrousel' : 'Story', pgen.angle, (pgen.net === 'LinkedIn' ? 'Post LinkedIn, ' : 'Carrousel, ') + pgen.out.slides[0].t);

VIEWS.calendrier = () => {
  const start = mondayOf(Date.now()), today = iso(Date.now());
  const days = Array.from({ length: 28 }, (_, i) => new Date(start.getTime() + i * DAY));
  const done = st.calendar.filter(e => e.done).length;
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Calendrier de publication</h1><p>Quatre semaines planifiées : quoi publier, quel jour, avec le contenu déjà prêt. Cliquez sur une publication pour l’ouvrir.</p></div>
  <div class="btns"><span class="tag fidele" style="font-size:13px;padding:8px 12px">${done} publiées</span><button class="btn sec" data-a="calAdd">${ic('plus')}Ajouter</button><button class="btn pri" data-a="calPlan">${ic('spark')}Planifier mes 4 semaines</button></div></div>
  <div class="cal">${['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'].map(d => `<div class="dh">${d}</div>`).join('')}
  ${days.map(d => { const k = iso(d), ev = st.calendar.filter(e => e.date === k); return `<div class="d ${k === today ? 'today' : ''} ${k < today ? 'past' : ''} ${!ev.length && k < today ? 'pad' : ''} ${ev.length ? 'has' : ''}"><span>${DAYS[d.getDay()]} ${d.getDate()}</span>${ev.map(e => `<button class="ev ${e.type} ${e.done ? 'done' : ''}" data-a="calOpen" data-id="${e.id}">${esc(e.type === 'LinkedIn' ? 'LinkedIn' : e.type)} · ${esc(e.title.split(', ').slice(1).join(', ') || e.title)}</button>`).join('')}</div>`; }).join('')}</div>
  <div class="row" style="margin-top:14px;gap:14px;font-size:13px">${[['Story', 'Story'], ['Carrousel', 'Carrousel'], ['LinkedIn', 'Post LinkedIn'], ['Bilan', 'Bilan du mois']].map(([k, l]) => `<span class="ev ${k}" style="width:auto">${l}</span>`).join('')}</div>`;
};
A.calPlan = () => { const n = planMonth(); save(); toast(n ? `${plural(n, 'publication planifiée', 'publications planifiées')}` : 'Vos 4 semaines sont déjà planifiées'); refresh(); };
A.calAdd = () => planModal('Story', 'Offre', '', true);
A.calOpen = el => {
  const e = st.calendar.find(x => x.id === el.dataset.id); window._ev = e;
  const sj = encodeURIComponent(e.brief || ''), link = e.type === 'Story' ? `#/stories?type=${encodeURIComponent(STORY_TYPES.includes(e.angle) ? e.angle : 'Offre')}&subj=${sj}` : e.type === 'Bilan' ? '#/bilan' : `#/posts?angle=${encodeURIComponent(ANGLES.includes(e.angle) ? e.angle : 'Conseils')}&net=${e.type === 'LinkedIn' ? 'LinkedIn' : 'Instagram'}&subj=${sj}`;
  modal(esc(e.type === 'LinkedIn' ? 'Post LinkedIn' : e.type), `<div class="form"><div class="field"><label for="ev-t">Titre</label><input id="ev-t" value="${esc(e.title)}"></div><div class="field"><label for="ev-d">Date</label><input id="ev-d" type="date" value="${e.date}"></div>${e.brief ? `<div class="tip"><i>N</i><div><b>L’idée de Nia</b><br>${esc(e.brief)}</div></div>` : ''}
  <label class="row"><input type="checkbox" id="ev-done" ${e.done ? 'checked' : ''}> Publiée</label>
  <div class="btns" style="justify-content:space-between"><button class="btn danger" data-a="evDel">Supprimer</button><div class="btns"><a class="btn sec" href="${link}" data-a="close" data-keep="1">Ouvrir le contenu</a><button class="btn pri" data-a="evSave">Enregistrer</button></div></div></div>`);
};
A.evSave = () => {
  const e = window._ev; const was = e.done;
  Object.assign(e, { title: val('ev-t'), date: val('ev-d'), done: $('#ev-done').checked });
  if (e.done && !was) st.perf.push({ id: uid(), date: e.date, type: e.type === 'LinkedIn' ? 'Post LinkedIn' : e.type, angle: e.angle || 'Offre', title: e.title.split(', ').slice(1).join(', ') || e.title, views: 0, messages: 0 });
  save(); closeModal(); toast('Publication enregistrée'); refresh();
};
A.evDel = () => { st.calendar = st.calendar.filter(x => x.id !== window._ev.id); save(); closeModal(); refresh(); };

let hideAmounts = false;
VIEWS.bilan = () => {
  const now = new Date(), cur = monthRevenue(0), prev = monthRevenue(1);
  const m = now.getMonth(), y = now.getFullYear();
  const inMonth = d => { const x = new Date(d); return x.getMonth() === m && x.getFullYear() === y; };
  const newC = st.clients.filter(c => inMonth(c.createdAt)).length;
  const visits = st.clients.reduce((a, c) => a + c.history.filter(h => h.amount > 0 && inMonth(h.date)).length, 0);
  const acc = st.quotes.filter(q => q.status === 'accepte' && inMonth(q.date)).length;
  const best = st.perf.slice().sort((a, b) => b.messages - a.messages)[0];
  const frames = [
    { t: `Ce mois chez ${P().business}.`, s: MONTHS_FULL[m].charAt(0).toUpperCase() + MONTHS_FULL[m].slice(1) + ' en quelques chiffres.' },
    { t: `${plural(visits, 'prestation', 'prestations')}.`, s: 'Merci pour votre confiance.' },
    { t: `${plural(newC, 'nouveau client', 'nouveaux clients')}.`, s: 'Bienvenue à vous.' },
    { t: hideAmounts ? (cur.v >= prev.v ? 'Un mois en hausse.' : 'Un mois solide.') : `${eur(cur.v)} de chiffre.`, s: hideAmounts ? 'Grâce à vous.' : 'Une activité qui grandit, grâce à vous.' },
    { t: best ? `La story préférée : ${best.title}.` : 'Votre story préférée ?', s: 'Dites moi ce que vous voulez voir le mois prochain.' },
    { t: 'Le mois prochain, on continue.', s: 'Les créneaux sont ouverts.', c: st.profile.cta || 'Réserver' }
  ];
  window._bilan = frames;
  const c = palette('Nuit');
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Le bilan du mois</h1><p>Le dernier jour du mois, vos chiffres deviennent une séquence « ce mois chez nous », prête à publier.</p></div>
  <div class="btns"><label class="row" style="font-size:14px;font-weight:600"><input type="checkbox" ${hideAmounts ? 'checked' : ''} data-c="hideAmounts"> Masquer les montants</label><button class="btn pri" data-a="bilanDl">${ic('dl')}Télécharger</button></div></div>
  <div class="grid g4"><div class="card kpi"><p>Chiffre d’affaires</p><strong>${eur(cur.v)}</strong></div><div class="card kpi"><p>Prestations</p><strong>${visits}</strong></div><div class="card kpi"><p>Nouveaux clients</p><strong>${newC}</strong></div><div class="card kpi"><p>Devis acceptés</p><strong>${acc}</strong></div></div>
  <div class="card" style="margin-top:16px"><h3>La séquence</h3><div class="frames" style="margin-top:14px">${frames.map((f, i) => `<div class="frame" style="background:${c.bg};color:${c.fg}"><div class="bars2">${frames.map((x, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div><p class="who">${esc(P().handle)}</p><p class="ft">${esc(f.t)}</p><p class="fs">${esc(f.s)}</p>${f.c ? `<p class="fc" style="background:${c.cb};color:${c.cf}">${esc(f.c)}</p>` : ''}</div>`).join('')}</div></div>`;
};
C.hideAmounts = el => { hideAmounts = el.checked; refresh(); };
A.bilanDl = () => { const f = window._bilan; showImages(f.map((x, i) => drawStory(x, i, f.length, 'Nuit')), 'bilan-du-mois', '9/16'); };

let bioIdx = 0;
VIEWS.charte = () => {
  const b = st.brand, p = st.profile, list = st.aiBios && st.aiBios.bios && st.aiBios.bios.length ? st.aiBios.bios : bios(), bio = list[bioIdx % list.length], li = st.aiBios && st.aiBios.linkedin ? st.aiBios.linkedin : linkedinHeadline();
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Charte et bio</h1><p>Vos couleurs, votre police et votre ton, enregistrés une fois. Tout ce qu’Anza produit les respecte.</p></div></div>
  <div class="grid g2"><div class="card"><h3>Couleurs</h3><div class="row" style="margin-top:14px;gap:18px">${[['primary', 'Principale'], ['accent', 'Accent'], ['soft', 'Douce'], ['ink', 'Texte']].map(([k, l]) => `<label style="text-align:center;font-size:12px;font-weight:600"><div class="swatch" style="margin:0 auto 6px"><input type="color" value="${b[k]}" data-c="set" data-path="brand.${k}" data-live="1" aria-label="${l}"></div>${l}</label>`).join('')}</div>
    <div class="form" style="margin-top:20px"><div class="field"><label>Police</label><div class="seg">${['Inter', 'Serif'].map(f => `<button class="${b.font === f ? 'on' : ''}" data-a="setFont" data-f="${f}" style="font-family:${f === 'Serif' ? 'Georgia,serif' : 'Inter'}">${f === 'Serif' ? 'Élégante' : 'Moderne'}</button>`).join('')}</div></div>
    <div class="field"><label>Vous ou tu</label><div class="seg">${[['vous', 'Vouvoiement'], ['tu', 'Tutoiement']].map(([k, l]) => `<button class="${p.tone === k ? 'on' : ''}" data-a="setTone" data-t="${k}">${l}</button>`).join('')}</div></div>
    <label class="row"><input type="checkbox" ${b.emoji ? 'checked' : ''} data-c="set" data-path="brand.emoji"> Utiliser des emojis</label>
    <div class="field"><label for="cta">Bouton d’action</label><input id="cta" value="${esc(p.cta || '')}" data-i="set" data-path="profile.cta"></div></div>
    <div class="prev3">${['Bleu', 'Nuit', 'Clair'].map(s => { const c = palette(s); return `<div style="aspect-ratio:9/16;border-radius:12px;background:${c.bg};color:${c.fg};padding:12px;display:flex;flex-direction:column;font-family:${b.font === 'Serif' ? 'Georgia,serif' : 'Inter'}"><b style="margin-top:auto;font-size:15px;line-height:1.1">${esc(p.value)}.</b><span style="margin-top:8px;border-radius:12px;background:${c.cb};color:${c.cf};font-size:10px;font-weight:700;text-align:center;padding:6px">${esc(p.cta || 'Réserver')}</span></div>`; }).join('')}</div></div>
  <div class="grid" style="align-content:start"><div class="card"><h3>Bio Instagram <div class="btns">${aiOn() ? `<button class="btn ghost sm" data-a="bioAI" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : 'Écrire avec Nia'}</button>` : ''}<button class="btn ghost sm" data-a="bioNext">Autre version</button><button class="btn sec sm" data-a="copyBio">${ic('copy')}Copier</button></div></h3>
    <div class="bio" style="margin-top:14px"><div class="igh"><div class="ring"><div>${initials(p.business)}</div></div><div><b>${esc(p.instagram)}</b><div class="mute" style="font-size:13px">${esc(p.business)}</div></div></div><p style="white-space:pre-line;margin-top:12px;font-size:14px">${esc(bio)}</p><p style="color:var(--navy);font-weight:600;font-size:14px;margin-top:4px">Votre lien en bio</p></div>
    <p class="mute" style="font-size:12px;margin-top:8px">${bio.length} caractères sur 150</p></div>
    <div class="card"><h3>Titre LinkedIn <button class="btn sec sm" data-a="copyLi">${ic('copy')}Copier</button></h3><p style="margin-top:12px;font-weight:600">${esc(li)}</p></div></div></div>`;
};
A.setFont = el => { st.brand.font = el.dataset.f; save(); refresh(); };
A.setTone = el => { st.profile.tone = el.dataset.t; save(); refresh(); };
A.bioNext = () => { bioIdx++; refresh(); };
A.copyBio = () => { const l = st.aiBios && st.aiBios.bios && st.aiBios.bios.length ? st.aiBios.bios : bios(); copyText(l[bioIdx % l.length]); };
A.copyLi = () => copyText(st.aiBios && st.aiBios.linkedin ? st.aiBios.linkedin : linkedinHeadline());
A.bioAI = async () => { if (busy) return; busy = true; refresh(); try { const r = await aiBios(); st.aiBios = { bios: (r.bios || []).filter(Boolean).slice(0, 3), linkedin: r.linkedin || '' }; bioIdx = 0; save(); toast('Bios écrites par Nia'); } catch (e) { toast(aiError(e)); } busy = false; refresh(); };

let lp = null;
function lpDefault() { const q = P(); return { headline: uc(q.value), sub: `${uc(q.activity)}, ${q.city}. ${dot(q.proof)}`, cta: st.profile.phone ? 'Réserver sur WhatsApp' : 'Me contacter' }; }
VIEWS.landing = () => {
  if (!has(2)) return lockView(2, 'La mini landing page est dans la Boutique', 'Une page à votre image, prête à recevoir vos demandes de rendez vous. Incluse dans la Boutique et le Magasin.');
  if (!lp) lp = st.lp ? Object.assign({}, st.lp) : lpDefault();
  return `<div class="head"><div><p class="kick">Boutique</p><h1>Votre mini landing page</h1><p>Construite à partir de votre profil, de votre charte et de vos prestations. Mettez la en lien dans votre bio.</p></div>
  <div class="btns">${aiOn() ? `<button class="btn sec" data-a="lpAI" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : 'Écrire avec Nia'}</button>` : ''}<button class="btn sec" data-a="lpOpen">Ouvrir en grand</button><button class="btn pri" data-a="lpDl">${ic('dl')}Télécharger le fichier</button></div></div>
  <div class="grid g12"><div class="card"><div class="form"><div class="field"><label for="lp-h">Titre</label><input id="lp-h" value="${esc(lp.headline)}" data-i="lp" data-k="headline"></div><div class="field"><label for="lp-s">Sous titre</label><textarea id="lp-s" data-i="lp" data-k="sub">${esc(lp.sub)}</textarea></div><div class="field"><label for="lp-c">Bouton</label><input id="lp-c" value="${esc(lp.cta)}" data-i="lp" data-k="cta"></div>
  <div class="tip"><i>✓</i><div>Les prestations viennent de vos réglages, les couleurs de votre charte. Le bouton ouvre WhatsApp avec un message prêt.</div></div></div></div>
  ${lpOfferCard()}
  <div class="lp-frame"><div class="lp-bar"><i></i><i></i><i></i><span>Aperçu de votre page</span></div><iframe id="lpf" title="Aperçu de la landing page" style="width:100%;height:620px;border:0;display:block"></iframe></div></div>`;
};
AFTER.landing = () => { const f = $('#lpf'); if (f) f.srcdoc = landingHTML(lp); if (aiOn() && has(2) && !busy && !(st.lp && st.lp.ai) && !autoTried.lp) { autoTried.lp = true; A.lpAI(); } };
const autoTried = {};
I.lp = el => { lp[el.dataset.k] = el.value; st.lp = Object.assign({}, lp); save(); clearTimeout(window._lpt); window._lpt = setTimeout(AFTER.landing, 250); };
A.lpAI = async () => { if (busy) return; busy = true; refresh(); try { const r = await aiLanding(); lp = { headline: r.headline || lp.headline, sub: r.sub || lp.sub, cta: r.cta || lp.cta }; st.lp = Object.assign({ ai: true }, lp); save(); toast('Textes écrits par Nia avec Claude'); } catch (e) { toast(aiError(e)); } busy = false; refresh(); };
function lpCode() {
  const id = (ONLINE && user ? user.id : (st.localId || (st.localId = uid()))).replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase();
  return 'AZ' + (plan === 'magasin' ? 'M' : 'B') + id;
}
function lpWaLink() {
  let n = String(CFG.landingWhatsapp || '').replace(/\D/g, ''); if (/^0\d{9}$/.test(n)) n = '33' + n.slice(1); if (/^330\d{9}$/.test(n)) n = '33' + n.slice(3);
  if (!n) return '';
  const p = st.profile, f = PLAN_NAME[plan] || 'La Boutique';
  const msg = `Bonjour SC Project ! Je suis client Anza, formule ${f}, et je souhaite ma landing page personnalisée offerte.\n\nActivité : ${p.business || 'à préciser'}${p.activity ? ', ' + p.activity : ''}${p.city ? ', ' + p.city : ''}\nEmail : ${(ONLINE && user && user.email) || p.email || 'à préciser'}\nCode Anza : ${lpCode()}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}
function lpOfferCard() {
  const link = lpWaLink(); if (!link) return '';
  return `<div class="card offer-lp" style="margin-top:16px"><div class="offer-in"><div><p class="kick">Offert dans votre formule</p><h3>Votre landing page sur mesure, créée par SC Project</h3><p class="mute">Envie d’aller plus loin que ce modèle ? L’équipe SC Project conçoit gratuitement votre page personnalisée, à votre image. Envoyez votre demande sur WhatsApp, le message est déjà prêt.</p>${st.lpAsked ? `<small class="mute">Demande envoyée le ${fdate(st.lpAsked)}, votre code : <b>${lpCode()}</b></small>` : ''}</div><a class="btn pri" href="${link}" target="_blank" rel="noopener" data-a="lpAsk" data-keep="1">${ic('wa')}Demander ma landing offerte</a></div></div>`;
}
A.lpAsk = () => { st.lpAsked = iso(Date.now()); save(); setTimeout(refresh, 400); };
A.lpDl = () => download('index.html', landingHTML(lp), 'text/html');
A.lpOpen = () => { const w = window.open('', '_blank'); if (w) { w.document.write(landingHTML(lp)); w.document.close(); } };

VIEWS.ia = () => {
  if (!has(3)) return lockView(3, 'Votre IA personnelle est dans le Magasin', 'Une IA entraînée sur votre activité, vos réponses à Nia et les résultats de vos publications. Plus personnalisée chaque mois, avec une équipe humaine derrière.');
  const pct = personalization(), ang = bestAngle(), a = st.ai, sample = followMessage('prospect', { name: 'Camille Martin' });
  const deg = pct * 3.6;
  return `<div class="head"><div><p class="kick">Magasin</p><h1>Mon IA personnelle</h1><p>Elle apprend de chaque réponse à Nia et de chaque publication. Plus vous l’utilisez, plus elle écrit comme vous.</p></div>${aiBadge()}</div>
  ${aiOn() ? '' : `<div class="card" style="margin-bottom:16px">${connectBox('home')}</div>`}
  <div class="grid g12"><div class="card dark" style="display:flex;flex-direction:column;align-items:center;text-align:center"><div class="ring2" style="background:conic-gradient(#82A7FF ${deg}deg,#1A2547 0)"><div style="position:absolute;inset:12px;border-radius:50%;background:var(--night)"></div><b style="position:relative">${pct} %</b></div>
    <p style="margin-top:16px;font-weight:700">Niveau de personnalisation</p><p class="mute" style="font-size:13px;margin-top:6px">${plural(Object.keys(st.interview.answers).length, 'réponse', 'réponses')} à l’entretien, ${plural(st.weekly.length, 'question', 'questions')} de la semaine, ${plural(st.perf.length, 'publication analysée', 'publications analysées')}</p></div>
  <div class="card"><h3>Réglages de votre voix</h3>${[['warmth', 'Chaleur'], ['humor', 'Humour'], ['formal', 'Élégance'], ['length', 'Longueur']].map(([k, l]) => `<div class="slider"><b>${l}</b><input type="range" min="0" max="100" value="${a[k]}" data-i="aiSlide" data-k="${k}" aria-label="${l}"><span id="sv-${k}">${a[k]}</span></div>`).join('')}
    <p class="kick" style="margin-top:14px">Aperçu en direct</p><div class="caption" id="ai-sample">${esc(sample)}</div></div></div>
  <div class="grid g2" style="margin-top:16px"><div class="card"><h3>Ce que votre IA a appris</h3><ul class="learn" style="margin-top:8px">
    <li><b>Ce qui fait écrire vos clients</b>${ang[0] ? `Les contenus « ${esc(ang[0].a)} » génèrent ${Math.round(ang[0].m)} messages en moyenne.` : 'Pas encore assez de données.'}</li>
    <li><b>Ce qui fait le plus de vues</b>${ang.length ? esc(ang.slice().sort((x, y) => y.v - x.v)[0].a) + ', ' + Math.round(ang.slice().sort((x, y) => y.v - x.v)[0].v) + ' vues en moyenne.' : '…'}</li>
    <li><b>Votre ton</b>${esc(st.profile.vibe)}, ${st.profile.tone === 'tu' ? 'tutoiement' : 'vouvoiement'}.</li>
    <li><b>Vos mots</b>« ${esc(st.profile.value)} », « ${esc(st.profile.proof)} ».</li>${st.focus ? `<li><b>Focus du moment</b>${esc(st.focus)}</li>` : ''}${(st.memory || []).slice(-3).reverse().map(m => `<li><b>Mémoire</b>${esc(m.text)}</li>`).join('')}</ul></div>
  <div class="card blue"><h3>Suggestions pour la semaine ${aiOn() ? `<button class="btn sec sm" data-a="suggestAI" ${busy ? 'disabled' : ''}>${busy ? 'Nia réfléchit' : 'Demander à Nia'}</button>` : ''}</h3><ul class="learn" style="margin-top:8px">${suggestions().map(s => `<li style="border-color:rgba(255,255,255,.2)"><b style="color:#B9CCFF">${esc(s[0])}</b>${esc(s[1])}</li>`).join('')}</ul></div></div>
  <div class="card" style="margin-top:16px;padding:0"><div style="padding:18px 20px 6px"><h3>Performances de vos contenus <button class="btn sec sm" data-a="perfAdd">${ic('plus')}Ajouter</button></h3><p class="mute" style="font-size:13px;margin-top:4px">Renseignez vues et messages reçus : votre IA ajuste les prochains contenus.</p></div>
  <div class="tablewrap"><table class="table"><thead><tr><th>Date</th><th>Contenu</th><th>Angle</th><th>Vues</th><th>Messages</th></tr></thead><tbody>${st.perf.slice().reverse().map(p => `<tr><td>${fdate(p.date)}</td><td><b>${esc(p.title)}</b><div class="mute" style="font-size:12px">${esc(p.type)}</div></td><td><span class="tag">${esc(p.angle)}</span></td><td><input type="number" min="0" value="${p.views}" data-c="perf" data-id="${p.id}" data-k="views" style="width:84px;border:1px solid var(--line);border-radius:8px;padding:5px 8px"></td><td><input type="number" min="0" value="${p.messages}" data-c="perf" data-id="${p.id}" data-k="messages" style="width:70px;border:1px solid var(--line);border-radius:8px;padding:5px 8px"></td></tr>`).join('')}</tbody></table></div></div>`;
};
function suggestions() {
  if (st.aiSuggest && st.aiSuggest.week === weekKey() && st.aiSuggest.list.length) return st.aiSuggest.list.map(x => [x.day, `${x.title}. ${x.why}`]);
  const ang = bestAngle(), top = ang[0] ? ang[0].a : 'Preuve', w = st.weekly[0];
  return [
    ['Mardi', `Une story « ${top} » : c’est ce qui fait le plus écrire vos clients.`],
    ['Jeudi', w ? w.idea : 'Un post LinkedIn sur votre histoire.'],
    ['Samedi', 'Une story offre avec vos créneaux de la semaine suivante.']
  ];
}
I.aiSlide = el => { st.ai[el.dataset.k] = +el.value; $('#sv-' + el.dataset.k).textContent = el.value; $('#ai-sample').textContent = followMessage('prospect', { name: 'Camille Martin' }); save(); };
C.perf = el => { const p = st.perf.find(x => x.id === el.dataset.id); p[el.dataset.k] = +el.value || 0; save(); refresh(); };
A.perfAdd = () => modal('Ajouter une publication', `<div class="form"><div class="field"><label for="pf-t">Titre</label><input id="pf-t"></div><div class="grid g2"><div class="field"><label for="pf-y">Type</label><select id="pf-y"><option>Story</option><option>Carrousel</option><option>Post LinkedIn</option></select></div><div class="field"><label for="pf-a">Angle</label><select id="pf-a">${[...ANGLES, 'Coulisses', 'Avant après'].map(a => `<option>${a}</option>`).join('')}</select></div></div><div class="grid g2"><div class="field"><label for="pf-v">Vues</label><input id="pf-v" type="number" value="0"></div><div class="field"><label for="pf-m">Messages</label><input id="pf-m" type="number" value="0"></div></div><div class="btns" style="justify-content:flex-end"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="perfSave">Ajouter</button></div></div>`);
A.perfSave = () => { st.perf.push({ id: uid(), date: iso(Date.now()), title: val('pf-t') || 'Publication', type: val('pf-y'), angle: val('pf-a'), views: +val('pf-v') || 0, messages: +val('pf-m') || 0 }); save(); closeModal(); refresh(); };

VIEWS.parler = () => {
  if (!has(3)) return lockView(3, 'Parler à Nia est dans le Magasin', 'Une conversation libre avec votre brand manager, connectée à ' + AI_NAME + ' : offres, contenus, clients, organisation. Nia agit directement dans votre espace.');
  const h = st.niaChat || [];
  const sugg = ['Aide moi à préparer ma semaine de contenus', 'Comment relancer un client qui ne répond plus ?', 'Propose moi une offre pour les fêtes', 'Comment justifier mes prix ?'];
  return `<div class="head"><div><p class="kick">Magasin</p><h1>Parler à Nia</h1><p>Posez n’importe quelle question sur votre communication, vos clients ou vos offres. Nia connaît votre profil, votre mémoire et vos résultats, et peut agir dans votre espace.</p></div>${h.length ? '<button class="btn sec" data-a="chatClear">Nouvelle conversation</button>' : ''}</div>
  <div class="grid g21"><div class="card"><div class="row" style="flex-wrap:nowrap"><div class="av nia">N</div><b>Nia</b> ${aiBadge()}</div>
    <div class="chat" id="nchat" style="margin-top:14px;max-height:560px">${h.length ? '' : '<div class="msg n">Bonjour ! Je suis là pour vous aider. Que voulez vous travailler aujourd’hui ?</div>'}${h.map((m, i) => `<div class="msg ${m.f}">${esc(m.t)}${m.act ? actCards(m.act, i) : ''}</div>`).join('')}${typing ? '<div class="msg n typing"><i></i><i></i><i></i></div>' : ''}</div>
    ${h.length ? '' : `<div class="btns" style="margin-top:10px">${sugg.map(s => `<button class="btn sec sm" data-a="chatSugg" data-t="${esc(s)}">${esc(s)}</button>`).join('')}</div>`}
    <div class="compose"><textarea id="nc-in" placeholder="Écrivez à Nia" data-enter="chatSend" aria-label="Votre message" ${typing ? 'disabled' : ''}></textarea><button class="btn pri" data-a="chatSend" style="height:auto" aria-label="Envoyer">${ic('send')}</button></div>
    ${aiOn() ? '' : '<div style="margin-top:16px">' + connectBox('chat') + '</div>'}</div>
  <div class="grid" style="align-content:start"><div class="card"><h3>Ce que Nia sait de vous</h3><ul class="learn" style="margin-top:8px"><li><b>Positionnement</b>${esc(st.profile.value || 'À définir avec l’entretien')}</li><li><b>Focus</b>${esc(st.focus || 'Aucun pour l’instant')}</li><li><b>Mémoire</b>${plural((st.memory || []).length, 'note', 'notes')}</li></ul><a class="btn ghost sm" style="margin-top:8px" href="#/journal">Voir le journal</a></div>
  <div class="card"><h3>Ce que Nia peut faire</h3><p class="mute" style="font-size:14px;margin-top:8px">Planifier des publications, mettre à jour votre profil, retenir une information importante. Elle vous propose toujours l’action, vous décidez.</p></div></div></div>`;
};
function actCards(act, i) {
  const ev = act.actions || [], up = Object.entries(act.updates || {}).filter(([k, v]) => ALLOWED_FIELDS.includes(k) && v);
  if (!ev.length && !up.length) return '';
  return `<div class="acts">${ev.map(e => `<div class="act"><b>${esc(e.format)} · dans ${e.in_days} j</b><span>${esc(e.title)}</span></div>`).join('')}${up.map(([k, v]) => `<div class="act"><b>${esc(FIELD_LABEL[k] || k)}</b><span>${esc(v)}</span></div>`).join('')}
  ${act.applied ? '<p class="act-ok">✓ Appliqué</p>' : `<button class="btn pri sm" data-a="chatApply" data-n="${i}">Appliquer</button>`}</div>`;
}
AFTER.parler = () => { const c = $('#nchat'); if (c) c.scrollTop = c.scrollHeight; };
AFTER.charte = () => { if (aiOn() && !busy && !(st.aiBios && st.aiBios.bios && st.aiBios.bios.length) && !autoTried.bio) { autoTried.bio = true; A.bioAI(); } };
AFTER.ia = () => { if (aiOn() && has(3) && !busy && !(st.aiSuggest && st.aiSuggest.week === weekKey()) && !autoTried.sug) { autoTried.sug = true; A.suggestAI(); } };
A.chatClear = () => { st.niaChat = []; save(); refresh(); };
A.chatSugg = el => { $('#nc-in').value = el.dataset.t; A.chatSend(); };
function chatFallback(t) {
  const a = t.toLowerCase();
  if (/story|stories|contenu|post|carrousel|publier|semaine/.test(a)) return 'Ouvrez le Séquenceur de stories ou Carrousels et posts : choisissez un angle, je l’écris dans votre ton. Votre calendrier propose déjà quatre semaines de publications.';
  if (/relanc|r[ée]pond|silence/.test(a)) return 'Dans Relances, vous trouverez chaque personne qui attend une réponse, avec un message déjà écrit. Un clic pour l’envoyer sur WhatsApp.';
  if (/prix|tarif|cher|devis/.test(a)) return 'Pour vos prix : montrez ce qui est inclus et vos preuves. Créez un devis clair dans Devis, et un carrousel « Erreurs » pour expliquer la valeur de votre travail.';
  if (/offre|promo|f[êe]te|no[ëe]l/.test(a)) return 'Pour une offre : utilisez le type « Offre » dans le Séquenceur de stories. Gardez une seule offre, une date limite et un bouton clair.';
  return 'Je peux vous aider sur vos contenus, vos relances, vos devis et votre positionnement. Pour des réponses libres et sur mesure, connectez moi à ' + AI_NAME + ' dans les Réglages.';
}
A.chatSend = async () => {
  const t = val('nc-in').trim(); if (!t || typing) return;
  st.niaChat = st.niaChat || []; st.niaChat.push({ f: 'u', t }); typing = true; save(); refresh();
  let msg;
  if (aiOn()) {
    try { const r = await aiChat(st.niaChat); addMemory(r.memory, 'Conversation'); msg = { f: 'n', t: r.reply, act: (r.actions && r.actions.length) || (r.updates && Object.keys(r.updates).length) ? { actions: r.actions || [], updates: r.updates || {} } : null }; }
    catch (e) { toast(aiError(e)); }
  }
  if (!msg) msg = { f: 'n', t: chatFallback(t) };
  st.niaChat.push(msg); st.niaChat = st.niaChat.slice(-40); typing = false; save(); if (route.name === 'parler') refresh();
};
A.chatApply = el => {
  const m = st.niaChat[+el.dataset.n]; if (!m || !m.act || m.act.applied) return;
  const ev = addActions(m.act.actions, 'Conversation'), up = applyUpdates(m.act.updates, 'Conversation');
  m.act.applied = true; save(); toast(`${ev.length ? plural(ev.length, 'publication planifiée', 'publications planifiées') : ''}${ev.length && up.length ? ', ' : ''}${up.length ? 'profil mis à jour' : ''}` || 'Appliqué'); refresh();
};

let aiSug = null;
A.suggestAI = async () => { if (busy) return; busy = true; refresh(); try { const r = await aiSuggest(); st.aiSuggest = { week: weekKey(), list: r.suggestions || [] }; save(); toast('Suggestions de Nia mises à jour'); } catch (e) { toast(aiError(e)); } busy = false; refresh(); };

let team = null, teamTimer = null;
VIEWS.equipe = () => {
  if (!has(3)) return lockView(3, 'L’accompagnement est dans le Magasin', 'Une équipe humaine publie pour vous, suit votre CRM et vos relances, et fait le point avec vous chaque mois.');
  const cur = monthRevenue(0), t = team || { msgs: [], items: [] };
  const label = { publie: 'Publié', programme: 'Programmé', en_preparation: 'En préparation' };
  return `<div class="head"><div><p class="kick">Magasin</p><h1>Votre accompagnement</h1><p>L’équipe SAUTI et SC Project travaille avec vous chaque semaine. Écrivez nous ici, on répond dans la journée ouvrée.</p></div><a class="btn pri" href="${CFG.calendly}" target="_blank" rel="noopener">${ic('cal')}Réserver le point mensuel</a></div>
  <div class="grid g21"><div class="card"><h3>Messages ${team ? '' : '<small>Chargement</small>'}</h3><div class="chat" id="tchat" style="margin-top:14px;max-height:440px">${t.msgs.map(m => `<div class="msg ${m.from_team ? 'n' : 'u'}">${esc(m.body)}<div style="font-size:11px;opacity:.6;margin-top:4px">${m.from_team ? 'Équipe Anza' : 'Vous'}, ${fdate(m.created_at)}</div></div>`).join('') || (team ? '<div class="msg n">Bonjour ! Écrivez nous ici pour toute question : contenus, CRM, facturation. On vous répond rapidement.</div>' : '')}</div>
    <div class="compose"><textarea id="tm-in" placeholder="Votre message à l’équipe" data-enter="tmSend" aria-label="Votre message"></textarea><button class="btn pri" data-a="tmSend" style="height:auto" aria-label="Envoyer">${ic('send')}</button></div>
    ${ONLINE ? '' : `<p class="mute" style="font-size:12px;margin-top:8px">Votre message s’ouvrira dans votre messagerie, adressé à ${esc(CFG.contactEmail)}.</p>`}</div>
  <div class="grid" style="align-content:start"><div class="card"><h3>Votre équipe</h3><ul class="list" style="margin-top:8px"><li><div class="av nia">N</div><div class="grow"><b>Nia</b><small>Brand manager, IA</small></div></li><li><div class="av" style="background:#E8452C">S</div><div class="grow"><b>Équipe SAUTI</b><small>Stratégie et contenus</small></div></li><li><div class="av" style="background:var(--night)">SC</div><div class="grow"><b>Équipe SC Project</b><small>Outils, CRM et automatisations</small></div></li></ul></div>
  <div class="card"><h3>Prévu pour vous</h3><ul class="list" style="margin-top:8px">${t.items.map(x => `<li><div class="grow"><b style="white-space:normal">${esc(x.title)}</b><small>${fdateL(x.day)}</small></div><span class="tag ${esc(x.status)}">${label[x.status] || esc(x.status)}</span></li>`).join('') || '<li class="mute">L’équipe ajoute ici les contenus préparés pour vous chaque semaine.</li>'}</ul></div>
  <div class="card dark"><h3>Ce mois ci</h3><p class="mute" style="margin-top:10px;font-size:14px">${eur(cur.v)} de chiffre, ${plural(computeFollow().length, 'relance', 'relances')} en cours, ${plural(st.calendar.filter(e => e.done).length, 'publication', 'publications')}. On en parle au prochain point.</p></div></div></div>`;
};
async function loadTeam() {
  try { team = await teamFetch(); } catch (e) { team = team || { msgs: [], items: [] }; }
  if (route.name === 'equipe') { refresh(); const c = $('#tchat'); if (c) c.scrollTop = c.scrollHeight; }
}
AFTER.equipe = () => {
  const c = $('#tchat'); if (c) c.scrollTop = c.scrollHeight;
  if (!has(3)) return;
  if (!team) loadTeam();
  clearInterval(teamTimer); teamTimer = setInterval(() => { if (route.name !== 'equipe') { clearInterval(teamTimer); return; } loadTeam(); }, 30000);
};
A.tmSend = async () => {
  const t = val('tm-in').trim(); if (!t) return;
  const ok = await teamSend(t);
  if (!ok) { toast('Envoi impossible, réessayez'); return; }
  toast('Message envoyé'); team = null; loadTeam();
};

VIEWS.reglages = () => {
  const p = st.profile, f = (k, l, t, ph) => `<div class="field"><label for="p-${k}">${l}</label><input id="p-${k}" ${t ? `type="${t}"` : ''} value="${esc(p[k])}" ${ph ? `placeholder="${ph}"` : ''} data-i="set" data-path="profile.${k}" ${t === 'number' ? 'data-num' : ''}></div>`;
  const ta = (k, l) => `<div class="field"><label for="p-${k}">${l}</label><textarea id="p-${k}" data-i="set" data-path="profile.${k}" style="min-height:64px">${esc(p[k])}</textarea></div>`;
  return `<div class="head"><div><p class="kick">Réglages</p><h1>Votre espace</h1><p>Ces informations remplissent vos devis, vos contenus et votre landing page. Tout est enregistré automatiquement.</p></div></div>
  <div class="grid g2"><div class="card"><h3>Votre activité</h3><div class="form" style="margin-top:14px"><div class="grid g2">${f('first', 'Prénom')}${f('name', 'Nom complet')}</div><div class="grid g2">${f('business', 'Nom de l’activité')}${f('activity', 'Métier')}</div><div class="grid g2">${f('city', 'Ville ou zone')}${f('instagram', 'Compte Instagram', '', 'sans le @')}</div><div class="grid g2">${f('phone', 'Téléphone')}${f('email', 'Email professionnel', 'email')}</div><div class="grid g2">${f('siret', 'SIRET')}${f('address', 'Adresse sur les devis')}</div></div></div>
  <div class="card"><h3>Votre positionnement</h3><div class="form" style="margin-top:14px">${ta('target', 'Clients idéaux')}${ta('problem', 'Problème que vous réglez')}${ta('value', 'Votre valeur ajoutée')}${ta('proof', 'Vos preuves')}${ta('story', 'Votre histoire')}</div></div></div>
  <div class="card" style="margin-top:16px;padding:0"><div style="padding:18px 20px 6px"><h3>Prestations et prix <button class="btn sec sm" data-a="svcAdd">${ic('plus')}Ajouter</button></h3></div><div class="tablewrap"><table class="table"><thead><tr><th>Prestation</th><th>Prix en euros</th><th>Durée en minutes</th><th></th></tr></thead><tbody>${st.services.map((s, i) => `<tr><td><input value="${esc(s.name)}" data-i="set" data-path="services.${i}.name" class="cell" aria-label="Prestation"></td><td><input type="number" step="0.5" min="0" value="${s.price}" data-i="set" data-num data-path="services.${i}.price" class="cell sm" aria-label="Prix"></td><td><input type="number" min="0" value="${s.duration}" data-i="set" data-num data-path="services.${i}.duration" class="cell sm" aria-label="Durée"></td><td><button class="x" data-a="svcDel" data-n="${i}" aria-label="Supprimer">×</button></td></tr>`).join('') || '<tr><td colspan="4" class="empty">Ajoutez votre première prestation.</td></tr>'}</tbody></table></div></div>
  <div class="grid g3" style="margin-top:16px"><div class="card"><h3>Devis et déclarations</h3><div class="form" style="margin-top:14px"><label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" ${p.vatNote ? 'checked' : ''} data-c="set" data-path="profile.vatNote"> <span>Ajouter « TVA non applicable, article 293 B du CGI » sur les devis</span></label>
    ${f('threshold', 'Seuil de chiffre d’affaires', 'number')}<div class="field"><label for="p-period">Déclaration</label><select id="p-period" data-c="set" data-path="profile.period">${['mensuelle', 'trimestrielle'].map(x => `<option ${p.period === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div><small class="mute">Vérifiez le seuil en vigueur pour votre activité sur le site de l’URSSAF.</small></div></div>
  <div class="card"><h3>Installer l’application</h3><p class="mute" style="font-size:14px;margin-top:10px"><b>iPhone</b> : dans Safari, touchez Partager puis « Sur l’écran d’accueil ».<br><b>Android</b> : dans Chrome, menu ⋮ puis « Installer l’application ».<br><b>Ordinateur</b> : icône d’installation dans la barre d’adresse.</p><label class="row" style="margin-top:12px"><input type="checkbox" ${st.installed ? 'checked' : ''} data-c="set" data-path="installed"> C’est fait</label></div>
  <div class="card"><h3>Votre compte</h3><p class="mute" style="font-size:14px;margin-top:10px">${ONLINE && user ? `Connecté avec <b>${esc(user.email)}</b>.<br>` : 'Données enregistrées sur cet appareil.<br>'}Formule : <b>${PLAN_NAME[plan] || 'Le Stand'}</b></p>
    <div class="btns" style="margin-top:14px"><button class="btn sec sm" data-a="exportData">${ic('dl')}Exporter mes données</button><label class="btn sec sm" style="cursor:pointer">Importer<input type="file" accept="application/json" data-c="importData" hidden></label></div>
    <div class="btns" style="margin-top:8px"><button class="btn sec sm" data-a="logout">Se déconnecter</button><button class="btn danger sm" data-a="delAccount">Supprimer mon compte</button></div>
    <p class="mute" style="font-size:12px;margin-top:12px"><a href="${CFG.privacyUrl}" target="_blank" rel="noopener">Confidentialité</a> · <a href="${CFG.termsUrl}" target="_blank" rel="noopener">Conditions</a> · <a href="${CFG.legalUrl}" target="_blank" rel="noopener">Mentions légales</a> · <a href="mailto:${CFG.contactEmail}">${CFG.contactEmail}</a></p></div></div>
  ${aiSettings()}${histCard()}`;
};
function aiSettings() {
  const mode = aiMode(), own = !!localKey(), canKey = ownKeyAllowed() && (!ONLINE || has(3));
  const status = mode === 'local' ? 'Nia est connectée à Claude avec votre propre clé. Elle est enregistrée uniquement sur cet appareil et les appels sont facturés sur votre compte Claude.'
    : mode === 'server' ? 'Nia est connectée à ' + AI_NAME + ' par le serveur sécurisé Anza.'
    : ONLINE ? (has(3) ? 'Connexion à ' + AI_NAME + ' en attente de configuration du serveur. Vous pouvez dès maintenant connecter votre propre compte Claude ci dessous.' : 'Nia connectée à ' + AI_NAME + ' est incluse dans le Magasin.')
    : 'Nia utilise les modèles intégrés. Ajoutez une clé Claude pour la connecter.';
  const keyBox = canKey ? `<div class="keybox" style="margin-top:16px;padding-top:16px;border-top:1px solid var(--line)">
    <b style="font-size:14px">Connecter mon propre compte Claude</b>
    <ol class="mute" style="font-size:13px;line-height:1.6;margin:8px 0 0 18px"><li>Ouvrez <a href="https://platform.claude.com" target="_blank" rel="noopener">platform.claude.com</a> et connectez vous.</li><li>Ajoutez quelques euros de crédits dans Billing.</li><li>Dans API Keys, créez une clé et collez la ici.</li></ol>
    <div class="row" style="margin-top:12px;flex-wrap:wrap"><input id="ck" type="password" autocomplete="off" placeholder="${own ? 'Clé enregistrée sur cet appareil' : 'sk-ant-…'}" style="flex:1;min-width:220px;border:1px solid var(--line);border-radius:10px;padding:9px 12px" aria-label="Clé API Claude"><button class="btn pri sm" data-a="keySave">${own ? 'Remplacer' : 'Enregistrer'}</button>${own ? '<button class="btn danger sm" data-a="keyDel">Retirer</button>' : ''}</div>
    <small class="mute" style="display:block;margin-top:8px">Votre clé reste sur cet appareil, n’est jamais envoyée à Anza et sert uniquement à appeler Claude. Sur un autre appareil, collez la à nouveau. ${ONLINE && CFG.aiServer ? 'Retirez la pour revenir au serveur Anza.' : ''}</small></div>` : '';
  return `<div class="card" style="margin-top:16px"><h3>Nia et ${mode === 'local' ? 'Claude' : AI_NAME} ${aiBadge()}</h3><p class="mute" style="font-size:14px;margin-top:8px">${status}</p>
  ${mode ? '<div class="btns" style="margin-top:12px"><button class="btn sec sm" data-a="keyTest">Tester la connexion</button></div>' : ''}
  ${keyBox}</div>`;
}
function connectBox(ctx) {
  if (!ownKeyAllowed()) return `<div class="connect"><div class="connect-top"><div class="av nia">N</div><div><b>Nia sera bientôt connectée à ${AI_NAME}</b><p class="mute">L’équipe Anza finalise la connexion. En attendant, Nia utilise ses modèles intégrés.</p></div></div></div>`;
  const later = ctx === 'onb' ? '<button class="btn ghost sm" data-a="aiLater">Plus tard, commencer sans Claude</button>' : '';
  return `<div class="connect ${ctx === 'home' ? 'connect-home' : ''}"><div class="connect-top"><div class="av nia">N</div><div><b>Branchez Claude, le cerveau de Nia</b><p class="mute">Connectée à votre compte Claude, Nia mène un vrai entretien, rebondit sur chaque réponse, choisit vos questions de la semaine, écrit stories, posts, bios et relances, et répond à tout dans Parler à Nia.</p></div></div>
  <ol class="mute connect-steps"><li>Ouvrez <a href="https://platform.claude.com" target="_blank" rel="noopener">platform.claude.com</a> et connectez vous.</li><li>Dans Billing, ajoutez quelques euros de crédits.</li><li>Dans API Keys, créez une clé et collez la ici.</li></ol>
  <div class="row connect-row"><input id="ck" type="password" autocomplete="off" placeholder="sk-ant-…" aria-label="Clé API Claude"><button class="btn pri sm" data-a="keyConnect" ${keyBusy ? 'disabled' : ''}>${keyBusy ? 'Connexion' : 'Connecter'}</button>${later}</div>
  <small class="mute">Votre clé reste sur cet appareil et n’est jamais envoyée à Anza. Les appels sont facturés sur votre compte Claude, quelques centimes par action.</small></div>`;
}
let keyBusy = false;
A.keyConnect = async () => {
  const k = val('ck').trim();
  if (!/^sk-ant-/.test(k)) { toast('Une clé Claude commence par sk-ant-'); return; }
  try { localStorage.setItem(keyStore(), k); } catch (e) {}
  keyBusy = true; refresh();
  try {
    const r = await aiWeeklyQuestion();
    st.weeklyQ = { week: weekKey(), q: r.question, why: r.why || '' }; st.aiLater = false; save();
    toast('Claude est maintenant le cerveau de Nia');
  } catch (e) {
    try { localStorage.removeItem(keyStore()); } catch (x) {}
    toast(aiError(e));
  }
  keyBusy = false; refresh();
};
A.keySave = A.keyConnect;
A.aiLater = () => { st.aiLater = true; save(); refresh(); };
A.keyDel = () => { try { localStorage.removeItem(keyStore()); } catch (e) {} toast('Clé retirée'); refresh(); };
A.keyTest = async el => { const lbl = el.textContent; el.disabled = true; el.textContent = 'Test en cours'; try { const r = await aiWeeklyQuestion(); toast('Connexion réussie. Nia demande : ' + r.question); } catch (e) { toast(aiError(e)); } el.disabled = false; el.textContent = lbl; };
function histCard() {
  return `<div class="card" style="margin-top:16px"><h3>Versions précédentes</h3><p class="mute" style="font-size:14px;margin-top:8px">Anza garde automatiquement les ${HIST_MAX} dernières versions de vos données, au plus une par heure d’activité. En cas d’erreur ou de suppression par mégarde, revenez à une version : l’état actuel est gardé lui aussi.</p><div id="hist" style="margin-top:12px"><button class="btn sec sm" data-a="histLoad">Voir les versions</button></div></div>`;
}
const fmtWhen = d => new Date(d).toLocaleString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
A.histLoad = async el => {
  const box = $('#hist'); if (el) { el.disabled = true; el.textContent = 'Chargement'; }
  try {
    const list = await listVersions();
    box.innerHTML = list.length ? `<div class="hist">${list.map(v => `<div class="hist-row"><div><b>${fmtWhen(v.at)}</b><small class="mute">${v.contacts} contact${v.contacts > 1 ? 's' : ''} · ${v.devis} devis · ${v.rdv} publication${v.rdv > 1 ? 's' : ''} prévue${v.rdv > 1 ? 's' : ''}</small></div><button class="btn sec sm" data-a="histRestore" data-id="${v.id}" data-when="${esc(fmtWhen(v.at))}">Restaurer</button></div>`).join('')}</div>` : '<p class="mute" style="font-size:14px">Aucune version pour le moment. La première sera créée après votre prochaine modification, puis une par heure d’activité.</p>';
  } catch (e) { box.innerHTML = '<p class="mute" style="font-size:14px">Impossible de charger les versions. Vérifiez votre connexion.</p><button class="btn sec sm" data-a="histLoad" style="margin-top:8px">Réessayer</button>'; }
};
A.histRestore = el => {
  const id = +el.dataset.id;
  confirmBox(`Revenir à vos données du <b>${el.dataset.when}</b> ? Vos données actuelles seront gardées dans les versions précédentes.`, 'Restaurer', async () => {
    try { await restoreVersion(id); toast('Version restaurée'); render(); A.histLoad(); }
    catch (e) { toast(/offline/.test(e && e.message) ? 'Reconnectez vous à internet pour restaurer une version' : 'Restauration impossible pour le moment'); }
  });
};
A.svcAdd = () => { st.services.push({ id: uid(), name: 'Nouvelle prestation', price: 0, duration: 60 }); save(); refresh(); };
A.svcDel = el => { st.services.splice(+el.dataset.n, 1); save(); refresh(); };
A.exportData = () => download('anza-mes-donnees-' + iso(Date.now()) + '.json', JSON.stringify(st, null, 2), 'application/json');
C.importData = el => {
  const f = el.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = () => { try { const o = JSON.parse(r.result); if (!o || !o.profile || !Array.isArray(o.clients)) throw 0; confirmBox('Remplacer toutes vos données actuelles par celles de ce fichier ? Vos données actuelles restent dans les versions précédentes.', 'Remplacer', () => { if (!ONLINE) localSnap(st, true); st = migrate(o); st.onboarded = true; save(); toast('Données importées'); render(); }); } catch (e) { toast('Fichier non reconnu'); } };
  r.readAsText(f);
};
A.delAccount = () => confirmBox('Supprimer définitivement votre compte et toutes vos données ? Exportez les avant si vous voulez les garder. Cette action est irréversible.', 'Supprimer mon compte', () => deleteAccount());

window.addEventListener('hashchange', () => { if (!/^#\/devis\//.test(location.hash)) draft = null; if (st) render(); });
boot();
