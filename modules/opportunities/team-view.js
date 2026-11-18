// Team view: reps can open their teammates' opportunities, but only the owner
// (or a Senior Rep, Admin or CEO) can change them. Loaded last so it wraps every
// earlier version of these functions.

function teamViewAllows(o) {
  if (!o || canEditOpp(o)) return true;
  toast(`View only: this deal belongs to ${ownerLabel(o.owner)}`);
  return false;
}
const oppById = (id) => S.opps.find((x) => x.id == id);

const sfBeforeTeamView = sf;
sf = function (k, v) {
  if (!teamViewAllows(cur())) {
    S.ed = null;
    return render();
  }
  return sfBeforeTeamView.apply(this, arguments);
};
const setStageBeforeTeamView = setStage;
setStage = function (o) {
  if (!teamViewAllows(o)) return render();
  return setStageBeforeTeamView.apply(this, arguments);
};
const setPriorityBeforeTeamView = setPriority;
setPriority = function (id) {
  if (!teamViewAllows(oppById(id))) return render();
  return setPriorityBeforeTeamView.apply(this, arguments);
};
const openQuoteBeforeTeamView = openQuote;
openQuote = function (id) {
  if (!teamViewAllows(oppById(id))) return;
  return openQuoteBeforeTeamView.apply(this, arguments);
};
const cloneOppBeforeTeamView = cloneOpp;
cloneOpp = function () {
  if (!teamViewAllows(cur())) return;
  return cloneOppBeforeTeamView.apply(this, arguments);
};
const modalBeforeTeamView = modal;
modal = function (k) {
  if (k === 'edit' && !teamViewAllows(cur())) return;
  return modalBeforeTeamView.apply(this, arguments);
};
const shareToSlackBeforeTeamView = shareToSlack;
shareToSlack = function () {
  if (!teamViewAllows(cur())) return;
  return shareToSlackBeforeTeamView.apply(this, arguments);
};

// On a teammate's deal: show a view-only banner and hide the controls that change it.
// Following the deal, the printable view, the tabs and Chatter stay available.
const TEAM_VIEW_KEEP = ['Follow', 'Following', 'Printable view', 'Share'];
function applyTeamView() {
  const app = document.getElementById('app');
  if (!app) return;
  const o = location.hash === '#opp-detail' ? cur() : null;
  const ro = !!(S.authUser && o && !canEditOpp(o));
  app.classList.toggle('ro-opp', ro);
  if (!ro || app.querySelector('.ro-banner')) return;
  const team = oppTeamName(o);
  app.insertAdjacentHTML(
    'afterbegin',
    `<div class="ro-banner card"><span class="ms">visibility</span><div><b>View only</b> · This deal belongs to ${E(ownerLabel(o.owner))}${team ? ` (${E(team)})` : ''}. You can follow it and read its details; only the owner, a Senior Rep, Admin or CEO can change it.</div></div>`
  );
  app.querySelectorAll('button.btn, summary.btn').forEach((b) => {
    const t = b.textContent.replace(/[✓+]/g, '').trim();
    if (!TEAM_VIEW_KEEP.some((k) => t === k)) b.classList.add('ro-hidden');
  });
  app.querySelectorAll('.ms[title^="Edit"], .step').forEach((el) => el.removeAttribute('onclick'));
  app.querySelectorAll('.ms[title^="Edit"]').forEach((el) => el.classList.add('ro-hidden'));
  app.querySelectorAll('select, input[type="checkbox"]').forEach((el) => (el.disabled = true));
}
const renderBeforeTeamView = render;
render = function () {
  const r = renderBeforeTeamView.apply(this, arguments);
  applyTeamView();
  return r;
};
addEventListener('hashchange', () => setTimeout(applyTeamView, 0));

// Teammates' quotations stay private: the number is visible, but only the deal's owner can open it.
const openQuoteRecordBeforeTeamView = openQuoteRecord;
openQuoteRecord = function (no) {
  const q = (S.quotes || []).find((x) => x.no === no);
  if (q && !teamViewAllows(oppById(q.opp))) return;
  return openQuoteRecordBeforeTeamView.apply(this, arguments);
};
