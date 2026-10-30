const ST=["Prospecting","Qualification","Needs Analysis","Proposal","Negotiation","Closed Won"],LS=["New","Working","Qualified"];
const OWN=["Priya Shah","Rahul Mehta","Dana Wright"];
const T={
 leads:{l:"Leads",s:"Lead",c:"#f59e0b",t:"name",cols:["name","company","status","source","owner"],f:[["name","Name"],["company","Company"],["email","Email","email"],["phone","Phone"],["status","Status",["New","Working","Qualified","Unqualified"]],["source","Lead Source",["Web","Referral","Event","Partner"]],["owner","Owner",OWN]]},
 accounts:{l:"Accounts",s:"Account",c:"#7f8de1",t:"name",cols:["name","industry","city","owner","revenue"],f:[["name","Account Name"],["industry","Industry",["Government","Technology","Retail","Finance","Manufacturing"]],["city","City"],["phone","Phone"],["website","Website"],["revenue","Annual Revenue","number"],["owner","Owner",OWN]]},
 contacts:{l:"Contacts",s:"Contact",c:"#ff538a",t:"name",cols:["name","account","title","email","phone"],f:[["name","Name"],["account","Account Name"],["title","Title"],["email","Email","email"],["phone","Phone"],["owner","Owner",OWN]]},
 opportunities:{l:"Opportunities",s:"Opportunity",c:"#fc903d",t:"name",cols:["name","account","stage","close","amount","owner"],f:[["name","Opportunity Name"],["account","Account Name"],["stage","Stage",ST.concat(["Closed Lost"])],["amount","Amount","number"],["close","Close Date","date"],["prob","Probability (%)","number"],["type","Type",["New Business","Renewal","Upsell"]],["owner","Owner",OWN],["notes","Description","area"]]},
 tasks:{l:"Tasks",s:"Task",c:"#4bc076",t:"subject",cols:["subject","related","due","priority","status"],f:[["subject","Subject"],["related","Related To"],["due","Due Date","date"],["priority","Priority",["High","Normal","Low"]],["status","Status",["Open","In Progress","Done"]],["owner","Owner",OWN]]}
};
const LBL=k=>({name:"Name",company:"Company",status:"Status",source:"Lead Source",owner:"Owner",industry:"Industry",city:"City",revenue:"Revenue",account:"Account",title:"Title",email:"Email",phone:"Phone",stage:"Stage",close:"Close Date",amount:"Amount",subject:"Subject",related:"Related To",due:"Due Date",priority:"Priority"}[k]||k);
const SEED=()=>({n:100,
leads:[{id:1,name:"Ananya Iyer",company:"BlueOrbit Tech",email:"ananya@blueorbit.io",phone:"+91 98250 11223",status:"New",source:"Web",owner:OWN[0],notes:[]},{id:2,name:"Marc Dupont",company:"Lumière Retail",email:"marc@lumiere.fr",phone:"+33 1 4455 6677",status:"Working",source:"Event",owner:OWN[1],notes:[]},{id:3,name:"Sofia Rossi",company:"Vento Finance",email:"s.rossi@vento.it",phone:"+39 02 5551 234",status:"Qualified",source:"Referral",owner:OWN[0],notes:[]},{id:4,name:"Kenji Sato",company:"Hikari Motors",email:"kenji@hikari.jp",phone:"+81 3 5555 0101",status:"New",source:"Partner",owner:OWN[2],notes:[]}],
accounts:[{id:10,name:"Service Public De Wallonie",industry:"Government",city:"Namur",phone:"+32 81 33 00 00",website:"wallonie.be",revenue:0,owner:OWN[0],notes:[]},{id:11,name:"Acme Corp",industry:"Manufacturing",city:"Chicago",phone:"+1 312 555 0100",website:"acme.com",revenue:120000000,owner:OWN[1],notes:[]},{id:12,name:"Globex Ltd",industry:"Technology",city:"London",phone:"+44 20 7946 0000",website:"globex.co.uk",revenue:45000000,owner:OWN[0],notes:[]},{id:13,name:"Initech",industry:"Finance",city:"Austin",phone:"+1 512 555 0188",website:"initech.com",revenue:18000000,owner:OWN[2],notes:[]}],
contacts:[{id:20,name:"Claire Martin",account:"Service Public De Wallonie",title:"Procurement Lead",email:"c.martin@wallonie.be",phone:"+32 81 33 00 01",owner:OWN[0],notes:[]},{id:21,name:"Dana Wright",account:"Acme Corp",title:"CTO",email:"dana@acme.com",phone:"+1 312 555 0111",owner:OWN[1],notes:[]},{id:22,name:"Tom Becker",account:"Acme Corp",title:"IT Manager",email:"tom@acme.com",phone:"+1 312 555 0122",owner:OWN[1],notes:[]},{id:23,name:"Olivia Hart",account:"Globex Ltd",title:"VP Operations",email:"olivia@globex.co.uk",phone:"+44 20 7946 0011",owner:OWN[0],notes:[]},{id:24,name:"Peter Gill",account:"Initech",title:"Finance Director",email:"peter@initech.com",phone:"+1 512 555 0190",owner:OWN[2],notes:[]}],
opportunities:[{id:30,name:"MR-SO00113910-6.26-5",account:"Service Public De Wallonie",stage:"Closed Won",amount:48000,close:"2026-06-23",prob:100,type:"Renewal",owner:OWN[0],notes:["Ongoing success with the product + consolidation of licences into one renewal."]},{id:31,name:"Acme – Platform Expansion",account:"Acme Corp",stage:"Proposal",amount:72000,close:"2026-12-15",prob:60,type:"Upsell",owner:OWN[1],notes:[]},{id:32,name:"Globex – New Rollout",account:"Globex Ltd",stage:"Qualification",amount:31500,close:"2027-01-30",prob:25,type:"New Business",owner:OWN[0],notes:[]},{id:33,name:"Initech Support Renewal",account:"Initech",stage:"Negotiation",amount:19800,close:"2026-11-20",prob:80,type:"Renewal",owner:OWN[2],notes:[]},{id:34,name:"Acme – Analytics Add-on",account:"Acme Corp",stage:"Needs Analysis",amount:24000,close:"2027-02-10",prob:40,type:"Upsell",owner:OWN[1],notes:[]},{id:35,name:"Globex – Legacy Migration",account:"Globex Ltd",stage:"Closed Lost",amount:15000,close:"2026-09-30",prob:0,type:"New Business",owner:OWN[0],notes:[]}],
tasks:[{id:40,subject:"Send revised proposal",related:"Acme – Platform Expansion",due:"2026-10-31",priority:"High",status:"Open",owner:OWN[1]},{id:41,subject:"Follow up call",related:"Marc Dupont",due:"2026-11-02",priority:"Normal",status:"In Progress",owner:OWN[1]},{id:42,subject:"Contract review with legal",related:"Initech Support Renewal",due:"2026-11-05",priority:"High",status:"Open",owner:OWN[2]},{id:43,subject:"Intro demo",related:"Ananya Iyer",due:"2026-11-04",priority:"Normal",status:"Open",owner:OWN[0]},{id:44,subject:"Quarterly business review",related:"Globex Ltd",due:"2026-10-20",priority:"Low",status:"Done",owner:OWN[0]}]});
let DB;try{DB=JSON.parse(localStorage.getItem("nimbus"))}catch(e){}DB=DB||SEED();
const save=()=>{try{localStorage.setItem("nimbus",JSON.stringify(DB))}catch(e){}};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const money=n=>"$"+Number(n||0).toLocaleString("en-US");
const fd=d=>d?new Date(d+"T00:00").toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"}):"";
function toast(m){const t=$("toast");t.textContent=m;t.style.display="block";clearTimeout(t._h);t._h=setTimeout(()=>t.style.display="none",1900)}
function resetDemo(){if(confirm("Reset all data to the demo set?")){DB=SEED();save();location.hash="home";route();toast("Demo data restored")}}
const pill=v=>{const c=["Closed Won","Qualified","Done"].includes(v)?"g":["Closed Lost","Unqualified","High"].includes(v)?"r":["New","In Progress","Normal"].includes(v)&&0?"y":"";return `<span class="pill ${c}">${esc(v)}</span>`};
function cell(o,k,r){const v=r[k];
 if(k===T[o].t)return `<a onclick="go('${o}',${r.id})">${esc(v)}</a>`;
 if(["amount","revenue"].includes(k))return money(v);
 if(["close","due"].includes(k))return fd(v);
 if(["stage","status","priority"].includes(k))return pill(v);
 if(k==="account"&&DB.accounts.find(a=>a.name===v))return `<a onclick="go('accounts',${DB.accounts.find(a=>a.name===v).id})">${esc(v)}</a>`;
 return esc(v)}
