const FONTS = {
  Inter: { label: 'Moderne', family: 'Inter', w: 800, css: 'Inter, system-ui, sans-serif' },
  Playfair: { label: 'Élégante', family: 'Playfair Display', w: 700, css: "'Playfair Display', Georgia, serif" },
  Fraunces: { label: 'Éditoriale', family: 'Fraunces', w: 700, css: 'Fraunces, Georgia, serif' },
  DMSerif: { label: 'Classique', family: 'DM Serif Display', w: 400, css: "'DM Serif Display', Georgia, serif" },
  Archivo: { label: 'Affirmée', family: 'Archivo Black', w: 400, css: "'Archivo Black', Impact, sans-serif" },
  Caveat: { label: 'Manuscrite', family: 'Caveat', w: 700, css: 'Caveat, cursive' }
};
let FONT_SEL = '';
function fontOf(k) { return FONTS[k] || FONTS[FONT_SEL] || FONTS[st.brand.font] || FONTS.Inter; }
function fontFam(k) { return fontOf(k).css; }
function titleFont(px) { const f = fontOf(); return `${f.w} ${Math.round(f.family === 'Caveat' ? px * 1.18 : px)}px ${f.css}`; }
async function ensureFonts() {
  if (!document.fonts || !document.fonts.load) return;
  const f = fontOf();
  try { await Promise.all([document.fonts.load(`${f.w} 80px "${f.family}"`), document.fonts.load('500 40px Inter'), document.fonts.load('700 40px Inter'), document.fonts.load('800 40px Inter')]); } catch (e) {}
}

const STYLES = [['Bleu', 'Marque'], ['Nuit', 'Nuit'], ['Clair', 'Clair'], ['Doux', 'Doux']];
function palette(style) {
  const b = st.brand;
  if (style === 'Nuit') return { bg: '#0A1020', fg: '#F6F8FC', cb: b.accent, cf: readableOn(b.accent), k: '#9FB8FF' };
  if (style === 'Clair') return { bg: '#F6F8FC', fg: b.ink, cb: b.primary, cf: readableOn(b.primary), k: b.accent };
  if (style === 'Doux') return { bg: b.soft, fg: b.ink, cb: b.accent, cf: readableOn(b.accent), k: b.primary };
  return { bg: b.primary, fg: readableOn(b.primary), cb: '#FFFFFF', cf: b.primary, k: readableOn(b.primary) === '#FFFFFF' ? 'rgba(255,255,255,.75)' : b.ink };
}
const LAYOUTS = [['texte', 'Texte seul'], ['photo', 'Photo plein cadre'], ['cadre', 'Photo encadrée'], ['moitie', 'Photo en haut']];

function roundRect(x, a, b, w, h, r) { r = Math.min(r, w / 2, h / 2); x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
function wrapLines(ctx, text, maxW) {
  const out = [];
  String(text).split('\n').forEach(par => {
    let line = '';
    par.split(' ').forEach(w => { const t = line ? line + ' ' + w : w; if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t; });
    out.push(line);
  });
  return out;
}
function drawCover(x, img, dx, dy, dw, dh, pos) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height;
  const s = Math.max(dw / iw, dh / ih), sw = dw / s, sh = dh / s;
  const sx = (iw - sw) / 2, sy = pos === 'top' ? 0 : pos === 'bottom' ? ih - sh : (ih - sh) / 2;
  x.drawImage(img, sx, Math.max(0, sy), sw, sh, dx, dy, dw, dh);
}
function drawContain(x, img, dx, dy, dw, dh) {
  const iw = img.naturalWidth || img.width, ih = img.naturalHeight || img.height, s = Math.min(dw / iw, dh / ih);
  x.drawImage(img, dx + (dw - iw * s) / 2, dy + (dh - ih * s) / 2, iw * s, ih * s);
}
function fitTitle(x, text, maxW, maxH, start, min, lineK) {
  let px = start, lines;
  for (; px >= min; px -= 4) { x.font = titleFont(px); lines = wrapLines(x, text, maxW); if (lines.length * px * lineK <= maxH && lines.length <= 7) break; }
  return { px: Math.max(px, min), lines };
}

