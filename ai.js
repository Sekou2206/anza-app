const AI_KEY_STORE = 'anza-claude-key';
const AI_MODEL_LOCAL = 'claude-sonnet-5-5';
function localKey() { try { return localStorage.getItem(AI_KEY_STORE) || ''; } catch (e) { return ''; } }
function aiMode() { if (ONLINE && user) return has(3) && CFG.aiServer ? 'server' : ''; return localKey() ? 'local' : ''; }
function aiOn() { return !!aiMode(); }

const NIA_SYSTEM = `Tu es Nia, la brand manager d’Anza, un outil créé par SAUTI et SC Project pour les entrepreneurs qui débutent. Tu es une intelligence artificielle formée à la méthode SAUTI : diagnostic, message et voix, construction, production et diffusion, mesure, conversion.

Ta mission : aider la personne à trouver des clients en construisant une marque qui lui ressemble vraiment.

Règles d’écriture, toujours :
1. Français naturel, phrases courtes, concrètes, chaleureuses. Pas de jargon.
2. N’utilise jamais de tiret comme ponctuation (ni court ni long). Utilise des virgules, des points ou deux points.
3. Reprends les mots exacts de la personne quand c’est possible : elle doit se reconnaître.
4. N’invente jamais de chiffres, d’avis clients, de résultats ou de faits. Si une information manque, écris entre crochets ce qu’il faut compléter, par exemple [prénom du client].
5. Respecte le tutoiement ou le vouvoiement indiqué dans le profil.
6. Aucune promesse de résultat garanti, aucun conseil médical, juridique ou fiscal précis.
7. Tu réponds toujours en appelant l’outil demandé, avec un JSON valide.`;

function brief() {
  const p = st.profile;
  const by = bestAngle()[0];
  return JSON.stringify({
    date: iso(Date.now()),
    profil: { prenom: p.first, activite: p.business, metier: p.activity, secteur: p.sector || '', lieu: p.city, histoire: p.story, clients_ideaux: p.target, probleme: p.problem, valeur: p.value, preuves: p.proof, ton: p.vibe, adresse: p.tone === 'tu' ? 'tutoiement' : 'vouvoiement', limites: p.limits, bouton: p.cta, instagram: p.instagram },
    prestations: st.services.slice(0, 12).map(s => ({ nom: s.name, prix: s.price })),
    reglages_voix: st.ai,
    focus_du_moment: st.focus || '',
    memoire: (st.memory || []).slice(-15).map(m => m.text),
    questions_semaine: st.weekly.slice(0, 4).map(w => ({ q: w.q, r: w.a })),
    calendrier_a_venir: st.calendar.filter(e => e.date >= iso(Date.now()) && e.date <= iso(Date.now() + 21 * DAY)).map(e => `${e.date} ${e.type}`).join(', '),
    performances: by ? `Angle qui génère le plus de messages : ${by.a}` : '',
    activite_crm: { contacts: st.clients.length, prospects: st.clients.filter(c => c.status === 'prospect').length, clients: st.clients.filter(c => c.status === 'client' || c.status === 'fidele').length }
  });
}

async function callClaude(task, system, messages, tool, maxTokens) {
  const body = { task, system, messages, tools: [tool], max_tokens: maxTokens || 3000 };
  let out;
  const ctrl = new AbortController(), timer = setTimeout(() => ctrl.abort(), 90000);
  try {
    if (aiMode() === 'server') {
      const { data, error } = await sb.functions.invoke('nia', { body });
      if (error) { let msg = ''; try { msg = (await error.context.json()).error; } catch (e) {} throw new Error(msg || 'server'); }
      out = data;
    } else {
      const r = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST', signal: ctrl.signal,
        headers: { 'x-api-key': localKey(), 'anthropic-version': '2023-06-01', 'content-type': 'application/json', 'anthropic-dangerous-direct-browser-access': 'true' },
        body: JSON.stringify({ model: AI_MODEL_LOCAL, max_tokens: body.max_tokens, system, messages, tools: [tool] })
      });
      out = await r.json();
      if (!r.ok) throw new Error((out.error && out.error.message) || 'api');
    }
  } finally { clearTimeout(timer); }
  const blocks = (out && out.content) || [];
  const tu = blocks.find(b => b.type === 'tool_use' && b.name === tool.name);
  if (tu && tu.input) return tu.input;
  const txt = blocks.filter(b => b.type === 'text').map(b => b.text).join('\n');
  const m = txt.match(/\{[\s\S]*\}/);
  if (m) { try { return JSON.parse(m[0]); } catch (e) {} }
  throw new Error('format');
}