const go=(o,id)=>location.hash=id?`${o}/${id}`:o;
function nav(cur){$("nav").innerHTML=[["home","Home"]].concat(Object.keys(T).map(k=>[k,T[k].l])).map(([k,l])=>`<a class="${cur===k?"on":""}" onclick="go('${k}')">${l}</a>`).join("")}
function route(){const [o,id]=location.hash.slice(1).split("/");nav(o||"home");
 if(!o||o==="home")home();else if(o==="search")sres();else if(T[o]&&id)record(o,+id);else if(T[o])list(o);else home();window.scrollTo(0,0)}
addEventListener("hashchange",route);
/* HOME */
function bars(m,fmt){const mx=Math.max(1,...Object.values(m));return Object.entries(m).map(([k,v])=>`<div class="bar"><span>${k}</span><div class="t"><i style="width:${v/mx*100}%"></i></div><b>${fmt?fmt(v):v}</b></div>`).join("")}
function home(){
 const op=DB.opportunities,open=op.filter(o=>!o.stage.startsWith("Closed")),won=op.filter(o=>o.stage==="Closed Won"),lost=op.filter(o=>o.stage==="Closed Lost");
 const sum=a=>a.reduce((s,o)=>s+Number(o.amount||0),0),wr=won.length+lost.length?Math.round(won.length/(won.length+lost.length)*100):0;
 const ps={};ST.slice(0,5).forEach(s=>ps[s]=sum(op.filter(o=>o.stage===s)));
 const ls={};["New","Working","Qualified","Unqualified"].forEach(s=>ls[s]=DB.leads.filter(l=>l.status===s).length);
 const tk=DB.tasks.filter(t=>t.status!=="Done").sort((a,b)=>a.due>b.due?1:-1).slice(0,5);
 $("app").innerHTML=`<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px"><div><h2 style="margin:0">Sales Home</h2><small style="color:var(--muted)">Pipeline and activity overview</small></div><button class="btn brand" onclick="openM('opportunities')">New Opportunity</button></div>
 <div class="kpis"><div class="card kpi"><b>${money(sum(open))}</b><span>Open pipeline (${open.length} deals)</span></div><div class="card kpi" style="border-color:var(--green)"><b>${money(sum(won))}</b><span>Closed won</span></div><div class="card kpi" style="border-color:#f59e0b"><b>${DB.leads.filter(l=>l.status!=="Unqualified").length}</b><span>Active leads</span></div><div class="card kpi" style="border-color:#7f8de1"><b>${wr}%</b><span>Win rate</span></div></div>
 <div class="g2"><div class="card"><h3>Pipeline by stage</h3><div class="bd">${bars(ps,money)}</div></div><div class="card"><h3>Leads by status</h3><div class="bd">${bars(ls)}</div></div></div>
 <div class="g2"><div class="card"><h3>Open tasks <a onclick="go('tasks')">View all</a></h3><div class="bd">${tk.map(t=>`<div class="li"><div><a onclick="go('tasks',${t.id})">${esc(t.subject)}</a><small>${esc(t.related)}</small></div><div style="text-align:right">${fd(t.due)}<small>${t.priority}</small></div></div>`).join("")||'<div class="empty">All caught up. No open tasks.</div>'}</div></div>
 <div class="card"><h3>Largest open deals</h3><div class="bd">${open.sort((a,b)=>b.amount-a.amount).slice(0,5).map(o=>`<div class="li"><div><a onclick="go('opportunities',${o.id})">${esc(o.name)}</a><small>${esc(o.account)}</small></div><div style="text-align:right">${money(o.amount)}<small>${o.stage}</small></div></div>`).join("")}</div></div></div>`+homeX()}
