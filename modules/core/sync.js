// Cross-tab sync through the storage event.

// Cross-tab sync: quotations, approvals, invoices and CRM records are shared; login stays tab-specific.
addEventListener('storage', (e) => {
  if (e.key !== KEY || !e.newValue) return;
  try {
    const incoming = JSON.parse(e.newValue),
      auth = S.authUser;
    Object.assign(S, incoming);
    S.authUser = auth;
    if (auth) {
      const user = S.users.find((u) => u.id === auth && u.active !== false);
      if (user) {
        S.role = user.role;
        S.mine = user.role === 'rep';
      }
    }
    if (
      ['approvals', 'quotes', 'invoices', 'opp-detail', 'quote', 'invoice-detail'].includes(
        location.hash.slice(1)
      )
    )
      render();
  } catch (err) {
    console.warn('Could not sync Ceph CRM tab', err);
  }
});
