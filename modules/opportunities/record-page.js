// Opportunity record page (Details tab): collapsible field sections on the left, related-list cards on the right.

const BASIC_RIGHT = RIGHT.filter((f) => !['won', 'lost', 'notes', 'desc', 'next'].includes(f[0]));
const addrRow = (label, key) => (o) => {
  const info = accountInfo(o.account),
    pen = canEditAddress()
      ? `<span class="ms" title="Edit addresses" onclick="openAccountEditor(${E(JSON.stringify(o.account))})">edit</span>`
      : '';
  return sfRow(
    label,
    `<div style="white-space:pre-wrap">${info[key] ? E(info[key]) : '–'}</div>`,
    pen
  );
};
const checkRow = (label, ok) =>
  sfRow(
    label,
    `<span class="sf-cb-ro ${ok ? 'on' : ''}" role="img" aria-label="${ok ? 'Yes' : 'No'}">${ok ? '✓' : ''}</span>`
  );
const approvedQuote = (o) =>
  S.quotes.some((q) => q.opp == o.id && ['Approved', 'Sent to client', 'Paid'].includes(q.status));
const discounts = (o) => o.items.map((i) => +i.d || 0);

const QUAL_KEYS = [
  'valDriver',
  'pain',
  'champion',
  'decisionCrit',
  'procProcess',
  'econBuyer',
  'demo',
  'nextDate',
];
const CHECK_KEYS = [
  'ckEula',
  'ckSec',
  'ckBudget',
  'ckMulti',
  'ckExec',
  'ckWorkback',
  'ckBiz',
  'ckQuote',
  'ckCLevel',
  'ckExec2',
];
// Money / number fields are stored as numbers.
const NUM_KEYS = new Set([
  'priorAmt',
  'priorArr',
  'totalFyc',
  'totalArr',
  'currentAcv',
  'priorMyr',
  'churnAmt',
  'priceLimit',
  'longestTerm',
  'y1',
  'y2',
  'y3',
  'y4',
  'y5',
  'avgContract',
  'arrOrig',
  'bestCase',
  'pullFwd',
  'renewalUsd',
  'ltcLength',
]);
const YESNO = ['', 'Yes', 'No'];

