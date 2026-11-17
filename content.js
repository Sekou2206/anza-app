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

const STORY_TYPES = ['Offre', 'Avant après', 'Preuve', 'Coulisses', 'Conseil', 'Occasion', 'Objection'];
const ANGLES = ['Erreurs', 'Conseils', 'Histoire', 'Preuve', 'Offre', 'Coulisses', 'Objection', 'Occasion'];

function V(vous, tu) { return st.profile.tone === 'tu' ? tu : vous; }
function emo(e) { return st.brand.emoji && st.ai.warmth >= 50 ? ' ' + e : ''; }
function firstName(n) { return String(n || '').trim().split(' ')[0]; }
function lc(s) { s = String(s || '').trim(); return s ? s.charAt(0).toLowerCase() + s.slice(1) : s; }
function uc(s) { s = String(s || '').trim(); return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }
const EMOJI_RX = /[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{2190}-\u{21FF}\u{2300}-\u{23FF}\u{FE0F}\u{200D}\u{20E3}]/gu;
function tidy(s) {
  s = String(s == null ? '' : s);
  if (!(st && st.brand && st.brand.emoji)) s = s.replace(EMOJI_RX, '');
  return s.replace(/([^.])\.\.(?!\.)/g, '$1.').replace(/[ \t]+([.,!?;:])(?=\s|$)/g, (m, x) => /[!?;:]/.test(x) ? ' ' + x : x).replace(/,\s*\./g, '.').replace(/\.\s*,/g, ',').replace(/[ \t]{2,}/g, ' ').replace(/ *\n */g, '\n').replace(/\n{3,}/g, '\n\n').trim();
}
function fitBio(s, max) {
  max = max || 150; s = tidy(s);
  if (s.length <= max) return s;
  let lines = s.split('\n').filter(Boolean);
  while (lines.length > 2 && lines.join('\n').length > max) lines.splice(lines.length - 2, 1);
  s = lines.join('\n');
  if (s.length <= max) return s;
  s = s.slice(0, max - 1); const cut = s.lastIndexOf(' '); return (cut > max * 0.6 ? s.slice(0, cut) : s).replace(/[\s,;:]+$/, '') + '…';
}
function dot(s) { s = String(s || '').trim(); return s ? (/[.!?»]$/.test(s) ? s : s + '.') : ''; }
function P() {
  const p = st.profile;
  return {
    business: p.business || 'Mon activité', activity: p.activity || 'Indépendant', city: p.city || 'près de chez vous',
    story: p.story || 'Je me suis lancé pour faire les choses autrement.',
    target: (typeof primaryPersona === 'function' && primaryPersona() ? uc(personaShort()) : '') || p.target || 'Les personnes qui veulent un travail soigné',
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
    avis: V(`${hi} Merci encore pour votre confiance. Si vous avez deux minutes, un avis Google m’aiderait énormément.${emo('🙏')}`, `${hi} Merci encore pour ta confiance. Si tu as deux minutes, un avis Google m’aiderait énormément.${emo('🙏')}`) + (st.profile.googleReview ? `\n${st.profile.googleReview}` : ''),
    rappel: V(`${hi} Petit rappel : je vous attends ${cl.next === iso(Date.now() + DAY) ? 'demain' : cl.next === iso(Date.now()) ? 'aujourd’hui' : 'le ' + fdateL(cl.next)}${cl.nextTime ? ' à ' + cl.nextTime.replace(':', 'h') : ''}. Si vous avez un empêchement, prévenez moi dès que possible. À très vite !`, `${hi} Petit rappel : je t’attends ${cl.next === iso(Date.now() + DAY) ? 'demain' : cl.next === iso(Date.now()) ? 'aujourd’hui' : 'le ' + fdateL(cl.next)}${cl.nextTime ? ' à ' + cl.nextTime.replace(':', 'h') : ''}. Si tu as un empêchement, préviens moi dès que possible. À très vite !`)
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
      { t: V('À votre tour ?', 'À ton tour ?'), s: V(`${uc(p.cta || 'Réserver')} : le lien est en bio.`, `${uc(p.cta || 'Réserver')} : le lien est en bio.`), c: p.cta }
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
    'Occasion': occasionFrames(s),
    'Objection': objectionFrames(s),
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

function occasionFrames(subject) {
  const o = currentOccasion() || upcomingOccasions(60)[0], p = P(), sv = st.services[0];
  if (!o) return null;
  return [
    { t: subject || `${o.name} ${inDays(o.days)}.`, s: V('Vous y avez pensé ?', 'Tu y as pensé ?') },
    { t: occasionLine(o), s: '' },
    { t: V('Mon idée pour vous.', 'Mon idée pour toi.'), s: sv ? `${sv.name}, ${sv.price} €.` : dot(p.offer) },
    { t: `Places limitées avant le ${fdate(iso(o.date))}.`, s: 'À cette période, les créneaux partent vite.' },
    { t: dot(p.proof), s: dot(p.value) },
    { t: V('Je réserve.', 'Je réserve.'), s: 'Message « INFO » ou lien en bio.', c: p.cta }
  ];
}
function pickObjection(subject) {
  const per = primaryPersona(), list = per && per.objections.length ? per.objections : sec().objections.map(k => Object.assign({ key: k }, OBJ[k]()));
  if (subject) { const f = list.find(o => slug(o.q).includes(slug(subject)) || slug(subject).includes(o.key)); if (f) return f; }
  return list[(new Date().getDate()) % list.length];
}
function objectionFrames(subject) {
  const o = pickObjection(subject), p = P();
  return [
    { t: `« ${o.q.replace(/\.$/, '')} »`, s: 'C’est ce qu’on me dit souvent.' },
    { t: 'Je comprends.', s: o.e },
    { t: 'La vérité.', s: o.a },
    { t: 'Ce qui change tout.', s: dot(p.value) },
    { t: dot(p.proof), s: V('Et vous, qu’est ce qui vous retient ?', 'Et toi, qu’est ce qui te retient ?') },
    { t: 'On en parle ?', s: V('Écrivez moi, je réponds à tout.', 'Écris moi, je réponds à tout.'), c: p.cta }
  ];
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
    ],
    Coulisses: [
      { k: 'COULISSES', t: s || `Une journée chez ${p.business}.`, p: '' },
      { k: 'LE MATIN', t: 'Tout commence par la préparation.', p: 'Ce que personne ne voit, mais qui change tout.' },
      { k: 'LE DÉTAIL', t: 'Le soin du détail.', p: dot(p.value) },
      { k: 'LE RÉSULTAT', t: 'Et voilà le résultat.', p: dot(p.proof) },
      { k: 'ET VOUS ?', t: V('Vous voulez la même chose ?', 'Tu veux la même chose ?'), p: V('Écrivez moi « INFO ».', 'Écris moi « INFO ».') }
    ],
    Objection: (() => { const o = pickObjection(s); return [
      { k: 'ON ME DIT SOUVENT', t: s || `« ${o.q.replace(/\.$/, '')} »`, p: '' },
      { k: 'JE COMPRENDS', t: o.e, p: '' },
      { k: 'LA VÉRITÉ', t: o.a, p: '' },
      { k: 'CE QUI CHANGE TOUT', t: dot(p.value), p: dot(p.proof) },
      { k: 'ON EN PARLE ?', t: V('Écrivez moi, je réponds à tout.', 'Écris moi, je réponds à tout.'), p: '' }
    ]; })(),
    Occasion: (() => { const o = currentOccasion() || upcomingOccasions(60)[0]; if (!o) return null; const sv = st.services[0]; return [
      { k: o.name.toUpperCase(), t: s || `${o.name} ${inDays(o.days)}.`, p: '' },
      { k: 'MON IDÉE', t: occasionLine(o), p: '' },
      { k: 'LA PRESTATION', t: sv ? `${sv.name}.` : dot(p.offer), p: sv ? `${sv.price} €` : '' },
      { k: 'ATTENTION', t: `Places limitées avant le ${fdate(iso(o.date))}.`, p: 'Les créneaux partent vite à cette période.' },
      { k: 'RÉSERVER', t: 'Message « INFO ».', p: 'Ou lien en bio.' }
    ]; })()
  };
  let slides = (S[angle] || S.Conseils).map(x => Object.assign({}, x));
  if (format === 'Post') slides = [slides[0]];
  const hook = slides[0].t;
  let caption;
  if (net === 'LinkedIn') {
    caption = `${hook}\n\n${dot(p.story)}\n\nCe que je vois chez mes clients : ${lc(dot(p.problem))}\n\nCe que j’ai choisi de faire : ${lc(dot(p.value))}\n\nAujourd’hui : ${lc(dot(p.proof))}\n\nEt vous, qu’est ce qui a fait la différence dans votre parcours ?`;
  } else {
    const body = slides.slice(1, 4).map(x => `${/^\d\d$/.test(x.k) ? x.k + '. ' : ''}${x.t}`).join('\n');
    caption = `${hook}${emo('✨')}\n\n${body}\n\n${V('Enregistrez ce post et partagez le.', 'Enregistre ce post et partage le.')}\n${uc(st.profile.cta || 'Réserver')} : message « INFO » ou lien en bio.`;
    if (st.ai.length < 30) caption = `${hook}${emo('✨')}\n\n${uc(st.profile.cta || 'Réserver')} : lien en bio.`;
  }
  return { slides, caption, tags: hashtags(net) };
}

