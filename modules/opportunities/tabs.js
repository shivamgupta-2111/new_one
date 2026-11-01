// Open-record tabs: rename (double-click, pencil or F2), Alt+1..9 to switch, and the first render.

const tabIsActive = (id) =>
  ['#opp-detail', '#quote'].includes(location.hash) && String(S.cur) === String(id);

// Tabs the signed-in person is allowed to see, in bar order.
function visibleTabIds() {
  S.openTabs = S.openTabs || [];
  const allowed = new Set(visibleOpps().map((o) => o.id));
  return S.openTabs.filter((id) => allowed.has(id));
}

// A tab shows its custom name if one was set, otherwise the opportunity name.
function tabLabel(id) {
  const o = S.opps.find((x) => x.id == id);
  return (S.tabNames && S.tabNames[id]) || (o ? o.name : '');
}

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
  const tabs = visibleTabIds();
  bar.style.display = S.authUser && tabs.length ? 'flex' : 'none';
  bar.innerHTML = tabs
    .map((id, i) => {
      const label = tabLabel(id);
      const hint = i < 9 ? ` (Alt+${i + 1})` : '';
      const key = i < 9 ? `<kbd>${i + 1}</kbd>` : '';
      return `<div class="rec-tab ${tabIsActive(id) ? 'on' : ''}" data-id="${id}" title="${E(label)}${hint}" onclick="nav('opp-detail',${id})" ondblclick="renameOppTab(${id},event)"><span class="ms">handshake</span>${key}<span class="rec-tab-name">${E(label)}</span><button class="rec-tab-x" aria-label="Rename tab" title="Rename tab" onclick="renameOppTab(${id},event)"><span class="ms" style="font-size:14px">edit</span></button><button class="rec-tab-x" aria-label="Close tab" onclick="closeOppTab(${id},event)"><span class="ms">close</span></button></div>`;
    })
    .join('');
}

function setTabName(id, name) {
  S.tabNames = S.tabNames || {};
  const clean = name.trim().slice(0, 40);
  const o = S.opps.find((x) => x.id == id);
  // Empty or same as the opportunity name means "go back to the default".
  if (!clean || (o && clean === o.name)) delete S.tabNames[id];
  else S.tabNames[id] = clean;
  save();
}

// Swap the tab label for a text box. Enter or click away saves, Esc cancels.
function renameOppTab(id, ev) {
  if (ev) {
    ev.stopPropagation();
    ev.preventDefault();
  }
  const tab = document.querySelector(`.rec-tab[data-id="${id}"]`);
  const nameEl = tab && tab.querySelector('.rec-tab-name');
  if (!nameEl) return;
  const input = document.createElement('input');
  input.className = 'inp rec-tab-edit';
  input.value = tabLabel(id);
  input.maxLength = 40;
  input.setAttribute('aria-label', 'Tab name');
  let finished = false;
  const finish = (keep) => {
    if (finished) return;
    finished = true;
    if (keep) setTabName(id, input.value);
    drawOppTabs();
  };
  input.onclick = (e) => e.stopPropagation();
  input.ondblclick = (e) => e.stopPropagation();
  input.onkeydown = (e) => {
    e.stopPropagation();
    if (e.key === 'Enter') finish(true);
    else if (e.key === 'Escape') finish(false);
  };
  input.onblur = () => finish(true);
  nameEl.replaceWith(input);
  input.focus();
  input.select();
}

function closeOppTab(id, ev) {
  if (ev) ev.stopPropagation();
  const i = S.openTabs.indexOf(id);
  if (i < 0) return;
  const wasActive = tabIsActive(id);
  S.openTabs.splice(i, 1);
  if (S.tabNames) delete S.tabNames[id];
  save();
  if (!wasActive) return drawOppTabs();
  const next = S.openTabs[i] ?? S.openTabs[i - 1];
  next ? nav('opp-detail', next) : nav('opps');
}

// Alt+1 ... Alt+9 jump to the nth open tab. F2 renames the tab you are on.
addEventListener('keydown', (e) => {
  if (!S.authUser) return;
  if (e.key === 'F2' && !e.altKey && !e.ctrlKey && !e.metaKey) {
    const active = visibleTabIds().find(tabIsActive);
    if (active == null || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return;
    e.preventDefault();
    return renameOppTab(active);
  }
  if (!e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
  // e.code, not e.key: on a Mac Option+digit types a symbol instead of the digit.
  const m = /^(?:Digit|Numpad)([1-9])$/.exec(e.code);
  if (!m) return;
  const id = visibleTabIds()[Number(m[1]) - 1];
  if (id == null) return;
  e.preventDefault();
  nav('opp-detail', id);
});

const renderWithoutTabs = render;
render = function () {
  renderWithoutTabs.apply(this, arguments);
  drawOppTabs();
};
addEventListener('hashchange', () => drawOppTabs());

save();
render();
