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
  };
  root.SIGN_TEMPLATES = T;
  if (typeof module !== 'undefined') module.exports = T;
})(typeof window !== 'undefined' ? window : globalThis);
