// Rep activity: time spent in the portal each day and calls made.
// Shown on the rep's own dashboard, the Admin / CEO dashboard and each rep's details page.
//
// Time in portal: counted in 20-second steps while someone is signed in, the tab is visible and
// they have touched the mouse or keyboard in the last 5 minutes (idle time is not counted).
// Stored per user per day in S.usage[userId]['YYYY-MM-DD'] = { sec, first, last, sessions }.
// Calls: Call activities on opportunities, credited to the person who logged them (uid).

const ACT_TICK = 20; // seconds
const ACT_IDLE = 5 * 60 * 1000; // stop counting after 5 minutes without input

const dayKey = (d = new Date()) =>
  d.getFullYear() +
  '-' +
  String(d.getMonth() + 1).padStart(2, '0') +
  '-' +
  String(d.getDate()).padStart(2, '0');
function lastDays(n = 7) {
  return [...Array(n)].map((_, k) => {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - (n - 1 - k));
    return d;
  });
}
function dayBounds(d) {
  const s = new Date(d);
  s.setHours(0, 0, 0, 0);
  const e = new Date(s);
  e.setDate(e.getDate() + 1);
  return [s.getTime(), e.getTime()];
}
// 0 -> "0m", 95 min -> "1h 35m"
function fmtDur(sec) {
  const m = Math.round((sec || 0) / 60);
  if (m < 60) return m + 'm';
  return Math.floor(m / 60) + 'h ' + String(m % 60).padStart(2, '0') + 'm';
}
const fmtCalls = (n) => n + (n === 1 ? ' call' : ' calls');
const fmtTime = (t) =>
  t ? new Date(t).toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' }) : '—';

function usageDay(uid, key) {
  const u = (S.usage || {})[uid] || {};
  return u[key] || { sec: 0, first: 0, last: 0, sessions: 0 };
}
// Calls credited to this rep: logged by them, or (older entries without a logger) on their own deals.
function repCalls(u, from = 0, to = Infinity) {
  const out = [];
  Object.entries(S.acts || {}).forEach(([oid, list]) => {
    const o = S.opps.find((x) => String(x.id) === String(oid));
    (list || []).forEach((a) => {
      if (a.k !== 'call' || !(a.t >= from && a.t < to)) return;
      if (a.uid ? a.uid === u.id : o && o.owner === u.ownerCode) out.push({ ...a, opp: o });
    });
  });
  return out.sort((a, b) => b.t - a.t);
}
function repActivity(u) {
  const days = lastDays(7).map((d) => {
    const [s, e] = dayBounds(d),
      us = usageDay(u.id, dayKey(d)),
      calls = repCalls(u, s, e);
    return {
      label: d.toLocaleDateString('en-IN', { weekday: 'short' }),
      sec: us.sec,
      calls: calls.length,
      mins: calls.reduce((a, c) => a + (c.min || 0), 0),
      first: us.first,
    };
  });
  const weekSec = days.reduce((a, d) => a + d.sec, 0),
    activeDays = days.filter((d) => d.sec > 0).length;
  return {
    days,
    today: days[6],
    weekSec,
    avgSec: activeDays ? weekSec / activeDays : 0,
    weekCalls: days.reduce((a, d) => a + d.calls, 0),
    weekCallMins: days.reduce((a, d) => a + d.mins, 0),
    last: Math.max(0, ...Object.values((S.usage || {})[u.id] || {}).map((x) => x.last || 0)),
  };
}

