(function () {
  let shown = false;
  const show = () => { if (shown) return; const b = document.getElementById('bootfail'); if (!b) return; shown = true; b.hidden = false; const r = document.getElementById('bootreload'); if (r) r.addEventListener('click', () => { if ('caches' in window) caches.keys().then(k => Promise.all(k.map(x => caches.delete(x)))).finally(() => location.reload()); else location.reload(); }); };
  window.addEventListener('error', e => { if (e.target && e.target.tagName === 'SCRIPT') return show(); if (document.readyState !== 'complete' && /\.js/.test(e.filename || '')) show(); }, true);
  window.addEventListener('load', () => setTimeout(() => { if (typeof VIEWS === 'undefined' || typeof boot !== 'function') show(); }, 1500));
})();