let TOPN=5;
function homeX(){const op=DB.opportunities,sum=a=>a.reduce((t,o)=>t+Number(o.amount||0),0),reps=[...new Set(OWN.concat(op.map(o=>o.owner),DB.leads.map(l=>l.owner)))];
 const rows=reps.map(r=>{const m=op.filter(o=>o.owner===r),w=m.filter(o=>o.stage==="Closed Won"),l=m.filter(o=>o.stage==="Closed Lost"),a=m.filter(o=>!o.stage.startsWith("Closed"));return `<tr><td>${esc(r)}</td><td>${money(sum(w))}</td><td>${money(sum(a))}</td><td>${a.length}</td><td>${DB.leads.filter(x=>x.owner===r).length}</td><td>${w.length+l.length?Math.round(w.length/(w.length+l.length)*100)+"%":"–"}</td></tr>`}).join("");
 const M={};op.filter(o=>o.close&&o.stage.startsWith("Closed")).forEach(o=>{const k=o.close.slice(0,7),m=M[k]=M[k]||{w:0,l:0};o.stage==="Closed Won"?m.w+=+o.amount||0:m.l+=+o.amount||0});
 const ks=Object.keys(M).sort(),mn=k=>new Date(k+"-01T00:00").toLocaleDateString("en-GB",{month:"short",year:"2-digit"}),sales={};ks.forEach(k=>sales[mn(k)]=M[k].w);
 const ch=ks.map(k=>{const t=M[k].w+M[k].l;return `<tr><td>${mn(k)}</td><td>${money(M[k].w)}</td><td>${money(M[k].l)}</td><td>${t?Math.round(M[k].l/t*100)+"%":"–"}</td></tr>`}).join("");
 const ren=op.filter(o=>o.type==="Renewal"),rl=ren.filter(o=>o.stage==="Closed Lost"),rw=ren.filter(o=>o.stage==="Closed Won");
 const W={Qualified:3,Working:2,New:1,Unqualified:-9},SW={Referral:3,Partner:2,Event:2,Web:1};
 const tl=DB.leads.map(l=>({...l,sc:(W[l.status]||0)*10+(SW[l.source]||0)*5+Math.min(20,Math.round(sum(op.filter(o=>o.account===l.company&&!o.stage.startsWith("Closed")))/5000))})).sort((a,b)=>b.sc-a.sc).slice(0,TOPN);
 const src={};DB.leads.forEach(l=>src[l.source]=(src[l.source]||0)+1);
 const due=op.filter(o=>o.type==="Renewal"&&!o.stage.startsWith("Closed")).sort((a,b)=>a.close>b.close?1:-1).slice(0,5);
 return `<div class="g2"><div class="card"><h3>Sales by rep</h3><table><thead><tr><th>Rep</th><th>Won</th><th>Open pipeline</th><th>Open deals</th><th>Leads</th><th>Win rate</th></tr></thead><tbody>${rows}</tbody></table></div>
 <div class="card"><h3>Monthly sales (closed won)</h3><div class="bd">${ks.length?bars(sales,money):'<div class="empty">No closed deals yet.</div>'}</div></div></div>
 <div class="g2"><div class="card"><h3>Monthly churn (closed lost)</h3><table><thead><tr><th>Month</th><th>Won</th><th>Lost</th><th>Churn %</th></tr></thead><tbody>${ch||'<tr><td colspan="4" class="empty">No data.</td></tr>'}</tbody></table><div class="bd">Renewals: ${rw.length} won · ${rl.length} lost · retention ${ren.length&&rw.length+rl.length?Math.round(rw.length/(rw.length+rl.length)*100)+"%":"–"}</div></div>
 <div class="card"><h3>Top <select onchange="TOPN=+this.value;home()">${[3,5,10,20].map(n=>`<option ${n===TOPN?"selected":""}>${n}</option>`).join("")}</select> leads</h3><div class="bd">${tl.map(l=>`<div class="li"><div><a onclick="go('leads',${l.id})">${esc(l.name)}</a><small>${esc(l.company)} · ${l.source}</small></div><div style="text-align:right">${pill(l.status)}<small>score ${l.sc}</small></div></div>`).join("")||'<div class="empty">No leads.</div>'}</div></div></div>
 <div class="g2"><div class="card"><h3>Leads by source</h3><div class="bd">${bars(src)}</div></div>
 <div class="card"><h3>Renewals coming up</h3><div class="bd">${due.map(o=>`<div class="li"><div><a onclick="go('opportunities',${o.id})">${esc(o.name)}</a><small>${esc(o.account)}</small></div><div style="text-align:right">${money(o.amount)}<small>${fd(o.close)}</small></div></div>`).join("")||'<div class="empty">None open.</div>'}</div></div></div>`}
