// Discount rules: only Admin and CEO can give discounts, and the CEO decides how much Admin may give.

const DEFAULT_ADMIN_DISCOUNT = 5;
function adminDiscountLimit() {
  const v = Number(S.settings && S.settings.adminDiscountLimit);
  return Number.isFinite(v) && v >= 0 && v <= 100 ? v : DEFAULT_ADMIN_DISCOUNT;
}
function canGiveDiscount() {
  return ['admin', 'ceo'].includes(S.role);
}

// Server-side style guards for the quote builder (the inputs are also disabled in the UI).
const changeQuoteItemBeforePolicy = changeQuoteItem;
changeQuoteItem = function (k, f) {
  if (f === 'd' && !canGiveDiscount()) {
    toast('Only Admin and CEO can give discounts');
    return render();
  }
  return changeQuoteItemBeforePolicy.apply(this, arguments);
};
const tieredBeforePolicy = applyTieredDiscount;
applyTieredDiscount = function () {
  if (!canGiveDiscount()) return toast('Only Admin and CEO can give discounts');
  return tieredBeforePolicy.apply(this, arguments);
};

// CEO sets the Admin limit. Pending Admin approvals above a lowered limit move to the CEO.
function saveAdminDiscountLimit(e) {
  e.preventDefault();
  if (S.role !== 'ceo') return toast('Only the CEO can change the Admin discount limit');
  const raw = new FormData(e.target).get('limit'),
    n = Math.round(Number(raw) * 10) / 10;
  if (raw === '' || !Number.isFinite(n) || n < 0 || n > 100)
    return toast('Enter a limit between 0 and 100');
  const before = adminDiscountLimit();
  S.settings.adminDiscountLimit = n;
  S.settings.adminDiscountLimitBy = roleNow().name;
  S.settings.adminDiscountLimitAt = Date.now();
  let moved = 0;
  S.quotes.forEach((q) => {
    if (q.status === 'Pending Admin Approval' && quoteDiscount(q) > n) {
      q.status = 'Pending CEO Approval';
      q.nextApprover = ROLE_CFG.ceo.name;
      addQuoteHistory(q, 'Escalated', `Discount is above the new Admin limit of ${n}%`);
      if (typeof queuePopup === 'function')
        queuePopup({ kind: 'needs-approval', no: q.no, toRole: 'ceo', by: S.authUser });
      moved++;
    }
  });
  save();
  toast(
    `Admin discount limit set to ${n}%` + (moved ? ` · ${moved} pending quote(s) sent to CEO` : '')
  );
  render();
}

SETTINGS_PANELS.limits = function () {
  const lim = adminDiscountLimit(),
    ceo = S.role === 'ceo',
    rows = [
      ['Rep / Senior Rep', 'No discount authority', 'Admin approval on every quote'],
      ['Admin', `Up to ${lim}% blended discount`, `CEO approval above ${lim}%`],
      ['CEO', 'Any discount', 'Final authority'],
    ],
    by = S.settings.adminDiscountLimitBy
      ? `Last changed by ${E(S.settings.adminDiscountLimitBy)} on ${whenText(S.settings.adminDiscountLimitAt)}.`
      : 'Using the default limit.',
    form = ceo
      ? `<form class="mb-4 p-3 rounded-lg flex flex-wrap items-end gap-3" style="background:var(--hov)" onsubmit="saveAdminDiscountLimit(event)"><label class="block">Admin discount limit (%)<input class="inp mt-1" style="width:140px" type="number" name="limit" min="0" max="100" step="0.5" required value="${lim}"></label><button class="btn btn-p">Save limit</button><span class="mut text-xs flex-1 min-w-[200px]">${by} Quotes above this limit go to the CEO. Lowering it moves pending Admin approvals above the new limit to the CEO.</span></form>`
      : `<p class="mut mb-3">The CEO sets the Admin discount limit. ${by}</p>`;
  return `${secHead('approval', 'Approval limits', 'Only Admin and CEO can give discounts. The CEO decides how much Admin can give.')}${form}${table(['Role', 'Discount authority', 'Escalation'], rows.map((r) => `<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join(''))}<p class="mut text-xs mt-3">Any line priced below its product minimum always needs CEO approval. Every submission needs notes for the approver.</p>`;
};
