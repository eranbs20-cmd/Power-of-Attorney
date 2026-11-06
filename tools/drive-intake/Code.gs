/**
 * Client document intake, backed by the lawyer's own Google Drive + this Google Sheet.
 *
 * The client page (tvia.html#c=<token>) uploads each document the moment it is picked, so nothing is
 * lost if the client closes the page, changes phone, or comes back a week later. Every file lands in
 * the client's Drive folder; this sheet is the dashboard (one row per client) with a one-click
 * WhatsApp reminder listing what is still missing.
 *
 * Install (once): bind this script to a Google Sheet (Extensions > Apps Script), paste this file,
 * run setup() and approve, then Deploy > New deployment > Web app: Execute as "Me",
 * Who has access "Anyone". Put the /exec URL into API in tvia.html.
 *
 * Security: a client can only reach their own case, by a 128-bit random token that exists only in
 * their link. A token can list the file names of its own case, upload, and trash files it uploaded.
 * Nothing else is exposed. Revoking = set the row's status to "סגור".
 */

const SHEET = 'לקוחות';
const COLS = ['טוקן', 'שם', 'טלפון', 'תיק', 'סטטוס', 'הועלו קבצים', 'טופלו', 'מתוך', 'חסרים', 'פעילות אחרונה',
              'נשלח (חתום)', 'תיקייה', 'קישור ללקוח', 'תזכורת בוואטסאפ', 'נוצר'];
const C = Object.fromEntries(COLS.map((n, i) => [n, i + 1]));
const PAGE = 'https://eranbs20-cmd.github.io/Power-of-Attorney/tvia.html#c=';
const MAX_BYTES = 15 * 1024 * 1024;

// ---------------------------------------------------------------- sheet menu (the lawyer's side)
function onOpen() {
  SpreadsheetApp.getUi().createMenu('📁 מסמכי לקוחות')
    .addItem('➕ לקוח חדש', 'newClient')
    .addItem('🔔 תזכורת ללקוח בשורה המסומנת', 'remindSelected')
    .addItem('🔄 רענון הלוח', 'refreshAll')
    .addSeparator()
    .addItem('⚙️ התקנה ראשונה', 'setup')
    .addToUi();
}

function setup() {
  const ss = SpreadsheetApp.getActive();
  let sh = ss.getSheetByName(SHEET);
  if (!sh) { sh = ss.getSheets()[0]; sh.setName(SHEET); }
  sh.getRange(1, 1, 1, COLS.length).setValues([COLS]).setFontWeight('bold').setBackground('#22305a').setFontColor('#ffffff');
  sh.setFrozenRows(1); sh.setRightToLeft(true);
  sh.hideColumns(C['טוקן']);
  const p = PropertiesService.getScriptProperties();
  if (!p.getProperty('ROOT')) p.setProperty('ROOT', DriveApp.createFolder('מסמכים מלקוחות').getId());
  p.setProperty('EMAIL', Session.getActiveUser().getEmail());
  ScriptApp.getProjectTriggers().forEach(t => ScriptApp.deleteTrigger(t));
  ScriptApp.newTrigger('dailyDigest').timeBased().everyDays(1).atHour(8).create();
  try { SpreadsheetApp.getUi().alert('ההתקנה הושלמה. עכשיו: פריסה ← פריסה חדשה ← אפליקציית אינטרנט (הפעלה בתור: אני, גישה: כל אחד).'); } catch (e) { Logger.log('setup done'); }
}