const SF_SECTIONS = [
  {
    id: 'info',
    title: 'Opportunity Information',
    left: [
      ...LEFT,
      ['chNotes', 'Channel initiated notes', 'ta'],
      ['potMatch', 'Potential matches button', 'b'],
    ],
    right: [...BASIC_RIGHT, ['yoy', 'Original YoY', 'n'], ['reasonWon', 'Reason won', 't']],
  },
  {
    id: 'address',
    title: 'Address Information',
    left: [addrRow('Billing Address', 'address'), ['acctNs', 'Account NS info', 'ta']],
    right: [addrRow('Shipping Address', 'shipping')],
  },
  {
    id: 'checklist',
    title: 'BIG Deal Check List',
    left: [
      ['ckEula', 'EULA / Contract signed', 'b'],
      ['ckSec', 'Security signed off', 'b'],
      ['ckBudget', 'Budget confirmed', 'b'],
      ['ckMulti', 'Multi-year presented to finance', 'b'],
      ['ckExec', 'Executive summary', 'b'],
    ],
    right: [
      ['ckWorkback', 'Workback plan', 'b'],
      ['ckBiz', 'Business impacted if close date not met', 'b'],
      ['ckQuote', 'Quote submitted in customer system', 'b'],
      ['ckCLevel', 'Exec (C-level) approver aware of request', 'b'],
      ['ckExec2', 'Executive summary', 'b'],
    ],
  },
  {
    id: 'renewal',
    title: 'Renewal Opportunity Information',
    left: [
      ['priorOpp', 'Prior opportunity', 't'],
      ['renewalOpp', 'Renewal opportunity', 't'],
      ['priorInv', 'Prior opp invoice number', 't'],
      ['priorAmt', 'Prior opportunity amount', 'n'],
      ['priorArr', 'Prior ARR total', 'n'],
      ['totalFyc', 'Total FYC value', 'n'],
      ['totalArr', 'Total ARR value', 'n'],
      ['currentAcv', 'Current ACV total – quote', 'n'],
    ],
    right: [
      ['renewalDate', 'Renewal date', 'd'],
      [
        'renewalStatus',
        'Renewal status',
        's',
        ['Not started', 'In Progress', 'Quoted', 'Renewed', 'Churned'],
      ],
      (o) => {
        const d = gv(o, 'renewalDate');
        return sfRow('Days left before maint renewal date', d ? days(d) : '–');
      },
      ['renewalTag', 'Renewal hashtag', 't'],
      ['priorMyr', 'Prior opp MYR', 'n'],
      ['churnAmt', 'Churn', 'n'],
      ['renewalOptOut', 'Renewal automation opt out', 'b'],
      ['priceLimit', 'Prior opp renewal price increase limit', 'n'],
    ],
  },
  {
    id: 'orders',
    title: 'Discount and Order Processing Info',
    left: [
      ['po', 'PO / Reference number', 't'],
      (o) => {
        if (!canSeeInvoices()) return '';
        const nos = S.quotes
          .filter((q) => q.opp == o.id && q.invoiceId)
          .map((q) => (S.invoices.find((i) => i.id === q.invoiceId) || {}).invoiceNo)
          .filter(Boolean);
        return sfRow('Invoice #', nos.length ? E(nos.join(', ')) : '–');
      },
      ['bookedFin', 'Booked by finance', 'b'],
      ['licDelivered', 'License info delivered', 'b'],
    ],
    right: [
      (o) =>
        sfRow(
          'Average opportunity discount',
          `${(discounts(o).reduce((a, b) => a + b, 0) / (o.items.length || 1)).toFixed(2)}%`
        ),
      (o) => sfRow('Largest line item discount', `${Math.max(0, ...discounts(o)).toFixed(2)}%`),
      ['longestTerm', 'Longest line item term', 'n'],
      (o) => checkRow('Discount has been approved', approvedQuote(o)),
    ],
  },
  {
    id: 'multiyear',
    title: 'Multi Year Billing Information',
    left: [
      ['y1', 'Year 1', 'n'],
      ['y2', 'Year 2', 'n'],
      ['y3', 'Year 3', 'n'],
      ['y4', 'Year 4', 'n'],
      ['y5', 'Year 5', 'n'],
      ['avgContract', 'Average contract value', 'n'],
      ['ltcStart', 'LTC contract start date', 'd'],
      ['ltcEnd', 'LTC contract end date', 'd'],
      ['ltcLength', 'LTC contract length', 'n'],
    ],
    right: [
      ['payType', 'Payment type', 's', ['PO', 'Credit card', 'Wire', 'Invoice']],
      ['arrOrig', 'ARR original amount', 'n'],
      ['flexInit', 'FlexPay (initial)', 'b'],
      ['flexSub', 'FlexPay (subsequent)', 'b'],
      ['priorPo', 'Prior opp PO number', 't'],
    ],
  },
  {
    id: 'extra',
    title: 'Additional Deal Information',
    left: [
      ['aceId', 'AWS ACE opportunity ID', 't'],
      ['aceStatus', 'AWS ACE status', 't'],
      ['bitbar', 'BitBar device pending', 'b'],
      ['mgrName', 'Manager name', 't'],
      ['planhat', 'Planhat opp sync', 'b'],
      ['salesPlays', 'Sales plays', 't'],
      ['notes', 'At-risk notes', 'ta'],
      ['sdrShadow', 'SDR deal shadow', 't'],
      ['closedRole', 'Closed owner role', 't'],
      ['forecastBig', 'Forecasted big deal', 'b'],
    ],
    right: [
      ['bestCase', 'Best case', 'n'],
      ['m2s', 'M2S', 'b'],
      ['m2sDisp', 'M2S disposition', 't'],
      ['entDisp', 'ENT support disposition', 't'],
      ['commit', 'Commit', 't'],
      ['jep', 'JEP', 't'],
      ['pullFwd', 'Pull forward', 'n'],
      ['renewalUsd', 'Renewal total amount USD', 'n'],
      ['awsOffer', 'AWS private offer generated', 'b'],
      ['awsOfferId', 'AWS private offer ID', 't'],
      ['awsContact', 'Date of first contact with AWS rep', 'd'],
      ['awsNext', 'Next steps with AWS', 't'],
      ['slmPlan', 'SLM / K8 plan', 't'],
      ['slmDate', 'SLM / K8 plan date', 'd'],
      ['deskStatus', 'Deal desk status', 't'],
      ['deskNotes', 'Deal desk notes', 't'],
      ['apiHub', 'API Hub upgraded customer', 't'],
      ['churn12', 'Risk / churn last 12 months', 'b'],
      ['coSell', 'Reflect / Atlassian co-sell', 'b'],
      ['dsrLink', 'Digital sales room page link', 't'],
    ],
  },
  {
    id: 'exit',
    title: 'Exit Criteria',
    left: [
      ['xValue', 'Value driver', 't'],
      ['xPain', 'Identified pain', 't'],
      ['xMap', 'MAP', 't'],
      ['xChampion', 'Champion', 't'],
      ['xTech', 'Technical fit confirmed', 'b'],
      ['xPoc', 'POC pack', 't'],
      ['competitor2', 'Competitors', 't'],
      ['xBudget', 'Prospect budget process', 't'],
      ['xEcon', 'Economic buyer', 't'],
      ['xTechWin', 'Technical win confirmed', 'b'],
    ],
    right: [
      ['procContact', 'Procurement contact', 't'],
      ['xCriteria', 'Decision criteria', 't'],
      ['xVendor', 'Vendor of choice confirmed', 'b'],
      ['xPaperwork', 'Backend paperwork started', 'b'],
    ],
  },
  {
    id: 'qual',
    title: 'Qualification Criteria',
    left: [
      ['demo', 'Most recent demo', 'd'],
      ['valDriver', 'Value driver', 't'],
      ['pain', 'Identified pain', 'ta'],
      ['decisionCrit', 'Decision criteria', 't'],
      ['procProcess', 'Procurement process', 't'],
      ['champion', 'Champion', 't'],
      ['genNotes', 'General notes', 'ta'],
      ['desc', 'Description', 'ta'],
    ],
    right: [
      (o) => {
        const filled = [...QUAL_KEYS, ...CHECK_KEYS].filter((k) => gv(o, k)).length;
        return sfRow(
          'Qualification score',
          Math.round((filled / (QUAL_KEYS.length + CHECK_KEYS.length)) * 100)
        );
      },
      ['urgency', 'Urgency', 's', ['Low', 'Medium', 'High', 'Immediate']],
      ['urgencyNote', 'Urgency details', 't'],
      ['next', 'Next step', 't'],
      ['nextDate', 'Next step date', 'd'],
      ['econBuyer', 'Economic buyer', 't'],
      ['callBrief', 'Most recent call brief – Gong', 't'],
      ['nextGong', 'Next steps – Gong', 't'],
    ],
  },
  {
    id: 'notes',
    title: 'Win / Loss',
    left: [['won', 'Why we won', 'ta']],
    right: [['lost', 'Why we lost', 'ta']],
  },
];

