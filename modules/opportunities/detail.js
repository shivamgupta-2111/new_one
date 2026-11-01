// Opportunity detail page, follow toggle, stage change and activity log.

V['opp-detail'] = () => {
  const o = cur();
  if (!o) return V.opps();
  const T = S.tab || 'details',
    R = roles(o),
    P = (o.partners = o.partners || []),
    Q = S.quotes.filter((q) => q.opp == o.id),
    tl = S.acts[o.id] || [],
    tk = S.tasks.filter((t) => t.opp == o.id),
    ch = (S.chat = S.chat || {})[o.id] || [],
    rk = riskOf(o),
    mi = 'w-full text-left px-3 py-2 rounded hover:bg-[var(--hov)]',
    socials = `<div class="card p-4"><div class="flex justify-between items-center"><b>Social media accounts</b><span class="mut text-xs">Opportunity</span></div><p class="mut text-xs mt-1">Profiles associated with this opportunity or customer.</p><div class="grid sm:grid-cols-2 gap-2 mt-2">${['linkedin', 'instagram', 'facebook', 'x'].map((k) => `<label class="mut capitalize">${k}<input class="inp" value="${E(o.socials?.[k] || '')}" placeholder="Profile URL or handle" onchange="cur().socials.${k}=this.value;save()"></label>`).join('')}</div></div>
    <div class="card p-4"><div class="flex justify-between items-center gap-2"><b>File attachments</b><span class="mut text-xs">${(o.attachments || []).length} files</span></div><p class="mut text-xs mt-1">Upload and manage documents related to this opportunity.</p><label class="mt-3 block rounded-lg border-2 border-dashed p-4 text-center cursor-pointer" style="border-color:var(--bd);background:var(--hov)" ondragover="event.preventDefault();this.style.borderColor='var(--pr)'" ondragleave="this.style.borderColor='var(--bd)'" ondrop="event.preventDefault();this.style.borderColor='var(--bd)';uploadOppFiles(event.dataTransfer.files)"><span class="ms block mb-2" style="font-size:26px;color:var(--pr)">cloud_upload</span><span class="font-semibold">Click to upload or drag and drop</span><span class="mut block text-xs mt-1">Select multiple files at once · No fixed file-count limit</span><input type="file" multiple class="hidden" onchange="uploadOppFiles(this.files);this.value=''"></label><div id="opp-attachments" class="mt-3 space-y-2">${(o.attachments || []).map((f) => `<div class="flex items-center gap-2 rounded border p-2" style="border-color:var(--bd)"><span class="ms" style="color:var(--pr)">${attachmentIcon(f.name)}</span><div class="min-w-0 flex-1"><div class="font-semibold truncate" title="${E(f.name)}">${E(f.name)}</div><div class="mut text-xs">${formatFileSize(f.size)} · ${E(f.type || 'File')}</div></div><button class="btn" title="Download file" onclick="downloadOppFile('${E(f.id)}')"><span class="ms">download</span></button><button class="btn" title="Remove file" onclick="removeOppFile('${E(f.id)}')"><span class="ms">delete</span></button></div>`).join('') || '<p class="mut text-xs text-center py-3">No files uploaded yet.</p>'}</div></div>`,
    hd = (l, v) => `<div><div class="mut text-[11px]">${l}</div><b>${v}</b></div>`,
    sec = (t, a, b) =>
      `<div class="card p-4"><div class="flex justify-between items-center"><b>${t}</b>${a ? `<button class="btn" onclick="${a}">${b}</button>` : ''}</div>`;
  const pv = {
    details: `<div class="card p-4"><b>Details</b><div class="grid md:grid-cols-2 gap-x-8 mt-1"><div>${LEFT.map((f) => fld(o, f)).join('')}</div><div>${RIGHT.map((f) => fld(o, f)).join('')}</div></div></div>`,
    related: `<div class="space-y-3"><div class="card"><div class="p-4 pb-2 flex justify-between"><b>Products (${o.items.length})</b><button class="btn" onclick="openQuote(${o.id})">Edit products in quote</button></div>${table(['Product', 'Qty', 'List price', 'Discount', 'Total'], o.items.map((i) => `<tr><td>${E(i.n)}</td><td>${i.q}</td><td>${M(i.p)}</td><td>${i.d}%</td><td><b>${M(i.p * i.q * (1 - i.d / 100))}</b></td></tr>`).join(''))}</div><div class="card"><div class="p-4 pb-2 flex justify-between"><b>Quotes (${Q.length})</b><button class="btn btn-p" onclick="openQuote(${o.id})">New quote</button></div>${table(
      ['Quote', 'Invoice', 'Total', 'Status', 'Expires'],
      Q.map((q) => {
        const inv = q.invoiceId && S.invoices && S.invoices.find((i) => i.id === q.invoiceId);
        return `<tr class="r" onclick="openQuoteRecord('${q.no}')"><td><b>${q.no}</b></td><td>${inv ? inv.invoiceNo : '—'}</td><td>${M(qcalc(q).tot)}</td><td>${q.status}</td><td>${fd(q.exp)}</td></tr>`;
      }).join('')
    )}</div></div>`,
    activity: `<div class="space-y-3">${sec('Log activity')}<form onsubmit="logAct(event)" class="mt-2 grid sm:grid-cols-4 gap-2"><select name="k" class="inp"><option value="note_alt">Note</option><option value="call">Call</option><option value="mail">Email</option><option value="task_alt">Task</option></select><input name="x" required class="inp sm:col-span-2" placeholder="What happened or what needs doing?"><button class="btn btn-p justify-center">Log</button></form></div>
 ${sec('Upcoming tasks (' + tk.length + ')')}${tk.map((t) => `<label class="flex gap-2 py-2"><input type="checkbox" onchange="S.tasks.splice(S.tasks.indexOf(S.tasks.find(x=>x.t=='${E(t.t).replace(/'/g, '')}')),1);save();toast('Task completed');render()">${E(t.t)} <span class="mut">· ${t.due}</span></label>`).join('') || '<p class="mut mt-2">No open tasks for this deal.</p>'}</div>
 ${sec('Timeline')}${tl.map((a) => `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><span class="ms mut">${a.k}</span><div><div>${E(a.x)}</div><small class="mut">${ago(a.t)}</small></div></div>`).join('') || '<p class="mut mt-2">No activity yet. Log your first call or note.</p>'}</div></div>`,
    chatter: `<div class="card p-4"><b>Chatter</b><form class="flex gap-2 my-3" onsubmit="event.preventDefault();const v=this.x.value.trim();if(v){(S.chat[S.cur]=S.chat[S.cur]||[]).unshift({x:v,t:Date.now()});save();render()}"><input name="x" class="inp" placeholder="Share an update with the team"><button class="btn btn-p">Share</button></form>${ch.map((c) => `<div class="flex gap-2 py-2 border-b" style="border-color:var(--bd)"><span class="w-8 h-8 rounded-full grid place-items-center text-white font-bold shrink-0" style="background:var(--pr)">AL</span><div><b>Alex Lee</b> <small class="mut">${ago(c.t)}</small><div>${E(c.x)}</div></div></div>`).join('') || '<p class="mut">Nobody has posted yet. Start the conversation.</p>'}</div>`,
  }[T];
  return `<div class="card p-4 mb-3"><div class="flex flex-wrap items-start gap-2"><span class="ms" style="color:var(--warn);font-size:32px">handshake</span><div class="flex-1 min-w-[220px]"><div class="mut cursor-pointer" onclick="nav('opps')">Opportunity ›</div><h1 class="text-xl font-bold">${E(o.name)}</h1></div>
 <button class="btn" onclick="o_f()">${cur().fol ? '✓ Following' : '+ Follow'}</button><button class="btn" onclick="shareToSlack()">Send to Slack</button><button class="btn" onclick="window.print()">Printable view</button><button class="btn" onclick="cloneOpp(0)">Clone</button><button class="btn" onclick="modal('edit')">Edit</button><button class="btn btn-p" onclick="openQuote(${o.id})">Generate quote</button>
 <details class="relative"><summary class="btn list-none">▾</summary><div class="card absolute right-0 mt-1 w-52 z-20 p-1 shadow-lg"><button class="${mi}" onclick="cloneOpp(1)">Clone with related</button><button class="${mi}" onclick="S.tab='details';S.ed='refRep';render()">Add referral</button><button class="${mi}" onclick="S.ed='owner';S.tab='details';render()">Change owner</button><button class="${mi}" onclick="o_s()">${cur().slack ? 'Turn off Slack alerts' : 'Turn on Slack alerts'}</button><button class="${mi}" style="color:var(--err)" onclick="if(confirm('Delete this opportunity?')){S.opps=S.opps.filter(x=>x.id!=${o.id});save();toast('Opportunity deleted');nav('opps')}">Delete</button></div></details></div>
 <div class="grid grid-cols-2 md:grid-cols-7 gap-4 mt-4">${hd('Account name', `<a class="cursor-pointer" style="color:var(--pr)" onclick="S.q='${E(o.account).replace(/'/g, '')}';nav('opps')">${E(o.account)}</a>`)}${hd('Close date', fd(o.close))}${hd('Amount', M(o.amount))}${hd('Assigned rep', E(ownerLabel(o.owner)))}${hd('Quotation', quoteHeaderStatus(o))}${hd('Priority', `<select class="inp" style="width:auto;padding:2px 6px" aria-label="Priority" onchange="setPriority(${o.id},this.value)">${prioOptions(o.priority)}</select>`)}${hd('Risk flag', `<span class="chip ${rk == 'High' ? 'wr' : rk == 'Low' || rk == 'None' ? 'ok' : ''}">${rk}</span>`)}</div></div>
 <div class="card p-3 mb-3 flex items-center gap-3"><div class="flex flex-1 overflow-x-auto gap-1">${ST.map((s, i) => `<div class="step ${i < o.stage || o.stage == 5 ? 'done' : i == o.stage ? 'cur' : ''}" ${i == 5 && o.lost ? 'style="background:var(--err)"' : ''} onclick="setStage(cur(),${i})">${i < o.stage || o.stage == 5 ? '✓ ' : ''}${i == 5 && o.lost ? 'Closed Lost' : s}</div>`).join('')}</div>${o.stage < 5 ? `<button class="btn btn-p" onclick="setStage(cur(),${o.stage + 1})">Mark stage as complete</button>` : `<button class="btn btn-p" onclick="const x=cur();x.lost=!x.lost;save();toast('Marked '+(x.lost?'closed lost':'closed won'));render()">Change closed stage</button>`}</div>
 <div class="flex gap-4 border-b mb-3" style="border-color:var(--bd)">${[
   ['details', 'Details'],
   ['related', 'Related'],
   ['activity', 'Activity'],
   ['chatter', 'Chatter'],
 ]
   .map(
     (t) =>
       `<a class="py-2 font-semibold cursor-pointer" style="${T == t[0] ? 'border-bottom:3px solid var(--pr);color:var(--pr)' : 'color:var(--mut)'}" onclick="tab('${t[0]}')">${t[1]}</a>`
   )
   .join('')}</div>
 <div class="grid lg:grid-cols-3 gap-3"><div class="lg:col-span-2">${pv}</div><div class="space-y-3">
 ${sec('Quick links')}<div class="mt-2 grid gap-1">${[
   ['Contact roles (' + R.length + ')', 'details'],
   ['Products (' + o.items.length + ')', 'related'],
   ['Quotes (' + Q.length + ')', 'related'],
   ['Activities (' + tl.length + ')', 'activity'],
 ]
   .map(
     (l) => `<a class="cursor-pointer" style="color:var(--pr)" onclick="tab('${l[1]}')">${l[0]}</a>`
   )
   .join('')}</div></div>
 ${quoteStatusCard(o)}${sec('Contact roles (' + R.length + ')', "modal('role')", 'Add')}${
   R.map((r, i) => {
     const c = S.contacts.find((x) => x[0] == r.name) || [];
     return `<div class="py-2 border-b" style="border-color:var(--bd)"><div class="flex justify-between"><b>${E(r.name)} ${r.primary ? '<span class="chip">Primary</span>' : `<a class="cursor-pointer mut font-normal" onclick="roles(cur()).forEach((x,j)=>x.primary=j==${i});save();render()">Make primary</a>`}</b><span class="ms mut" style="font-size:16px;cursor:pointer" title="Remove" onclick="roles(cur()).splice(${i},1);save();render()">close</span></div><div class="mut">${r.role} · ${E(c[1] || '')}<br>${E(c[3] || '')}<br>${c[4] ? `<a style="color:var(--pr)" href="tel:${E(c[4])}">${E(c[4])}</a>` : `<a class="cursor-pointer" style="color:var(--pr)" onclick="editContactMobile('${E(r.name)}')">+ Add mobile number</a>`}</div></div>`;
   }).join('') || '<p class="mut mt-2">No contact roles yet.</p>'
 }</div>
 ${sec('Opportunity partners (' + P.length + ')', "modal('partner')", 'Add')}${P.map((p, i) => `<div class="flex justify-between py-2"><span><b>${E(p.name)}</b><br><span class="mut">${p.type}</span></span><span class="ms mut" style="font-size:16px;cursor:pointer" onclick="cur().partners.splice(${i},1);save();render()">close</span></div>`).join('') || '<p class="mut mt-2">No partners on this deal.</p>'}</div>${socials}</div></div></div>`;
};
function o_f() {
  const o = cur();
  o.fol = !o.fol;
  save();
  toast(o.fol ? 'You are following this deal' : 'Unfollowed');
  render();
}
function o_s() {
  const o = cur();
  o.slack = !o.slack;
  save();
  toast(o.slack ? 'Slack alerts on' : 'Slack alerts off');
  render();
}
function logAct(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target));
  if (v.k == 'task_alt') {
    S.tasks.unshift({ t: v.x, due: 'This week', opp: S.cur });
    toast('Task added');
  } else toast('Activity logged');
  (S.acts[S.cur] = S.acts[S.cur] || []).unshift({ k: v.k, x: v.x, t: Date.now() });
  save();
  render();
}
