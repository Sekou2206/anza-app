const MAX_FRAMES = 10;
const isTouch = () => matchMedia('(pointer: coarse)').matches;

function storyDraft() {
  const d = st.drafts;
  if (!d.story || !Array.isArray(d.story.frames) || !d.story.frames.length) d.story = { type: 'Offre', style: 'Bleu', subj: '', lay: 'photo', frames: storyFrames('Offre', '').map(f => Object.assign({ img: '', lay: '', pos: '' }, f)), ai: false };
  return d.story;
}
function postDraft() {
  const d = st.drafts;
  if (!d.post || !Array.isArray(d.post.slides) || !d.post.slides.length) {
    const out = postContent('Instagram', 'Carrousel', 'Erreurs', '');
    d.post = { net: 'Instagram', format: 'Carrousel', angle: 'Erreurs', subj: '', style: 'Bleu', ratio: '45', alt: true, lay: 'photo', slides: out.slides.map(f => Object.assign({ img: '', lay: '', pos: '' }, f)), caption: out.caption, tags: out.tags, ai: false };
  }
  return d.post;
}
function keepPhotos(oldList, newList) { return newList.map((f, i) => Object.assign({ img: '', lay: '', pos: '' }, f, oldList[i] ? { img: oldList[i].img || '', lay: oldList[i].lay || '', pos: oldList[i].pos || '' } : {})); }
function frameBg(f, i, n, kind, d) {
  const c = previewStyle(f, i, n, { kind, style: d.style, alt: d.alt });
  const lay = f.img ? (f.lay && f.lay !== 'texte' ? f.lay : 'photo') : 'texte';
  return { c, lay, fg: lay === 'photo' ? '#FFFFFF' : c.fg };
}
function photoTag(id, pos, cls) { return id ? `<img class="${cls || 'fimg'}" data-media="${esc(id)}" alt="" style="object-position:center ${pos === 'top' ? 'top' : pos === 'bottom' ? 'bottom' : 'center'}">` : ''; }
function logoBadge() { return st.brand.logo && st.brand.logoOn ? `<img class="flogo" data-media="${esc(st.brand.logo)}" alt="">` : ''; }
function photoStrip(list, kind) {
  const used = [...new Set(list.map(f => f.img).filter(Boolean))];
  return `<div class="field"><label>Vos photos</label>
    <div class="pstrip">${used.map(id => `<div class="pth">${photoTag(id, 'center', '')}</div>`).join('')}
    <button class="pth add" data-a="studioUpload" data-k="${kind}" title="Importer des photos">${ic('up')}<span>Importer</span></button>
    <button class="pth add" data-a="studioLib" data-k="${kind}" title="Choisir dans la photothèque">${ic('image')}<span>Photothèque</span></button></div>
    <small>${used.length ? `${plural(used.length, 'photo utilisée', 'photos utilisées')}. Touchez une image pour changer sa photo.` : 'Importez vos photos : elles s’intègrent directement dans les images, avec votre texte par dessus.'}</small></div>`;
}
function ideasRow(kind) {
  const list = dailyIdeas().filter(x => kind === 'story' ? /stories/.test(x.h) : /posts/.test(x.h));
  const occ = currentOccasion();
  const chips = list.map(x => `<button class="idea" data-a="go" data-h="${esc(x.h)}"><b>${esc(x.t)}</b><span>${esc(x.w)}</span></button>`);
  if (!chips.length && occ) chips.push(`<button class="idea" data-a="go" data-h="#/${kind === 'story' ? 'stories?type=Occasion' : 'posts?angle=Occasion'}"><b>${esc(occ.name)} ${inDays(occ.days)}</b><span>Préparez un contenu spécial.</span></button>`);
  return chips.length ? `<div class="ideas"><p class="kick" style="margin:0 0 8px">Idées du moment</p>${chips.join('')}</div>` : '';
}

