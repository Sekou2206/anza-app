const SLUG_RX = /^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$/;
function pageBase() { return CFG.pageBase || (location.origin + location.pathname.replace(/[^/]*$/, '') + 'p/'); }
function pageLink() { const p = st && st.page; return p && p.published && p.slug ? pageBase() + '?' + p.slug : ''; }
function pageUrl() { return pageLink(); }
function suggestSlug() { return slug(P().business).slice(0, 30) || 'ma-page'; }
function pageCta() {
  const pg = st.page, pr = st.profile, ph = phoneIntl(pr.phone);
  const k = pg.ctaKind;
  if (k === 'whatsapp' && ph) return wa(pr.phone, 'Bonjour, je vous contacte depuis votre page. ');
  if (k === 'phone' && ph) return 'tel:+' + ph;
  if (k === 'email' && pr.email) return 'mailto:' + pr.email;
  if (k === 'link' && pg.ctaUrl) return pg.ctaUrl;
  if (k === 'calendly' && (pr.calendly || pg.ctaUrl)) return pr.calendly || pg.ctaUrl;
  return pg.form ? '#contact' : (ph ? wa(pr.phone, 'Bonjour ! ') : '');
}
function pageData() {
  const pg = st.page, pr = st.profile, b = st.brand, p = P(), land = pg.mode === 'landing' && has(2);
  const bk = pg.booking || {};
  return {
    v: 1, mode: land ? 'landing' : 'bio', theme: ['Marque', 'Clair', 'Nuit'].includes(pg.theme) ? pg.theme : 'Marque',
    colors: { primary: b.primary, accent: b.accent, soft: b.soft, ink: b.ink }, font: b.font,
    name: p.business, activity: uc(p.activity), city: pr.city || '', headline: pg.headline || uc(dot(p.value)).replace(/\.$/, ''), sub: pg.sub || (land ? `${dot(p.proof)}` : ''),
    cta: { label: pg.cta || pr.cta || 'Me contacter', kind: pg.ctaKind, url: pageCta() },
    links: pg.links.filter(l => l.label && l.url).slice(0, 10).map(l => ({ label: String(l.label).slice(0, 60), url: String(l.url).slice(0, 300) })),
    instagram: pr.instagram || '', tiktok: pr.tiktok || '', facebook: pr.facebook || '', linkedin: pr.linkedin || '',
    services: pg.showServices ? st.services.slice(0, 12).map(s => ({ name: String(s.name).slice(0, 80), price: +s.price || 0, duration: +s.duration || 0 })) : [],
    reviews: pg.showReviews ? pg.reviews.filter(r => r.text).slice(0, 6).map(r => ({ text: String(r.text).slice(0, 400), name: String(r.name || '').slice(0, 40) })) : [],
    faq: land ? pg.faq.filter(f => f.q && f.a).slice(0, 8).map(f => ({ q: String(f.q).slice(0, 160), a: String(f.a).slice(0, 600) })) : [],
    about: land && pg.about ? String(p.story).slice(0, 1200) : '',
    gallery: pg.gallery.filter(id => mediaMeta(id)).slice(0, land ? 12 : 6), cover: mediaMeta(pg.cover) ? pg.cover : '', avatar: mediaMeta(pg.avatar) ? pg.avatar : (mediaMeta(b.logo) ? b.logo : ''),
    form: !!pg.form && ONLINE, booking: land && bk.on ? { on: true, days: (bk.days || []).filter(n => n >= 0 && n <= 6), from: bk.from || '09:00', to: bk.to || '18:00', step: Math.max(15, +bk.step || 60) } : { on: false },
    hours: land ? String(pg.hours || '').slice(0, 300) : '', siret: pr.siret || '', cgv: pg.cgv && has(2) ? cgvText(st.cgv || {}) : ''
  };
}
function hashStr(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return String(h >>> 0); }
function pageDirty() { return st.page.published && st.page.pubHash !== hashStr(JSON.stringify(pageData())); }

