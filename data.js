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
      vatNote: true, threshold: 77700, period: 'mensuelle', cta: 'Réserver'
    },
    brand: { primary: '#1E3A8A', accent: '#2563EB', soft: '#EEF2FA', ink: '#0A1020', font: 'Inter', emoji: true },
    services: [],
    clients: [],
    quotes: [],
    quoteSeq: 1,
    rules: [
      { id: 'prospect', label: 'Prospect sans réponse', days: 2, on: true },
      { id: 'devis', label: 'Devis envoyé non accepté', days: 3, on: true },
      { id: 'revoir', label: 'Client à recontacter', days: 30, on: true },
      { id: 'avis', label: 'Client satisfait sans avis', days: 1, on: true }
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
    focus: ''
  };
}

function migrate(o) {
  const b = blankState();
  if (!o || typeof o !== 'object') return b;
  const out = Object.assign(b, o);
  out.profile = Object.assign(blankState().profile, o.profile || {});
  out.brand = Object.assign(blankState().brand, o.brand || {});
  out.ai = Object.assign(blankState().ai, o.ai || {});
  out.interview = Object.assign({ step: 0, msgs: [], answers: {} }, o.interview || {});
  ['services', 'clients', 'quotes', 'done', 'weekly', 'calendar', 'perf', 'localMessages', 'memory', 'evolution', 'niaChat', 'tasks', 'taskCols'].forEach(k => { if (!Array.isArray(out[k])) out[k] = []; });
  if (!Array.isArray(out.rules) || out.rules.length !== 4) out.rules = blankState().rules;
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
  out.v = 2;
  return out;
}
