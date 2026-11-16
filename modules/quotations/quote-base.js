// Quote totals: subtotal, discount and total.


function qcalc(q = S.qd) {
  const sub = q.items.reduce((a, i) => a + i.p * i.q, 0),
    dis = q.items.reduce((a, i) => a + (i.p * i.q * i.d) / 100, 0);
  return { sub, dis, tot: sub - dis, pct: sub ? (dis / sub) * 100 : 0 };
}






