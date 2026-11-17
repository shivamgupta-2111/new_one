// Base quotation list, totals and the first quote editor.

V.quotes = () =>
  `<h1 class="text-xl font-bold mb-3">Quotes</h1>` +
  table(
    ['Quote', 'Opportunity', 'Total', 'Status', 'Expires'],
    S.quotes
      .map((q) => {
        const o = S.opps.find((x) => x.id == q.opp) || { name: '(deleted)' };
        return `<tr class="r" onclick="openQuote(${q.opp})"><td><b>${q.no}</b></td><td>${E(o.name)}</td><td>${M(qcalc(q).tot)}</td><td><span class="chip ${q.status == 'Approved' ? 'ok' : q.status == 'In Review' ? 'wr' : ''}">${q.status}</span></td><td>${fd(q.exp)}</td></tr>`;
      })
      .join('')
  );
function qcalc(q = S.qd) {
  const sub = q.items.reduce((a, i) => a + i.p * i.q, 0),
    dis = q.items.reduce((a, i) => a + (i.p * i.q * i.d) / 100, 0);
  return { sub, dis, tot: sub - dis, pct: sub ? (dis / sub) * 100 : 0 };
}
function openQuote(id) {
  const o = S.opps.find((x) => x.id == id),
    ex = S.quotes.find((q) => q.opp == id);
  S.cur = id;
  S.qd = ex
    ? clone(ex)
    : {
        opp: id,
        no: 'Q-' + (1001 + S.quotes.length),
        exp: D(quoteDefaultsSetting().validityDays),
        status: 'Draft',
        terms: quoteDefaultsSetting().terms,
        items: clone(o.items),
      };
  nav('quote');
}
function qsum() {
  const c = qcalc(),
    ok = c.pct <= 10;
  return `<div class="flex justify-between py-1"><span class="mut">Subtotal (list)</span>${M(c.sub)}</div><div class="flex justify-between py-1"><span class="mut">Discounts</span>-${M(c.dis)}</div><div class="flex justify-between py-2 border-t text-lg font-bold" style="border-color:var(--bd)"><span>Grand total</span>${M(c.tot)}</div>
<div class="p-3 rounded mt-2 ${ok ? 'ok' : 'wr'}"><b>${ok ? 'Fast-track approval' : 'Approval required'}</b><br>Blended discount ${c.pct.toFixed(1)}% against your 10% limit. ${ok ? 'You can send this quote right away.' : 'A manager must approve before it goes out.'}</div>`;
}
V.quote = () => {
  const q = S.qd,
    o = cur();
  if (!q || !o) return V.opps();
  return `<div class="mut cursor-pointer mb-1" onclick="nav('opp-detail')">‹ Back to ${E(o.name)}</div><h1 class="text-xl font-bold mb-3">Quote ${q.no}</h1>
 <div class="grid lg:grid-cols-3 gap-3"><div class="lg:col-span-2 space-y-3"><div class="card p-4 grid sm:grid-cols-3 gap-3"><label>Quote status<select class="inp" disabled><option>${q.status}</option></select></label><label>Expires<input type="date" class="inp" value="${q.exp}" onchange="S.qd.exp=this.value"></label><label>Payment terms<select class="inp" onchange="S.qd.terms=this.value">${['Net 30', 'Net 45', 'Net 60', 'Due on receipt'].map((t) => `<option ${t == q.terms ? 'selected' : ''}>${t}</option>`).join('')}</select></label></div>
 <div class="card"><div class="p-4 pb-2 flex flex-wrap gap-2 items-center"><b class="flex-1">Line items</b><select class="inp" style="width:auto" onchange="qadd(this.value);this.value=''"><option value="">Add product…</option>${CAT.map((c, i) => `<option value="${i}">${c[0]}</option>`).join('')}</select></div>
 ${table(['Product', 'List price', 'Qty', 'Discount %', 'Total', ''], q.items.map((i, k) => `<tr><td>${E(i.n)}<br><small class="mut">${i.c}</small></td><td>${M(i.p)}</td><td><input type="number" min="1" class="inp" style="width:70px" value="${i.q}" oninput="qset(${k},'q',this.value)"></td><td><input type="number" min="0" max="100" class="inp" style="width:70px" value="${i.d}" oninput="qset(${k},'d',this.value)"></td><td id="qr${k}"><b>${M(i.p * i.q * (1 - i.d / 100))}</b></td><td><span class="ms mut" style="cursor:pointer" title="Remove" onclick="S.qd.items.splice(${k},1);render()">delete</span></td></tr>`).join(''))}</div></div>
 <div class="card p-4 h-fit"><div id="qsum">${qsum()}</div><div class="flex flex-col gap-2 mt-4"><button class="btn btn-p justify-center" onclick="saveQ(1)">Save &amp; generate quote</button><button class="btn justify-center" onclick="saveQ(0)">Save as draft</button><button class="btn justify-center" onclick="nav('opp-detail')">Cancel</button></div></div></div>`;
};
function qset(k, f, v) {
  const i = S.qd.items[k];
  i[f] = Math.max(0, +v || 0);
  $('#qr' + k).innerHTML = '<b>' + M(i.p * i.q * (1 - i.d / 100)) + '</b>';
  $('#qsum').innerHTML = qsum();
}
function qadd(i) {
  if (i === '') return;
  const c = CAT[i],
    x = S.qd.items.find((t) => t.c == c[1]);
  x ? x.q++ : S.qd.items.push({ n: c[0], c: c[1], p: c[2], q: 1, d: 0 });
  render();
}
function saveQ(gen) {
  const q = S.qd,
    o = cur(),
    c = qcalc();
  if (!q.items.length) return toast('Add at least one product first');
  q.status = gen ? (c.pct > 10 ? 'In Review' : 'Approved') : 'Draft';
  const n = S.quotes.findIndex((x) => x.opp == q.opp);
  n < 0 ? S.quotes.push(clone(q)) : (S.quotes[n] = clone(q));
  o.items = clone(q.items);
  if (gen) o.amount = Math.round(c.tot);
  save();
  if (!gen) {
    toast('Draft saved');
    return nav('opp-detail');
  }
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><div class="card p-6 w-full max-w-2xl max-h-full overflow-auto"><div class="flex justify-between"><div><h2 class="text-xl font-bold">Quote ${q.no}</h2><div class="mut">Prepared for ${E(o.account)} · Valid until ${fd(q.exp)} · ${q.terms}</div></div><span class="chip ${c.pct > 10 ? 'wr' : 'ok'}">${q.status}</span></div>
 <div class="my-4">${table(['Item', 'Qty', 'Total'], q.items.map((i) => `<tr><td>${E(i.n)}</td><td>${i.q}</td><td>${M(i.p * i.q * (1 - i.d / 100))}</td></tr>`).join(''))}</div><div class="text-right text-lg font-bold">Total ${M(c.tot)}</div>
 <div class="flex gap-2 justify-end mt-4"><button class="btn" onclick="window.print()">Print or save PDF</button><button class="btn btn-p" onclick="$('#modal').innerHTML='';toast('Quote ${q.no} sent to ${E(o.account)}');nav('opp-detail')">Send to customer</button></div></div></div>`;
}