// Every field label, for the field-history card.
const SF_LABELS = Object.fromEntries(
  [
    ...LEFT,
    ...RIGHT,
    ...SF_SECTIONS.flatMap((s) => [...s.left, ...s.right].filter(Array.isArray)),
  ].map((f) => [f[0], f[1]])
);
function recordFieldChange(o, k, from, to) {
  (o.fh = o.fh || []).unshift({
    t: Date.now(),
    f: SF_LABELS[k] || k,
    by: roleNow().name,
    from,
    to,
  });
  o.fh = o.fh.slice(0, 100);
}

function toggleSec(id, open) {
  S.secClosed = S.secClosed || {};
  if (!!S.secClosed[id] === !open) return;
  S.secClosed[id] = !open;
  save();
}
function toggleRel(id) {
  S.relClosed = S.relClosed || {};
  S.relClosed[id] = !S.relClosed[id];
  const b = document.getElementById('rel-' + id);
  if (b) b.style.display = S.relClosed[id] ? 'none' : '';
  save();
}

const sectionHtml = (o, s) => {
  const col = (list) => list.map((f) => (typeof f === 'function' ? f(o) : fld(o, f))).join('');
  return `<details class="sf-sec" ${(S.secClosed || {})[s.id] ? '' : 'open'} ontoggle="toggleSec('${s.id}',this.open)"><summary><span class="ms sf-chev">expand_more</span>${s.title}</summary><div class="sf-grid"><div>${col(s.left)}</div><div>${col(s.right)}</div></div></details>`;
};

