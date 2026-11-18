// Document branding (logo + letterhead for quotations and invoices), e-signatures and the floating action button.

// ---------- logo ----------
// The company's uploaded logo (Settings → Company & GST) is used when there is one; otherwise a clean built-in mark.
function brandMark(size = 44) {
  const co = (S.settings && S.settings.company) || {};
  if (co.logo)
    return `<img class="doc-logo-img" src="${E(co.logo)}" alt="${E(co.name || 'Company')} logo" style="max-height:${size}px;max-width:${size * 3.2}px">`;
  return `<svg class="doc-logo-mark" width="${size}" height="${size}" viewBox="0 0 48 48" role="img" aria-label="Logo" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="dlg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#14b8a6"/><stop offset="1" stop-color="#0b4f4a"/></linearGradient></defs><rect width="48" height="48" rx="12" fill="url(#dlg)"/><path d="M33.5 15.8A13 13 0 1 0 33.5 32.2" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><circle cx="35.4" cy="24" r="3.8" fill="#f2c46d"/></svg>`;
}
const brandInitials = (name) =>
  String(name || 'Ceph CRM')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('');

// Letterhead used at the top of a quotation or invoice.
// meta: [[label, value], ...] printed on the right under the document title.
function docLetterhead(title, meta) {
  const co = (S.settings && S.settings.company) || {},
    name = co.name || 'Ceph CRM',
    lines = [
      co.address ? `<div class="doc-co-addr">${E(co.address)}</div>` : '',
      co.gstin
        ? `<div>GSTIN <b>${E(co.gstin)}</b>${co.pan ? ` · PAN ${E(co.pan)}` : ''}</div>`
        : '',
      co.email || co.phone
        ? `<div>${[co.email, co.phone].filter(Boolean).map(E).join(' · ')}</div>`
        : '',
    ].join('');
  return `<div class="doc-head"><div class="doc-brand">${brandMark(co.logo ? 52 : 46)}<div><div class="doc-co">${E(name)}</div><div class="doc-co-sub">${lines || '<div>Sales &amp; Billing</div>'}</div></div></div><div class="doc-title"><div class="doc-kind">${E(title)}</div>${meta
    .filter((m) => m && m[1] !== '' && m[1] != null)
    .map(
      (m) => `<div class="doc-meta"><span>${E(m[0])}</span><b>${m[2] ? m[1] : E(m[1])}</b></div>`
    )
    .join('')}</div></div><div class="doc-rule"></div>`;
}

// Company logo upload (stored as a small data URL with the company details).
function pickCompanyLogo(input) {
  const f = input.files && input.files[0];
  if (!f) return;
  if (!/^image\/(png|jpeg|svg\+xml|webp)$/.test(f.type))
    return toast('Use a PNG, JPG, SVG or WebP image');
  if (f.size > 400 * 1024) return toast('Logo must be smaller than 400 KB');
  const r = new FileReader();
  r.onload = () => {
    companyInfo().logo = r.result;
    save();
    toast('Logo updated · it now appears on quotations and invoices');
    render();
  };
  r.readAsDataURL(f);
}
function removeCompanyLogo() {
  delete companyInfo().logo;
  save();
  toast('Logo removed · the standard mark is used');
  render();
}
function companyLogoField() {
  const co = companyInfo(),
    ok = canManageBilling();
  return `<div class="md:col-span-2"><div class="text-sm font-semibold mb-1">Logo (quotations &amp; invoices)</div><div class="flex items-center gap-3 flex-wrap p-3 rounded-lg" style="background:var(--hov)"><div class="doc-logo-preview">${brandMark(48)}</div>${ok ? `<label class="btn" style="cursor:pointer"><span class="ms">upload</span>${co.logo ? 'Change logo' : 'Upload logo'}<input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" hidden onchange="pickCompanyLogo(this)"></label>${co.logo ? `<button type="button" class="btn" onclick="removeCompanyLogo()">Use standard mark</button>` : ''}` : ''}<span class="mut text-xs">PNG, JPG, SVG or WebP, under 400 KB. A wide logo on a transparent background looks best.</span></div></div>`;
}