VIEWS.landing = () => {
  const pg = st.page, d = pageData(), link = pageLink(), boutique = has(2), dirty = pageDirty();
  const sec2 = (t, b, lock) => `<div class="card pgs"><h3>${t}${lock ? ' ' + lockTag(2) : ''}</h3>${b}</div>`;
  const leads = st.clients.filter(c => c.lead && !c.leadSeen);
  return `<div class="head"><div><p class="kick">Marque</p><h1>Ma page</h1><p>Votre lien en bio, à votre image : vos liens, vos prestations, vos avis et un formulaire qui envoie les demandes directement dans vos clients.</p></div>
  <div class="btns"><button class="btn sec" data-a="lpDl">${ic('dl')}Fichier HTML</button>${aiOn() ? `<button class="btn sec" data-a="lpAI" ${busy ? 'disabled' : ''}>${ic('spark')}${busy ? 'Nia écrit' : 'Textes par Nia'}</button>` : ''}</div></div>
  ${leads.length ? `<div class="card tip" style="margin-bottom:16px"><i>${leads.length}</i><div><b>${plural(leads.length, 'nouvelle demande', 'nouvelles demandes')} depuis votre page.</b> ${leads.slice(0, 3).map(c => `<a href="#/client/${c.id}">${esc(c.name)}</a>`).join(', ')}</div></div>` : ''}
  <div class="card pubbar ${link ? 'on' : ''}">${link ? `<div><p class="kick" style="margin:0">En ligne ${dirty ? '<span class="tag warnt">Modifications non publiées</span>' : ''}</p><a class="plink" href="${esc(link)}" target="_blank" rel="noopener">${esc(link.replace(/^https?:\/\//, ''))}</a></div><div class="btns"><button class="btn sec sm" data-a="copyLink">${ic('copy')}Copier</button><button class="btn sec sm" data-a="kitGen" data-k="qr">QR code</button><button class="btn ghost sm" data-a="pageOff">Retirer</button><button class="btn pri sm" data-a="pagePub" ${dirty ? '' : 'disabled'}>${dirty ? 'Mettre à jour' : 'À jour'}</button></div>`
    : `<div><p class="kick" style="margin:0">Votre adresse</p><div class="slugrow"><span>${esc(pageBase().replace(/^https?:\/\//, ''))}?</span><input id="pg-slug" value="${esc(pg.slug || suggestSlug())}" maxlength="40" aria-label="Adresse de votre page"></div><small class="mute">Lettres minuscules, chiffres et tirets uniquement dans l’adresse.</small></div><div class="btns">${ONLINE ? `<button class="btn pri" data-a="pagePub">${ic('up')}Publier ma page</button>` : '<small class="mute">Connectez vous pour publier.</small>'}</div>`}</div>
  <div class="grid g12" style="margin-top:16px"><div class="grid" style="align-content:start">
  ${boutique ? sec2('Format', `<div class="seg" style="margin-top:10px">${[['bio', 'Lien en bio'], ['landing', 'Page complète']].map(([k, l]) => `<button class="${pg.mode === k ? 'on' : ''}" data-a="pgSet" data-k="mode" data-v="${k}">${l}</button>`).join('')}</div>`) : ''}
  ${sec2('Apparence', `<div class="form" style="margin-top:10px"><div class="field"><label>Thème</label><div class="seg">${['Marque', 'Clair', 'Nuit'].map(k => `<button class="${pg.theme === k ? 'on' : ''}" data-a="pgSet" data-k="theme" data-v="${k}">${k}</button>`).join('')}</div></div>
    <div class="grid g2"><div class="field"><label>Couverture</label><div class="row" style="gap:8px">${pg.cover ? `<div class="pth">${photoTag(pg.cover, '', '')}</div>` : ''}<button class="btn sec sm" data-a="pgPick" data-k="cover">${pg.cover ? 'Changer' : 'Choisir'}</button>${pg.cover ? '<button class="btn ghost sm" data-a="pgClear" data-k="cover">Retirer</button>' : ''}</div></div>
    <div class="field"><label>Photo de profil</label><div class="row" style="gap:8px">${d.avatar ? `<div class="pth round">${photoTag(d.avatar, '', '')}</div>` : ''}<button class="btn sec sm" data-a="pgPick" data-k="avatar">${pg.avatar ? 'Changer' : 'Choisir'}</button>${pg.avatar ? '<button class="btn ghost sm" data-a="pgClear" data-k="avatar">Logo</button>' : ''}</div></div></div></div>`)}
  ${sec2('Textes', `<div class="form" style="margin-top:10px"><div class="field"><label for="pg-h">Titre</label><input id="pg-h" value="${esc(pg.headline)}" placeholder="${esc(d.headline)}" data-i="pgTxt" data-k="headline" maxlength="90"></div><div class="field"><label for="pg-s">Sous titre</label><textarea id="pg-s" rows="2" data-i="pgTxt" data-k="sub" placeholder="Facultatif" maxlength="220">${esc(pg.sub)}</textarea></div></div>`)}
  ${sec2('Bouton principal', `<div class="form" style="margin-top:10px"><div class="grid g2"><div class="field"><label for="pg-c">Texte</label><input id="pg-c" value="${esc(pg.cta)}" placeholder="${esc(st.profile.cta || 'Me contacter')}" data-i="pgTxt" data-k="cta" maxlength="34"></div>
    <div class="field"><label for="pg-ck">Action</label><select id="pg-ck" data-c="pgSel" data-k="ctaKind">${[['whatsapp', 'Ouvrir WhatsApp'], ['phone', 'Appeler'], ['email', 'Envoyer un email'], ['calendly', 'Lien de réservation'], ['link', 'Autre lien'], ['form', 'Aller au formulaire']].map(([k, l]) => `<option value="${k}" ${pg.ctaKind === k ? 'selected' : ''}>${l}</option>`).join('')}</select></div></div>
    ${pg.ctaKind === 'link' || (pg.ctaKind === 'calendly' && !st.profile.calendly) ? `<div class="field"><label for="pg-cu">Lien</label><input id="pg-cu" value="${esc(pg.ctaUrl)}" placeholder="https://" data-i="pgTxt" data-k="ctaUrl"></div>` : ''}
    ${(pg.ctaKind === 'whatsapp' || pg.ctaKind === 'phone') && !st.profile.phone ? '<small class="bad">Ajoutez votre téléphone dans les Réglages.</small>' : ''}</div>`)}
  ${sec2('Liens', `<div class="links-ed">${pg.links.map((l, i) => `<div class="lrow"><input value="${esc(l.label)}" placeholder="Texte" data-i="pgLink" data-n="${i}" data-k="label" aria-label="Texte du lien"><input value="${esc(l.url)}" placeholder="https://" data-i="pgLink" data-n="${i}" data-k="url" aria-label="Adresse du lien"><button class="x" data-a="pgLinkMove" data-n="${i}" aria-label="Monter" ${i === 0 ? 'disabled' : ''}>↑</button><button class="x" data-a="pgLinkDel" data-n="${i}" aria-label="Supprimer">×</button></div>`).join('')}</div>
    <div class="chips" style="margin-top:10px">${linkPresets().map((p, i) => `<button class="chip" data-a="pgLinkAdd" data-n="${i}">${ic('plus')}${esc(p[0])}</button>`).join('')}</div>`)}
  ${sec2('Prestations et avis', `<div class="form" style="margin-top:10px"><label class="row"><input type="checkbox" ${pg.showServices ? 'checked' : ''} data-c="pgChk" data-k="showServices"> Afficher mes prestations et mes prix (${st.services.length})</label><label class="row"><input type="checkbox" ${pg.showReviews ? 'checked' : ''} data-c="pgChk" data-k="showReviews"> Afficher les avis clients</label>
    ${pg.reviews.map((r, i) => `<div class="lrow rv"><textarea rows="2" placeholder="Les mots exacts du client" data-i="pgRev" data-n="${i}" data-k="text">${esc(r.text)}</textarea><input value="${esc(r.name)}" placeholder="Prénom" data-i="pgRev" data-n="${i}" data-k="name"><button class="x" data-a="pgRevDel" data-n="${i}" aria-label="Supprimer">×</button></div>`).join('')}
    ${pg.reviews.length < 6 ? '<button class="btn ghost sm" data-a="pgRevAdd">Ajouter un avis</button>' : ''}</div>`)}
  ${sec2('Galerie', `<p class="mute" style="font-size:13px;margin-top:6px">${pg.mode === 'landing' && boutique ? 'Jusqu’à 12 photos.' : 'Jusqu’à 6 photos sous vos liens.'}</p><div class="pstrip" style="margin-top:8px">${pg.gallery.map(id => `<div class="pth">${photoTag(id, '', '')}</div>`).join('')}<button class="pth add" data-a="pgGallery">${ic('image')}<span>Choisir</span></button></div>`)}
  ${boutique && pg.mode === 'landing' ? sec2('Page complète', `<div class="form" style="margin-top:10px"><label class="row"><input type="checkbox" ${pg.about ? 'checked' : ''} data-c="pgChk" data-k="about"> Afficher mon histoire</label><div class="field"><label for="pg-hr">Horaires et lieu</label><textarea id="pg-hr" rows="2" data-i="pgTxt" data-k="hours" placeholder="Du mardi au samedi, 9h à 19h">${esc(pg.hours)}</textarea></div>
    <p class="kick" style="margin:6px 0 0">Questions fréquentes</p>${pg.faq.map((f, i) => `<div class="lrow rv"><input value="${esc(f.q)}" placeholder="Question" data-i="pgFaq" data-n="${i}" data-k="q"><textarea rows="2" placeholder="Réponse" data-i="pgFaq" data-n="${i}" data-k="a">${esc(f.a)}</textarea><button class="x" data-a="pgFaqDel" data-n="${i}" aria-label="Supprimer">×</button></div>`).join('')}
    <div class="btns">${pg.faq.length < 8 ? '<button class="btn ghost sm" data-a="pgFaqAdd">Ajouter une question</button>' : ''}<button class="btn ghost sm" data-a="pgFaqAuto">${ic('spark')}Depuis les hésitations de mes clients</button></div></div>`) : ''}
  ${sec2('Formulaire et rendez vous', `<div class="form" style="margin-top:10px"><label class="row"><input type="checkbox" ${pg.form ? 'checked' : ''} data-c="pgChk" data-k="form"> Formulaire de contact : chaque demande arrive dans vos clients</label>
    ${boutique && pg.mode === 'landing' ? `<label class="row"><input type="checkbox" ${pg.booking.on ? 'checked' : ''} data-c="pgBk" data-k="on"> Proposer une demande de rendez vous avec date et heure</label>${pg.booking.on ? `<div class="chips">${['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'].map((d2, i) => `<button class="chip ${pg.booking.days.includes(i) ? 'on' : ''}" data-a="pgDay" data-n="${i}">${d2}</button>`).join('')}</div><div class="grid g3"><div class="field"><label for="bk-f">De</label><input id="bk-f" type="time" value="${pg.booking.from}" data-c="pgBk" data-k="from"></div><div class="field"><label for="bk-t">À</label><input id="bk-t" type="time" value="${pg.booking.to}" data-c="pgBk" data-k="to"></div><div class="field"><label for="bk-s">Créneaux</label><select id="bk-s" data-c="pgBk" data-k="step">${[30, 45, 60, 90, 120].map(n => `<option value="${n}" ${+pg.booking.step === n ? 'selected' : ''}>${n} min</option>`).join('')}</select></div></div><small class="mute">Vous confirmez chaque demande depuis la fiche du client, en un message WhatsApp.</small>` : ''}` : `<small class="mute">Demandes de rendez vous avec date et heure : dans la page complète ${lockTag(2)}</small>`}</div>`)}
  ${has(2) ? lpOfferCard() : ''}</div>
  <div class="pgprev"><div class="seg" style="margin-bottom:10px"><button class="${!window._pgDesk ? 'on' : ''}" data-a="pgDev" data-v="0">Téléphone</button><button class="${window._pgDesk ? 'on' : ''}" data-a="pgDev" data-v="1">Ordinateur</button></div><div class="device ${window._pgDesk ? 'desk' : ''}"><iframe id="lpf" title="Aperçu de votre page"></iframe></div></div></div>`;
};
function linkPresets() {
  const pr = st.profile, out = [];
  if (pr.instagram) out.push(['Instagram', 'https://instagram.com/' + pr.instagram.replace(/^@/, '')]);
  if (pr.tiktok) out.push(['TikTok', 'https://www.tiktok.com/@' + pr.tiktok.replace(/^@/, '')]);
  if (pr.phone) out.push(['WhatsApp', wa(pr.phone, 'Bonjour ! ')]);
  if (pr.googleReview) out.push(['Laisser un avis Google', pr.googleReview]);
  if (pr.calendly) out.push(['Prendre rendez vous', pr.calendly]);
  if (pr.website) out.push(['Mon site', pr.website]);
  if (pr.email) out.push(['M’écrire', 'mailto:' + pr.email]);
  out.push(['Autre lien', '']);
  return out;
}
let lpTimer = null;
AFTER.landing = () => { clearTimeout(lpTimer); const f = $('#lpf'); if (!f) return; const d = pageData(); mediaWarm([d.cover, d.avatar, ...d.gallery]).then(() => { const fr = $('#lpf'); if (fr) fr.srcdoc = AnzaPage.doc(d, id => mediaUrls.get(id) || '', '', ''); }); };
function mediaWarm(ids) { return Promise.all([...new Set(ids.filter(Boolean))].map(id => mediaURL(id))); }
function lpLater() { save(); clearTimeout(lpTimer); lpTimer = setTimeout(() => { AFTER.landing(); const b = $('.pubbar [data-a=pagePub]'); if (b && pageDirty()) { b.disabled = false; b.textContent = 'Mettre à jour'; } }, 350); }
I.pgTxt = el => { st.page[el.dataset.k] = el.value; lpLater(); };
C.pgSel = el => { st.page[el.dataset.k] = el.value; save(); refresh(); };
C.pgChk = el => { st.page[el.dataset.k] = el.checked; save(); refresh(); };
C.pgBk = el => { const k = el.dataset.k; st.page.booking[k] = k === 'on' ? el.checked : k === 'step' ? +el.value : el.value; save(); refresh(); };
A.pgDay = el => { const n = +el.dataset.n, d = st.page.booking.days; st.page.booking.days = d.includes(n) ? d.filter(x => x !== n) : d.concat(n).sort(); save(); refresh(); };
A.pgSet = el => { st.page[el.dataset.k] = el.dataset.v; save(); refresh(); };
A.pgDev = el => { window._pgDesk = el.dataset.v === '1'; refresh(); };
A.pgPick = el => { const k = el.dataset.k; mediaPicker({ title: k === 'cover' ? 'Photo de couverture' : 'Photo de profil', multi: false, selected: [st.page[k]].filter(Boolean) }, ids => { st.page[k] = ids[0] || ''; save(); refresh(); }); };
A.pgClear = el => { st.page[el.dataset.k] = ''; save(); refresh(); };
A.pgGallery = () => mediaPicker({ title: 'Galerie de ma page', multi: true, selected: st.page.gallery.slice() }, ids => { st.page.gallery = ids.slice(0, 12); save(); refresh(); });
I.pgLink = el => { const l = st.page.links[+el.dataset.n]; if (l) { l[el.dataset.k] = el.value; lpLater(); } };
A.pgLinkAdd = el => { if (st.page.links.length >= 10) { toast('10 liens au maximum'); return; } const p = linkPresets()[+el.dataset.n]; st.page.links.push({ id: uid(), label: p[0] === 'Autre lien' ? '' : p[0], url: p[1] }); save(); refresh(); };
A.pgLinkDel = el => { st.page.links.splice(+el.dataset.n, 1); save(); refresh(); };
A.pgLinkMove = el => { const i = +el.dataset.n, l = st.page.links; if (i > 0) { [l[i - 1], l[i]] = [l[i], l[i - 1]]; save(); refresh(); } };
I.pgRev = el => { const r = st.page.reviews[+el.dataset.n]; if (r) { r[el.dataset.k] = el.value; lpLater(); } };
A.pgRevAdd = () => { st.page.reviews.push({ id: uid(), text: '', name: '' }); save(); refresh(); };
A.pgRevDel = el => { st.page.reviews.splice(+el.dataset.n, 1); save(); refresh(); };
I.pgFaq = el => { const f = st.page.faq[+el.dataset.n]; if (f) { f[el.dataset.k] = el.value; lpLater(); } };
A.pgFaqAdd = () => { st.page.faq.push({ id: uid(), q: '', a: '' }); save(); refresh(); };
A.pgFaqDel = el => { st.page.faq.splice(+el.dataset.n, 1); save(); refresh(); };
A.pgFaqAuto = () => {
  const per = primaryPersona(), objs = per && per.objections.length ? per.objections : sec().objections.map(k => OBJ[k]());
  const qs = objs.map(o => ({ id: uid(), q: /\?$/.test(o.q.trim()) ? o.q.trim() : `« ${o.q.trim().replace(/\.$/, '')} »`, a: o.a }));
  qs.push({ id: uid(), q: 'Comment réserver ?', a: V('Par le bouton en haut de la page, ou en m’écrivant directement. Je vous réponds rapidement.', 'Par le bouton en haut de la page, ou en m’écrivant directement. Je te réponds rapidement.') });
  st.page.faq = st.page.faq.filter(f => f.q).concat(qs.filter(q => !st.page.faq.some(f => f.q === q.q))).slice(0, 8); save(); refresh(); toast('Questions ajoutées, relisez les réponses');
};
A.lpAI = async () => { if (busy) return; busy = true; refresh(); try { const r = await aiLanding(); Object.assign(st.page, { headline: r.headline || st.page.headline, sub: r.sub || st.page.sub, cta: r.cta || st.page.cta }); save(); toast('Textes écrits par Nia'); } catch (e) { toast(aiError(e)); } busy = false; refresh(); };
A.lpDl = async () => {
  const d = pageData(), ids = [d.cover, d.avatar, ...d.gallery].filter(Boolean), map = {};
  for (const id of ids) { const b = await mediaBlob(id); if (b) map[id] = await new Promise(ok => { const r = new FileReader(); r.onload = () => ok(r.result); r.readAsDataURL(b); }); }
  d.form = false;
  download('index.html', AnzaPage.doc(d, id => map[id] || '', pageBase().replace(/p\/$/, ''), ''), 'text/html');
};

async function pagePublish() {
  if (!ONLINE || !user) { toast('Connectez vous à internet pour publier'); return false; }
  const inp = $('#pg-slug'); if (inp) st.page.slug = inp.value.trim().toLowerCase();
  const s = st.page.slug;
  if (!SLUG_RX.test(s)) { toast('Adresse invalide : 3 à 40 caractères, lettres minuscules, chiffres et tirets'); return false; }
  const d = pageData(), ids = [...new Set([d.cover, d.avatar, ...d.gallery].filter(Boolean))], paths = {};
  for (const id of ids) {
    const m = mediaMeta(id), b = await mediaBlob(id); if (!m || !b) continue;
    const path = `${wsId()}/${id}.${m.ext}`;
    const { error } = await sb.storage.from(PAGE_BUCKET).upload(path, b, { contentType: m.ext === 'png' ? 'image/png' : 'image/jpeg', upsert: true, cacheControl: '3600' });
    if (!error) paths[id] = path;
  }
  const pub = Object.assign({}, d, { cover: paths[d.cover] || '', avatar: paths[d.avatar] || '', gallery: d.gallery.map(id => paths[id]).filter(Boolean) });
  const row = { slug: s, published: true, data: pub, updated_at: new Date().toISOString() };
  let r = await sb.from('pages').update(row).eq('user_id', wsId()).select('slug');
  if (!r.error && (!r.data || !r.data.length)) r = await sb.from('pages').insert(Object.assign({ user_id: wsId() }, row)).select('slug');
  if (r.error) { toast(/duplicate|23505|unique/i.test(r.error.message + (r.error.code || '')) ? 'Cette adresse est déjà prise, choisissez en une autre' : 'Publication impossible pour le moment, réessayez'); return false; }
  try { const { data } = await sb.storage.from(PAGE_BUCKET).list(wsId(), { limit: 100 }); const keep = new Set(Object.values(paths)); const old = (data || []).map(f => wsId() + '/' + f.name).filter(p => !keep.has(p)); if (old.length) await sb.storage.from(PAGE_BUCKET).remove(old); } catch (e) {}
  st.page.published = true; st.page.publishedAt = iso(Date.now()); st.page.pubHash = hashStr(JSON.stringify(d)); save();
  return true;
}
A.pagePub = async el => { el.disabled = true; const t = el.textContent; el.textContent = 'Publication'; const ok = await pagePublish(); if (ok) { toast('Votre page est en ligne'); refresh(); } else { el.disabled = false; el.textContent = t; } };
A.pageOff = () => confirmBox('Retirer votre page d’internet ? Le lien ne fonctionnera plus jusqu’à la prochaine publication.', 'Retirer', async () => {
  const { error } = await sb.from('pages').update({ published: false }).eq('user_id', wsId());
  if (error) { toast('Impossible pour le moment'); return; }
  st.page.published = false; save(); refresh(); toast('Page retirée');
});
function lpCode() { const id = (ONLINE && user ? user.id : (st.localId || (st.localId = uid()))).replace(/[^a-z0-9]/gi, '').slice(0, 6).toUpperCase(); return 'AZ' + (plan === 'magasin' ? 'M' : 'B') + id; }
function lpWaLink() {
  let n = String(CFG.landingWhatsapp || '').replace(/\D/g, ''); if (/^0\d{9}$/.test(n)) n = '33' + n.slice(1); if (/^330\d{9}$/.test(n)) n = '33' + n.slice(3);
  if (!n) return '';
  const p = st.profile, f = PLAN_NAME[plan] || 'La Boutique';
  const msg = `Bonjour SC Project ! Je suis client Anza, formule ${f}, et je souhaite ma landing page personnalisée offerte.\n\nActivité : ${p.business || 'à préciser'}${p.activity ? ', ' + p.activity : ''}${p.city ? ', ' + p.city : ''}\nEmail : ${(ONLINE && user && user.email) || p.email || 'à préciser'}\nCode Anza : ${lpCode()}`;
  return `https://wa.me/${n}?text=${encodeURIComponent(msg)}`;
}
function lpOfferCard() {
  const link = lpWaLink(); if (!link) return '';
  return `<div class="card offer-lp"><div class="offer-in"><div><p class="kick">Offert dans votre formule</p><h3>Votre landing page sur mesure, créée par SC Project</h3><p class="mute">Envie d’aller plus loin que ce modèle ? L’équipe SC Project conçoit gratuitement votre page personnalisée, à votre image. Envoyez votre demande sur WhatsApp, le message est déjà prêt.</p>${st.lpAsked ? `<small class="mute">Demande envoyée le ${fdate(st.lpAsked)}, votre code : <b>${lpCode()}</b></small>` : ''}</div><a class="btn pri" href="${link}" target="_blank" rel="noopener" data-a="lpAsk" data-keep="1">${ic('wa')}Demander ma landing offerte</a></div></div>`;
}
A.lpAsk = () => { st.lpAsked = iso(Date.now()); save(); setTimeout(refresh, 400); };

let leadsBusy = false;
async function pullLeads() {
  if (!ONLINE || !user || !st || !booted || leadsBusy || !navigator.onLine || !canWrite()) return;
  leadsBusy = true;
  try {
    const { data, error } = await sb.from('page_leads').select('id, kind, name, contact, message, wish_date, wish_time, created_at').eq('owner', wsId()).eq('imported', false).order('created_at', { ascending: true }).limit(50);
    if (error || !data || !data.length) return;
    const fresh = data.filter(l => !st.leadsSeen.includes(l.id));
    fresh.forEach(l => {
      const pc = parseContact(l.contact), d = iso(l.created_at || Date.now());
      st.clients.push({ id: uid(), name: String(l.name || 'Contact').slice(0, 80), phone: pc.phone || (pc.email ? '' : String(l.contact).slice(0, 40)), email: pc.email || '', source: 'Ma page', status: 'prospect', notes: String(l.message || '').slice(0, 1000), createdAt: d, lastContact: d, next: '', satisfied: false, review: false, history: [], lead: true, leadSeen: false, wish: l.wish_date ? { date: l.wish_date, time: /^\d{2}:\d{2}$/.test(l.wish_time || '') ? l.wish_time : '' } : null });
      st.leadsSeen.push(l.id);
    });
    if (fresh.length) { save(); const ok = await push(); if (!ok) return; }
    await sb.from('page_leads').update({ imported: true }).in('id', data.map(l => l.id));
    if (fresh.length) { toast(fresh.length > 1 ? `${fresh.length} nouvelles demandes depuis votre page` : `Nouvelle demande de ${fresh[0].name} depuis votre page`); refresh(); }
  } catch (e) {} finally { leadsBusy = false; }
}
