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
      // fields with `ask` are filled by the client in sign.html ("פרטי הצד השני"); `join` is composed from other fields
      askTitle: 'פרטי הצד השני (המשיב)',
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
        { k: 'r_first', x0: 450, x1: 523, y: 519, ask: 'שם פרטי', req: true }, { k: 'r_last', x0: 377, x1: 450, y: 519, ask: 'שם משפחה', req: true },
        { k: 'r_id', x0: 235, x1: 377, y: 519, ask: 'מספר תעודת זהות (אם ידוע)', num: true }, { k: 'r_addr', x0: 73, x1: 235, y: 519, ask: 'כתובת מגורים (רחוב, מספר, עיר)', req: true },
        { k: 'r_phone', x0: 377, x1: 523, y: 568, ask: 'טלפון נייד', req: true, tel: true }, { k: 'r_fax', x0: 235, x1: 377, y: 568 }, { k: 'r_email', x0: 73, x1: 235, y: 568, ask: 'דואר אלקטרוני (אם ידוע)' },
        { k: 'between', x0: 274, x1: 386, y: 606, s: 10.5, join: ['r_first', 'r_last'] },
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
    // ---- complete filing signed by a female declarant: urgent-relief request (rabbinical court) with affidavit
    // on page index 4 (Letter) and official form 6 on page index 9 (A4). Same encrypted-file mechanism as 8.
    // Note: y is measured from the top of page 0 (Letter, 792pt) by sign-core, so the A4 signature uses 792-based y.
    10: {
      key: 'fullT', file: 'enc:doc', encFile: true, title: 'בקשה דחופה למתן סעד דחוף, כולל תצהיר וטופס 6',
      confirm: 'קראתי את כל המסמך במלואו, על כל עמודיו, ואני מאשרת שתוכן התצהיר נכון.',
      intro: 'זה המסמך המלא שיוגש לבית הדין. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמני את תיבת האישור, צלמי את תעודת הזהות כולל הספח בכפתור "צילום ת.ז", לחצי "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בתצהיר ובטופס 6.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'c_line', fixed: 'המצהירה אישרה, לפני חתימתה, כי קראה את כל המסמך במלואו, על כל עמודיו, וכי תוכן תצהירה נכון.', signed: true,
          p: 4, x1: 540, y: 640, s: 10.5, al: 'r', f: 'r' },
        { k: 'c_label', fixed: 'תאריך החתימה הדיגיטלית:', signed: true, p: 4, x1: 540, y: 656, s: 10.5, al: 'r', f: 'r' },
        { k: 'c_date', auto: 'date', signed: true, p: 4, x1: 413, y: 656, s: 10.5, al: 'r', f: 'r' },
      ],
      sigs: [{ p: 4, cx: 162, y: 402, w: 95, h: 38 }, { p: 9, cx: 172, y: 300, w: 90, h: 34 }],
    },
    // ---- the legal-aid economic-eligibility affidavit exactly as issued for this client (attachAEM.pdf, Letter,
    // 2 pages, incl. sections 4-5). Stored encrypted like 8-10. Lawyer name/date/stamp appear only once signed.
    11: {
      key: 'aidF', file: 'enc:doc', encFile: true, title: 'תצהיר זכאות לסיוע משפטי',
      confirm: 'קראתי את התצהיר במלואו, ואני מאשרת שתוכנו נכון.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'date', auto: 'date', x0: 365, x1: 538, y: 747, s: 11 },
        { k: 'l_name', fixed: 'ערן בן שושן', signed: true, x0: 298, x1: 501, y: 467, s: 11 },
        { k: 'l_date1', auto: 'date', signed: true, x0: 107, x1: 195, y: 469, s: 10.5, white: [107, 458, 195, 473] },
        { k: 'l_date2', auto: 'date', signed: true, p: 1, x0: 365, x1: 538, y: 127, s: 11 },
      ],
      sigs: [{ cx: 160, y: 414, w: 110, h: 40 }, { cx: 160, y: 750, w: 110, h: 40 }],
      stamps: [{ cx: 160, y: 562, w: 95 }, { p: 1, cx: 160, y: 128, w: 95 }],
    },
    // ---- client fee agreement (Eran's own docx, Letter, 3 pages). Stored encrypted like 8-11. The signing date is
    // written on the "נערך ונחתם ביום" line only on the signed copy; the client's signature goes on page index 2.
    12: {
      key: 'feeF', file: 'enc:doc', encFile: true, title: 'הסכם שכר טרחה',
      confirm: 'קראתי את כל ההסכם, על כל עמודיו, ואני מסכימה לתנאיו.',
      intro: 'זה הסכם שכר הטרחה. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמני את תיבת האישור, לחצי "חתימה" ואז "שלח לעורך הדין". תאריך החתימה ייכנס להסכם אוטומטית.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'date', auto: 'date', signed: true, x0: 318, x1: 438, y: 114.5, s: 11.5, f: 'r' },
      ],
      sigs: [{ p: 2, cx: 150, y: 352, w: 105, h: 40 }],
    },
    // ---- ID photos only (front + ספח), no signature: for replacing the ID appendix of documents already signed
    13: {
      key: 'idOnly', file: null, title: 'צילום תעודת זהות וספח', idPhoto: true, noSign: true,
      fields: [{ k: 'name', hidden: true }], sigs: [],
    },
    // ---- same as 11 (aidF) for an attachAEM.pdf whose top block sits ~29pt higher (signature label at y 387-404,
    // lawyer line at 428-444). Added for a client whose affidavit layout differed; 11 stays unchanged.
    14: {
      key: 'aidF2', file: 'enc:doc', encFile: true, title: 'תצהיר זכאות לסיוע משפטי',
      confirm: 'קראתי את התצהיר במלואו, ואני מאשרת שתוכנו נכון.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'date', auto: 'date', x0: 365, x1: 538, y: 733, s: 11 },
        { k: 'l_name', fixed: 'ערן בן שושן', signed: true, x0: 298, x1: 501, y: 438, s: 11 },
        { k: 'l_date1', auto: 'date', signed: true, x0: 107, x1: 195, y: 440, s: 10.5, white: [107, 428, 195, 444] },
        { k: 'l_date2', auto: 'date', signed: true, p: 1, x0: 365, x1: 538, y: 112, s: 11 },
      ],
      sigs: [{ cx: 160, y: 385, w: 110, h: 40 }, { cx: 160, y: 736, w: 110, h: 40 }],
      stamps: [{ cx: 160, y: 548, w: 95 }, { p: 1, cx: 160, y: 113, w: 95 }],
    },
    // ---- two-party agreement signed in sequence (Davidov parenting-time agreement, Letter, 3 pages, enc:doc).
    // Stage 1: the first party (male) signs; sign.html then builds a link for the second party that carries his
    // signature strokes + signing date, AES-GCM encrypted with the token key (#<token>.<payload>).
    // Stage 2: the second party (female) enters her ID number, signs, and only then the PDF with BOTH signatures
    // goes to the lawyer. `final` fields are drawn only on the completed copy. Values: name, name2 (greeting only).
    15: {
      key: 'agree2', file: 'enc:doc', encFile: true, title: 'הסכם הסדרי שהות', twoStep: true,
      askTitle: 'פרטייך להשלמה בהסכם',
      parties: [
        { k: 'name', g: 'm',
          intro: 'זה ההסכם המלא. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור ולחץ "חתימה". אחר כך לחץ "שלח ל{other} לחתימה" ובחר את {other} בוואטסאפ. אחרי שגם היא תחתום, ההסכם החתום יישלח לעורך הדין.',
          confirm: 'קראתי את כל ההסכם, על כל עמודיו, ואני מסכים לתנאיו.',
          sigs: [{ p: 1, cx: 407, y: 656, w: 112, h: 40 }], dateLine: { p: 1, cx: 407, y: 688 } },
        { k: 'name2', g: 'f',
          intro: '{other} כבר חתם על ההסכם. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), מלאי את מספר תעודת הזהות שלך ולחצי "שמור פרטים", סמני את תיבת האישור, לחצי "חתימה" ואז "שלח לעורך הדין".',
          confirm: 'קראתי את כל ההסכם, על כל עמודיו, ואני מסכימה לתנאיו.',
          sigs: [{ p: 1, cx: 192, y: 656, w: 112, h: 40 }], dateLine: { p: 1, cx: 192, y: 688 } },
      ],
      fields: [
        { k: 'name', hidden: true }, { k: 'name2', hidden: true },
        { k: 'r_id', step: 2, ask: 'מספר תעודת הזהות שלך', req: true, num: true, x0: 297, x1: 369, y: 149.5, s: 11, f: 'r', white: [297, 141, 369, 153] },
        { k: 'date', auto: 'date', final: true, x0: 208, x1: 281, y: 94, s: 11, f: 'r', white: [208, 86, 281, 98] },
      ],
      sigs: [],
    },
    // ---- regular appointment letter (מינוי רגיל, not direct access) as an appendix: the office own PDF, stored
    // encrypted like 8-12 (enc:doc), so the appendix is identical to what the legal-aid office issued. No fields.
    16: {
      key: 'minuiF', file: 'enc:doc', encFile: true, title: 'כתב מינוי', appendix: 'כתב מינוי להענקת שירות משפטי',
      fields: [], sigs: [],
    },
    // ---- complete filing signed by a male declarant, affidavit on page index 8 (Letter, 9 pages): Mordov response
    // to a protection-order request. Same encrypted-file mechanism as 8-10; coordinates from pdftotext -bbox.
    17: {
      key: 'fullM9', file: 'enc:doc', encFile: true, title: 'תגובה לבקשה למתן צו הגנה, כולל תצהיר',
      confirm: 'קראתי את כל המסמך במלואו, על כל עמודיו, ואני מאשר שתוכן התצהיר נכון.',
      intro: 'זה המסמך המלא שיוגש לבית המשפט. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בתצהיר.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'c_line', fixed: 'המצהיר אישר, לפני חתימתו, כי קרא את כל המסמך במלואו, על כל עמודיו, וכי תוכן תצהירו נכון.', signed: true,
          p: 8, x1: 540, y: 714, s: 10.5, al: 'r', f: 'r' },
        { k: 'c_label', fixed: 'תאריך החתימה הדיגיטלית:', signed: true, p: 8, x1: 540, y: 730, s: 10.5, al: 'r', f: 'r' },
        { k: 'c_date', auto: 'date', signed: true, p: 8, x1: 413, y: 730, s: 10.5, al: 'r', f: 'r' },
      ],
      sigs: [{ p: 8, cx: 162, y: 578, w: 95, h: 36 }],
    },
    // ---- same as 14 (aidF2) for a shorter attachAEM.pdf (sections 1-3 only): the top block sits ~29pt higher
    // (signature label at y 359-375, lawyer line at 399-416), the waiver signature at 695-711, page 2 at 69-86.
    18: {
      key: 'aidF3', file: 'enc:doc', encFile: true, title: 'תצהיר זכאות לסיוע משפטי',
      confirm: 'קראתי את התצהיר במלואו, ואני מאשרת שתוכנו נכון.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'date', auto: 'date', x0: 365, x1: 538, y: 690, s: 11 },
        { k: 'l_name', fixed: 'ערן בן שושן', signed: true, x0: 298, x1: 501, y: 409, s: 11 },
        { k: 'l_date1', auto: 'date', signed: true, x0: 107, x1: 195, y: 411, s: 10.5, white: [107, 399, 195, 415] },
        { k: 'l_date2', auto: 'date', signed: true, p: 1, x0: 365, x1: 538, y: 66, s: 11 },
      ],
      sigs: [{ cx: 160, y: 357, w: 110, h: 40 }, { cx: 160, y: 693, w: 110, h: 40 }],
      stamps: [{ cx: 160, y: 519, w: 95 }, { p: 1, cx: 160, y: 67, w: 95 }],
    },
    // ---- two witness affidavits of a female declarant, merged (Letter, 4 pages, 2 per affidavit, enc:doc).
    // She signs once; the signature goes on her line in both affidavits (pages 0 and 2). On the signed copy only,
    // the attestation date replaces the "ביום ____" blank (pages 1 and 3) and the lawyer stamp sits on his line.
    19: {
      key: 'aff2F', file: 'enc:doc', encFile: true, title: 'תצהיר עדות',
      confirm: 'קראתי את שני התצהירים במלואם, ואני מאשרת שתוכנם נכון.',
      intro: 'אלה שני תצהירים זהים, אחד לכל תיק בבית המשפט. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמני את תיבת האישור, לחצי "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בשני התצהירים.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'l_date1', auto: 'date', signed: true, p: 1, x0: 395, x1: 445, y: 118.5, s: 11, f: 'r', white: [394, 107.5, 446, 121.5] },
        { k: 'l_date2', auto: 'date', signed: true, p: 3, x0: 395, x1: 445, y: 118.5, s: 11, f: 'r', white: [394, 107.5, 446, 121.5] },
      ],
      sigs: [{ p: 0, cx: 162, y: 645, w: 100, h: 38 }, { p: 2, cx: 162, y: 645, w: 100, h: 38 }],
      stamps: [{ p: 1, cx: 162, y: 195.5, w: 95 }, { p: 3, cx: 162, y: 195.5, w: 95 }],
    },
    // ---- same as 11 (aidF) for an attachAEM.pdf whose page-1 block sits ~28pt lower (applicant line 445, lawyer
    // line 592.5) and whose waiver signature/date lines moved to the top of page 2 (lines 50.5 and 155.5).
    20: {
      key: 'aidF4', file: 'enc:doc', encFile: true, title: 'תצהיר זכאות לסיוע משפטי',
      confirm: 'קראתי את התצהיר במלואו, ואני מאשרת שתוכנו נכון.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'date', auto: 'date', p: 1, x0: 365, x1: 538, y: 45, s: 11 },
        { k: 'l_name', fixed: 'ערן בן שושן', signed: true, x0: 298, x1: 501, y: 494.5, s: 11 },
        { k: 'l_date1', auto: 'date', signed: true, x0: 107, x1: 195, y: 496.5, s: 10.5, white: [107, 485.5, 195, 500.5] },
        { k: 'l_date2', auto: 'date', signed: true, p: 1, x0: 365, x1: 538, y: 152.5, s: 11 },
      ],
      sigs: [{ cx: 160, y: 443, w: 110, h: 40 }, { p: 1, cx: 160, y: 48, w: 110, h: 40 }],
      stamps: [{ cx: 160, y: 590.5, w: 95 }, { p: 1, cx: 142, y: 153.5, w: 90 }],
    },
    // ---- two statements of defence of a male defendant, merged without appendices (Letter, 21 pages, enc:doc);
    // each ends with his affidavit (page index 10 and 20). He signs once; the signature goes on both affidavits.
    // Signed copy only: the attestation date replaces "ביום ____" and the lawyer stamp sits on his line.
    21: {
      key: 'def2M', file: 'enc:doc', encFile: true, title: 'כתבי הגנה ותצהירים',
      confirm: 'קראתי את שני כתבי ההגנה במלואם, על כל עמודיהם, ואני מאשר שתוכן התצהירים נכון.',
      intro: 'אלה שני כתבי ההגנה שיוגשו לבית המשפט, ובסוף כל אחד מהם התצהיר שלך. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בשני התצהירים.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'l_date1', auto: 'date', signed: true, p: 10, x0: 392, x1: 442, y: 379.5, s: 11, f: 'r', white: [391, 368.5, 443, 382.5] },
        { k: 'l_date2', auto: 'date', signed: true, p: 20, x0: 392, x1: 442, y: 379.5, s: 11, f: 'r', white: [391, 368.5, 443, 382.5] },
      ],
      sigs: [{ p: 10, cx: 162, y: 303, w: 100, h: 38 }, { p: 20, cx: 162, y: 303, w: 100, h: 38 }],
      stamps: [{ p: 10, cx: 162, y: 456.5, w: 95 }, { p: 20, cx: 162, y: 456.5, w: 95 }],
    },
    // ---- agreed motion to give the parties' agreement the force of a judgment (rabbinical court, Letter, 2 pages,
    // enc:doc). The female applicant signs on her line on page index 1 (right side, line at y≈397); on the signed copy
    // a read-and-agree confirmation line and the signing date are written under her name.
    22: {
      key: 'agreeF', file: 'enc:doc', encFile: true, title: 'בקשה מוסכמת למתן תוקף של פסק דין להסכמות הצדדים',
      confirm: 'קראתי את כל ההסכם במלואו, על כל עמודיו, ואני מאשרת שאני מסכימה לכל האמור בו.',
      intro: 'זו הבקשה המוסכמת עם ההסכמות שלכם, כפי שתוגש לבית הדין. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמני את תיבת האישור שקראת, לחצי "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בשורה שלך בעמוד 2.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'c_line', fixed: 'המבקשת אישרה, לפני חתימתה, כי קראה את כל ההסכם במלואו וכי היא מסכימה לכל האמור בו.', signed: true,
          p: 1, x1: 540, y: 432, s: 10, al: 'r', f: 'r' },
        { k: 'c_label', fixed: 'תאריך החתימה הדיגיטלית:', signed: true, p: 1, x1: 540, y: 447, s: 10, al: 'r', f: 'r' },
        { k: 'c_date', auto: 'date', signed: true, p: 1, x1: 420, y: 447, s: 10, al: 'r', f: 'r' },
      ],
      sigs: [{ p: 1, cx: 494.6, y: 396, w: 100, h: 38 }],
    },
    // ---- read-only draft for a male client (enc:doc): no signature, no fields; shown for reading and comments only.
    23: {
      key: 'readM', file: 'enc:doc', encFile: true, title: 'טיוטה לקריאה', noSign: true,
      confirm: 'קראתי את הטיוטה במלואה, על כל עמודיה.',
      intro: 'זו טיוטה לקריאה בלבד, ואין צורך לחתום עליה. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך). הערות ותשובות לשאלות שלי שלח לי ישירות בוואטסאפ.',
      fields: [{ k: 'name', hidden: true }],
      sigs: [],
    },
    // ---- rabbinical-court maintenance filings for a female client (enc:doc, 35 pages): pages 0-14 = urgent request to
    // extend interim maintenance (Letter; affidavit on page 3), pages 15-34 = counterclaim package (A4 form 305-016-05
    // signature on page 17; maintenance particulars affidavit on page 34). Template y values are relative to page 0
    // height (792); A4 pages are offset by -50. Lawyer stamp/dates appear only on the signed copy.
    24: {
      key: 'rbcMz', file: 'enc:doc', encFile: true, title: 'בקשה דחופה להארכת מזונות ותביעה שכנגד',
      confirm: 'קראתי את כל המסמכים במלואם, על כל עמודיהם, ואני מאשרת שתוכן התצהירים נכון.',
      intro: 'אלה המסמכים שיוגשו לבית הדין הרבני: הבקשה הדחופה להארכת המזונות הזמניים, והתביעה שכנגד להגדלת המזונות עם הרצאת הפרטים. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמני את תיבת האישור, לחצי "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בכל המקומות הנדרשים.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'l_date1', auto: 'date', signed: true, p: 3, x0: 256, x1: 312, y: 353, s: 10.5, f: 'r', white: [253, 342, 315, 356] },
        { k: 'c_date1', auto: 'date', signed: true, p: 34, x0: 349, x1: 485, y: 347, s: 10.5, f: 'r' },
        { k: 'l_date2', auto: 'date', signed: true, p: 34, x0: 107, x1: 191, y: 466, s: 10, f: 'r', white: [104, 455, 194, 469] },
        { k: 'l_date3', auto: 'date', signed: true, p: 34, x0: 412, x1: 512, y: 594, s: 10.5, f: 'r' },
      ],
      sigs: [{ p: 3, cx: 162, y: 290, w: 100, h: 38 }, { p: 17, cx: 104, y: 617, w: 90, h: 34 }, { p: 34, cx: 176, y: 349, w: 100, h: 36 }],
      stamps: [{ p: 3, cx: 162, y: 438, w: 68 }, { p: 34, cx: 143, y: 601, w: 68 }],
    },
    // ---- rabbinical-court custody filings for a female client (enc:doc, 45 pages): pages 0-8 = urgent request (A4 form
    // 307-023-03 signature on page 1; Letter affidavit on page 8), pages 9-44 = custody claim (A4 form 305-016-05
    // signature on page 11). Template y values are relative to page 0 height (842); Letter pages are offset by +50.
    25: {
      key: 'rbcCu', file: 'enc:doc', encFile: true, title: 'תביעת החזקת קטינים ובקשה דחופה',
      confirm: 'קראתי את כל המסמכים במלואם, על כל עמודיהם, ואני מאשרת שתוכן התצהיר נכון.',
      intro: 'אלה המסמכים שיוגשו לבית הדין הרבני בעניין הילדים: הבקשה הדחופה עם התצהיר שלך, והתביעה עם הנספחים. קראי את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמני את תיבת האישור, לחצי "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בכל המקומות הנדרשים.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'c_date1', auto: 'date', signed: true, p: 8, x0: 445, x1: 501, y: 399, s: 10.5, f: 'r', white: [442, 388, 504, 402] },
        { k: 'l_date1', auto: 'date', signed: true, p: 8, x0: 191, x1: 247, y: 475, s: 10.5, f: 'r', white: [188, 464, 250, 478] },
      ],
      sigs: [{ p: 1, cx: 105, y: 618, w: 90, h: 34 }, { p: 8, cx: 162, y: 358, w: 100, h: 38 }, { p: 11, cx: 104, y: 667, w: 90, h: 34 }],
      stamps: [{ p: 8, cx: 162, y: 560, w: 68 }],
    },
    // ---- applicants' position (family court, Letter, 3 pages, enc:doc) signed by a male declarant: the affidavit is on
    // page index 2 (declarant line at y≈339). Signed copy only: the attestation date replaces "ביום ____" and the lawyer
    // stamp sits on his line (y≈519).
    26: {
      key: 'amdaM', file: 'enc:doc', encFile: true, title: 'עמדה לבית המשפט, כולל תצהיר',
      confirm: 'קראתי את כל המסמך במלואו, על כל עמודיו, ואני מאשר שתוכן התצהיר נכון.',
      intro: 'זה המסמך המלא שיוגש לבית המשפט. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בתצהיר.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'l_date1', auto: 'date', signed: true, p: 2, x0: 197, x1: 266, y: 428.5, s: 11, f: 'r', white: [196, 418, 267, 432] },
      ],
      sigs: [{ p: 2, cx: 162, y: 339, w: 100, h: 38 }],
      stamps: [{ p: 2, cx: 162, y: 519, w: 68 }],
    },
    // ---- same as 26 (amdaM) with a date blank to the right of the declarant's line (page index 2, x 450-520):
    // the signing date is written on it on the signed copy.
    27: {
      key: 'amdaM2', file: 'enc:doc', encFile: true, title: 'עמדה לבית המשפט, כולל תצהיר',
      confirm: 'קראתי את כל המסמך במלואו, על כל עמודיו, ואני מאשר שתוכן התצהיר נכון.',
      intro: 'זה המסמך המלא שיוגש לבית המשפט. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה ותאריך החתימה ייכנסו בתצהיר.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'c_date', auto: 'date', signed: true, p: 2, x0: 450, x1: 520, y: 336, s: 11, f: 'r' },
        { k: 'l_date1', auto: 'date', signed: true, p: 2, x0: 197, x1: 266, y: 428.5, s: 11, f: 'r', white: [196, 418, 267, 432] },
      ],
      sigs: [{ p: 2, cx: 162, y: 339, w: 100, h: 38 }],
      stamps: [{ p: 2, cx: 162, y: 519, w: 68 }],
    },
    // ---- 28: as 21 (def2M) for the final versions of 11.11.2026: 76801 = pages 0-19 (affidavit p19), 3473 = pages 20-37 (affidavit p37).
    28: {
      key: 'def3M', file: 'enc:doc', encFile: true, title: 'כתבי הגנה ותצהירים',
      confirm: 'קראתי את שני כתבי ההגנה במלואם, על כל עמודיהם, ואני מאשר שתוכן התצהירים נכון.',
      intro: 'אלה שני כתבי ההגנה בגרסתם הסופית, כפי שיוגשו לבית המשפט, ובסוף כל אחד מהם התצהיר שלך. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בשני התצהירים.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'l_date1', auto: 'date', signed: true, p: 19, x0: 392, x1: 442, y: 379.5, s: 11, f: 'r', white: [391, 368.5, 443, 382.5] },
        { k: 'l_date2', auto: 'date', signed: true, p: 37, x0: 392, x1: 442, y: 379.5, s: 11, f: 'r', white: [391, 368.5, 443, 382.5] },
      ],
      sigs: [{ p: 19, cx: 162, y: 303, w: 100, h: 38 }, { p: 37, cx: 162, y: 303, w: 100, h: 38 }],
      stamps: [{ p: 19, cx: 162, y: 456.5, w: 95 }, { p: 37, cx: 162, y: 456.5, w: 95 }],
    },
    // ---- 29: as 28 after the plaintiff-exhibit annexes were added (13.11.2026): 76801 = pages 0-19 (affidavit p19), 3473 = pages 20-38 (affidavit p38).
    29: {
      key: 'def4M', file: 'enc:doc', encFile: true, title: 'כתבי הגנה ותצהירים',
      confirm: 'קראתי את שני כתבי ההגנה במלואם, על כל עמודיהם, ואני מאשר שתוכן התצהירים נכון.',
      intro: 'אלה שני כתבי ההגנה בגרסתם הסופית, כפי שיוגשו לבית המשפט, ובסוף כל אחד מהם התצהיר שלך. קרא את כל העמודים (אפשר לפתוח במסך מלא בכפתור שמתחת למסמך), סמן את תיבת האישור, לחץ "חתימה" ואז "שלח לעורך הדין". החתימה תיכנס בשני התצהירים.',
      fields: [
        { k: 'name', hidden: true },
        { k: 'l_date1', auto: 'date', signed: true, p: 19, x0: 392, x1: 442, y: 379.5, s: 11, f: 'r', white: [391, 368.5, 443, 382.5] },
        { k: 'l_date2', auto: 'date', signed: true, p: 38, x0: 392, x1: 442, y: 379.5, s: 11, f: 'r', white: [391, 368.5, 443, 382.5] },
      ],
      sigs: [{ p: 19, cx: 162, y: 303, w: 100, h: 38 }, { p: 38, cx: 162, y: 303, w: 100, h: 38 }],
      stamps: [{ p: 19, cx: 162, y: 456.5, w: 95 }, { p: 38, cx: 162, y: 456.5, w: 95 }],
    },
  };
  root.SIGN_TEMPLATES = T;
  if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