function aiError(e) {
  const m = String((e && e.message) || e);
  if (/plan/.test(m)) return 'Nia connectée à ' + AI_NAME + ' est incluse dans le Magasin.';
  if (/limit/.test(m)) return 'Limite d’utilisation du jour atteinte. Nia repasse en mode modèles.';
  if (/auth|key|401|invalid x-api-key/i.test(m)) return 'Clé Claude invalide. Vérifiez la dans les Réglages.';
  if (/abort/i.test(m)) return 'Nia a mis trop de temps à répondre. Réessayez.';
  return 'Nia n’a pas pu répondre via ' + AI_NAME + ', j’utilise les modèles intégrés.';
}

const T = (name, description, properties, required) => ({ name, description, input_schema: { type: 'object', properties, required: required || Object.keys(properties) } });
const S = { type: 'string' };
const PROFILE_PROPS = { type: 'object', description: 'Champs du profil à mettre à jour, uniquement s’ils sont clairement établis par la personne. Clés possibles : first, business, activity, sector, city, story, target, problem, value, proof, vibe, tone (vous ou tu), limits, cta.', additionalProperties: { type: 'string' } };
const ACTIONS = { type: 'array', description: 'Publications à ajouter au calendrier.', items: { type: 'object', properties: { in_days: { type: 'integer', minimum: 1, maximum: 21 }, format: { type: 'string', enum: ['Story', 'Carrousel', 'LinkedIn'] }, angle: { type: 'string', enum: ['Avant après', 'Preuve', 'Coulisses', 'Offre', 'Conseil', 'Erreurs', 'Conseils', 'Histoire'] }, title: S, brief: { type: 'string', description: 'Ce que doit raconter le contenu, en une ou deux phrases.' } }, required: ['in_days', 'format', 'angle', 'title', 'brief'] } };

const TOPICS = { business: 'nom de l’activité', activity: 'métier, ce qui est vendu', city: 'lieu ou zone', story: 'pourquoi la personne s’est lancée', target: 'clients idéaux, précis', problem: 'problème réglé pour eux', value: 'ce qui la rend différente, concret', proof: 'preuves, résultats, avis (ou le fait qu’elle débute)', prices: 'prestations et prix', vibe: 'ton, tutoiement ou vouvoiement', limits: 'ce qu’elle refuse' };

async function aiInterview() {
  const iv = st.interview;
  const msgs = iv.msgs.map(m => ({ role: m.f === 'u' ? 'user' : 'assistant', content: m.t }));
  while (msgs.length && msgs[0].role === 'assistant') msgs.shift();
  const covered = iv.covered || [];
  const sys = `${NIA_SYSTEM}

Tu mènes l’entretien de départ, comme une vraie brand manager. Profil connu : ${brief()}

Sujets à couvrir : ${Object.entries(TOPICS).map(([k, v]) => `${k} (${v})${covered.includes(k) ? ' : couvert' : ''}`).join(' ; ')}.

Méthode :
1. Commence ta réponse par une réaction précise à ce que la personne vient de dire, en reprenant ses mots, et en montrant ce que ça change pour sa communication.
2. Si la réponse est vague, générique (qualité, sérieux, tout le monde) ou trop courte, pose une question de relance concrète avec des exemples. Maximum deux relances par sujet.
3. Si la personne ne sait pas, propose deux ou trois options tirées de ce que tu sais déjà, et laisse la choisir.
4. Si elle exprime une difficulté, accueille la avec humanité avant de continuer.
5. Puis pose une seule question à la fois, la plus utile parmi les sujets non couverts.
6. Quand tout est couvert, ou après environ 18 échanges, termine : done = true, et dans reply, résume son positionnement en 4 phrases (pour qui, quel problème, quelle promesse, quelle preuve) puis annonce ce que tu vas faire pour elle.
7. reply fait au maximum 90 mots, sans liste.`;
  const tool = T('nia_entretien', 'Réponse de Nia pendant l’entretien de départ', { reply: { type: 'string', description: 'Message de Nia à afficher' }, updates: PROFILE_PROPS, services: { type: 'array', items: { type: 'object', properties: { name: S, price: { type: 'number' }, duration: { type: 'integer' } }, required: ['name', 'price'] } }, covered: { type: 'array', items: { type: 'string', enum: Object.keys(TOPICS) } }, done: { type: 'boolean' } }, ['reply', 'covered', 'done']);
  const r = await callClaude('interview', sys, msgs.length ? msgs : [{ role: 'user', content: 'Bonjour Nia, je suis prêt.' }], tool, 2500);
  return r;
}

