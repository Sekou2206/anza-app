const DAY = 86400000;
const iso = d => { const x = new Date(d); return new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-3);

function blankState(first, email) {
  return {
    v: 2,
    onboarded: false,
    profile: {
      first: first || '', name: first || '', business: '', activity: '', city: '',
      story: '', target: '', problem: '', value: '', proof: '',
      tone: 'vous', vibe: '', limits: '',
      instagram: '', linkedin: '', phone: '', email: email || '', siret: '', address: '',
      vatNote: true, threshold: 83600, tvaThreshold: 37500, period: 'mensuelle', cta: 'Réserver',
      facebook: '', tiktok: '', website: '', googleReview: '', payLink: '', depositPct: 30, calendly: '',
      urssaf: 'services', vl: false, rateOverride: ''
    },
    brand: { primary: '#1E3A8A', accent: '#2563EB', soft: '#EEF2FA', ink: '#0A1020', font: 'Inter', emoji: true, logo: '', logoOn: true },
    services: [],
    clients: [],
    quotes: [],
    quoteSeq: 1,
    rules: [
      { id: 'prospect', label: 'Prospect sans réponse', days: 2, on: true },
      { id: 'devis', label: 'Devis envoyé non accepté', days: 3, on: true },
      { id: 'revoir', label: 'Client à recontacter', days: 30, on: true },
      { id: 'avis', label: 'Client satisfait sans avis', days: 1, on: true },
      { id: 'rappel', label: 'Rappel de rendez vous la veille', days: 1, on: true }
    ],
    done: [],
    interview: { step: 0, msgs: [], answers: {} },
    weekly: [],
    calendar: [],
    ai: { warmth: 65, humor: 30, formal: 45, length: 50 },
    perf: [],
    localMessages: [],
    memory: [],
    evolution: [],
    niaChat: [],
    tasks: [],
    focus: '',
    media: [],
    drafts: {},
    icp: { answers: {}, personas: [], anti: null, at: '', ai: false },
    voice: { samples: [], fiche: null, at: '', ai: false },
    page: blankPage(),
    tagHist: [],
    leadsSeen: []
  };
}

function blankPage() {
  return { slug: '', published: false, mode: 'bio', theme: 'Marque', headline: '', sub: '', cta: '', ctaKind: 'whatsapp', ctaUrl: '', cover: '', avatar: '', gallery: [], links: [], showServices: true, showReviews: true, reviews: [], faq: [], about: true, form: true, booking: { on: false, days: [1, 2, 3, 4, 5, 6], from: '09:00', to: '18:00', step: 60 }, hours: '', publishedAt: '' };
}
const FONT_KEYS = ['Inter', 'Playfair', 'Fraunces', 'Archivo', 'Caveat', 'DMSerif'];
const RULES_DEFAULT = () => blankState().rules;
const cleanId = x => String(x == null ? '' : x).replace(/[^\w-]/g, '');