function newClient() {
  const ui = SpreadsheetApp.getUi();
  const n = ui.prompt('לקוח חדש', 'שם מלא של הלקוח/ה:', ui.ButtonSet.OK_CANCEL);
  if (n.getSelectedButton() !== ui.Button.OK || !n.getResponseText().trim()) return;
  const ph = ui.prompt('לקוח חדש', 'טלפון (05X-XXXXXXX):', ui.ButtonSet.OK_CANCEL);
  if (ph.getSelectedButton() !== ui.Button.OK) return;
  const r = createCase_(n.getResponseText().trim(), ph.getResponseText().trim(), '');
  const html = HtmlService.createHtmlOutput(
    '<div dir="rtl" style="font-family:Arial;font-size:14px;line-height:1.7">' +
    '<p>נפתחה תיקייה ונוצר קישור אישי ל<b>' + esc_(r.name) + '</b>.</p>' +
    '<p><a href="' + r.wa + '" target="_blank" style="background:#1f7a4d;color:#fff;padding:9px 16px;border-radius:8px;text-decoration:none;font-weight:bold">📲 שלח לה בוואטסאפ</a></p>' +
    '<p style="word-break:break-all;color:#555">' + esc_(r.link) + '</p></div>').setWidth(460).setHeight(220);
  ui.showModalDialog(html, 'הקישור מוכן');
}

/** Also callable from the web app with the admin key, so Claude can open a case without the menu. */
function createCase_(name, phone, caseNo) {
  const token = Utilities.base64EncodeWebSafe(Utilities.newBlob(Utilities.getUuid() + Utilities.getUuid()).getBytes())
    .replace(/=+$/, '').slice(0, 24);
  const root = DriveApp.getFolderById(PropertiesService.getScriptProperties().getProperty('ROOT'));
  const folder = root.createFolder(name + ' – מסמכים מהלקוח');
  const st = { name, phone, items: {}, labels: {}, total: 0, answers: {}, note: '', submitted: '' };
  folder.createFile('_state.json', JSON.stringify(st), 'application/json');
  const sh = sheet_();
  const row = [token, name, phone, caseNo || '', 'ממתין ללקוח', 0, 0, 0, '', new Date(), '', folder.getUrl(), PAGE + token, '', new Date()];
  sh.appendRow(row);
  const link = PAGE + token;
  return { token, name, link, folder: folder.getUrl(), wa: wa_(phone, firstName_(name), link, []) };
}

function remindSelected() {
  const sh = sheet_(); const r = sh.getActiveRange().getRow();
  if (r < 2) { SpreadsheetApp.getUi().alert('סמן שורה של לקוח'); return; }
  const url = sh.getRange(r, C['תזכורת בוואטסאפ']).getValue();
  const html = HtmlService.createHtmlOutput('<div dir="rtl" style="font-family:Arial"><a href="' + url +
    '" target="_blank" style="background:#1f7a4d;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:bold">📲 פתח את התזכורת בוואטסאפ</a></div>').setWidth(320).setHeight(90);
  SpreadsheetApp.getUi().showModalDialog(html, 'תזכורת');
}

function refreshAll() {
  const sh = sheet_(); const n = sh.getLastRow();
  for (let r = 2; r <= n; r++) { const t = sh.getRange(r, C['טוקן']).getValue(); if (t) { try { updateRow_(t, readState_(t)); } catch (e) {} } }
}

/** Every morning: one e-mail to the lawyer with the open cases and a reminder link for each. */
function dailyDigest() {
  const sh = sheet_(); const v = sh.getDataRange().getValues().slice(1)
    .filter(r => r[C['סטטוס'] - 1] !== 'סגור' && !r[C['נשלח (חתום)'] - 1]);
  if (!v.length) return;
  const rows = v.map(r => '<tr><td>' + esc_(r[C['שם'] - 1]) + '</td><td>' + r[C['טופלו'] - 1] + '/' + r[C['מתוך'] - 1] +
    '</td><td>' + esc_(String(r[C['חסרים'] - 1]).slice(0, 160)) + '</td><td><a href="' + r[C['תזכורת בוואטסאפ'] - 1] + '">📲 תזכורת</a></td></tr>').join('');
  MailApp.sendEmail({ to: PropertiesService.getScriptProperties().getProperty('EMAIL'), subject: 'מסמכים מלקוחות – מה חסר היום',
    htmlBody: '<div dir="rtl" style="font-family:Arial"><table border="1" cellpadding="6" style="border-collapse:collapse">' +
      '<tr><th>לקוח</th><th>טופלו</th><th>חסרים</th><th></th></tr>' + rows + '</table></div>' });
}

