const RANK={rep:0,admin:1,ceo:2},RN={rep:"Sales Rep",admin:"Admin",ceo:"CEO"},K5=["leads","accounts","contacts","opportunities","tasks"];
const ROLE=window.PORTAL_ROLE||"rep",SKEY="nimbus_ses_"+ROLE;
let SES=null,SESN=null,TF="All",QF="All",QB=null;
try{SESN=localStorage.getItem(SKEY)}catch(e){}
T.products={l:"Products",s:"Product",c:"#0ea5a4",t:"name",cols:["name","sku","category","price"],f:[["name","Product Name"],["sku","SKU"],["category","Category",["Software","Support","Services","Hardware"]],["price","List Price","number"]]};
const _cell=cell;cell=function(o,k,r){return o==="products"&&k==="price"?money(r.price):_cell(o,k,r)};
function ens(){
 DB.users=DB.users||[{n:"Priya Shah",role:"rep",team:"Alpha"},{n:"Rahul Mehta",role:"rep",team:"Alpha"},{n:"Dana Wright",role:"rep",team:"Beta"},{n:"Meera Kapoor",role:"admin",team:"All"},{n:"Arjun Rao",role:"ceo",team:"All"}];
 DB.teams=DB.teams||["Alpha","Beta"];
 DB.products=DB.products||[{id:201,name:"Nimbus Platform – Annual",sku:"NP-100",category:"Software",price:12000},{id:202,name:"Analytics Add-on",sku:"NA-200",category:"Software",price:6000},{id:203,name:"Premium Support",sku:"PS-300",category:"Support",price:3500},{id:204,name:"Onboarding & Training",sku:"OT-400",category:"Services",price:2500},{id:205,name:"API Pack",sku:"AP-500",category:"Software",price:1800}];
 DB.quotes=DB.quotes||[];
 DB.cfg=DB.cfg||{repMax:2,adminMax:5,min:1000,max:100000};
 DB.users.forEach(u=>u.role==="rep"&&!OWN.includes(u.n)&&OWN.push(u.n))}
const sp=s=>`<span class="pill ${s==="Approved"?"g":s==="Rejected"?"r":"y"}">${s}</span>`;
const owners=()=>{const t=SES.role==="rep"?SES.team:TF;return t==="All"?null:DB.users.filter(u=>u.role==="rep"&&u.team===t).map(u=>u.n)};
const qScope=()=>{const ow=owners();return DB.quotes.filter(q=>!ow||ow.includes(q.owner))};
function scoped(f){const ow=owners();if(!ow)return f();const b={};K5.forEach(k=>{b[k]=DB[k];DB[k]=DB[k].filter(r=>ow.includes(r.owner))});try{f()}finally{K5.forEach(k=>DB[k]=b[k])}}
/* login + topbar + nav */
const emailOf=u=>u.email||u.n.toLowerCase().replace(/[^a-z]+/g,".").replace(/^\.|\.$/g,"")+"@nimbus.demo",DEMO_PW="demo123";
const BLURB={rep:["Create quotations within your discount limit","Work your team’s leads, accounts and deals","Track tasks and follow-ups in one place"],
 admin:["Approve mid-range discounts and quotes","Manage products, teams and users","Monitor pipeline across every team"],
 ceo:["Approve large discounts and high-value quotes","Set company-wide discount and amount rules","See revenue trend and pipeline funnel"]};