function drawCard(f, i, n, o) {
  const W = o.W, H = o.H, story = o.kind === 'story', cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d'); x.textBaseline = 'alphabetic';
  const style = f.style || (o.kind === 'slide' && i > 0 && o.alt ? (i % 2 ? 'Clair' : o.style) : o.style);
  const c = palette(style), img = o.imgs && o.imgs[i], lay = img ? (f.lay && f.lay !== 'texte' ? f.lay : 'photo') : 'texte';
  const pad = Math.round(W * .074);
  x.fillStyle = c.bg; x.fillRect(0, 0, W, H);
  let fg = c.fg, areaTop = story ? 260 : 210, areaBot = H - (story ? 200 : 150);
  if (lay === 'photo') {
    drawCover(x, img, 0, 0, W, H, f.pos);
    const g = x.createLinearGradient(0, H * .3, 0, H); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(.55, 'rgba(0,0,0,.45)'); g.addColorStop(1, 'rgba(0,0,0,.78)');
    x.fillStyle = g; x.fillRect(0, 0, W, H);
    const g2 = x.createLinearGradient(0, 0, 0, 320); g2.addColorStop(0, 'rgba(0,0,0,.35)'); g2.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g2; x.fillRect(0, 0, W, 320);
    if (o.dim > 0) { x.fillStyle = `rgba(0,0,0,${Math.min(.8, o.dim)})`; x.fillRect(0, 0, W, H); }
    fg = '#FFFFFF'; areaTop = H * .42;
  } else if (lay === 'cadre') {
    const top = story ? 230 : 170, h = Math.round(H * (story ? .5 : .46));
    x.save(); roundRect(x, pad, top, W - pad * 2, h, 34); x.clip(); drawCover(x, img, pad, top, W - pad * 2, h, f.pos); x.restore();
    areaTop = top + h + 50;
  } else if (lay === 'moitie') {
    const h = Math.round(H * .52);
    drawCover(x, img, 0, 0, W, h, f.pos);
    areaTop = h + 60;
  }
  x.fillStyle = fg;
  if (story) {
    const gap = 10, bw = (W - 120 - gap * (n - 1)) / n;
    for (let k = 0; k < n; k++) { x.globalAlpha = k <= i ? 1 : .35; x.fillStyle = lay === 'moitie' ? '#FFFFFF' : fg; x.fillRect(60, 70, bw, 8); }
    x.globalAlpha = 1; const hc = lay === 'moitie' ? '#FFFFFF' : fg; x.fillStyle = hc;
    if (o.logoImg) { x.save(); x.beginPath(); x.arc(92, 150, 32, 0, Math.PI * 2); x.fillStyle = '#FFFFFF'; x.fill(); x.clip(); drawContain(x, o.logoImg, 64, 122, 56, 56); x.restore(); }
    else { x.beginPath(); x.arc(92, 150, 30, 0, Math.PI * 2); x.fill(); }
    x.fillStyle = hc; x.font = '600 34px Inter, sans-serif'; if (lay === 'moitie' || lay === 'photo') { x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 12; } x.fillText(o.handle || '', 140, 162); x.shadowBlur = 0;
  } else {
    const kc = lay === 'photo' ? 'rgba(255,255,255,.85)' : lay === 'moitie' ? '#FFFFFF' : c.k;
    x.fillStyle = kc; x.font = '700 32px Inter, sans-serif';
    if (lay === 'moitie' || lay === 'photo') { x.shadowColor = 'rgba(0,0,0,.4)'; x.shadowBlur = 14; }
    if (f.k) x.fillText(String(f.k).toUpperCase().slice(0, 40), pad, 120);
    x.textAlign = 'right'; x.font = '600 28px Inter, sans-serif'; x.globalAlpha = .8; x.fillText(`${i + 1} / ${n}`, W - pad, 120); x.textAlign = 'left'; x.globalAlpha = 1; x.shadowBlur = 0;
    if (o.logoImg && i === 0 && lay !== 'moitie') { drawContain(x, o.logoImg, W - pad - 96, H - 130, 96, 80); areaBot = H - 170; }
  }
  if (o.logoImg && story && lay !== 'photo' && lay !== 'moitie' && i === n - 1) drawContain(x, o.logoImg, W / 2 - 60, areaTop - 20, 120, 100);
  const maxW = W - pad * 2, subTxt = story ? f.s : f.p, cta = story ? f.c : '';
  const subPx = story ? 46 : 40, subLh = story ? 62 : 56;
  x.font = `500 ${subPx}px Inter, sans-serif`; const sub = subTxt ? wrapLines(x, subTxt, maxW) : [];
  const ctaH = cta ? 170 : 0, subH = sub.length * subLh + (sub.length ? 34 : 0);
  const room = Math.max(160, areaBot - areaTop - subH - ctaH);
  const T = fitTitle(x, f.t || '', maxW, room, story ? 104 : (n === 1 ? 104 : 92), story ? 58 : 52, 1.06);
  const lh = T.px * 1.06;
  let y = areaBot - ctaH - subH - T.lines.length * lh;
  if (lay === 'texte') y = Math.max(y, areaTop);
  x.fillStyle = o.ink || fg; if (lay === 'photo') { x.shadowColor = 'rgba(0,0,0,.35)'; x.shadowBlur = 18; }
  x.font = titleFont(T.px); T.lines.forEach(l => { y += lh; x.fillText(l, pad, y - lh * .18); });
  x.font = `500 ${subPx}px Inter, sans-serif`; x.globalAlpha = .92; y += sub.length ? 22 : 0; sub.forEach(l => { y += subLh; x.fillText(l, pad, y); });
  x.globalAlpha = 1; x.shadowBlur = 0;
  if (cta) { const by = H - 300; x.fillStyle = lay === 'photo' ? st.brand.accent : c.cb; roundRect(x, pad, by, W - pad * 2, 124, 62); x.fill(); x.fillStyle = lay === 'photo' ? readableOn(st.brand.accent) : c.cf; x.font = '700 46px Inter, sans-serif'; x.textAlign = 'center'; x.fillText(String(cta).slice(0, 34), W / 2, by + 78); x.textAlign = 'left'; }
  return cv.toDataURL('image/png');
}
async function renderSet(items, o) {
  FONT_SEL = FONTS[o.font] ? o.font : '';
  const ef = ensureFonts(); FONT_SEL = ''; await ef;
  const logoImg = st.brand.logoOn && st.brand.logo ? await mediaImage(st.brand.logo) : null;
  const imgs = await Promise.all(items.map(f => f.img ? mediaImage(f.img) : null));
  FONT_SEL = FONTS[o.font] ? o.font : '';
  try { return items.map((f, i) => drawCard(f, i, items.length, Object.assign({}, o, { imgs, logoImg }))); } finally { FONT_SEL = ''; }
}
function previewStyle(f, i, n, o) {
  const style = f.style || (o.kind === 'slide' && i > 0 && o.alt ? (i % 2 ? 'Clair' : o.style) : o.style);
  return palette(style);
}

