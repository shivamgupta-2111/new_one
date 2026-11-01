// Lead status change and delete.

// Leads
const LEAD_STATUS = ['New', 'Working', 'Qualified', 'Unqualified'];
V.leads = () =>
  `<div class="flex items-center mb-3"><h1 class="text-xl font-bold flex-1">Leads</h1><button class="btn btn-p" onclick="modal('lead')"><span class="ms">add</span>New lead</button></div>` +
  table(
    ['Name', 'Company', 'Source', 'Status', ''],
    S.leads
      .map(
        (l, i) =>
          `<tr><td><b>${E(l[0])}</b></td><td>${E(l[1])}</td><td>${E(l[2])}</td><td><select class="inp" style="width:auto" aria-label="Lead status" onchange="setLeadStatus(${i},this.value)">${LEAD_STATUS.map((s) => `<option ${s === l[3] ? 'selected' : ''}>${s}</option>`).join('')}</select></td><td class="text-right whitespace-nowrap"><button class="btn" onclick="convert(${i})">Convert to deal</button> <button class="btn" style="color:var(--err)" onclick="deleteLead(${i})">Delete</button></td></tr>`
      )
      .join('')
  );
function setLeadStatus(i, status) {
  if (!S.leads[i]) return;
  S.leads[i][3] = status;
  save();
  toast('Lead marked ' + status.toLowerCase());
}
function deleteLead(i) {
  const l = S.leads[i];
  if (!l || !confirm('Delete lead ' + l[0] + '?')) return;
  S.leads.splice(i, 1);
  save();
  toast('Lead deleted');
  render();
}
