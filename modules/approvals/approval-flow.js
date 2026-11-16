// Approval banner, notes, approve / reject and approval history.

// Banner at the top of the quote that says where approval stands.
function approvalBanner(q, inv) {
  const box = (tone, icon, title, lines) =>
    `<div class="qt-banner ${tone}"><span class="ms">${icon}</span><div><b>${title}</b>${lines
      .filter(Boolean)
      .map((l) => `<div>${l}</div>`)
      .join('')}</div></div>`;
  if (['Approved', 'Sent to client', 'Paid'].includes(q.status))
    return box('ok', 'verified', 'Approval granted', [
      `Approved by <b>${E(q.approvedBy || '')}</b> on ${whenText(q.approvedAt)}`,
      q.approvedNotes ? `Approval notes: ${E(q.approvedNotes)}` : '',
      q.tnc ? `Terms &amp; conditions: ${E(q.tnc)}` : '',
      inv && canSeeInvoices() ? `Invoice ${E(inv.invoiceNo)} generated` : '',
    ]);
  if (q.status === 'Rejected')
    return box('err', 'cancel', 'Approval rejected', [
      `Rejected by <b>${E(q.rejectedBy || '')}</b> on ${whenText(q.rejectedAt)}`,
      q.rejectedNotes ? `Reason: ${E(q.rejectedNotes)}` : '',
      'Update the quote and submit it again with notes.',
    ]);
  if (q.status.startsWith('Pending'))
    return box('wr', 'hourglass_top', `Awaiting approval from ${E(q.nextApprover || 'approver')}`, [
      `Submitted by <b>${E(q.createdBy || '')}</b> on ${whenText(q.requestedAt)}`,
      q.notes ? `Notes: ${E(q.notes)}` : '',
    ]);
  return '';
}

// Approve / reject now ask for notes (required) and, on approval, terms & conditions.
function approveQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can approve');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval is required');
  if (S.role === 'admin' && quoteDiscount(q) > adminDiscountLimit())
    return toast(`Discount exceeds the Admin limit of ${adminDiscountLimit()}%`);
  if (belowProductFloor(q).length && S.role !== 'ceo')
    return toast('Below-minimum product pricing requires CEO approval');
  if (!['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status))
    return toast('Quote is not pending approval');
  openApprovalDialog(q, 'approve');
}
function rejectQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can reject');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval required');
  if (!['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status))
    return toast('Quotation is not pending approval');
  openApprovalDialog(q, 'reject');
}
function openApprovalDialog(q, mode) {
  const approve = mode === 'approve';
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-lg max-h-full overflow-auto space-y-3" onsubmit="finishApproval(event,'${E(q.no)}','${mode}')"><h2 class="text-lg font-bold">${approve ? 'Approve' : 'Reject'} quotation ${E(q.no)}</h2>` +
    `<div class="p-3 rounded text-xs" style="background:var(--hov)"><b>Notes from ${E(q.createdBy || 'the rep')}:</b> ${E(q.notes || '—')}<br><span class="mut">Discount ${quoteDiscount(q).toFixed(2)}% · Total ${M(quoteTotal(q))}</span></div>` +
    `<label class="block">${approve ? 'Approval notes' : 'Reason for rejection'} *<textarea class="inp" name="notes" rows="3" required placeholder="${approve ? 'Why is this approved?' : 'What needs to change?'}"></textarea></label>` +
    (approve
      ? `<label class="block">Terms &amp; conditions <span class="mut text-xs">(optional)</span><textarea class="inp" name="tnc" rows="4" placeholder="Conditions that apply to this approval">${E(effectiveTnc(q))}</textarea></label>`
      : '') +
    (approve
      ? `<label class="block">Type <b>APPROVED</b> in capital letters to confirm *<input class="inp mt-1" name="confirmWord" autocomplete="off" spellcheck="false" placeholder="APPROVED" oninput="approvalWordCheck(this)" style="letter-spacing:.08em;font-weight:600"></label><div id="approve-word-hint" class="text-xs mut">The Approve button unlocks when you type APPROVED exactly.</div>`
      : '') +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button id="approval-submit" class="btn btn-p" ${approve ? 'disabled title="Type APPROVED to confirm"' : ''}>${approve ? 'Approve' : 'Reject'}</button></div></form></div>`;
  $('#modal textarea').focus();
}
// The approver must type the word APPROVED (capital letters, exactly) before approving.
const APPROVAL_WORD = 'APPROVED';
function approvalWordCheck(input) {
  const v = input.value.trim(),
    ok = v === APPROVAL_WORD,
    btn = $('#approval-submit'),
    hint = $('#approve-word-hint');
  if (btn) {
    btn.disabled = !ok;
    btn.title = ok ? '' : 'Type APPROVED to confirm';
  }
  input.style.borderColor = ok ? 'var(--ok)' : v ? 'var(--err)' : '';
  if (hint)
    hint.textContent = ok
      ? 'Confirmed. You can approve now.'
      : v && v.toUpperCase() === APPROVAL_WORD
        ? 'Use capital letters: APPROVED'
        : v
          ? 'Type APPROVED exactly'
          : 'The Approve button unlocks when you type APPROVED exactly.';
  if (hint) hint.style.color = ok ? 'var(--ok)' : v ? 'var(--err)' : '';
}
function finishApproval(e, no, mode) {
  e.preventDefault();
  const q = S.quotes.find((x) => x.no === no);
  const v = Object.fromEntries(new FormData(e.target));
  const notes = (v.notes || '').trim();
  if (!q) return;
  if (!notes)
    return toast(
      mode === 'approve' ? 'Add approval notes first' : 'Add a reason for the rejection'
    );
  if (mode === 'approve' && String(v.confirmWord || '').trim() !== APPROVAL_WORD)
    return toast('Type APPROVED in capital letters to approve');
  const o = S.opps.find((x) => x.id == q.opp);
  $('#modal').innerHTML = '';
  if (mode === 'reject') {
    q.status = 'Rejected';
    q.rejectedBy = roleNow().name;
    q.rejectedAt = Date.now();
    q.rejectedNotes = notes;
    q.nextApprover = null;
    addQuoteHistory(q, 'Rejected', notes);
    if (o) logOpp(o.id, 'sync', `Quote ${q.no} rejected by ${roleNow().name}: ${notes}`);
    storeQuote(q);
    save();
    toast('Quotation rejected');
    return render();
  }
  q.status = 'Approved';
  q.approvedBy = roleNow().name;
  q.approvedAt = Date.now();
  q.approvedNotes = notes;
  {
    const t = (v.tnc || '').trim();
    q.tnc = t && t !== standardTnc().trim() ? t : undefined;
  }
  q.nextApprover = null;
  addQuoteHistory(q, 'Approved', notes + (q.tnc ? ` — Terms: ${q.tnc}` : ''));
  const inv = newInvoice(q);
  if (o) {
    o.amount = Math.round(quoteTotal(q));
    o.items = clone(q.items);
    logOpp(
      o.id,
      'sync',
      `Quote ${q.no} approved by ${roleNow().name}; invoice ${inv.invoiceNo} generated`
    );
  }
  storeQuote(q);
  save();
  toast('Approval granted · ' + inv.invoiceNo + ' generated');
  render();
}
