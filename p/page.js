(function () {
  const C = window.ANZA_CONFIG || {}, SB = String(C.supabaseUrl || '').replace(/\/$/, ''), KEY = C.supabaseAnonKey || '';
  const root = document.getElementById('root');
  const slug = decodeURIComponent((location.search || '').slice(1).split('&')[0] || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  const H = { apikey: KEY, 'content-type': 'application/json' };
  function fail(t) { document.title = 'Page introuvable'; root.innerHTML = '<div class="load"><div><h1 style="font-size:24px;margin:0 0 8px">Page introuvable</h1><p>' + t + '</p></div></div>'; }
  if (!slug || !SB || !KEY) { fail('Vérifiez le lien qu’on vous a envoyé.'); return; }
  fetch(SB + '/rest/v1/pages?slug=eq.' + encodeURIComponent(slug) + '&published=eq.true&select=data', { headers: H })
    .then(r => r.ok ? r.json() : Promise.reject(r.status))
    .then(rows => {
      const d = rows && rows[0] && rows[0].data;
      if (!d) { fail('Cette page n’existe pas ou n’est plus en ligne.'); return; }
      const img = p => p ? SB + '/storage/v1/object/public/pages/' + String(p).split('/').map(encodeURIComponent).join('/') : '';
      document.title = d.name || 'Page';
      const m = document.createElement('meta'); m.name = 'description'; m.content = d.sub || d.headline || ''; document.head.appendChild(m);
      document.getElementById('pcss').textContent = AnzaPage.css(d, '../');
      root.innerHTML = AnzaPage.body(d, img);
      const cb = document.getElementById('cgvb'); if (cb) cb.addEventListener('click', () => { const t = document.getElementById('cgvt'); t.hidden = !t.hidden; });
      const f = document.getElementById('lead'); if (f) bindForm(f, d);
    })
    .catch(() => fail('Connexion impossible pour le moment. Réessayez dans un instant.'));
  function bindForm(f, d) {
    const err = document.getElementById('lerr'), dateI = f.querySelector('input[name=date]');
    if (dateI) { const t = new Date(Date.now() + 86400000), iso = x => new Date(x.getTime() - x.getTimezoneOffset() * 60000).toISOString().slice(0, 10); dateI.min = iso(t); dateI.max = iso(new Date(Date.now() + 180 * 86400000)); }
    const days = (f.dataset.days || '').split(',').filter(Boolean).map(Number);
    let sent = false;
    f.addEventListener('submit', e => {
      e.preventDefault(); if (sent) return; err.textContent = '';
      const v = n => (f.elements[n] ? String(f.elements[n].value || '').trim() : '');
      if (v('website')) { sent = true; f.innerHTML = '<p class="ok">Merci, votre demande est bien envoyée.</p>'; return; }
      const name = v('name'), contact = v('contact');
      if (name.length < 2) { err.textContent = 'Indiquez votre nom.'; return; }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact) && contact.replace(/\D/g, '').length < 8) { err.textContent = 'Indiquez un téléphone ou un email valide.'; return; }
      const body = { page_slug: slug, kind: dateI ? 'booking' : 'contact', name: name.slice(0, 80), contact: contact.slice(0, 120), message: v('message').slice(0, 1000) || null };
      if (dateI) {
        const dt = v('date'); if (!/^\d{4}-\d{2}-\d{2}$/.test(dt)) { err.textContent = 'Choisissez une date.'; return; }
        const [y, mo, da] = dt.split('-').map(Number), wd = new Date(y, mo - 1, da).getDay();
        if (days.length && !days.includes(wd)) { err.textContent = 'Ce jour n’est pas disponible. Choisissez un autre jour.'; return; }
        body.wish_date = dt; body.wish_time = v('time') || null;
      }
      const btn = f.querySelector('button[type=submit]'); btn.disabled = true; btn.textContent = 'Envoi';
      fetch(SB + '/rest/v1/page_leads', { method: 'POST', headers: Object.assign({ Prefer: 'return=minimal' }, H), body: JSON.stringify(body) })
        .then(r => { if (!r.ok) return r.text().then(t => Promise.reject(t)); sent = true; f.innerHTML = '<p class="ok">Merci ' + name.split(' ')[0].replace(/[<>&"]/g, '') + ', votre demande est bien envoyée. Vous serez recontacté très vite.</p>'; })
        .catch(t => { btn.disabled = false; btn.textContent = 'Envoyer'; err.textContent = /rate/.test(String(t)) ? 'Trop de demandes en ce moment. Réessayez plus tard ou utilisez le bouton en haut de la page.' : 'Envoi impossible. Réessayez ou utilisez le bouton en haut de la page.'; });
    });
  }
})();