/* LIST */
let SORT={},FIL={};
function list(o){const d=T[o],q=(FIL[o]||"").toLowerCase(),s=SORT[o];
 let rows=DB[o].filter(r=>d.cols.some(k=>String(r[k]??"").toLowerCase().includes(q)));
 if(s)rows.sort((a,b)=>(a[s.k]>b[s.k]?1:-1)*s.d);
 $("app").innerHTML=`<div class="card"><div class="lh"><div><h2>${d.l}</h2><small>${rows.length} items</small></div><div style="display:flex;gap:8px"><input id="fi" placeholder="Filter ${d.l.toLowerCase()}…" value="${esc(FIL[o]||"")}" oninput="FIL['${o}']=this.value;list('${o}');const e=$('fi');e.focus();e.setSelectionRange(99,99)"><button class="btn brand" onclick="openM('${o}')">New ${d.s}</button></div></div>
 <div style="overflow-x:auto"><table><thead><tr>${d.cols.map(k=>`<th onclick="SORT['${o}']={k:'${k}',d:${s&&s.k===k?-s.d:1}};list('${o}')">${LBL(k)} ${s&&s.k===k?(s.d>0?"▲":"▼"):""}</th>`).join("")}<th></th></tr></thead><tbody>${rows.map(r=>`<tr>${d.cols.map(k=>`<td>${cell(o,k,r)}</td>`).join("")}<td style="text-align:right"><a onclick="openM('${o}',${r.id})">Edit</a></td></tr>`).join("")||`<tr><td colspan="9" class="empty">Nothing found. Clear the filter or create a new ${d.s.toLowerCase()}.</td></tr>`}</tbody></table></div></div>`}
/* RECORD */
function rel(o,r){const A=DB.accounts,C=DB.contacts,P=DB.opportunities,K=DB.tasks,n=r.name,R={};
 if(o==="accounts"){R.contacts=C.filter(c=>c.account===n);R.opportunities=P.filter(p=>p.account===n);R.tasks=K.filter(t=>t.related===n)}
 else if(o==="contacts"){R.accounts=A.filter(a=>a.name===r.account);R.opportunities=P.filter(p=>p.account===r.account);R.tasks=K.filter(t=>t.related===n)}
 else if(o==="opportunities"){R.accounts=A.filter(a=>a.name===r.account);R.contacts=C.filter(c=>c.account===r.account);R.tasks=K.filter(t=>t.related===n)}
 else if(o==="leads")R.tasks=K.filter(t=>t.related===n);
 return R}
const sub=(o,r)=>o==="contacts"?r.title:o==="opportunities"?r.stage+" · "+money(r.amount):o==="tasks"?fd(r.due):o==="accounts"?r.industry:"";

