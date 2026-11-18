// Opportunity owner assignment and linked documents.

// Opportunity ownership and document references shown consistently in every portal.
function opportunityDocuments(o) {
  const quotes = (S.quotes || []).filter((q) => q.opp == o.id);
  return quotes.map((q) => {
    const inv = q.invoiceId && (S.invoices || []).find((i) => i.id === q.invoiceId);
    return { quoteNo: q.no, invoiceNo: inv ? inv.invoiceNo : '' };
  });
}
function reassignOpportunity(id, ownerCode) {
  if (!canEditOwner()) {
    toast('Only Senior Reps, Admin and CEO can change the assigned rep');
    render();
    return;
  }
  const o = S.opps.find((x) => x.id == id);
  const rep = activeReps().find((u) => u.ownerCode === ownerCode);
  if (!o || !rep) return toast('Please choose an active representative');
  const previous = ownerLabel(o.owner);
  o.owner = rep.ownerCode;
  (S.acts[o.id] = S.acts[o.id] || []).unshift({
    k: 'sync',
    x: `Assigned representative changed from ${previous} to ${rep.name} by ${roleNow().name}`,
    t: Date.now(),
  });
  save();
  toast(`Assigned to ${rep.name}`);
  render();
}
const previousOpportunityFieldSave = sf;
sf = function (k, v) {
  if (k === 'owner' && !canEditOwner()) {
    toast('Only Senior Reps, Admin and CEO can change the assigned rep');
    S.ed = null;
    return render();
  }
  return previousOpportunityFieldSave(k, v);
};
V.opps = () => {
  const query = (S.q || '').toLowerCase();
  // Reps see their whole team's deals (teammates' deals are view-only); managers can filter by team.
  const teamFilter = seesAllOpps() ? S.teamFilter || '' : '';
  const all = teamVisibleOpps().filter(
    (o) =>
      (o.name + ' ' + o.account).toLowerCase().includes(query) &&
      (!teamFilter || oppTeamName(o) === teamFilter)
  );
  const myTeam = !seesAllOpps() && oppTeamName({ owner: roleNow().owner });
  const teamCell = (o) =>
    `<span class="team-chip">${E(oppTeamName(o) || 'No team')}</span>${!seesAllOpps() && o.owner === roleNow().owner ? '<span class="you-tag">You</span>' : ''}`;
  const teamSelect = seesAllOpps()
    ? `<select class="inp" style="width:auto" aria-label="Filter by team" onchange="S.teamFilter=this.value;render()"><option value="">All teams</option>${(S.teams || []).map((t) => `<option ${teamFilter === t.name ? 'selected' : ''}>${E(t.name)}</option>`).join('')}</select>`
    : '';
  const total = all.reduce((sum, o) => sum + (+o.amount || 0), 0);
  const canReassign = canEditOwner();
  const docMeta = (o) => {
    const docs = opportunityDocuments(o);
    if (!docs.length)
      return `<span class="mut text-xs">Quote: —${canSeeInvoices() ? ' · Invoice: —' : ''}</span>`;
    return docs
      .map(
        (d) =>
          `<span class="text-xs inline-flex flex-wrap gap-1 items-center"><b>Quote:</b> ${E(d.quoteNo)} ${canSeeInvoices() ? `<span class="mut">·</span> <b>Invoice:</b> ${d.invoiceNo ? E(d.invoiceNo) : '—'}` : ''}</span>`
      )
      .join('<br>');
  };
  const repCell = (o) =>
    canReassign
      ? `<select class="inp text-xs" style="width:auto;max-width:150px;padding:4px 24px 4px 8px" aria-label="Assigned representative" onclick="event.stopPropagation()" onchange="reassignOpportunity(${o.id},this.value)">${activeReps()
          .map(
            (u) =>
              `<option value="${E(u.ownerCode)}" ${u.ownerCode === o.owner ? 'selected' : ''}>${E(u.name)}</option>`
          )
          .join('')}</select>${repOpenBtn(o.owner)}`
      : `<span>${repLink(o.owner)}</span>`;
  const top = `<div class="flex flex-wrap items-center gap-2 mb-3"><div><div class="mut">Opportunities</div><h1 class="text-xl font-bold">${!seesAllOpps() ? (myTeam ? `${E(myTeam)} opportunities` : 'My opportunities') : teamFilter ? `${E(teamFilter)} opportunities` : 'All opportunities'}</h1></div><span class="mut ml-2">${all.length} items · Total ${M(total)}</span><span class="flex-1"></span>${teamSelect}<input class="inp" style="width:200px" placeholder="Filter this list" value="${E(S.q || '')}" oninput="S.q=this.value;clearTimeout(window.ft);window.ft=setTimeout(()=>{render();const i=document.querySelector('[placeholder=\\'Filter this list\\']');if(i){i.focus();i.setSelectionRange(99,99)}},250)"><button class="btn" onclick="S.view='${S.view === 'kanban' ? 'list' : 'kanban'}';render()"><span class="ms">${S.view === 'kanban' ? 'table_rows' : 'view_kanban'}</span>${S.view === 'kanban' ? 'List' : 'Board'}</button>${canAddOpportunity() ? `<button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button>` : ''}</div>`;
  if (S.view === 'list') {
    // List view: one box per stage, stacked top to bottom. Drag a row into another box to change its stage.
    const head = [
      '',
      'Opportunity',
      'Account',
      'Priority',
      'Amount',
      'Close date',
      'Assigned rep',
      'Team',
      'Quotation no.',
      ...(canSeeInvoices() ? ['Invoice no.'] : []),
    ];
    const row = (o, droppable) => {
      const editable = canEditOpp(o),
        movable = droppable && editable;
      const docs = opportunityDocuments(o);
      const quoteNumbers = docs.map((d) => E(d.quoteNo)).join('<br>') || '—';
      const invoiceNumbers = docs.map((d) => E(d.invoiceNo || '—')).join('<br>') || '—';
      return `<tr class="r${movable ? ' stage-row' : ''}" ${movable ? `draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id});event.dataTransfer.effectAllowed='move';this.classList.add('dragging')" ondragend="this.classList.remove('dragging')"` : ''} onclick="nav('opp-detail',${o.id})"><td class="stage-grip" title="${movable ? 'Drag to another stage' : editable ? '' : 'View only: owned by ' + E(ownerLabel(o.owner))}">${movable ? '<span class="ms">drag_indicator</span>' : editable ? '' : '<span class="ms">visibility</span>'}</td><td><b>${E(o.name)}</b></td><td>${acctSpan(o.account)}</td><td onclick="event.stopPropagation()">${editable ? `<select class="inp text-xs" style="width:auto;padding:4px 24px 4px 8px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select>` : E(o.priority || 'Medium')}</td><td>${M(o.amount)}</td><td>${fd(o.close)}</td><td onclick="event.stopPropagation()">${repCell(o)}</td><td>${teamCell(o)}</td><td>${quoteNumbers}</td>${canSeeInvoices() ? `<td>${invoiceNumbers}</td>` : ''}</tr>`;
    };
    const box = (label, deals, index) => {
      const droppable = index != null;
      const sum = deals.reduce((s, o) => s + (+o.amount || 0), 0);
      return `<section class="stage-box card mb-3" ${droppable ? `ondragover="event.preventDefault();this.classList.add('over')" ondragleave="if(!this.contains(event.relatedTarget))this.classList.remove('over')" ondrop="this.classList.remove('over');drop(event,${index})"` : ''}><div class="stage-box-head"><b>${label}</b><span class="mut">${deals.length} ${deals.length === 1 ? 'deal' : 'deals'} · ${M(sum)}</span></div>${
        deals.length
          ? `<div class="overflow-x-auto"><table class="stage-table"><colgroup><col style="width:36px"><col style="width:21%"><col style="width:13%"><col style="width:10%"><col style="width:9%"><col style="width:9%"><col style="width:12%"><col style="width:10%"><col style="width:8%">${canSeeInvoices() ? '<col style="width:8%">' : ''}</colgroup><thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead><tbody>${deals.map((o) => row(o, droppable)).join('')}</tbody></table></div>`
          : `<div class="stage-box-empty mut">${droppable ? 'Drop a deal here to move it to ' + label : 'No deals'}</div>`
      }</section>`;
    };
    const lost = all.filter((o) => o.lost);
    return (
      top +
      `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag a deal into another stage box to update its stage.${!seesAllOpps() ? ' Your teammates’ deals are view-only.' : ''}</p>` +
      ST.map((stage, index) =>
        box(
          stage,
          all.filter((o) => o.stage === index && !o.lost),
          index
        )
      ).join('') +
      (lost.length ? box('Closed Lost', lost, null) : '')
    );
  }
  return (
    top +
    `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag a deal to another stage to update it. Assigned rep, quotation and invoice references are visible on every opportunity.</p><div class="flex gap-3 overflow-x-auto pb-3">${ST.map(
      (stage, index) => {
        const deals = all.filter((o) => o.stage === index && !o.lost);
        return `<div class="kcol card shrink-0 w-80 p-2" style="background:var(--hov)" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="drop(event,${index})"><div class="px-1 pb-2"><b>${stage}</b><div class="mut">${deals.length} deals · ${M(deals.reduce((sum, o) => sum + (+o.amount || 0), 0))}</div></div><div class="space-y-2">${deals
          .map(
            (o) =>
              `<div class="kc card p-3${canEditOpp(o) ? '' : ' kc-ro'}" ${canEditOpp(o) ? `draggable="true" ondragstart="event.dataTransfer.setData('t',${o.id})"` : `title="View only: owned by ${E(ownerLabel(o.owner))}"`} onclick="nav('opp-detail',${o.id})"><b style="color:var(--pr)">${E(o.name)}</b><div class="mut">${acctSpan(o.account)}</div><div class="mt-1 flex items-center gap-2 flex-wrap" onclick="event.stopPropagation()">${canEditOpp(o) ? `<select class="inp text-xs" style="width:auto;padding:2px 22px 2px 6px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select>` : `<span class="text-xs mut">${E(o.priority || 'Medium')} priority</span>`}${teamCell(o)}</div><div class="flex justify-between mt-2"><b>${M(o.amount)}</b><span class="mut">${PR[index]}%</span></div>${o.next ? `<div class="mut mt-1">Next: ${E(o.next)}</div>` : ''}<div class="flex justify-between items-center mt-2"><span class="chip ${chipC(o)}">${fd(o.close)}</span><span class="text-xs mut" title="Assigned rep">${repLink(o.owner)}</span></div><div class="mt-2 pt-2 border-t" style="border-color:var(--bd)" onclick="event.stopPropagation()">${docMeta(o)}</div>${
                canReassign
                  ? `<div class="mt-2" onclick="event.stopPropagation()"><label class="mut text-xs">Change assigned rep<select class="inp mt-1" style="width:100%" onchange="reassignOpportunity(${o.id},this.value)">${activeReps()
                      .map(
                        (u) =>
                          `<option value="${E(u.ownerCode)}" ${u.ownerCode === o.owner ? 'selected' : ''}>${E(u.name)}</option>`
                      )
                      .join('')}</select></label></div>`
                  : ''
              }</div>`
          )
          .join('')}</div></div>`;
      }
    ).join('')}</div>`
  );
};