// ---------- e-signature ----------
// A handwriting-style signature generated from the typed name.
function signatureSvg(name, opts = {}) {
  const n = String(name || '').trim();
  if (!n) return '';
  const w = opts.width || 300,
    h = opts.height || 84,
    fs = Math.max(26, Math.min(48, Math.round((w * 1.55) / Math.max(n.length, 6))));
  // a light, deterministic "pen" flourish under the name so each signature looks hand made
  let seed = 0;
  for (const ch of n) seed = (seed * 31 + ch.charCodeAt(0)) >>> 0;
  const r = (k) => ((Math.sin(seed + k) + 1) / 2) * 6 - 3,
    y = h - 18;
  const flourish = `M12 ${y + r(1)} C ${w * 0.3} ${y + 6 + r(2)}, ${w * 0.55} ${y - 4 + r(3)}, ${w - 20} ${y + 2 + r(4)}`;
  return `<svg class="sig-svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" aria-label="Signature of ${E(n)}" xmlns="http://www.w3.org/2000/svg"><text x="14" y="${h - 26}" font-family="'Mrs Saint Delafield','Segoe Script','Brush Script MT',cursive" font-size="${fs}" fill="#14306b" transform="rotate(-3 14 ${h - 26})">${E(n)}</text><path d="${flourish}" fill="none" stroke="#14306b" stroke-width="1.4" stroke-linecap="round" opacity=".75"/></svg>`;
}
// via: 'customer' = the client typed their name on the quote link (a real e-signature);
// 'staff' = someone in the team recorded a signature they received offline (shown as text, not as handwriting).
function signatureBlock(
  name,
  at,
  label = 'Accepted & signed by',
  via = 'customer',
  recordedBy = ''
) {
  if (!name) return '';
  const lab = label ? `<div class="sig-label">${E(label)}</div>` : '';
  if (via === 'staff')
    return `<div class="sig-block">${lab}<div class="sig-recorded"><span class="ms">edit_document</span>Signed copy received</div><div class="sig-line"></div><div class="sig-name"><b>${E(name)}</b>${at ? ` · ${whenText(at)}` : ''}</div><div class="sig-note">Recorded by ${E(recordedBy || 'the sales team')}</div></div>`;
  return `<div class="sig-block">${lab}${signatureSvg(name)}<div class="sig-line"></div><div class="sig-name"><b>${E(name)}</b>${at ? ` · ${whenText(at)}` : ''}</div><div class="sig-note">Signed electronically by the client</div></div>`;
}
// Who signed a quote. The client's own e-signature always wins over a signature recorded by staff.
function quoteSigner(q) {
  if (!q) return null;
  const c = q.customer;
  if (c && c.status === 'Accepted' && c.name) return { name: c.name, at: c.at, via: 'customer' };
  if (q.signedBy)
    return {
      name: q.signedBy,
      at: q.signedAt,
      via: q.signedVia === 'customer' ? 'customer' : 'staff',
      by: q.signedRecordedBy,
    };
  return null;
}
const quoteSignatureHtml = (q, label) => {
  const s = quoteSigner(q);
  return s ? signatureBlock(s.name, s.at, label, s.via, s.by) : '';
};

// ---------- floating "Back to top" button ----------
// Bottom-right. It appears once the page is scrolled down and takes you back to the top.
function backToTop() {
  const smooth = !matchMedia('(prefers-reduced-motion: reduce)').matches;
  try {
    window.scrollTo({ top: 0, left: 0, behavior: smooth ? 'smooth' : 'auto' });
  } catch (e) {
    window.scrollTo(0, 0);
  }
  // some layouts scroll an inner element instead of the window
  document.querySelectorAll('#app, #app *').forEach((el) => {
    if (
      el.scrollTop > 0 &&
      el.scrollHeight > el.clientHeight &&
      getComputedStyle(el).overflowY !== 'visible'
    )
      el.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
  });
  const brand = document.querySelector('.hdr-brand');
  if (brand) brand.focus({ preventScroll: true });
}
function updateFab() {
  const f = document.getElementById('crm-fab');
  if (f) f.classList.toggle('show', window.scrollY > 240);
}
function mountFab() {
  if (document.getElementById('crm-fab')) return;
  const d = document.createElement('div');
  d.id = 'crm-fab';
  d.className = 'no-print';
  d.innerHTML = `<button type="button" id="crm-fab-btn" class="fab-main" aria-label="Back to top" title="Back to top" onclick="backToTop()"><span class="ms">arrow_upward</span></button>`;
  document.body.appendChild(d);
  updateFab();
}
addEventListener('scroll', updateFab, { passive: true });
addEventListener('resize', updateFab);
if (document.readyState === 'loading') addEventListener('DOMContentLoaded', mountFab);
else mountFab();
