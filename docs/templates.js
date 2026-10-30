// Blank document templates for sign.html. No client data lives here:
// every value arrives in the link fragment, in the order of `fields`.
// Coordinates are PDF points measured from the TOP of the page (y = baseline).
// al: 'c' centre in [x0,x1], 'r' right-aligned at x1. f: 'b' Heebo-Bold blue, 'r' Liberation regular black.
// auto:'date' fields are filled with the signing date on the client's device and are not sent in the link.
// fixed: constant text (not sent in the link). signed:true draws the field only on the signed copy.
// p: page index (default 0). white: [x0,y0,x1,y1] blanks out a printed placeholder before writing.
(function (root) {
  const T = {
    1: {
      key: 'yishuv', file: 'docs/yishuv.pdf', title: 'בקשה ליישוב סכסוך (טופס 1)',
      fields: [
        { k: 'court', x0: 336, x1: 423, y: 73, s: 10 },
        { k: 'city', x0: 197, x1: 326, y: 73, s: 11 },
        { k: 'date', auto: 'date', x0: 72, x1: 133, y: 108, s: 10 },
        { k: 'a_first', x0: 450, x1: 523, y: 254 }, { k: 'a_last', x0: 377, x1: 450, y: 254 },
        { k: 'a_id', x0: 235, x1: 377, y: 254 }, { k: 'a_addr', x0: 73, x1: 235, y: 254 },
        { k: 'a_phone', x0: 377, x1: 523, y: 303 }, { k: 'a_fax', x0: 235, x1: 377, y: 303 }, { k: 'a_email', x0: 73, x1: 235, y: 303 },
        { k: 'l_first', x0: 450, x1: 523, y: 386 }, { k: 'l_last', x0: 377, x1: 450, y: 386 },
        { k: 'l_addr', x0: 186, x1: 377, y: 386 }, { k: 'l_phone', x0: 73, x1: 186, y: 386 },
        { k: 'l_fax', x0: 377, x1: 523, y: 435 }, { k: 'l_email', x0: 73, x1: 377, y: 435 },
        { k: 'r_first', x0: 450, x1: 523, y: 519 }, { k: 'r_last', x0: 377, x1: 450, y: 519 },
        { k: 'r_id', x0: 235, x1: 377, y: 519 }, { k: 'r_addr', x0: 73, x1: 235, y: 519 },
        { k: 'r_phone', x0: 377, x1: 523, y: 568 }, { k: 'r_fax', x0: 235, x1: 377, y: 568 }, { k: 'r_email', x0: 73, x1: 235, y: 568 },
        { k: 'between', x0: 274, x1: 386, y: 606, s: 10.5 },
      ],
      // "מחק את המיותר": keep "הורהו של ילדיי"
      strikes: [{ x0: 202.5, x1: 236.6, y: 602.3 }, { x0: 131.5, x1: 155.2, y: 602.3 }, { x0: 72, x1: 110.8, y: 602.3 }],
      checks: [{ x: 514.5, y: 683.5 }],
      sigs: [{ cx: 165, y: 731, w: 100, h: 40 }],
    },
    2: {
      key: 'aid', file: 'docs/aid.pdf', title: 'תצהיר זכאות לסיוע משפטי',
      fields: [
        { k: 'name', x1: 550, y: 140.5, s: 10.6, al: 'r', f: 'r' },
        { k: 'id', x0: 300, x1: 363, y: 140.5, s: 10.6, f: 'r' },
        { k: 'l2a', x1: 566, y: 209.5, s: 10.6, al: 'r', f: 'r' },
        { k: 'l2b', x1: 566, y: 223.5, s: 10.6, al: 'r', f: 'r' },
        { k: 'l2c', x1: 566, y: 238, s: 10.6, al: 'r', f: 'r' },
        { k: 'l3', x1: 566, y: 252, s: 10.6, al: 'r', f: 'r' },
        { k: 'name2', x1: 568, y: 426.5, s: 10.6, al: 'r', f: 'r' },
        { k: 'id2', x0: 275, x1: 339, y: 426, s: 10.6, f: 'r' },
        { k: 'date', auto: 'date', x0: 364, x1: 537, y: 692, s: 11 },
        // lawyer's confirmation, filled only once the client has signed
        { k: 'l_name', fixed: 'ערן בן שושן', signed: true, x0: 300, x1: 498, y: 411, s: 11 },
        { k: 'l_date1', auto: 'date', signed: true, x0: 106, x1: 196, y: 412, s: 10.5, white: [106, 400, 196, 416] },
        { k: 'l_date2', auto: 'date', signed: true, p: 1, x0: 364, x1: 537, y: 66, s: 11 },
      ],
      sigs: [{ cx: 161, y: 355, w: 110, h: 42 }, { cx: 161, y: 692, w: 110, h: 42 }],
      // lawyer stamp (stamp.png), only on the signed copy: "חתימת עורך דין" and the waiver confirmation on page 2
      stamps: [{ cx: 161, y: 504, w: 95 }, { p: 1, cx: 161, y: 67, w: 95 }],
    },
    // ---- appendices (no signature). `appendix` = description on the cover page; letters (א', ב'...) follow link order.
    3: {
      key: 'ptor', file: 'docs/ptor.pdf', title: 'הודעה על פטור מאגרה', appendix: 'הודעת הסיוע המשפטי על פטור מאגרה',
      fields: [
        { k: 'fileno', x0: 54, y: 105, s: 10, al: 'l', f: 'r' },
        { k: 'hdate', x0: 54, y: 116.5, s: 10, al: 'l', f: 'r' },
        { k: 'ldate', x0: 54, y: 128.5, s: 10, al: 'l', f: 'r' },
        { k: 'name', x1: 372, y: 360.5, s: 10, al: 'r', f: 'r' },
        { k: 'id', x1: 302.5, y: 360.5, s: 9.6, al: 'r', f: 'r' },
      ],
      sigs: [],
    },
    4: {
      key: 'minui', file: 'docs/minui.pdf', title: 'כתב מינוי בגישה ישירה', appendix: 'כתב מינוי להענקת שירות משפטי בגישה ישירה',
      fields: [
        { k: 'fileno', x0: 54, y: 105, s: 10, al: 'l', f: 'r' },
        { k: 'hdate', x0: 54, y: 116.5, s: 10, al: 'l', f: 'r' },
        { k: 'ldate', x0: 54, y: 128.5, s: 10, al: 'l', f: 'r' },
        { k: 'name', x1: 313, y: 316.5, s: 10, al: 'r', f: 'r' },
        { k: 'id', x1: 293, y: 330.5, s: 10, al: 'r', f: 'r' },
        { k: 'addr', x1: 371, y: 346.5, s: 10, al: 'r', f: 'r' },
        { k: 'phone', x1: 311, y: 360.5, s: 10, al: 'r', f: 'r' },
        { k: 'subject', x1: 536, y: 499.5, s: 10, al: 'r', f: 'r' },
        { k: 'signer', x1: 217, y: 690.5, s: 10, al: 'r', f: 'r' },
        { k: 'aid_lawyer', x1: 351, y: 725.5, s: 10, al: 'r', f: 'r' },
      ],
      sigs: [],
    },
    5: {
      key: 'tz', file: null, title: 'צילום תעודת זהות', appendix: 'צילום תעודת זהות של המבקשת, כולל ספח',
      idPhoto: true, fields: [], sigs: [],
    },
    // ---- power of attorney (same layout as poa.html / base.pdf). Signature + lawyer stamp only on the signed copy.
    6: {
      key: 'poa', file: 'docs/poa.pdf', title: 'ייפוי כוח',
      fields: [
        { k: 'name', x0: 334, x1: 454, y: 101.68, s: 11, al: 'r' },
        { k: 'id', x0: 261, x1: 309, y: 101.68, s: 11, al: 'r' },
        { k: 'service', x0: 145, x1: 310, y: 114.68, s: 11, al: 'r' },
        { k: 'date', auto: 'date', x0: 316, x1: 364, y: 670.68, s: 11, al: 'r' },
      ],
      sigs: [{ cx: 458.75, y: 723.68, w: 88, h: 45 }],
      stamps: [{ cx: 171, y: 721.68, w: 95 }],
    },
    // ---- declaration + affidavit page of form 21 (genetic test / paternity). Blank page; values come from the link.
    7: {
      key: 'tazhir21', file: 'docs/tazhir21.pdf', title: 'הצהרה ותצהיר לבקשה לקביעת אבהות',
      fields: [
        { k: 'name', x1: 541.1, y: 150.6, s: 12, al: 'r', f: 'r' },
        { k: 'name2', x1: 449.0, y: 292.5, s: 12, al: 'r', f: 'r' },
        { k: 'id', x1: 333.3, y: 292.5, s: 12, al: 'r', f: 'r' },
        { k: 'date', auto: 'date', x1: 461.6, y: 420.0, s: 12, al: 'r', f: 'r' },
        { k: 'l_date', auto: 'date', x1: 328.1, y: 501.2, s: 12, al: 'r', f: 'r' },
        { k: 'name3', x1: 532.5, y: 528.8, s: 12, al: 'r', f: 'r' },
        { k: 'id3', x1: 236.2, y: 528.8, s: 12, al: 'r', f: 'r' },
      ],
      sigs: [{ cx: 150, y: 199, w: 95, h: 38 }, { cx: 262, y: 401, w: 80, h: 27 }],
      stamps: [{ cx: 149, y: 612.6, w: 87 }],
    },
    // ---- a complete, client-specific filing. The PDF is NOT in the repo: it is stored encrypted next to the request
    // (docs/l/<sha256('d:'+token)[:8]>.bin, same key) and loaded as 'enc:doc'. `confirm` must be ticked before signing.
    8: {
      key: 'full21', file: 'enc:doc', encFile: true, title: 'בקשה לבדיקה גנטית ולפסק דין הצהרתי לאבהות, כולל נספחים',
      confirm: 'קראתי את כל המסמך, על כל עמודיו ונספחיו, ואני מאשרת שתוכנו נכון.',
      fields: [
        { k: 'name', hidden: true }, // greeting and file name only; the name is already printed in the document
        { k: 'date', auto: 'date', p: 6, x1: 461.6, y: 420.0, s: 12, al: 'r', f: 'r' },
        { k: 'l_date', auto: 'date', p: 6, x1: 328.1, y: 501.2, s: 12, al: 'r', f: 'r' },
        { k: 'c_line', fixed: 'המצהירה אישרה בחתימתה כי קראה את כל המסמך, על כל עמודיו ונספחיו, וכי תוכנו נכון.', signed: true,
          p: 6, x1: 559, y: 700, s: 10.5, al: 'r', f: 'r' },
      ],
      sigs: [{ p: 6, cx: 150, y: 199, w: 95, h: 38 }, { p: 6, cx: 262, y: 401, w: 80, h: 27 }],
      stamps: [{ p: 6, cx: 149, y: 612.6, w: 87 }],
    },
    // ---- generic complete filing signed by a male declarant (same encrypted-file mechanism as 8).
    // Coordinates below fit the Mordov update notice (affidavit on page index 3). For another filing add a new code.
    9: {
      key: 'fullM', file: 'enc:doc', encFile: true, title: 'הודעת עדכון ורשימת מחלוקות, כולל תצהיר',
      confirm: 'קראתי את כל המסמך במלואו, על כל עמודיו, ואני מאשר שתוכן התצהיר נכון.',
      intro: 'זה המסמך המלא שיוגש לבית המשפט. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בתצהיר.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'c_line', fixed: 'המצהיר אישר, לפני חתימתו, כי קרא את כל המסמך במלואו, על כל עמודיו, וכי תוכן תצהירו נכון.', signed: true,
          p: 3, x1: 540, y: 690, s: 10.5, al: 'r', f: 'r' },
        { k: 'c_label', fixed: 'תאריך החתימה הדיגיטלית:', signed: true, p: 3, x1: 540, y: 706, s: 10.5, al: 'r', f: 'r' },
        { k: 'c_date', auto: 'date', signed: true, p: 3, x1: 413, y: 706, s: 10.5, al: 'r', f: 'r' },
      ],
      sigs: [{ p: 3, cx: 162, y: 345, w: 95, h: 38 }],
    },
  };
  root.SIGN_TEMPLATES = T;
  if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
