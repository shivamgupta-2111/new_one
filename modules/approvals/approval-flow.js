// Approval banner, notes, approve / reject and approval history.

// Banner at the top of the quote that says where approval stands.
function approvalBanner(q, inv) {
  const box = (tone, icon, title, lines) =>
    `<div class="qt-banner ${tone}"><span class="ms">${icon}</span><div><b>${title}</b>${lines
      .filter(Boolean)
      .map((l) => `<div>${l}</div>`)
      .join('')}</div></div>`;
  if (q.status === 'Approved' || q.status === 'Paid')
    return box('ok', 'verified', 'Approval granted', [
      `Approved by <b>${E(q.approvedBy || '')}</b> on ${whenText(q.approvedAt)}`,
      q.approvedNotes ? `Approval notes: ${E(q.approvedNotes)}` : '',
      q.tnc ? `Terms &amp; conditions: ${E(q.tnc)}` : '',
      inv ? `Invoice ${E(inv.invoiceNo)} generated` : '',
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

// Step 3: notes for the approver, terms & conditions, and the approval trail.
function approvalSection(q, floor, locked) {
  const canEditTnc = !locked && ['admin', 'ceo'].includes(S.role);
  const history = (q.history || [])
    .slice()
    .reverse()
    .map(
      (h) =>
        `<div class="qt-hist"><b>${E(h.action)}</b> · ${E(h.by)} · <span class="mut">${whenText(h.t)}</span><div>${E(h.note || '')}</div></div>`
    )
    .join('');
  return `<section class="qt-section"><div class="qt-section-head"><span class="ms">approval</span><b>Approval Authority</b></div><div class="qt-body"><p>Rep up to <b>2%</b> · Admin up to <b>5%</b> · CEO any discount. Any line priced below the product minimum always needs CEO approval.</p><p class="mut" style="margin-top:6px">${floor.length ? `Lines below minimum: ${floor.map((i) => E(i.c)).join(', ')}` : 'No lines are below their product minimum.'}</p></div></section>
<section class="qt-section"><div class="qt-section-head"><span class="ms">edit_note</span><b>Notes for approval <i class="qt-req">*</i></b></div><div class="qt-body"><textarea class="inp" rows="3" ${locked ? 'disabled' : ''} placeholder="Explain the discount or pricing so the approver can decide. Required before submitting." oninput="S.qd.notes=this.value">${E(q.notes || '')}</textarea></div></section>
<section class="qt-section"><div class="qt-section-head"><span class="ms">gavel</span><b>Terms &amp; conditions</b>${canEditTnc ? '' : '<span class="mut text-xs">Added by Admin / CEO</span>'}</div><div class="qt-body">${canEditTnc ? `<textarea class="inp" rows="4" placeholder="e.g. Pricing valid until the expiry date. Payment as per the terms above." oninput="S.qd.tnc=this.value">${E(q.tnc || '')}</textarea>` : `<p style="white-space:pre-wrap">${q.tnc ? E(q.tnc) : '<span class="mut">None added yet.</span>'}</p>`}</div></section>${history ? `<section class="qt-section"><div class="qt-section-head"><span class="ms">history</span><b>Approval history</b></div><div class="qt-body">${history}</div></section>` : ''}`;
}

// Approve / reject now ask for notes (required) and, on approval, terms & conditions.
function approveQuote(no) {
  const q = S.quotes.find((x) => x.no === no);
  if (!q) return toast('Quotation not found');
  if (!['admin', 'ceo'].includes(S.role)) return toast('Only Admin or CEO can approve');
  if (q.status === 'Pending CEO Approval' && S.role !== 'ceo')
    return toast('CEO approval is required');
  if (S.role === 'admin' && quoteDiscount(q) > 5) return toast('Discount exceeds Admin limit');
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
      ? `<label class="block">Terms &amp; conditions <span class="mut text-xs">(optional)</span><textarea class="inp" name="tnc" rows="4" placeholder="Conditions that apply to this approval">${E(q.tnc || '')}</textarea></label>`
      : '') +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">${approve ? 'Approve' : 'Reject'}</button></div></form></div>`;
  $('#modal textarea').focus();
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
  q.tnc = (v.tnc || '').trim();
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
