// Signing core for h.html (encrypted single-document signing). Runs in the browser and in Node (for testing).
// buildSigned stamps the client's signature on every "client" mark, the lawyer stamp on every "lawyer" mark
// (only once the client has signed), the signing time under each, a footer on every page and an audit page.
(function (root) {
  // fontkit lays Hebrew runs right-to-left by itself; pre-reverse digit/latin runs so they come out LTR.
  function rtl(str) {
    if (!str) return '';
    if (!/[֐-׿]/.test(str)) return str;
    return str.replace(/[0-9A-Za-z@._:\-/]+(?:,[0-9]+)*/g, m => m.split('').reverse().join(''))
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
    const sig = a.sig ? await doc.embedPng(a.sig) : null, st = await doc.embedPng(a.stampPng);
    const t = stamp(a.when), short = meta.sha.slice(0, 12); let pages = doc.getPages();
    const fit = (img, w, h) => { const s = Math.min(w / img.width, h / img.height); return [img.width * s, img.height * s]; };
    const center = (pg, txt, cx, y, size, font, color) => {
      const s = rtl(txt), w = font.widthOfTextAtSize(s, size); pg.drawText(s, { x: cx - w / 2, y, size, font, color }); };
    const right = (pg, txt, x, y, size, font, color) => {
      const s = rtl(txt), w = font.widthOfTextAtSize(s, size); pg.drawText(s, { x: x - w, y, size, font, color }); };

    const G = meta.mode === 'guarantor' ? a.g : null, signer = G ? G.name : meta.client;
    if (G) {
      const R = meta.row, pg = pages[R.p], mid = (R.y0 + R.y1) / 2;
      const fitText = (txt, x0, x1, y, size, min) => {
        let s = size; const r = rtl(txt); while (s > min && fb.widthOfTextAtSize(r, s) > x1 - x0 - 6) s -= 0.25;
        if (fb.widthOfTextAtSize(r, s) <= x1 - x0 - 6) { center(pg, txt, (x0 + x1) / 2, y, s, fb, blue); return; }
        const words = txt.split(' '), half = Math.ceil(words.length / 2);
        center(pg, words.slice(0, half).join(' '), (x0 + x1) / 2, y + 4, min, fb, blue);
        center(pg, words.slice(half).join(' '), (x0 + x1) / 2, y - 4.5, min, fb, blue);
      };
      fitText(G.name, R.name[0], R.name[1], R.y1 - 13, 9.5, 7);
      fitText('קרבה: ' + G.rel, R.name[0], R.name[1], R.y0 + 4, 7, 6);
      center(pg, G.id, (R.id[0] + R.id[1]) / 2, mid - 3, 9.5, fb, blue);
      fitText(G.addr, R.addr[0], R.addr[1], mid - 3, 9, 6.5);
      const Dc = meta.disc, dp = Dc ? pages[Dc.p] : null;
      const onLine = (f, txt, size) => { const [x0, x1, yy] = f; const r = rtl(txt); let s = size;
        while (s > 7 && fb.widthOfTextAtSize(r, s) > x1 - x0 - 4) s -= 0.25; center(dp, txt, (x0 + x1) / 2, yy + 4, s, fb, blue); };
      if (dp) { onLine(Dc.name, G.name, 11); onLine(Dc.id, G.id, 11); }
      if (!sig) return await doc.save(); // preview: details only, before signing
      const [w, h] = fit(sig, R.sig[1] - R.sig[0] - 8, R.y1 - R.y0 - 10);
      pg.drawImage(sig, { x: (R.sig[0] + R.sig[1]) / 2 - w / 2, y: R.y0 + 8, width: w, height: h });
      center(pg, t.date + ' ' + t.time, (R.sig[0] + R.sig[1]) / 2, R.y0 + 2, 5.5, fb, blue);
      if (dp) {
        onLine(Dc.date, t.date + ' ' + t.time, 11);
        const [x0, x1, yy] = Dc.sig, [sw2, sh2] = fit(sig, x1 - x0 - 6, 34);
        dp.drawImage(sig, { x: (x0 + x1) / 2 - sw2 / 2, y: yy + 2, width: sw2, height: sh2 });
      }
    }
    for (const m of (meta.marks || [])) {
      const pg = pages[m.p], img = m.kind === 'lawyer' ? st : sig, [w, h] = fit(img, m.w, m.h);
      pg.drawImage(img, { x: m.cx - w / 2, y: m.y, width: w, height: h });
      center(pg, 'נחתם ' + t.date + ' בשעה ' + t.time, m.cx, m.dy, 7.5, fb, blue);
    }
    // identification images (guarantor): ID card, selfie with ID — one page each
    const docPages = pages.length, imgs = a.imgs || (a.idImgs || []).map(b => ({ label: 'צילום תעודת זהות', bytes: b }));
    for (const im of imgs) {
      const b = im.bytes, img = b[0] === 0x89 ? await doc.embedPng(b) : await doc.embedJpg(b);
      const ip = doc.addPage([612, 792]);
      right(ip, im.label + (G ? ' - ' + G.name + ', ת.ז. ' + G.id : ''), 540, 720, 15, fb, blue);
      const [w, h] = fit(img, 468, 600); ip.drawImage(img, { x: 306 - w / 2, y: 700 - 20 - h, width: w, height: h });
    }
    pages = doc.getPages();
    pages.forEach((pg, i) => {
      right(pg, 'נחתם אלקטרונית על ידי ' + signer + (G ? ' כערב' : '') + ' ביום ' + t.date + ' בשעה ' + t.time + ' · מזהה מסמך ' + short + ' · עמוד ' + (i + 1) + ' מתוך ' + pages.length,
        pg.getWidth() - 36, 16, 7, fb, grey);
    });

    // audit page
    const pg = doc.addPage([612, 792]); let y = 720; const X = 540;
    right(pg, 'אישור חתימה אלקטרונית', X, y, 17, fb, blue); y -= 10;
    pg.drawLine({ start: { x: 72, y }, end: { x: X, y }, thickness: 1, color: blue }); y -= 30;
    const wrapR = (txt, size, maxw) => { const out = []; let cur = '';
      for (const w of txt.split(' ')) { const tt = cur ? cur + ' ' + w : w; if (cur && fb.widthOfTextAtSize(rtl(tt), size) > maxw) { out.push(cur); cur = w; } else cur = tt; }
      if (cur) out.push(cur); return out; };
    const row = (label, val, size = 11, gap = 19) => { const ls = wrapR(label + ': ' + val, size, X - 72);
      ls.forEach((l, i) => { right(pg, l, X, y, size, fb, ink); y -= i < ls.length - 1 ? size + 4 : gap; }); };
    if (G) {
      row('המסמך', 'ערבות לשטר חוב של ' + meta.client + ' עד לסך ' + meta.amount + ' (נספח א\' להסכם שכר טרחה)');
      row('הוצגו לערב לפני החתימה', 'דף גילוי לערב, הסכם שכר הטרחה המלא ושטר החוב (' + docPages + ' עמודים)' + (a.scrolledAt ? '; הערב גלל עד סוף המסמך בשעה ' + stamp(a.scrolledAt).full : ''));
      row('הערב', G.name + ', ת.ז. ' + G.id + ', קרבה לחייב: ' + G.rel);
      row('כתובת הערב (למשלוח הודעות)', G.addr);
      row('מועד החתימה', t.full + ' (שעון ישראל)');
      row('החתימה הוטבעה', 'דף הגילוי (עמוד ' + (meta.disc.p + 1) + ') וטבלת הערבים בשטר (עמוד ' + (meta.row.p + 1) + ', שורה 1)');
      row('אמצעי זיהוי שצורפו', imgs.length ? imgs.map(i => i.label).join(', ') : 'לא צורפו');
      right(pg, 'אישורי הערב (כל אישור סומן בנפרד):', X, y, 11, fb, ink); y -= 17;
      (a.acks || []).forEach((k, n) => { const ls = wrapR('(' + (n + 1) + ') ' + k.text + ' (סומן בתאריך ' + stamp(k.at).full + ')', 9.5, X - 90);
        ls.forEach((l, i) => { right(pg, l, X - (i ? 18 : 8), y, 9.5, fb, ink); y -= i < ls.length - 1 ? 13 : 16; }); });
      y -= 6;
    } else {
      row('המסמך', meta.title + ' (' + docPages + ' עמודים, כולל נספח א\' - שטר חוב)');
      row('החותם', meta.client + ', ת.ז. ' + meta.cid);
      row('מועד החתימה', t.full + ' (שעון ישראל)');
      row('החתימה הוטבעה', meta.marks.filter(m => m.kind === 'client').map(m => 'עמוד ' + (m.p + 1)).join(', '));
      row('חותמת עורך הדין', 'הוטבעה לאחר חתימת הלקוח, ' + meta.marks.filter(m => m.kind === 'lawyer').map(m => 'עמוד ' + (m.p + 1)).join(', '));
    }
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
    right(pg, 'נחתם אלקטרונית על ידי ' + signer + (G ? ' כערב' : '') + ' ביום ' + t.date + ' בשעה ' + t.time + ' · מזהה מסמך ' + short + ' · דף אימות',
      pg.getWidth() - 36, 16, 7, fb, grey);

    doc.setTitle(meta.title + ' - ' + signer + ' - חתום');
    doc.setModificationDate(a.when);
    return await doc.save();
  }
  const api = { buildSigned, stamp, rtl };
  if (typeof module !== 'undefined' && module.exports) module.exports = api; else root.H_CORE = api;
})(typeof window !== 'undefined' ? window : globalThis);