// ---------------------------------------------------------------- web app (the client's side)
function doPost(e) {
  let out;
  try { out = route_(JSON.parse(e.postData.contents)); }
  catch (err) { out = { ok: false, error: String(err && err.message || err) }; }
  return ContentService.createTextOutput(JSON.stringify(out)).setMimeType(ContentService.MimeType.JSON);
}
function doGet() { return ContentService.createTextOutput('ok'); }

function route_(q) {
  const row = findRow_(q.t);
  if (!row) return { ok: false, error: 'link' };
  if (sheet_().getRange(row, C['סטטוס']).getValue() === 'סגור') return { ok: false, error: 'closed' };
  const lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    const st = readState_(q.t);
    if (q.labels) { st.labels = q.labels; st.total = Object.keys(q.labels).length; }
    switch (q.a) {
      case 'status': break;
      case 'upload': {
        if (!q.key || !q.data) throw new Error('bad');
        const bytes = Utilities.base64Decode(q.data);
        if (bytes.length > MAX_BYTES) return { ok: false, error: 'big' };
        const folder = itemFolder_(q.t, q.key, (st.labels || {})[q.key]);
        const f = folder.createFile(Utilities.newBlob(bytes, q.mime || 'application/octet-stream', safe_(q.name)));
        const it = st.items[q.key] = st.items[q.key] || { files: [], state: '' };
        it.files.push({ id: f.getId(), name: f.getName(), size: bytes.length, at: new Date().toISOString() }); it.state = '';
        break; }
      case 'delete': {
        const it = (st.items[q.key] || { files: [] }); const i = it.files.findIndex(x => x.id === q.id);
        if (i < 0) throw new Error('bad');
        DriveApp.getFileById(q.id).setTrashed(true); it.files.splice(i, 1); break; }
      case 'state': {
        const it = st.items[q.key] = st.items[q.key] || { files: [], state: '' };
        it.state = ['none', 'later', ''].includes(q.state) ? q.state : ''; break; }
      case 'answers': { st.answers = q.answers || {}; st.note = String(q.note || '').slice(0, 4000); break; }
      case 'submit': {
        st.answers = q.answers || st.answers; st.note = String(q.note || st.note || '').slice(0, 4000);
        const folder = caseFolder_(q.t);
        if (q.sig) folder.createFile(Utilities.newBlob(Utilities.base64Decode(q.sig), 'image/png', 'חתימה - ' + st.name + '.png'));
        st.submitted = new Date().toISOString();
        if (q.qlabels) st.qlabels = q.qlabels;
        summary_(st, folder); notify_(st, folder); break; }
      default: throw new Error('bad');
    }
    writeState_(q.t, st); updateRow_(q.t, st);
    return { ok: true, name: st.name, first: firstName_(st.name), items: st.items, answers: st.answers, note: st.note, submitted: st.submitted };
  } finally { lock.releaseLock(); }
}

