// Demo seed data used the first time the app loads (or after "Reset demo").

function seed() {
  const R = [
    ['Acme Corp - 500 Enterprise Licenses', 'Acme Corporation', 120000, 0, 16, 'AL', ''],
    [
      'Pinnacle Financial - Data Cloud',
      'Pinnacle Financial Ltd',
      65000,
      0,
      29,
      'SC',
      'Schedule discovery call',
    ],
    ['Globex - Global Cloud Migration', 'Globex International', 280000, 1, 33, 'DM', ''],
    [
      'Wayne Ent - Hardware Renewal',
      'Wayne Enterprises',
      140000,
      1,
      41,
      'AL',
      'Technical scope review',
    ],
    [
      'Initech - Analytics Suite',
      'Initech Software',
      160000,
      2,
      21,
      'RV',
      'Deliver architecture blueprint',
    ],
    ['Hooli - Enterprise Support Add-on', 'Hooli Corporation', 150000, 2, 46, 'SC', ''],
    [
      'Stark Ind - Q3 Security Platform',
      'Stark Industries',
      520000,
      3,
      2,
      'TS',
      'Send revised MSA & discount auth',
    ],
    ['Cyberdyne - AI Inference Cluster', 'Cyberdyne Systems', 375000, 3, 9, 'AL', ''],
    [
      'Umbrella Corp - Global Multi-tenant',
      'Umbrella Pharmaceuticals',
      450000,
      4,
      1,
      'SC',
      'Legal sign-off on redlines',
    ],
    ['Massive Dynamic - Platform SLA', 'Massive Dynamic LLC', 190000, 4, 6, 'DM', ''],
    ['Soylent Corp - 3-Year Enterprise Agreement', 'Soylent Corporation', 750000, 5, -12, 'SC', ''],
    ['Tyrell Corp - Bio-Cloud Integration', 'Tyrell Corporation', 500000, 5, -8, 'AL', ''],
  ];
  const opps = R.map((r, i) => ({
    id: i + 1,
    name: r[0],
    account: r[1],
    amount: r[2],
    stage: r[3],
    close: D(r[4]),
    owner: r[5],
    next: r[6],
    items: [{ n: 'Platform licence', c: 'GEN-100', p: r[2], q: 1, d: 0 }],
  }));
  opps[6].items = [
    { n: '24/7 Platinum Global Support', c: 'SVC-902', p: 120000, q: 1, d: 0 },
    { n: 'Zero Trust Threat Intelligence Hub', c: 'SEC-880', p: 250000, q: 1, d: 5 },
    { n: 'Hardware Security Appliance Node', c: 'HW-410', p: 45000, q: 4, d: 10 },
  ];
  const h = 36e5,
    now = Date.now();
  return {
    opps,
    cur: 7,
    view: 'kanban',
    quotes: [],
    contacts: [
      ['Pepper Potts', 'Chief Operating Officer', 'Stark Industries', 'ppotts@starkindustries.com'],
      ['James Rhodes', 'Liaison Officer', 'Stark Industries', 'jrhodes@af.mil'],
      ['Bruce Wayne', 'CEO', 'Wayne Enterprises', 'bruce@wayne-ent.com'],
      ['Hank Scorpio', 'VP Procurement', 'Globex International', 'hank@globex.com'],
      ['Peter Gibbons', 'Director of IT', 'Initech Software', 'peter@initech.com'],
      ['Gavin Belson', 'Head of Platform', 'Hooli Corporation', 'gavin@hooli.com'],
      ['Albert Wesker', 'CTO', 'Umbrella Pharmaceuticals', 'awesker@umbrella.com'],
      ['Nellie Bertram', 'Procurement Lead', 'Acme Corporation', 'nellie@acme.com'],
    ],
    leads: [
      ['Maya Patel', 'Northwind Traders', 'Webinar', 'New'],
      ['Jordan Reyes', 'Vandelay Industries', 'Partner Referral', 'Working'],
      ['Priya Nair', 'Wonka Labs', 'Trade Show', 'New'],
      ['Chris Okafor', 'Oscorp', 'Inbound Web', 'Working'],
      ['Elena Rossi', 'Gringotts Capital', 'Outbound', 'New'],
    ],
    tasks: [
      { t: 'Follow up on revised SLA contract', due: 'Today', opp: 7 },
      { t: 'Send MSA redlines to legal', due: 'Tomorrow', opp: 9 },
      { t: 'Prep demo for Cyberdyne', due: 'In 3 days', opp: 8 },
      { t: 'Schedule discovery call with Pinnacle', due: 'In 4 days', opp: 2 },
    ],
    acts: {
      7: [
        {
          k: 'mail',
          x: 'Email sent: Stark Industries - Q3 Platform Proposal v2.pdf',
          t: now - 26 * h,
        },
        {
          k: 'call',
          x: 'Discovery call with VP of Infrastructure (42 min). Budget authority confirmed.',
          t: now - 75 * h,
        },
        { k: 'sync', x: 'Stage changed to Proposal', t: now - 120 * h },
      ],
    },
  };
}
