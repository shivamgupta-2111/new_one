// Invoice terms block.


function invoiceTermsBlock(i) {
  const tnc = i.tnc || effectiveTnc(S.quotes.find((q) => q.no === i.quoteNo));
  return `<div class="mt-3"><b>Terms &amp; conditions</b><div style="white-space:pre-wrap">${tnc ? E(tnc) : '<span class="mut">None</span>'}</div></div>`;
}