/* OPPORTUNITY DASHBOARD */
{const _o=DB.opportunities&&DB.opportunities.find(x=>x.id===30);if(_o&&_o.yoy===undefined){Object.assign(_o,{flag:3,rtype:"Renewal",sdr:"N/A",oamount:48000,yoy:"1.11",fc:"Closed",mfo:"Pipeline",won:"On going success with the product + Consolidation of the licenses into one renewal, which gave customer additional discounts to secure the renewal.",rc:"None",partners:[{id:"OP-79673",account:"Pronto",type:"Distributor",level:""}]});save()}}
let OID,OTAB="det";
const OL=[["owner","Opportunity Owner","s",OWN],["name","Opportunity Name"],["source","Opportunity Source","s",["Web","Referral","Event","Partner"]],["account","Account Name","a"],["type","Type","s",["New Business","Renewal","Upsell"]],["revch","Revenue Channel"],["refrep","Referral Rep"],["cur","Opportunity Currency","s",["USD","EUR","GBP","INR"]],["hold","Hold Tag"],["chin","Channel Initiated","c"],["chnotes","Channel Initiated Notes"],["so","Sales Order Number"],["autobill","Auto Bill Status"],["lastact","Last Activity","d"],["pm","Potential Matches Button","c"],["acstat","Account Stats"],["y1","Year 1"],["y2","Year 2"]];
const OR=[["rtype","Opportunity Record Type","s",["New Business","Renewal","Upsell"]],["sdr","Stage Duration Risk"],["amount","Amount","m"],["oamount","Original Amount","m"],["yoy","Original YoY"],["close","Close Date","d"],["stage","Stage","s",ST.concat(["Closed Lost"])],["prob","Probability (%)","p"],["fc","Forecast Status","s",["Pipeline","Best Case","Commit","Closed","Omitted"]],["mfo","Manager Forecast Override","s",["Pipeline","Best Case","Commit","Closed","Omitted"]],["won","Reason Won","t"],["why","Why We Won","t"],["lost","Why We Lost","t"],["rc","Risk Classification","s",["None","Low","Medium","High"]],["rl1","Risk/Churn Level 1"],["rl2","Risk/Churn Level 2"],["rl3","Risk/Churn Level 3"],["arn","At Risk Notes","t"]];
const FD={};OL.concat(OR).forEach(f=>FD[f[0]]=f);
const cur=()=>DB.opportunities.find(x=>x.id===OID);
function oe(k){const f=FD[k],t=f[2],v=cur()[k]??"",ov=$("of-"+k).querySelector(".ov");
 ov.innerHTML=t==="s"?`<select id="oi" onchange="os('${k}')"><option value=""></option>${f[3].map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("")}</select>`:t==="t"?`<textarea id="oi" rows="3" onchange="os('${k}')">${esc(v)}</textarea>`:`<input id="oi" type="${t==="d"?"date":["m","p"].includes(t)?"number":"text"}" value="${esc(v)}" onchange="os('${k}')" onkeydown="if(event.key==='Escape')oppRec(cur())">`;
 $("oi").focus()}
function os(k){const r=cur(),f=FD[k],x=$("oi").value;r[k]=["m","p"].includes(f[2])?Number(x):x;
 if(k==="stage"){r.prob=x==="Closed Won"?100:x==="Closed Lost"?0:r.prob}save();oppRec(r);toast(f[1]+" updated")}
