const MEDIA_DB = 'anza-media', MEDIA_STORE = 'blobs', MEDIA_BUCKET = 'media', PAGE_BUCKET = 'pages';
let mediaDbP = null;
const mediaUrls = new Map(), mediaImgs = new Map(), mediaPending = new Map();

function mediaDb() {
  if (!mediaDbP) mediaDbP = new Promise((ok, ko) => {
    try {
      const r = indexedDB.open(MEDIA_DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(MEDIA_STORE);
      r.onsuccess = () => ok(r.result);
      r.onerror = () => ko(r.error);
    } catch (e) { ko(e); }
  });
  return mediaDbP;
}
async function idb(mode, fn) {
  const db = await mediaDb();
  return new Promise((ok, ko) => { const tx = db.transaction(MEDIA_STORE, mode); const r = fn(tx.objectStore(MEDIA_STORE)); tx.oncomplete = () => ok(r && r.result); tx.onerror = () => ko(tx.error); tx.onabort = () => ko(tx.error); });
}
const idbGet = k => idb('readonly', s => s.get(k));
const idbPut = (k, v) => idb('readwrite', s => s.put(v, k));
const idbDel = k => idb('readwrite', s => s.delete(k));

function mediaOwner() { return ONLINE && user ? user.id : 'local'; }
function mediaKey(id) { return mediaOwner() + '/' + id; }
function mediaMeta(id) { return st && st.media.find(m => m.id === id); }
function mediaPath(m) { return user.id + '/' + m.id + '.' + m.ext; }

async function mediaBlob(id) {
  let b = null;
  try { b = await idbGet(mediaKey(id)); } catch (e) {}
  if (b) return b;
  const m = mediaMeta(id);
  if (ONLINE && user && m && navigator.onLine) {
    const { data, error } = await sb.storage.from(MEDIA_BUCKET).download(mediaPath(m));
    if (!error && data) { try { await idbPut(mediaKey(id), data); } catch (e) {} return data; }
  }
  return null;
}
function mediaURL(id) {
  if (!id) return Promise.resolve('');
  if (mediaUrls.has(id)) return Promise.resolve(mediaUrls.get(id));
  if (mediaPending.has(id)) return mediaPending.get(id);
  const p = mediaBlob(id).then(b => { mediaPending.delete(id); if (!b) return ''; const u = URL.createObjectURL(b); mediaUrls.set(id, u); return u; }).catch(() => { mediaPending.delete(id); return ''; });
  mediaPending.set(id, p);
  return p;
}
function mediaImage(id) {
  if (!id) return Promise.resolve(null);
  if (mediaImgs.has(id)) return Promise.resolve(mediaImgs.get(id));
  return mediaURL(id).then(u => !u ? null : new Promise(ok => { const im = new Image(); im.onload = () => { mediaImgs.set(id, im); ok(im); }; im.onerror = () => ok(null); im.src = u; }));
}
function hydrateMedia(root) {
  $$('img[data-media]', root || document).forEach(img => {
    const id = img.dataset.media; if (!id || img.dataset.done === id) return;
    img.dataset.done = id;
    const cached = mediaUrls.get(id);
    if (cached) { img.src = cached; return; }
    img.classList.add('ld');
    mediaURL(id).then(u => { if (img.dataset.media !== id) return; if (u) { img.src = u; img.classList.remove('ld'); } else img.classList.add('miss'); });
  });
}

async function readImage(file) {
  try { return await createImageBitmap(file, { imageOrientation: 'from-image' }); } catch (e) {}
  return new Promise((ok, ko) => { const u = URL.createObjectURL(file), im = new Image(); im.onload = () => { ok(im); setTimeout(() => URL.revokeObjectURL(u), 1000); }; im.onerror = () => { URL.revokeObjectURL(u); ko(new Error('format')); }; im.src = u; });
}
function hasAlpha(cv) {
  const x = cv.getContext('2d'), w = Math.min(cv.width, 64), h = Math.min(cv.height, 64);
  const t = document.createElement('canvas'); t.width = w; t.height = h; const tx = t.getContext('2d'); tx.drawImage(cv, 0, 0, w, h);
  const d = tx.getImageData(0, 0, w, h).data; for (let i = 3; i < d.length; i += 4) if (d[i] < 250) return true; return false;
}
async function compressImage(file, kind) {
  if (file.size > 25 * 1024 * 1024) throw new Error('size');
  const src = await readImage(file);
  const max = kind === 'logo' ? 1000 : 2000, sw = src.width, sh = src.height;
  if (!sw || !sh) throw new Error('format');
  const s = Math.min(1, max / Math.max(sw, sh)), w = Math.round(sw * s), h = Math.round(sh * s);
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const x = cv.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(src, 0, 0, w, h);
  if (src.close) src.close();
  const png = (kind === 'logo' || /png|webp|gif/.test(file.type)) && hasAlpha(cv);
  let blob = await new Promise(r => cv.toBlob(r, png ? 'image/png' : 'image/jpeg', 0.86));
  if (!blob) throw new Error('format');
  if (!png && blob.size > 1.6 * 1024 * 1024) blob = await new Promise(r => cv.toBlob(r, 'image/jpeg', 0.74));
  return { blob, w, h, ext: png ? 'png' : 'jpg' };
}

async function mediaUpload(m, blob) {
  if (!(ONLINE && user) || !navigator.onLine) return false;
  const { error } = await sb.storage.from(MEDIA_BUCKET).upload(mediaPath(m), blob, { contentType: m.ext === 'png' ? 'image/png' : 'image/jpeg', upsert: true, cacheControl: '31536000' });
  return !error;
}
async function mediaSyncPending() {
  if (!(ONLINE && user && st) || !navigator.onLine) return;
  for (const m of st.media.filter(x => !x.up)) {
    let b = null; try { b = await idbGet(mediaKey(m.id)); } catch (e) {}
    if (b && await mediaUpload(m, b)) { m.up = true; save(); }
  }
}

async function addMediaFiles(files, kind) {
  const list = [...files].filter(f => /^image\//.test(f.type) || /\.(heic|heif|jpe?g|png|webp)$/i.test(f.name));
  if (!list.length) { toast('Choisissez des photos (JPG, PNG ou HEIC)'); return []; }
  const room = photoLimit() - st.media.length;
  if (room <= 0) { toast(`Photothèque pleine : ${photoLimit()} photos dans votre formule. Supprimez en quelques unes.`); return []; }
  const take = list.slice(0, room), out = [];
  let fail = 0;
  for (const f of take) {
    try {
      const c = await compressImage(f, kind);
      const m = { id: uid(), name: String(f.name || 'photo').replace(/\.[^.]+$/, '').slice(0, 80), w: c.w, h: c.h, ext: c.ext, kind: kind === 'logo' ? 'logo' : 'photo', at: iso(Date.now()), tags: [], up: false };
      try { await idbPut(mediaKey(m.id), c.blob); } catch (e) {}
      mediaUrls.set(m.id, URL.createObjectURL(c.blob));
      m.up = await mediaUpload(m, c.blob).catch(() => false);
      if (!m.up && ONLINE && user && navigator.onLine) { fail++; mediaUrls.delete(m.id); try { await idbDel(mediaKey(m.id)); } catch (e) {} continue; }
      st.media.unshift(m); out.push(m);
    } catch (e) { fail++; }
  }
  if (out.length) save();
  if (list.length > take.length) toast(`${take.length} photo${take.length > 1 ? 's' : ''} ajoutée${take.length > 1 ? 's' : ''}, limite de ${photoLimit()} atteinte`);
  else if (fail) toast(out.length ? `${out.length} ajoutée${out.length > 1 ? 's' : ''}, ${fail} non reconnue${fail > 1 ? 's' : ''}` : 'Ces fichiers n’ont pas pu être importés. Essayez en JPG ou PNG.');
  else if (out.length) toast(out.length > 1 ? `${out.length} photos ajoutées` : 'Photo ajoutée');
  return out;
}

function mediaUses(id) {
  const n = [];
  if (st.brand.logo === id) n.push('logo');
  const p = st.page; if (p.cover === id || p.avatar === id || p.gallery.includes(id)) n.push('page');
  const d = st.drafts || {};
  if ((d.story && (d.story.frames || []).some(f => f.img === id)) || (d.post && (d.post.slides || []).some(f => f.img === id))) n.push('studio');
  return n;
}
async function removeMedia(ids) {
  ids = [].concat(ids);
  const metas = ids.map(mediaMeta).filter(Boolean);
  if (ONLINE && user && metas.some(m => m.up)) {
    const { error } = await sb.storage.from(MEDIA_BUCKET).remove(metas.filter(m => m.up).map(mediaPath));
    if (error) throw error;
  }
  for (const id of ids) { try { await idbDel(mediaKey(id)); } catch (e) {} const u = mediaUrls.get(id); if (u) URL.revokeObjectURL(u); mediaUrls.delete(id); mediaImgs.delete(id); }
  st.media = st.media.filter(m => !ids.includes(m.id));
  if (ids.includes(st.brand.logo)) st.brand.logo = '';
  const p = st.page; if (ids.includes(p.cover)) p.cover = ''; if (ids.includes(p.avatar)) p.avatar = ''; p.gallery = p.gallery.filter(x => !ids.includes(x));
  const d = st.drafts || {};
  if (d.story) (d.story.frames || []).forEach(f => { if (ids.includes(f.img)) f.img = ''; });
  if (d.post) (d.post.slides || []).forEach(f => { if (ids.includes(f.img)) f.img = ''; });
  save();
}
async function removeAllMediaRemote() {
  if (!(ONLINE && user)) return;
  for (const b of [MEDIA_BUCKET, PAGE_BUCKET]) {
    for (let i = 0; i < 20; i++) {
      const { data } = await sb.storage.from(b).list(user.id, { limit: 100 });
      if (!data || !data.length) break;
      const { error } = await sb.storage.from(b).remove(data.map(f => user.id + '/' + f.name));
      if (error) break;
    }
  }
}
async function clearLocalMedia() {
  mediaUrls.forEach(u => URL.revokeObjectURL(u)); mediaUrls.clear(); mediaImgs.clear();
  try { const db = await mediaDb(); await new Promise(ok => { const tx = db.transaction(MEDIA_STORE, 'readwrite'); const s = tx.objectStore(MEDIA_STORE); const r = s.openCursor(); const pre = mediaOwner() + '/'; r.onsuccess = () => { const c = r.result; if (!c) return; if (String(c.key).startsWith(pre)) c.delete(); c.continue(); }; tx.oncomplete = ok; tx.onerror = ok; }); } catch (e) {}
}

function rgb2hsl(r, g, b) { r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b); let h = 0, s = 0; const l = (mx + mn) / 2; if (mx !== mn) { const d = mx - mn; s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn); h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h /= 6; } return [h, s, l]; }
function hsl2hex(h, s, l) { const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); const c = l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, '0'); }; return '#' + f(0) + f(8) + f(4); }
function hex2rgb(h) { h = String(h).replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
function lum(hex) { const c = hex2rgb(hex).map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
function contrast(a, b) { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); }
function readableOn(bg) { return contrast(bg, '#FFFFFF') >= contrast(bg, '#0A1020') ? '#FFFFFF' : '#0A1020'; }

async function extractColors(ids) {
  const buckets = new Map();
  for (const id of ids.slice(0, 4)) {
    const im = await mediaImage(id); if (!im) continue;
    const cv = document.createElement('canvas'), n = 72; cv.width = n; cv.height = n;
    const x = cv.getContext('2d', { willReadFrequently: true }); x.drawImage(im, 0, 0, n, n);
    const d = x.getImageData(0, 0, n, n).data;
    for (let i = 0; i < d.length; i += 4) {
      if (d[i + 3] < 200) continue;
      const k = (d[i] >> 4) << 8 | (d[i + 1] >> 4) << 4 | (d[i + 2] >> 4);
      const b = buckets.get(k) || { n: 0, r: 0, g: 0, b: 0 }; b.n++; b.r += d[i]; b.g += d[i + 1]; b.b += d[i + 2]; buckets.set(k, b);
    }
  }
  const cols = [...buckets.values()].map(b => ({ n: b.n, rgb: [b.r / b.n, b.g / b.n, b.b / b.n] })).sort((a, b) => b.n - a.n);
  const out = [];
  cols.forEach(c => { if (out.length >= 8) return; const near = out.find(o => Math.hypot(o.rgb[0] - c.rgb[0], o.rgb[1] - c.rgb[1], o.rgb[2] - c.rgb[2]) < 48); if (near) near.n += c.n; else out.push({ n: c.n, rgb: c.rgb }); });
  return out.map(c => { const [h, s, l] = rgb2hsl(...c.rgb); return { n: c.n, h, s, l, hex: hsl2hex(h, s, l) }; });
}
function suggestBrand(cols) {
  if (!cols.length) return null;
  const chroma = cols.filter(c => c.s > .22 && c.l > .12 && c.l < .82);
  const main = (chroma.length ? chroma : cols).slice().sort((a, b) => b.n * (b.s + .2) - a.n * (a.s + .2))[0];
  const others = chroma.filter(c => c !== main && Math.abs(c.h - main.h) > .06);
  const acc = others.sort((a, b) => b.s * Math.sqrt(b.n) - a.s * Math.sqrt(a.n))[0] || { h: main.h, s: Math.min(1, main.s + .15), l: Math.min(.62, main.l + .16) };
  let pl = Math.min(main.l, .42), primary = hsl2hex(main.h, Math.max(main.s, .3), pl);
  while (contrast(primary, '#FFFFFF') < 4.5 && pl > .08) { pl -= .03; primary = hsl2hex(main.h, Math.max(main.s, .3), pl); }
  let al = Math.max(.38, Math.min(acc.l, .6)), accent = hsl2hex(acc.h, Math.max(acc.s, .45), al);
  while (contrast(accent, '#FFFFFF') < 3 && al > .2) { al -= .03; accent = hsl2hex(acc.h, Math.max(acc.s, .45), al); }
  return { primary, accent, soft: hsl2hex(main.h, Math.min(.5, main.s), .95), ink: hsl2hex(main.h, Math.min(.45, main.s), .09) };
}

function dataToBytes(d) { const b = atob(d.split(',')[1]); const u = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) u[i] = b.charCodeAt(i); return u; }
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
function crc32(u) { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; }
function makeZip(files) {
  const enc = new TextEncoder(), parts = [], cent = []; let off = 0;
  const now = new Date(), dt = ((now.getHours() << 11) | (now.getMinutes() << 5) | (now.getSeconds() >> 1)) & 0xFFFF, dd = (((now.getFullYear() - 1980) << 9) | ((now.getMonth() + 1) << 5) | now.getDate()) & 0xFFFF;
  files.forEach(f => {
    const name = enc.encode(f.name), data = f.data, crc = crc32(data);
    const h = new DataView(new ArrayBuffer(30)); h.setUint32(0, 0x04034b50, true); h.setUint16(4, 20, true); h.setUint16(6, 0x0800, true); h.setUint16(8, 0, true); h.setUint16(10, dt, true); h.setUint16(12, dd, true); h.setUint32(14, crc, true); h.setUint32(18, data.length, true); h.setUint32(22, data.length, true); h.setUint16(26, name.length, true); h.setUint16(28, 0, true);
    parts.push(new Uint8Array(h.buffer), name, data);
    const c = new DataView(new ArrayBuffer(46)); c.setUint32(0, 0x02014b50, true); c.setUint16(4, 20, true); c.setUint16(6, 20, true); c.setUint16(8, 0x0800, true); c.setUint16(10, 0, true); c.setUint16(12, dt, true); c.setUint16(14, dd, true); c.setUint32(16, crc, true); c.setUint32(20, data.length, true); c.setUint32(24, data.length, true); c.setUint16(28, name.length, true); c.setUint32(42, off, true);
    cent.push(new Uint8Array(c.buffer), name);
    off += 30 + name.length + data.length;
  });
  const size = cent.reduce((a, p) => a + p.length, 0);
  const e = new DataView(new ArrayBuffer(22)); e.setUint32(0, 0x06054b50, true); e.setUint16(8, files.length, true); e.setUint16(10, files.length, true); e.setUint32(12, size, true); e.setUint32(16, off, true);
  return new Blob([...parts, ...cent, new Uint8Array(e.buffer)], { type: 'application/zip' });
}
function downloadBlob(name, blob) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 4000); }
function imagesToFiles(imgs, base) { return imgs.map((d, i) => new File([dataToBytes(d)], `${base}-${String(i + 1).padStart(2, '0')}.png`, { type: 'image/png' })); }
function canShareFiles(files) { try { return !!(navigator.canShare && navigator.share && navigator.canShare({ files })); } catch (e) { return false; } }

function pickFiles(opts, fn) {
  const i = document.createElement('input'); i.type = 'file'; i.accept = opts.accept || 'image/*'; i.multiple = !!opts.multiple; i.style.display = 'none';
  i.addEventListener('change', () => { const f = [...i.files]; i.remove(); if (f.length) fn(f); });
  document.body.appendChild(i); i.click();
}
