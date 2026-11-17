const SECTOR = {
  'beauté': {
    unit: 'rendez vous', gift: 'Offrez un moment de soin', verb: 'prendre soin de vous',
    season: { hiver: 'Les fêtes approchent : on prépare votre mise en beauté.', printemps: 'Le printemps, le bon moment pour changer de style.', ete: 'L’été, une beauté qui tient malgré la chaleur.', automne: 'L’automne, on chouchoute sa peau et ses cheveux.' },
    tags: { big: ['beaute', 'nails', 'skincare', 'maquillage', 'coiffure'], mid: ['ongles', 'nailart', 'manucure', 'soinduvisage', 'extensionscils', 'coiffureafro', 'esthetique', 'routinebeaute'], niche: ['prothesisteongulaire', 'onglesengel', 'semipermanent', 'beautenaturelle', 'cheveuxnaturels', 'instantbeaute'] },
    personas: [
      { name: 'Inès', age: '25 à 34 ans', situation: 'salariée, active, peu de temps pour elle', trigger: 'un événement qui arrive : mariage, anniversaire, soirée', budget: '30 à 80 € par rendez vous', platforms: ['Instagram', 'TikTok'] },
      { name: 'Sarah', age: '35 à 50 ans', situation: 'maman, cherche un moment rien qu’à elle', trigger: 'l’envie de se faire plaisir après une période chargée', budget: '40 à 100 € par rendez vous', platforms: ['Instagram', 'Facebook'] }
    ],
    places: ['salles de sport et studios de yoga du quartier', 'boutiques de mode et concept stores', 'groupes Facebook de mamans de votre ville'],
    objections: ['prix', 'confiance', 'temps']
  },
  'sport': {
    unit: 'séance', gift: 'Offrez une séance', verb: 'vous remettre en forme',
    season: { hiver: 'L’hiver, on garde le rythme même quand il fait froid.', printemps: 'Le printemps, le moment idéal pour préparer l’été.', ete: 'L’été, on bouge autrement, dehors et en douceur.', automne: 'L’automne, on garde le rythme avant l’hiver.' },
    tags: { big: ['sport', 'fitness', 'motivation', 'workout'], mid: ['coachsportif', 'remiseenforme', 'sportadomicile', 'pilates', 'musculation', 'sportsante'], niche: ['coachingpersonnalise', 'reprisedusport', 'sportapresgrossesse', 'cardiotraining', 'coachfemme'] },
    personas: [
      { name: 'Camille', age: '28 à 40 ans', situation: 'cadre, sédentaire, a déjà abandonné la salle', trigger: 'une photo ou un essoufflement qui fait déclic', budget: '40 à 60 € la séance, 250 à 400 € le programme', platforms: ['Instagram', 'LinkedIn'] },
      { name: 'Mariam', age: '30 à 45 ans', situation: 'jeune maman qui veut retrouver son corps', trigger: 'la fin du congé maternité', budget: '200 à 350 € le programme', platforms: ['Instagram', 'Facebook'] }
    ],
    places: ['parcs et lieux de course de votre ville', 'crèches, écoles et cabinets de kiné', 'entreprises locales pour des séances collectives'],
    objections: ['temps', 'resultat', 'prix']
  },
  'image': {
    unit: 'séance photo', gift: 'Offrez une séance photo', verb: 'garder une trace de ce moment',
    season: { hiver: 'Les fêtes, des photos de famille qu’on garde toute la vie.', printemps: 'Le printemps et sa lumière douce, parfaite pour les portraits.', ete: 'La saison des mariages et des golden hours.', automne: 'Les couleurs d’automne, la plus belle période pour un shooting.' },
    tags: { big: ['photographie', 'photographer', 'portrait', 'photooftheday'], mid: ['photographe', 'shooting', 'photographemariage', 'seancephoto', 'videaste', 'portraitphotography'], niche: ['photographefamille', 'shootingcouple', 'photographeentreprise', 'photocorporate', 'lumierenaturelle'] },
    personas: [
      { name: 'Julie', age: '27 à 35 ans', situation: 'en couple, prépare un mariage ou une naissance', trigger: 'une date importante fixée', budget: '300 à 1 500 €', platforms: ['Instagram', 'Pinterest'] },
      { name: 'Karim', age: '30 à 50 ans', situation: 'dirigeant ou indépendant qui veut des photos pro', trigger: 'un site, un LinkedIn ou un lancement à préparer', budget: '200 à 600 €', platforms: ['LinkedIn', 'Instagram'] }
    ],
    places: ['salons du mariage et wedding planners', 'espaces de coworking', 'maternités et boutiques bébé'],
    objections: ['prix', 'comparer', 'confiance']
  },
  'food': {
    unit: 'commande', gift: 'Offrez un plateau ou un gâteau', verb: 'régaler vos invités',
    season: { hiver: 'Les repas de fêtes se réservent maintenant.', printemps: 'Le printemps, saison des communions et des brunchs.', ete: 'L’été, buffets et barbecues entre amis.', automne: 'L’automne, on retrouve les saveurs réconfortantes.' },
    tags: { big: ['food', 'foodlover', 'faitmaison', 'gastronomie'], mid: ['traiteur', 'patisserie', 'cuisinemaison', 'brunch', 'gateaupersonnalise', 'cuisineafricaine'], niche: ['traiteurevenementiel', 'cakedesign', 'buffetfroid', 'plateauxrepas', 'patisseriemaison'] },
    personas: [
      { name: 'Nadia', age: '30 à 45 ans', situation: 'organise une fête de famille ou un anniversaire', trigger: 'une date fixée et peu de temps pour cuisiner', budget: '80 à 400 € la commande', platforms: ['Instagram', 'Facebook', 'WhatsApp'] },
      { name: 'Thomas', age: '30 à 55 ans', situation: 'responsable d’équipe qui commande pour son entreprise', trigger: 'un séminaire, un pot de départ, une réunion', budget: '15 à 30 € par personne', platforms: ['LinkedIn', 'Google'] }
    ],
    places: ['entreprises et coworkings de votre ville', 'salles des fêtes et lieux de réception', 'groupes Facebook de quartier'],
    objections: ['prix', 'confiance', 'plustard']
  },
  'mode': {
    unit: 'commande', gift: 'Offrez une pièce unique', verb: 'porter une pièce qui vous ressemble',
    season: { hiver: 'Les fêtes, le moment de briller.', printemps: 'Nouvelle saison, nouvelles pièces.', ete: 'Mariages et cérémonies : la tenue qu’on remarque.', automne: 'Nouvelle saison, une garde robe qui vous ressemble.' },
    tags: { big: ['mode', 'fashion', 'style', 'ootd'], mid: ['createurfrancais', 'madeinfrance', 'pieceunique', 'styliste', 'couture', 'modeafricaine'], niche: ['faitmain', 'surmesure', 'wax', 'bijouxfaitmain', 'modeethique'] },
    personas: [
      { name: 'Awa', age: '25 à 40 ans', situation: 'aime se démarquer, achète des pièces uniques', trigger: 'un mariage, un baptême, un événement', budget: '60 à 300 € la pièce', platforms: ['Instagram', 'TikTok'] },
      { name: 'Léa', age: '20 à 30 ans', situation: 'étudiante ou jeune active, attentive à l’éthique', trigger: 'un coup de cœur vu en story', budget: '30 à 120 €', platforms: ['TikTok', 'Instagram'] }
    ],
    places: ['marchés de créateurs et pop up stores', 'comptes de mariage et cérémonies', 'influenceuses mode de votre ville'],
    objections: ['prix', 'confiance', 'comparer']
  },
  'conseil': {
    unit: 'mission', gift: 'Offrez vous un audit', verb: 'gagner du temps et des clients',
    season: { hiver: 'La fin d’année, le bon moment pour préparer la suivante.', printemps: 'Le printemps, on accélère avant l’été.', ete: 'L’été, on prépare une rentrée sereine.', automne: 'Les budgets de l’année prochaine se décident maintenant.' },
    tags: { big: ['entrepreneur', 'business', 'marketing', 'freelance'], mid: ['entrepreneuriat', 'independant', 'consultant', 'communitymanager', 'strategiedigitale', 'tpe'], niche: ['accompagnemententrepreneur', 'freelancefrance', 'creationdentreprise', 'productivite', 'prospection'] },
    personas: [
      { name: 'Marc', age: '35 à 55 ans', situation: 'dirigeant de TPE débordé, fait tout lui même', trigger: 'une baisse de clients ou un projet qui stagne', budget: '500 à 3 000 € la mission', platforms: ['LinkedIn', 'Google'] },
      { name: 'Fatou', age: '28 à 40 ans', situation: 'indépendante qui se lance, veut être bien accompagnée', trigger: 'la création de son activité', budget: '150 à 800 €', platforms: ['Instagram', 'LinkedIn'] }
    ],
    places: ['clubs d’entrepreneurs et réseaux locaux', 'chambres de commerce et pépinières', 'groupes LinkedIn de votre secteur'],
    objections: ['prix', 'seul', 'resultat']
  },
  'bien-être': {
    unit: 'séance', gift: 'Offrez un moment de détente', verb: 'retrouver de l’énergie',
    season: { hiver: 'L’hiver, on prend le temps de se poser.', printemps: 'Le printemps, on se libère des tensions de l’hiver.', ete: 'L’été, on garde la sérénité des vacances.', automne: 'L’automne, on prend soin de soi avant l’hiver.' },
    tags: { big: ['bienetre', 'selfcare', 'relaxation', 'meditation'], mid: ['massage', 'sophrologie', 'naturopathie', 'gestiondustress', 'massagebienetre', 'reflexologie'], niche: ['tempspoursoi', 'detenteabsolue', 'equilibreinterieur', 'soinholistique'] },
    personas: [
      { name: 'Sophie', age: '35 à 55 ans', situation: 'stressée, dort mal, cherche une solution douce', trigger: 'un coup de fatigue ou une période difficile', budget: '50 à 90 € la séance', platforms: ['Facebook', 'Instagram'] },
      { name: 'Yasmine', age: '25 à 35 ans', situation: 'jeune active qui veut prendre soin d’elle', trigger: 'un besoin de faire une pause', budget: '40 à 70 € la séance', platforms: ['Instagram', 'TikTok'] }
    ],
    places: ['salles de yoga et de pilates', 'pharmacies et magasins bio', 'comités d’entreprise'],
    objections: ['confiance', 'resultat', 'prix']
  },
  'artisan': {
    unit: 'chantier', gift: 'Offrez vous un intérieur rénové', verb: 'rendre votre maison plus belle',
    season: { hiver: 'L’hiver, on prépare les travaux du printemps.', printemps: 'Le printemps, la saison des chantiers.', ete: 'L’été, on profite des vacances pour rénover.', automne: 'L’automne, on isole et on prépare l’hiver.' },
    tags: { big: ['renovation', 'travaux', 'artisan', 'decoration'], mid: ['savoirfaire', 'avantapres', 'menuiserie', 'peinture', 'renovationmaison', 'artisanfrancais'], niche: ['artisanlocal', 'chantierencours', 'travauxmaison', 'renovationinterieure'] },
    personas: [
      { name: 'Philippe', age: '40 à 65 ans', situation: 'propriétaire, veut un travail propre et dans les délais', trigger: 'un achat immobilier ou une dégradation', budget: '1 000 à 15 000 €', platforms: ['Google', 'Facebook'] },
      { name: 'Émilie', age: '30 à 40 ans', situation: 'jeune propriétaire qui rénove son premier logement', trigger: 'l’emménagement', budget: '500 à 5 000 €', platforms: ['Instagram', 'Pinterest'] }
    ],
    places: ['agences immobilières et notaires', 'magasins de bricolage', 'groupes Facebook de votre commune'],
    objections: ['prix', 'confiance', 'comparer']
  },
  'formation': {
    unit: 'cours', gift: 'Offrez un cours', verb: 'progresser vite',
    season: { hiver: 'Le deuxième trimestre, celui où tout se joue.', printemps: 'Les examens approchent : on révise maintenant.', ete: 'L’été, on rattrape et on prend de l’avance.', automne: 'Le premier trimestre, celui où tout se met en place.' },
    tags: { big: ['education', 'apprendre', 'formation', 'etudiant'], mid: ['coursparticuliers', 'soutienscolaire', 'professeur', 'coursenligne', 'developpementpersonnel'], niche: ['methodedetravail', 'revisions', 'bac', 'apprendrelanglais'] },
    personas: [
      { name: 'Nathalie', age: '38 à 50 ans', situation: 'parent inquiet des notes de son enfant', trigger: 'un bulletin ou un examen qui approche', budget: '20 à 40 € de l’heure', platforms: ['Facebook', 'WhatsApp'] },
      { name: 'Hugo', age: '18 à 30 ans', situation: 'étudiant ou adulte en reconversion', trigger: 'un objectif précis : examen, entretien, voyage', budget: '20 à 50 € de l’heure', platforms: ['TikTok', 'Instagram'] }
    ],
    places: ['écoles, collèges et associations de parents', 'bibliothèques et médiathèques', 'groupes WhatsApp de parents d’élèves'],
    objections: ['prix', 'resultat', 'temps']
  },
  'événementiel': {
    unit: 'événement', gift: 'Offrez un moment inoubliable', verb: 'vivre un événement réussi',
    season: { hiver: 'Les fêtes de fin d’année se préparent maintenant.', printemps: 'La saison des mariages commence : les dates partent.', ete: 'Mariages, anniversaires : la haute saison.', automne: 'On réserve déjà pour l’année prochaine.' },
    tags: { big: ['mariage', 'evenement', 'decoration', 'wedding'], mid: ['weddingplanner', 'evenementiel', 'decorationmariage', 'anniversaire', 'dj', 'organisationmariage'], niche: ['mariage2027', 'futuremariee', 'decorationevenement', 'babyshower'] },
    personas: [
      { name: 'Aïcha', age: '26 à 35 ans', situation: 'future mariée, veut un jour parfait sans stress', trigger: 'la date du mariage fixée', budget: '800 à 5 000 €', platforms: ['Instagram', 'Pinterest', 'TikTok'] },
      { name: 'Christelle', age: '30 à 50 ans', situation: 'organise un anniversaire ou une fête de famille', trigger: 'un anniversaire important', budget: '300 à 1 500 €', platforms: ['Facebook', 'Instagram'] }
    ],
    places: ['salons du mariage', 'salles de réception et traiteurs', 'boutiques de robes de mariée'],
    objections: ['prix', 'confiance', 'plustard']
  },
  'autre': {
    unit: 'prestation', gift: 'Offrez une prestation', verb: 'obtenir ce que vous cherchez',
    season: { hiver: 'Fin d’année : on prépare la suite ensemble.', printemps: 'Le printemps, le bon moment pour se lancer.', ete: 'L’été, on profite du rythme plus calme.', automne: 'L’automne, on avance sur ses projets avant la fin d’année.' },
    tags: { big: ['entrepreneur', 'petiteentreprise', 'local'], mid: ['independant', 'artisanat', 'commercelocal', 'savoirfaire', 'faitmain'], niche: ['soutenezlocal', 'entreprendreenfrance', 'consommerlocal'] },
    personas: [
      { name: 'Claire', age: '30 à 45 ans', situation: 'cherche un pro de confiance près de chez elle', trigger: 'un besoin qui devient urgent', budget: 'selon vos tarifs', platforms: ['Instagram', 'Facebook', 'Google'] },
      { name: 'David', age: '35 à 55 ans', situation: 'a déjà été déçu par un prestataire', trigger: 'une mauvaise expérience à réparer', budget: 'selon vos tarifs', platforms: ['Google', 'Facebook'] }
    ],
    places: ['commerces voisins pour des partenariats', 'groupes Facebook de votre ville', 'associations locales'],
    objections: ['prix', 'confiance', 'plustard']
  }
};

