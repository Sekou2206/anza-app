const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MONTHS_FULL = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

const INTERVIEW = [
  { key: 'business', q: 'Bonjour, je suis Nia, votre brand manager. On va faire connaissance tranquillement, il n’y a pas de mauvaise réponse. Pour commencer, comment s’appelle votre activité ?', react: ['Joli nom, on va le faire connaître.', 'Parfait, c’est noté.'] },
  { key: 'activity', q: 'Que faites vous, en une phrase ? Par exemple : coach sportive à domicile, photographe de mariage, traiteur africain, consultant RH.', react: ['Très clair, merci.', 'On sent tout de suite votre univers.'] },
  { key: 'city', q: 'Où travaillez vous ? Une ville, une région, ou en ligne.', react: ['Noté, je m’en servirai pour qu’on vous trouve facilement.', 'Parfait.'] },
  { key: 'story', q: 'Qu’est ce qui vous a donné envie de vous lancer ? Racontez moi le moment où tout a commencé.', react: ['C’est exactement le genre d’histoire que vos clients ont envie de connaître.', 'On gardera cette histoire pour un post LinkedIn, elle est forte.'] },
  { key: 'target', q: 'Qui sont vos clients idéaux ? Imaginez la personne que vous aimeriez voir arriver demain.', react: ['Parfait, je vais écrire pour elle.', 'Très précis, c’est ce qui fera la différence dans vos contenus.'] },
  { key: 'problem', q: 'Quel problème réglez vous pour eux ? Qu’est ce qui les pousse à vous contacter ?', react: ['C’est le point de départ de toutes vos stories.', 'Merci, c’est ce que vos futurs clients vivent en ce moment.'] },
  { key: 'value', q: 'D’après vous, qu’est ce qui vous rend différent des autres ?', react: ['Voilà votre valeur ajoutée. On va la répéter souvent, c’est voulu.', 'Je le note comme votre promesse principale.'] },
  { key: 'proof', q: 'Qu’est ce que vos clients disent de vous, ou quel résultat pouvez vous montrer ? Même si vous débutez, une première réussite compte.', react: ['Ce sont vos meilleures preuves, on va les utiliser.', 'Ces mots là valent plus que n’importe quelle publicité.'] },
  { key: 'prices', q: 'Quelles sont vos prestations et vos prix principaux ? Écrivez les comme ça : Séance découverte 40 €, Forfait 5 séances 180 €.', react: ['Merci, je les ai rangées dans vos prestations.', 'Noté, vos devis seront prêts en trente secondes.'] },
  { key: 'vibe', q: 'Comment parlez vous à vos clients ? Plutôt tutoiement ou vouvoiement, plutôt fun ou élégant ?', react: ['Je vais écrire exactement comme ça.', 'C’est noté, votre ton sera respecté partout.'] },
  { key: 'limits', q: 'Dernière question : qu’est ce que vous refusez de faire dans votre métier ?', react: ['Ce que vous refusez dit beaucoup de votre exigence. Merci pour cette réponse.'] }
];

const WEEKLY_Q = [
  'Quel moment de la semaine vous a rendu fier ou fière ?',
  'Qu’est ce qui vous a freiné cette semaine ?',
  'Quelle question vos clients vous ont posée le plus souvent ?',
  'Qu’avez vous appris cette semaine dans votre métier ?',
  'Quel client vous a fait sourire, et pourquoi ?',
  'Si vous deviez changer une seule chose dans votre activité, ce serait quoi ?',
  'Quelle est la plus belle réalisation de la semaine ?',
  'Qu’est ce qui vous donne de l’énergie en ce moment ?'
];

const STORY_TYPES = ['Avant après', 'Preuve', 'Coulisses', 'Offre', 'Conseil'];
const ANGLES = ['Erreurs', 'Conseils', 'Histoire', 'Preuve', 'Offre'];

