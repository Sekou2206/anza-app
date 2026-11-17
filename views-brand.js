VIEWS.icp = () => {
  const ready = icpReady() && route.q.edit == null, a = st.icp.answers, def = icpDefaults();
  const stats = crmStats();
  if (!ready) return `<div class="head"><div><p class="kick">Marque</p><h1>Votre client idéal</h1><p>Dix questions pour dessiner précisément qui vous voulez attirer. Anza en tire vos profils clients, leurs hésitations et où les trouver. Tout ce qu’Anza écrit s’appuie ensuite dessus.</p></div></div>
  <div class="grid g21"><div class="card"><div class="form">${ICP_Q.map((q, i) => icpField(q, i, a[q.k] != null && a[q.k] !== '' ? a[q.k] : def[q.k])).join('')}
    <div class="btns"><button class="btn pri" data-a="icpBuild">${ic('target')}Dessiner mes profils</button>${has(3) && aiOn() ? `<button class="btn sec" data-a="icpAI" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia réfléchit' : 'Avec Nia'}</button>` : ''}${icpReady() ? '<a class="btn ghost" href="#/icp">Annuler</a>' : ''}</div></div></div>
  <div class="grid" style="align-content:start"><div class="card blue"><h3>Ce qu’Anza sait déjà</h3><ul class="learn" style="margin-top:8px">${stats.map(([k, v]) => `<li style="border-color:rgba(255,255,255,.2)"><b style="color:#B9CCFF">${k}</b>${v}</li>`).join('')}</ul></div>
  <div class="card"><h3>Pourquoi c’est important</h3><p class="mute" style="font-size:14px;margin-top:8px">Un message qui parle à tout le monde ne touche personne. En sachant exactement pour qui vous écrivez, vos stories, vos bios et votre page deviennent beaucoup plus efficaces. Vous pourrez tout modifier ensuite.</p></div></div></div>`;
  const ps = st.icp.personas, anti = st.icp.anti, old = st.icp.at && since(st.icp.at) > 30;
  return `<div class="head"><div><p class="kick">Marque</p><h1>Votre client idéal</h1><p>${st.icp.ai ? 'Dessinés avec Nia' : 'Dessinés par Anza'} à partir de vos réponses${st.clients.length ? ' et de vos clients' : ''}. Vos contenus, vos bios et votre page s’adressent maintenant à eux.</p></div>
  <div class="btns"><a class="btn sec" href="#/icp?edit=1">${ic('edit')}Modifier mes réponses</a>${has(3) ? (aiOn() ? `<button class="btn sec" data-a="icpAI" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia réfléchit' : 'Enrichir avec Nia'}</button>` : '') : `<span class="btn sec" style="opacity:.7">${ic('spark')}Enrichir avec Nia ${lockTag(3)}</span>`}<button class="btn pri" data-a="icpPrint">${ic('print')}Fiche PDF</button></div></div>
  ${old ? '<div class="card tip" style="margin-bottom:16px"><i>!</i><div>Votre profil client date de plus d’un mois. Mettez le à jour avec vos nouveaux clients pour qu’il reste juste. <a href="#/icp?edit=1">Mettre à jour</a></div></div>' : ''}
  <div class="grid g2 ${busy ? 'loading' : ''}">${ps.map((p, i) => personaCard(p, i)).join('')}</div>
  ${anti ? `<div class="card anti" style="margin-top:16px"><h3>Le client à éviter</h3><p style="margin-top:8px;font-weight:600">${esc(anti.portrait)}</p><ul class="dots">${(anti.signals || []).map(s => `<li>${esc(s)}</li>`).join('')}</ul><div class="tip" style="margin-top:10px"><i>✓</i><div>${esc(anti.reply)}</div></div></div>` : ''}`;
};
function icpField(q, i, v) {
  const lab = `<label for="iq-${q.k}">${i + 1}. ${esc(q.q)}</label>`;
  if (q.chips) { const on = Array.isArray(v) ? v : []; return `<div class="field">${lab}<div class="chips">${q.chips.map(c => `<button class="chip ${on.includes(c) ? 'on' : ''}" data-a="icpChip" data-k="${q.k}" data-v="${esc(c)}">${esc(q.k === 'objections' ? OBJ_LABEL[c] : c)}</button>`).join('')}</div></div>`; }
  return `<div class="field">${lab}<textarea id="iq-${q.k}" rows="${q.multi ? 3 : 2}" placeholder="${esc(q.ph || '')}" data-i="icpAns" data-k="${q.k}">${esc(Array.isArray(v) ? v.join('\n') : v || '')}</textarea></div>`;
}
function crmStats() {
  const c = st.clients, src = {}; c.forEach(x => { src[x.source] = (src[x.source] || 0) + 1; });
  const top = Object.entries(src).sort((a, b) => b[1] - a[1])[0];
  const visits = c.flatMap(x => x.history.filter(h => h.amount > 0)), avg = visits.length ? visits.reduce((a, h) => a + h.amount, 0) / visits.length : 0;
  const by = {}; visits.forEach(h => { by[h.text] = (by[h.text] || 0) + 1; }); const best = Object.entries(by).sort((a, b) => b[1] - a[1])[0];
  return [
    ['Votre métier', esc(st.profile.activity || 'à préciser dans l’entretien')],
    ['Vos contacts', c.length ? `${plural(c.length, 'contact', 'contacts')}, dont ${c.filter(x => x.status === 'fidele').length} fidèles` : 'Aucun pour le moment'],
    ['Ils viennent surtout de', top ? `${esc(top[0])} (${top[1]})` : 'pas encore de données'],
    ['Panier moyen', avg ? eur(avg) : 'pas encore de données'],
    ['Prestation la plus vendue', best ? esc(best[0]) : 'pas encore de données']
  ];
}
function personaCard(p, i) {
  const sec2 = (t, body) => body ? `<div class="psec"><b>${t}</b>${body}</div>` : '';
  const list = a => a && a.length ? `<ul class="dots">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : '';
  return `<div class="card persona ${p.primary ? 'main' : ''}"><div class="row" style="flex-wrap:nowrap;justify-content:space-between"><div class="row" style="flex-wrap:nowrap"><div class="av lg">${esc(initials(p.name))}</div><div><h3 style="margin:0">${esc(p.name)} ${p.primary ? '<span class="tag ok">Principal</span>' : ''}</h3><small class="mute">${esc(p.age)}</small></div></div><button class="btn ghost sm" data-a="personaEdit" data-n="${i}">${ic('edit')}</button></div>
    <p style="margin-top:12px;font-weight:600">${esc(uc(p.situation))}</p>
    ${sec2('Ce qui le décide', `<p>${esc(uc(p.trigger))}</p>`)}${sec2('Budget', `<p>${esc(p.budget)}</p>`)}
    ${sec2('Ses problèmes', list(p.pains))}${sec2('Ce qu’il veut vraiment', list(p.desires))}${sec2('Ses mots à lui', p.words && p.words.length ? `<p>${p.words.map(w => `« ${esc(w)} »`).join(', ')}</p>` : '')}
    ${sec2('Ses hésitations, et votre réponse', `<div class="objs">${(p.objections || []).map(o => `<div class="obj"><p class="q">${esc(o.q)}</p><p>${esc(o.a)}</p><a class="btn ghost sm" href="#/posts?angle=Objection&subj=${encodeURIComponent(o.key || o.q)}">Créer un carrousel</a></div>`).join('')}</div>`)}
    ${sec2('Où le trouver', `<div class="chips">${(p.where.platforms || []).map(x => `<span class="chip on">${esc(x)}</span>`).join('')}</div><p class="mute" style="margin-top:8px;font-size:13px">${(p.where.hashtags || []).slice(0, 6).map(t => '#' + esc(t)).join(' ')}</p>${list(p.where.places)}${list(p.where.accounts)}`)}
    ${sec2('Idées de contenus pour lui', list(p.hooks))}
    ${!p.primary ? `<button class="btn sec sm" data-a="personaMain" data-n="${i}" style="margin-top:10px">En faire mon client principal</button>` : ''}</div>`;
}
I.icpAns = el => { st.icp.answers[el.dataset.k] = el.value; clearTimeout(window._ia); window._ia = setTimeout(save, 500); };
A.icpChip = el => { const k = el.dataset.k, v = el.dataset.v, cur = Array.isArray(st.icp.answers[k]) ? st.icp.answers[k] : (icpDefaults()[k] || []).slice(); st.icp.answers[k] = cur.includes(v) ? cur.filter(x => x !== v) : cur.concat(v); el.classList.toggle('on'); save(); };
function collectIcp() { $$('[data-i=icpAns]').forEach(el => { st.icp.answers[el.dataset.k] = el.value; }); Object.entries(icpDefaults()).forEach(([k, v]) => { if (st.icp.answers[k] == null || st.icp.answers[k] === '') st.icp.answers[k] = v; }); }
A.icpBuild = () => { collectIcp(); const r = buildPersonas(); st.icp.personas = r.personas; st.icp.anti = r.anti; st.icp.at = iso(Date.now()); st.icp.ai = false; save(); go('#/icp'); toast('Vos profils clients sont prêts'); };
A.icpAI = async () => {
  if (busy) return; if (route.q.edit != null) collectIcp();
  busy = true; refresh();
  try {
    const r = await aiICP();
    const base = buildPersonas();
    st.icp.personas = (r.personas || []).slice(0, 3).map((p, i) => ({ id: 'p' + (i + 1), primary: i === 0, name: p.name || base.personas[0].name, age: p.age || '', situation: p.situation || '', trigger: p.trigger || '', budget: p.budget || '', pains: (p.pains || []).slice(0, 5), desires: (p.desires || []).slice(0, 5), words: (p.words || []).slice(0, 6), objections: (p.objections || []).slice(0, 4).map(o => ({ key: slug(o.q).slice(0, 20), q: o.q, e: '', a: o.a })), where: { platforms: (p.platforms || []).slice(0, 5), hashtags: (p.hashtags || []).map(t => slug(t)).filter(Boolean).slice(0, 8), places: (p.places || []).slice(0, 4), accounts: (p.accounts || []).slice(0, 4) }, hooks: (p.hooks || []).slice(0, 4) }));
    if (r.anti) st.icp.anti = { portrait: r.anti.portrait || base.anti.portrait, signals: (r.anti.signals || []).slice(0, 4), reply: r.anti.reply || base.anti.reply };
    st.icp.at = iso(Date.now()); st.icp.ai = true; save(); busy = false; go('#/icp'); refresh(); toast('Profils enrichis par Nia');
  } catch (e) { busy = false; refresh(); toast(aiError(e)); }
};
A.personaMain = el => { st.icp.personas.forEach((p, i) => { p.primary = i === +el.dataset.n; }); save(); refresh(); };
A.personaEdit = el => {
  const p = st.icp.personas[+el.dataset.n]; if (!p) return;
  const f = (k, l, v, ta) => `<div class="field"><label for="pe-${k}">${l}</label>${ta ? `<textarea id="pe-${k}" rows="3">${esc(v)}</textarea>` : `<input id="pe-${k}" value="${esc(v)}">`}</div>`;
  modal('Modifier le profil', `<div class="form"><div class="grid g2">${f('name', 'Prénom', p.name)}${f('age', 'Âge', p.age)}</div>${f('situation', 'Situation', p.situation)}${f('trigger', 'Ce qui le décide', p.trigger)}${f('budget', 'Budget', p.budget)}${f('pains', 'Ses problèmes, un par ligne', p.pains.join('\n'), 1)}${f('desires', 'Ce qu’il veut, un par ligne', p.desires.join('\n'), 1)}${f('words', 'Ses mots, un par ligne', (p.words || []).join('\n'), 1)}
  <div class="btns" style="justify-content:space-between">${st.icp.personas.length > 1 ? `<button class="btn danger" data-a="personaDel" data-n="${el.dataset.n}">Supprimer</button>` : '<span></span>'}<button class="btn pri" data-a="personaSave" data-n="${el.dataset.n}">Enregistrer</button></div></div>`);
};
A.personaSave = el => { const p = st.icp.personas[+el.dataset.n]; ['name', 'age', 'situation', 'trigger', 'budget'].forEach(k => { p[k] = val('pe-' + k).trim(); }); ['pains', 'desires', 'words'].forEach(k => { p[k] = lines(val('pe-' + k)); }); p.hooks = personaHooks(p); save(); closeModal(); refresh(); };
A.personaDel = el => { st.icp.personas.splice(+el.dataset.n, 1); if (!st.icp.personas.some(p => p.primary) && st.icp.personas[0]) st.icp.personas[0].primary = true; save(); closeModal(); refresh(); };
A.icpPrint = () => printDoc('Client idéal', `<h1>Client idéal, ${esc(P().business)}</h1>${st.icp.personas.map(p => `<h2>${esc(p.name)}, ${esc(p.age)}</h2><p><b>${esc(uc(p.situation))}</b></p><p><b>Ce qui le décide :</b> ${esc(p.trigger)}<br><b>Budget :</b> ${esc(p.budget)}</p><h3>Problèmes</h3><ul>${p.pains.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3>Envies</h3><ul>${p.desires.map(x => `<li>${esc(x)}</li>`).join('')}</ul><h3>Hésitations et réponses</h3>${p.objections.map(o => `<p><b>${esc(o.q)}</b><br>${esc(o.a)}</p>`).join('')}<h3>Où le trouver</h3><p>${esc(p.where.platforms.join(', '))}</p><ul>${p.where.places.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`).join('')}${st.icp.anti ? `<h2>Le client à éviter</h2><p>${esc(st.icp.anti.portrait)}</p>` : ''}`);

function printDoc(title, body) {
  const b = st.brand, w = window.open('', '_blank');
  if (!w) { toast('Autorisez les fenêtres pour imprimer'); return; }
  w.document.write(`<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${esc(title)}</title><style>@page{margin:18mm}body{font-family:Inter,system-ui,sans-serif;color:${b.ink};line-height:1.5;max-width:760px;margin:0 auto;padding:24px}h1{font-size:28px;color:${b.primary};letter-spacing:-.02em}h2{font-size:20px;margin-top:28px;color:${b.primary}}h3{font-size:14px;text-transform:uppercase;letter-spacing:.08em;color:${b.accent};margin-top:18px}.sw{display:inline-block;width:90px;margin-right:10px;text-align:center;font-size:12px}.sw i{display:block;height:60px;border-radius:12px;margin-bottom:6px;border:1px solid #ddd}pre{white-space:pre-wrap;font-family:inherit}img{max-width:100%}.logo{max-height:90px}.ph{display:inline-block;width:31%;margin-right:2%;aspect-ratio:4/5;object-fit:cover;border-radius:10px}footer{margin-top:40px;font-size:11px;color:#777}</style></head><body>${body}<footer>Préparé avec Anza</footer><script>setTimeout(function(){window.print()},500)<\/script></body></html>`);
  w.document.close();
}

const PALETTES = [
  ['Encre', '#1E3A8A', '#2563EB', '#EEF2FA', '#0A1020'], ['Terre', '#7A3E1D', '#C8693C', '#F7EEE6', '#2A1A12'], ['Sauge', '#3F5B46', '#7FA37F', '#EEF3EC', '#17231A'], ['Corail', '#9C2F3B', '#E8604C', '#FCEDEA', '#2B1114'],
  ['Prune', '#4B2350', '#9A4FA0', '#F5ECF6', '#1E0F21'], ['Océan', '#0F4C5C', '#1F9AA8', '#E8F4F5', '#082228'], ['Sable', '#8A6A3B', '#C9A063', '#FAF4EA', '#2B2216'], ['Nuit dorée', '#1B1B1F', '#C7A24A', '#F4F1EA', '#0E0E10']
];
VIEWS.charte = () => {
  const b = st.brand, p = st.profile, sug = window._cols && window._cols.sug;
  const low = contrast(b.primary, readableOn(b.primary)) < 4.5;
  return `<div class="head"><div><p class="kick">Marque</p><h1>Votre charte</h1><p>Logo, couleurs, police et ton, réglés une fois. Tout ce qu’Anza produit les respecte : stories, carrousels, page, devis, visuels.</p></div>
  <div class="btns"><button class="btn sec" data-a="charteExport">${ic('dl')}Exporter</button><label class="btn sec" style="cursor:pointer">${ic('up')}Importer<input type="file" accept="application/json,.json" data-c="charteImport" hidden></label><button class="btn pri" data-a="chartePrint">${ic('print')}Charte PDF</button></div></div>
  <div class="grid g2"><div class="grid" style="align-content:start">
  <div class="card"><h3>Logo</h3><div class="row" style="margin-top:12px;gap:16px;flex-wrap:nowrap"><div class="logobox">${b.logo ? `<img data-media="${esc(b.logo)}" alt="Votre logo">` : `<span>${esc(initials(p.business || 'A'))}</span>`}</div>
    <div class="btns"><button class="btn sec sm" data-a="logoUp">${ic('up')}Importer mon logo</button><button class="btn ghost sm" data-a="logoLib">Depuis la photothèque</button>${b.logo ? `<button class="btn ghost sm" data-a="logoColors">${ic('palette')}Couleurs du logo</button><button class="btn ghost sm" data-a="logoDel">Retirer</button>` : ''}</div></div>
    ${b.logo ? `<label class="row" style="margin-top:12px"><input type="checkbox" ${b.logoOn ? 'checked' : ''} data-c="set" data-path="brand.logoOn"> Afficher le logo sur mes stories et carrousels</label>` : '<small class="mute" style="display:block;margin-top:10px">Un PNG sans fond donne le meilleur rendu. Pas de logo ? Votre nom suffit très bien pour démarrer.</small>'}</div>
  <div class="card"><h3>Couleurs <button class="btn ghost sm" data-a="photoColorsPick">${ic('image')}Depuis mes photos</button></h3>
    <div class="swatches">${[['primary', 'Principale'], ['accent', 'Accent'], ['soft', 'Douce'], ['ink', 'Texte']].map(([k, l]) => `<div class="sw"><label class="swatch"><input type="color" value="${b[k]}" data-c="brandColor" data-k="${k}" aria-label="${l}"></label><b>${l}</b><input class="hex" value="${b[k]}" maxlength="7" data-c="brandHex" data-k="${k}" aria-label="Code ${l}"></div>`).join('')}</div>
    ${low ? '<div class="tip warn" style="margin-top:12px"><i>!</i><div>Le texte sur votre couleur principale est peu lisible. Choisissez une teinte plus foncée.</div></div>' : ''}
    ${sug ? `<div class="sugbox"><p class="kick" style="margin:0 0 8px">Proposition tirée de vos images</p><div class="row" style="gap:8px">${window._cols.cols.slice(0, 6).map(c => `<i class="dotc" style="background:${c.hex}" title="${c.hex}"></i>`).join('')}</div><div class="row" style="gap:8px;margin-top:10px">${['primary', 'accent', 'soft', 'ink'].map(k => `<span class="pchip"><i style="background:${sug[k]}"></i>${sug[k]}</span>`).join('')}</div><div class="btns" style="margin-top:10px"><button class="btn pri sm" data-a="sugApply">Appliquer</button><button class="btn ghost sm" data-a="sugClose">Ignorer</button></div></div>` : ''}
    <p class="kick" style="margin:18px 0 8px">Palettes prêtes</p><div class="pals">${PALETTES.map((x, i) => `<button class="pal" data-a="palApply" data-n="${i}" title="${x[0]}"><span>${x.slice(1).map(c => `<i style="background:${c}"></i>`).join('')}</span><small>${x[0]}</small></button>`).join('')}</div></div>
  <div class="card"><h3>Police des titres</h3><div class="fonts">${Object.entries(FONTS).map(([k, f]) => `<button class="fontopt ${b.font === k ? 'on' : ''}" data-a="setFont" data-f="${k}"><span style="font-family:${f.css};font-weight:${f.w}">${esc(P().business)}</span><small>${f.label}</small></button>`).join('')}</div></div>
  <div class="card"><h3>Ton</h3><div class="form" style="margin-top:12px"><div class="field"><label>Vous ou tu</label><div class="seg">${[['vous', 'Vouvoiement'], ['tu', 'Tutoiement']].map(([k, l]) => `<button class="${p.tone === k ? 'on' : ''}" data-a="setTone" data-t="${k}">${l}</button>`).join('')}</div></div>
    <label class="row"><input type="checkbox" ${b.emoji ? 'checked' : ''} data-c="set" data-path="brand.emoji"> Utiliser des emojis</label>
    <div class="field"><label for="cta">Bouton d’action</label><input id="cta" value="${esc(p.cta || '')}" data-i="set" data-path="profile.cta" placeholder="Réserver"></div>
    ${st.voice.fiche ? `<div class="tip"><i>✓</i><div>Votre voix : ${esc(st.voice.fiche.summary)} <a href="#/kit?t=voix">Voir</a></div></div>` : has(2) ? '<small class="mute">Affinez votre ton avec l’analyse de <a href="#/kit?t=voix">votre voix de marque</a>.</small>' : ''}</div></div></div>
  <div class="card sticky"><h3>Aperçu</h3>${chartePreview()}</div></div>`;
};
function chartePreview() {
  const b = st.brand, f = fontOf(), ph = (st.media.find(m => m.kind === 'photo') || {}).id, c1 = palette('Bleu'), c2 = palette('Clair');
  return `<div class="prev3">
  <div class="pv story" style="background:${c1.bg};color:${c1.fg}">${ph ? `<img class="fimg" data-media="${ph}" alt=""><i class="shade"></i>` : ''}<p class="who">${logoBadge()}${esc(P().handle)}</p><b style="font-family:${f.css};font-weight:${f.w};${ph ? 'color:#fff' : ''}">${esc(tidy(dot(P().value)))}</b><span style="background:${ph ? b.accent : c1.cb};color:${ph ? readableOn(b.accent) : c1.cf}">${esc(st.profile.cta || 'Réserver')}</span></div>
  <div class="pv post" style="background:${c2.bg};color:${c2.fg}"><small style="color:${c2.k}">CONSEIL</small><b style="font-family:${f.css};font-weight:${f.w}">${esc(postContent('Instagram', 'Post', 'Conseils').slides[0].t)}</b></div>
  <div class="pv page"><div style="background:${b.primary};color:${readableOn(b.primary)}"><div class="pvav">${b.logo ? `<img data-media="${esc(b.logo)}" alt="">` : esc(initials(P().business))}</div><b style="font-family:${f.css};font-weight:${f.w}">${esc(P().business)}</b></div><span style="background:${b.accent};color:${readableOn(b.accent)}">${esc(st.profile.cta || 'Réserver')}</span><span class="ln">Instagram</span><span class="ln">Mes prestations</span></div></div>
  <div class="row" style="margin-top:14px;gap:8px">${['primary', 'accent', 'soft', 'ink'].map(k => `<span class="pchip"><i style="background:${b[k]}"></i>${b[k]}</span>`).join('')}</div>`;
}
C.brandColor = el => { st.brand[el.dataset.k] = el.value; save(); refresh(); };
C.brandHex = el => { let v = el.value.trim(); if (!v.startsWith('#')) v = '#' + v; if (/^#[0-9a-f]{6}$/i.test(v) || /^#[0-9a-f]{3}$/i.test(v)) { st.brand[el.dataset.k] = v.toUpperCase(); save(); refresh(); } else toast('Code couleur invalide, par exemple #1E3A8A'); };
A.setFont = el => { st.brand.font = el.dataset.f; save(); ensureFonts().then(refresh); refresh(); };
A.setTone = el => { st.profile.tone = el.dataset.t; save(); refresh(); };
A.palApply = el => { const x = PALETTES[+el.dataset.n]; Object.assign(st.brand, { primary: x[1], accent: x[2], soft: x[3], ink: x[4] }); save(); refresh(); toast('Palette ' + x[0] + ' appliquée'); };
A.sugApply = () => { const s = window._cols && window._cols.sug; if (!s) return; Object.assign(st.brand, s); window._cols = null; save(); refresh(); toast('Couleurs appliquées'); };
A.sugClose = () => { window._cols = null; refresh(); };
A.logoUp = () => pickFiles({ multiple: false }, async f => { const r = await addMediaFiles(f, 'logo'); if (!r.length) return; setLogo(r[0].id); const cols = await extractColors([r[0].id]); window._cols = { cols, sug: suggestBrand(cols) }; refresh(); });
A.logoLib = () => mediaPicker({ title: 'Choisir le logo', multi: false, selected: [st.brand.logo].filter(Boolean) }, ids => { if (ids[0]) setLogo(ids[0]); refresh(); });
function setLogo(id) { st.media.forEach(m => { if (m.kind === 'logo' && m.id !== id) m.kind = 'photo'; }); const m = mediaMeta(id); if (m) m.kind = 'logo'; st.brand.logo = id; st.brand.logoOn = true; save(); }
A.logoDel = () => { const m = mediaMeta(st.brand.logo); if (m) m.kind = 'photo'; st.brand.logo = ''; save(); refresh(); };
A.logoColors = async () => { const cols = await extractColors([st.brand.logo]); window._cols = { cols, sug: suggestBrand(cols) }; refresh(); };
A.photoColorsPick = () => mediaPicker({ title: 'Choisissez 1 à 4 photos représentatives', multi: true }, async ids => { if (!ids.length) return; const cols = await extractColors(ids); window._cols = { cols, sug: suggestBrand(cols) }; refresh(); });
A.charteExport = async () => {
  const b = Object.assign({}, st.brand); let logo = '';
  if (b.logo) { const bl = await mediaBlob(b.logo); if (bl) logo = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(bl); }); }
  delete b.logo;
  download(`charte-${slug(P().business) || 'anza'}.json`, JSON.stringify({ anzaCharte: 1, brand: b, tone: st.profile.tone, cta: st.profile.cta, logo, voice: st.voice.fiche || null }, null, 2), 'application/json');
};
C.charteImport = el => {
  const f = el.files[0]; if (!f) return;
  const r = new FileReader();
  r.onload = async () => {
    try {
      const o = JSON.parse(r.result); if (!o || o.anzaCharte !== 1 || !o.brand) throw 0;
      ['primary', 'accent', 'soft', 'ink'].forEach(k => { if (/^#[0-9a-f]{3,8}$/i.test(o.brand[k] || '')) st.brand[k] = o.brand[k]; });
      if (FONT_KEYS.includes(o.brand.font)) st.brand.font = o.brand.font; st.brand.emoji = !!o.brand.emoji;
      if (o.tone === 'tu' || o.tone === 'vous') st.profile.tone = o.tone; if (typeof o.cta === 'string') st.profile.cta = o.cta.slice(0, 40);
      if (/^data:image\/(png|jpe?g|webp);base64,/.test(o.logo || '')) { const blob = new Blob([dataToBytes(o.logo)], { type: o.logo.slice(5, o.logo.indexOf(';')) }); const add = await addMediaFiles([new File([blob], 'logo.png', { type: blob.type })], 'logo'); if (add[0]) setLogo(add[0].id); }
      save(); refresh(); toast('Charte importée');
    } catch (e) { toast('Fichier de charte non reconnu'); }
  };
  r.readAsText(f);
};
A.chartePrint = async () => {
  const b = st.brand, f = fontOf(); let logo = '';
  if (b.logo) logo = await mediaURL(b.logo);
  const bi = bioVariants('instagram')[0], pit = pitches()[0].text;
  printDoc('Charte de marque', `${logo ? `<img class="logo" src="${logo}" alt="">` : ''}<h1>Charte de marque, ${esc(P().business)}</h1><h2>Couleurs</h2>${['primary', 'accent', 'soft', 'ink'].map((k, i) => `<span class="sw"><i style="background:${b[k]}"></i>${['Principale', 'Accent', 'Douce', 'Texte'][i]}<br>${b[k]}</span>`).join('')}<h2>Typographie</h2><p>Titres : <b>${f.family}</b> (${f.label}). Textes : Inter.</p><h2>Ton</h2><p>${st.profile.tone === 'tu' ? 'Tutoiement' : 'Vouvoiement'}, ${b.emoji ? 'emojis avec parcimonie' : 'sans emoji'}. Bouton d’action : « ${esc(st.profile.cta || 'Réserver')} ».${st.voice.fiche ? '<br>' + esc(st.voice.fiche.summary) : ''}</p><h2>Positionnement</h2><p>${esc(pit)}</p><h2>Bio Instagram</h2><pre>${esc(bi)}</pre>`);
};

const bioPick = {};
VIEWS.bio = () => {
  const plat = BIO_PLAT[route.q.p] ? route.q.p : 'instagram', meta = BIO_PLAT[plat];
  const ai = st.aiBios && st.aiBios[plat] && st.aiBios[plat].length ? st.aiBios[plat] : null;
  const list = (ai || []).concat(bioVariants(plat)).slice(0, 4), chosen = (st.bios || {})[plat];
  const link = pageLink();
  return `<div class="head"><div><p class="kick">Marque</p><h1>Vos bios</h1><p>Une présentation claire sur chaque plateforme, écrite pour ${icpReady() ? esc(primaryPersona().name) + ', votre client idéal' : 'vos clients idéaux'}. Le score vérifie qu’elle dit l’essentiel.</p></div>${aiOn() ? `<button class="btn sec" data-a="bioAI" data-p="${plat}" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : 'Écrire avec Nia'}</button>` : ''}</div>
  <div class="seg wrap" style="margin-bottom:16px">${Object.entries(BIO_PLAT).map(([k, v]) => `<button class="${plat === k ? 'on' : ''}" data-a="go" data-h="#/bio?p=${k}">${v.label}</button>`).join('')}</div>
  ${link ? `<div class="card tip" style="margin-bottom:16px"><i>${ic('link').replace('<svg', '<svg style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:2"')}</i><div>Votre lien à mettre en bio : <b>${esc(link)}</b> <button class="btn ghost sm" data-a="copyLink">Copier</button></div></div>` : `<div class="card tip" style="margin-bottom:16px"><i>!</i><div>Pas encore de lien en bio ? <a href="#/landing">Publiez votre page</a> : vos demandes arriveront directement dans vos clients.</div></div>`}
  <div class="grid g2 ${busy ? 'loading' : ''}">${chosen ? bioCard(chosen, plat, -1, true) : ''}${list.map((t, i) => bioCard(t, plat, i, false, ai && i < ai.length)).join('')}</div>`;
};
function bioCard(text, plat, i, mine, byNia) {
  const s = bioScore(text, plat), meta = BIO_PLAT[plat], len = [...String(text)].length;
  return `<div class="card bioc ${mine ? 'mine' : ''}"><div class="row" style="justify-content:space-between;flex-wrap:nowrap"><b>${mine ? 'Votre version' : byNia ? 'Proposition de Nia' : 'Proposition ' + (i + 1)}</b><span class="score s${s.score >= 80 ? 'hi' : s.score >= 50 ? 'mid' : 'lo'}">${s.score}</span></div>
  <textarea class="biota" data-i="bioEdit" data-p="${plat}" data-n="${i}" rows="${plat === 'about' || plat === 'google' ? 8 : 4}">${esc(text)}</textarea>
  <div class="row" style="justify-content:space-between"><small class="mute ${len > meta.max ? 'bad' : ''}" id="bl-${plat}-${i}">${len} sur ${meta.max} caractères</small><div class="btns"><button class="btn sec sm" data-a="bioCopy" data-p="${plat}" data-n="${i}">${ic('copy')}Copier</button>${mine ? '' : `<button class="btn ghost sm" data-a="bioKeep" data-p="${plat}" data-n="${i}">Garder</button>`}</div></div>
  <ul class="checks">${s.checks.map(c => `<li class="${c.ok ? 'ok' : ''}">${c.ok ? '✓' : '○'} ${c.l}</li>`).join('')}</ul></div>`;
}
I.bioEdit = el => { const n = $(`#bl-${el.dataset.p}-${el.dataset.n}`); if (n) n.textContent = `${[...el.value].length} sur ${BIO_PLAT[el.dataset.p].max} caractères`; if (el.dataset.n === '-1') { (st.bios = st.bios || {})[el.dataset.p] = el.value; clearTimeout(window._be); window._be = setTimeout(save, 600); } };
function bioText(el) { const ta = el.closest('.bioc').querySelector('textarea'); return ta ? ta.value : ''; }
A.bioCopy = el => copyText(bioText(el));
A.bioKeep = el => { (st.bios = st.bios || {})[el.dataset.p] = bioText(el); save(); refresh(); toast('Gardée comme votre version'); };
A.copyLink = () => copyText(pageLink());
A.bioAI = async el => {
  if (busy) return; const plat = el.dataset.p; busy = true; refresh();
  try { const r = await aiBioPlat(plat); st.aiBios = st.aiBios && !Array.isArray(st.aiBios.bios) ? st.aiBios : {}; st.aiBios[plat] = (r.bios || []).filter(Boolean).slice(0, 3).map(x => BIO_PLAT[plat].max <= 220 ? fitBio(x, BIO_PLAT[plat].max) : tidy(x).slice(0, BIO_PLAT[plat].max)); save(); toast('Bios écrites par Nia'); } catch (e) { toast(aiError(e)); }
  busy = false; refresh();
};

const KIT_TABS = [['voix', 'Voix de marque'], ['pitch', 'Pitch'], ['modeles', 'Visuels'], ['presse', 'Kit presse']];
VIEWS.kit = () => {
  if (!has(2)) return lockView(2, 'Le kit de marque est dans la Boutique', 'Votre voix de marque, vos pitchs prêts à envoyer, vos visuels aux couleurs de votre marque (highlights, bannières, carte de visite, flyer) et votre kit presse en PDF.');
  const t = KIT_TABS.some(x => x[0] === route.q.t) ? route.q.t : 'voix';
  return `<div class="head"><div><p class="kick">Marque</p><h1>Kit de marque</h1><p>Tout ce qu’il faut pour vous présenter partout de la même façon, en quelques clics.</p></div></div>
  <div class="seg wrap" style="margin-bottom:16px">${KIT_TABS.map(([k, l]) => `<button class="${t === k ? 'on' : ''}" data-a="go" data-h="#/kit?t=${k}">${l}</button>`).join('')}</div>${({ voix: kitVoice, pitch: kitPitch, modeles: kitModels, presse: kitPress })[t]()}`;
};
function kitVoice() {
  const v = st.voice, f = v.fiche, s = v.samples.length ? v.samples : ['', '', ''];
  return `<div class="grid g2"><div class="card"><h3>Vos textes</h3><p class="mute" style="font-size:14px;margin-top:6px">Collez deux à quatre textes que vous avez écrits vous même : une légende, un message à un client, une description. Anza en déduit votre façon de parler.</p><div class="form" style="margin-top:12px">${s.slice(0, 4).map((x, i) => `<textarea class="vs" rows="4" placeholder="Texte ${i + 1}" data-i="voiceSample" data-n="${i}">${esc(x)}</textarea>`).join('')}${s.length < 4 ? '<button class="btn ghost sm" data-a="voiceMore">Ajouter un texte</button>' : ''}
  <div class="btns"><button class="btn pri" data-a="voiceRun">${ic('spark')}Analyser ma voix</button>${has(3) && aiOn() ? `<button class="btn sec" data-a="voiceAI" ${busy ? 'disabled' : ''}>${busy ? 'Nia analyse' : 'Analyse approfondie avec Nia'}</button>` : !has(3) ? `<small class="mute">Analyse approfondie avec Nia ${lockTag(3)}</small>` : ''}</div></div></div>
  <div class="card ${busy ? 'loading' : ''}"><h3>Votre fiche de ton ${v.ai ? '<span class="tag ai">Nia</span>' : ''}</h3>${f ? `<p style="margin-top:10px;font-weight:700;font-size:17px">${esc(f.summary)}</p>
    <div class="grid g2" style="margin-top:12px"><div><p class="kick">À faire</p><ul class="dots">${f.dos.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div><div><p class="kick">À éviter</p><ul class="dots">${f.donts.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div></div>
    ${f.top && f.top.length ? `<p class="kick" style="margin-top:12px">Vos mots</p><div class="chips">${f.top.map(w => `<span class="chip on">${esc(w)}</span>`).join('')}</div>` : ''}
    ${f.examples && f.examples.length ? `<p class="kick" style="margin-top:12px">Exemples dans votre voix</p>${f.examples.map(x => `<p class="caption" style="margin-top:6px">${esc(x)}</p>`).join('')}` : ''}
    <button class="btn pri" style="margin-top:14px" data-a="voiceApply">Appliquer à tous mes contenus</button>` : '<p class="mute" style="margin-top:10px">Collez vos textes puis lancez l’analyse.</p>'}</div></div>`;
}
I.voiceSample = el => { const s = st.voice.samples.length ? st.voice.samples : ['', '', '']; s[+el.dataset.n] = el.value; st.voice.samples = s; clearTimeout(window._vs); window._vs = setTimeout(save, 600); };
A.voiceMore = () => { const s = st.voice.samples.length ? st.voice.samples : ['', '', '']; if (s.length < 4) s.push(''); st.voice.samples = s; save(); refresh(); };
A.voiceRun = () => { const s = st.voice.samples.filter(x => x && x.trim().length > 10); if (!s.length) { toast('Collez au moins un texte de quelques phrases'); return; } st.voice.fiche = analyzeVoice(s); st.voice.at = iso(Date.now()); st.voice.ai = false; save(); refresh(); };
A.voiceApply = () => { applyVoice(st.voice.fiche); save(); toast('Votre voix est appliquée : ton, emojis et longueur'); refresh(); };
A.voiceAI = async () => {
  const s = st.voice.samples.filter(x => x && x.trim().length > 10); if (!s.length) { toast('Collez au moins un texte de quelques phrases'); return; }
  if (busy) return; busy = true; refresh();
  try { const base = analyzeVoice(s), r = await aiVoice(s); st.voice.fiche = Object.assign(base, { summary: r.summary || base.summary, dos: r.dos && r.dos.length ? r.dos : base.dos, donts: r.donts && r.donts.length ? r.donts : base.donts, top: r.words && r.words.length ? r.words : base.top, examples: r.examples || [] }); st.voice.ai = true; st.voice.at = iso(Date.now()); save(); toast('Analyse de Nia prête'); } catch (e) { toast(aiError(e)); }
  busy = false; refresh();
};
function kitPitch() {
  const list = st.aiPitch && st.aiPitch.length ? st.aiPitch : pitches();
  return `<div class="row" style="justify-content:space-between;margin-bottom:12px"><p class="mute" style="font-size:14px">Écrits à partir de votre positionnement${icpReady() ? ' et de votre client idéal' : ''}. Remplacez ce qui est entre crochets.</p>${has(3) && aiOn() ? `<button class="btn sec sm" data-a="pitchAI" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : 'Réécrire avec Nia'}</button>` : ''}</div>
  <div class="grid g2 ${busy ? 'loading' : ''}">${list.map((p, i) => `<div class="card"><h3>${esc(p.label)} <button class="btn sec sm" data-a="pitchCopy" data-n="${i}">${ic('copy')}Copier</button></h3><p class="caption" style="margin-top:10px;white-space:pre-line">${esc(p.text)}</p></div>`).join('')}</div>${st.aiPitch && st.aiPitch.length ? '<button class="btn ghost sm" data-a="pitchReset" style="margin-top:12px">Revenir aux modèles</button>' : ''}`;
}
A.pitchCopy = el => { const list = st.aiPitch && st.aiPitch.length ? st.aiPitch : pitches(); copyText(list[+el.dataset.n].text); };
A.pitchReset = () => { st.aiPitch = null; save(); refresh(); };
A.pitchAI = async () => { if (busy) return; busy = true; refresh(); try { const r = await aiPitch(); const base = pitches(); st.aiPitch = base.map(p => ({ k: p.k, label: p.label, text: tidy((r[p.k] || p.text)) })); save(); toast('Pitchs réécrits par Nia'); } catch (e) { toast(aiError(e)); } busy = false; refresh(); };
const KIT_MODELS = [
  ['hl', 'Couvertures de highlights', 'Six couvertures pour vos stories à la une : avis, tarifs, coulisses, réserver, infos, avant après.', '9/16'],
  ['li', 'Bannière LinkedIn', 'Votre promesse, votre métier et votre logo, au bon format.', '4/1'],
  ['fb', 'Couverture Facebook', 'La même identité sur votre page Facebook.', '21/8'],
  ['card', 'Carte de visite', 'Recto et verso, avec un QR code vers votre page.', '7/4'],
  ['review', 'Story avis client', 'Transformez un avis en story élégante.', '9/16'],
  ['flyer', 'Flyer A5', 'À imprimer ou à déposer chez vos partenaires, avec QR code.', '5/7'],
  ['qr', 'QR code de ma page', 'Pour vos vitrines, cartes et comptoirs.', '1/1']
];
function kitModels() {
  return `<div class="grid g3">${KIT_MODELS.map(([k, t, d]) => `<div class="card kitm"><h3>${t}</h3><p class="mute" style="font-size:14px;margin-top:6px">${d}</p>${k === 'qr' || k === 'card' || k === 'flyer' ? (pageLink() ? '' : '<small class="mute">Publiez d’abord votre page pour le QR code.</small>') : ''}<button class="btn pri sm" style="margin-top:12px" data-a="kitGen" data-k="${k}">${ic('spark')}Créer</button></div>`).join('')}</div>`;
}
A.kitGen = async el => {
  const k = el.dataset.k;
  if (k === 'review') { modal('Story avis client', `<div class="form"><div class="field"><label for="rv-t">L’avis</label><textarea id="rv-t" rows="4" placeholder="Collez les mots exacts de votre client">${esc((st.page.reviews[0] || {}).text || '')}</textarea></div><div class="field"><label for="rv-n">Prénom</label><input id="rv-n" value="${esc((st.page.reviews[0] || {}).name || '')}"></div><div class="btns" style="justify-content:flex-end"><button class="btn pri" data-a="kitReviewGo">Créer</button></div></div>`); return; }
  el.disabled = true;
  try {
    let imgs = [];
    if (k === 'hl') imgs = (await kitHighlights('marque')).concat(await kitHighlights('clair'));
    if (k === 'li') imgs = await kitBanner('linkedin');
    if (k === 'fb') imgs = await kitBanner('facebook');
    if (k === 'card') imgs = await kitCard();
    if (k === 'flyer') imgs = await kitFlyer();
    if (k === 'qr') { imgs = await kitQr(); if (!imgs.length) { toast('Publiez d’abord votre page'); el.disabled = false; return; } }
    kitShow(imgs, KIT_MODELS.find(x => x[0] === k));
  } catch (e) { toast('Création impossible, réessayez'); }
  el.disabled = false;
};
A.kitReviewGo = async () => { const imgs = await kitReview(val('rv-t').trim(), val('rv-n').trim()); kitShow(imgs, KIT_MODELS.find(x => x[0] === 'review')); };
function kitShow(imgs, m) {
  window._kit = imgs;
  modal(m[1], `<div class="kitgrid">${imgs.map((x, i) => `<a href="${x.data}" download="${x.name}.png" data-keep="1"><img src="${x.data}" alt="${esc(x.name)}" style="aspect-ratio:${m[3]}"></a>`).join('')}</div><div class="btns" style="margin-top:14px;justify-content:flex-end"><button class="btn pri" data-a="kitDl">${ic('dl')}Tout télécharger</button></div>`, true);
}
A.kitDl = () => { const l = window._kit || []; if (l.length === 1) download(l[0].name + '.png', l[0].data); else downloadBlob('kit-de-marque.zip', makeZip(l.map(x => ({ name: x.name + '.png', data: dataToBytes(x.data) })))); };
function kitPress() {
  const ph = st.page.gallery.length ? st.page.gallery : st.media.filter(m => m.kind === 'photo').map(m => m.id);
  return `<div class="grid g2"><div class="card"><h3>Votre kit presse</h3><p class="mute" style="font-size:14px;margin-top:6px">Une page claire pour démarcher un partenaire, une boutique, un lieu ou un média : qui vous êtes, ce que vous faites, vos chiffres, vos photos et vos contacts.</p>
  <div class="form" style="margin-top:12px"><div class="field"><label for="kp-y">Année de création</label><input id="kp-y" type="number" min="1950" max="${new Date().getFullYear()}" value="${esc((st.press || {}).year || '')}" placeholder="${new Date().getFullYear()}"></div>
  <div class="field"><label for="kp-n">Un chiffre dont vous êtes fier</label><input id="kp-n" value="${esc((st.press || {}).fact || '')}" placeholder="Par exemple : 120 clientes accompagnées"></div>
  <div class="field"><label for="kp-p">Ce que vous proposez aux partenaires</label><textarea id="kp-p" rows="3" placeholder="Par exemple : ateliers en boutique, offres croisées, contenus en commun">${esc((st.press || {}).offer || '')}</textarea></div>
  <p class="mute" style="font-size:13px">${ph.length ? `${Math.min(3, ph.length)} photos de ${st.page.gallery.length ? 'votre galerie' : 'votre photothèque'} seront ajoutées.` : 'Ajoutez des photos dans la photothèque pour les voir dans le kit.'}</p>
  <button class="btn pri" data-a="pressGo">${ic('print')}Créer le PDF</button></div></div>
  <div class="card"><h3>Comment l’envoyer</h3><ul class="dots" style="margin-top:8px"><li>Dans la fenêtre d’impression, choisissez « Enregistrer en PDF ».</li><li>Joignez le PDF à un email court : qui vous êtes en une phrase, ce que vous proposez, et une question simple pour ouvrir la discussion.</li><li>Relancez une fois après une semaine, pas plus.</li></ul></div></div>`;
}
A.pressGo = async () => {
  st.press = { year: val('kp-y'), fact: val('kp-n').trim(), offer: val('kp-p').trim() }; save();
  const b = st.brand, pr = st.profile, p = P(), logo = b.logo ? await mediaURL(b.logo) : '';
  const ids = (st.page.gallery.length ? st.page.gallery : st.media.filter(m => m.kind === 'photo').map(m => m.id)).slice(0, 3);
  const photos = []; for (const id of ids) { const bl = await mediaBlob(id); if (bl) photos.push(await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(bl); })); }
  const logoData = b.logo ? await (async () => { const bl = await mediaBlob(b.logo); return bl ? new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(bl); }) : ''; })() : '';
  const facts = [st.press.year ? `Depuis ${st.press.year}` : '', st.clients.length > 5 ? `${st.clients.length} clients accompagnés` : '', st.press.fact].filter(Boolean);
  printDoc(`Kit presse ${p.business}`, `${logoData ? `<img class="logo" src="${logoData}" alt="">` : ''}<h1>${esc(p.business)}</h1><p style="font-size:18px">${esc(uc(p.activity))}${pr.city ? ', ' + esc(pr.city) : ''}</p><p style="font-size:20px;font-weight:700;color:${b.primary}">${esc(dot(p.value))}</p>
  ${photos.length ? `<p>${photos.map(src => `<img class="ph" src="${src}" alt="">`).join('')}</p>` : ''}
  <h2>L’histoire</h2><p>${esc(dot(p.story))}</p><h2>Pour qui</h2><p>${esc(dot(p.target))}</p>${facts.length ? `<h2>En chiffres</h2><ul>${facts.map(f => `<li>${esc(f)}</li>`).join('')}</ul>` : ''}
  ${st.services.length ? `<h2>Prestations</h2><ul>${st.services.slice(0, 8).map(s => `<li>${esc(s.name)}, ${eur(s.price)}</li>`).join('')}</ul>` : ''}
  <h2>Ce qu’en disent les clients</h2><p>${esc(dot(p.proof))}</p>${st.press.offer ? `<h2>Travailler ensemble</h2><p>${esc(st.press.offer)}</p>` : ''}
  <h2>Contact</h2><p>${esc(pr.name || pr.first || '')}<br>${esc(pr.email || '')}${pr.phone ? '<br>' + esc(pr.phone) : ''}${pr.instagram ? '<br>Instagram : @' + esc(pr.instagram) : ''}${pageLink() ? '<br>' + esc(pageLink()) : ''}</p>`);
};

VIEWS.cgv = () => {
  if (!has(2)) return lockView(2, 'Les conditions de vente sont dans la Boutique', 'Des conditions générales de vente pré remplies avec vos informations : acompte, annulation, retard, rétractation. À afficher sur votre page et à joindre à vos devis.');
  const o = Object.assign({ cancel: 48, deposit: st.profile.depositPct || 30, depositRefund: 'non', late: 15, when: 'le jour de la prestation', means: 'espèces, carte bancaire, virement', mediator: '' }, st.cgv || {});
  return `<div class="head"><div><p class="kick">Vendre</p><h1>Conditions de vente</h1><p>Vos conditions générales pré remplies avec vos informations. Elles protègent votre temps et rassurent vos clients.</p></div><div class="btns"><button class="btn sec" data-a="cgvCopy">${ic('copy')}Copier</button><button class="btn pri" data-a="cgvPrint">${ic('print')}PDF</button></div></div>
  <div class="grid g12"><div class="card"><div class="form">
    <div class="grid g2"><div class="field"><label for="cg-c">Délai d’annulation (heures)</label><input id="cg-c" type="number" min="0" value="${o.cancel}" data-c="cgv" data-k="cancel"></div><div class="field"><label for="cg-d">Acompte (%)</label><input id="cg-d" type="number" min="0" max="100" value="${o.deposit}" data-c="cgv" data-k="deposit"></div></div>
    <div class="field"><label for="cg-r">Acompte remboursé si annulation dans les délais</label><select id="cg-r" data-c="cgv" data-k="depositRefund"><option value="oui" ${o.depositRefund === 'oui' ? 'selected' : ''}>Oui</option><option value="non" ${o.depositRefund !== 'oui' ? 'selected' : ''}>Non, il reste acquis</option></select></div>
    <div class="grid g2"><div class="field"><label for="cg-l">Retard toléré (minutes)</label><input id="cg-l" type="number" min="0" value="${o.late}" data-c="cgv" data-k="late"></div><div class="field"><label for="cg-w">Paiement du solde</label><input id="cg-w" value="${esc(o.when)}" data-c="cgv" data-k="when"></div></div>
    <div class="field"><label for="cg-m">Moyens de paiement</label><input id="cg-m" value="${esc(o.means)}" data-c="cgv" data-k="means"></div>
    <div class="field"><label for="cg-me">Médiateur de la consommation</label><input id="cg-me" value="${esc(o.mediator)}" data-c="cgv" data-k="mediator" placeholder="Nom et site internet du médiateur"><small>Obligatoire si vous vendez à des particuliers. Votre fédération ou votre chambre de métiers peut vous en indiquer un.</small></div>
    <label class="row"><input type="checkbox" ${st.page.cgv ? 'checked' : ''} data-c="set" data-path="page.cgv"> Afficher ces conditions sur ma page</label>
    <div class="tip"><i>!</i><div>Modèle à adapter à votre situation. Il ne remplace pas l’avis d’un professionnel du droit.</div></div></div></div>
  <div class="card"><pre class="cgv" id="cgvtxt">${esc(cgvText(o))}</pre></div></div>`;
};
C.cgv = el => { st.cgv = Object.assign({}, st.cgv || {}, { [el.dataset.k]: el.type === 'number' ? Math.max(0, +el.value || 0) : el.value }); save(); refresh(); };
A.cgvCopy = () => copyText(cgvText(Object.assign({}, st.cgv || {})));
A.cgvPrint = () => printDoc('Conditions générales de vente', `<pre>${esc(cgvText(Object.assign({}, st.cgv || {})))}</pre>`);

VIEWS.net = () => {
  const pr = st.profile, now = new Date(), y = now.getFullYear(), ca = yearRevenue(y), N = netCalc(ca), cur = monthRevenue(0), Nm = netCalc(cur.v);
  const ceiling = (URSSAF[pr.urssaf] || URSSAF.services).ceiling, tva = +pr.tvaThreshold || N.u.tva;
  const pc = Math.min(100, Math.round(ca / ceiling * 100)), pt = Math.min(100, Math.round(ca / tva * 100));
  const months = [5, 4, 3, 2, 1, 0].map(monthRevenue);
  const nextDecl = pr.period === 'trimestrielle' ? new Date(y, Math.floor(now.getMonth() / 3) * 3 + 4, 0) : new Date(y, now.getMonth() + 2, 0);
  return `<div class="head"><div><p class="kick">Piloter</p><h1>Net en poche</h1><p>Ce qui vous reste vraiment, une fois vos cotisations payées. Calculé automatiquement à partir des prestations enregistrées dans vos clients et de vos devis acceptés.</p></div></div>
  <div class="grid g4"><div class="card kpi"><p>Encaissé, ${MONTHS_FULL[now.getMonth()]}</p><strong>${eur(cur.v)}</strong><span>${eur(Nm.net)} net</span></div><div class="card kpi"><p>Encaissé en ${y}</p><strong>${eur(ca)}</strong><span>depuis janvier</span></div><div class="card kpi"><p>Cotisations estimées</p><strong>${eur(N.cot + N.vl)}</strong><span>${String(N.rate).replace('.', ',')} %${pr.vl ? ' + impôt' : ''}</span></div><div class="card kpi big"><p>Net dans votre poche</p><strong>${eur(N.net)}</strong><span>en ${y}</span></div></div>
  <div class="grid g21" style="margin-top:16px"><div class="card"><h3>Mois par mois</h3><div class="tablewrap"><table class="table" style="margin-top:8px"><thead><tr><th>Mois</th><th>Encaissé</th><th>Cotisations</th><th>Net</th></tr></thead><tbody>${months.map(m => { const n = netCalc(m.v); return `<tr><td>${MONTHS_FULL[m.m]}</td><td>${eur(m.v)}</td><td>${eur(n.cot + n.vl)}</td><td><b>${eur(n.net)}</b></td></tr>`; }).join('')}</tbody></table></div>
    <div class="tip" style="margin-top:14px"><i>!</i><div>Déclaration ${pr.period} à faire avant le <b>${fdate(nextDecl)}</b> sur autoentrepreneur.urssaf.fr. Mettez de côté vos cotisations dès que vous encaissez.</div></div></div>
  <div class="grid" style="align-content:start"><div class="card"><h3>Vos seuils ${y}</h3><p class="mute" style="font-size:13px;margin-top:10px">Plafond de la micro entreprise</p><p style="font-weight:800;font-size:20px">${eur(ca)} <small class="mute" style="font-size:13px">sur ${eur(ceiling)}</small></p><div class="meter"><i style="width:${pc}%"></i></div>
    <p class="mute" style="font-size:13px;margin-top:14px">Franchise de TVA</p><p style="font-weight:800;font-size:20px">${pt} %</p><div class="meter ${pt >= 80 ? 'warn' : ''}"><i style="width:${pt}%"></i></div>${pt >= 80 ? '<small class="bad">Vous approchez du seuil : anticipez le passage à la TVA.</small>' : ''}</div>
  <div class="card"><h3>Votre situation</h3><div class="form" style="margin-top:12px"><div class="field"><label for="u-t">Activité</label><select id="u-t" data-c="set" data-path="profile.urssaf" data-live="1">${Object.entries(URSSAF).map(([k, v]) => `<option value="${k}" ${pr.urssaf === k ? 'selected' : ''}>${v.label}, ${String(v.rate).replace('.', ',')} %</option>`).join('')}</select></div>
    <label class="row" style="flex-wrap:nowrap;align-items:flex-start"><input type="checkbox" ${pr.vl ? 'checked' : ''} data-c="set" data-path="profile.vl" data-live="1"> <span>J’ai opté pour le versement libératoire de l’impôt</span></label>
    <div class="grid g2"><div class="field"><label for="u-r">Taux personnalisé (%)</label><input id="u-r" value="${esc(pr.rateOverride)}" placeholder="Par exemple ACRE" data-c="set" data-path="profile.rateOverride" data-live="1"></div><div class="field"><label for="u-v">Seuil de TVA (€)</label><input id="u-v" type="number" value="${pr.tvaThreshold || N.u.tva}" data-c="set" data-num data-path="profile.tvaThreshold" data-live="1"></div></div>
    <div class="field"><label for="u-p">Déclaration</label><select id="u-p" data-c="set" data-path="profile.period" data-live="1">${['mensuelle', 'trimestrielle'].map(x => `<option ${pr.period === x ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
    <small class="mute">Taux 2026 de l’URSSAF, hors contribution à la formation professionnelle (0,1 à 0,3 %). Estimation indicative : vérifiez toujours sur autoentrepreneur.urssaf.fr et impots.gouv.fr.</small></div></div></div></div>`;
};
