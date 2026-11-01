// Open-record tabs bar and the first render.

const tabIsActive = (id) =>
  ['#opp-detail', '#quote'].includes(location.hash) && String(S.cur) === String(id);

function drawOppTabs() {
  const header = document.querySelector('header');
  if (!header) return;
  let bar = document.getElementById('rec-tabs');
  if (!bar) {
    bar = document.createElement('div');
    bar.id = 'rec-tabs';
    bar.className = 'rec-tabs';
    header.appendChild(bar);
  }
  S.openTabs = S.openTabs || [];
  // Opening an opportunity (from anywhere) adds it to the tab bar.
  if (
    location.hash === '#opp-detail' &&
    S.cur &&
    S.opps.some((o) => o.id == S.cur) &&
    !S.openTabs.includes(S.cur)
  ) {
    S.openTabs.push(S.cur);
    save();
  }
  const allowed = new Set(visibleOpps().map((o) => o.id));
  const tabs = S.openTabs.filter((id) => allowed.has(id));
  bar.style.display = S.authUser && tabs.length ? 'flex' : 'none';
  bar.innerHTML = tabs
    .map((id) => {
      const o = S.opps.find((x) => x.id == id);
      const name = o.name.length > 26 ? o.name.slice(0, 25) + '…' : o.name;
      return `<div class="rec-tab ${tabIsActive(id) ? 'on' : ''}" title="${E(o.name)}" onclick="nav('opp-detail',${id})"><span class="ms">handshake</span><span class="rec-tab-name">${E(name)}</span><button class="rec-tab-x" aria-label="Close tab" onclick="closeOppTab(${id},event)"><span class="ms">close</span></button></div>`;
    })
    .join('');
}
function closeOppTab(id, ev) {
  if (ev) ev.stopPropagation();
  const i = S.openTabs.indexOf(id);
  if (i < 0) return;
  const wasActive = tabIsActive(id);
  S.openTabs.splice(i, 1);
  save();
  if (!wasActive) return drawOppTabs();
  const next = S.openTabs[i] ?? S.openTabs[i - 1];
  next ? nav('opp-detail', next) : nav('opps');
}
const renderWithoutTabs = render;
render = function () {
  renderWithoutTabs.apply(this, arguments);
  drawOppTabs();
};
addEventListener('hashchange', () => drawOppTabs());

save();
render();