function parseIcon(name) {
  const src = ICON[name] || ''; const els = [];
  src.replace(/<(path|circle|rect)([^>]*)\/>/g, (m, tag, attrs) => { const a = {}; attrs.replace(/(\w+)="([^"]*)"/g, (q, k, v) => { a[k] = v; }); els.push({ tag, a }); });
  return els;
}
function drawIcon(x, name, cx, cy, size, color, lw) {
  const s = size / 24; x.save(); x.translate(cx - size / 2, cy - size / 2); x.scale(s, s);
  x.strokeStyle = color; x.lineWidth = lw || 1.7; x.lineCap = 'round'; x.lineJoin = 'round'; x.fillStyle = 'transparent';
  parseIcon(name).forEach(({ tag, a }) => {
    if (tag === 'path') x.stroke(new Path2D(a.d));
    else if (tag === 'circle') { x.beginPath(); x.arc(+a.cx, +a.cy, +a.r, 0, Math.PI * 2); x.stroke(); }
    else if (tag === 'rect') { roundRect(x, +a.x, +a.y, +a.width, +a.height, +(a.rx || 0)); x.stroke(); }
  });
  x.restore();
}
function qrDraw(x, text, px, py, size, dark, light) {
  if (typeof qrcode !== 'function' || !text) return;
  const q = qrcode(0, 'M'); q.addData(text); q.make();
  const n = q.getModuleCount(), quiet = 2, cell = size / (n + quiet * 2);
  x.fillStyle = light || '#FFFFFF'; x.fillRect(px, py, size, size); x.fillStyle = dark || '#0A1020';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) x.fillRect(Math.floor(px + (c + quiet) * cell), Math.floor(py + (r + quiet) * cell), Math.ceil(cell), Math.ceil(cell));
}
function canvasOf(W, H) { const cv = document.createElement('canvas'); cv.width = W; cv.height = H; return [cv, cv.getContext('2d')]; }