function sectorKey() {
  const p = st.profile, raw = String(p.sector || '').toLowerCase();
  const k = Object.keys(SECTOR).find(x => raw && (raw === x || raw.includes(x.replace('é', 'e')) || raw.includes(x)));
  if (k) return k;
  const f = typeof sectorOf === 'function' ? sectorOf(`${p.activity} ${p.business}`) : null;
  return f && SECTOR[f[0]] ? f[0] : 'autre';
}
function sec() { return SECTOR[sectorKey()]; }
function slug(s) { return String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ''); }

function easter(y) { const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451), mo = Math.floor((h + l - 7 * m + 114) / 31), da = ((h + l - 7 * m + 114) % 31) + 1; return new Date(y, mo - 1, da); }
function nthDay(y, m, wd, n) { if (n > 0) { const d = new Date(y, m, 1); const add = (wd - d.getDay() + 7) % 7 + (n - 1) * 7; return new Date(y, m, 1 + add); } const d = new Date(y, m + 1, 0); return new Date(y, m, d.getDate() - ((d.getDay() - wd + 7) % 7)); }
function mothersDay(y) { const last = nthDay(y, 4, 0, -1), pent = new Date(easter(y).getTime() + 49 * DAY); return iso(last) === iso(pent) ? nthDay(y, 5, 0, 1) : last; }
const OCC_ALL = 'all';
function occasionsFor(y) {
  const D = (m, d) => new Date(y, m, d);
  return [
    { key: 'nouvelan', name: 'La nouvelle année', date: D(0, 1), lead: 10, tag: 'bonneannee', s: OCC_ALL },
    { key: 'soldeshiver', name: 'Les soldes d’hiver', date: nthDay(y, 0, 3, 2), lead: 7, tag: 'soldes', s: ['mode', 'beauté'] },
    { key: 'valentin', name: 'La Saint Valentin', date: D(1, 14), lead: 16, tag: 'saintvalentin', s: ['beauté', 'food', 'mode', 'image', 'bien-être', 'événementiel', 'autre'] },
    { key: 'femmes', name: 'La journée des droits des femmes', date: D(2, 8), lead: 7, tag: '8mars', s: ['beauté', 'sport', 'bien-être', 'conseil', 'mode'] },
    { key: 'printemps', name: 'Le printemps', date: D(2, 20), lead: 8, tag: 'printemps', s: OCC_ALL },
    { key: 'paques', name: 'Pâques', date: easter(y), lead: 12, tag: 'paques', s: ['food', 'événementiel', 'image'] },
    { key: 'meres', name: 'La fête des mères', date: mothersDay(y), lead: 21, tag: 'fetedesmeres', s: ['beauté', 'food', 'mode', 'image', 'bien-être', 'événementiel', 'autre'] },
    { key: 'peres', name: 'La fête des pères', date: nthDay(y, 5, 0, 3), lead: 14, tag: 'fetedesperes', s: ['food', 'mode', 'image', 'sport', 'bien-être', 'autre'] },
    { key: 'musique', name: 'La fête de la musique', date: D(5, 21), lead: 6, tag: 'fetedelamusique', s: ['événementiel', 'food'] },
    { key: 'ete', name: 'Les vacances d’été', date: D(6, 4), lead: 18, tag: 'ete', s: OCC_ALL },
    { key: 'rentree', name: 'La rentrée', date: D(8, 1), lead: 21, tag: 'rentree', s: OCC_ALL },
    { key: 'halloween', name: 'Halloween', date: D(9, 31), lead: 10, tag: 'halloween', s: ['food', 'événementiel', 'beauté'] },
    { key: 'blackfriday', name: 'Le Black Friday', date: new Date(nthDay(y, 10, 4, 4).getTime() + DAY), lead: 14, tag: 'blackfriday', s: OCC_ALL },
    { key: 'noel', name: 'Noël', date: D(11, 25), lead: 35, tag: 'noel', s: OCC_ALL },
    { key: 'fin', name: 'La fin d’année', date: D(11, 31), lead: 5, tag: 'bilan', s: ['conseil', 'formation', 'sport'] }
  ];
}
function upcomingOccasions(limit) {
  const now = toDate(iso(Date.now())), y = now.getFullYear(), k = sectorKey();
  return [...occasionsFor(y), ...occasionsFor(y + 1)].map(o => Object.assign(o, { days: Math.round((o.date - now) / DAY) }))
    .filter(o => o.days >= 0 && o.days <= Math.max(o.lead, limit || 0) && (o.s === OCC_ALL || o.s.includes(k))).sort((a, b) => a.days - b.days);
}
function currentOccasion() { return upcomingOccasions(0)[0] || null; }
function season(d) { const m = toDate(d || iso(Date.now())).getMonth(); return m === 11 || m < 2 ? 'hiver' : m < 5 ? 'printemps' : m < 8 ? 'ete' : 'automne'; }
function inDays(n) { return n === 0 ? 'aujourd’hui' : n === 1 ? 'demain' : `dans ${n} jours`; }