function isPlain(o) { return !!o && typeof o === 'object' && !Array.isArray(o); }
function migrate(o) {
  const b = blankState();
  if (!o || typeof o !== 'object') return b;
  const out = Object.assign(b, o);
  out.profile = Object.assign(blankState().profile, o.profile || {});
  out.brand = Object.assign(blankState().brand, o.brand || {});
  out.ai = Object.assign(blankState().ai, o.ai || {});
  out.interview = Object.assign({ step: 0, msgs: [], answers: {} }, o.interview || {});
  ['services', 'clients', 'quotes', 'done', 'weekly', 'calendar', 'perf', 'localMessages', 'memory', 'evolution', 'niaChat', 'tasks', 'taskCols'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  const rd = RULES_DEFAULT(), ro = Array.isArray(o.rules) ? o.rules : [];
  out.rules = rd.map(r => { const x = ro.find(y => y && y.id === r.id); return x ? { id: r.id, label: r.label, days: Math.max(0, +x.days || r.days), on: !!x.on } : r; });
  out.clients = out.clients.filter(c => c && c.id).map(c => Object.assign({ name: '', phone: '', email: '', source: 'Autre', status: 'prospect', notes: '', createdAt: iso(Date.now()), lastContact: c.createdAt || iso(Date.now()), next: '', history: [] }, c, { history: Array.isArray(c.history) ? c.history : [] }));
  out.calendar = out.calendar.filter(e => e && e.id && e.date).map(e => Object.assign({ type: 'Story', angle: 'Offre', title: '', done: false }, e));
  const okStatus = ['prospect', 'devis', 'client', 'fidele'], okType = ['Story', 'Carrousel', 'LinkedIn', 'Bilan'], okQ = ['brouillon', 'envoye', 'accepte', 'refuse'];
  out.clients.forEach(c => { if (!okStatus.includes(c.status)) c.status = 'prospect'; c.id = String(c.id).replace(/[^\w-]/g, ''); });
  out.calendar.forEach(e => { if (!okType.includes(e.type)) e.type = 'Story'; e.id = String(e.id).replace(/[^\w-]/g, ''); if (!/^\d{4}-\d{2}-\d{2}$/.test(e.date)) e.date = iso(Date.now()); });
  out.quotes.forEach(q => { if (!okQ.includes(q.status)) q.status = 'brouillon'; q.id = String(q.id).replace(/[^\w-]/g, ''); });
  out.tasks = (out.tasks || []).filter(k => k && k.id && k.title).map(k => Object.assign({}, k, { id: String(k.id).replace(/[^\w-]/g, ''), col: String(k.col || 'todo').replace(/[^\w-]/g, ''), prio: k.prio === 'haute' ? 'haute' : 'normale', due: /^\d{4}-\d{2}-\d{2}$/.test(k.due || '') ? k.due : '' }));
  out.taskCols = (out.taskCols || []).filter(c => c && c.id && c.name).map(c => ({ id: String(c.id).replace(/[^\w-]/g, ''), name: String(c.name).slice(0, 40), done: !!c.done }));
  ['primary', 'accent', 'soft', 'ink'].forEach(k => { if (!/^#[0-9a-f]{3,8}$/i.test(out.brand[k] || '')) out.brand[k] = blankState().brand[k]; });
  out.quotes = out.quotes.filter(q => q && q.id).map(q => Object.assign({ lines: [], discount: 0, status: 'brouillon' }, q));
  out.media = (Array.isArray(o.media) ? o.media : []).filter(m => m && m.id).map(m => ({ id: cleanId(m.id), name: String(m.name || '').slice(0, 80), w: +m.w || 0, h: +m.h || 0, ext: m.ext === 'png' ? 'png' : 'jpg', kind: m.kind === 'logo' ? 'logo' : 'photo', at: m.at || iso(Date.now()), tags: Array.isArray(m.tags) ? m.tags.slice(0, 6).map(t => String(t).slice(0, 30)) : [], up: !!m.up })).slice(0, 600);
  if (o.brand && o.brand.font === 'Serif') out.brand.font = 'Playfair';
  if (!FONT_KEYS.includes(out.brand.font)) out.brand.font = 'Inter';
  out.brand.logo = cleanId(out.brand.logo);
  if (out.profile.threshold === 77700) out.profile.threshold = 83600;
  out.drafts = isPlain(o.drafts) ? o.drafts : {};
  out.icp = Object.assign({ answers: {}, personas: [], anti: null, at: '', ai: false }, isPlain(o.icp) ? o.icp : {});
  if (!isPlain(out.icp.answers)) out.icp.answers = {};
  if (!Array.isArray(out.icp.personas)) out.icp.personas = [];
  out.voice = Object.assign({ samples: [], fiche: null, at: '', ai: false }, isPlain(o.voice) ? o.voice : {});
  if (!Array.isArray(out.voice.samples)) out.voice.samples = [];
  const bp = blankPage(), op = isPlain(o.page) ? o.page : {};
  out.page = Object.assign(bp, op, { booking: Object.assign(bp.booking, isPlain(op.booking) ? op.booking : {}) });
  ['gallery', 'links', 'reviews', 'faq'].forEach(k => { if (!Array.isArray(out.page[k])) out.page[k] = []; });
  out.page.slug = String(out.page.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  if (!['bio', 'landing'].includes(out.page.mode)) out.page.mode = 'bio';
  ['tagHist', 'leadsSeen'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  out.leadsSeen = out.leadsSeen.slice(-300);
  out.tagHist = out.tagHist.slice(-12);
  out.clients.forEach(c => { if (c.nextTime && !/^\d{2}:\d{2}$/.test(c.nextTime)) c.nextTime = ''; if (c.persona) c.persona = cleanId(c.persona); });
  out.quotes.forEach(q => { q.deposit = Math.max(0, Math.min(100, +q.deposit || 0)); q.depositPaid = !!q.depositPaid; });
  out.v = 3;
  return out;
}