function bios() {
  const p = P(), cta = uc(st.profile.cta || V('Réservez votre place', 'Réserve ta place')), arrow = st.brand.emoji ? '👇 ' : '', pin = st.brand.emoji ? '📍 ' : '';
  return [
    `${uc(p.activity)}, ${p.city}\n${dot(p.value)}\n${dot(p.proof)}\n${arrow}${cta}`,
    `${p.business}\n${dot(p.value)}\nSur rendez vous\n${arrow}${cta}`,
    `${uc(p.activity)}\n${dot(p.proof)}\n${pin}${p.city}\n${arrow}${cta}`
  ].map(b => fitBio(b, 150));
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
  let added = 0, ci = 0, occDone = false;
  for (let i = 0; i < 28; i++) {
    const d = new Date(start.getTime() + i * DAY), k = iso(d);
    if (k < today) continue;
    const last = new Date(d.getTime() + DAY).getMonth() !== d.getMonth();
    const want = last ? ['Bilan', 'Bilan'] : plan[d.getDay()];
    if (!want || st.calendar.some(e => e.date === k)) continue;
    let [type, angle] = want;
    if (type === 'Carrousel') angle = angles[ci++ % angles.length];
    const oc = currentOccasion();
    if (oc && type === 'Story' && !st.calendar.some(e => e.angle === 'Occasion' && e.date >= today) && !occDone) { const od = toDate(iso(oc.date)); if (d < od) { angle = 'Occasion'; occDone = true; } }
    const title = type === 'Bilan' ? 'Story bilan, ce mois chez nous'
      : type === 'LinkedIn' ? 'Post LinkedIn, ' + postContent('LinkedIn', 'Post', angle).slides[0].t
        : type === 'Carrousel' ? 'Carrousel, ' + postContent('Instagram', 'Carrousel', angle).slides[0].t
          : 'Story ' + angle.toLowerCase() + ', ' + (storyFrames(angle)[0] || {}).t;
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

function wrapLines(ctx, text, maxW) {
  const out = [];
  String(text).split('\n').forEach(par => {
    let line = '';
    par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
    out.push(line);
  });
  return out;
}
function deepTidy(o) {
  if (typeof o === 'string') return tidy(o);
  if (Array.isArray(o)) return o.map(deepTidy);
  if (o && typeof o === 'object') { const r = {}; for (const k in o) r[k] = /^(id|date|in_days|format|angle|type|key|style|net)$/.test(k) ? o[k] : deepTidy(o[k]); return r; }
  return o;
}
['storyFrames', 'postContent', 'followMessage', 'linkedinHeadline'].forEach(n => { const f = window[n]; if (typeof f === 'function') window[n] = function () { return deepTidy(f.apply(this, arguments)); }; });
