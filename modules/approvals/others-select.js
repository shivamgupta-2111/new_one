// "Others" dropdowns used in popups and quote page.

// ---------------------------------------------------------------------------
// "Others" dropdowns, approval notes, terms & conditions and approval history
// ---------------------------------------------------------------------------
// Popup forms: a dropdown with an "Others" entry that reveals a text box.
function formOtherSelect(name, options, selected) {
  const opts = options
    .map((o) => `<option ${o === selected ? 'selected' : ''}>${E(o)}</option>`)
    .join('');
  return `<select class="inp" name="${name}" onchange="toggleOther(this)">${opts}<option value="Others">Others</option></select><input class="inp mt-1" name="${name}Other" data-other placeholder="Please specify" style="display:none">`;
}
function toggleOther(select) {
  const box = select.parentNode.querySelector('[data-other]');
  const on = select.value === 'Others';
  box.style.display = on ? '' : 'none';
  box.required = on;
  if (on) box.focus();
}
const pickOther = (values, name) =>
  values[name] === 'Others' ? (values[name + 'Other'] || '').trim() || 'Others' : values[name];

// Quote page: same idea, but the value lives in S.qd.
const QUOTE_STATUS_CHOICES = ['Draft', 'Presented to Customer', 'Under Negotiation', 'On Hold'];



const whenText = (t) =>
  t ? new Date(t).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '';
const canReview = (q) =>
  (S.role === 'ceo' && ['Pending Admin Approval', 'Pending CEO Approval'].includes(q.status)) ||
  (S.role === 'admin' && q.status === 'Pending Admin Approval');
function addQuoteHistory(q, action, note) {
  (q.history = q.history || []).push({ t: Date.now(), by: roleNow().name, action, note });
}