function login(msg){$("nav").innerHTML="";$("ub").innerHTML="";
 const us=DB.users.filter(u=>u.role===ROLE),f=us[0];
 $("app").innerHTML=`<div class="card lg"><div class="lg-side"><img src="assets/logo.svg" alt="" width="56" height="56"><h2>Nimbus CRM</h2><span class="pill y">${RN[ROLE]} portal</span>
 <ul>${BLURB[ROLE].map(x=>`<li>${x}</li>`).join("")}</ul></div>
 <form class="lg-form" onsubmit="event.preventDefault();doLogin()" novalidate><h3>Sign in</h3><p class="sub">Welcome back. Enter your details to continue.</p>
 <label for="le">Email</label><input id="le" type="email" autocomplete="username" value="${f?esc(emailOf(f)):""}" placeholder="name@company.com">
 <label for="lp">Password</label><div class="pw"><input id="lp" type="password" autocomplete="current-password" value="${DEMO_PW}" placeholder="Password"><a onclick="const i=$('lp');i.type=i.type==='password'?'text':'password';this.textContent=i.type==='password'?'Show':'Hide'">Show</a></div>
 <div class="err" id="lerr">${msg?esc(msg):""}</div>
 <button class="btn brand" type="submit" style="width:100%;justify-content:center;padding:9px 12px">Sign in</button>
 <div class="or"><span>or use a demo account</span></div>
 <div class="demo">${us.map(u=>`<button type="button" class="btn" onclick="demoIn('${u.n}')"><b>${esc(u.n)}</b><small>${ROLE==="rep"?"Team "+esc(u.team):RN[ROLE]}</small></button>`).join("")||'<div class="empty">No users in this portal yet.</div>'}</div>
 <p class="hint">Demo password: <code>${DEMO_PW}</code> · <a href="index.html">‹ All portals</a></p></form></div>`}
function doLogin(){const e=$("le").value.trim().toLowerCase(),p=$("lp").value,u=DB.users.find(x=>x.role===ROLE&&emailOf(x).toLowerCase()===e);
 if(!u||(u.pw||DEMO_PW)!==p){const m=$("lerr");m.textContent="Incorrect email or password for the "+RN[ROLE]+" portal.";const c=document.querySelector(".lg");c.classList.remove("shake");void c.offsetWidth;c.classList.add("shake");return}
 sgn(u.n)}
function demoIn(n){const u=DB.users.find(x=>x.n===n);if(u){$("le").value=emailOf(u);$("lp").value=DEMO_PW;sgn(n)}}
function sgn(n){SESN=n;try{localStorage.setItem(SKEY,n)}catch(e){}TF="All";location.hash="home";route()}
function out(){SESN=null;try{localStorage.removeItem(SKEY)}catch(e){}route()}
function topbar(){$("ub").innerHTML=`<span>${esc(SES.n)} <span class="pill y">${RN[SES.role]}${SES.role==="rep"?" · Team "+esc(SES.team):""}</span></span>${SES.role!=="rep"?`<select class="btn" onchange="TF=this.value;route()"><option value="All">All teams</option>${DB.teams.map(t=>`<option value="${t}" ${t===TF?"selected":""}>Team ${esc(t)}</option>`).join("")}</select>`:""}<a class="btn" href="index.html" style="text-decoration:none">Portals</a><button class="btn" onclick="out()">Sign out</button>`}
function navX(cur){const me=RANK[SES.role],pn=qScope().filter(q=>q.status.startsWith("Pending")&&q.needs<=me&&me>0).length;
 const it=[["home","Home"],["quotes","Quotes"],["qnew","+ New Quote"]];
 if(me>0)it.push(["appr","Approvals"+(pn?" ("+pn+")":"")],["products","Products"],["teams","Teams"],["rules","Rules"]);
 K5.forEach(k=>it.push([k,T[k].l]));
 $("nav").innerHTML=it.map(([k,l])=>`<a class="${cur===k||(k==="appr"&&cur==="quotes"&&QF==="Pending")?"on":""}" onclick="${k==="appr"?"QF='Pending';go('quotes')":k==="quotes"?"QF='All';go('quotes')":`go('${k}')`}">${l}</a>`).join("")}

