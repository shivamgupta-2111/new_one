// New opportunity and contact-role popups, priorities and extended save.

// New-opportunity and add-contact-role popups (replaces the base `modal` for these two keys).
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];
const OPP_TYPES = ['New Business', 'Existing Business – Upsell', 'Renewal'];
const CONTACT_ROLES = [
  'Decision Maker',
  'Business User',
  'Technical Evaluator',
  'Buyer',
  'Influencer',
];
const LEAD_SOURCES = [
  'Webinar',
  'Partner Referral',
  'Trade Show',
  'Inbound Web',
  'Outbound',
  'Referral',
];
const prioChip = (o) => {
  const p = o.priority || 'Medium';
  const tone = p === 'Critical' || p === 'High' ? 'wr' : p === 'Low' ? 'ok' : '';
  return `<span class="chip ${tone}" title="Priority">${p}</span>`;
};
const prioOptions = (selected) =>
  PRIORITIES.map(
    (p) => `<option ${p === (selected || 'Medium') ? 'selected' : ''}>${p}</option>`
  ).join('');
const knownAccounts = () =>
  [...new Set([...S.opps.map((o) => o.account), ...S.contacts.map((c) => c[2])])].filter(Boolean);

// Priority can be changed at any time, from the opportunity page, the list or the board.
function setPriority(id, value) {
  const o = S.opps.find((x) => x.id == id);
  if (!o || !PRIORITIES.includes(value)) return;
  const before = o.priority || 'Medium';
  if (before === value) return;
  o.priority = value;
  (S.acts[id] = S.acts[id] || []).unshift({
    k: 'sync',
    x: `Priority changed from ${before} to ${value} by ${roleNow().name}`,
    t: Date.now(),
  });
  save();
  toast(`Priority set to ${value}`);
  render();
}

const originalModal = modal;
modal = function (k) {
  if (k === 'role') return openOppContactForm();
  if (k !== 'opp') return originalModal(k);
  const field = (label, control, wide) =>
    `<label class="block ${wide ? 'sm:col-span-2' : ''}">${label}${control}</label>`;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-2xl max-h-full overflow-auto" onsubmit="saveOpportunityExtended(event)"><h2 class="text-lg font-bold mb-3">New opportunity</h2><div class="grid sm:grid-cols-2 gap-3">` +
    field('Opportunity name *', '<input class="inp" name="name" required>', true) +
    field(
      'Account *',
      `<input class="inp" name="account" list="acct-list" required><datalist id="acct-list">${knownAccounts()
        .map((a) => `<option value="${E(a)}">`)
        .join('')}</datalist>`
    ) +
    field('Amount (₹) *', '<input class="inp" name="amount" type="number" min="0" required>') +
    field(
      'Close date *',
      `<input class="inp" name="close" type="date" value="${D(30)}" required>`
    ) +
    field(
      'Stage',
      `<select class="inp" name="stage">${ST.map((x, i) => `<option value="${i}">${x}</option>`).join('')}</select>`
    ) +
    field(
      'Priority level',
      `<select class="inp" name="priority">${prioOptions('Medium')}</select>`
    ) +
    field(
      'Assigned rep',
      `<select class="inp" name="owner" required>${repOptions(defaultRepCode()) || `<option value="${E(defaultRepCode())}">${E(ownerLabel(defaultRepCode()))}</option>`}</select>`
    ) +
    field('Opportunity type', formOtherSelect('type', OPP_TYPES, OPP_TYPES[0])) +
    field('Lead source', formOtherSelect('source', LEAD_SOURCES, LEAD_SOURCES[0])) +
    field(
      'Next step',
      '<input class="inp" name="next" placeholder="e.g. Schedule discovery call">'
    ) +
    field(
      'Description',
      '<textarea class="inp" name="description" rows="3" placeholder="Notes about this deal (optional)"></textarea>',
      true
    ) +
    `</div><div class="flex justify-end gap-2 mt-4"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal input').focus();
};
function saveOpportunityExtended(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    id = Math.max(0, ...S.opps.map((o) => o.id)) + 1,
    a = +v.amount;
  S.opps.push({
    id,
    name: v.name.trim(),
    account: v.account.trim(),
    amount: a,
    stage: +v.stage,
    close: v.close,
    owner: v.owner || defaultRepCode(),
    priority: PRIORITIES.includes(v.priority) ? v.priority : 'Medium',
    type: pickOther(v, 'type'),
    source: pickOther(v, 'source'),
    description: (v.description || '').trim(),
    next: (v.next || '').trim(),
    socials: { linkedin: '', instagram: '', facebook: '', x: '' },
    items: [{ n: 'Platform licence', c: 'GEN-100', p: a, q: 1, d: 0 }],
  });
  S.cur = id;
  $('#modal').innerHTML = '';
  save();
  toast('Opportunity created');
  nav('opp-detail');
}

// "Add" on an opportunity's Contact roles: pick an existing contact or create a new one.
function openOppContactForm() {
  const o = cur();
  if (!o) return;
  const hasRoles = roles(o).length > 0;
  const existing = S.contacts
    .map((c) => `<option value="${E(c[0])}">${E(c[0])}${c[2] ? ' – ' + E(c[2]) : ''}</option>`)
    .join('');
  const toggle = `const n=this.value==='__new';document.getElementById('nc-fields').style.display=n?'':'none';document.querySelectorAll('#nc-fields [data-req]').forEach(i=>i.required=n)`;
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="saveOppContact(event)"><h2 class="text-lg font-bold">Add contact to ${E(o.name)}</h2>` +
    `<label class="block">Contact<select class="inp" name="contact" onchange="${toggle}"><option value="__new">+ Create new contact</option>${existing}</select></label>` +
    `<div id="nc-fields" class="grid sm:grid-cols-2 gap-3"><label class="block sm:col-span-2">Full name *<input class="inp" name="name" data-req required></label><label class="block">Designation *<input class="inp" name="title" data-req required placeholder="e.g. VP Procurement"></label><label class="block">Contact number *<input class="inp" name="phone" type="tel" data-req required placeholder="+91 98765 43210"></label><label class="block sm:col-span-2">Email *<input class="inp" name="email" type="email" data-req required></label></div>` +
    `<label class="block">Role on this opportunity${formOtherSelect('role', CONTACT_ROLES, CONTACT_ROLES[0])}</label>` +
    `<label class="flex items-center gap-2"><input type="checkbox" name="primary" ${hasRoles ? '' : 'checked'}> Primary contact for this opportunity <span class="mut text-xs">(you can change this any time)</span></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal input').focus();
}
function saveOppContact(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  const o = cur();
  let name = v.contact;
  if (name === '__new') {
    name = v.name.trim();
    if (!S.contacts.some((c) => c[0] === name))
      S.contacts.push([name, v.title.trim(), o.account, v.email.trim(), v.phone.trim(), false]);
  }
  const r = roles(o);
  if (r.some((x) => x.name === name)) return toast(`${name} is already on this opportunity`);
  const makePrimary = !!v.primary || !r.length;
  if (makePrimary) r.forEach((x) => (x.primary = false));
  r.push({ name, role: pickOther(v, 'role'), primary: makePrimary });
  $('#modal').innerHTML = '';
  save();
  toast('Contact added');
  render();
}
