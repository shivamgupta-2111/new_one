// Accounts list.

V.accounts = () => {
  const A = [...new Set(S.opps.map((o) => o.account))];
  return (
    `<h1 class="text-xl font-bold mb-3">Accounts</h1>` +
    table(
      ['Account', 'Open deals', 'Open pipeline', 'Won'],
      A.map((a) => {
        const x = S.opps.filter((o) => o.account == a);
        return `<tr class="r" onclick="S.q='${E(a).replace(/'/g, '')}';nav('opps')"><td><b>${E(a)}</b></td><td>${x.filter((o) => o.stage < 5).length}</td><td>${M(x.filter((o) => o.stage < 5).reduce((s, o) => s + o.amount, 0))}</td><td>${M(x.filter((o) => o.stage == 5).reduce((s, o) => s + o.amount, 0))}</td></tr>`;
      }).join('')
    )
  );
};
