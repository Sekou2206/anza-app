window.addEventListener('hashchange', () => { if (!/^#\/devis\//.test(location.hash)) draft = null; if (st) render(); });
boot();