function occasionLine(o) {
  const s = sec(), off = P().offer;
  const map = {
    valentin: V(`${s.gift.replace('Offrez', 'Offrez à votre moitié')}.`, `${s.gift.replace('Offrez', 'Offre à ta moitié')}.`),
    meres: V(`${s.gift} à votre maman.`, `${s.gift.replace('Offrez', 'Offre')} à ta maman.`),
    peres: V(`${s.gift} à votre papa.`, `${s.gift.replace('Offrez', 'Offre')} à ton papa.`),
    noel: V(`Le cadeau qui fait plaisir : ${lc(off)}.`, `Le cadeau qui fait plaisir : ${lc(off)}.`),
    blackfriday: V('Une offre courte, pour celles et ceux qui attendaient le bon moment.', 'Une offre courte, pour celles et ceux qui attendaient le bon moment.'),
    rentree: `La rentrée, le bon moment pour ${s.verb}.`, ete: s.season.ete, printemps: s.season.printemps, nouvelan: V('Une nouvelle année, de nouvelles envies : on commence ensemble ?', 'Une nouvelle année, de nouvelles envies : on commence ensemble ?')
  };
  return map[o.key] || s.season[season(o.date)];
}

const OBJ = {
  prix: () => ({ q: 'C’est trop cher.', e: V('Le prix compte, c’est normal de vous poser la question.', 'Le prix compte, c’est normal de te poser la question.'), a: `${uc(P().offer)}${st.services[0] ? ' à ' + st.services[0].price + ' €' : ''} : ${lc(dot(P().value))} Ce qui coûte cher, c’est de devoir tout refaire ailleurs.` }),
  temps: () => ({ q: 'Je n’ai pas le temps.', e: V('Justement, c’est pour ça que je m’occupe de tout.', 'Justement, c’est pour ça que je m’occupe de tout.'), a: V(`Un premier ${sec().unit} suffit pour démarrer. Je m’adapte à vos horaires.`, `Un premier ${sec().unit} suffit pour démarrer. Je m’adapte à tes horaires.`) }),
  seul: () => ({ q: 'Je peux le faire moi même.', e: V('Bien sûr, et vous avez sûrement déjà essayé.', 'Bien sûr, et tu as sûrement déjà essayé.'), a: V(`Ce que j’apporte : ${lc(dot(P().value))} Vous gagnez du temps et vous évitez les erreurs.`, `Ce que j’apporte : ${lc(dot(P().value))} Tu gagnes du temps et tu évites les erreurs.`) }),
  confiance: () => ({ q: 'Je ne vous connais pas encore.', e: 'C’est normal de vouloir être rassuré avant de se lancer.', a: `${dot(P().proof)} ${V('Écrivez moi, je réponds à toutes vos questions avant de réserver.', 'Écris moi, je réponds à toutes tes questions avant de réserver.')}` }),
  plustard: () => ({ q: 'Je verrai plus tard.', e: V('Je comprends, rien ne presse vraiment.', 'Je comprends, rien ne presse vraiment.'), a: V('Sauf que les meilleurs créneaux partent en premier. Je peux vous en garder un, sans engagement.', 'Sauf que les meilleurs créneaux partent en premier. Je peux t’en garder un, sans engagement.') }),
  comparer: () => ({ q: 'Je compare avec d’autres.', e: V('Vous avez raison, c’est la bonne démarche.', 'Tu as raison, c’est la bonne démarche.'), a: V(`Regardez ce qui est inclus, pas seulement le prix. Chez moi : ${lc(dot(P().value))}`, `Regarde ce qui est inclus, pas seulement le prix. Chez moi : ${lc(dot(P().value))}`) }),
  resultat: () => ({ q: 'Est ce que ça va vraiment marcher pour moi ?', e: 'C’est la vraie question, et elle est légitime.', a: `${dot(P().proof)} ${V('On part de votre situation, pas d’une méthode toute faite.', 'On part de ta situation, pas d’une méthode toute faite.')}` })
};
const OBJ_KEYS = Object.keys(OBJ);
const OBJ_LABEL = { prix: 'C’est trop cher', temps: 'Pas le temps', seul: 'Je peux le faire seul', confiance: 'Je ne vous connais pas', plustard: 'Plus tard', comparer: 'Je compare', resultat: 'Ça va marcher pour moi ?' };

