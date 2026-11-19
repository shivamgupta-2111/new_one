// Printing / "Save as PDF".
// A pop-up sheet (quote, GST invoice, receipt) prints on its own. With no pop-up open, the page itself
// prints (opportunity "Printable view", Ctrl+P, customer quote and payment pages). Without this, the
// general print rule (body > *:not(#modal)) hid the page wrapper and the PDF came out blank.
function setPrintMode() {
  const modal = document.getElementById('modal'),
    sheetOpen = !!(modal && modal.textContent.trim());
  document.body.classList.toggle('print-page', !sheetOpen);
}
addEventListener('beforeprint', setPrintMode);
addEventListener('afterprint', () => document.body.classList.remove('print-page'));

// Customer quote link: "Download PDF" names the file after the quotation (e.g. "Q-1001 Quotation").
function cqDownloadPdf() {
  const q = typeof quoteByToken === 'function' ? quoteByToken(location.hash.slice(4)) : null,
    title = document.title;
  if (q) document.title = `${q.no} Quotation`;
  setPrintMode();
  const back = () => {
    document.title = title;
    removeEventListener('afterprint', back);
  };
  addEventListener('afterprint', back);
  window.print();
}
