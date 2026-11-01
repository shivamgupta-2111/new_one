// Leads list and lead-to-opportunity conversion.

V.leads = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Leads</h1><button class="btn btn-p" onclick="modal('lead')"><span class="ms">add</span>New lead</button></div>` +
  table(
    ['Name', 'Company', 'Source', 'Status', ''],
    S.leads
      .map(
        (l, i) =>
          `<tr><td><b>${E(l[0])}</b></td><td>${E(l[1])}</td><td>${E(l[2])}</td><td><span class="chip ${l[3] == 'New' ? '' : 'wr'}">${l[3]}</span></td><td class="text-right"><button class="btn" onclick="convert(${i})">Convert to deal</button></td></tr>`
      )
      .join('')
  );
function convert(i) {
  const l = S.leads.splice(i, 1)[0],
    id = Math.max(0, ...S.opps.map((o) => o.id)) + 1;
  if (!S.opps.some((o) => o.account == l[1]))
    S.contacts.push([
      l[0],
      'Primary contact',
      l[1],
      l[0].split(' ')[0].toLowerCase() + '@' + l[1].toLowerCase().replace(/\W/g, '') + '.com',
    ]);
  S.opps.push({
    id,
    name: l[1] + ' - New opportunity',
    account: l[1],
    amount: 50000,
    stage: 0,
    close: D(45),
    owner: 'AL',
    next: 'Schedule discovery call',
    items: [{ n: 'Platform licence', c: 'GEN-100', p: 50000, q: 1, d: 0 }],
  });
  S.cur = id;
  save();
  toast(E(l[0]) + ' converted to an opportunity');
  nav('opp-detail');
}