const ICP_Q = [
  { k: 'best', q: 'Pensez à votre meilleur client. Qui est il ? Âge, situation, métier.', ph: 'Par exemple : une maman de 35 ans, infirmière, qui manque de temps pour elle', from: () => st.profile.target },
  { k: 'trigger', q: 'Qu’est ce qui l’a décidé à vous contacter, à ce moment là ?', ph: 'Par exemple : un mariage dans un mois' },
  { k: 'pains', q: 'Qu’est ce qui le frustrait avant de vous trouver ?', ph: 'Une idée par ligne', from: () => st.profile.problem, multi: true },
  { k: 'desires', q: 'Qu’est ce qu’il voulait vraiment obtenir ?', ph: 'Une idée par ligne', multi: true },
  { k: 'words', q: 'Quels mots vos clients utilisent pour décrire leur besoin ?', ph: 'Par exemple : « je veux quelque chose de naturel », « je n’ai jamais le temps »', multi: true },
  { k: 'objections', q: 'Quelles hésitations entendez vous avant un achat ?', chips: OBJ_KEYS },
  { k: 'where', q: 'Où passent ils du temps ?', chips: ['Instagram', 'TikTok', 'Facebook', 'LinkedIn', 'WhatsApp', 'Google', 'Pinterest', 'Bouche à oreille'] },
  { k: 'budget', q: 'Quel budget sont ils prêts à mettre ?', ph: 'Par exemple : 50 à 80 € par rendez vous' },
  { k: 'anti', q: 'Le client que vous ne voulez plus : comment le reconnaître ?', ph: 'Par exemple : négocie tout, annule au dernier moment' },
  { k: 'second', q: 'Avez vous un deuxième type de client, différent du premier ?', ph: 'Facultatif. Par exemple : des entreprises qui commandent pour leurs équipes' }
];
function lines(s) { return String(s || '').split(/\n|;|•/).map(x => x.replace(/^[\s,.]+|[\s,.]+$/g, '').trim()).filter(Boolean); }
function icpDefaults() {
  const a = st.icp.answers, out = {};
  ICP_Q.forEach(q => { if (q.from && !a[q.k]) out[q.k] = q.from() || ''; });
  if (!a.budget && st.services.length) { const ps = st.services.map(s => +s.price || 0).filter(Boolean).sort((x, y) => x - y); if (ps.length) out.budget = ps[0] === ps[ps.length - 1] ? `environ ${ps[0]} €` : `${ps[0]} à ${ps[ps.length - 1]} €`; }
  if (!a.where) { const src = {}; st.clients.forEach(c => { src[c.source] = (src[c.source] || 0) + 1; }); const top = Object.entries(src).sort((x, y) => y[1] - x[1]).map(([k]) => k).filter(k => ['Instagram', 'WhatsApp', 'LinkedIn', 'Bouche à oreille'].includes(k)); if (top.length) out.where = top.slice(0, 3); }
  if (!a.objections) out.objections = sec().objections.slice();
  return out;
}
function icpAnswer(k) { const a = st.icp.answers; return a[k] != null && a[k] !== '' ? a[k] : icpDefaults()[k]; }
function buildPersonas() {
  const s = sec(), t = s.personas, A = k => icpAnswer(k);
  const objs = (Array.isArray(A('objections')) ? A('objections') : s.objections).filter(k => OBJ[k]).slice(0, 4).map(k => Object.assign({ key: k }, OBJ[k]()));
  const where = Array.isArray(A('where')) && A('where').length ? A('where') : t[0].platforms;
  const tags = hashtagPool().slice(0, 8);
  const city = st.profile.city && !/en ligne/i.test(st.profile.city) ? st.profile.city : '';
  const p1 = {
    id: 'p1', primary: true, name: t[0].name, age: t[0].age,
    situation: A('best') || t[0].situation, trigger: A('trigger') || t[0].trigger, budget: A('budget') || t[0].budget,
    pains: lines(A('pains')).length ? lines(A('pains')) : [uc(P().problem)],
    desires: lines(A('desires')).length ? lines(A('desires')) : [uc(P().value)],
    words: lines(A('words')),
    objections: objs,
    where: { platforms: where, hashtags: tags, places: s.places.map(x => city ? x.replace('votre ville', city).replace('votre commune', city) : x), accounts: [`comptes locaux et médias de ${city || 'votre ville'}`, `créateurs de contenu qui parlent de ${lc(P().activity)}`] },
    hooks: []
  };
  const second = String(A('second') || '').trim();
  const p2 = {
    id: 'p2', primary: false, name: t[1].name, age: t[1].age, situation: second || t[1].situation, trigger: t[1].trigger, budget: t[1].budget,
    pains: [V(`Ne pas savoir à qui faire confiance pour ${s.verb}.`, `Ne pas savoir à qui faire confiance pour ${s.verb}.`)], desires: [V('Un pro qui comprend vite et qui tient ses promesses.', 'Un pro qui comprend vite et qui tient ses promesses.')], words: [],
    objections: objs.slice(0, 2), where: { platforms: t[1].platforms, hashtags: tags.slice(2, 7), places: p1.where.places.slice(1), accounts: p1.where.accounts }, hooks: []
  };
  [p1, p2].forEach(p => { p.hooks = personaHooks(p); });
  const antiTxt = String(A('anti') || '').trim();
  const anti = { portrait: antiTxt || 'Le client qui cherche uniquement le prix le plus bas et ne respecte pas votre temps.', signals: antiTxt ? lines(antiTxt).slice(0, 4) : ['Négocie avant même de savoir ce qui est inclus', 'Ne répond pas, puis veut tout pour demain', 'Annule au dernier moment'], reply: V('Restez poli et ferme : rappelez vos conditions, proposez un acompte, et laissez partir ceux qui ne les acceptent pas.', 'Reste poli et ferme : rappelle tes conditions, propose un acompte, et laisse partir ceux qui ne les acceptent pas.') };
  return { personas: [p1, p2], anti };
}
function personaHooks(p) {
  const pain = lc(p.pains[0] || P().problem).replace(/\.$/, ''), des = lc(p.desires[0] || P().value).replace(/\.$/, '');
  return [
    `Story : « ${uc(pain)} ? Voici ce que je fais pour ça. »`,
    `Carrousel : « 3 erreurs quand on veut ${des} »`,
    `Post : l’histoire d’un client comme ${p.name}, avant et après.`
  ];
}
function personaShort(p) { p = p || primaryPersona(); return p ? `${p.situation}`.replace(/\.$/, '') : P().target; }
function primaryPersona() { const l = st.icp.personas || []; return l.find(p => p.primary) || l[0] || null; }
function icpReady() { return (st.icp.personas || []).length > 0; }

