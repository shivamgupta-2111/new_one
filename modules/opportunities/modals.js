// Base modal forms and their submit handler.

function modal(k) {
  const o = cur(),
    F = {
      opp: [
        'New opportunity',
        [
          ['name', 'Opportunity name', 'text', ''],
          ['account', 'Account', 'text', ''],
          ['amount', 'Amount (₹)', 'number', ''],
          ['close', 'Close date', 'date', D(30)],
          ['stage', 'Stage', 'select', 0, ST],
        ],
      ],
      lead: [
        'New lead',
        [
          ['name', 'Full name', 'text', ''],
          ['company', 'Company', 'text', ''],
          [
            'source',
            'Lead source',
            'select',
            'Webinar',
            ['Webinar', 'Partner Referral', 'Trade Show', 'Inbound Web', 'Outbound'],
          ],
        ],
      ],
      role: [
        'Add contact role',
        [
          ['name', 'Contact', 'select', S.contacts[0][0], S.contacts.map((c) => c[0])],
          [
            'role',
            'Role',
            'select',
            'Decision Maker',
            ['Decision Maker', 'Business User', 'Technical Evaluator', 'Buyer', 'Influencer'],
          ],
        ],
      ],
      partner: [
        'Add partner',
        [
          ['name', 'Partner name', 'text', ''],
          [
            'type',
            'Partner type',
            'select',
            'Distributor',
            ['Distributor', 'Reseller', 'Referral'],
          ],
        ],
      ],
      edit: [
        'Edit opportunity',
        [
          ['name', 'Name', 'text', o && o.name],
          ['amount', 'Amount (₹)', 'number', o && o.amount],
          ['close', 'Close date', 'date', o && o.close],
          ['next', 'Next step', 'text', o && o.next],
        ],
      ],
    }[k];
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)" onclick="if(event.target==this)this.parentNode.innerHTML=''"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="sub(event,'${k}')"><h2 class="text-lg font-bold">${F[0]}</h2>${F[1]
      .map(
        (f) =>
          `<label class="block">${f[1]}${
            f[2] == 'select'
              ? `<select name="${f[0]}" class="inp">${f[4]
                  .map((x, i) => {
                    const v = f[0] == 'stage' ? i : x;
                    return `<option value="${v}" ${v == f[3] ? 'selected' : ''}>${x}</option>`;
                  })
                  .join('')}</select>`
              : `<input name="${f[0]}" type="${f[2]}" value="${E(f[3])}" class="inp" ${f[0] == 'next' ? '' : 'required'}>`
          }</label>`
      )
      .join(
        ''
      )}<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save</button></div></form></div>`;
  $('#modal input').focus();
}
function sub(e, k) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  $('#modal').innerHTML = '';
  if (k == 'opp') {
    const id = Math.max(0, ...S.opps.map((o) => o.id)) + 1,
      a = +v.amount;
    S.opps.push({
      id,
      name: v.name,
      account: v.account,
      amount: a,
      stage: +v.stage,
      close: v.close,
      owner: 'AL',
      next: '',
      items: [{ n: 'Platform licence', c: 'GEN-100', p: a, q: 1, d: 0 }],
    });
    S.cur = id;
    save();
    toast('Opportunity created');
    nav('opp-detail');
  }
  if (k == 'lead') {
    S.leads.unshift([v.name, v.company, v.source, 'New']);
    save();
    toast('Lead added');
    nav('leads');
  }
  if (k == 'role') {
    const r = roles(cur());
    r.push({ name: v.name, role: v.role, primary: !r.length });
    save();
    toast('Contact role added');
    render();
  }
  if (k == 'partner') {
    (cur().partners = cur().partners || []).push(v);
    save();
    toast('Partner added');
    render();
  }
  if (k == 'edit') {
    Object.assign(cur(), { name: v.name, amount: +v.amount, close: v.close, next: v.next });
    save();
    toast('Changes saved');
    render();
  }
}