// ---------- tracking ----------
let actLastInput = Date.now();
['mousemove', 'keydown', 'click', 'scroll', 'touchstart'].forEach((ev) =>
  addEventListener(ev, () => (actLastInput = Date.now()), { passive: true })
);
function trackPortalTime() {
  if (!S.authUser || document.visibilityState !== 'visible') return;
  if (Date.now() - actLastInput > ACT_IDLE) return;
  if (typeof clientRoute === 'function' && clientRoute()) return; // customer pages are not portal time
  S.usage = S.usage || {};
  const u = (S.usage[S.authUser] = S.usage[S.authUser] || {}),
    k = dayKey(),
    d = (u[k] = u[k] || { sec: 0, first: Date.now(), last: 0, sessions: 1 });
  d.sec += ACT_TICK;
  d.last = Date.now();
  save();
}
setInterval(trackPortalTime, ACT_TICK * 1000);
const loginUserBeforeActivity = loginUser;
loginUser = function () {
  const r = loginUserBeforeActivity.apply(this, arguments);
  if (S.authUser) {
    S.usage = S.usage || {};
    const u = (S.usage[S.authUser] = S.usage[S.authUser] || {}),
      k = dayKey(),
      d = (u[k] = u[k] || { sec: 0, first: Date.now(), last: Date.now(), sessions: 0 });
    d.sessions = (d.sessions || 0) + 1;
    actLastInput = Date.now();
    save();
  }
  return r;
};

// ---------- quick "Log a call" ----------
function openCallLog(oppId) {
  const deals = visibleOpps().filter((o) => !o.lost);
  if (!deals.length) return toast('You have no opportunities to log a call against');
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveCallLog(event)"><h2 class="text-lg font-bold flex items-center gap-2"><span class="ms" style="color:var(--pr)">call</span>Log a call</h2>` +
    `<label class="block">Opportunity *<select class="inp mt-1" name="opp" required>${deals.map((o) => `<option value="${o.id}" ${o.id == oppId ? 'selected' : ''}>${E(o.name)} · ${E(o.account)}</option>`).join('')}</select></label>` +
    `<label class="block">Duration (minutes) *<input class="inp mt-1" name="min" type="number" min="1" max="600" value="10" required></label>` +
    `<label class="block">Notes *<input class="inp mt-1" name="x" required maxlength="200" placeholder="e.g. Discussed pricing, sending revised quote"></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Save call</button></div></form></div>`;
  $('#modal select').focus();
}
function saveCallLog(e) {
  e.preventDefault();
  const v = Object.fromEntries(new FormData(e.target)),
    o = S.opps.find((x) => x.id == v.opp),
    min = Math.max(1, Math.min(600, parseInt(v.min, 10) || 0));
  if (!o || !String(v.x || '').trim()) return;
  (S.acts[o.id] = S.acts[o.id] || []).unshift({
    k: 'call',
    x: `Call (${min} min): ${String(v.x).trim()}`,
    t: Date.now(),
    min,
    uid: S.authUser,
    by: roleNow().name,
  });
  save();
  $('#modal').innerHTML = '';
  toast('Call logged');
  render();
}

