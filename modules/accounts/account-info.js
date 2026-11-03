// Account addresses: shown in a hover card on every account name; only Senior Reps, Admin and CEO can edit them.

// Demo addresses for the accounts that ship with the sample data.
const SAMPLE_ADDRESSES = [
  [
    'Plot 14, Sector 62, Noida, Uttar Pradesh 201301',
    'Warehouse 3, Kundli Industrial Area, Sonipat, Haryana 131028',
  ],
  ['4th Floor, Prestige Tech Park, Outer Ring Road, Bengaluru, Karnataka 560103', ''],
  [
    '12 Nariman Point, Mumbai, Maharashtra 400021',
    'Gate 2, MIDC Andheri East, Mumbai, Maharashtra 400093',
  ],
  ['88 Anna Salai, Chennai, Tamil Nadu 600002', ''],
  [
    'Banjara Hills Road No. 3, Hyderabad, Telangana 500034',
    'Plot 9, Genome Valley, Shameerpet, Telangana 500078',
  ],
  ['21 Park Street, Kolkata, West Bengal 700016', ''],
];
S.accountInfo = S.accountInfo || {};
[...new Set(S.opps.map((o) => o.account))].forEach((name, i) => {
  if (S.accountInfo[name]) return;
  const [address, shipping] = SAMPLE_ADDRESSES[i % SAMPLE_ADDRESSES.length];
  S.accountInfo[name] = {
    address,
    shipping: shipping || address,
    by: 'Sample data',
    at: Date.now(),
  };
});

const accountInfo = (name) => S.accountInfo[name] || { address: '', shipping: '' };
const acctAttr = (name) => `data-acct="${E(name)}" tabindex="0"`;
const acctSpan = (name) => `<span class="acct-hover" ${acctAttr(name)}>${E(name)}</span>`;
const acctEditBtn = (name) =>
  canEditAddress()
    ? ` <button type="button" class="hdr-ic" style="width:26px;height:26px;vertical-align:middle" title="Edit addresses" aria-label="Edit addresses for ${E(name)}" onclick="event.stopPropagation();openAccountEditor(${E(JSON.stringify(name))})"><span class="ms" style="font-size:18px">edit_location_alt</span></button>`
    : '';

// ----- hover card (also on keyboard focus) -----
let acctCard;
function showAcctCard(el) {
  const name = el.dataset.acct,
    info = accountInfo(name),
    line = (label, v) =>
      `<div class="mt-1"><div class="mut text-[11px]">${label}</div><div style="white-space:pre-wrap">${v ? E(v) : '<span class="mut">Not added</span>'}</div></div>`;
  if (!acctCard) {
    acctCard = document.createElement('div');
    acctCard.id = 'acct-card';
    acctCard.setAttribute('role', 'tooltip');
    document.body.appendChild(acctCard);
  }
  acctCard.innerHTML = `<b>${E(name)}</b>${line('Address', info.address)}${line('Shipping address', info.shipping)}`;
  acctCard.style.display = 'block';
  const r = el.getBoundingClientRect(),
    w = acctCard.offsetWidth,
    h = acctCard.offsetHeight;
  acctCard.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left)) + 'px';
  acctCard.style.top =
    (r.bottom + h + 12 > innerHeight ? Math.max(8, r.top - h - 6) : r.bottom + 6) + 'px';
}
function hideAcctCard() {
  if (acctCard) acctCard.style.display = 'none';
}
document.addEventListener('mouseover', (e) => {
  const el = e.target.closest && e.target.closest('[data-acct]');
  if (el) showAcctCard(el);
});
document.addEventListener('mouseout', (e) => {
  const el = e.target.closest && e.target.closest('[data-acct]');
  if (el && !(e.relatedTarget && el.contains(e.relatedTarget))) hideAcctCard();
});
document.addEventListener('focusin', (e) => {
  const el = e.target.closest && e.target.closest('[data-acct]');
  if (el) showAcctCard(el);
});
document.addEventListener('focusout', hideAcctCard);
addEventListener('scroll', hideAcctCard, true);
addEventListener('keydown', (e) => e.key === 'Escape' && hideAcctCard(), true);
addEventListener('hashchange', hideAcctCard);

// ----- editing (Senior Rep, Admin, CEO) -----
function openAccountEditor(name) {
  if (!canEditAddress()) return toast('Only Senior Reps, Admin and CEO can edit addresses');
  hideAcctCard();
  const info = accountInfo(name);
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg space-y-3" onsubmit="saveAccountAddress(event,${E(JSON.stringify(name))})"><h2 class="text-lg font-bold">Addresses — ${E(name)}</h2>` +
    `<label class="block">Address<textarea class="inp mt-1" name="address" rows="3" maxlength="300" placeholder="Registered / billing address">${E(info.address)}</textarea></label>` +
    `<label class="flex items-center gap-2"><input type="checkbox" name="same" ${info.address && info.address === info.shipping ? 'checked' : ''}> Shipping address is the same</label>` +
    `<label class="block">Shipping address<textarea class="inp mt-1" name="shipping" rows="3" maxlength="300" placeholder="Where goods are delivered">${E(info.shipping)}</textarea></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal textarea').focus();
}
function saveAccountAddress(e, name) {
  e.preventDefault();
  if (!canEditAddress()) return toast('Only Senior Reps, Admin and CEO can edit addresses');
  const v = Object.fromEntries(new FormData(e.target)),
    address = (v.address || '').trim();
  S.accountInfo[name] = {
    address,
    shipping: v.same ? address : (v.shipping || '').trim(),
    by: roleNow().name,
    at: Date.now(),
  };
  S.opps
    .filter((o) => o.account === name)
    .forEach((o) => logOpp(o.id, 'sync', `Account addresses updated by ${roleNow().name}`));
  $('#modal').innerHTML = '';
  save();
  toast('Addresses saved');
  render();
}

// Accounts list: same columns as before, plus the address and an edit button for those allowed.
V.accounts = () => {
  const names = [...new Set(S.opps.map((o) => o.account))],
    edit = canEditAddress();
  return (
    `<h1 class="text-xl font-bold mb-3">Accounts</h1>` +
    table(
      ['Account', 'Open deals', 'Open pipeline', 'Won', 'Address', ''],
      names
        .map((a) => {
          const x = S.opps.filter((o) => o.account == a),
            open = x.filter((o) => o.stage < 5),
            info = accountInfo(a);
          return `<tr class="r" onclick="S.q='${E(a).replace(/'/g, '')}';nav('opps')"><td><b>${acctSpan(a)}</b></td><td>${open.length}</td><td>${M(open.reduce((s, o) => s + o.amount, 0))}</td><td>${M(x.filter((o) => o.stage == 5).reduce((s, o) => s + o.amount, 0))}</td><td class="mut text-xs">${info.address ? E(info.address) : 'Not added'}</td><td class="text-right">${edit ? `<button class="btn" onclick="event.stopPropagation();openAccountEditor(${E(JSON.stringify(a))})"><span class="ms">edit_location_alt</span>Edit</button>` : ''}</td></tr>`;
        })
        .join('')
    )
  );
};
