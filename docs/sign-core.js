// Shared logic for sign.html: link format + PDF assembly. Runs in the browser and in Node (for testing).
// Link: <app>/sign.html#d<base64url>; bytes = [ver=2] then per document: [template code][value 0x1F value ...][0x1E]
// Hebrew letters are packed to one byte each (same scheme as poa.html), so a full request fits in a short link.
(function (root) {
  const T = root.SIGN_TEMPLATES || (typeof require !== 'undefined' ? require('./templates.js') : null);
  const B64U = {
    enc: b => (typeof btoa !== 'undefined' ? btoa(String.fromCharCode(...b)) : Buffer.from(b).toString('base64'))
      .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''),
    dec: t => { t = t.replace(/-/g, '+').replace(/_/g, '/'); while (t.length % 4) t += '=';
      return typeof atob !== 'undefined' ? Uint8Array.from(atob(t), c => c.charCodeAt(0)) : new Uint8Array(Buffer.from(t, 'base64')); },
  };
  function packText(str, out) {
    for (const ch of str) { const c = ch.codePointAt(0);
      if (c >= 0x5D0 && c <= 0x5EA) out.push(0x80 + (c - 0x5D0));
      else if (c > 0x1F && c < 0x80) out.push(c);
      else out.push(0xFF, (c >> 8) & 255, c & 255); }
  }
  function unpackText(b, i, end) { let s = '';
    while (i < end) { const c = b[i++];
      if (c === 0xFF) { s += String.fromCharCode((b[i] << 8) | b[i + 1]); i += 2; }
      else if (c >= 0x80) s += String.fromCharCode(0x5D0 + c - 0x80); else s += String.fromCharCode(c); }
    return s; }
  // docs: [{code, values:{key:value}}]
  // key (16 bytes, optional): unlocks docs/enc/st.bin (the lawyer stamp). With a key the link is v3: [3][key x16][docs...]
  function pack(docs, key) {
    const out = key ? [3, ...key] : [2];
    for (const d of docs) {
      out.push(d.code);
      const keys = T[d.code].fields.filter(f => !f.auto && !f.fixed).map(f => f.k);
      keys.forEach((k, i) => { if (i) out.push(0x1F); packText(String(d.values[k] || ''), out); });
      out.push(0x1E);
    }
    return B64U.enc(out);
  }
  function unpack(t) {
    const b = B64U.dec(t); if (b[0] !== 2 && b[0] !== 3) throw new Error('bad version');
    const docs = []; let i = 1;
    if (b[0] === 3) { docs.key = b.slice(1, 17); i = 17; }
    while (i < b.length) {
      const code = b[i++]; if (!T[code]) throw new Error('unknown document ' + code);
      let end = b.indexOf(0x1E, i); if (end < 0) end = b.length;
      const parts = []; let s = i;
      for (let j = i; j <= end; j++) if (j === end || b[j] === 0x1F) { parts.push(unpackText(b, s, j)); s = j + 1; }
      const keys = T[code].fields.filter(f => !f.auto && !f.fixed).map(f => f.k);
      const values = {}; keys.forEach((k, n) => values[k] = parts[n] || '');
      docs.push({ code, values }); i = end + 1;
    }
    return docs;
  }
  // fontkit lays Hebrew runs right-to-left by itself; pre-reverse digit/latin runs so they come out LTR.
  function rtl(str) {
    if (!str) return '';
    if (!/[֐-׿]/.test(str)) return str;
    return str.replace(/[0-9A-Za-z@._\-/]+/g, m => m.split('').reverse().join(''))
      .replace(/[()]/g, c => (c === '(' ? ')' : '(')); // brackets are not mirrored by the reversal
  }
  // getBytes(path) -> ArrayBuffer/Uint8Array ; sig: PNG/JPEG bytes or null ; dateStr: dd/mm/yyyy
  // extra.idPhoto: JPEG/PNG bytes of the client's ID (for templates with idPhoto)
  const LETTERS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י'];
  function needsIdPhoto(docs) { return docs.some(d => T[d.code].idPhoto); }
  async function build(PDFLib, fontkit, getBytes, docs, sig, dateStr, extra) {
    extra = extra || {};
    let nApp = 0;
    const out = await PDFLib.PDFDocument.create();
    out.registerFontkit(fontkit);
    const fb = await out.embedFont(await getBytes('Heebo-Bold.ttf'));
    const fr = await out.embedFont(await getBytes('docs/LiberationSans-Regular.ttf'));
    const blue = PDFLib.rgb(0.102, 0.247, 0.659), black = PDFLib.rgb(0, 0, 0);
    let sigImg = null;
    if (sig) { const u8 = new Uint8Array(sig); sigImg = (u8[0] === 0x89) ? await out.embedPng(u8) : await out.embedJpg(u8); }
    for (const d of docs) {
      const t = T[d.code];
      const A4 = [595.28, 841.89];
      if (t.appendix) { // cover page: "נספח X'" centred, bold, underlined, size 24, description below
        const cv = out.addPage(A4);
        const lab = rtl('נספח ' + LETTERS[nApp++] + "'"), lw = fb.widthOfTextAtSize(lab, 24);
        cv.drawText(lab, { x: (A4[0] - lw) / 2, y: A4[1] / 2 + 20, size: 24, font: fb, color: black });
        cv.drawLine({ start: { x: (A4[0] - lw) / 2, y: A4[1] / 2 + 15 }, end: { x: (A4[0] + lw) / 2, y: A4[1] / 2 + 15 }, thickness: 1.5, color: black });
        const ds = rtl(t.appendix), dw = fr.widthOfTextAtSize(ds, 15);
        cv.drawText(ds, { x: (A4[0] - dw) / 2, y: A4[1] / 2 - 22, size: 15, font: fr, color: black });
      }
      if (t.idPhoto) {
        const pg = out.addPage(A4);
        if (extra.idPhoto) {
          const u8 = new Uint8Array(extra.idPhoto);
          const im = (u8[0] === 0x89) ? await out.embedPng(u8) : await out.embedJpg(u8);
          const k = Math.min((A4[0] - 60) / im.width, (A4[1] - 60) / im.height);
          const w = im.width * k, h = im.height * k;
          pg.drawImage(im, { x: (A4[0] - w) / 2, y: (A4[1] - h) / 2, width: w, height: h });
        } else {
          const ph = rtl('כאן יצורף צילום תעודת הזהות'), pw = fr.widthOfTextAtSize(ph, 16);
          pg.drawText(ph, { x: (A4[0] - pw) / 2, y: A4[1] / 2, size: 16, font: fr, color: PDFLib.rgb(0.55, 0.55, 0.55) });
        }
        continue;
      }
      const src = await PDFLib.PDFDocument.load(await getBytes(t.file));
      const pages = await out.copyPages(src, src.getPageIndices());
      pages.forEach(p => out.addPage(p));
      const page = pages[0]; const H = page.getHeight();
      for (const f of t.fields) {
        if (f.signed && !sigImg) continue;
        const raw = f.fixed || (f.auto === 'date' ? dateStr : d.values[f.k]);
        if (!raw) continue;
        const pg = pages[f.p || 0];
        if (f.white) pg.drawRectangle({ x: f.white[0], y: H - f.white[3], width: f.white[2] - f.white[0], height: f.white[3] - f.white[1], color: PDFLib.rgb(1, 1, 1) });
        const font = f.f === 'r' ? fr : fb, color = f.f === 'r' ? black : blue;
        const txt = rtl(raw);
        let size = f.s || 10;
        const maxW = (f.al === 'r' || f.al === 'l') ? 400 : (f.x1 - f.x0 - 4);
        let w = font.widthOfTextAtSize(txt, size);
        while (w > maxW && size > 6) { size -= 0.25; w = font.widthOfTextAtSize(txt, size); }
        const x = f.al === 'r' ? f.x1 - w : f.al === 'l' ? f.x0 : f.x0 + (f.x1 - f.x0 - w) / 2;
        pg.drawText(txt, { x, y: H - f.y, size, font, color });
      }
      for (const s of t.strikes || []) page.drawLine({ start: { x: s.x0, y: H - s.y }, end: { x: s.x1, y: H - s.y }, thickness: 1, color: blue });
      for (const c of t.checks || []) {
        page.drawLine({ start: { x: c.x, y: H - c.y - 4 }, end: { x: c.x + 3, y: H - c.y - 7.5 }, thickness: 1.4, color: blue });
        page.drawLine({ start: { x: c.x + 3, y: H - c.y - 7.5 }, end: { x: c.x + 8, y: H - c.y }, thickness: 1.4, color: blue });
      }
      if (sigImg && t.stamps && t.stamps.length) {
        if (!extra.stamp) throw new Error('stamp unavailable');
        const st = await out.embedPng(new Uint8Array(extra.stamp));
        for (const s of t.stamps) {
          const w = s.w, h = w * st.height / st.width;
          pages[s.p || 0].drawImage(st, { x: s.cx - w / 2, y: H - s.y, width: w, height: h });
        }
      }
      if (sigImg) for (const s of t.sigs) {
        const k = Math.min(s.w / sigImg.width, s.h / sigImg.height);
        const w = sigImg.width * k, h = sigImg.height * k;
        page.drawImage(sigImg, { x: s.cx - w / 2, y: H - s.y, width: w, height: h });
      }
    }
    return await out.save();
  }
  const api = { pack, unpack, build, rtl, B64U, needsIdPhoto };
  root.SIGN_CORE = api;
  if (typeof module !== 'undefined') module.exports = api;
})(typeof window !== 'undefined' ? window : globalThis);