const HIGHLIGHTS = [['star', 'Avis'], ['coin', 'Tarifs'], ['eye', 'Coulisses'], ['cal', 'Réserver'], ['msg', 'Infos'], ['image', 'Avant après']];
async function kitHighlights(style) {
  await ensureFonts();
  const b = st.brand, bg = style === 'clair' ? b.soft : style === 'nuit' ? '#0A1020' : b.primary, ring = style === 'clair' ? '#FFFFFF' : 'rgba(255,255,255,.12)', ink = style === 'clair' ? b.primary : '#FFFFFF';
  return HIGHLIGHTS.map(([icon, label]) => {
    const [cv, x] = canvasOf(1080, 1920);
    x.fillStyle = bg; x.fillRect(0, 0, 1080, 1920);
    x.fillStyle = ring; x.beginPath(); x.arc(540, 960, 330, 0, Math.PI * 2); x.fill();
    drawIcon(x, icon, 540, 960, 300, ink, 1.4);
    x.fillStyle = ink; x.globalAlpha = .7; x.font = '600 44px Inter, sans-serif'; x.textAlign = 'center'; x.fillText(label.toUpperCase(), 540, 1420); x.globalAlpha = 1;
    return { name: 'couverture-' + slug(label), data: cv.toDataURL('image/png') };
  });
}
async function kitBanner(kind) {
  await ensureFonts();
  const b = st.brand, p = P(), logo = b.logo ? await mediaImage(b.logo) : null;
  const photoId = (st.page.cover || (st.media.find(m => m.kind === 'photo') || {}).id), photo = photoId ? await mediaImage(photoId) : null;
  const dims = kind === 'facebook' ? [1640, 624] : [1584, 396];
  const [W, H] = dims, [cv, x] = canvasOf(W, H);
  x.fillStyle = b.primary; x.fillRect(0, 0, W, H);
  if (photo) { const pw = Math.round(W * .38); drawCover(x, photo, W - pw, 0, pw, H, 'center'); const g = x.createLinearGradient(W - pw, 0, W - pw + 220, 0); g.addColorStop(0, b.primary); g.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = g; x.fillRect(W - pw, 0, 220, H); }
  const left = kind === 'facebook' ? 120 : 470, fg = readableOn(b.primary);
  x.fillStyle = fg; x.font = titleFont(kind === 'facebook' ? 78 : 58);
  const lines = wrapLines(x, uc(dot(p.value)), W * (photo ? .5 : .62) - (kind === 'facebook' ? 0 : 100)).slice(0, 2);
  let y = H / 2 - (lines.length - 1) * (kind === 'facebook' ? 42 : 32);
  lines.forEach(l => { x.fillText(l, left, y); y += kind === 'facebook' ? 84 : 64; });
  x.globalAlpha = .82; x.font = `600 ${kind === 'facebook' ? 34 : 26}px Inter, sans-serif`; x.fillText(`${uc(p.activity)}${st.profile.city ? ' · ' + st.profile.city : ''}`, left, y + 6); x.globalAlpha = 1;
  if (logo) drawContain(x, logo, W - (photo ? Math.round(W * .38) : 0) - 150, 36, 110, 80);
  return [{ name: kind === 'facebook' ? 'couverture-facebook' : 'banniere-linkedin', data: cv.toDataURL('image/png') }];
}
async function kitCard() {
  await ensureFonts();
  const b = st.brand, p = P(), pr = st.profile, logo = b.logo ? await mediaImage(b.logo) : null, link = pageLink();
  const [cv, x] = canvasOf(1050, 600), [cv2, y] = canvasOf(1050, 600);
  x.fillStyle = b.primary; x.fillRect(0, 0, 1050, 600);
  if (logo) drawContain(x, logo, 425, 120, 200, 200);
  x.fillStyle = readableOn(b.primary); x.textAlign = 'center'; x.font = titleFont(64); x.fillText(p.business, 525, logo ? 410 : 300);
  x.globalAlpha = .8; x.font = '600 30px Inter, sans-serif'; x.fillText(uc(p.activity), 525, logo ? 460 : 360); x.globalAlpha = 1;
  y.fillStyle = '#FFFFFF'; y.fillRect(0, 0, 1050, 600); y.fillStyle = b.accent; y.fillRect(0, 0, 16, 600);
  y.fillStyle = b.ink; y.font = titleFont(52); y.fillText(pr.name || pr.first || p.business, 80, 150);
  y.fillStyle = b.primary; y.font = '600 28px Inter, sans-serif'; y.fillText(uc(p.activity), 80, 200);
  y.fillStyle = b.ink; y.font = '500 28px Inter, sans-serif';
  [pr.phone, pr.email, pr.instagram ? '@' + pr.instagram : '', pr.city].filter(Boolean).slice(0, 4).forEach((t, k) => y.fillText(t, 80, 300 + k * 48));
  if (link) { qrDraw(y, link, 760, 300, 210, b.ink, '#FFFFFF'); y.font = '600 20px Inter, sans-serif'; y.textAlign = 'center'; y.fillText('Scannez pour réserver', 865, 535); y.textAlign = 'left'; }
  return [{ name: 'carte-de-visite-recto', data: cv.toDataURL('image/png') }, { name: 'carte-de-visite-verso', data: cv2.toDataURL('image/png') }];
}
async function kitReview(text, who) {
  await ensureFonts();
  const b = st.brand, logo = b.logo ? await mediaImage(b.logo) : null, [cv, x] = canvasOf(1080, 1920);
  x.fillStyle = b.soft; x.fillRect(0, 0, 1080, 1920);
  x.fillStyle = b.primary; x.font = titleFont(320); x.fillText('“', 70, 560);
  x.fillStyle = b.accent; x.font = '700 64px Inter, sans-serif'; x.fillText('★★★★★', 90, 640);
  const T = fitTitle(x, text || 'Collez ici l’avis de votre client.', 900, 820, 84, 48, 1.18);
  x.fillStyle = b.ink; x.font = titleFont(T.px); let yy = 760; T.lines.forEach(l => { x.fillText(l, 90, yy); yy += T.px * 1.18; });
  x.fillStyle = b.primary; x.font = '700 44px Inter, sans-serif'; x.fillText(who ? who : 'Prénom du client', 90, yy + 60);
  if (logo) drawContain(x, logo, 90, 1640, 180, 120); else { x.fillStyle = b.ink; x.font = '700 36px Inter, sans-serif'; x.fillText(P().business, 90, 1720); }
  x.fillStyle = b.primary; roundRect(x, 90, 1480, 900, 110, 55); x.fill(); x.fillStyle = readableOn(b.primary); x.textAlign = 'center'; x.font = '700 40px Inter, sans-serif'; x.fillText(String(st.profile.cta || 'Réserver').slice(0, 30), 540, 1550); x.textAlign = 'left';
  return [{ name: 'story-avis', data: cv.toDataURL('image/png') }];
}
async function kitFlyer() {
  await ensureFonts();
  const b = st.brand, p = P(), pr = st.profile, link = pageLink(), [cv, x] = canvasOf(1748, 2480);
  const photoId = st.page.cover || (st.media.find(m => m.kind === 'photo') || {}).id, photo = photoId ? await mediaImage(photoId) : null, logo = b.logo ? await mediaImage(b.logo) : null;
  x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 1748, 2480);
  if (photo) drawCover(x, photo, 0, 0, 1748, 1100, 'center'); else { x.fillStyle = b.primary; x.fillRect(0, 0, 1748, 1100); }
  if (logo) { x.fillStyle = '#FFFFFF'; roundRect(x, 120, 120, 300, 200, 30); x.fill(); drawContain(x, logo, 140, 140, 260, 160); }
  x.fillStyle = b.ink; const T = fitTitle(x, uc(dot(p.value)), 1500, 420, 130, 70, 1.08); x.font = titleFont(T.px); let yy = 1280; T.lines.forEach(l => { x.fillText(l, 120, yy); yy += T.px * 1.08; });
  x.fillStyle = b.primary; x.font = '600 52px Inter, sans-serif'; x.fillText(`${uc(p.activity)}${pr.city ? ' · ' + pr.city : ''}`, 120, yy + 30);
  x.fillStyle = b.ink; x.font = '500 46px Inter, sans-serif'; st.services.slice(0, 4).forEach((s, k) => { x.fillText(s.name, 120, yy + 160 + k * 76); x.textAlign = 'right'; x.fillText(eur(s.price), 1240, yy + 160 + k * 76); x.textAlign = 'left'; });
  if (link) { qrDraw(x, link, 1300, 1900, 340, b.ink, '#FFFFFF'); x.font = '600 34px Inter, sans-serif'; x.textAlign = 'center'; x.fillText('Réservez ici', 1470, 2290); x.textAlign = 'left'; }
  x.fillStyle = b.primary; x.fillRect(0, 2380, 1748, 100); x.fillStyle = readableOn(b.primary); x.font = '600 40px Inter, sans-serif'; x.fillText([pr.phone, pr.instagram ? '@' + pr.instagram : '', pr.email].filter(Boolean).join('   ·   '), 120, 2445);
  return [{ name: 'flyer-a5', data: cv.toDataURL('image/png') }];
}
async function kitQr() {
  const link = pageLink(); if (!link) return [];
  const [cv, x] = canvasOf(1200, 1200); qrDraw(x, link, 0, 0, 1200, st.brand.ink, '#FFFFFF');
  return [{ name: 'qr-code-ma-page', data: cv.toDataURL('image/png') }];
}