VIEWS.stories = () => {
  const d = storyDraft(), q = route.q;
  if (q.type || q.subj != null) {
    const type = STORY_TYPES.includes(q.type) ? q.type : d.type;
    d.type = type; d.subj = q.subj || ''; d.frames = keepPhotos(d.frames, storyFrames(type, d.subj)); d.ai = false; save();
    history.replaceState(null, '', '#/stories'); route.q = {};
  }
  const n = d.frames.length;
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Stories</h1><p>Choisissez une histoire, ajoutez vos photos : Anza écrit et met en page vos stories, à vos couleurs et dans votre ton. Touchez un texte pour le modifier.</p></div>
  <div class="btns"><button class="btn sec" data-a="storyCal">${ic('cal')}Planifier</button><button class="btn sec" data-a="studioDl" data-k="story">${ic('dl')}Télécharger</button><button class="btn pri" data-a="studioPub" data-k="story">${ic('share')}Publier</button></div></div>
  <div class="grid g12"><div class="card"><div class="form">
    ${ideasRow('story')}
    <div class="field"><label>Type d’histoire</label><div class="seg wrap">${STORY_TYPES.map(t => `<button class="${d.type === t ? 'on' : ''}" data-a="storyType" data-t="${t}">${t}</button>`).join('')}</div>${d.type === 'Occasion' ? `<small>${currentOccasion() ? `Prochaine occasion : ${esc(currentOccasion().name)}, ${inDays(currentOccasion().days)}.` : 'Aucune fête proche : Anza prend la prochaine du calendrier.'}</small>` : d.type === 'Objection' ? `<small>${icpReady() ? 'Tirée des hésitations de votre client idéal.' : 'Définissez votre <a href="#/icp">client idéal</a> pour des objections plus justes.'}</small>` : ''}</div>
    <div class="field"><label for="sj">Sujet ou détail</label><input id="sj" value="${esc(d.subj)}" placeholder="${d.type === 'Preuve' ? 'Prénom du client' : 'Exemple : places du mois de mars'}"><small>Facultatif.</small></div>
    ${photoStrip(d.frames, 'story')}
    <div class="field"><label>Mise en page des photos</label><div class="seg wrap">${LAYOUTS.filter(l => l[0] !== 'texte').map(([k, l]) => `<button class="${d.lay === k ? 'on' : ''}" data-a="studioLay" data-k="story" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label>Fond</label><div class="seg">${STYLES.map(([k, l]) => `<button class="${d.style === k ? 'on' : ''}" data-a="studioStyle" data-k="story" data-v="${k}">${l}</button>`).join('')}</div></div>
    ${logoToggle()}
    <button class="btn pri" data-a="storyGen" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : aiOn() ? 'Écrire avec Nia' : 'Réécrire la séquence'}</button>
    <div class="tip"><i>N</i><div>${st.profile.value ? `Anza s’appuie sur votre promesse « ${esc(st.profile.value)} »${icpReady() ? ` et sur ${esc(primaryPersona().name)}, votre client idéal` : ''}.` : 'Faites l’entretien avec Nia pour des textes vraiment personnalisés.'}</div></div></div></div>
  <div class="card ${busy ? 'loading' : ''}"><h3>Votre séquence <small>${n} stories${d.ai ? ' · écrite par Nia' : ''}</small></h3><div class="frames" style="margin-top:14px">${d.frames.map((f, i) => storyTile(f, i, n, d)).join('')}${n < MAX_FRAMES ? `<button class="frame addf" data-a="frameAdd" data-k="story">${ic('plus')}<span>Ajouter une story</span></button>` : ''}</div></div></div>`;
};
function storyTile(f, i, n, d) {
  const { c, lay, fg } = frameBg(f, i, n, 'story', d);
  return `<div class="frame lay-${lay}" style="background:${c.bg};color:${fg};--tf:${fontFam()}">${photoTag(f.img, f.pos)}${lay === 'photo' ? '<i class="shade"></i>' : ''}
    <div class="bars2">${d.frames.map((x, k) => `<i class="${k <= i ? 'on' : ''}"></i>`).join('')}</div><p class="who">${logoBadge()}${esc(P().handle)}</p><span class="num">${i + 1}</span>
    <div class="ftext"><p class="ft" contenteditable="true" data-i="frameText" data-k="story" data-n="${i}" data-f="t">${esc(f.t)}</p>${f.s || lay === 'texte' ? `<p class="fs" contenteditable="true" data-i="frameText" data-k="story" data-n="${i}" data-f="s">${esc(f.s)}</p>` : ''}</div>${f.c ? `<p class="fc" style="background:${lay === 'photo' ? st.brand.accent : c.cb};color:${lay === 'photo' ? readableOn(st.brand.accent) : c.cf}">${esc(f.c)}</p>` : ''}
    <div class="ftools"><button data-a="frameOpen" data-k="story" data-n="${i}" aria-label="Modifier la story ${i + 1}">${ic('edit')}</button><button data-a="framePhoto" data-k="story" data-n="${i}" aria-label="Photo de la story ${i + 1}">${ic('image')}</button></div></div>`;
}
function logoToggle() {
  return st.brand.logo ? `<label class="row"><input type="checkbox" ${st.brand.logoOn ? 'checked' : ''} data-c="set" data-path="brand.logoOn" data-live="1"> Afficher mon logo</label>` : `<small class="mute">Ajoutez votre logo dans la <a href="#/charte">Charte</a> pour le voir sur vos images.</small>`;
}
A.storyType = el => { const d = storyDraft(); d.type = el.dataset.t; d.subj = val('sj'); d.frames = keepPhotos(d.frames, storyFrames(d.type, d.subj)); d.ai = false; save(); refresh(); };
A.studioStyle = el => { const d = el.dataset.k === 'story' ? storyDraft() : postDraft(); d.style = el.dataset.v; save(); refresh(); };
A.studioLay = el => { const d = el.dataset.k === 'story' ? storyDraft() : postDraft(); d.lay = el.dataset.v; (d.frames || d.slides).forEach(f => { if (f.img) f.lay = d.lay; }); save(); refresh(); };
A.storyGen = async () => {
  if (busy) return; const d = storyDraft(); d.subj = val('sj');
  if (aiOn()) { busy = true; refresh(); try { d.frames = keepPhotos(d.frames, await aiStory(d.type, d.subj)); d.ai = true; busy = false; save(); refresh(); toast('Séquence écrite par Nia'); return; } catch (e) { busy = false; toast(aiError(e)); } }
  d.frames = keepPhotos(d.frames, storyFrames(d.type, d.subj)); d.ai = false; save(); refresh(); toast('Séquence réécrite');
};
I.frameText = el => { const d = el.dataset.k === 'story' ? storyDraft() : postDraft(), list = d.frames || d.slides, f = list[+el.dataset.n]; if (!f) return; f[el.dataset.f] = el.textContent.replace(/\s+/g, ' ').trim(); clearTimeout(window._ft); window._ft = setTimeout(save, 500); };
A.storyCal = () => { const d = storyDraft(); planModal('Story', d.type, 'Story ' + d.type.toLowerCase() + ', ' + d.frames[0].t); };

function draftList(k) { return k === 'story' ? storyDraft().frames : postDraft().slides; }
A.frameAdd = el => {
  const k = el.dataset.k, list = draftList(k);
  if (list.length >= MAX_FRAMES) return;
  list.push(k === 'story' ? { t: 'Nouveau titre.', s: '', c: '', img: '', lay: '', pos: '' } : { k: 'NOUVELLE', t: 'Nouveau titre.', p: '', img: '', lay: '', pos: '' });
  save(); refresh(); A.frameOpen({ dataset: { k, n: list.length - 1 } });
};
A.frameOpen = el => {
  const k = el.dataset.k, n = +el.dataset.n, f = draftList(k)[n]; if (!f) return;
  const story = k === 'story', list = draftList(k);
  modal(`${story ? 'Story' : 'Slide'} ${n + 1}`, `<div class="form">
    ${story ? '' : `<div class="field"><label for="fe-k">Surtitre</label><input id="fe-k" value="${esc(f.k)}" maxlength="40"></div>`}
    <div class="field"><label for="fe-t">Titre</label><textarea id="fe-t" rows="2">${esc(f.t)}</textarea></div>
    <div class="field"><label for="fe-s">Phrase d’appui</label><textarea id="fe-s" rows="2">${esc(story ? f.s : f.p)}</textarea></div>
    ${story ? `<div class="field"><label for="fe-c">Bouton</label><input id="fe-c" value="${esc(f.c)}" placeholder="Laissez vide pour ne pas en mettre" maxlength="34"></div>` : ''}
    <div class="field"><label>Photo</label><div class="row" style="gap:10px">${f.img ? `<div class="pth big">${photoTag(f.img, f.pos, '')}</div>` : ''}<button class="btn sec sm" data-a="framePhoto" data-k="${k}" data-n="${n}">${ic('image')}${f.img ? 'Changer' : 'Choisir une photo'}</button>${f.img ? `<button class="btn ghost sm" data-a="frameNoPhoto" data-k="${k}" data-n="${n}">Retirer</button>` : ''}</div></div>
    ${f.img ? `<div class="field"><label>Mise en page</label><div class="seg wrap">${LAYOUTS.filter(l => l[0] !== 'texte').map(([v, l]) => `<button class="${(f.lay || 'photo') === v ? 'on' : ''}" data-a="frameSet" data-k="${k}" data-n="${n}" data-f="lay" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="field"><label>Cadrage de la photo</label><div class="seg">${[['top', 'Haut'], ['', 'Centre'], ['bottom', 'Bas']].map(([v, l]) => `<button class="${(f.pos || '') === v ? 'on' : ''}" data-a="frameSet" data-k="${k}" data-n="${n}" data-f="pos" data-v="${v}">${l}</button>`).join('')}</div></div>` : ''}
    <div class="field"><label>Fond de cette image</label><div class="seg wrap"><button class="${!f.style ? 'on' : ''}" data-a="frameSet" data-k="${k}" data-n="${n}" data-f="style" data-v="">Comme les autres</button>${STYLES.map(([v, l]) => `<button class="${f.style === v ? 'on' : ''}" data-a="frameSet" data-k="${k}" data-n="${n}" data-f="style" data-v="${v}">${l}</button>`).join('')}</div></div>
    <div class="btns" style="justify-content:space-between"><div class="btns"><button class="btn ghost sm" data-a="frameMove" data-k="${k}" data-n="${n}" data-d="-1" ${n === 0 ? 'disabled' : ''}>Avancer</button><button class="btn ghost sm" data-a="frameMove" data-k="${k}" data-n="${n}" data-d="1" ${n === list.length - 1 ? 'disabled' : ''}>Reculer</button><button class="btn ghost sm" data-a="frameDup" data-k="${k}" data-n="${n}" ${list.length >= MAX_FRAMES ? 'disabled' : ''}>Dupliquer</button>${list.length > 1 ? `<button class="btn danger sm" data-a="frameDel" data-k="${k}" data-n="${n}">Supprimer</button>` : ''}</div>
    <button class="btn pri" data-a="frameSave" data-k="${k}" data-n="${n}">Enregistrer</button></div></div>`);
  hydrateMedia($('#modal'));
};
function frameSaveFields(k, n) {
  const f = draftList(k)[n]; if (!f || !$('#fe-t')) return;
  f.t = val('fe-t').trim(); if (k === 'story') { f.s = val('fe-s').trim(); f.c = val('fe-c').trim(); } else { f.p = val('fe-s').trim(); f.k = val('fe-k').trim(); }
}
A.frameSave = el => { frameSaveFields(el.dataset.k, +el.dataset.n); save(); closeModal(); refresh(); };
A.frameSet = el => { const k = el.dataset.k, n = +el.dataset.n; frameSaveFields(k, n); draftList(k)[n][el.dataset.f] = el.dataset.v; save(); refresh(); A.frameOpen(el); };
A.frameNoPhoto = el => { const k = el.dataset.k, n = +el.dataset.n; frameSaveFields(k, n); const f = draftList(k)[n]; f.img = ''; f.lay = ''; save(); refresh(); A.frameOpen(el); };
A.frameMove = el => { const k = el.dataset.k, n = +el.dataset.n, j = n + (+el.dataset.d), l = draftList(k); frameSaveFields(k, n); if (j < 0 || j >= l.length) return; [l[n], l[j]] = [l[j], l[n]]; save(); refresh(); A.frameOpen({ dataset: { k, n: j } }); };
A.frameDup = el => { const k = el.dataset.k, n = +el.dataset.n, l = draftList(k); frameSaveFields(k, n); if (l.length >= MAX_FRAMES) return; l.splice(n + 1, 0, Object.assign({}, l[n])); save(); closeModal(); refresh(); };
A.frameDel = el => { const k = el.dataset.k, l = draftList(k); if (l.length < 2) return; l.splice(+el.dataset.n, 1); save(); closeModal(); refresh(); };
A.framePhoto = el => {
  const k = el.dataset.k, n = +el.dataset.n, d = k === 'story' ? storyDraft() : postDraft();
  if ($('#fe-t')) frameSaveFields(k, n);
  mediaPicker({ title: `Photo de ${k === 'story' ? 'la story' : 'la slide'} ${n + 1}`, multi: false, selected: [draftList(k)[n].img].filter(Boolean) }, ids => {
    const f = draftList(k)[n]; f.img = ids[0] || ''; if (f.img && !f.lay) f.lay = d.lay || 'photo'; save(); refresh();
  });
};
A.studioUpload = el => {
  const k = el.dataset.k;
  pickFiles({ multiple: true }, async files => { toast('Import en cours'); const added = await addMediaFiles(files, 'photo'); if (added.length) { distribute(k, added.map(m => m.id)); refresh(); } });
};
A.studioLib = el => { const k = el.dataset.k; mediaPicker({ title: 'Choisir des photos', multi: true, selected: [...new Set(draftList(k).map(f => f.img).filter(Boolean))] }, ids => { distribute(k, ids, true); refresh(); }); };
function distribute(k, ids, replace) {
  const d = k === 'story' ? storyDraft() : postDraft(), list = draftList(k);
  if (replace) list.forEach(f => { if (f.img && !ids.includes(f.img)) { f.img = ''; f.lay = ''; } });
  let free = list.filter(f => !f.img);
  const queue = ids.filter(id => !list.some(f => f.img === id));
  queue.forEach(id => { let f = free.shift(); if (!f && list.length < MAX_FRAMES) { f = k === 'story' ? { t: '', s: '', c: '', img: '', lay: '', pos: '' } : { k: '', t: '', p: '', img: '', lay: '', pos: '' }; list.splice(Math.max(0, list.length - 1), 0, f); } if (f) { f.img = id; f.lay = d.lay || 'photo'; } });
  save();
}

function mediaPicker(o, done) {
  window._mp = { o, done, sel: [...(o.selected || [])] };
  const photos = st.media;
  modal(o.title || 'Photothèque', `<div class="mp-top"><button class="btn sec sm" data-a="mpUpload">${ic('up')}Importer des photos</button><small class="mute">${st.media.length} sur ${photoLimit()}</small></div>
  <div class="mgrid" id="mpgrid">${photos.map(m => `<button class="mcell ${window._mp.sel.includes(m.id) ? 'sel' : ''}" data-a="mpToggle" data-id="${m.id}"><img data-media="${m.id}" alt=""><i>${ic('check')}</i>${m.kind === 'logo' ? '<span class="tag">Logo</span>' : ''}</button>`).join('') || '<p class="mute" style="grid-column:1/-1">Aucune photo pour le moment. Importez en depuis votre téléphone ou votre ordinateur.</p>'}</div>
  <div class="btns" style="margin-top:14px;justify-content:space-between">${o.multi ? '' : '<button class="btn ghost" data-a="mpNone">Sans photo</button>'}<div class="btns"><button class="btn sec" data-a="close">Annuler</button><button class="btn pri" data-a="mpOk">${o.multi ? 'Utiliser la sélection' : 'Choisir'}</button></div></div>`, true);
  hydrateMedia($('#modal'));
}
A.mpToggle = el => {
  const p = window._mp, id = el.dataset.id;
  if (!p.o.multi) { p.sel = [id]; $$('#mpgrid .mcell').forEach(c => c.classList.toggle('sel', c.dataset.id === id)); return; }
  p.sel = p.sel.includes(id) ? p.sel.filter(x => x !== id) : p.sel.concat(id); el.classList.toggle('sel');
};
A.mpOk = () => { const p = window._mp; closeModal(); if (p) p.done(p.sel); };
A.mpNone = () => { const p = window._mp; closeModal(); if (p) p.done([]); };
A.mpUpload = () => { const p = window._mp; pickFiles({ multiple: !!p.o.multi }, async files => { const added = await addMediaFiles(files, 'photo'); if (!added.length) return; p.o.selected = p.o.multi ? p.sel.concat(added.map(m => m.id)) : [added[0].id]; mediaPicker(p.o, p.done); }); };

VIEWS.posts = () => {
  const d = postDraft(), q = route.q;
  if (q.angle || q.net || q.subj) {
    if (ANGLES.includes(q.angle)) d.angle = q.angle; if (['Instagram', 'LinkedIn', 'Facebook', 'TikTok'].includes(q.net)) d.net = q.net; d.subj = q.subj || '';
    regenPost(d); history.replaceState(null, '', '#/posts'); route.q = {};
  }
  const n = d.slides.length, lim = TAG_LIMIT[d.net] || 5;
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Carrousels et posts</h1><p>Instagram, LinkedIn, Facebook ou TikTok : choisissez un angle, ajoutez vos photos, Anza écrit les slides, la légende et les hashtags. Touchez un texte pour le modifier.</p></div>
  <div class="btns"><button class="btn sec" data-a="postCal">${ic('cal')}Planifier</button><button class="btn sec" data-a="studioDl" data-k="post">${ic('dl')}Télécharger</button><button class="btn pri" data-a="studioPub" data-k="post">${ic('share')}Publier</button></div></div>
  <div class="grid g12"><div class="card"><div class="form">
    ${ideasRow('post')}
    <div class="field"><label>Réseau</label><div class="seg">${['Instagram', 'LinkedIn', 'Facebook', 'TikTok'].map(t => `<button class="${d.net === t ? 'on' : ''}" data-a="pSet" data-k="net" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="grid g2"><div class="field"><label>Format</label><div class="seg">${['Carrousel', 'Post'].map(t => `<button class="${d.format === t ? 'on' : ''}" data-a="pSet" data-k="format" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label>Taille</label><div class="seg">${[['45', 'Portrait'], ['11', 'Carré']].map(([v, l]) => `<button class="${d.ratio === v ? 'on' : ''}" data-a="pRatio" data-v="${v}">${l}</button>`).join('')}</div></div></div>
    <div class="field"><label>Angle</label><div class="seg wrap">${ANGLES.map(t => `<button class="${d.angle === t ? 'on' : ''}" data-a="pSet" data-k="angle" data-v="${t}">${t}</button>`).join('')}</div></div>
    <div class="field"><label for="psj">Titre personnalisé</label><input id="psj" value="${esc(d.subj)}" placeholder="Laissez vide pour la proposition d’Anza"></div>
    ${photoStrip(d.slides, 'post')}
    <div class="field"><label>Mise en page des photos</label><div class="seg wrap">${LAYOUTS.filter(l => l[0] !== 'texte').map(([k, l]) => `<button class="${d.lay === k ? 'on' : ''}" data-a="studioLay" data-k="post" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="field"><label>Fond</label><div class="seg">${STYLES.map(([k, l]) => `<button class="${d.style === k ? 'on' : ''}" data-a="studioStyle" data-k="post" data-v="${k}">${l}</button>`).join('')}</div></div>
    <label class="row"><input type="checkbox" ${d.alt ? 'checked' : ''} data-c="pAlt"> Alterner les fonds d’une slide à l’autre</label>
    ${logoToggle()}
    <button class="btn pri" data-a="pGen" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : aiOn() ? 'Écrire avec Nia' : 'Réécrire'}</button>
    ${d.angle === 'Preuve' ? '<div class="tip"><i>!</i><div>Collez les vrais mots de vos clients dans les slides, avec leur accord.</div></div>' : ''}</div></div>
  <div class="grid" style="align-content:start"><div class="card ${busy ? 'loading' : ''}"><h3>Slides <small>${n}${d.ai ? ' · écrites par Nia' : ''}</small></h3><div class="slides r${d.ratio}" style="margin-top:14px">${d.slides.map((f, i) => slideTile(f, i, n, d)).join('')}${d.format === 'Carrousel' && n < MAX_FRAMES ? `<button class="slide addf" data-a="frameAdd" data-k="post">${ic('plus')}<span>Ajouter une slide</span></button>` : ''}</div></div>
  <div class="card"><h3>Légende ${d.net} <button class="btn sec sm" data-a="copyCap">${ic('copy')}Copier avec les hashtags</button></h3><textarea class="caption" id="cap" data-i="capEdit" style="width:100%;border:0;min-height:220px;margin-top:12px;font:inherit">${esc(d.caption)}</textarea>
    <div class="tags-h"><b>Hashtags</b><small class="mute">${d.tags.length} sur ${lim} au maximum pour ${d.net}</small><button class="btn ghost sm" data-a="tagsShuffle">Autres hashtags</button></div>
    <div class="tagchips">${d.tags.map((t, i) => `<span class="tagchip">${esc(t)}<button data-a="tagDel" data-n="${i}" aria-label="Retirer ${esc(t)}">×</button></span>`).join('')}${d.tags.length < lim ? `<input id="tagnew" placeholder="Ajouter" data-enter="tagAdd" aria-label="Ajouter un hashtag">` : ''}</div>
    <small class="mute">Des hashtags précis, locaux et renouvelés chaque semaine : jamais les mêmes que les autres utilisateurs d’Anza.</small></div></div></div>`;
};
function slideTile(f, i, n, d) {
  const { c, lay, fg } = frameBg(f, i, n, 'slide', d);
  return `<div class="slide lay-${lay}" style="background:${c.bg};color:${fg};--tf:${fontFam()}">${photoTag(f.img, f.pos)}${lay === 'photo' ? '<i class="shade"></i>' : ''}<small>${esc(f.k)}</small>${i === 0 && st.brand.logo && st.brand.logoOn && lay !== 'moitie' ? `<span class="slogo">${logoBadge()}</span>` : ''}
    <div class="ftext"><b contenteditable="true" data-i="frameText" data-k="post" data-n="${i}" data-f="t">${esc(f.t)}</b><p contenteditable="true" data-i="frameText" data-k="post" data-n="${i}" data-f="p">${esc(f.p)}</p></div>
    <div class="ftools"><button data-a="frameOpen" data-k="post" data-n="${i}" aria-label="Modifier la slide ${i + 1}">${ic('edit')}</button><button data-a="framePhoto" data-k="post" data-n="${i}" aria-label="Photo de la slide ${i + 1}">${ic('image')}</button></div></div>`;
}
function regenPost(d) {
  const out = postContent(d.net, d.format, d.angle, d.subj);
  d.slides = keepPhotos(d.slides, out.slides); d.caption = out.caption; d.tags = out.tags; d.ai = false; save();
}
A.pSet = el => { const d = postDraft(); d[el.dataset.k] = el.dataset.v; d.subj = val('psj'); regenPost(d); refresh(); };
A.pRatio = el => { postDraft().ratio = el.dataset.v; save(); refresh(); };
C.pAlt = el => { postDraft().alt = el.checked; save(); refresh(); };
A.pGen = async () => {
  if (busy) return; const d = postDraft(); d.subj = val('psj');
  if (aiOn()) {
    busy = true; refresh();
    try {
      const r = await aiPost(d.net, d.format, d.angle, d.subj);
      const found = (String(r.caption || '').match(/#[\wà-ÿ]+/gi) || []).map(t => '#' + slug(t)).filter(t => t.length > 3);
      d.slides = keepPhotos(d.slides, r.slides.map(x => ({ k: x.k || '', t: x.t || '', p: x.p || '' })));
      d.caption = String(r.caption || '').replace(/(\s*#[\wà-ÿ]+)+\s*$/gi, '').trim();
      d.tags = [...new Set(found.concat(hashtags(d.net)))].slice(0, TAG_LIMIT[d.net] || 5);
      d.ai = true; busy = false; save(); refresh(); toast('Contenu écrit par Nia'); return;
    } catch (e) { busy = false; toast(aiError(e)); }
  }
  regenPost(d); refresh(); toast('Contenu réécrit');
};
I.capEdit = el => { postDraft().caption = el.value; clearTimeout(window._ce); window._ce = setTimeout(save, 600); };
function fullCaption(d) { return `${d.caption}${d.tags.length ? '\n\n' + d.tags.join(' ') : ''}`; }
A.copyCap = () => { const d = postDraft(); copyText(fullCaption(d)); rememberTags(d.tags); save(); };
A.tagsShuffle = () => { const d = postDraft(); d.tagShuffle = (d.tagShuffle || 0) + 1; d.tags = hashtags(d.net, [], d.tagShuffle); save(); refresh(); };
A.tagDel = el => { const d = postDraft(); d.tags.splice(+el.dataset.n, 1); save(); refresh(); };
A.tagAdd = () => { const d = postDraft(), t = '#' + slug(val('tagnew')); if (t.length < 3) return; if (d.tags.length >= (TAG_LIMIT[d.net] || 5)) { toast(`${d.net} accepte ${TAG_LIMIT[d.net]} hashtags au maximum`); return; } if (!d.tags.includes(t)) d.tags.push(t); save(); refresh(); const i = $('#tagnew'); if (i) i.focus(); };
A.postCal = () => { const d = postDraft(); planModal(d.net === 'LinkedIn' ? 'LinkedIn' : d.format === 'Carrousel' ? 'Carrousel' : 'Story', d.angle, (d.net === 'LinkedIn' ? 'Post LinkedIn, ' : 'Carrousel, ') + d.slides[0].t); };

function studioPack(k) {
  if (k === 'story') { const d = storyDraft(); return { kind: 'story', items: d.frames, style: d.style, base: `story-${slug(d.type)}`, caption: '', net: 'Instagram', title: d.frames[0] && d.frames[0].t }; }
  const d = postDraft();
  return { kind: 'slide', items: d.format === 'Post' ? d.slides.slice(0, 1) : d.slides, style: d.style, alt: d.alt, ratio: d.ratio, base: `${slug(d.net)}-${slug(d.angle)}`, caption: d.caption, tags: d.tags, net: d.net, title: d.slides[0] && d.slides[0].t, angle: d.angle, format: d.format };
}
async function packImages(pk) {
  const dims = pk.kind === 'story' ? { W: 1080, H: 1920 } : { W: 1080, H: pk.ratio === '11' ? 1080 : 1350 };
  return renderSet(pk.items, Object.assign({ kind: pk.kind, style: pk.style, alt: pk.alt, handle: P().handle }, dims));
}
A.studioDl = async el => {
  const pk = studioPack(el.dataset.k); el.disabled = true;
  try { const imgs = await packImages(pk); if (imgs.length === 1) download(`${pk.base}.png`, imgs[0]); else downloadBlob(`${pk.base}.zip`, makeZip(imgs.map((d, i) => ({ name: `${pk.base}-${String(i + 1).padStart(2, '0')}.png`, data: dataToBytes(d) })))); if (pk.kind === 'story' && !st.storyMade) { st.storyMade = true; save(); } toast(imgs.length > 1 ? 'Images téléchargées en un seul fichier ZIP' : 'Image téléchargée'); }
  catch (e) { toast('Téléchargement impossible, réessayez'); }
  el.disabled = false;
};
A.studioPub = el => openPublish(studioPack(el.dataset.k));

const PLATFORMS = {
  story: [['ig', 'Story Instagram', 'https://www.instagram.com/'], ['fb', 'Story Facebook', 'https://www.facebook.com/'], ['wa', 'Statut WhatsApp', 'https://web.whatsapp.com/'], ['tt', 'TikTok', 'https://www.tiktok.com/tiktokstudio/upload']],
  slide: [['ig', 'Instagram', 'https://www.instagram.com/'], ['li', 'LinkedIn', 'https://www.linkedin.com/feed/?shareActive=true'], ['fb', 'Facebook', 'https://www.facebook.com/'], ['tt', 'TikTok', 'https://www.tiktok.com/tiktokstudio/upload']]
};
async function openPublish(pk) {
  const issues = checkContent({ items: pk.items, caption: pk.caption, tags: pk.tags, net: pk.net, kind: pk.kind });
  window._pub = { pk, imgs: null, files: null };
  const plats = PLATFORMS[pk.kind === 'story' ? 'story' : 'slide'];
  modal('Publier', `<div class="form">
    ${issues.length ? `<div class="checkbox-list"><p class="kick" style="margin:0 0 6px">Vérification avant publication</p>${issues.map(x => `<div class="chk ${x.lvl}"><i>${x.lvl === 'fix' ? '!' : 'i'}</i><span>${esc(x.msg)}</span></div>`).join('')}${issues.some(x => x.lvl === 'fix') ? '<button class="btn sec sm" data-a="pubFix" style="margin-top:8px">Tout corriger automatiquement</button>' : ''}</div>` : `<div class="chk ok"><i>${ic('check')}</i><span>Tout est conforme à votre charte : ton, couleurs, longueur${pk.tags ? ', hashtags' : ''}.</span></div>`}
    <div id="pubprev" class="pubprev ${pk.kind}"><p class="mute">Préparation des images…</p></div>
    <p class="kick" style="margin:6px 0 0">Où publier ?</p>
    <div class="plats">${plats.map(([k, l]) => `<button class="plat" data-a="pubTo" data-p="${k}" disabled>${platIcon(k)}<span>${l}</span></button>`).join('')}</div>
    <small class="mute">${isTouch() ? 'Votre téléphone ouvre l’application choisie avec les images prêtes. La légende est copiée : collez la en un geste.' : 'Les images sont téléchargées, la légende est copiée et la plateforme s’ouvre dans un nouvel onglet : il ne reste qu’à déposer les images.'}</small>
    <div class="btns" style="justify-content:space-between;margin-top:6px"><div class="btns"><button class="btn sec sm" data-a="pubZip" disabled>${ic('dl')}Tout télécharger</button>${pk.caption != null && pk.kind !== 'story' ? `<button class="btn sec sm" data-a="pubCopy">${ic('copy')}Copier la légende</button>` : ''}</div><button class="btn pri" data-a="pubDone">C’est publié</button></div></div>`, true);
  try {
    const imgs = await packImages(pk);
    if (!window._pub || window._pub.pk !== pk) return;
    window._pub.imgs = imgs; window._pub.files = imagesToFiles(imgs, pk.base);
    const box = $('#pubprev'); if (box) box.innerHTML = imgs.map((d, i) => `<img src="${d}" alt="Image ${i + 1}">`).join('');
    $$('#modal [data-a=pubTo], #modal [data-a=pubZip]').forEach(b => { b.disabled = false; });
  } catch (e) { const box = $('#pubprev'); if (box) box.innerHTML = '<p class="mute">Les images n’ont pas pu être préparées. Réessayez.</p>'; }
}
function platIcon(k) {
  const t = { ig: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>', fb: '<path d="M14 8.5h2.5V5H14a4 4 0 00-4 4v2H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9a.5.5 0 01.5-.5z"/>', li: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16M8 7.8v.1M11.5 16v-3.2c0-1.4 1-2.3 2.2-2.3s2 .9 2 2.3V16"/>', wa: ICON.wa, tt: '<path d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5M14 4c.5 2.4 2.2 4 4.5 4.2"/>' }[k];
  return `<svg viewBox="0 0 24 24">${t}</svg>`;
}
A.pubFix = () => {
  const p = window._pub; if (!p) return; const pk = p.pk;
  const fixT = s => { s = fixDashes(s); if (!st.brand.emoji) s = String(s || '').replace(EMOJI_RX, '').replace(/\s{2,}/g, ' ').trim(); return s; };
  pk.items.forEach(f => ['t', 's', 'p', 'k', 'c'].forEach(k => { if (f[k]) f[k] = fixT(f[k]); }));
  if (pk.kind === 'story' && pk.items.length && !pk.items[pk.items.length - 1].c) pk.items[pk.items.length - 1].c = st.profile.cta || 'Réserver';
  if (pk.caption) { pk.caption = fixT(pk.caption); if (pk.kind !== 'story') postDraft().caption = pk.caption; }
  if (pk.tags) { pk.tags.splice(TAG_LIMIT[pk.net] || 5); }
  save(); closeModal(); refresh(); openPublish(pk); toast('Corrections appliquées');
};
A.pubTo = el => {
  const p = window._pub; if (!p || !p.files) return;
  const pk = p.pk, k = el.dataset.p, plat = PLATFORMS[pk.kind === 'story' ? 'story' : 'slide'].find(x => x[0] === k);
  const cap = pk.kind === 'story' ? '' : `${pk.caption || ''}${pk.tags && pk.tags.length ? '\n\n' + pk.tags.join(' ') : ''}`;
  if (cap && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(cap).catch(() => {});
  if (isTouch() && canShareFiles(p.files)) {
    const data = { files: p.files }; if (cap && k !== 'ig') data.text = cap;
    navigator.share(data).then(() => { toast(cap ? 'Partagé. La légende est copiée, collez la.' : 'Partagé'); }).catch(() => {});
    return;
  }
  if (p.imgs.length === 1) download(`${pk.base}.png`, p.imgs[0]); else downloadBlob(`${pk.base}.zip`, makeZip(p.files.map(f => ({ name: f.name, data: dataToBytes(p.imgs[p.files.indexOf(f)]) }))));
  let url = plat ? plat[2] : '';
  if (k === 'li' && cap) url += '&text=' + encodeURIComponent(cap.slice(0, 2900));
  if (url) window.open(url, '_blank', 'noopener');
  toast(cap ? 'Images téléchargées et légende copiée' : 'Images téléchargées');
};
A.pubZip = () => { const p = window._pub; if (!p || !p.imgs) return; if (p.imgs.length === 1) download(`${p.pk.base}.png`, p.imgs[0]); else downloadBlob(`${p.pk.base}.zip`, makeZip(p.files.map((f, i) => ({ name: f.name, data: dataToBytes(p.imgs[i]) })))); };
A.pubCopy = () => { const p = window._pub; if (!p) return; copyText(`${p.pk.caption || ''}${p.pk.tags && p.pk.tags.length ? '\n\n' + p.pk.tags.join(' ') : ''}`); };
A.pubDone = () => {
  const p = window._pub; closeModal(); if (!p) return;
  const pk = p.pk, today = iso(Date.now());
  if (pk.tags) rememberTags(pk.tags);
  if (pk.kind === 'story') st.storyMade = true;
  const type = pk.kind === 'story' ? 'Story' : pk.net === 'LinkedIn' ? 'LinkedIn' : 'Carrousel';
  const ev = st.calendar.find(e => !e.done && e.type === type && e.date <= iso(Date.now() + DAY) && e.date >= iso(Date.now() - 2 * DAY));
  if (ev) ev.done = true;
  st.perf.push({ id: uid(), date: today, type: pk.kind === 'story' ? 'Story' : pk.net === 'LinkedIn' ? 'Post LinkedIn' : pk.format === 'Post' ? 'Post' : 'Carrousel', angle: pk.angle || (pk.kind === 'story' ? storyDraft().type : 'Offre'), title: String(pk.title || 'Publication').slice(0, 120), views: 0, messages: 0 });
  save(); toast(ev ? 'Bravo ! Publication cochée dans votre calendrier' : 'Bravo ! Publication enregistrée'); refresh();
};

VIEWS.photos = () => {
  const f = route.q.f || 'toutes', all = st.media;
  const list = all.filter(m => f === 'toutes' || (f === 'logo' ? m.kind === 'logo' : f === 'libres' ? !mediaUses(m.id).length : true));
  const sel = window._psel || (window._psel = []);
  return `<div class="head"><div><p class="kick">Attirer</p><h1>Photothèque</h1><p>Vos photos et votre logo, rangés au même endroit. Elles s’intègrent dans vos stories, vos carrousels, votre page et vos visuels de marque.</p></div>
  <div class="btns"><span class="tag" style="font-size:13px;padding:8px 12px">${all.length} sur ${photoLimit()}</span><button class="btn pri" data-a="photoUp">${ic('up')}Importer des photos</button></div></div>
  <div class="card drop" id="drop"><div class="row" style="justify-content:space-between"><div class="seg">${[['toutes', 'Toutes'], ['logo', 'Logo'], ['libres', 'Non utilisées']].map(([k, l]) => `<button class="${f === k ? 'on' : ''}" data-a="go" data-h="#/photos?f=${k}">${l}</button>`).join('')}</div>
  ${sel.length ? `<div class="btns"><b style="font-size:14px">${plural(sel.length, 'sélectionnée', 'sélectionnées')}</b><button class="btn sec sm" data-a="photoUse" data-k="story">${ic('story')}Créer des stories</button><button class="btn sec sm" data-a="photoUse" data-k="post">${ic('grid')}Créer un carrousel</button><button class="btn sec sm" data-a="photoColors">${ic('palette')}Extraire les couleurs</button><button class="btn danger sm" data-a="photoDel">${ic('trash')}Supprimer</button><button class="btn ghost sm" data-a="photoSelNone">Annuler</button></div>` : '<small class="mute">Touchez des photos pour les sélectionner. Glissez des fichiers ici pour les importer.</small>'}</div>
  <div class="mgrid lib" style="margin-top:14px">${list.map(m => { const u = mediaUses(m.id); return `<div class="mcell ${sel.includes(m.id) ? 'sel' : ''}"><button class="mpick" data-a="photoSel" data-id="${m.id}" aria-label="Sélectionner"><img data-media="${m.id}" alt="${esc(m.name)}"><i>${ic('check')}</i></button><div class="mmeta">${m.kind === 'logo' ? '<span class="tag">Logo</span>' : ''}${u.includes('page') ? '<span class="tag">Ma page</span>' : ''}${u.includes('studio') ? '<span class="tag">Contenus</span>' : ''}<button class="x" data-a="photoMenu" data-id="${m.id}" aria-label="Options">⋯</button></div></div>`; }).join('') || `<div class="empty-big" style="grid-column:1/-1"><h2>${f === 'toutes' ? 'Ajoutez vos premières photos' : 'Rien ici'}</h2><p class="mute">Vos réalisations, votre lieu, vous au travail, vos produits : ce sont elles qui feront arrêter le pouce sur vos stories.</p></div>`}</div></div>
  <div class="tip" style="margin-top:12px"><i>✓</i><div>Les photos sont compressées automatiquement et ${ONLINE ? 'enregistrées dans votre espace sécurisé : vous les retrouvez sur tous vos appareils' : 'enregistrées sur cet appareil'}. Elles ne sont jamais visibles par d’autres, sauf celles que vous mettez sur votre page publique.</div></div>`;
};
AFTER.photos = () => {
  const z = $('#drop'); if (!z) return;
  ['dragenter', 'dragover'].forEach(e => z.addEventListener(e, ev => { ev.preventDefault(); z.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(e => z.addEventListener(e, ev => { ev.preventDefault(); z.classList.remove('over'); }));
  z.addEventListener('drop', async ev => { const f = [...(ev.dataTransfer.files || [])]; if (f.length) { await addMediaFiles(f, 'photo'); refresh(); } });
};
A.photoUp = () => pickFiles({ multiple: true }, async files => { toast('Import en cours'); await addMediaFiles(files, 'photo'); refresh(); });
A.photoSel = el => { const s = window._psel || (window._psel = []), id = el.dataset.id; window._psel = s.includes(id) ? s.filter(x => x !== id) : s.concat(id); refresh(); };
A.photoSelNone = () => { window._psel = []; refresh(); };
A.photoUse = el => { const ids = window._psel || []; window._psel = []; distribute(el.dataset.k, ids, true); go(el.dataset.k === 'story' ? '#/stories' : '#/posts'); };
A.photoColors = async () => { const ids = window._psel || []; const cols = await extractColors(ids); window._cols = { cols, sug: suggestBrand(cols) }; window._psel = []; go('#/charte'); };
A.photoDel = () => {
  const ids = window._psel || []; const used = ids.filter(id => mediaUses(id).length).length;
  confirmBox(`Supprimer ${plural(ids.length, 'photo', 'photos')} ?${used ? ` ${used > 1 ? 'Certaines sont utilisées' : 'Une est utilisée'} dans vos contenus ou votre page : elle${used > 1 ? 's' : ''} y ser${used > 1 ? 'ont' : 'a'} retirée${used > 1 ? 's' : ''}.` : ''}`, 'Supprimer', async () => { try { await removeMedia(ids); window._psel = []; toast('Photos supprimées'); } catch (e) { toast('Suppression impossible, vérifiez votre connexion'); } refresh(); });
};
A.photoMenu = el => {
  const m = mediaMeta(el.dataset.id); if (!m) return;
  modal(esc(m.name || 'Photo'), `<div class="form"><div class="pth xl">${photoTag(m.id, '', '')}</div><p class="mute" style="font-size:13px">${m.w} × ${m.h} pixels${Math.max(m.w, m.h) < 900 ? ', un peu petite pour un plein écran' : ''}</p>
  <div class="field"><label for="ph-n">Nom</label><input id="ph-n" value="${esc(m.name)}" maxlength="80"></div>
  <div class="btns"><button class="btn sec sm" data-a="photoAs" data-id="${m.id}" data-k="logo">Définir comme logo</button><button class="btn sec sm" data-a="photoAs" data-id="${m.id}" data-k="cover">Couverture de ma page</button><button class="btn sec sm" data-a="photoAs" data-id="${m.id}" data-k="gallery">Ajouter à la galerie de ma page</button><button class="btn sec sm" data-a="photoDl" data-id="${m.id}">${ic('dl')}Télécharger</button></div>
  <div class="btns" style="justify-content:space-between"><button class="btn danger" data-a="photoDelOne" data-id="${m.id}">Supprimer</button><button class="btn pri" data-a="photoName" data-id="${m.id}">Enregistrer</button></div></div>`);
  hydrateMedia($('#modal'));
};
A.photoName = el => { const m = mediaMeta(el.dataset.id); if (m) { m.name = val('ph-n').trim().slice(0, 80) || m.name; save(); } closeModal(); refresh(); };
A.photoAs = el => {
  const id = el.dataset.id, k = el.dataset.k, m = mediaMeta(id); if (!m) return;
  if (k === 'logo') { st.brand.logo = id; st.media.forEach(x => { if (x.kind === 'logo' && x.id !== id) x.kind = 'photo'; }); m.kind = 'logo'; toast('Logo enregistré'); }
  if (k === 'cover') { st.page.cover = id; toast('Couverture de votre page mise à jour'); }
  if (k === 'gallery') { if (!st.page.gallery.includes(id)) st.page.gallery.push(id); st.page.gallery = st.page.gallery.slice(0, 12); toast('Ajoutée à la galerie de votre page'); }
  save(); closeModal(); refresh();
};
A.photoDl = async el => { const m = mediaMeta(el.dataset.id); const b = await mediaBlob(el.dataset.id); if (b) downloadBlob(`${slug(m.name) || 'photo'}.${m.ext}`, b); };
A.photoDelOne = el => { window._psel = [el.dataset.id]; closeModal(); A.photoDel(); };