function oc(k,v){cur()[k]=v;save();toast("Saved")}
function otab(t){OTAB=t;oppRec(cur())}
function fol(){const r=cur();r.follow=!r.follow;save();oppRec(r);toast(r.follow?"Following":"Unfollowed")}
function cloneRel(id){const r=DB.opportunities.find(x=>x.id===id),n={...r,id:++DB.n,name:r.name+" (copy)",notes:[...(r.notes||[])]};DB.opportunities.unshift(n);DB.tasks.filter(t=>t.related===r.name).forEach(t=>DB.tasks.unshift({...t,id:++DB.n,related:n.name}));save();go("opportunities",n.id);toast("Cloned with related records")}
function addPartner(){const a=prompt("Partner account name");if(!a)return;const r=cur();(r.partners=r.partners||[]).push({id:"OP-"+(10000+Math.floor(Math.random()*89999)),account:a,type:prompt("Partner type","Distributor")||"",level:""});save();oppRec(r)}
function oppRec(r){OID=r.id;const id=r.id,d=T.opportunities,cs=DB.contacts.filter(c=>c.account===r.account),ps=r.partners||[],tk=DB.tasks.filter(t=>t.related===r.name);
 const acc=DB.accounts.find(a=>a.name===r.account);
 const fld=f=>{const [k,l,t]=f,v=r[k];
  if(t==="c")return `<div class="of"><label>${l}</label><input type="checkbox" ${v?"checked":""} onchange="oc('${k}',this.checked)"></div>`;
  const s=v===undefined||v===""||v===null?"":t==="m"?money(v):t==="p"?v+"%":t==="d"?fd(v):t==="a"&&acc?`<a onclick="go('accounts',${acc.id})">${esc(v)}</a>`:esc(v);
  return `<div class="of" id="of-${k}"><label>${l}</label><div class="ov">${s}</div><button class="pen" title="Edit" onclick="oe('${k}')">✎</button></div>`};
 const B=[[r.follow?"✓ Following":"＋ Follow","fol()"],["Send to Slack","toast('Sent to Slack')"],["Slack Alerts","toast('Slack alerts toggled')"],["Printable View","window.print()"],["View Opportunity in Gong","otab('gng')"],["Add Referral","toast('Referral added')"],["AWS Private Offer","toast('AWS Private Offer requested')"],["Clone with Related",`cloneRel(${id})`],["Clone",`clone('opportunities',${id})`],["Edit",`openM('opportunities',${id})`],["Potential Matches ▾","toast('No potential matches')"]];
 const i=ST.indexOf(r.stage),lost=r.stage==="Closed Lost";
 const path=`<div class="card pb"><ul class="path">${ST.map((s,j)=>{const L=lost&&j===ST.length-1;return `<li class="${L?"l":j<i?"d":j===i?"c":""}" onclick="setStage('opportunities',${id},'${s}')">${L?"Closed Lost":j<i?"✓ "+s:s}</li>`}).join("")}</ul><select class="btn" onchange="if(this.value)setStage('opportunities',${id},this.value)"><option value="">Change Closed Stage</option><option>Closed Won</option><option>Closed Lost</option></select></div>`;
 const TB=[["det","Details"],["act","Activity"],["cht","Chatter"],["gng","Gong"],["jra","Jira"]];
 const notes=(r.notes||[]).map(n=>`<div class="n">${esc(n)}</div>`).join("")||'<div class="empty">No activity yet.</div>';
 const body=OTAB==="det"?`<div class="two"><div>${OL.map(fld).join("")}</div><div>${OR.map(fld).join("")}</div></div>`
  :OTAB==="act"?`<div class="tl"><div class="row"><input id="nt" placeholder="Log a call, note or meeting…" onkeydown="if(event.key==='Enter')addNote('opportunities',${id})"><button class="btn brand" onclick="addNote('opportunities',${id})">Add</button></div>${notes}</div>`
  :`<div class="empty">No ${{cht:"Chatter posts",gng:"Gong conversations",jra:"Jira issues"}[OTAB]} yet.</div>`;
 const QL=[["Contact Roles",cs.length,"rl-cr"],["Opportunity Partners",ps.length,"rl-op"],["Tasks",tk.length,"rl-tk"],["Products",0],["Quotes",0],["Gong Conversations",0]];
 $("app").innerHTML=`<a style="display:inline-block;margin-bottom:8px" onclick="go('opportunities')">‹ ${d.l}</a>
 <div class="card rh"><div class="rt"><div class="ic" style="background:${d.c}">O</div><div><small>Opportunity</small><h1>${esc(r.name)}</h1></div><div class="acts sf">${B.map(([l,f])=>`<button class="btn" onclick="${f}">${l}</button>`).join("")}</div></div>
 <div class="hl"><div><small>Account Name</small>${cell("opportunities","account",r)}</div><div><small>Close Date</small>${fd(r.close)||"&nbsp;"}</div><div><small>Amount</small>${r.amount?money(r.amount):"&nbsp;"}</div><div><small>Opportunity Owner</small>${esc(r.owner)}</div><div><small>Risk Flag</small>${esc(r.flag??"")||"&nbsp;"}</div></div></div>
 ${path}
 <div class="cols"><div class="card"><div class="tabs">${TB.map(([k,l])=>`<a class="${OTAB===k?"on":""}" onclick="otab('${k}')">${l}</a>`).join("")}</div>${body}</div>
 <div class="side">
  <div class="card"><h3>Related List Quick Links</h3><div class="ql">${QL.map(([l,n,a])=>`<div class="q"><a onclick="${a?`document.getElementById('${a}').scrollIntoView({behavior:'smooth'})`:`toast('No records yet')`}">${l} (${n})</a></div>`).join("")}</div></div>
  <div class="card rl" id="rl-cr"><h3>Contact Roles (${cs.length}) <a onclick="openM('contacts',null,{account:'${esc(r.account).replace(/'/g,"\\'")}'})">Add</a></h3>${cs.map((c,j)=>`<div class="ci"><div class="n"><span class="sq" style="background:#ff538a">${esc(c.name[0])}</span><a onclick="go('contacts',${c.id})">${esc(c.name)}</a>${j?"":'<span class="pill p">PRIMARY</span>'}</div><dl><dt>Role:</dt><dd>${esc(c.role||"Business User")}</dd><dt>Phone:</dt><dd>${esc(c.phone)}</dd><dt>Title:</dt><dd>${esc(c.title)}</dd></dl></div>`).join("")||'<div class="empty">No contact roles.</div>'}<div class="eb"><a onclick="go('contacts')">View All</a></div></div>
  <div class="card rl" id="rl-op"><h3>Opportunity Partners (${ps.length}) <a onclick="addPartner()">New</a></h3>${ps.map(p=>`<div class="ci"><div class="n"><span class="sq" style="background:#fc903d">P</span><a>${esc(p.id)}</a></div><dl><dt>Account:</dt><dd>${esc(p.account)}</dd><dt>Type:</dt><dd>${esc(p.type)}</dd><dt>Level:</dt><dd>${esc(p.level)}</dd></dl></div>`).join("")||'<div class="empty">No partners.</div>'}</div>
  <div class="card rl" id="rl-tk"><h3>Tasks (${tk.length}) <a onclick="newTask('${esc(r.name).replace(/'/g,"\\'")}')">New</a></h3>${tk.map(x=>`<div class="it"><a onclick="go('tasks',${x.id})">${esc(x.subject)}</a><br><small style="color:var(--muted)">${fd(x.due)}</small></div>`).join("")||'<div class="empty">Nothing related yet.</div>'}</div>
 </div></div>`}
