(function (G) {
  const E = s => String(s == null ? '' : s).replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  const SAFE_URL = u => { u = String(u || '').trim(); if (/^(https?:|mailto:|tel:)/i.test(u)) return u; if (/^[\w.-]+\.[a-z]{2,}(\/|$)/i.test(u)) return 'https://' + u; return ''; };
  const HEX = c => /^#[0-9a-f]{3,8}$/i.test(c || '') ? c : '#1E3A8A';
  const FONT_CSS = { Inter: ['Inter', 800, 'inter-800.woff2'], Playfair: ['Playfair Display', 700, 'f-playfair.woff2'], Fraunces: ['Fraunces', 700, 'f-fraunces.woff2'], DMSerif: ['DM Serif Display', 400, 'f-dmserif.woff2'], Archivo: ['Archivo Black', 400, 'f-archivo.woff2'], Caveat: ['Caveat', 700, 'f-caveat.woff2'] };
  function lumi(hex) { let h = HEX(hex).slice(1); if (h.length === 3) h = h.split('').map(x => x + x).join(''); const n = parseInt(h.slice(0, 6), 16), c = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  const onColor = bg => { const l = lumi(bg); return (1.05 / (l + .05)) >= ((l + .05) / (lumi('#0A1020') + .05)) ? '#FFFFFF' : '#0A1020'; };
  const ICONS = {
    instagram: '<rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.3" cy="6.7" r=".6"/>',
    tiktok: '<path d="M14 4v10.5a3.5 3.5 0 11-3.5-3.5M14 4c.5 2.4 2.2 4 4.5 4.2"/>',
    facebook: '<path d="M14 8.5h2.5V5H14a4 4 0 00-4 4v2H7.5v3.5H10V21h3.5v-6.5H16l.5-3.5h-3V9a.5.5 0 01.5-.5z"/>',
    linkedin: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M8 10.5V16M8 7.8v.1M11.5 16v-3.2c0-1.4 1-2.3 2.2-2.3s2 .9 2 2.3V16"/>',
    whatsapp: '<path d="M4 20l1.3-4A8 8 0 1112 20a8 8 0 01-4-1z"/>',
    link: '<path d="M10 14a4.5 4.5 0 006.4 0l3-3a4.5 4.5 0 00-6.4-6.4l-1 1"/><path d="M14 10a4.5 4.5 0 00-6.4 0l-3 3a4.5 4.5 0 006.4 6.4l1-1"/>',
    star: '<path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15.5" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>',
    phone: '<path d="M5 4h3l2 5-2.5 1.5a11 11 0 005 5L14 13l5 2v3a2 2 0 01-2 2A15 15 0 013 6a2 2 0 012-2z"/>',
    pin: '<path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z"/><circle cx="12" cy="10" r="2.3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>'
  };
  const svg = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[k] || ICONS.link}</svg>`;
  function linkIcon(u, label) { const s = (u + ' ' + label).toLowerCase(); return /instagram/.test(s) ? 'instagram' : /tiktok/.test(s) ? 'tiktok' : /facebook|fb\.com/.test(s) ? 'facebook' : /linkedin/.test(s) ? 'linkedin' : /wa\.me|whatsapp/.test(s) ? 'whatsapp' : /google|g\.page|avis/.test(s) ? 'star' : /calendly|cal\.com|rendez|réserv/.test(s) ? 'cal' : /mailto/.test(s) ? 'mail' : /tel:/.test(s) ? 'phone' : 'link'; }

  function css(d, base) {
    const c = d.colors || {}, pr = HEX(c.primary), ac = HEX(c.accent), so = HEX(c.soft), ink = HEX(c.ink), f = FONT_CSS[d.font] || FONT_CSS.Inter;
    const dark = d.theme === 'Nuit', bg = dark ? '#0A1020' : '#FFFFFF', fg = dark ? '#F6F8FC' : ink, card = dark ? '#121a30' : so, line = dark ? 'rgba(255,255,255,.12)' : 'rgba(10,16,32,.1)';
    const heroBg = d.theme === 'Marque' ? pr : dark ? '#0A1020' : so, heroFg = d.theme === 'Marque' ? onColor(pr) : fg;
    return `@font-face{font-family:Inter;font-weight:500;font-display:swap;src:url(${base}inter-500.woff2) format("woff2")}@font-face{font-family:Inter;font-weight:700;font-display:swap;src:url(${base}inter-700.woff2) format("woff2")}@font-face{font-family:Inter;font-weight:800;font-display:swap;src:url(${base}inter-800.woff2) format("woff2")}${f[0] !== 'Inter' ? `@font-face{font-family:"${f[0]}";font-weight:${f[1]};font-display:swap;src:url(${base}${f[2]}) format("woff2")}` : ''}
*{box-sizing:border-box;margin:0;padding:0}html{-webkit-text-size-adjust:100%}body{font-family:Inter,system-ui,-apple-system,Segoe UI,Roboto,sans-serif;background:${bg};color:${fg};line-height:1.5;font-size:16px}
a{color:inherit}img{display:block;max-width:100%}.T{font-family:"${f[0]}",Georgia,serif;font-weight:${f[1]};letter-spacing:${f[0] === 'Caveat' ? '0' : '-.025em'};line-height:1.05}
.wrap{max-width:560px;margin:0 auto;padding:0 20px}.land .wrap{max-width:980px}
.hero{background:${heroBg};color:${heroFg};position:relative;overflow:hidden}.cover{height:190px;width:100%;object-fit:cover}.land .cover{height:min(56vh,460px)}
.hin{padding-top:26px;padding-bottom:30px;text-align:center}.av{width:104px;height:104px;border-radius:50%;margin:-78px auto 0;border:4px solid ${heroBg};background:#fff;display:grid;place-items:center;overflow:hidden;position:relative;font-weight:800;font-size:34px;color:${pr}}.av img{width:100%;height:100%;object-fit:contain;background:#fff}.nocov .av{margin-top:0}
.kick{font-size:12px;letter-spacing:.14em;text-transform:uppercase;font-weight:700;opacity:.8;margin-top:14px}h1{font-size:clamp(28px,7vw,46px);margin:10px auto 0;max-width:18ch}.sub{margin:12px auto 0;max-width:44ch;opacity:.9}
.land .hin{text-align:left;padding-top:40px;padding-bottom:48px}.land h1{margin-left:0;font-size:clamp(34px,6vw,60px)}.land .sub{margin-left:0;font-size:18px}.land .av{margin:-80px 0 0}
.cta{display:inline-flex;align-items:center;justify-content:center;gap:10px;margin-top:22px;background:${d.theme === 'Marque' ? onColor(pr) : ac};color:${d.theme === 'Marque' ? pr : onColor(ac)};text-decoration:none;font-weight:700;padding:16px 28px;border-radius:999px;font-size:16px;border:0;cursor:pointer;font-family:inherit}.cta svg,.lk svg,.soc svg,.inf svg{width:20px;height:20px;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round}
.links{display:grid;gap:12px;margin-top:22px}.lk{display:flex;align-items:center;gap:12px;padding:16px 18px;border-radius:16px;background:${card};text-decoration:none;font-weight:700;border:1px solid ${line};transition:transform .15s}.lk:active{transform:scale(.98)}.lk span{flex:1;text-align:center;margin-right:20px}
.soc{display:flex;justify-content:center;gap:14px;margin-top:20px}.soc a{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:${card};border:1px solid ${line}}
section{padding:34px 0 0}h2{font-size:24px;margin-bottom:14px}.land section{padding-top:56px}.land h2{font-size:34px}
.svc{display:grid;gap:0}.svc div{display:flex;justify-content:space-between;gap:16px;padding:14px 0;border-bottom:1px solid ${line}}.svc b{white-space:nowrap}.svc small{display:block;opacity:.7;font-size:13px}
.land .svc{grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:14px}.land .svc div{flex-direction:column;background:${card};border:1px solid ${line};border-radius:18px;padding:20px}.land .svc b{font-size:22px}
.gal{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.gal img{width:100%;aspect-ratio:1;object-fit:cover;border-radius:10px}.land .gal{gap:12px}.land .gal img{border-radius:16px;aspect-ratio:4/5}
.rev{display:grid;gap:12px}.land .rev{grid-template-columns:repeat(auto-fill,minmax(280px,1fr))}.rev div{background:${card};border-radius:18px;padding:18px;border:1px solid ${line}}.rev p{font-size:16px}.rev b{display:block;margin-top:10px;font-size:14px;opacity:.8}.stars{color:${ac};letter-spacing:2px;font-size:15px}
.about{font-size:17px;max-width:62ch}.faq details{border-bottom:1px solid ${line};padding:14px 0}.faq summary{font-weight:700;cursor:pointer;list-style:none}.faq summary::after{content:"+";float:right;opacity:.6;display:inline-block;transition:transform .2s}.faq details[open] summary::after{transform:rotate(45deg)}.faq p{margin-top:8px;opacity:.85}
form{display:grid;gap:12px;background:${card};padding:20px;border-radius:20px;border:1px solid ${line}}label{font-size:13px;font-weight:700;display:grid;gap:6px}input,textarea,select{font:inherit;padding:13px 14px;border-radius:12px;border:1px solid ${line};background:${dark ? '#0A1020' : '#fff'};color:${fg};width:100%}textarea{min-height:90px}form .cta{margin-top:4px;width:100%}.row2{display:grid;grid-template-columns:1fr 1fr;gap:12px}.hp{position:absolute;left:-9999px}.ok{padding:16px;border-radius:14px;background:${so};color:${ink};font-weight:600}.err{color:#B42318;font-size:14px}
.inf{display:flex;gap:10px;align-items:flex-start;margin-top:10px;opacity:.85}.inf svg{flex:none;margin-top:2px}
footer{padding:44px 20px 40px;text-align:center;font-size:12px;opacity:.6}footer a{text-decoration:underline;cursor:pointer;background:none;border:0;font:inherit;color:inherit}.cg{white-space:pre-wrap;font-size:13px;text-align:left;max-width:640px;margin:16px auto 0;opacity:.9}
@media(min-width:760px){.land .hin{padding-top:56px;padding-bottom:64px}.land .two{display:grid;grid-template-columns:1.1fr .9fr;gap:40px;align-items:start}}`;
  }
  function body(d, img) {
    const land = d.mode === 'landing', cov = d.cover ? img(d.cover) : '', av = d.avatar ? img(d.avatar) : '';
    const ctaHref = SAFE_URL(d.cta && d.cta.url) || (d.form ? '#contact' : '');
    const links = (d.links || []).map(l => ({ label: l.label, url: SAFE_URL(l.url) })).filter(l => l.url && l.label);
    const socials = [['instagram', d.instagram && 'https://instagram.com/' + String(d.instagram).replace(/^@/, '')], ['tiktok', d.tiktok && 'https://www.tiktok.com/@' + String(d.tiktok).replace(/^@/, '')], ['facebook', SAFE_URL(d.facebook)], ['linkedin', SAFE_URL(d.linkedin)]].filter(x => x[1]);
    const svc = (d.services || []).length ? `<section><div class="wrap"><h2 class="T">Prestations</h2><div class="svc">${d.services.map(s => `<div><span>${E(s.name)}${s.duration ? `<small>${E(s.duration)} min</small>` : ''}</span><b>${E(s.price)} €</b></div>`).join('')}</div></div></section>` : '';
    const gal = land && (d.gallery || []).length ? `<section><div class="wrap"><h2 class="T">En images</h2><div class="gal">${d.gallery.map(g => `<img src="${E(img(g))}" alt="" loading="lazy">`).join('')}</div></div></section>` : (!land && (d.gallery || []).length ? `<section><div class="wrap"><div class="gal">${d.gallery.slice(0, 6).map(g => `<img src="${E(img(g))}" alt="" loading="lazy">`).join('')}</div></div></section>` : '');
    const rev = (d.reviews || []).length ? `<section><div class="wrap"><h2 class="T">Ils en parlent</h2><div class="rev">${d.reviews.map(r => `<div><p class="stars">★★★★★</p><p>${E(r.text)}</p>${r.name ? `<b>${E(r.name)}</b>` : ''}</div>`).join('')}</div></div></section>` : '';
    const about = land && d.about ? `<section><div class="wrap two"><div><h2 class="T">L’histoire</h2><p class="about">${E(d.about)}</p></div>${d.hours || d.city ? `<div>${d.city ? `<p class="inf">${svg('pin')}<span>${E(d.city)}</span></p>` : ''}${d.hours ? `<p class="inf">${svg('clock')}<span style="white-space:pre-line">${E(d.hours)}</span></p>` : ''}</div>` : ''}</div></section>` : '';
    const faq = land && (d.faq || []).length ? `<section><div class="wrap"><h2 class="T">Questions fréquentes</h2><div class="faq">${d.faq.map(f => `<details><summary>${E(f.q)}</summary><p>${E(f.a)}</p></details>`).join('')}</div></div></section>` : '';
    const bk = d.booking && d.booking.on;
    const slots = bk ? (() => { const out = [], [fh, fm] = String(d.booking.from || '09:00').split(':').map(Number), [th, tm] = String(d.booking.to || '18:00').split(':').map(Number), step = Math.max(15, +d.booking.step || 60); for (let t = fh * 60 + fm; t + step <= th * 60 + tm && out.length < 40; t += step) out.push(String(Math.floor(t / 60)).padStart(2, '0') + ':' + String(t % 60).padStart(2, '0')); return out; })() : [];
    const form = d.form ? `<section id="contact"><div class="wrap"><h2 class="T">${bk ? 'Demander un rendez vous' : 'Me contacter'}</h2><form id="lead" data-days="${E((d.booking && d.booking.days || []).join(','))}" novalidate>
      <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
      <label>Votre prénom et nom<input name="name" required maxlength="80" autocomplete="name"></label>
      <label>Téléphone ou email<input name="contact" required maxlength="120" autocomplete="email"></label>
      ${bk ? `<div class="row2"><label>Date souhaitée<input name="date" type="date" required></label><label>Heure<select name="time" required>${slots.map(s => `<option>${s}</option>`).join('')}</select></label></div>` : ''}
      <label>Votre message<textarea name="message" maxlength="1000" placeholder="${bk ? 'La prestation souhaitée, une précision' : 'Votre demande'}"></textarea></label>
      <p class="err" id="lerr" role="alert"></p><button class="cta" type="submit">${bk ? 'Envoyer ma demande' : 'Envoyer'}</button>
      <small style="opacity:.7;font-size:12px">Vos informations servent uniquement à vous recontacter.</small></form></div></section>` : '';
    const top = `<header class="hero ${cov ? '' : 'nocov'}">${cov ? `<img class="cover" src="${E(cov)}" alt="">` : ''}<div class="wrap hin">${av || !land ? `<div class="av">${av ? `<img src="${E(av)}" alt="">` : E(String(d.name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase())}</div>` : ''}
      <p class="kick">${E(d.activity)}${d.city ? ', ' + E(d.city) : ''}</p><h1 class="T">${E(d.headline || d.name)}</h1>${d.sub ? `<p class="sub">${E(d.sub)}</p>` : ''}
      ${ctaHref ? `<a class="cta" href="${E(ctaHref)}" ${/^https?:/.test(ctaHref) ? 'target="_blank" rel="noopener"' : ''}>${d.cta && d.cta.kind === 'whatsapp' ? svg('whatsapp') : d.cta && d.cta.kind === 'phone' ? svg('phone') : ''}${E((d.cta && d.cta.label) || 'Me contacter')}</a>` : ''}</div></header>`;
    const linkBlock = links.length || socials.length ? `<div class="wrap">${links.length ? `<div class="links">${links.map(l => `<a class="lk" href="${E(l.url)}" target="_blank" rel="noopener">${svg(linkIcon(l.url, l.label))}<span>${E(l.label)}</span></a>`).join('')}</div>` : ''}${socials.length ? `<div class="soc">${socials.map(([k, u]) => `<a href="${E(u)}" target="_blank" rel="noopener" aria-label="${k}">${svg(k)}</a>`).join('')}</div>` : ''}</div>` : '';
    const foot = `<footer>${E(d.name)}${d.siret ? ' · SIRET ' + E(d.siret) : ''}${d.cgv ? ' · <button type="button" id="cgvb">Conditions de vente</button>' : ''}<div class="cg" id="cgvt" hidden>${E(d.cgv || '')}</div><p style="margin-top:8px">Page créée avec Anza</p></footer>`;
    return land ? `<div class="land">${top}${linkBlock}${about}${svc}${gal}${rev}${faq}${form}${foot}</div>` : `<div>${top}${linkBlock}${gal}${svc}${rev}${form}${foot}</div>`;
  }
  function doc(d, img, base, script) {
    return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${E(d.name)}</title><meta name="description" content="${E(d.sub || d.headline || '')}"><style>${css(d, base)}</style></head><body>${body(d, img)}${script || ''}</body></html>`;
  }
  G.AnzaPage = { css, body, doc, safeUrl: SAFE_URL };
})(typeof window !== 'undefined' ? window : globalThis);
