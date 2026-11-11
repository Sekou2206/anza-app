const RX = {
  unsure: /\b(je (ne )?sais pas|j[’']sais pas|aucune id[ée]e|pas s[ûu]r|bof|j[’']h[ée]site|rien de sp[ée]cial|je vois pas|je ne vois pas|aucune|pas vraiment)\b/i,
  skip: /^(passe|je passe|plus tard|suivant|next|je pr[ée]f[èe]re ne pas)/i,
  hard: /\b(difficile|dur|peur|gal[èe]re|stress|seule?|fatigu|[ée]puis|compliqu|d[ée]courag)/i,
  love: /\b(adore|passion|kiff|j[’']aime|r[êe]ve|fi[èe]re?)/i
};
const SECTORS = [
  ['beauté', /ongl|coiff|esth[ée]ti|maquill|cils?\b|barb|manucur|soin du visage|onglerie/i, 'Un métier de l’image : on misera sur l’avant après, les coulisses et les preuves en photo.'],
  ['sport', /coach|sport|fitness|muscu|pilates|yoga|course|boxe|danse/i, 'Le sport se vend par la transformation : on racontera les progrès, semaine après semaine.'],
  ['image', /photo|vid[ée]o|film|montage|cin[ée]/i, 'Votre travail parle de lui même : on montrera vos images, et surtout l’émotion qu’elles provoquent.'],
  ['food', /traiteur|cuisin|p[âa]tiss|restau|food|chef|g[âa]teau|repas|brunch/i, 'La cuisine se vend avec les yeux : gros plans, coulisses et retours clients seront vos meilleurs contenus.'],
  ['mode', /styl|couture|v[êe]tement|bijou|mode|cr[ée]atri|cr[ée]ateur|sac|accessoire/i, 'La mode se raconte : l’inspiration, la fabrication et les clients qui portent vos pièces.'],
  ['conseil', /consult|freelance|d[ée]velopp|web|graphi|marketing|\brh\b|comptab|juri|assistant|community/i, 'Un métier de conseil : LinkedIn et les carrousels pédagogiques seront vos meilleurs alliés.'],
  ['bien-être', /massage|naturo|sophro|bien.?[êe]tre|r[ée]flexo|m[ée]ditation|th[ée]rap/i, 'Le bien être demande de la confiance : on mettra en avant votre approche et votre écoute.'],
  ['artisan', /menuis|plomb|[ée]lectri|b[âa]timent|r[ée]nov|peint|artisan|carrel|jardin/i, 'Un métier manuel : les chantiers avant après et le savoir faire en vidéo vont faire la différence.'],
  ['formation', /cours|prof|soutien|formation|enseign|tutorat|langue/i, 'Transmettre, c’est votre force : chaque conseil partagé en story montrera votre expertise.'],
  ['événementiel', /d[ée]co|mariage|wedding|\bdj\b|[ée]v[ée]nement|anniversaire|f[êe]te/i, 'L’événementiel se vend sur l’émotion : on racontera les plus beaux moments que vous créez.']
];
function words(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
function quote(s, n) { s = String(s || '').replace(/\s+/g, ' ').trim().replace(/[.!?]+$/, ''); const w = s.split(' '); return w.length > (n || 12) ? w.slice(0, n || 12).join(' ') + '…' : s; }
function sectorOf(s) { const f = SECTORS.find(x => x[1].test(s || '')); return f ? f : null; }

const FOLLOW = {
  business: 'Pas encore de nom ? Aucun souci. On peut partir de votre prénom ou de votre métier, par exemple « {ex1} » ou « {ex2} ». Quel nom vous plaît ?',
  activity: 'Pour que je comprenne bien : que vendez vous concrètement ? Une prestation, un produit, un accompagnement ?',
  story: 'Pouvez vous m’en dire un peu plus ? Le moment précis, ce qui vous a décidé, une personne qui a compté…',
  target: 'Quand on parle à tout le monde, on ne touche personne. Si vous deviez choisir un seul type de client, ce serait qui ? Son âge, sa situation, ce qu’il cherche.',
  problem: 'Mettez vous à leur place : qu’est ce qui les agace, les inquiète ou leur manque juste avant de vous contacter ?',
  value: 'Tout le monde dit « qualité » ou « écoute ». Qu’est ce que vous faites que les autres ne font pas ? Un détail, une méthode, une garantie, un délai…',
  proof: 'Même une seule réussite compte : un client content, un message reçu, une photo dont vous êtes fier ou fière. Vous avez un exemple ?',
  prices: 'Je n’ai pas réussi à lire vos prix. Écrivez les comme ceci : Séance découverte 40 €, Forfait 5 séances 180 €.',
  vibe: 'Plutôt « vous » ou plutôt « tu » avec vos clients ? Et plutôt fun, chaleureux, élégant, ou direct ?',
  limits: 'Par exemple : un type de client, une prestation bâclée, des délais impossibles… Qu’est ce que vous refusez ?'
};

function reactTo(key, ans, asked) {
  const a = String(ans || '').trim(), w = words(a), p = st.profile;
  const fu = FOLLOW[key] ? FOLLOW[key].replace('{ex1}', p.first ? 'Atelier ' + p.first : 'L’atelier de [votre prénom]').replace('{ex2}', p.first ? p.first + ' Studio' : '[votre prénom] Studio') : '';
  if (RX.skip.test(a)) return { text: 'Pas de souci, on passe. Vous pourrez compléter plus tard dans les Réglages.' };
  if (!asked && fu && (RX.unsure.test(a) || (w < 3 && ['story', 'target', 'problem', 'value', 'proof', 'limits'].includes(key)))) return { follow: (RX.unsure.test(a) ? 'C’est normal de ne pas savoir tout de suite. ' : '') + fu };
  const pre = RX.hard.test(a) ? 'Merci pour votre sincérité, ce n’est jamais simple. ' : RX.love.test(a) ? 'On sent que vous aimez ce que vous faites, c’est votre meilleur argument. ' : '';
  let t = '';
  switch (key) {
    case 'business': t = /pas encore|pas de nom|aucun/i.test(a) && !asked ? null : `« ${quote(a, 6)} », c’est noté.${w <= 2 ? ' Court et facile à retenir, parfait pour Instagram.' : ''}`; if (t === null) return { follow: fu }; break;
    case 'activity': { const s = sectorOf(a); if (s) p.sector = s[0]; t = s ? s[2] : 'Très clair, merci. Je vais construire vos contenus autour de ce métier.'; break; }
    case 'city': t = /ligne|distance|partout|visio|remote|toute la france|international/i.test(a) ? 'Vous travaillez à distance : on visera large, et LinkedIn sera un vrai levier.' : `${quote(a, 6)} : je l’ajouterai dans vos bios et vos hashtags pour qu’on vous trouve près de chez vous.`; break;
    case 'story':
      t = /reconver|quitt|licenci|d[ée]mission|ancien (job|travail|m[ée]tier)|burn/i.test(a) ? 'Une reconversion, c’est une histoire qui inspire. On en fera un post LinkedIn.'
        : /famille|maman|enfant|m[èe]re|p[èe]re|s[œo]eur|fr[èe]re|cousin|grand/i.test(a) ? 'La famille au cœur de l’histoire, ça crée une vraie proximité avec vos clients.'
          : /passion|depuis (petit|toute|tout|l[’']enfance)|toujours/i.test(a) ? 'Une passion de longue date : c’est votre légitimité, on la mettra en avant.'
            : /argent|ind[ée]pendan|libert[ée]|patron|ch[ôo]mage/i.test(a) ? 'L’envie de liberté, beaucoup de vos futurs clients s’y reconnaîtront.'
              : `« ${quote(a, 10)} » : c’est exactement le genre d’histoire que vos clients ont envie de connaître.`; break;
    case 'target': {
      if (!asked && /tout le monde|\btous\b|n[’']importe qui|tout public/i.test(a)) return { follow: fu };
      const who = (a.match(/\b(femmes?|hommes?|mamans?|papas?|parents?|couples?|mari[ée]e?s|entreprises?|pros?|professionnels?|ind[ée]pendants?|[ée]tudiants?|seniors?|jeunes|ados|sportifs?|artisans?|commer[çc]ants?|start ?ups?)\b/i) || [])[0];
      const age = (a.match(/\d{2}\s*(?:à|a|et|-)\s*\d{2}\s*ans/i) || [])[0];
      const fem = /femme|maman|mari[ée]es|filles|m[èe]res/i.test(who || '');
      t = who ? `${uc(who)}${age ? ' de ' + age.replace(/\s*-\s*/, ' à ') : ''} : je vais écrire en pensant à ${fem ? 'elles' : 'eux'}, avec leurs mots.` : 'Parfait, je vais écrire pour cette personne là, comme si je lui parlais directement.'; break;
    }
    case 'problem': t = `« ${quote(a, 12)} » : c’est le point de départ de vos stories. Vos futurs clients vont se reconnaître.`; break;
    case 'value':
      if (!asked && w < 9 && /qualit|s[ée]rieu|[ée]coute|professionn|passion|r[ée]activ|soin/i.test(a) && !/\d/.test(a)) return { follow: fu };
      t = `Voilà votre promesse : « ${quote(a, 14)} ». On va la répéter souvent, c’est voulu.`; break;
    case 'proof':
      t = /d[ée]bute|pas encore|aucun|rien|personne/i.test(a) ? 'Vous débutez, c’est normal. On commencera par montrer votre travail et vos coulisses, les preuves viendront vite. Anza vous rappellera de demander un avis à chaque client satisfait.'
        : /\d/.test(a) ? `Des chiffres, parfait : « ${quote(a, 12)} ». C’est concret, on va s’en servir partout.`
          : /avis|[ée]toile|note|google|recommand|bouche/i.test(a) ? 'Des avis et du bouche à oreille, c’est la preuve la plus forte. On va les mettre en avant.'
            : `« ${quote(a, 12)} » : ces mots là valent plus que n’importe quelle publicité.`; break;
    case 'prices': return null;
    case 'vibe': { const tu = /tutoi|\btu\b/i.test(a) && !/vouvoi/i.test(a); const style = /fun|dr[ôo]le|humour|d[ée]contract|cool/i.test(a) ? 'décontracté' : /[ée]l[ée]gan|chic|luxe|raffin/i.test(a) ? 'élégant' : /direct|franc|cash/i.test(a) ? 'direct' : 'chaleureux'; t = `${tu ? 'On se tutoie' : 'Vouvoiement'} et un ton ${style} : c’est noté, je l’appliquerai partout, des stories aux relances.`; break; }
    case 'limits': t = /rien|aucun|pas de limite/i.test(a) ? 'D’accord. Si un jour quelque chose vous gêne, dites le moi, j’en tiendrai compte.' : `Merci. Je n’écrirai jamais rien qui aille contre ça : « ${quote(a, 10)} ».`; break;
  }
  return { text: pre + t };
}

function pricesReaction(n) {
  if (!n) return null;
  const list = st.services.slice(-n).map(s => `${s.name} ${s.price} €`).join(', ');
  return `J’ai enregistré ${n > 1 ? n + ' prestations' : 'votre prestation'} : ${list}. Vos devis seront prêts en trente secondes.`;
}

function weeklyImpact(q, ans) {
  const a = String(ans || ''), short = quote(a, 9), acts = [], memory = [], updates = {};
  let reply = '', focus = '';
  const add = (d, type, angle, title) => acts.push({ type: 'calendar', in_days: d, format: type, angle, title, brief: a.slice(0, 280) });
  if (RX.hard.test(a) && /fatigu|[ée]puis|d[ée]courag/i.test(a)) {
    reply = 'Merci de me le dire. Cette semaine, on allège : une seule story simple, et je garde vos relances prêtes pour que vous n’ayez rien à réfléchir. Prenez soin de vous.';
    memory.push('Période de fatigue signalée, alléger le rythme.'); focus = 'Semaine légère';
    add(3, 'Story', 'Coulisses', 'Story coulisses, une semaine plus douce');
  } else if (/fi[eè]r|r[ée]ussi|bravo|content|heureu|merci|super|top|photo/i.test(a)) {
    reply = `Bravo, c’est exactement ce qu’il faut montrer. Je prépare une story preuve autour de « ${short} » pour après demain. Pensez à demander l’accord de la personne concernée.`;
    memory.push('Fierté récente : ' + short); focus = 'Montrer vos preuves';
    add(2, 'Story', 'Preuve', 'Story preuve, ' + lc(short));
    if (!st.profile.proof) updates.proof = quote(a, 16);
  } else if (/prix|tarif|cher|augment|n[ée]goci/i.test(a)) {
    reply = 'Parler de vos prix, c’est assumer votre valeur. Je prépare un post LinkedIn qui explique ce qu’il y a derrière vos tarifs, et un carrousel sur les erreurs à éviter quand on choisit un professionnel.';
    memory.push('Sujet sensible : les prix. ' + short); focus = 'Assumer vos prix';
    add(3, 'LinkedIn', 'Histoire', 'Post LinkedIn, ce qu’il y a derrière mes prix'); add(5, 'Carrousel', 'Erreurs', 'Carrousel, les erreurs qui coûtent cher');
  } else if (/question|demand|souvent|toujours la m[êe]me/i.test(a)) {
    reply = `Une question qui revient, c’est un contenu tout trouvé. Je prépare un carrousel qui y répond en cinq slides, à publier dans trois jours.`;
    memory.push('Question fréquente des clients : ' + short); focus = 'Répondre aux questions';
    add(3, 'Carrousel', 'Conseils', 'Carrousel, ' + lc(short));
  } else if (/frein|peur|h[ée]sit|doute|stress|difficile|gal[èe]re|bloqu/i.test(a)) {
    reply = 'Merci pour votre honnêteté. Les doutes partagés créent beaucoup de proximité : je vous propose un post coulisses sincère pour jeudi, vous pourrez l’ajuster avant publication.';
    memory.push('Frein actuel : ' + short); focus = 'Oser se montrer';
    add(3, 'LinkedIn', 'Histoire', 'Post LinkedIn, ' + short);
  } else if (/appris|formation|technique|nouveau|nouvelle|d[ée]couvert|test[ée]/i.test(a)) {
    reply = `Super, ça montre que vous progressez. Je prépare une story coulisses pour montrer « ${short} » en trois étapes.`;
    memory.push('Nouvelle compétence : ' + short); focus = 'Montrer votre savoir faire';
    add(2, 'Story', 'Coulisses', 'Story coulisses, ' + short);
  } else if (/client|cliente/i.test(a)) {
    reply = 'Une belle histoire client, ça vaut toutes les publicités. Je prépare une story preuve, avec son accord bien sûr.';
    memory.push('Histoire client : ' + short); focus = 'Vos clients en avant';
    add(2, 'Story', 'Preuve', 'Story preuve, ' + short);
  } else if (/changer|am[ée]liorer|j[’']aimerais|objectif|envie/i.test(a)) {
    reply = `C’est noté comme votre objectif du moment : « ${short} ». J’oriente vos prochains contenus dans ce sens, et je vous en reparlerai dans quelques semaines.`;
    memory.push('Objectif : ' + short); focus = quote(a, 6);
    add(4, 'Story', 'Offre', 'Story offre, ' + short);
  } else {
    reply = `Merci. Je transforme ce moment en story authentique pour après demain : « ${short} ».`;
    memory.push('Moment de la semaine : ' + short);
    add(2, 'Story', 'Coulisses', 'Story, ' + short);
  }
  return { reply, updates, memory, actions: acts, focus };
}
