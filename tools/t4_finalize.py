#!/usr/bin/env python3
"""Build the final Form 4 (הרצאת פרטים) from data.json + the annex bundle sent from t4.html.

usage:
  t4_finalize.py data.json "נספחים להרצאת פרטים - X.pdf" "נספחים - X.json" "חתימה - X.png" OUTDIR \
      --tofes4 <tofes-4 skill dir> --hotamet <hotamet skill dir> [--no-stamp]

Steps:
  1. data['attachments'] / data['annexes'] are taken from the bundle manifest (same letters, same order).
  2. tofes-4/scripts/build_tofes4.py builds the docx.
  3. hotamet.py places the client's signature above her name in the declaration,
     and (unless --no-stamp) Eran's stamp above his name in the attorney confirmation.
  4. soffice -> PDF, then the annex pages of the bundle (with their dividers) are appended.
Outputs: OUTDIR/הרצאת פרטים - <name>.docx  and  OUTDIR/הרצאת פרטים - <name>.pdf (form + annexes)
"""
import argparse, json, os, subprocess, sys, shutil, tempfile
from pypdf import PdfReader, PdfWriter


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('data'); ap.add_argument('bundle'); ap.add_argument('manifest'); ap.add_argument('sig'); ap.add_argument('outdir')
    ap.add_argument('--tofes4', required=True); ap.add_argument('--hotamet', required=True)
    ap.add_argument('--no-stamp', action='store_true')
    o = ap.parse_args()

    data = json.load(open(o.data, encoding='utf8'))
    man = json.load(open(o.manifest, encoding='utf8'))
    data['attachments'] = [f"נספח {a['letter']}': {a['name']}" for a in man['annexes']]
    data['annexes'] = [{'letter': a['letter'], 'title': a['name'], 'sub': '', 'files': [f['file'] for f in a['files']]} for a in man['annexes']]
    signer = (data.get('declaration') or {}).get('signer') or data['party']['name']
    name = data['party']['name']
    os.makedirs(o.outdir, exist_ok=True)
    tmp = tempfile.mkdtemp()
    dj = os.path.join(tmp, 'data.json'); json.dump(data, open(dj, 'w', encoding='utf8'), ensure_ascii=False)
    docx = os.path.join(tmp, 'form.docx')
    subprocess.run([sys.executable, os.path.join(o.tofes4, 'scripts', 'build_tofes4.py'), dj, docx], check=True)

    # room for the signature and the stamp: four empty lines before every signature line
    import re, zipfile
    zin = zipfile.ZipFile(docx); xml = zin.read('word/document.xml').decode('utf8')
    empty = '<w:p><w:pPr><w:keepNext/><w:bidi/></w:pPr></w:p>'
    parts = re.split(r'(?=<w:p>)', xml)
    for i, part in enumerate(parts):
        if '____________________' in part and part.startswith('<w:p>'):
            parts[i] = empty * 4 + part.replace('<w:pPr>', '<w:pPr><w:keepNext/>', 1)
            for j in range(i - 1, i - 7, -1):  # keep the confirmation text and its spacer on the same page
                if j > 0 and parts[j].startswith('<w:p>') and '<w:keepNext/>' not in parts[j]:
                    parts[j] = parts[j].replace('<w:pPr>', '<w:pPr><w:keepNext/><w:keepLines/>', 1) if '<w:pPr>' in parts[j] else parts[j].replace('<w:p>', '<w:p><w:pPr><w:keepNext/><w:keepLines/></w:pPr>', 1)
    xml = ''.join(parts)
    docx2 = os.path.join(tmp, 'form_sp.docx')
    with zipfile.ZipFile(docx2, 'w', zipfile.ZIP_DEFLATED) as zout:
        for it in zin.infolist():
            zout.writestr(it, xml if it.filename == 'word/document.xml' else zin.read(it.filename))
    docx = docx2
    hot = os.path.join(o.hotamet, 'scripts', 'hotamet.py')
    signed = os.path.join(tmp, 'form_sig.docx')
    subprocess.run([sys.executable, hot, docx, '-o', signed, '--image', o.sig, '--name', signer,
                    '--width-cm', '3.5', '--lookahead', '1'], check=True)
    final_docx = signed
    if not o.no_stamp:
        stamped = os.path.join(tmp, 'form_stamp.docx')
        subprocess.run([sys.executable, hot, signed, '-o', stamped, '--name', 'ערן בן שושן', '--width-cm', '2.8', '--drop-cm', '0.5', '--lookahead', '1'], check=True)
        final_docx = stamped

    out_docx = os.path.join(o.outdir, f'הרצאת פרטים - {name}.docx')
    shutil.copy(final_docx, out_docx)
    subprocess.run(['soffice', '--headless', '--convert-to', 'pdf', '--outdir', tmp, final_docx], check=True,
                   stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    form_pdf = os.path.splitext(final_docx)[0] + '.pdf'

    w = PdfWriter()
    for p in PdfReader(form_pdf).pages:
        w.add_page(p)
    b = PdfReader(o.bundle)
    last = man.get('signature_page', len(b.pages) + 1) - 1  # annex pages: 2 .. signature_page-1 (1-based)
    for i in range(1, last):
        w.add_page(b.pages[i])
    out_pdf = os.path.join(o.outdir, f'הרצאת פרטים - {name}.pdf')
    with open(out_pdf, 'wb') as f:
        w.write(f)
    print('נכתב:', out_docx)
    print('נכתב:', out_pdf, f'({len(w.pages)} עמודים: טופס + {last - 1} עמודי נספחים)')
    if man.get('missing'):
        print('לא צורפו:', '; '.join(f"{m['name']} ({m['state']})" for m in man['missing'] if m['state'] != 'none'))
    if man.get('extra_files'):
        print('קבצים שצורפו בנפרד (לא נכנסו ל-PDF):', man['extra_files'])


if __name__ == '__main__':
    main()