/* ===== CEO charts ===== */
const kfmt=n=>n>=1e6?"$"+(n/1e6).toFixed(1).replace(/\.0$/,"")+"M":n>=1e3?"$"+Math.round(n/1e3)+"k":"$"+n;
function revTrend(){const op=DB.opportunities,M={};
 const mk=d=>d.slice(0,7),add=(k,f,v)=>{M[k]=M[k]||{w:0,f:0};M[k][f]+=v};
 op.forEach(o=>{if(!o.close)return;const a=+o.amount||0;if(o.stage==="Closed Won")add(mk(o.close),"w",a);else if(!o.stage.startsWith("Closed"))add(mk(o.close),"f",a*(+o.prob||0)/100)});
 const ks=Object.keys(M).sort();if(!ks.length)return '<div class="empty">No dated deals yet.</div>';
 const all=[];let [y,m]=ks[0].split("-").map(Number);const [ye,me]=ks[ks.length-1].split("-").map(Number);
 while(y<ye||(y===ye&&m<=me)){const k=y+"-"+String(m).padStart(2,"0");all.push([k,M[k]||{w:0,f:0}]);if(++m>12){m=1;y++}}
 const W=640,H=250,L=52,R=16,T=18,B=32,mx=Math.max(1,...all.map(([,v])=>Math.max(v.w,v.f))),mag=Math.pow(10,Math.floor(Math.log10(mx/4))),nice=[1,1.5,2,3,4,5,6,8,10].find(k=>k*mag*4>=mx)||10,top=nice*mag*4;
 const n=all.length,x=i=>L+(n<2?(W-L-R)/2:i*(W-L-R)/(n-1)),yy=v=>T+(H-T-B)*(1-v/top),lab=k=>new Date(k+"-01T00:00").toLocaleDateString("en-US",{month:"short"}),
 pts=f=>all.map(([,v],i)=>[x(i),yy(v[f])]),path=a=>a.map((p,i)=>(i?"L":"M")+p[0].toFixed(1)+" "+p[1].toFixed(1)).join(" "),pw=pts("w"),pf=pts("f");
 const grid=[0,.25,.5,.75,1].map(t=>`<line x1="${L}" x2="${W-R}" y1="${yy(top*t)}" y2="${yy(top*t)}" stroke="var(--line)"/><text x="${L-8}" y="${yy(top*t)+4}" text-anchor="end">${kfmt(top*t)}</text>`).join("");
 const xl=all.map(([k],i)=>`<text x="${x(i)}" y="${H-10}" text-anchor="middle">${lab(k)}${k.slice(5)==="01"||i===0?" ’"+k.slice(2,4):""}</text>`).join("");
 const dots=(a,f,c)=>a.map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="4" fill="${c}" stroke="#fff" stroke-width="1.5"><title>${lab(all[i][0])} ${all[i][0].slice(0,4)}: ${money(Math.round(all[i][1][f]))}</title></circle>`).join("");
 return `<svg class="ch" viewBox="0 0 ${W} ${H}" role="img" aria-label="Revenue trend: closed won and weighted forecast by month"><defs><linearGradient id="rtA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#e87722" stop-opacity=".45"/><stop offset="1" stop-color="#e87722" stop-opacity="0"/></linearGradient><linearGradient id="rtL" x1="0" x2="1"><stop offset="0" stop-color="#d45f1a"/><stop offset="1" stop-color="#f59a55"/></linearGradient></defs>${grid}${xl}
 <path d="${path(pw)} L${pw[n-1][0]} ${yy(0)} L${pw[0][0]} ${yy(0)}Z" fill="url(#rtA)"/><path d="${path(pf)}" fill="none" stroke="var(--text-muted)" stroke-width="2.5" stroke-dasharray="6 5" stroke-linecap="round" stroke-linejoin="round"/>
 <path d="${path(pw)}" fill="none" stroke="url(#rtL)" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>${dots(pf,"f","#6e6e73")}${dots(pw,"w","#e87722")}</svg>
 <div class="lgd"><span><i style="background:linear-gradient(90deg,#d45f1a,#f59a55)"></i>Closed won</span><span><i class="dash"></i>Weighted forecast (open deals × probability)</span></div>`}
function funnel(){const op=DB.opportunities,rows=ST.map(s=>{const a=op.filter(o=>o.stage===s);return{s,n:a.length,v:a.reduce((t,o)=>t+(+o.amount||0),0)}}),tot=rows.reduce((t,r)=>t+r.v,0),mx=Math.max(1,...rows.map(r=>r.v)),
 C=["#b8501a","#d45f1a","#e87722","#ee9248","#f3ac72","#f8c9a3"],D=[1,1,1,0,0,0];
 if(!rows.some(r=>r.n))return '<div class="empty">No opportunities yet.</div>';
 return `<div class="fnl">${rows.map((r,i)=>{const w=Math.max(34,Math.round(r.v/mx*100)),nx=rows[i+1],cv=tot?Math.round(r.v/tot*100)+"%":"";
 return `<div class="fr"><div class="fb" style="width:${w}%;background:linear-gradient(180deg,${C[i]},${C[i]}dd);color:${D[i]?"#fff":"var(--text-dark)"}" title="${r.s}: ${r.n} deals, ${money(r.v)}"><b>${r.s}</b><span>${r.n} deal${r.n===1?"":"s"} · ${money(r.v)}</span></div><div class="fc">${cv}</div></div>`}).join("")}</div><div class="lgd"><span>Bar width = deal value · right column = share of total value</span></div>`}
function ceoCharts(){return `<div class="g2"><div class="card"><h3>Revenue trend <small style="font-weight:400;color:var(--muted)">by close month</small></h3><div class="bd">${revTrend()}</div></div><div class="card"><h3>Pipeline funnel</h3><div class="bd">${funnel()}</div></div></div>`}
/* home banner */
function banner(){const me=RANK[SES.role],qs=qScope(),pend=qs.filter(q=>q.status.startsWith("Pending")),mine=pend.filter(q=>q.needs<=me&&me>0),ap=qs.filter(q=>q.status==="Approved"),sm=a=>a.reduce((s,q)=>s+q.total,0),c=DB.cfg;
 const k=(b,s,col)=>`<div class="card kpi" style="border-color:${col}"><b>${b}</b><span>${s}</span></div>`;
 let tb="";if(me>0){const m={};DB.teams.forEach(t=>{const ow=DB.users.filter(u=>u.team===t).map(u=>u.n);m["Team "+t]=sm(DB.quotes.filter(q=>q.status==="Approved"&&ow.includes(q.owner)))});tb=`<div class="card" style="margin-bottom:12px"><h3>Approved quote value by team</h3><div class="bd">${bars(m,money)}</div></div>`}
 return `<div class="card" style="padding:12px 16px;margin-bottom:12px;border-left:4px solid var(--navy)"><b>${RN[SES.role]} portal</b> · ${esc(SES.n)} · ${SES.role==="rep"?"Team "+esc(SES.team)+" · discount limit "+c.repMax+"%":SES.role==="admin"?"approves discounts up to "+c.adminMax+"%":"approves everything above "+c.adminMax+"% and above "+money(c.max)}</div>
 <div class="kpis">${k(qs.length,"Quotations","var(--blue)")}${k(pend.length,"Pending approval","#f59e0b")}${k(money(sm(ap)),"Approved value","var(--green)")}${me>0?k(mine.length,"Waiting for your approval","var(--red)"):k(qs.filter(q=>q.status==="Rejected").length,"Rejected","var(--red)")}</div>${tb}${SES.role==="ceo"?ceoCharts():""}`}
/* quotes */
function qlist(){const me=RANK[SES.role],rows=qScope().filter(q=>QF==="All"||(QF==="Pending"?q.status.startsWith("Pending"):q.status===QF)).sort((a,b)=>b.id-a.id);
 $("app").innerHTML=`<div class="card"><div class="lh"><div><h2>Quotations</h2><small>${rows.length} items</small></div><div style="display:flex;gap:8px"><select onchange="QF=this.value;qlist()">${["All","Pending","Approved","Rejected"].map(s=>`<option ${s===QF?"selected":""}>${s}</option>`).join("")}</select><button class="btn brand" onclick="go('qnew')">New Quotation</button></div></div><div style="overflow-x:auto"><table><thead><tr><th>Quote</th><th>Account</th><th>Owner</th><th>Team</th><th>Discount</th><th>Total</th><th>Status</th><th></th></tr></thead><tbody>${rows.map(q=>`<tr><td><a onclick="go('quotes',${q.id})">${q.no}</a></td><td>${esc(q.account)}</td><td>${esc(q.owner)}</td><td>${esc(q.team)}</td><td>${q.disc}%</td><td>${money(q.total)}</td><td>${sp(q.status)}</td><td>${q.status.startsWith("Pending")&&me>=q.needs?`<a onclick="qact(${q.id},'Approved')">Approve</a> · <a onclick="qact(${q.id},'Rejected')">Reject</a>`:""}</td></tr>`).join("")||`<tr><td colspan="8" class="empty">No quotations found.</td></tr>`}</tbody></table></div></div>`}
function qact(id,s){const q=DB.quotes.find(x=>x.id===id);if(RANK[SES.role]<q.needs)return toast("You are not allowed to approve this quote");q.status=s;q.log.push(new Date().toLocaleDateString("en-GB")+" – "+s+" by "+SES.n+" ("+RN[SES.role]+")");save();route();toast("Quote "+s.toLowerCase())}
function qview(id){const q=DB.quotes.find(x=>x.id===id);if(!q)return qlist();const me=RANK[SES.role],ok=q.status.startsWith("Pending")&&me>=q.needs;
 $("app").innerHTML=`<a style="display:inline-block;margin-bottom:8px" onclick="go('quotes')">‹ Quotations</a><div class="card"><div class="lh"><div><h2>Quotation ${q.no}</h2><small>${sp(q.status)} · ${esc(q.owner)} · Team ${esc(q.team)}</small></div><div class="acts">${ok?`<button class="btn brand" onclick="qact(${id},'Approved')">Approve</button><button class="btn danger" onclick="qact(${id},'Rejected')">Reject</button>`:""}<button class="btn" onclick="window.print()">Print / Save PDF</button></div></div>
 <div class="bd"><h3 style="border:0;padding:0 0 8px">Nimbus CRM · Quotation</h3><div class="hl" style="margin:0 0 14px"><div><small>Customer</small><b>${esc(q.account)}</b></div><div><small>Opportunity</small>${esc(q.opp||"–")}</div><div><small>Date</small>${esc(q.date)}</div><div><small>Valid until</small>${fd(q.valid)}</div></div>
 <table><thead><tr><th>Product</th><th>SKU</th><th>Unit price</th><th>Qty</th><th>Amount</th></tr></thead><tbody>${q.lines.map(l=>`<tr><td>${esc(l.name)}</td><td>${esc(l.sku)}</td><td>${money(l.price)}</td><td>${l.qty}</td><td>${money(l.price*l.qty)}</td></tr>`).join("")}</tbody></table>
 <div style="text-align:right;padding:12px 0;line-height:1.8">Subtotal ${money(q.sub)}<br>Discount (${q.disc}%) −${money(q.sub-q.total)}<br><b style="font-size:18px">Total ${money(q.total)}</b></div>${q.note?`<p>${esc(q.note)}</p>`:""}
 <small style="color:var(--muted)">Approval trail</small>${q.log.map(x=>`<div class="n" style="margin:4px 0;padding-left:10px;border-left:2px solid var(--blue)">${esc(x)}</div>`).join("")}</div></div>`}
const need=(d,t)=>{const c=DB.cfg;return t>c.max||d>c.adminMax?2:d>c.repMax?1:0};
function qnew(){QB=QB||{acc:"",opp:"",disc:0,note:"",valid:new Date(Date.now()+30*864e5).toISOString().slice(0,10),lines:[{p:DB.products[0].id,q:1}]};qdraw()}
function qdraw(){const ow=owners(),ac=DB.accounts.filter(a=>!ow||ow.includes(a.owner)),op=DB.opportunities.filter(o=>o.account===QB.acc);
 $("app").innerHTML=`<a style="display:inline-block;margin-bottom:8px" onclick="QB=null;go('quotes')">‹ Quotations</a><div class="card"><div class="lh"><h2>New Quotation</h2></div><div class="fm">
 <div><label>Customer account</label><select id="qa" onchange="qs();QB.opp='';qdraw()"><option value="">Select…</option>${ac.map(a=>`<option ${a.name===QB.acc?"selected":""}>${esc(a.name)}</option>`).join("")}</select></div>
 <div><label>Opportunity (optional)</label><select id="qo" onchange="qs()"><option value="">None</option>${op.map(o=>`<option ${o.name===QB.opp?"selected":""}>${esc(o.name)}</option>`).join("")}</select></div>
 <div><label>Valid until</label><input id="qv" type="date" value="${QB.valid}" onchange="qs()"></div><div><label>Discount %</label><input id="qd" type="number" min="0" max="100" step="0.5" value="${QB.disc}" oninput="qt()"></div>
 <div class="w"><table><thead><tr><th>Product</th><th>Unit price</th><th>Qty</th><th>Amount</th><th></th></tr></thead><tbody>${QB.lines.map((l,i)=>`<tr><td><select id="ls${i}" onchange="qt()">${DB.products.map(p=>`<option value="${p.id}" ${p.id===l.p?"selected":""}>${esc(p.name)} (${esc(p.sku)})</option>`).join("")}</select></td><td id="lpr${i}"></td><td><input id="lq${i}" type="number" min="1" value="${l.q}" style="width:70px" oninput="qt()"></td><td id="ltt${i}"></td><td><a onclick="qs();QB.lines.splice(${i},1);qdraw()">Remove</a></td></tr>`).join("")}</tbody></table><button class="btn" style="margin-top:8px" onclick="qs();QB.lines.push({p:DB.products[0].id,q:1});qdraw()">+ Add product</button></div>
 <div class="w"><label>Notes / terms</label><textarea id="qn" rows="2" oninput="qs()">${esc(QB.note)}</textarea></div></div><div class="bd" id="qsum"></div><div class="mf"><button class="btn brand" onclick="qsave()">Submit quotation</button></div></div>`;qt()}
function qs(){QB.acc=$("qa").value;QB.opp=$("qo").value;QB.valid=$("qv").value;QB.disc=+$("qd").value||0;QB.note=$("qn").value;QB.lines.forEach((l,i)=>{l.p=+$("ls"+i).value;l.q=Math.max(1,+$("lq"+i).value||1)})}
function qt(){qs();let sub=0;QB.lines.forEach((l,i)=>{const p=DB.products.find(x=>x.id===l.p),t=p.price*l.q;sub+=t;$("lpr"+i).textContent=money(p.price);$("ltt"+i).textContent=money(t)});
 const d=Math.max(0,Math.min(100,QB.disc)),tot=Math.round(sub*(1-d/100)*100)/100,c=DB.cfg,l=need(d,tot),me=RANK[SES.role];
 const msg=tot<c.min?`<span style="color:var(--red)">Total is below the minimum quote amount of ${money(c.min)}. Cannot submit.</span>`:l<=me?`<span style="color:var(--green)">Within your limit. Auto-approved on submit.</span>`:`<span style="color:#a05a00">Needs ${l===1?"Admin":"CEO"} approval${tot>c.max?" (total above "+money(c.max)+")":""}.</span>`;
 $("qsum").innerHTML=`<div style="text-align:right;line-height:1.8">Subtotal ${money(sub)} · Discount −${money(sub-tot)}<br><b style="font-size:18px">Total ${money(tot)}</b><br>${msg}</div>`;return{sub,d,tot,l}}
function qsave(){const r=qt(),c=DB.cfg,me=RANK[SES.role];
 if(!QB.acc)return toast("Select a customer account");if(r.tot<c.min)return toast("Total is below the minimum of "+money(c.min));if(!r.sub)return toast("Add at least one product");
 const ap=r.l<=me,id=++DB.n,rt=SES.role==="rep"?SES.team:(DB.users.find(u=>u.n===(DB.opportunities.find(o=>o.name===QB.opp)||{}).owner)||SES).team;
 DB.quotes.unshift({id,no:"Q-"+(1000+DB.quotes.length+1),account:QB.acc,opp:QB.opp,owner:SES.n,team:rt,disc:r.d,sub:r.sub,total:r.tot,needs:r.l,status:ap?"Approved":r.l===1?"Pending Admin":"Pending CEO",date:new Date().toLocaleDateString("en-GB"),valid:QB.valid,note:QB.note,
  lines:QB.lines.map(l=>{const p=DB.products.find(x=>x.id===l.p);return{name:p.name,sku:p.sku,price:p.price,qty:l.q}}),log:[new Date().toLocaleDateString("en-GB")+" – Created by "+SES.n+" ("+RN[SES.role]+")"+(ap?" · auto-approved":" · sent for "+(r.l===1?"Admin":"CEO")+" approval")]});
 QB=null;save();go("quotes",id);toast(ap?"Quotation approved":"Sent for approval")}
/* products, teams, rules */
function plist(){$("app").innerHTML=`<div class="card"><div class="lh"><div><h2>Products</h2><small>${DB.products.length} items. Reps pick from this catalogue when quoting.</small></div><button class="btn brand" onclick="openM('products')">New Product</button></div><div style="overflow-x:auto"><table><thead><tr><th>Product</th><th>SKU</th><th>Category</th><th>List price</th><th></th></tr></thead><tbody>${DB.products.map(p=>`<tr><td><a onclick="go('products',${p.id})">${esc(p.name)}</a></td><td>${esc(p.sku)}</td><td>${esc(p.category)}</td><td>${money(p.price)}</td><td style="text-align:right"><a onclick="openM('products',${p.id})">Edit</a></td></tr>`).join("")}</tbody></table></div></div>`}
function teams(){const sm=(a,f)=>a.reduce((s,x)=>s+(+f(x)||0),0);
 const tr=DB.teams.map(t=>{const ow=DB.users.filter(u=>u.team===t&&u.role==="rep").map(u=>u.n),op=DB.opportunities.filter(o=>ow.includes(o.owner)),qq=DB.quotes.filter(q=>ow.includes(q.owner));return `<tr><td>Team ${esc(t)}</td><td>${ow.length}</td><td>${money(sm(op.filter(o=>o.stage==="Closed Won"),o=>o.amount))}</td><td>${money(sm(op.filter(o=>!o.stage.startsWith("Closed")),o=>o.amount))}</td><td>${money(sm(qq.filter(q=>q.status==="Approved"),q=>q.total))}</td><td>${qq.filter(q=>q.status.startsWith("Pending")).length}</td></tr>`}).join("");
 $("app").innerHTML=`<div class="card" style="margin-bottom:12px"><div class="lh"><h2>Teams</h2><button class="btn" onclick="addTeam()">Add team</button></div><table><thead><tr><th>Team</th><th>Reps</th><th>Won</th><th>Open pipeline</th><th>Approved quotes</th><th>Pending quotes</th></tr></thead><tbody>${tr}</tbody></table></div>
 <div class="card"><div class="lh"><h2>Users</h2><button class="btn" onclick="addUser()">Add user</button></div><table><thead><tr><th>Name</th><th>Role</th><th>Team</th></tr></thead><tbody>${DB.users.map((u,i)=>`<tr><td>${esc(u.n)}</td><td>${RN[u.role]}</td><td>${u.role==="rep"?`<select onchange="DB.users[${i}].team=this.value;save();route();toast('Team updated')">${DB.teams.map(t=>`<option ${t===u.team?"selected":""}>${esc(t)}</option>`).join("")}</select>`:"All teams"}</td></tr>`).join("")}</tbody></table></div>`}
function addTeam(){const t=(prompt("Team name")||"").trim();if(!t||DB.teams.includes(t))return;DB.teams.push(t);save();teams()}
function addUser(){const n=(prompt("Full name")||"").trim();if(!n)return;const r=(prompt("Role: rep, admin or ceo","rep")||"rep").toLowerCase();if(!RANK.hasOwnProperty(r))return toast("Role must be rep, admin or ceo");const t=r==="rep"?(prompt("Team ("+DB.teams.join(", ")+")",DB.teams[0])||DB.teams[0]):"All";DB.users.push({n,role:r,team:t});ens();save();teams()}
function rules(){const c=DB.cfg,d=SES.role!=="ceo"?"disabled":"",f=(id,l,v,s)=>`<div><label>${l}</label><input id="${id}" type="number" step="${s}" value="${v}" ${d}></div>`;
 $("app").innerHTML=`<div class="card"><div class="lh"><div><h2>Discount and amount rules</h2><small>${d?"View only. Only the CEO can change these limits.":"Changes apply to all new quotations."}</small></div></div><div class="fm">${f("c1","Rep max discount (%)",c.repMax,.5)}${f("c2","Admin max discount (%). Above this needs CEO",c.adminMax,.5)}${f("c3","Minimum quote amount ($). Below this is blocked",c.min,100)}${f("c4","Maximum quote amount ($). Above this needs CEO",c.max,1000)}</div>
 <div class="bd">Rep: 0 to ${c.repMax}% auto-approved · Admin: above ${c.repMax}% up to ${c.adminMax}% · CEO: above ${c.adminMax}% · Any quote above ${money(c.max)} needs CEO · Quotes below ${money(c.min)} cannot be submitted.</div>${d?"":`<div class="mf"><button class="btn brand" onclick="saveRules()">Save rules</button></div>`}</div>`}
function saveRules(){const v=i=>+$(i).value,a=v("c1"),b=v("c2"),m=v("c3"),x=v("c4");if(a<0||b<a||m<0||x<=m)return toast("Check values: rep ≤ admin limit, min < max");DB.cfg={repMax:a,adminMax:b,min:m,max:x};save();rules();toast("Rules saved")}
/* router */
removeEventListener("hashchange",route);
route=function(){ens();SES=DB.users.find(u=>u.n===SESN&&u.role===ROLE)||null;document.body.classList.toggle("guest",!SES);if(!SES)return login();
 const [o,id]=location.hash.slice(1).split("/"),me=RANK[SES.role];navX(o||"home");topbar();
 if(me===0&&["products","teams","rules"].includes(o))return go("home");
 if(o==="quotes")id?qview(+id):qlist();else if(o==="qnew")qnew();
 else if(o==="products"&&!id)plist();else if(o==="teams")teams();else if(o==="rules")rules();
 else if(!o||o==="home")scoped(()=>{home();$("app").insertAdjacentHTML("afterbegin",banner())});
 else if(o==="search")scoped(sres);else if(T[o]&&id)scoped(()=>record(o,+id));else if(T[o])scoped(()=>list(o));else go("home");
 window.scrollTo(0,0)};
addEventListener("hashchange",route);
document.querySelector(".brand").insertAdjacentHTML("afterend",'<div id="ub" style="display:flex;gap:8px;align-items:center;margin-left:8px"></div>');
route();
