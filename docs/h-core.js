// Signing core for h.html (encrypted single-document signing). Runs in the browser and in Node (for testing).
// buildSigned stamps the client's signature on every "client" mark, the lawyer stamp on every "lawyer" mark
// (only once the client has signed), the signing time under each, a footer on every page and an audit page.
(function (root) {
  // fontkit lays Hebrew runs right-to-left by itself; pre-reverse digit/latin runs so they come out LTR.
  function rtl(str) {
    if (!str) return '';
    if (!/[֐-׿]/.test(str)) return str;
    return str.replace(/[0-9A-Za-z@._:\-/]+/g, m => m.split('').reverse().join(''))
      .replace(/[()]/g, c => (c === '(' ? ')' : '('));
  }
  function stamp(date) {
    const p = {};
    new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Jerusalem', year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(date).forEach(x => p[x.type] = x.value);
    return { date: p.day + '.' + p.month + '.' + p.year, time: p.hour + ':' + p.minute, full: p.day + '.' + p.month + '.' + p.year + ' ' + p.hour + ':' + p.minute + ':' + p.second };
  }
  // a: {meta, pdf (Uint8Array), sig (PNG bytes), stampPng, heebo, latin, when (Date), device (string)}
  async function buildSigned(PDFLib, fontkit, a) {
    const { meta } = a;
    const doc = await PDFLib.PDFDocument.load(a.pdf);
    doc.registerFontkit(fontkit);
    const fb = await doc.embedFont(a.heebo), fl = await doc.embedFont(a.latin);
    const blue = PDFLib.rgb(0.102, 0.247, 0.659), grey = PDFLib.rgb(0.35, 0.35, 0.4), ink = PDFLib.rgb(0.1, 0.1, 0.15);
    const sig = await doc.embedPng(a.sig), st = await doc.embedPng(a.stampPng);
    const t = stamp(a.when), pages = doc.getPages(), short = meta.sha.slice(0, 12);
    const fit = (img, w, h) => { const s = Math.min(w / img.width, h / img.height); return [img.width * s, img.height * s]; };
    const center = (pg, txt, cx, y, size, font, color) => {
      const s = rtl(txt), w = font.widthOfTextAtSize(s, size); pg.drawText(s, { x: cx - w / 2, y, size, font, color }); };
    const right = (pg, txt, x, y, size, font, color) => {
      const s = rtl(txt), w = font.widthOfTextAtSize(s, size); pg.drawText(s, { x: x - w, y, size, font, color }); };

    for (const m of meta.marks) {
      const pg = pages[m.p], img = m.kind === 'lawyer' ? st : sig, [w, h] = fit(img, m.w, m.h);
      pg.drawImage(img, { x: m.cx - w / 2, y: m.y, width: w, height: h });
      center(pg, 'נחתם ' + t.date + ' בשעה ' + t.time, m.cx, m.dy, 7.5, fb, blue);
    }
    pages.forEach((pg, i) => {
      right(pg, 'נחתם אלקטרונית על ידי ' + meta.client + ' ביום ' + t.date + ' בשעה ' + t.time + ' · מזהה מסמך ' + short + ' · עמוד ' + (i + 1) + ' מתוך ' + pages.length,
        pg.getWidth() - 36, 16, 7, fb, grey);
    });

    // audit page
    const pg = doc.addPage([612, 792]); let y = 720; const X = 540;
    right(pg, 'אישור חתימה אלקטרונית', X, y, 17, fb, blue); y -= 10;
    pg.drawLine({ start: { x: 72, y }, end: { x: X, y }, thickness: 1, color: blue }); y -= 30;
    const row = (label, val) => { right(pg, label + ': ' + val, X, y, 11.5, fb, ink); y -= 24; };
    row('המסמך', meta.title + ' (' + pages.length + ' עמודים, כולל נספח א\' - שטר חוב)');
    row('החותם', meta.client + ', ת.ז. ' + meta.cid);
    row('מועד החתימה', t.full + ' (שעון ישראל)');
    row('החתימה הוטבעה', meta.marks.filter(m => m.kind === 'client').map(m => 'עמוד ' + (m.p + 1)).join(', '));
    row('חותמת עורך הדין', 'הוטבעה לאחר חתימת הלקוח, ' + meta.marks.filter(m => m.kind === 'lawyer').map(m => 'עמוד ' + (m.p + 1)).join(', '));
    right(pg, 'טביעת אצבע של המסמך המקורי (SHA-256):', X, y, 11.5, fb, ink); y -= 18;
    const hw = fl.widthOfTextAtSize(meta.sha, 8.5); pg.drawText(meta.sha, { x: X - hw, y, size: 8.5, font: fl, color: grey }); y -= 26;
    right(pg, 'מכשיר החתימה:', X, y, 11.5, fb, ink); y -= 16;
    const dev = (a.device || '').replace(/[^\x20-\x7e]/g, '').slice(0, 220);
    for (let i = 0; i < dev.length; i += 105) { const s = dev.slice(i, i + 105), w = fl.widthOfTextAtSize(s, 7.5); pg.drawText(s, { x: X - w, y, size: 7.5, font: fl, color: grey }); y -= 11; }
    y -= 20;
    right(pg, 'החתימה כפי שנמסרה:', X, y, 11.5, fb, ink); y -= 10;
    const [sw, sh] = fit(sig, 200, 80);
    pg.drawRectangle({ x: X - 220, y: y - 92, width: 220, height: 92, borderColor: PDFLib.rgb(0.83, 0.79, 0.72), borderWidth: 1 });
    pg.drawImage(sig, { x: X - 110 - sw / 2, y: y - 46 - sh / 2, width: sw, height: sh });
    y -= 130;
    right(pg, 'המסמך נחתם באמצעות קישור אישי שנשלח ללקוח. המסמך המקורי הוצפן, והמפתח לפתיחתו נמצא בקישור בלבד.', X, y, 9, fb, grey);
    right(pg, 'נחתם אלקטרונית על ידי ' + meta.client + ' ביום ' + t.date + ' בשעה ' + t.time + ' · מזהה מסמך ' + short + ' · דף אימות',
      pg.getWidth() - 36, 16, 7, fb, grey);

    doc.setTitle(meta.title + ' - ' + meta.client + ' - חתום');
    doc.setModificationDate(a.when);
    return await doc.save();
  }
  const api = { buildSigned, stamp, rtl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.H_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