const TAG_LIMIT = { Instagram: 5, LinkedIn: 3, Facebook: 3, TikTok: 5 };
function hashtagPool() {
  const s = sec(), city = slug(st.profile.city), core = slug(String(st.profile.activity || '').split(/[\s,]+/).find(w => w.length > 3) || '');
  const out = [];
  if (core && city && !/enligne/.test(city)) out.push(core + city);
  out.push(...s.tags.mid, ...s.tags.niche, ...s.tags.big);
  if (city && !/enligne/.test(city) && city.length < 20) out.push(city);
  const b = slug(st.profile.business); if (b && b.length <= 24) out.push(b);
  return [...new Set(out)].filter(t => t.length > 2 && t.length < 30);
}
function seeded(n) { let x = n >>> 0 || 1; return () => { x ^= x << 13; x >>>= 0; x ^= x >> 17; x ^= x << 5; x >>>= 0; return x / 4294967296; }; }
function hashtags(net, extra, shuffle) {
  const lim = TAG_LIMIT[net] || 5, s = sec(), city = slug(st.profile.city), core = slug(String(st.profile.activity || '').split(/[\s,]+/).find(w => w.length > 3) || '');
  const seedBase = [...(ONLINE && user ? user.id : st.localId || 'x')].reduce((a, c) => a + c.charCodeAt(0), 0) + Math.floor(Date.now() / (7 * DAY)) * 31 + (shuffle || 0) * 977;
  const occ = currentOccasion(), b = slug(st.profile.business);
  for (let attempt = 0; attempt < 6; attempt++) {
    const r = seeded(seedBase + attempt * 7919), pick = a => a.length ? a[Math.floor(r() * a.length)] : '';
    const set = [];
    const add = t => { t = slug(t); if (t && t.length > 2 && t.length < 30 && !set.includes(t)) set.push(t); };
    (extra || []).forEach(add);
    if (core && city && !/enligne/.test(city)) add(core + city);
    if (occ && occ.days <= occ.lead) add(occ.tag);
    add(pick(s.tags.mid)); add(pick(s.tags.niche)); add(pick(s.tags.mid)); add(pick(s.tags.big));
    if (b && b.length <= 24) add(b);
    if (net === 'LinkedIn') { add('entrepreneuriat'); }
    const fin = set.slice(0, lim);
    const key = fin.slice().sort().join(' ');
    if (!st.tagHist.includes(key) || attempt === 5) return fin.map(t => '#' + t);
  }
  return [];
}
function rememberTags(tags) { const k = tags.map(t => t.replace('#', '')).sort().join(' '); if (!k) return; st.tagHist = st.tagHist.filter(x => x !== k).concat(k).slice(-12); }