// ---------- demo history (runs once) so the charts have something to show ----------
function seedActivityDemo() {
  if (S.activitySeeded || !S.users) return;
  const reps = S.users.filter((u) => u.role === 'rep');
  const rnd = (str) => {
    let h = 2166136261;
    for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619) >>> 0;
    return (h % 10000) / 10000;
  };
  const topics = [
    'Follow-up call with',
    'Discovery call with',
    'Pricing discussion with',
    'Check-in call with',
  ];
  S.usage = S.usage || {};
  reps.forEach((u) => {
    const deals = S.opps.filter((o) => o.owner === u.ownerCode);
    lastDays(7).forEach((d, i) => {
      const today = i === 6,
        weekend = [0, 6].includes(d.getDay()),
        r = rnd(u.ownerCode + dayKey(d)),
        k = dayKey(d);
      // time: 3-7 h on weekdays, under 1 h at weekends, part of the day so far for today
      let sec = Math.round((weekend ? 0.3 + r * 0.6 : 3 + r * 4) * 3600);
      if (today) sec = Math.round((0.5 + r * 2.5) * 3600);
      const start = new Date(d);
      start.setHours(9, Math.round(r * 50), 0, 0);
      const u2 = (S.usage[u.id] = S.usage[u.id] || {});
      if (!u2[k])
        u2[k] = {
          sec,
          first: start.getTime(),
          last: Math.min(Date.now(), start.getTime() + sec * 1000 * 1.3),
          sessions: 1 + Math.round(r * 2),
        };
      // calls: 3-9 on weekdays, 0-1 at weekends, fewer so far today
      const n = weekend ? Math.round(r) : today ? Math.round(r * 4) : 3 + Math.round(r * 6);
      for (let c = 0; c < n && deals.length; c++) {
        const o = deals[(c + i) % deals.length],
          t = start.getTime() + (c + 1) * 50 * 60 * 1000,
          min = 5 + Math.round(rnd(u.id + k + c) * 30);
        if (t > Date.now()) break;
        (S.acts[o.id] = S.acts[o.id] || []).push({
          k: 'call',
          x: `Call (${min} min): ${topics[c % topics.length]} ${o.account}`,
          t,
          min,
          uid: u.id,
          by: u.name,
          demo: true,
        });
      }
    });
  });
  Object.values(S.acts).forEach((list) => list.sort((a, b) => b.t - a.t));
  S.activitySeeded = true;
  save();
}
seedActivityDemo();

// ---------- views ----------
function activityTiles(a, extra = '') {
  const tile = (label, value, sub) =>
    `<div class="act-tile"><div class="mut text-xs">${label}</div><div class="text-xl font-bold">${value}</div>${sub ? `<div class="mut text-xs">${sub}</div>` : ''}</div>`;
  return `<div class="act-tiles">${tile('Time in portal today', fmtDur(a.today.sec), a.today.first ? 'Since ' + fmtTime(a.today.first) : 'Not signed in yet')}${tile('Average per day', fmtDur(a.avgSec), 'Last 7 days')}${tile('Calls today', a.today.calls, a.today.mins ? a.today.mins + ' min on calls' : '')}${tile('Calls this week', a.weekCalls, a.weekCallMins ? a.weekCallMins + ' min on calls' : 'Last 7 days')}${extra}</div>`;
}
function activityCharts(a) {
  return `${dashCard(
    'Time in portal',
    'Active time per day, last 7 days (idle time not counted)',
    dashColumns(
      a.days.map((d) => ({ label: d.label, value: d.sec })),
      fmtDur
    )
  )}${dashCard(
    'Calls made',
    'Calls logged per day, last 7 days',
    dashColumns(
      a.days.map((d) => ({ label: d.label, value: d.calls })),
      fmtCalls
    )
  )}`;
}

