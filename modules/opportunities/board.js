// Home dashboard, pipeline board and stage drag/drop.

const V = {};
V.home = () => {
  const op = S.opps.filter((o) => o.stage < 5),
    won = S.opps.filter((o) => o.stage == 5 && !o.lost).reduce((a, o) => a + o.amount, 0),
    pipe = op.reduce((a, o) => a + o.amount, 0),
    w = op.reduce((a, o) => a + (o.amount * prob(o)) / 100, 0),
    Q = 2000000;
  const by = ST.slice(0, 5).map((s, i) => [
      s,
      S.opps.filter((o) => o.stage == i).reduce((a, o) => a + o.amount, 0),
    ]),
    mx = Math.max(...by.map((b) => b[1]), 1);
  const soon = [...op].sort((a, b) => (a.close < b.close ? -1 : 1)).slice(0, 5);
  const hr = new Date().getHours(),
    g = hr < 12 ? 'Good morning' : hr < 17 ? 'Good afternoon' : 'Good evening';
  const kp = (l, v, s) =>
    `<div class="card p-4"><div class="mut font-semibold">${l}</div><div class="text-2xl font-bold mt-1">${v}</div><div class="mut mt-1">${s}</div></div>`;
  const hot = S.opps.find((o) => o.id == 7 && o.stage < 5);
  return `<div class="mb-4"><h1 class="text-2xl font-bold">${g}, Alex</h1><p class="mut">You have ${op.filter((o) => days(o.close) <= 7).length} deals closing within a week and ${S.tasks.length} open tasks.</p></div>
 <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">${kp('Open pipeline', M(pipe), op.length + ' active deals')}${kp('Weighted forecast', M(w), 'Based on stage probability')}${kp('Closed won this quarter', M(won), Math.round((won / Q) * 100) + '% of ' + M(Q) + ' quota')}${kp('Win rate', Math.round((S.opps.filter((o) => o.stage == 5).length / S.opps.length) * 100) + '%', 'Across ' + S.opps.length + ' opportunities')}</div>
 <div class="grid lg:grid-cols-3 gap-3">
 <div class="card p-4 lg:col-span-2"><b>Pipeline by stage</b><div class="mt-3 space-y-2">${by.map(([s, v], i) => `<div class="flex items-center gap-3 cursor-pointer" onclick="S.view='kanban';nav('opps')"><span class="w-32 shrink-0">${s}</span><div class="flex-1 h-6 rounded" style="background:var(--hov)"><div class="h-6 rounded" style="width:${(v / mx) * 100}%;background:var(--pr);opacity:${0.45 + i * 0.12}"></div></div><b class="w-24 text-right">${M(v)}</b></div>`).join('')}</div>
 <div class="mt-4"><div class="flex justify-between mb-1"><b>Quota attainment</b><span>${M(won)} of ${M(Q)}</span></div><div class="h-3 rounded" style="background:var(--hov)"><div class="h-3 rounded" style="width:${Math.min(100, (won / Q) * 100)}%;background:var(--ok)"></div></div></div></div>
 <div class="card p-4"><b class="flex items-center gap-1"><span class="ms" style="color:var(--pr)">auto_awesome</span>Einstein suggests</b>
  ${hot ? `<p class="mt-2">${E(hot.account)} is standardising procurement for next quarter. Offer a Platinum Support voucher if they sign before ${fd(hot.close)}.</p><button class="btn btn-p mt-3" onclick="nav('opp-detail',7)">Review deal</button>` : '<p class="mt-2 mut">No urgent recommendations right now.</p>'}</div>
 <div class="card lg:col-span-2"><div class="p-4 pb-2"><b>Closing soon</b></div>${table(['Deal', 'Account', 'Amount', 'Close date'], soon.map((o) => `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${M(o.amount)}</td><td><span class="chip ${chipC(o)}">${days(o.close) < 0 ? 'Overdue' : days(o.close) == 0 ? 'Today' : 'In ' + days(o.close) + ' days'}</span></td></tr>`).join(''))}</div>
 <div class="card p-4"><b>My tasks</b><div class="mt-2">${S.tasks.map((t, i) => `<label class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><input type="checkbox" onchange="S.tasks.splice(${i},1);save();toast('Task completed');render()"><span class="flex-1">${E(t.t)}<br><small class="mut">${t.due}</small></span></label>`).join('') || '<p class="mut mt-2">All caught up. Nice work.</p>'}</div></div></div>`;
};
V.opps = () => {
  const q = (S.q || '').toLowerCase(),
    L = S.opps.filter(
      (o) => (!S.mine || o.owner == 'AL') && (o.name + o.account).toLowerCase().includes(q)
    ),
    tot = L.reduce((a, o) => a + o.amount, 0);
  const bar = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${S.mine ? 'My opportunities' : 'All opportunities'}</h1></div><span class="mut ml-2">${L.length} items · Total ${M(tot)}</span><span class="flex-1"></span>
 <input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');i.focus();i.setSelectionRange(99,99)},250)">
 <button class="btn" onclick="S.mine=!S.mine;render()">${S.mine ? 'Show everyone' : 'Only mine'}</button>
 <button class="btn" onclick="S.view='${S.view == 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view == 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view == 'kanban' ? 'List' : 'Board'}</button><button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button></div>`;
  if (S.view == 'list')
    return (
      bar +
      table(
        ['Name', 'Account', 'Stage', 'Amount', 'Close date', 'Assigned rep'],
        L.map(
          (o) =>
            `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${ST[o.stage]}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td>${E(ownerLabel(o.owner))}</td></tr>`
        ).join('')
      )
    );
  return (
    bar +
    `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag a deal to another stage to update it.</p><div class="flex gap-3 overflow-x-auto pb-3">${ST.map(
      (s, i) => {
        const c = L.filter((o) => o.stage == i && !o.lost);
        return `<div class="kcol card shrink-0 w-72 p-2" style="background:var(--hov)" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event,${i})"><div class="px-1 pb-2"><b>${s}</b><div class="mut">${c.length} deals · ${M(c.reduce((a, o) => a + o.amount, 0))}</div></div><div class="space-y-2">${c.map((o) => `<div class="kc card p-3" draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id})" onclick="nav('opp-detail',${o.id})"><b style="color:var(--pr)">${E(o.name)}</b><div class="mut">${E(o.account)}</div><div class="flex justify-between mt-2"><b>${M(o.amount)}</b><span class="mut">${PR[i]}%</span></div>${o.next ? `<div class="mut mt-1">Next: ${E(o.next)}</div>` : ''}<div class="flex justify-between items-center mt-2"><span class="chip ${chipC(o)}">${fd(o.close)}</span><span class="text-xs mut" title="Assigned rep">${E(ownerLabel(o.owner))}</span></div></div>`).join('')}</div></div>`;
      }
    ).join('')}</div>`
  );
};
function drop(e, i) {
  e.preventDefault();
  const o = S.opps.find((x) => x.id == e.dataTransfer.getData('t'));
  if (!o || o.stage == i) return render();
  setStage(o, i);
}
function setStage(o, i) {
  o.stage = i;
  (S.acts[o.id] = S.acts[o.id] || []).unshift({
    k: 'sync',
    x: 'Stage changed to ' + ST[i],
    t: Date.now(),
  });
  save();
  toast(i == 5 ? 'Deal closed won. Congratulations!' : E(o.name) + ' moved to ' + ST[i]);
  render();
}