// ---------------------------------------------------------------- helpers
function sheet_() { return SpreadsheetApp.getActive().getSheetByName(SHEET); }
function findRow_(t) {
  if (!t || !/^[A-Za-z0-9_-]{20,40}$/.test(t)) return 0;
  const f = sheet_().getRange(2, C['טוקן'], Math.max(1, sheet_().getLastRow() - 1), 1).createTextFinder(t).matchEntireCell(true).findNext();
  return f ? f.getRow() : 0;
}
function caseFolder_(t) { const url = sheet_().getRange(findRow_(t), C['תיקייה']).getValue(); return DriveApp.getFolderById(url.match(/[-\w]{25,}/)[0]); }
function itemFolder_(t, key, label) {
  const parent = caseFolder_(t); const name = (label ? safe_(label).slice(0, 80) : key);
  const it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name);
}
function stateFile_(t) { const it = caseFolder_(t).getFilesByName('_state.json'); return it.next(); }
function readState_(t) { return JSON.parse(stateFile_(t).getBlob().getDataAsString()); }
function writeState_(t, st) { stateFile_(t).setContent(JSON.stringify(st)); }
function updateRow_(t, st) {
  const sh = sheet_(); const r = findRow_(t); if (!r) return;
  const keys = Object.keys(st.labels || {});
  const files = Object.values(st.items).reduce((n, it) => n + it.files.length, 0);
  const done = keys.filter(k => st.items[k] && (st.items[k].files.length || st.items[k].state)).length;
  const missing = keys.filter(k => !st.items[k] || (!st.items[k].files.length && st.items[k].state !== 'none'))
    .map(k => st.labels[k] + (st.items[k] && st.items[k].state === 'later' ? ' (אשלח בהמשך)' : ''));
  const status = st.submitted ? 'נשלח חתום' : files || done ? 'בתהליך' : 'ממתין ללקוח';
  sh.getRange(r, C['סטטוס'], 1, 6).setValues([[status, files, done, keys.length, missing.join(' · '), new Date()]]);
  sh.getRange(r, C['נשלח (חתום)']).setValue(st.submitted ? new Date(st.submitted) : '');
  sh.getRange(r, C['תזכורת בוואטסאפ']).setValue(wa_(st.phone, firstName_(st.name), PAGE + t, missing));
}
function wa_(phone, first, link, missing) {
  let d = String(phone || '').replace(/\D/g, ''); if (d.startsWith('972')) d = d.slice(3); d = '972' + d.replace(/^0/, '');
  const top = missing.slice(0, 6).map(m => '• ' + m).join('\n');
  const txt = 'שלום ' + first + ',\n' + (missing.length
    ? 'תזכורת קטנה לגבי המסמכים לתביעה. עדיין חסרים:\n' + top + (missing.length > 6 ? '\nועוד ' + (missing.length - 6) + '.' : '') + '\n'
    : 'זה הקישור להעלאת המסמכים לתביעה.\n') +
    'כל מסמך שמעלים נשמר מיד אצלי, ואפשר להעלות אחד-אחד ולחזור מתי שנוח:\n' + link + '\nתודה, עו"ד ערן בן שושן';
  return 'https://wa.me/' + d + '?text=' + encodeURIComponent(txt);
}
/** A readable summary next to the documents: what was marked, what was answered, the note. Overwritten on every submit. */
function summary_(st, folder) {
  const L = [st.name + ' – תשובות וסימונים', 'נשלח: ' + Utilities.formatDate(new Date(), 'Asia/Jerusalem', 'dd.MM.yyyy HH:mm'), ''];
  L.push('== מסמכים ==');
  for (const [k, label] of Object.entries(st.labels || {})) {
    const it = st.items[k] || { files: [], state: '' };
    L.push((it.files.length ? '✓ ' + it.files.length + ' קבצים' : it.state === 'none' ? '✗ אין לי' : it.state === 'later' ? '⏳ אשלח בהמשך' : '— לא טופל') + '  |  ' + label);
  }
  L.push('', '== תשובות ==');
  const ql = st.qlabels || {};
  for (const [k, v] of Object.entries(st.answers || {})) if (String(v).trim()) L.push((ql[k] || k) + ':', '   ' + String(v).trim(), '');
  if (st.note) L.push('== הערות ==', st.note);
  const name = 'תשובות וסימונים - ' + st.name + '.txt'; const it = folder.getFilesByName(name);
  if (it.hasNext()) it.next().setContent(L.join('\n')); else folder.createFile(name, L.join('\n'), 'text/plain');
}
function notify_(st, folder) {
  try { MailApp.sendEmail(PropertiesService.getScriptProperties().getProperty('EMAIL'), st.name + ' שלח/ה את המסמכים לתביעה',
    'הלקוח/ה סיים/ה, חתם/ה ושלח/ה.\nתיקייה: ' + folder.getUrl()); } catch (e) {}
}
function firstName_(n) { return String(n || '').trim().split(/\s+/)[0] || ''; }
function safe_(s) { return String(s || 'קובץ').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '_').slice(0, 120); }
function esc_(s) { return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