// Rep's own dashboard ("My deals" view): their activity.
// Admin / CEO dashboard: every rep's activity today and this week.
const homeBeforeActivity = V.home;
V.home = () => {
  const html = homeBeforeActivity();
  let block = '';
  if (!seesAllOpps() || S.role === 'rep') {
    const me = (S.users || []).find((u) => u.id === S.authUser);
    if (me) {
      const a = repActivity(me);
      block = `<div class="grid lg:grid-cols-3 gap-3 mb-3"><div class="card p-4 dash-card"><div class="flex items-start gap-2"><b class="flex-1">My activity</b><button class="btn btn-p" onclick="openCallLog()"><span class="ms">call</span>Log a call</button></div>${activityTiles(a)}</div>${activityCharts(a)}</div>`;
    }
  } else {
    const reps = (S.users || []).filter((u) => u.role === 'rep' && u.active !== false),
      rows = reps.map((u) => ({
        u,
        a: repActivity(u),
        team: typeof teamById === 'function' && u.teamId ? teamById(u.teamId) : null,
      }));
    const timeRows = [...rows]
      .sort((x, y) => y.a.today.sec - x.a.today.sec)
      .map(({ u, a, team }) => ({
        label: u.name,
        value: a.today.sec,
        sub: `${team ? team.name + ' · ' : ''}${fmtCalls(a.today.calls)} today · last active ${fmtTime(a.last)}`,
        click: `openRep(${E(JSON.stringify(u.ownerCode))})`,
      }));
    const callRows = [...rows]
      .sort((x, y) => y.a.weekCalls - x.a.weekCalls)
      .map(({ u, a, team }) => ({
        label: u.name,
        value: a.weekCalls,
        sub: `${team ? team.name + ' · ' : ''}${a.weekCallMins} min on calls · avg ${fmtDur(a.avgSec)}/day in portal`,
        click: `openRep(${E(JSON.stringify(u.ownerCode))})`,
      }));
    const totalToday = rows.reduce((x, r) => x + r.a.today.sec, 0),
      callsToday = rows.reduce((x, r) => x + r.a.today.calls, 0),
      callsWeek = rows.reduce((x, r) => x + r.a.weekCalls, 0),
      activeNow = rows.filter((r) => Date.now() - r.a.last < 15 * 60 * 1000).length;
    block = `<div class="flex items-end gap-2 mt-1 mb-2"><h2 class="text-lg font-bold flex-1 flex items-center gap-2"><span class="ms" style="color:var(--pr)">monitoring</span>Rep activity</h2><span class="mut text-xs">Click a rep to open their details</span></div><div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3"><div class="card p-4"><div class="mut font-semibold">Active in last 15 min</div><div class="text-2xl font-bold mt-1">${activeNow} of ${rows.length}</div><div class="mut mt-1">reps</div></div><div class="card p-4"><div class="mut font-semibold">Portal time today</div><div class="text-2xl font-bold mt-1">${fmtDur(totalToday)}</div><div class="mut mt-1">all reps combined</div></div><div class="card p-4"><div class="mut font-semibold">Calls today</div><div class="text-2xl font-bold mt-1">${callsToday}</div><div class="mut mt-1">all reps</div></div><div class="card p-4"><div class="mut font-semibold">Calls this week</div><div class="text-2xl font-bold mt-1">${callsWeek}</div><div class="mut mt-1">last 7 days</div></div></div><div class="grid lg:grid-cols-2 gap-3 mb-3">${dashCard('Time in portal today', 'Active time per rep (idle time not counted)', dashBars(timeRows, '', fmtDur))}${dashCard('Calls this week', 'Calls logged per rep, last 7 days', dashBars(callRows, '', fmtCalls))}</div>`;
  }
  return html.replace('<!--dash-activity-->', block);
};

// Rep details page (Admin / CEO): that rep's time and calls, plus their latest calls.
const repDetailBeforeActivity = V['rep-detail'];
V['rep-detail'] = () => {
  const html = repDetailBeforeActivity(),
    u = canViewReps() && repByCode(S.curRep);
  if (!u) return html;
  const a = repActivity(u),
    recent = repCalls(u).slice(0, 6);
  const recentList = recent.length
    ? recent
        .map(
          (c) =>
            `<div class="flex gap-2 py-2 border-b r" style="border-color:var(--bd)" onclick="${c.opp ? `nav('opp-detail',${c.opp.id})` : ''}"><span class="ms mut">call</span><div class="flex-1 min-w-0"><div class="truncate">${E(c.x)}</div><small class="mut">${c.opp ? E(c.opp.name) + ' · ' : ''}${ago(c.t)}</small></div></div>`
        )
        .join('')
    : '<p class="mut mt-2">No calls logged yet.</p>';
  const block = `<div class="grid lg:grid-cols-3 gap-3 mb-3"><div class="card p-4 dash-card"><b>Activity</b><div class="mut text-xs">Last active ${a.last ? fmtTime(a.last) + ' · ' + ago(a.last) : 'never'}</div>${activityTiles(a)}<div class="mt-3"><b class="text-sm">Recent calls</b>${recentList}</div></div>${activityCharts(a)}</div>`;
  return html.replace('<!--rep-activity-->', block);
};
