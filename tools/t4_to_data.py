#!/usr/bin/env python3
"""Convert the answers JSON sent from t4.html into data.json for tofes-4/build_tofes4.py.

usage: t4_to_data.py answers.json data.json --city "באר שבע" [--male] [--case-no X]
                     [--date 2.11.2026] [--amount "2,400 ש\"ח ..."]

Prints a list of gaps/warnings to stdout. Nothing is invented: a missing answer
becomes "___" so it is visible in the draft.
"""
import argparse, json, re, sys
from datetime import date

GAP = '___'


def num(s):
    s = re.sub(r'[^\d.]', '', str(s or ''))
    try:
        return float(s) if s else 0.0
    except ValueError:
        return 0.0


def fmt(n):
    return f"{int(round(n)):,}"


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('answers'); ap.add_argument('out')
    ap.add_argument('--city', required=True, help='עיר בית המשפט לענייני משפחה')
    ap.add_argument('--male', action='store_true', help='התובע גבר (ברירת מחדל: תובעת)')
    ap.add_argument('--case-no', default='')
    ap.add_argument('--case-type', default='תלה"מ')
    ap.add_argument('--date', default=date.today().strftime('%-d.%-m.%Y'))
    ap.add_argument('--amount', default='', help='סכום נתבע, זהה לכתב התביעה. אם חסר, מוצעת הצעה מחושבת')
    o = ap.parse_args()

    src = json.load(open(o.answers, encoding='utf8'))
    A, FL, DOCS = src.get('answers', {}), src.get('flags', {}), src.get('docs', {})
    warn = []
    me_t = 'התובע' if o.male else 'התובעת'
    oth_t = 'הנתבעת' if o.male else 'הנתבע'
    unk = f'לא ידוע ל{me_t}'

    def v(k, default=GAP):
        if FL.get(k) == 'unk':
            return unk
        if FL.get(k) == 'none':
            return 'אין'
        x = A.get(k)
        if x is None or str(x).strip() == '':
            if default == GAP:
                warn.append(f'חסר: {k}')
            return default
        return str(x).strip()

    kids = A.get('kids', [])
    if not kids:
        warn.append('חסר: פרטי הקטינים')
    kid_desc = ', '.join(f"{k.get('name', GAP)}, ת.ז {k.get('id', GAP)}" for k in kids) or GAP
    kid_word = 'הקטין/ה' if len(kids) <= 1 else 'הקטינים'
    parent_word = ('אבי' if o.male else 'אם') + ' ' + kid_word

    party = {'role': me_t, 'name': v('me.name'), 'id': v('me.id'), 'address': v('me.address'),
             'birthdate': v('me.birth'),
             'relation': ''}
    party['relation'] = f"{'אבי' if o.male else 'אם'} {kid_desc}, ו{'אפוטרופסו' if o.male else 'אפוטרופסיתם' if len(kids) > 1 else 'אפוטרופסיתו/ה'} הטבעי{'' if o.male else 'ת'}"
    counter = {'role': oth_t, 'name': v('other.name'), 'id': v('other.id'), 'address': v('other.address'),
               'birthdate': v('other.birth'), 'relation': ('אם' if o.male else 'אבי') + ' ' + kid_word}

    # a6 prior proceedings
    pe = A.get('prior.exists')
    prior = {'exists': pe == 'yes'}
    if pe == 'yes':
        prior['where'] = v('prior.what'); prior['outcome'] = v('prior.decided')
    elif pe is None:
        warn.append('חסר: האם היו הליכים קודמים (א6)')

    # a7 last payment
    last_amt = v('last.amount')
    if num(last_amt):
        last_amt = f"{fmt(num(last_amt))} ש\"ח לחודש"
    if A.get('last.note'):
        last_amt += '. ' + A['last.note'].strip()
    last = {'amount': last_amt, 'when': v('last.when')}

    # a8 income
    inc = [{'period': r.get('months', '') or '12 החודשים האחרונים', 'source': r.get('source', ''),
            'gross': r.get('gross', ''), 'net': r.get('net', '') or r.get('gross', '')}
           for r in A.get('income.rows', [])]
    if A.get('income.employer') and not any(A['income.employer'] in r['source'] for r in inc):
        inc.insert(0, {'period': '', 'source': f"עבודה: {A['income.employer']}", 'gross': '', 'net': ''})
    if not inc:
        warn.append('חסר: הכנסות (א8)')

    # a9 counter income
    inc_c, note_c = [], ''
    if A.get('his.known') == 'yes' and A.get('his.amount') and FL.get('his.amount') != 'unk':
        inc_c = [{'period': '12 החודשים האחרונים (לפי מיטב ידיעת ' + me_t + ')',
                  'source': A.get('his.job', ''), 'gross': '', 'net': f"כ-{fmt(num(A['his.amount']))}"}]
    job = A.get('his.job', '')
    note_c = (f"{oth_t} {'עובד' if not o.male else 'עובדת'}{' כ' + job if job else ''}. " if job else '') + \
        f"גובה הכנסות{'יו' if not o.male else 'יה'} המדויק אינו ידוע ל{me_t}. " + \
        (A.get('his.note', '').strip() + ' ' if A.get('his.note') else '') + \
        f"משכך מתבקש בית המשפט להורות ל{oth_t} להגיש הרצאת פרטים מטעמ{'ו' if not o.male else 'ה'} בצירוף תלושי שכר ל-12 החודשים האחרונים ותדפיסי חשבונות בנק."

    # a10 assets, a11 debts
    car_me = v('car.me'); car_him = v('car.him')
    assets = {'party': v('assets.me'), 'counter': v('assets.him')}
    dme = [] if FL.get('debts.me') == 'none' else [
        {'creditor': r.get('creditor', ''), 'periodic': (r.get('monthly') and f"{r['monthly']} ש\"ח לחודש") or '—',
         'total': (r.get('total') and f"{r['total']} ש\"ח") or ''} for r in A.get('debts.me', [])]
    if FL.get('debts.me') == 'none':
        dme = [{'creditor': 'אין', 'periodic': '', 'total': ''}]
    dhim_txt = v('debts.him', unk)
    debts = {'party': dme, 'counter': [{'creditor': dhim_txt, 'periodic': '', 'total': ''}]}

    # a12 housing
    ht = A.get('home.type')
    rent, aid, mort = num(A.get('home.rent')), num(A.get('home.aid')), num(A.get('home.mortgage'))
    maint_keys = ['exp.arnona', 'exp.electric', 'exp.water', 'exp.gas', 'exp.vaad', 'exp.net']
    maint = sum(num(A.get(k)) for k in maint_keys)
    addr = party['address']
    tdesc = {'rent': 'דירה שכורה', 'own': 'דירה בבעלות ' + me_t, 'public': 'דיור ציבורי', 'family': 'מתגוררת אצל בני משפחה'}.get(ht, '')
    hd = addr + (f" — {tdesc}" if tdesc else '')
    if rent:
        hd += f". שכר דירה {fmt(rent)} ש\"ח לחודש" + (f", בניכוי סיוע בשכר דירה בסך {fmt(aid)} ש\"ח" if aid else '')
    if mort:
        hd += f". החזר משכנתא {fmt(mort)} ש\"ח לחודש"
    if maint:
        parts = [(lbl, num(A.get(k))) for lbl, k in [('ארנונה', 'exp.arnona'), ('חשמל', 'exp.electric'), ('מים', 'exp.water'),
                                                    ('גז', 'exp.gas'), ('ועד בית', 'exp.vaad'), ('אינטרנט', 'exp.net')] if num(A.get(k))]
        hd += f". הוצאות אחזקת המדור כ-{fmt(maint)} ש\"ח לחודש: " + ', '.join(f"{l} כ-{fmt(x)} ש\"ח" for l, x in parts)
    housing = {'party': {'address': hd, 'rooms': v('home.rooms'), 'persons': v('home.persons')},
               'counter': {'address': v('home.him_address', counter['address']) if FL.get('home.him_address') != 'unk' else counter['address'],
                           'rooms': v('home.him_rooms', unk), 'persons': v('home.him_persons', unk)}}

    banks = A.get('banks', [])
    if not banks:
        warn.append('חסר: חשבונות בנק (א13)')
    car = f"{me_t}: {car_me if car_me != 'אין' else 'אין מכונית'}. {oth_t}: {car_him if car_him != 'אין' else 'אין מכונית'}"

    # a15 amount: children's needs + housing share (30% / 40% / 50% for 1 / 2 / 3+ children)
    kid_keys = ['exp.food', 'exp.clothes', 'exp.school', 'exp.after', 'exp.health', 'exp.other_kids']
    needs = sum(num(A.get(k)) for k in kid_keys)
    housing_total = max(rent - aid, 0) + mort + maint
    share = {1: .3, 2: .4}.get(len(kids), .5) if kids else .3
    suggestion = needs + housing_total * share
    if o.amount:
        amount = o.amount
    elif suggestion:
        amount = (f"{fmt(suggestion)} ש\"ח לחודש עבור {kid_word} {kid_desc}: {fmt(needs)} ש\"ח צרכים שוטפים, "
                  f"ו-{fmt(housing_total * share)} ש\"ח חלק{len(kids) > 1 and 'ם' or 'ו/ה'} במדור ובאחזקתו "
                  f"({int(share * 100)}% מסך של {fmt(housing_total)} ש\"ח). בנוסף מתבקשת השתתפות {oth_t} "
                  f"במחצית ההוצאות החריגות, הרפואיות והחינוכיות, שאינן כלולות בסכום זה")
        warn.append(f'א15: הסכום ({fmt(suggestion)}) הוא הצעה מחושבת מהתשובות. חובה להשוות לסכום שבכתב התביעה ולהעביר --amount')
    else:
        amount = GAP; warn.append('חסר: סכום המזונות הנדרש (א15)')
    if A.get('exp.special'):
        warn.append('הוצאות מיוחדות שהלקוח/ה ציינ/ה: ' + A['exp.special'])

    # part B / C
    st = A.get('family.status')
    married = st in ('married', 'separated', 'divorced')
    st_txt = {'married': 'ההורים נשואים', 'separated': 'ההורים נשואים ופרודים',
              'divorced': 'ההורים גרושים', 'never': 'ההורים אינם בני זוג ומעולם לא נישאו'}.get(st, GAP)
    if st is None:
        warn.append('חסר: המצב המשפחתי (ג1)')
    if A.get('family.married_on') and married:
        st_txt += f" (נישאו ביום {A['family.married_on']})"
    vis = []
    if A.get('family.visits_then'):
        vis.append(f"בעבר שהו {kid_word} עם {oth_t}: {A['family.visits_then']}")
    if A.get('family.visits_now'):
        vis.append(f"כיום: {A['family.visits_now']}")
    custody_who = {'me': f"במשמורת{'ו' if o.male else 'ה'} ובחזקת{'ו' if o.male else 'ה'} של {me_t}",
                   'other': f"בחזקת {oth_t}", 'shared': 'במשמורת משותפת'}.get(A.get('family.custody'), GAP)
    custody = f"{kid_desc} {'מצויים' if len(kids) > 1 else 'מצוי/ה'} {custody_who}" + \
        (f" מיום {A['family.custody_since']}" if A.get('family.custody_since') else '') + \
        ('. ' + '; '.join(vis) if vis else '')

    def citrow(name, k):
        val = v(k)
        parts = [x.strip() for x in re.split(r'[,،]', val, maxsplit=1)]
        return {'name': name, 'citizenship': parts[0], 'religion': parts[1] if len(parts) > 1 else ('' if val == unk else GAP)}
    cits = [citrow(f"{party['name']} ({me_t})", 'cit.me'), citrow(f"{counter['name']} ({oth_t})", 'cit.him')]
    for k in kids:
        cits.append(citrow(f"{k.get('name', '')} ({'קטין/ה'})", 'cit.kids'))

    hk = A.get('hiskids.has')
    rk = [{'name': r.get('name', ''), 'age': r.get('age', ''), 'support': r.get('pays', '') or unk}
          for r in A.get('hiskids.rows', [])] if hk == 'yes' else \
        [{'name': f"אין ל{oth_t} ילדים נוספים" if hk == 'no' else unk, 'age': '—', 'support': '—'}]
    ph = A.get('partner.has')
    partner = {'yes': 'כן. ' + A.get('partner.note', ''), 'no': 'לא', 'unk': unk}.get(ph, unk)
    mk = [{'name': r.get('name', ''), 'age': r.get('age', ''), 'support': r.get('pays', '')}
          for r in A.get('mykids.rows', [])] if A.get('mykids.has') == 'yes' else []

    c = {'parents_status': st_txt, 'separated_since': v('family.since', '—') if st != 'married' else '—',
         'minor_domicile': f"{kid_desc}, {'מתגוררים' if len(kids) > 1 else 'מתגורר/ת'} עם {me_t} ב{addr}"
         if A.get('family.custody') == 'me' else GAP,
         'citizenship': cits, 'custody': custody, 'respondent_other_kids': rk,
         'respondent_partner': partner, 'custodian_other_kids': mk}

    # attachments / annexes from docs actually sent
    order = ['bl', 'pay', 'bank_st', 'bank_pay', 'agreement', 'lease', 'aid', 'debts_doc', 'tz', 'receipts', 'bills', 'his_pay', 'other']
    letters = 'אבגדהוזחטיכלמנסעפצקרשת'
    annexes, att = [], []
    files_sent = []
    for k in order:
        dd = DOCS.get(k)
        if not dd or dd.get('state') != 'has':
            if dd and dd.get('state') in ('later', 'open') and k in ('bl', 'pay', 'bank_st', 'agreement', 'tz') and not (k == 'pay' and A.get('income.work') == 'no') and not (k == 'agreement' and A.get('prior.exists') != 'yes'):
                warn.append(f"מסמך לא התקבל: {dd.get('name')} ({'אשלח בהמשך' if dd['state'] == 'later' else 'לא טופל'})")
            continue
        annexes.append({'letter': letters[len(annexes)], 'title': dd['name'], 'sub': '', 'files': dd.get('files', [])})
        att.append(dd['name'])
        files_sent += dd.get('files', [])

    sig = party['name']
    dec = (f"{'אני החתום' if o.male else 'אני החתומה'} מטה, {sig}, ת.ז. {party['id']}, לאחר "
           f"{'שהוזהרתי' } כי עליי לומר את האמת כולה ואת האמת בלבד וכי אם לא אעשה כן אהיה {'צפוי' if o.male else 'צפויה'} "
           f"לעונשים הקבועים בחוק, {'מצהיר' if o.male else 'מצהירה'} בזאת כי כל הפרטים שמסרתי לעיל בהרצאת פרטים זו נכונים "
           f"ואמיתיים, וכי הפרטים הנוגעים ל{oth_t} נמסרו לפי מיטב ידיעתי ואמונתי. זהו שמי, זו חתימתי, ותוכן תצהירי אמת.")
    TITLE = 'מר' if o.male else "הגב'"
    atty = (f"אני החתום מטה, עורך דין ערן בן שושן, מאשר בזה כי ביום {o.date} {'הופיע' if o.male else 'הופיעה'} לפניי "
            f"{TITLE} {sig}, {'אשר זיהיתיו' if o.male else 'אשר זיהיתיה'} לפי תעודת זהות מספר {party['id']}, "
            f"ולאחר {'שהזהרתיו' if o.male else 'שהזהרתיה'} כי {'עליו' if o.male else 'עליה'} לומר את האמת וכי {'יהיה צפוי' if o.male else 'תהיה צפויה'} "
            f"לעונשים הקבועים בחוק אם לא {'יעשה' if o.male else 'תעשה'} כן, {'אישר' if o.male else 'אישרה'} את נכונות הצהרת{'ו' if o.male else 'ה'} דלעיל "
            f"{'וחתם' if o.male else 'וחתמה'} עליה בפניי.")

    data = {'court_city': o.city, 'case_type': o.case_type, 'case_no': o.case_no,
            'party': party, 'counter': counter,
            'a': {'prior_proceedings': prior, 'last_payment': last, 'income_party': inc,
                  'income_counter': inc_c, 'income_counter_note': note_c, 'assets': assets,
                  'debts': debts, 'housing': housing, 'banks': banks, 'car': car,
                  'amount_needed': amount},
            'b': None,
            'b_na': ('חלק זה אינו רלוונטי. התביעה היא למזונות ' + kid_word + ' בלבד ואינה כוללת מזונות בן/בת זוג.')
            if married else f"חלק זה אינו רלוונטי. הצדדים לא נישאו זה לזו, והתביעה היא למזונות {kid_word} בלבד.",
            'c': c, 'd': None,
            'declaration': {'signer': sig, 'text': dec},
            'attorney': {'name': 'ערן בן שושן', 'text': atty},
            'attachments': att, 'filing_date': o.date, 'annexes': annexes}
    json.dump(data, open(o.out, 'w', encoding='utf8'), ensure_ascii=False, indent=1)
    print('נכתב:', o.out)
    print(f'קבצים מצורפים לפי התשובות: {len(files_sent)}')
    for w in warn:
        print('⚠', w)


if __name__ == '__main__':
    main()