let TAB="det";
function record(o,id){const d=T[o],r=DB[o].find(x=>x.id===id);if(!r){list(o);return}if(o==="opportunities")return oppRec(r);
 const hl=d.f.slice(1,5).filter(f=>f[0]!=="notes").map(([k,l])=>`<div><small>${l}</small>${cell(o,k,r)||"&nbsp;"}</div>`).join("");
 const steps=o==="opportunities"?ST:o==="leads"?LS:null,key=o==="leads"?"status":"stage";
 let path="";if(steps){const i=steps.indexOf(r[key]),lost=r[key]==="Closed Lost"||r[key]==="Unqualified";
  path=`<ul class="path card">${steps.map((s,j)=>`<li class="${lost&&j===steps.length-1?"l":j<i?"d":j===i?"c":""}" onclick="setStage('${o}',${id},'${s}')">${lost&&j===steps.length-1?(o==="leads"?"Unqualified":"Closed Lost"):j<i?"✓ "+s:s}</li>`).join("")}</ul>`}
 const R=rel(o,r),qk=Object.keys(R);
 const ql=qk.length?`<div class="card"><h3>Related List Quick Links</h3><div class="ql">${qk.map(k=>`<div class="q"><a onclick="document.getElementById('rl-${k}').scrollIntoView({behavior:'smooth'})">${T[k].l} (${R[k].length})</a><div class="pop">${R[k].slice(0,4).map(x=>`<div><a onclick="go('${k}',${x.id})">${esc(x[T[k].t])}</a><br><small>${esc(sub(k,x))}</small></div>`).join("")||"<small>No records yet</small>"}</div></div>`).join("")}</div></div>`:"";
 const rls=qk.map(k=>`<div class="card rl" id="rl-${k}"><h3>${T[k].l} (${R[k].length}) ${k==="tasks"?`<a onclick="newTask('${esc(r[d.t]).replace(/'/g,"\\'")}')">New</a>`:""}</h3>${R[k].map(x=>`<div class="it"><a onclick="go('${k}',${x.id})">${esc(x[T[k].t])}</a><br><small style="color:var(--muted)">${esc(sub(k,x))}</small></div>`).join("")||'<div class="empty">Nothing related yet.</div>'}</div>`).join("");
 const notes=(r.notes||[]).map(n=>`<div class="n">${esc(n)}</div>`).join("")||'<div class="empty">No activity yet. Log your first note above.</div>';
 $("app").innerHTML=`<a style="display:inline-block;margin-bottom:8px" onclick="go('${o}')">‹ ${d.l}</a>
 <div class="card rh"><div class="rt"><div class="ic" style="background:${d.c}">${d.s[0]}</div><div><small>${d.s}</small><h1>${esc(r[d.t])}</h1></div>
 <div class="acts">${o==="leads"&&r.status!=="Unqualified"?`<button class="btn brand" onclick="convert(${id})">Convert</button>`:""}<button class="btn" onclick="openM('${o}',${id})">Edit</button><button class="btn" onclick="clone('${o}',${id})">Clone</button><button class="btn" onclick="window.print()">Print</button><button class="btn danger" onclick="del('${o}',${id})">Delete</button></div></div><div class="hl">${hl}</div></div>
 ${path}
 <div class="cols"><div class="card"><div class="tabs"><a class="${TAB==="det"?"on":""}" onclick="TAB='det';record('${o}',${id})">Details</a><a class="${TAB==="act"?"on":""}" onclick="TAB='act';record('${o}',${id})">Activity</a></div>
 ${TAB==="det"?`<div class="two">${d.f.map(([k,l])=>`<div class="f" ${k==="notes"?'style="grid-column:1/-1"':""}><label>${l}</label>${k==="notes"?esc(r.notes&&r.notes[0]||""):cell(o,k,r)||"&nbsp;"}</div>`).join("")}</div>`:`<div class="tl"><div class="row"><input id="nt" placeholder="Log a call, note or meeting…" onkeydown="if(event.key==='Enter')addNote('${o}',${id})"><button class="btn brand" onclick="addNote('${o}',${id})">Add</button></div>${notes}</div>`}</div>
 <div class="side">${ql}${rls}</div></div>`}