// ----- right-hand related list cards -----
const kv = (label, v) => `<div class="sf-kv"><div>${label}</div><div>${v}</div></div>`;
function relCard(id, icon, color, title, count, body, viewAll, plus, addJs, addLabel) {
  const closed = (S.relClosed || {})[id];
  return `<div class="sf-rel"><div class="sf-rel-h"><span class="sf-ic" style="background:${color}"><span class="ms">${icon}</span></span><b class="flex-1">${title} (${count}${plus ? '+' : ''})</b>${addJs ? `<button type="button" class="btn" onclick="${addJs}">${addLabel || 'Add'}</button>` : ''}<button type="button" class="hdr-ic" style="width:28px;height:28px" aria-label="Show or hide ${title}" onclick="toggleRel('${id}')"><span class="ms">arrow_drop_down</span></button></div><div id="rel-${id}" style="${closed ? 'display:none' : ''}"><div class="sf-rel-b">${body || '<p class="mut py-2">Nothing here yet.</p>'}</div>${viewAll ? `<a class="sf-viewall" onclick="${viewAll}">View All</a>` : ''}</div></div>`;
}
const histVal = (v) => (v === true ? '✓' : v === false || v === '' || v == null ? '–' : E(v));

function sidebarHtml(o) {
  const Q = S.quotes.filter((q) => q.opp == o.id),
    R = roles(o),
    P = (o.partners = o.partners || []),
    acts = S.acts[o.id] || [],
    files = o.attachments || [],
    last = acts[0],
    stageRows = (
      o.sh && o.sh.length
        ? o.sh
        : [
            {
              stage: o.lost ? 'Closed Lost' : ST[o.stage],
              amount: o.amount,
              close: o.close,
              by: '',
              t: last ? last.t : 0,
            },
          ]
    ).slice(0, 3),
    fh = o.fh || [],
    links = [
      ['Contact roles', R.length, 'rel-contacts'],
      ['Products', o.items.length, 'rel-products'],
      ['Quotes', Q.length, 'rel-quotes'],
      ['Partners', P.length, 'rel-partners'],
      ['Files', files.length, 'rel-files'],
      ['Activities', acts.length, 'rel-acts'],
    ];
  return [
    `<div class="sf-rel"><div class="sf-rel-h"><b class="flex-1">Related List Quick Links</b></div><div class="sf-rel-b grid grid-cols-2 gap-1 py-2">${links
      .map(
        (l) =>
          `<a class="rep-link" onclick="document.getElementById('${l[2]}').scrollIntoView({block:'center',behavior:'smooth'})">${l[0]} (${l[1]})</a>`
      )
      .join('')}</div></div>`,
    relCard(
      'contacts',
      'groups',
      '#0b63c5',
      'Contact Roles',
      R.length,
      R.map((r) => {
        const c = S.contacts.find((x) => x[0] == r.name) || [];
        return `<div class="sf-rec"><b>${E(r.name)}</b>${r.primary ? ' <span class="chip ok">Primary</span>' : ''}${kv('Role', E(r.role))}${kv('Title', E(c[1] || '–'))}${kv('Phone', E(c[4] || '–'))}</div>`;
      }).join(''),
      null,
      false,
      "modal('role')"
    ),
    relCard(
      'partners',
      'handshake',
      '#c2410c',
      'Opportunity Partners',
      P.length,
      P.map(
        (p) =>
          `<div class="sf-rec"><b>${E(p.name)}</b>${kv('Partner Type', E(p.type || '–'))}</div>`
      ).join(''),
      null,
      false,
      "modal('partner')"
    ),
    relCard(
      'quotes',
      'request_quote',
      '#2e9e5b',
      'Quotes',
      Q.length,
      Q.map(
        (q) =>
          `<div class="sf-rec"><a class="rep-link" onclick="openQuoteRecord('${E(q.no)}')">${E(q.no)}</a>${q.isDefault ? ' <span class="chip">Default</span>' : ''}${kv('Quote Name', E(q.name || '–'))}${kv('Status', quoteStatusChip(q))}${kv('Price', `<b>${M(quoteTotal(q))}</b>`)}${(q.sends || []).length ? kv('Sent', E(q.sends[q.sends.length - 1].channel === 'email' ? 'Email · ' + q.sends[q.sends.length - 1].to : 'WhatsApp · ' + q.sends[q.sends.length - 1].to)) : ''}${(q.views || []).length ? kv('Opened', `${q.views.length}× · ${ago(q.views[q.views.length - 1].at)}`) : ''}${q.customer ? kv('Customer', E(q.customer.status)) : ''}${kv('Expiration Date', q.exp ? fd(q.exp) : '–')}</div>`
      ).join(''),
      "tab('related')",
      false,
      `openQuote(${o.id})`,
      'New quote'
    ),
    relCard(
      'products',
      'inventory_2',
      '#d9480f',
      'Products',
      o.items.length,
      o.items
        .map(
          (i) =>
            `<div class="sf-rec"><a class="rep-link" onclick="openQuote(${o.id})">${E(i.n)}</a>${kv('Product Code', E(i.c))}${kv('Quantity', i.q)}${kv('List Price', M(i.p))}${+i.d ? kv('Discount', (+i.d).toFixed(2) + '%') : ''}</div>`
        )
        .join(''),
      "tab('related')"
    ),
    relCard(
      'stage',
      'timeline',
      '#13a38a',
      'Stage History',
      (o.sh || []).length || 1,
      stageRows
        .map(
          (s) =>
            `<div class="sf-rec">${kv('Stage', E(s.stage))}${kv('Amount', M(s.amount))}${kv('Close Date', s.close ? fd(s.close) : '–')}${kv('Last Modified By', E(s.by || '–'))}${kv('Last Modified', s.t ? whenText(s.t) : '–')}</div>`
        )
        .join(''),
      "tab('activity')",
      (o.sh || []).length > 3
    ),
    relCard(
      'fieldhist',
      'history',
      '#e8590c',
      'Opportunity Field History',
      Math.min(fh.length, 3),
      fh
        .slice(0, 3)
        .map(
          (h) =>
            `<div class="sf-rec">${kv('Date', whenText(h.t))}${kv('Field', E(h.f))}${kv('User', E(h.by))}${kv('Original Value', histVal(h.from))}${kv('New Value', histVal(h.to))}</div>`
        )
        .join(''),
      "tab('activity')",
      fh.length > 3
    ),
    relCard(
      'files',
      'attach_file',
      '#6b7a90',
      'Files',
      files.length,
      filesCardBody(files),
      "tab('related')"
    ),
    relCard(
      'acts',
      'event_note',
      '#7c4dff',
      'Activities',
      acts.length,
      acts
        .slice(0, 3)
        .map(
          (a) =>
            `<div class="sf-rec flex gap-2"><span class="ms mut">${E(a.k || 'sync')}</span><div><div>${E(hideInvoiceRefs(a.x))}</div><div class="mut text-xs">${ago(a.t)}</div></div></div>`
        )
        .join(''),
      "tab('activity')",
      acts.length > 3
    ),
  ].join('');
}

function recordPage(o) {
  return `<div class="space-y-3">${SF_SECTIONS.map((s) => sectionHtml(o, s)).join('')}</div>`;
}