async function aiWeeklyQuestion() {
  const sys = `${NIA_SYSTEM}\n\nProfil et historique : ${brief()}\n\nChoisis la question de la semaine : une seule question personnelle et concrète, qui aide à mieux connaître la personne et à produire un contenu authentique. Tiens compte de sa mémoire, de son focus, de ce qui manque dans son profil et des questions déjà posées (ne les répète pas). Maximum 20 mots.`;
  return callClaude('weekly_question', sys, [{ role: 'user', content: 'Quelle est ma question de la semaine ?' }], T('nia_question', 'Question de la semaine', { question: S, why: { type: 'string', description: 'Pourquoi cette question, en une phrase' } }), 800);
}

async function aiWeeklyAnswer(q, a) {
  const sys = `${NIA_SYSTEM}\n\nProfil et historique : ${brief()}\n\nLa personne vient de répondre à la question de la semaine. Analyse sa réponse et décide concrètement de ce qui change :
1. reply : réagis à ses mots exacts (2 phrases), puis explique clairement ce que tu vas faire pour elle cette semaine (maximum 110 mots).
2. updates : affine son profil uniquement si la réponse l’établit clairement (par exemple une nouvelle preuve, un client idéal plus précis).
3. memory : une à trois notes courtes à retenir pour la suite.
4. actions : une à trois publications concrètes à planifier dans les 10 prochains jours, directement tirées de sa réponse, de préférence sur des jours libres du calendrier. N’annonce pas de jour précis dans reply, dis plutôt « dans deux jours » ou « cette semaine ». Si elle signale de la fatigue, allège le rythme.
5. focus : le thème de la semaine en quelques mots.`;
  return callClaude('weekly_answer', sys, [{ role: 'user', content: `Question : ${q}\nMa réponse : ${a}` }], T('nia_analyse', 'Effets de la réponse sur la stratégie', { reply: S, updates: PROFILE_PROPS, memory: { type: 'array', items: S }, actions: ACTIONS, focus: S }), 2500);
}

async function aiStory(type, subject) {
  const sys = `${NIA_SYSTEM}\n\nProfil : ${brief()}\n\nÉcris une séquence de 6 stories Instagram de type « ${type} ». Chaque story : t = titre fort (8 mots maximum), s = phrase d’appui (20 mots maximum, peut être vide), c = texte de bouton uniquement sur la dernière story (sinon vide). La séquence raconte une histoire et se termine par un appel à l’action vers ${st.profile.cta || 'Réserver'}.`;
  const r = await callClaude('story', sys, [{ role: 'user', content: subject ? `Sujet : ${subject}` : 'Propose le sujet le plus utile pour moi cette semaine.' }], T('nia_stories', 'Séquence de stories', { frames: { type: 'array', minItems: 4, maxItems: 8, items: { type: 'object', properties: { t: S, s: S, c: S }, required: ['t', 's', 'c'] } } }), 2500);
  return r.frames.map(f => ({ t: f.t || '', s: f.s || '', c: f.c || '' }));
}

async function aiPost(net, format, angle, subject) {
  const sys = `${NIA_SYSTEM}\n\nProfil : ${brief()}\n\nÉcris un ${format === 'Carrousel' ? 'carrousel de 5 à 7 slides' : 'post avec un seul visuel'} pour ${net}, angle « ${angle} ». Slides : k = petit surtitre en majuscules, t = titre (10 mots maximum), p = phrase d’appui (20 mots maximum). Puis la légende : ${net === 'LinkedIn' ? 'storytelling LinkedIn, 120 à 200 mots, sauts de ligne, une question finale, 3 hashtags maximum' : 'légende Instagram, accroche, 3 à 5 lignes, appel à l’action, 5 à 8 hashtags pertinents dont la ville'}.`;
  return callClaude('post', sys, [{ role: 'user', content: subject ? `Sujet : ${subject}` : 'Choisis le sujet le plus utile pour moi.' }], T('nia_post', 'Contenu réseau social', { slides: { type: 'array', minItems: 1, maxItems: 8, items: { type: 'object', properties: { k: S, t: S, p: S }, required: ['k', 't', 'p'] } }, caption: S }), 3000);
}

async function aiFollow(rule, c, label) {
  const hist = c.history.slice(-5).map(h => `${h.date} ${h.text} ${h.amount || ''}`).join(' ; ');
  const sys = `${NIA_SYSTEM}\n\nProfil : ${brief()}\n\nÉcris un message de relance WhatsApp court (40 à 70 mots), naturel, personnalisé, dans le ton de la personne. Situation : ${label}. Ne sois jamais insistant. Termine par une question simple.`;
  const r = await callClaude('followup', sys, [{ role: 'user', content: `Contact : ${c.name}. Étape : ${c.status}. Dernier contact : ${c.lastContact}. Historique : ${hist || 'aucun'}. Notes : ${c.notes || 'aucune'}.` }], T('nia_relance', 'Message de relance', { message: S }), 1200);
  return r.message;
}