const BIO_PLAT = {
  instagram: { label: 'Instagram', max: 150 },
  tiktok: { label: 'TikTok', max: 80 },
  facebook: { label: 'Facebook', max: 101 },
  whatsapp: { label: 'WhatsApp Business', max: 139 },
  linkedin: { label: 'Titre LinkedIn', max: 220 },
  about: { label: 'À propos LinkedIn', max: 2600 },
  google: { label: 'Fiche Google', max: 750 }
};
function bioVariants(plat) {
  const p = P(), pr = st.profile, per = primaryPersona(), who = per ? lc(personaShort(per)) : lc(p.target), emo = st.brand.emoji;
  const cta = uc(pr.cta || V('Réservez votre place', 'Réserve ta place')), arrow = emo ? '👇 ' : '', pin = emo ? '📍 ' : '', star = emo ? '✨ ' : '';
  const city = pr.city || '', act = uc(p.activity), val = dot(p.value).replace(/\.$/, '');
  const short = s => s.replace(/\.$/, '');
  if (plat === 'instagram') return [
    `${act}${city ? ', ' + city : ''}\n${star}${val}\n${short(dot(p.proof))}\n${arrow}${cta}`,
    `${act} pour ${who}\n${val}\n${pin}${city || 'Sur rendez vous'}\n${arrow}${cta}`,
    `${p.business}\n${uc(lc(val))}, pour ${who}\n${arrow}${cta}`
  ].map(b => fitBio(b, 150));
  if (plat === 'tiktok') return [`${act}${city ? ' à ' + city : ''}. ${cta} ${emo ? '👇' : ''}`, `${val}. ${cta}`, `${act} pour ${who}`].map(b => fitBio(b, 80));
  if (plat === 'facebook') return [`${act}${city ? ' à ' + city : ''}. ${val}.`, `${val}. ${cta} en message.`, `${p.business}, ${lc(act)} pour ${who}.`].map(b => fitBio(b, 101));
  if (plat === 'whatsapp') return [`${act}${city ? ', ' + city : ''}. ${val}. ${cta} ici.`, `${p.business} : ${lc(val)}. Réponse rapide.`, `${act} pour ${who}. Écrivez moi.`].map(b => fitBio(b, 139));
  if (plat === 'linkedin') return [`${act}${city ? ' à ' + city : ''} | ${val} | Fondateur de ${p.business}`, `J’aide ${who} à ${lc(per && per.desires[0] ? per.desires[0] : p.value).replace(/\.$/, '')} | ${act}`, `${act} | ${short(dot(p.proof))} | ${p.business}`].map(b => fitBio(b, 220));
  if (plat === 'about') return [
    `${dot(p.story)}\n\nAujourd’hui, j’accompagne ${who}. ${uc(lc(dot(p.problem)))}\n\nMa façon de travailler : ${lc(dot(p.value))}\n\n${dot(p.proof)}\n\nPour échanger : ${pr.email || 'message privé'}${pr.phone ? ', ' + pr.phone : ''}.`,
    `${act}${city ? ' à ' + city : ''}.\n\nPour qui : ${who}.\nCe que je règle : ${lc(dot(p.problem))}\nCe qui me distingue : ${lc(dot(p.value))}\nCe que disent mes clients : ${lc(dot(p.proof))}\n\n${cta} : ${pr.email || 'message privé'}.`
  ].map(b => tidy(b).slice(0, 2600));
  if (plat === 'google') return [`${p.business}, ${lc(act)}${city ? ' à ' + city : ''}. ${dot(p.value)} ${uc(lc(dot(p.problem)))} ${dot(p.proof)} ${st.services.length ? 'Prestations : ' + priceLine() + '.' : ''} ${cta} par téléphone ou en ligne.`].map(b => tidy(b).slice(0, 750));
  return [];
}
function bioScore(text, plat) {
  const t = String(text || '').toLowerCase(), pr = st.profile;
  const words = s => slug(s).length > 3 ? String(s).toLowerCase().split(/[^a-zà-ÿ0-9]+/).filter(w => w.length > 3) : [];
  const has = list => list.some(w => t.includes(w));
  const checks = [
    { ok: has(words(pr.activity).concat(words(pr.business))), l: 'Dit ce que vous faites' },
    { ok: /pour |j’aide|j'aide|accompagne/.test(t) || has(words(personaShort())), l: 'Dit pour qui' },
    { ok: /\d|avis|clients?|résultat|★|recommand/.test(t) || has(words(pr.proof).slice(0, 4)), l: 'Montre une preuve' },
    { ok: has(words(pr.cta || 'réserver')) || /réserv|écri|message|lien|contact|dm|appel|commande/.test(t), l: 'Invite à agir' },
    { ok: !pr.city || /en ligne/i.test(pr.city) || t.includes(String(pr.city).toLowerCase()), l: 'Indique où' },
    { ok: [...String(text || '')].length <= (BIO_PLAT[plat] || {}).max, l: 'Respecte la longueur' }
  ];
  if (plat === 'linkedin' || plat === 'tiktok' || plat === 'facebook') checks.splice(4, 1);
  return { score: Math.round(checks.filter(c => c.ok).length / checks.length * 100), checks };
}

const STOP = new Set('les des une un le la de du et en est pour pas que qui dans sur avec mais plus vous nous tu te ton ta tes votre vos mon ma mes ce cet cette ces au aux par il elle on ils elles se sa son ses ne y a à ou où je j me m c ça cela être avoir fait faire tout tous toute toutes très bien aussi comme si leur leurs été suis es sont avez avons ai as'.split(' '));
function analyzeVoice(samples) {
  const txt = samples.join('\n').trim(); if (!txt) return null;
  const low = txt.toLowerCase();
  const tu = (low.match(/\b(tu|toi|ton|ta|tes|t[’'])\b/g) || []).length, vous = (low.match(/\b(vous|votre|vos)\b/g) || []).length;
  const emojis = (txt.match(EMOJI_RX) || []).length, sentences = txt.split(/[.!?…]+\s|\n+/).map(s => s.trim()).filter(s => s.length > 2);
  const wordsAll = low.split(/[^a-zà-ÿ0-9’']+/).filter(Boolean), avg = sentences.length ? Math.round(wordsAll.length / sentences.length) : 0;
  const excl = (txt.match(/!/g) || []).length, ques = (txt.match(/\?/g) || []).length;
  const freq = {}; wordsAll.filter(w => w.length > 3 && !STOP.has(w)).forEach(w => { freq[w] = (freq[w] || 0) + 1; });
  const top = Object.entries(freq).filter(([, n]) => n > 1).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([w]) => w);
  const openers = samples.map(s => s.trim().split(/[\s,!.]+/).slice(0, 2).join(' ')).filter(Boolean);
  const address = tu > vous * 1.5 ? 'tu' : vous > tu * 1.5 ? 'vous' : (tu || vous ? 'mixte' : 'neutre');
  const perText = samples.length ? emojis / samples.length : 0;
  const energy = excl / Math.max(1, sentences.length) > .25 ? 'dynamique' : 'posé';
  const length = avg <= 9 ? 'court' : avg <= 16 ? 'moyen' : 'long';
  const dos = [], donts = [];
  dos.push(address === 'tu' ? 'Tutoyer, comme dans vos messages' : address === 'vous' ? 'Vouvoyer, comme dans vos messages' : 'Choisir tu ou vous et s’y tenir');
  dos.push(length === 'court' ? 'Des phrases courtes et directes' : length === 'moyen' ? 'Des phrases simples, une idée par phrase' : 'Prendre le temps d’expliquer, avec des exemples');
  if (perText >= 1) dos.push('Un ou deux emojis pour donner le ton'); else donts.push('Mettre des emojis partout : ce n’est pas votre style');
  if (energy === 'dynamique') dos.push('De l’énergie et de l’enthousiasme'); else donts.push('Les points d’exclamation en série');
  if (ques > 1) dos.push('Poser des questions à votre communauté');
  if (top.length) dos.push(`Reprendre vos mots : ${top.slice(0, 4).join(', ')}`);
  donts.push('Le jargon et les formules toutes faites');
  return { address, emojiPerText: Math.round(perText * 10) / 10, avgWords: avg, energy, length, top, openers: openers.slice(0, 3), dos, donts, summary: `${address === 'tu' ? 'Tutoiement' : address === 'vous' ? 'Vouvoiement' : 'Ton neutre'}, phrases ${{ court: 'courtes', moyen: 'de longueur moyenne', long: 'longues' }[length]}, ton ${energy}${perText >= 1 ? ', emojis bienvenus' : ', peu d’emojis'}.` };
}
function applyVoice(f) {
  if (!f) return;
  if (f.address === 'tu' || f.address === 'vous') st.profile.tone = f.address;
  st.brand.emoji = f.emojiPerText >= 1;
  st.ai.length = f.length === 'court' ? 30 : f.length === 'moyen' ? 50 : 75;
  st.ai.warmth = f.energy === 'dynamique' ? Math.max(st.ai.warmth, 70) : Math.min(st.ai.warmth, 60);
  st.profile.vibe = f.summary;
}

function pitches() {
  const p = P(), pr = st.profile, per = primaryPersona(), who = per ? lc(personaShort(per)) : lc(p.target);
  const des = lc((per && per.desires[0]) || p.value).replace(/\.$/, ''), pain = lc((per && per.pains[0]) || p.problem).replace(/\.$/, '');
  const name = pr.first || pr.name || '';
  return [
    { k: 'one', label: 'Votre phrase de présentation', text: `J’aide ${who} à ${des}, grâce à ${lc(p.value).replace(/\.$/, '')}.` },
    { k: 'thirty', label: 'Le pitch de 30 secondes', text: `${name ? 'Je suis ' + name + ', ' : ''}${lc(p.activity)}${pr.city ? ' à ' + pr.city : ''}. Mes clients, ce sont ${who}. Leur problème : ${pain}. Ce que je fais pour eux : ${lc(dot(p.value))} ${dot(p.proof)} ${V('Si vous connaissez quelqu’un dans ce cas, je serais ravi d’échanger avec lui.', 'Si tu connais quelqu’un dans ce cas, je serais ravi d’échanger avec lui.')}` },
    { k: 'dm', label: 'Premier message Instagram', text: V(`Bonjour [prénom] ! J’ai vu votre [publication ou story] sur [sujet], ça m’a parlé. Je suis ${lc(p.activity)}${pr.city ? ' à ' + pr.city : ''} et j’accompagne justement ${who}. Si un jour vous avez besoin d’un coup de main, je suis là. Belle journée !`, `Coucou [prénom] ! J’ai vu ta [publication ou story] sur [sujet], ça m’a parlé. Je suis ${lc(p.activity)}${pr.city ? ' à ' + pr.city : ''} et j’accompagne justement ${who}. Si un jour tu as besoin d’un coup de main, je suis là. Belle journée !`) },
    { k: 'li', label: 'Demande de connexion LinkedIn', text: `Bonjour [prénom], je suis ${lc(p.activity)} et j’échange avec ${who}. Votre parcours m’intéresse, ravi de vous compter dans mon réseau.` },
    { k: 'wa', label: 'Présentation WhatsApp Business', text: fitBio(`${uc(p.activity)}${pr.city ? ', ' + pr.city : ''}. ${dot(p.value)} Réponse rapide, ${lc(pr.cta || 'réservation')} ici.`, 139) },
    { k: 'mail', label: 'Signature email', text: `${pr.name || name}\n${uc(p.activity)}, ${p.business}\n${pr.phone || ''}${pr.phone && pr.email ? ' · ' : ''}${pr.email || ''}${st.page.published && st.page.slug ? '\n' + pageUrl() : ''}`.replace(/\n+$/, '') }
  ].map(x => Object.assign(x, { text: tidy(x.text) }));
}

const DASH_RX = /\s[-–—]\s|[–—]/;
function fixDashes(s) { return String(s || '').replace(/\s[-–—]\s/g, ', ').replace(/[–—]/g, ', ').replace(/,\s*,/g, ',').replace(/\s{2,}/g, ' '); }
function checkContent(o) {
  const out = [], texts = (o.items || []).flatMap(f => [f.t, f.s, f.p, f.k, f.c].filter(Boolean)), cap = o.caption || '';
  const all = texts.join(' ') + ' ' + cap;
  if (DASH_RX.test(all)) out.push({ lvl: 'fix', id: 'dash', msg: 'Des tirets sont présents : ils donnent un effet « écrit par une IA ».' });
  if (!st.brand.emoji && EMOJI_RX.test(all)) out.push({ lvl: 'fix', id: 'emoji', msg: 'Votre charte dit sans emoji, mais il y en a.' });
  EMOJI_RX.lastIndex = 0;
  const low = all.toLowerCase(), tu = /\b(tu|toi|ton|ta|tes)\b/.test(low), vous = /\b(vous|votre|vos)\b/.test(low);
  if (st.profile.tone === 'tu' && vous && !tu) out.push({ lvl: 'warn', msg: 'Vous avez choisi le tutoiement, ce contenu vouvoie.' });
  if (st.profile.tone === 'vous' && tu && !vous) out.push({ lvl: 'warn', msg: 'Vous avez choisi le vouvoiement, ce contenu tutoie.' });
  if (/\[[^\]]{2,}\]/.test(all)) out.push({ lvl: 'warn', msg: 'Il reste des éléments entre crochets à compléter, par exemple [prénom du client].' });
  if (/Collez ici/.test(all)) out.push({ lvl: 'warn', msg: 'Remplacez les avis d’exemple par les vrais mots de vos clients.' });
  (o.items || []).forEach((f, i) => { if ((f.t || '').length > 90) out.push({ lvl: 'warn', msg: `Le titre de l’image ${i + 1} est long : il sera écrit petit.` }); });
  if (o.kind === 'story' && o.items && o.items.length && !o.items[o.items.length - 1].c) out.push({ lvl: 'fix', id: 'cta', msg: 'La dernière story n’a pas de bouton d’action.' });
  if (o.net === 'Instagram' && cap.length > 2200) out.push({ lvl: 'warn', msg: 'La légende dépasse 2 200 caractères, la limite d’Instagram.' });
  if (o.net === 'LinkedIn' && cap.length > 3000) out.push({ lvl: 'warn', msg: 'Le post dépasse 3 000 caractères, la limite de LinkedIn.' });
  const tags = (cap.match(/#[\wà-ÿ]+/gi) || []).length + (o.tags || []).length;
  if (tags > (TAG_LIMIT[o.net] || 30)) out.push({ lvl: 'fix', id: 'tags', msg: `${tags} hashtags : ${o.net} en accepte ${TAG_LIMIT[o.net]} au maximum.` });
  const low2 = (o.items || []).map(f => f.img && mediaMeta(f.img)).filter(m => m && Math.max(m.w, m.h) < 900);
  if (low2.length) out.push({ lvl: 'warn', msg: `${low2.length} photo${low2.length > 1 ? 's' : ''} en faible résolution : elle${low2.length > 1 ? 's' : ''} risque${low2.length > 1 ? 'nt' : ''} d’être floue${low2.length > 1 ? 's' : ''}.` });
  return out;
}

const URSSAF = {
  vente: { label: 'Vente de marchandises ou restauration', rate: 12.3, vl: 1, ceiling: 203100, tva: 85000 },
  services: { label: 'Prestations de services, artisan ou commerçant', rate: 21.2, vl: 1.7, ceiling: 83600, tva: 37500 },
  bnc: { label: 'Profession libérale non réglementée', rate: 25.6, vl: 2.2, ceiling: 83600, tva: 37500 },
  cipav: { label: 'Profession libérale réglementée (CIPAV)', rate: 23.2, vl: 2.2, ceiling: 83600, tva: 37500 }
};
function netCalc(ca) {
  const pr = st.profile, u = URSSAF[pr.urssaf] || URSSAF.services, ov = parseFloat(String(pr.rateOverride || '').replace(',', '.'));
  const rate = ov > 0 && ov < 60 ? ov : u.rate, cot = ca * rate / 100, vl = pr.vl ? ca * u.vl / 100 : 0;
  return { rate, cot, vl, net: ca - cot - vl, u };
}
function yearRevenue(y) { return st.clients.reduce((a, c) => a + c.history.filter(h => toDate(h.date).getFullYear() === y).reduce((x, h) => x + (+h.amount || 0), 0), 0); }

function cgvText(o) {
  const pr = st.profile, p = P();
  const dep = o.deposit ? `Un acompte de ${o.deposit} % du montant total est demandé à la réservation. ${o.depositRefund === 'oui' ? 'Il est remboursé en cas d’annulation dans les délais prévus ci dessous.' : 'Il reste acquis en cas d’annulation tardive ou d’absence.'}` : 'Aucun acompte n’est demandé à la réservation.';
  return tidy(`CONDITIONS GÉNÉRALES DE VENTE
${p.business}${pr.siret ? ', SIRET ' + pr.siret : ''}${pr.address ? ', ' + pr.address : ''}
Version du ${fdate(iso(Date.now()))} ${new Date().getFullYear()}

1. Objet
Les présentes conditions s’appliquent à toutes les prestations proposées par ${p.business} (${lc(p.activity)}) à ses clients particuliers et professionnels.

2. Prestations et prix
Les prestations et leurs prix sont indiqués sur devis ou sur la grille tarifaire en vigueur au jour de la réservation. ${pr.vatNote ? 'TVA non applicable, article 293 B du CGI.' : 'Les prix sont indiqués toutes taxes comprises.'}

3. Réservation
La réservation est confirmée par l’acceptation du devis ou par la confirmation écrite du rendez vous (message, email). ${dep}

4. Paiement
Le solde est réglé ${o.when || 'le jour de la prestation'}. Moyens de paiement acceptés : ${o.means || 'espèces, carte bancaire, virement'}.${pr.payLink ? ' Un lien de paiement sécurisé peut être transmis.' : ''}

5. Annulation et report
Toute annulation ou demande de report doit être faite au moins ${o.cancel || 48} heures avant le rendez vous. Passé ce délai${o.deposit ? ', l’acompte reste acquis' : ', la prestation peut être due en totalité'}. En cas de retard de plus de ${o.late || 15} minutes, la prestation peut être écourtée ou reportée.

6. Droit de rétractation
Pour un contrat conclu à distance, le client particulier dispose de 14 jours pour se rétracter, sauf s’il demande expressément que la prestation commence avant la fin de ce délai. Dans ce cas, il paie la part déjà réalisée.

7. Responsabilité
${p.business} s’engage à réaliser les prestations avec soin. Le client s’engage à transmettre les informations utiles (allergies, contraintes, accès) avant la prestation.

8. Données personnelles
Les données collectées servent uniquement à la gestion des rendez vous et de la relation client. Elles ne sont jamais revendues. Le client peut demander leur consultation ou leur suppression à ${pr.email || '[votre email]'}.

9. Médiation et litiges
En cas de litige, le client particulier peut recourir gratuitement au médiateur de la consommation : ${o.mediator || '[nom et site du médiateur]'}. À défaut d’accord amiable, les tribunaux compétents sont ceux du lieu d’exercice.

Contact : ${pr.email || '[votre email]'}${pr.phone ? ', ' + pr.phone : ''}`);
}

function parseContact(t) {
  t = String(t || '');
  const email = (t.match(/[\w.+-]+@[\w-]+\.[\w.-]+/) || [''])[0];
  const phone = ((t.match(/(?:\+\d{2,3}[\s.]?)?(?:\(?0\)?[\s.]?)?\d(?:[\s.]?\d{2}){4}/) || [''])[0] || '').trim();
  const ig = (t.match(/(?:^|\s)@([a-z0-9._]{2,30})/i) || ['', ''])[1];
  let name = '';
  const m = t.match(/(?:[Jj]e m[’']appelle|[Mm]oi c[’']est|[Cc][’']est|[Jj]e suis|[Ii]ci)\s+([A-ZÀ-Ý][a-zà-ÿ]+(?:[\s-][A-ZÀ-Ý][a-zà-ÿ]+)?)/);
  if (m) name = m[1];
  if (!name) { const last = t.trim().split('\n').map(x => x.trim()).filter(Boolean).pop() || ''; if (/^[A-ZÀ-Ý][a-zà-ÿ]+(\s[A-ZÀ-Ý][a-zà-ÿ]+)?$/.test(last)) name = last; }
  if (!name && ig) name = ig;
  return { name, email, phone, ig };
}

function dailyIdeas() {
  const out = [], today = iso(Date.now()), d = new Date().getDay(), occ = currentOccasion();
  if (occ) out.push({ t: `${occ.name} ${inDays(occ.days)}`, w: 'Préparez une séquence spéciale tant qu’il est temps.', h: `#/stories?type=Occasion` });
  const happy = st.clients.filter(c => c.satisfied && !c.storyDone).slice(0, 1)[0];
  if (happy) out.push({ t: `Story avis avec ${firstName(happy.name)}`, w: 'Un client satisfait, c’est la meilleure preuve.', h: `#/stories?type=Preuve&subj=${encodeURIComponent(firstName(happy.name))}` });
  const per = primaryPersona();
  if (per && per.objections[0]) out.push({ t: `Répondre à « ${per.objections[0].q.replace(/\.$/, '')} »`, w: `L’hésitation n°1 de ${per.name}, votre client idéal.`, h: '#/posts?angle=Objection' });
  const recent = st.media.filter(m => m.kind === 'photo' && since(m.at) <= 7).length;
  if (recent >= 2) out.push({ t: `Montrer vos ${recent} nouvelles photos`, w: 'Un carrousel avec vos photos récentes.', h: '#/posts?angle=Coulisses' });
  const plan = { 1: ['Lundi : vos coulisses', 'Montrez comment votre semaine démarre.', '#/stories?type=Coulisses'], 3: ['Mercredi : un conseil', 'Le contenu le plus enregistré et partagé.', '#/posts?angle=Conseils'], 5: ['Vendredi : vos créneaux', 'Les gens réservent avant le week end.', '#/stories?type=Offre'], 0: ['Dimanche : votre histoire', 'Le dimanche, on prend le temps de lire.', '#/posts?angle=Histoire&net=LinkedIn'] }[d];
  if (plan) out.push({ t: plan[0], w: plan[1], h: plan[2] });
  if (!st.calendar.some(e => e.date >= today && e.date <= iso(Date.now() + 7 * DAY))) out.push({ t: 'Rien de prévu cette semaine', w: 'Planifiez vos 4 semaines en un clic.', h: '#/calendrier' });
  out.push({ t: 'Une story offre', w: sec().season[season()], h: '#/stories?type=Offre' });
  return out.slice(0, 3);
}
