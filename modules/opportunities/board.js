// View registry, pipeline board and stage drag/drop.

const V = {};

V.opps = () => {
  const q = (S.q || '').toLowerCase(),
    L = S.opps.filter(
      (o) => (!S.mine || o.owner == 'AL') && (o.name + o.account).toLowerCase().includes(q)
    ),
    tot = L.reduce((a, o) => a + o.amount, 0);
  const bar = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${S.mine ? 'My opportunities' : 'All opportunities'}</h1></div><span class="mut ml-2">${L.length} items · Total ${M(tot)}</span><span class="flex-1"></span>
 <input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');i.focus();i.setSelectionRange(99,99)},250)">
 <button class="btn" onclick="S.mine=!S.mine;render()">${S.mine ? 'Show everyone' : 'Only mine'}</button>
 <button class="btn" onclick="S.view='${S.view == 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view == 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view == 'kanban' ? 'List' : 'Board'}</button>${canAddOpportunity() ? `<button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button>` : ''}</div>`;
  if (S.view == 'list')
    return (
      bar +
      table(
        ['Name', 'Account', 'Stage', 'Amount', 'Close date', 'Assigned rep'],
        L.map(
          (o) =>
            `<tr class="r" onclick="nav('opp-detail',${o.id})"><td><b>${E(o.name)}</b></td><td>${E(o.account)}</td><td>${ST[o.stage]}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td>${repLink(o.owner)}</td></tr>`
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
  (o.sh = o.sh || []).unshift({
    stage: ST[i],
    amount: o.amount,
    close: o.close,
    by: roleNow().name,
    t: Date.now(),
  });
  (S.acts[o.id] = S.acts[o.id] || []).unshift({
    k: 'sync',
    x: 'Stage changed to ' + ST[i],
    t: Date.now(),
  });
  save();
  toast(i == 5 ? 'Deal closed won. Congratulations!' : E(o.name) + ' moved to ' + ST[i]);
  render();
}