async function aiBios() {
  const sys = `${NIA_SYSTEM}\n\nProfil : ${brief()}\n\nÉcris 3 bios Instagram différentes (150 caractères maximum chacune, retours à la ligne autorisés, un emoji maximum par ligne) et un titre LinkedIn (220 caractères maximum).`;
  return callClaude('bios', sys, [{ role: 'user', content: 'Mes bios, s’il te plaît.' }], T('nia_bios', 'Bios', { bios: { type: 'array', minItems: 3, maxItems: 3, items: S }, linkedin: S }), 1500);
}

async function aiLanding() {
  const sys = `${NIA_SYSTEM}\n\nProfil : ${brief()}\n\nÉcris le haut d’une mini landing page qui donne envie de prendre rendez vous : headline (10 mots maximum), sub (30 mots maximum), cta (4 mots maximum).`;
  return callClaude('landing', sys, [{ role: 'user', content: 'Ma page.' }], T('nia_landing', 'Textes de la landing page', { headline: S, sub: S, cta: S }), 1000);
}

async function aiSuggest() {
  const sys = `${NIA_SYSTEM}\n\nProfil, mémoire et performances : ${brief()}\n\nPropose les 3 actions de communication les plus utiles pour cette semaine, en t’appuyant sur ce qui marche déjà et sur le focus du moment.`;
  return callClaude('suggest', sys, [{ role: 'user', content: 'Que dois je faire cette semaine ?' }], T('nia_suggestions', 'Suggestions', { suggestions: { type: 'array', minItems: 3, maxItems: 3, items: { type: 'object', properties: { day: S, title: S, why: S }, required: ['day', 'title', 'why'] } } }), 1500);
}

async function aiChat(history) {
  const sys = `${NIA_SYSTEM}\n\nProfil, mémoire et activité : ${brief()}\n\nTu discutes librement avec la personne pour l’aider sur sa communication, ses clients, ses offres, son organisation. Réponds de façon claire et actionnable (maximum 150 mots). Quand c’est utile, propose des actions concrètes : publications à planifier, mises à jour du profil, notes à retenir. N’ajoute des actions que si elles découlent directement de la conversation.`;
  const msgs = history.slice(-20).map(m => ({ role: m.f === 'u' ? 'user' : 'assistant', content: m.t }));
  while (msgs.length && msgs[0].role === 'assistant') msgs.shift();
  return callClaude('chat', sys, msgs, T('nia_chat', 'Réponse de Nia', { reply: S, actions: ACTIONS, updates: PROFILE_PROPS, memory: { type: 'array', items: S } }, ['reply']), 3000);
}

const ALLOWED_FIELDS = ['first', 'business', 'activity', 'sector', 'city', 'story', 'target', 'problem', 'value', 'proof', 'vibe', 'tone', 'limits', 'cta'];
function applyUpdates(updates, source) {
  const changed = [];
  Object.entries(updates || {}).forEach(([k, v]) => {
    if (!ALLOWED_FIELDS.includes(k) || typeof v !== 'string') return;
    v = v.trim(); if (!v) return;
    if (k === 'tone' && !['vous', 'tu'].includes(v)) return;
    if (st.profile[k] === v) return;
    (st.evolution = st.evolution || []).unshift({ date: iso(Date.now()), field: k, from: st.profile[k] || '', to: v, source });
    st.profile[k] = v; changed.push(k);
  });
  st.evolution = (st.evolution || []).slice(0, 80);
  return changed;
}
function addMemory(notes, source) {
  (notes || []).filter(n => typeof n === 'string' && n.trim()).forEach(n => (st.memory = st.memory || []).push({ date: iso(Date.now()), text: n.trim().slice(0, 240), source }));
  st.memory = (st.memory || []).slice(-60);
}
function addActions(actions, source) {
  const added = [];
  (actions || []).slice(0, 4).forEach(a => {
    const d = nextFreeDate(Date.now() + Math.max(1, Math.min(21, +a.in_days || 2)) * DAY);
    const type = ['Story', 'Carrousel', 'LinkedIn'].includes(a.format) ? a.format : 'Story';
    const ev = { id: uid(), date: d, type, angle: a.angle || 'Offre', title: String(a.title || 'Publication').slice(0, 120), brief: String(a.brief || '').slice(0, 400), done: false, source };
    st.calendar.push(ev); added.push(ev);
  });
  return added;
}
const FIELD_LABEL = { first: 'Prénom', business: 'Nom de l’activité', activity: 'Métier', sector: 'Secteur', city: 'Lieu', story: 'Histoire', target: 'Clients idéaux', problem: 'Problème réglé', value: 'Valeur ajoutée', proof: 'Preuves', vibe: 'Ton', tone: 'Vous ou tu', limits: 'Limites', cta: 'Bouton' };