function setStage(o,id,s){const r=DB[o].find(x=>x.id===id);if(o==="leads"){r.status=s}else{r.stage=s;r.prob=s==="Closed Won"?100:s==="Closed Lost"?0:r.prob}save();record(o,id);toast("Updated to "+s)}
function addNote(o,id){const v=$("nt").value.trim();if(!v)return;const r=DB[o].find(x=>x.id===id);(r.notes=r.notes||[]).unshift(new Date().toLocaleDateString("en-GB")+" – "+v);save();record(o,id);toast("Activity logged")}
function clone(o,id){const r={...DB[o].find(x=>x.id===id),id:++DB.n,notes:[]};r[T[o].t]+=" (copy)";DB[o].unshift(r);save();go(o,r.id);toast("Record cloned")}
function del(o,id){if(!confirm("Delete this "+T[o].s.toLowerCase()+"? This cannot be undone."))return;DB[o]=DB[o].filter(x=>x.id!==id);save();go(o);toast("Deleted")}
function convert(id){const l=DB.leads.find(x=>x.id===id);
 if(!DB.accounts.find(a=>a.name===l.company))DB.accounts.unshift({id:++DB.n,name:l.company,industry:"Technology",city:"",phone:l.phone,website:"",revenue:0,owner:l.owner,notes:[]});
 DB.contacts.unshift({id:++DB.n,name:l.name,account:l.company,title:"",email:l.email,phone:l.phone,owner:l.owner,notes:[]});
 const op={id:++DB.n,name:l.company+" – New Business",account:l.company,stage:"Prospecting",amount:0,close:"",prob:10,type:"New Business",owner:l.owner,notes:[]};
 DB.opportunities.unshift(op);l.status="Qualified";save();go("opportunities",op.id);toast("Lead converted to account, contact and opportunity")}
/* SEARCH */
function gsearch(v){if(!v.trim()){return}GQ=v;location.hash="search"}
let GQ="";
function sres(){const q=GQ.toLowerCase();let h="",n=0;
 Object.keys(T).forEach(o=>{const m=DB[o].filter(r=>T[o].cols.some(k=>String(r[k]??"").toLowerCase().includes(q)));n+=m.length;
  if(m.length)h+=`<div class="card" style="margin-bottom:12px"><h3>${T[o].l} (${m.length})</h3><div class="bd">${m.map(r=>`<div class="li"><a onclick="go('${o}',${r.id})">${esc(r[T[o].t])}</a><small>${esc(sub(o,r))}</small></div>`).join("")}</div></div>`});
 $("app").innerHTML=`<h2 style="margin-top:0">Search results for “${esc(GQ)}”</h2>${h||'<div class="card empty">No matches. Try a company, contact or deal name.</div>'}`}
/* MODAL */
let M=null;
function openM(o,id,pre){const d=T[o],r=id?DB[o].find(x=>x.id===id):{owner:OWN[0],stage:"Prospecting",status:o==="tasks"?"Open":"New",priority:"Normal",prob:10,type:"New Business",source:"Web",industry:"Technology",...(pre||{})};
 M={o,id};$("mt").textContent=(id?"Edit ":"New ")+d.s;
 $("fm").innerHTML=d.f.map(([k,l,t])=>{const w=k==="notes"?"w":"",v=k==="notes"?(r.notes&&r.notes[0]||""):r[k]??"";
  const i=Array.isArray(t)?`<select id="m_${k}">${t.map(x=>`<option ${x===v?"selected":""}>${x}</option>`).join("")}</select>`:t==="area"?`<textarea rows="3" id="m_${k}">${esc(v)}</textarea>`:`<input id="m_${k}" type="${t||"text"}" value="${esc(v)}">`;
  return `<div class="${w}"><label>${l}</label>${i}</div>`}).join("");$("mo").classList.add("on")}
function closeM(){$("mo").classList.remove("on")}
function saveM(){const {o,id}=M,d=T[o];const nm=$("m_"+d.t).value.trim();if(!nm){toast("Enter a "+LBL(d.t).toLowerCase()+" to save");return}
 const r=id?DB[o].find(x=>x.id===id):{id:++DB.n,notes:[]};
 d.f.forEach(([k,,t])=>{const v=$("m_"+k).value;if(k==="notes")r.notes=v?[v]:[];else r[k]=t==="number"?Number(v):v});
 if(o==="opportunities"&&!id)r.prob=r.prob||10;
 if(!id)DB[o].unshift(r);save();closeM();go(o,r.id);route();toast(T[o].s+" saved")}
function newTask(rel){openM("tasks",null,{related:rel})}