function V(vous, tu) { return st.profile.tone === 'tu' ? tu : vous; }
function emo(e) { return st.brand.emoji && st.ai.warmth >= 50 ? ' ' + e : ''; }
function firstName(n) { return String(n || '').trim().split(' ')[0]; }
function lc(s) { s = String(s || '').trim(); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function uc(s) { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
function dot(s) { s = String(s || '').trim(); return s ? (/[.!?»]$/.test(s) ? s : s + '.') : ''; }
function P() {
  const p = st.profile;
  return {
    business: p.business || 'Mon activité', activity: p.activity || 'Indépendant', city: p.city || 'près de chez vous',
    story: p.story || 'Je me suis lancé pour faire les choses autrement.',
    target: p.target || 'Les personnes qui veulent un travail soigné',
    problem: p.problem || 'Vous cherchez quelqu’un de fiable, sans mauvaise surprise',
    value: p.value || 'Un travail soigné et un vrai suivi',
    proof: p.proof || 'Des clients qui reviennent et qui recommandent',
    cta: p.cta || 'Réserver', handle: p.instagram || p.business || 'mon.compte',
    offer: (st.services[0] || {}).name || 'ma prestation'
  };
}

function followMessage(rule, cl) {
  const f = firstName(cl.name), p = P(), w = st.ai.warmth >= 60;
  const hi = w ? `Bonjour ${f} !` : `Bonjour ${f},`;
  const m = {
    prospect: V(`${hi} Je reviens vers vous suite à votre demande. Êtes vous toujours intéressé par ${lc(p.offer)} ? Je peux vous proposer un créneau cette semaine.${emo('😊')}`, `${hi} Je reviens vers toi suite à ta demande. Tu es toujours intéressé par ${lc(p.offer)} ? Je peux te proposer un créneau cette semaine.${emo('😊')}`),
    devis: V(`${hi} Avez vous pu regarder le devis que je vous ai envoyé ? Je reste disponible si vous avez la moindre question.`, `${hi} Tu as pu regarder le devis que je t’ai envoyé ? Je reste dispo si tu as la moindre question.`),
    revoir: V(`${hi} Cela fait un moment depuis notre dernier rendez vous. Souhaitez vous que l’on planifie la suite ensemble ?${emo('✨')}`, `${hi} Ça fait un moment depuis notre dernier rendez vous. Tu veux qu’on planifie la suite ensemble ?${emo('✨')}`),
    avis: V(`${hi} Merci encore pour votre confiance. Si vous avez deux minutes, un avis Google m’aiderait énormément.${emo('🙏')}`, `${hi} Merci encore pour ta confiance. Si tu as deux minutes, un avis Google m’aiderait énormément.${emo('🙏')}`)
  }[rule];
  return st.ai.length > 70 ? `${m}\n\nÀ très vite,\n${st.profile.first || ''} ${p.business}`.trim() : m;
}

function priceLine() {
  return st.services.slice(0, 3).map(s => `${s.name} ${s.price} €`).join(', ') || 'Tarifs sur demande';
}

function storyFrames(type, subject) {
  const p = P(), s = (subject || '').trim();
  const T = {
    'Avant après': [
      { t: s || 'Avant, après.', s: V('Regardez bien la différence.', 'Regarde bien la différence.') },
      { t: 'Avant.', s: dot(p.problem) },
      { t: 'Après.', s: dot(p.value) },
      { t: 'Ce qui change tout.', s: 'Du savoir faire, du soin et le temps qu’il faut.' },
      { t: dot(p.proof), s: V('Et si le prochain, c’était vous ?', 'Et si le prochain, c’était toi ?') },
      { t: 'Places disponibles cette semaine.', s: V('Écrivez moi « INFO » en message.', 'Écris moi « INFO » en message.'), c: p.cta }
    ],
    'Preuve': [
      { t: s ? `Ce que ${s} m’a dit.` : 'Ce qu’un client m’a dit cette semaine.', s: 'Partagé avec son accord.' },
      { t: 'Le résultat.', s: dot(p.value) },
      { t: 'Ce n’est pas un hasard.', s: dot(p.story) },
      { t: 'Ce qu’ils disent.', s: dot(p.proof) },
      { t: 'Merci pour votre confiance.', s: V('Chaque avis compte énormément.', 'Chaque avis compte énormément.') },
      { t: V('À votre tour ?', 'À ton tour ?'), s: V('Réservez votre place.', 'Réserve ta place.'), c: p.cta }
    ],
    'Coulisses': [
      { t: `Dans les coulisses de ${p.business}.`, s: V('Venez, je vous montre.', 'Viens, je te montre.') },
      { t: s || 'Comment je travaille, étape par étape.', s: 'Ce que personne ne voit.' },
      { t: 'Étape 1.', s: V('J’écoute ce dont vous avez vraiment besoin.', 'J’écoute ce dont tu as vraiment besoin.') },
      { t: 'Étape 2.', s: 'Je prépare tout avec soin, sans raccourci.' },
      { t: 'Le résultat.', s: dot(p.value) },
      { t: 'Une question ?', s: V('Répondez à cette story, je réponds à tout.', 'Réponds à cette story, je réponds à tout.'), c: p.cta }
    ],
    'Offre': [
      { t: s || 'Places disponibles ce mois ci.', s: `${p.business}, ${p.city}.` },
      { t: 'Pour qui ?', s: dot(p.target) },
      { t: V('Ce que vous obtenez.', 'Ce que tu obtiens.'), s: dot(p.value) },
      { t: 'Les prix.', s: dot(priceLine()) },
      { t: 'Places limitées.', s: 'Premier message, premier servi.' },
      { t: 'Je réserve.', s: 'Message « INFO » ou lien en bio.', c: p.cta }
    ],
    'Conseil': [
      { t: s || 'Bien choisir : 3 conseils avant de réserver.', s: V('Enregistrez cette story.', 'Enregistre cette story.') },
      { t: '1. Le prix ne dit pas tout.', s: 'Regardez ce qui est inclus, pas seulement le montant.' },
      { t: '2. Demandez des preuves.', s: 'Avis, photos, résultats : un pro les montre volontiers.' },
      { t: '3. Écoutez votre ressenti.', s: 'Vous devez vous sentir compris dès le premier échange.' },
      { t: 'Chez moi ?', s: dot(p.value) },
      { t: V('Une question ?', 'Une question ?'), s: V('Écrivez moi, je vous réponds.', 'Écris moi, je te réponds.'), c: p.cta }
    ]
  };
  return (T[type] || T['Offre']).map(f => ({ t: f.t, s: f.s || '', c: f.c || '' }));
}

function postContent(net, format, angle, subject) {
  const p = P(), s = (subject || '').trim();
  const S = {
    Erreurs: [
      { k: 'CARROUSEL', t: s || 'Les 5 erreurs que je vois le plus souvent.', p: '' },
      { k: '01', t: 'Choisir uniquement sur le prix.', p: 'Le moins cher coûte souvent deux fois.' },
      { k: '02', t: 'Ne pas demander de preuves.', p: 'Avis, photos, résultats : demandez les.' },
      { k: '03', t: 'Attendre la dernière minute.', p: 'Les meilleurs créneaux partent vite.' },
      { k: '04', t: 'Ne pas dire ce que l’on veut vraiment.', p: 'Un bon pro pose des questions. Répondez franchement.' },
      { k: '05', t: 'Ne pas faire de suivi.', p: 'Le résultat se construit aussi après.' },
      { k: 'À RETENIR', t: dot(p.value), p: V('Écrivez moi pour en parler.', 'Écris moi pour en parler.') }
    ],
    Conseils: [
      { k: 'CARROUSEL', t: s || 'Bien choisir : 3 conseils avant de réserver.', p: '' },
      { k: '01', t: 'Regardez ce qui est inclus.', p: 'Comparez le contenu, pas seulement le prix.' },
      { k: '02', t: 'Demandez des preuves.', p: 'Un professionnel les montre volontiers.' },
      { k: '03', t: 'Faites confiance à votre ressenti.', p: 'Vous devez vous sentir écouté dès le début.' },
      { k: 'BONUS', t: 'Enregistrez ce post.', p: V('Et envoyez le à quelqu’un qui en a besoin.', 'Et envoie le à quelqu’un qui en a besoin.') }
    ],
    Histoire: [
      { k: 'MON HISTOIRE', t: s || `Pourquoi j’ai lancé ${p.business}.`, p: '' },
      { k: 'AU DÉBUT', t: 'Tout a commencé simplement.', p: dot(p.story) },
      { k: 'CE QUE J’AI VU', t: 'Un besoin mal servi.', p: dot(p.problem) },
      { k: 'MON CHOIX', t: dot(p.value), p: '' },
      { k: 'AUJOURD’HUI', t: dot(p.proof), p: V('Et demain, peut être vous ?', 'Et demain, peut être toi ?') }
    ],
    Preuve: [
      { k: 'AVIS CLIENTS', t: s || 'Ce que disent mes clients.', p: '' },
      { k: '★★★★★', t: '« Collez ici un avis client. »', p: 'Prénom du client' },
      { k: '★★★★★', t: '« Collez ici un deuxième avis. »', p: 'Prénom du client' },
      { k: 'EN RÉSUMÉ', t: dot(p.proof), p: '' },
      { k: 'MERCI', t: 'Merci pour votre confiance.', p: V('Rejoignez les.', 'Rejoins les.') }
    ],
    Offre: [
      { k: MONTHS_FULL[new Date().getMonth()].toUpperCase(), t: s || `Ce mois ci chez ${p.business}.`, p: '' },
      { k: 'LA PRESTATION', t: dot(p.offer), p: st.services[0] ? `${st.services[0].price} €` : '' },
      { k: 'POUR QUI', t: dot(p.target), p: '' },
      { k: 'LA PROMESSE', t: dot(p.value), p: '' },
      { k: 'RÉSERVER', t: 'Message « INFO ».', p: 'Ou lien en bio.' }
    ]
  };
  let slides = (S[angle] || S.Conseils).map(x => Object.assign({}, x));
  if (format === 'Post') slides = [slides[0]];
  const hook = slides[0].t;
  const words = (p.activity + ' ' + p.city).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/[^a-z0-9]+/).filter(w => w.length > 3).slice(0, 3);
  const tag = s2 => '#' + s2.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  const tags = net === 'Instagram' ? `\n\n${[tag(p.business), ...words.map(w => '#' + w), '#entrepreneur'].join(' ')}` : `\n\n#entrepreneuriat ${words.slice(0, 2).map(w => '#' + w).join(' ')}`;
  let caption;
  if (net === 'LinkedIn') {
    caption = `${hook}\n\n${dot(p.story)}\n\nCe que je vois chez mes clients : ${lc(dot(p.problem))}\n\nCe que j’ai choisi de faire : ${lc(dot(p.value))}\n\nAujourd’hui : ${lc(dot(p.proof))}\n\nEt vous, qu’est ce qui a fait la différence dans votre parcours ?${tags}`;
  } else {
    const body = slides.slice(1, 4).map(x => `${/^\d\d$/.test(x.k) ? x.k + '. ' : ''}${x.t}`).join('\n');
    caption = `${hook}${emo('✨')}\n\n${body}\n\n${V('Enregistrez ce post et partagez le.', 'Enregistre ce post et partage le.')}\n${V('Pour réserver : message « INFO » ou lien en bio.', 'Pour réserver : message « INFO » ou lien en bio.')}${tags}`;
    if (st.ai.length < 30) caption = `${hook}${emo('✨')}\n\n${V('Réservez en bio.', 'Réserve en bio.')}${tags}`;
  }
  return { slides, caption };
}

function bios() {
  const p = P();
  return [
    `${uc(p.activity)}, ${p.city}\n${dot(p.value)}\n${dot(p.proof)}\n👇 ${V('Réservez votre place', 'Réserve ta place')}`,
    `${p.business}\n${dot(p.value)}\nSur rendez vous\n👇 ${V('Infos et réservations', 'Infos et réservations')}`,
    `${uc(p.activity)}\n${dot(p.proof)}\n📍 ${p.city}\n👇 Message « INFO »`
  ];
}
function linkedinHeadline() { const p = P(); return `${uc(p.activity)} à ${p.city} | ${uc(p.value)} | Fondateur de ${p.business}`; }

function nextFreeDate(from) {
  let d = new Date(from || Date.now());
  for (let i = 0; i < 60; i++) { const k = iso(d); if (!st.calendar.some(e => e.date === k)) return k; d = new Date(d.getTime() + DAY); }
  return iso(Date.now());
}
function mondayOf(d) { const x = new Date(d); x.setHours(12, 0, 0, 0); return new Date(x.getTime() - ((x.getDay() + 6) % 7) * DAY); }

function planMonth() {
  const start = mondayOf(Date.now()), today = iso(Date.now());
  const plan = { 1: ['Story', 'Conseil'], 2: ['Carrousel', null], 3: ['Story', 'Preuve'], 4: ['LinkedIn', 'Histoire'], 5: ['Story', 'Offre'] };
  const angles = ['Erreurs', 'Conseils', 'Preuve', 'Histoire'];
  let added = 0, ci = 0;
  for (let i = 0; i < 28; i++) {
    const d = new Date(start.getTime() + i * DAY), k = iso(d);
    if (k < today) continue;
    const last = new Date(d.getTime() + DAY).getMonth() !== d.getMonth();
    const want = last ? ['Bilan', 'Bilan'] : plan[d.getDay()];
    if (!want || st.calendar.some(e => e.date === k)) continue;
    let [type, angle] = want;
    if (type === 'Carrousel') angle = angles[ci++ % angles.length];
    const title = type === 'Bilan' ? 'Story bilan, ce mois chez nous'
      : type === 'LinkedIn' ? 'Post LinkedIn, ' + postContent('LinkedIn', 'Post', angle).slides[0].t
        : type === 'Carrousel' ? 'Carrousel, ' + postContent('Instagram', 'Carrousel', angle).slides[0].t
          : 'Story ' + angle.toLowerCase() + ', ' + storyFrames(angle)[0].t;
    st.calendar.push({ id: uid(), date: k, type, angle, title, done: false });
    added++;
  }
  return added;
}

function weeklyIdea(ans) {
  const a = (ans || '').toLowerCase();
  if (/fi[eè]r|réussi|bravo|photo|merci|content/.test(a)) return 'Story preuve : partagez ce moment, avec l’accord de la personne concernée.';
  if (/frein|peur|hésit|doute|stress|prix|difficile/.test(a)) return 'Post coulisses : racontez ce doute et ce que vous en avez appris. Ce sont les posts les plus partagés.';
  if (/question|demand|souvent/.test(a)) return 'Carrousel conseils : répondez à cette question en cinq slides.';
  if (/appris|formation|technique|nouveau/.test(a)) return 'Story coulisses : montrez ce que vous avez appris en trois étapes.';
  return 'Story authentique : racontez ce moment en trois slides, avec votre ton.';
}

function personalization() {
  const ans = Object.keys(st.interview.answers || {}).length;
  return Math.min(100, Math.round(ans / INTERVIEW.length * 40 + Math.min(st.weekly.length, 6) * 5 + Math.min(st.perf.length, 10) * 2 + Math.min(st.calendar.filter(e => e.done).length, 10)));
}
function bestAngle() {
  const by = {};
  st.perf.forEach(p => { by[p.angle] = by[p.angle] || { n: 0, m: 0, v: 0 }; by[p.angle].n++; by[p.angle].m += +p.messages || 0; by[p.angle].v += +p.views || 0; });
  return Object.entries(by).map(([a, o]) => ({ a, m: o.m / o.n, v: o.v / o.n })).sort((x, y) => y.m - x.m);
}

function landingHTML(o) {
  const p = st.profile, q = P(), b = st.brand;
  const phone = String(p.phone || '').replace(/\D/g, '').replace(/^0/, '33');
  const items = st.services.map(s => `<li><span>${esc(s.name)}</span><b>${s.price} €</b></li>`).join('') || '<li><span>Tarifs sur demande</span></li>';
  const href = phone ? `https://wa.me/${phone}?text=${encodeURIComponent('Bonjour, je souhaite prendre rendez vous.')}` : (p.email ? `mailto:${esc(p.email)}` : '#');
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(q.business)}</title><meta name="description" content="${esc(dot(q.value))}"><style>
*{box-sizing:border-box;margin:0;padding:0}body{font-family:${b.font === 'Serif' ? 'Georgia,serif' : 'system-ui,-apple-system,Segoe UI,Roboto,sans-serif'};color:${b.ink};background:#fff;line-height:1.5}
.h{background:${b.primary};color:#fff;padding:56px 24px 64px;text-align:center}.h small{font-size:12px;letter-spacing:.14em;text-transform:uppercase;opacity:.75}
.h h1{font-size:clamp(32px,7vw,54px);line-height:1.04;letter-spacing:-.03em;margin:14px auto 0;max-width:16ch}.h p{margin:16px auto 0;max-width:42ch;opacity:.9}
.b{display:inline-block;margin-top:26px;background:#fff;color:${b.ink};text-decoration:none;font-weight:700;padding:15px 28px;border-radius:30px}
.s{max-width:640px;margin:0 auto;padding:44px 24px}.s h2{font-size:24px;letter-spacing:-.02em;margin-bottom:14px}
ul{list-style:none}li{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid #E3E8F2}
.p{background:${b.soft};border-radius:18px;padding:22px;margin-top:8px;font-size:17px}
footer{text-align:center;padding:30px 24px;font-size:13px;color:#5A6680}
</style></head><body><header class="h"><small>${esc(uc(q.activity))}, ${esc(q.city)}</small><h1>${esc(o.headline)}</h1><p>${esc(o.sub)}</p><a class="b" href="${href}">${esc(o.cta)}</a></header>
<section class="s"><h2>Prestations</h2><ul>${items}</ul></section><section class="s" style="padding-top:0"><h2>Ce qu’en disent les clients</h2><p class="p">${esc(dot(q.proof))}</p></section>
<footer>${esc(q.business)}${p.city ? ' · ' + esc(p.city) : ''}${p.instagram ? ' · @' + esc(p.instagram) : ''}${p.siret ? ' · SIRET ' + esc(p.siret) : ''}</footer></body></html>`;
}

function wrapLines(ctx, text, maxW) {
  const out = [];
  String(text).split('\n').forEach(par => {
    let line = '';
    par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
    out.push(line);
  });
  return out;
}
function palette(style) {
  const b = st.brand;
  if (style === 'Nuit') return { bg: '#0A1020', fg: '#F6F8FC', cb: b.accent, cf: '#FFFFFF' };
  if (style === 'Clair') return { bg: '#F6F8FC', fg: b.ink, cb: b.primary, cf: '#FFFFFF' };
  return { bg: b.accent, fg: '#FFFFFF', cb: '#FFFFFF', cf: b.ink };
}
function fontFam() { return st.brand.font === 'Serif' ? 'Georgia, serif' : 'Inter, sans-serif'; }
function drawStory(frame, i, total, style) {
  const W = 1080, H = 1920, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), c = palette(style), font = fontFam();
  x.fillStyle = c.bg; x.fillRect(0, 0, W, H);
  const gap = 10, bw = (W - 120 - gap * (total - 1)) / total;
  for (let k = 0; k < total; k++) { x.globalAlpha = k <= i ? 1 : .35; x.fillStyle = c.fg; x.fillRect(60 + k * (bw + gap), 70, bw, 8); }
  x.globalAlpha = 1; x.beginPath(); x.arc(92, 150, 30, 0, Math.PI * 2); x.fill();
  x.font = `600 34px ${font}`; x.fillText(P().handle, 140, 162);
  let y = H - 220 - (frame.c ? 140 : 0);
  x.font = `500 46px ${font}`; const sub = frame.s ? wrapLines(x, frame.s, W - 160) : [];
  x.font = `800 104px ${font}`; const tl = wrapLines(x, frame.t, W - 160);
  y -= sub.length * 62 + (sub.length ? 40 : 0) + tl.length * 108;
  tl.forEach(l => { y += 108; x.fillText(l, 80, y); });
  x.font = `500 46px ${font}`; x.globalAlpha = .9; y += 30; sub.forEach(l => { y += 62; x.fillText(l, 80, y); });
  x.globalAlpha = 1;
  if (frame.c) { const by = H - 280; x.fillStyle = c.cb; roundRect(x, 80, by, W - 160, 120, 60); x.fill(); x.fillStyle = c.cf; x.font = `700 44px ${font}`; x.textAlign = 'center'; x.fillText(frame.c, W / 2, by + 76); x.textAlign = 'left'; }
  return cv.toDataURL('image/png');
}
function drawSlide(sl, i, total, style) {
  const W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'), c = palette(i === 0 ? style : (i % 2 ? 'Clair' : style)), font = fontFam();
  x.fillStyle = c.bg; x.fillRect(0, 0, W, H); x.fillStyle = c.fg;
  x.font = `700 34px ${font}`; x.globalAlpha = .7; x.fillText(sl.k, 90, 140); x.globalAlpha = 1;
  x.font = `800 92px ${font}`; const tl = wrapLines(x, sl.t, W - 180);
  x.font = `500 42px ${font}`; const pl = sl.p ? wrapLines(x, sl.p, W - 180) : [];
  let y = H - 160 - pl.length * 58 - (pl.length ? 30 : 0) - tl.length * 98;
  x.font = `800 92px ${font}`; tl.forEach(l => { y += 98; x.fillText(l, 90, y); });
  x.font = `500 42px ${font}`; y += 30; x.globalAlpha = .9; pl.forEach(l => { y += 58; x.fillText(l, 90, y); });
  x.globalAlpha = .6; x.font = `600 30px ${font}`; x.textAlign = 'right'; x.fillText(`${i + 1} / ${total}`, W - 90, 140); x.textAlign = 'left';
  return cv.toDataURL('image/png');
}
function roundRect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
