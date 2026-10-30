import Script from "next/script";

const prototypeShell = String.raw`<header class="sticky z-30 card" style="top:env(safe-area-inset-top,0px);border-radius:0;border-width:0 0 1px">
 <div class="flex items-center gap-3 px-3 py-2">
  <span class="ms" style="color:var(--pr);font-size:30px">cloud</span><b class="text-base hidden sm:block">Sales Cloud</b>
  <div class="relative flex-1 max-w-xl"><span class="ms mut absolute left-2 top-1.5">search</span><input id="gs" class="inp" style="padding-left:32px" placeholder="Search opportunities and accounts, then press Enter" onkeydown="if(event.key==='Enter'){S.q=this.value;nav('opps')}"></div>
  <button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button>
  <span class="ms mut" title="3 notifications" onclick="toast('You have 3 deals closing this week')" style="cursor:pointer">notifications</span>
  <span class="w-8 h-8 rounded-full grid place-items-center text-white font-bold" style="background:var(--pr)" title="Alex Lee">AL</span>
 </div>
 <nav id="nav" class="flex gap-1 px-3 overflow-x-auto"></nav>
</header>
<main id="app" class="p-3 md:p-4 max-w-[1500px] mx-auto"></main>
<div id="modal"></div><div id="toast" class="fixed left-1/2 -translate-x-1/2 bottom-6 z-50"></div>`;

export default function CrmShell() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: prototypeShell }} />
      <Script src="/sales-cloud.js" strategy="afterInteractive" />
    </>
  );
}
