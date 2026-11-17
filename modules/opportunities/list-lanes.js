// Opportunities list view as stage boxes: one full-width box per stage, stacked top to bottom, with each
// opportunity as its own card inside. Drag a card into another box to move the deal to that stage.
// Dropping uses drop() / setStage(), so the same rules apply as on the Board (only Admin / CEO can mark
// Closed Won, and that opens the Closed Won pop-up).

function oppLaneCols() {
  return canSeeInvoices()
    ? 'minmax(220px,2.2fr) minmax(160px,1.6fr) 120px minmax(110px,1fr) minmax(110px,1fr) minmax(150px,1.3fr) minmax(90px,.9fr) minmax(90px,.9fr)'
    : 'minmax(220px,2.2fr) minmax(160px,1.6fr) 120px minmax(110px,1fr) minmax(110px,1fr) minmax(150px,1.3fr) minmax(90px,.9fr)';
}

function oppStageLanes(all, { repCell }) {
  const cols = oppLaneCols(),
    inv = canSeeInvoices();
  const head = [
    'Opportunity',
    'Account',
    'Priority',
    'Amount',
    'Close date',
    'Assigned rep',
    'Quotation no.',
  ]
    .concat(inv ? ['Invoice no.'] : [])
    .map((h) => `<div>${h}</div>`)
    .join('');

  const card = (o) => {
    const docs = opportunityDocuments(o);
    const quoteNos = docs.map((d) => E(d.quoteNo)).join('<br>') || '—';
    const invoiceNos = docs.map((d) => E(d.invoiceNo || '—')).join('<br>') || '—';
    return `<div class="lane-card card" draggable="${o.lost ? 'false' : 'true'}" style="grid-template-columns:${cols}" ondragstart="laneDragStart(event,${o.id})" ondragend="laneDragEnd()" onclick="nav('opp-detail',${o.id})">
<div class="flex items-center gap-2 min-w-0"><span class="ms lane-grip" aria-hidden="true">drag_indicator</span><b class="truncate" title="${E(o.name)}">${E(o.name)}</b></div>
<div class="min-w-0 truncate">${acctSpan(o.account)}</div>
<div onclick="event.stopPropagation()"><select class="inp text-xs" style="width:auto;padding:4px 24px 4px 8px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select></div>
<div>${M(o.amount)}</div>
<div><span class="chip ${chipC(o)}">${fd(o.close)}</span></div>
<div onclick="event.stopPropagation()">${repCell(o)}</div>
<div>${quoteNos}</div>${inv ? `<div>${invoiceNos}</div>` : ''}</div>`;
  };

  const lane = (title, deals, index) => {
    const total = deals.reduce((sum, o) => sum + (+o.amount || 0), 0);
    const dropAttrs =
      index == null
        ? ''
        : `ondragover="event.preventDefault();this.classList.add('over')" ondragleave="if(!this.contains(event.relatedTarget))this.classList.remove('over')" ondrop="this.classList.remove('over');drop(event,${index})"`;
    return `<section class="lane card" ${dropAttrs}>
<div class="lane-head"><b>${title}</b><span class="mut">${deals.length} ${deals.length === 1 ? 'deal' : 'deals'} · ${M(total)}${index == null ? '' : ` · ${PR[index]}%`}</span></div>
<div class="lane-body">${deals.map(card).join('') || `<div class="lane-empty mut">${index == null ? 'No deals' : 'Drag an opportunity here to move it to ' + title}</div>`}</div></section>`;
  };

  const lost = all.filter((o) => o.lost);
  return (
    `<p class="mut mb-2 flex items-center gap-1"><span class="ms">info</span>Drag an opportunity into another box to change its stage. Click it to open the record.</p>` +
    `<div class="lanes-scroll"><div class="lanes"><div class="lane-cols mut" style="grid-template-columns:${cols}">${head}</div>` +
    ST.map((stage, index) =>
      lane(
        stage,
        all.filter((o) => o.stage === index && !o.lost),
        index
      )
    ).join('') +
    (lost.length ? lane('Closed Lost', lost, null) : '') +
    `</div></div>`
  );
}

function laneDragStart(e, id) {
  e.dataTransfer.setData('t', id);
  e.dataTransfer.effectAllowed = 'move';
  const el = e.currentTarget;
  setTimeout(() => el.classList.add('dragging'), 0);
  document.body.classList.add('lane-dragging');
}
function laneDragEnd() {
  document.body.classList.remove('lane-dragging');
  document.querySelectorAll('.lane-card.dragging').forEach((c) => c.classList.remove('dragging'));
  document.querySelectorAll('.lane.over').forEach((l) => l.classList.remove('over'));
}
