import Script from 'next/script';
import Overlays from '@/components/shared/Overlays';

const prototypeShell = String.raw`<header class="sticky z-30 card" style="top:env(safe-area-inset-top,0px);border-radius:0;border-width:0 0 1px">
 <div id="hdr-row" class="flex items-center gap-3 px-3 py-2">
  <div class="hdr-side flex items-center gap-2">
   <button id="app-launcher" class="hdr-ic" title="App Launcher" aria-label="App Launcher" onclick="toggleAppLauncher()"><svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor" aria-hidden="true"><circle cx="3" cy="3" r="1.7"/><circle cx="9" cy="3" r="1.7"/><circle cx="15" cy="3" r="1.7"/><circle cx="3" cy="9" r="1.7"/><circle cx="9" cy="9" r="1.7"/><circle cx="15" cy="9" r="1.7"/><circle cx="3" cy="15" r="1.7"/><circle cx="9" cy="15" r="1.7"/><circle cx="15" cy="15" r="1.7"/></svg></button>
   <a href="#home" class="hdr-brand flex items-center gap-2"><span class="hdr-logo"><span class="ms">cloud</span></span><b class="hdr-brand-name hidden sm:block">Ceph CRM</b></a>
  </div>
  <div class="hdr-search relative"><span class="ms mut absolute" style="left:10px;top:7px;font-size:20px">search</span><input id="gs" class="inp" aria-label="Search" placeholder="Search Ceph CRM and items... (Ctrl+K)" onkeydown="if(event.key==='Enter'){S.q=this.value;nav('opps')}"><kbd class="hdr-kbd">Ctrl+K</kbd></div>
  <div class="hdr-side hdr-right flex items-center">
   <button class="btn btn-p" onclick="modal('opp')"><span class="ms">add</span>New</button>
   <span class="hdr-div hdr-opt"></span>
   <button id="favorites" class="hdr-ic hdr-opt" title="Favorites" aria-label="Favorites" onclick="toggleFavorites()"><span class="ms">star</span></button>
   <button id="bell" class="hdr-ic" title="Notifications" aria-label="Notifications" onclick="toggleNotifications()"><span class="ms">notifications</span></button>
   <button id="settings" class="hdr-ic hdr-opt" title="Settings" aria-label="Settings" onclick="toggleSettings()"><span class="ms">settings</span></button>
   <button id="help" class="hdr-ic hdr-opt" title="Help" aria-label="Help" onclick="toggleHelp()"><span class="ms">help</span></button>
   <span id="user-avatar" role="button" tabindex="0" title="Alex Lee" onclick="toggleUserMenu()" onkeydown="if(event.key==='Enter')toggleUserMenu()">AL</span>
  </div>
 </div>
 <nav id="nav" class="flex gap-1 px-3 overflow-x-auto"></nav>
</header>
<main id="app" class="p-3 md:p-4 max-w-[1500px] mx-auto"></main>`;

export default function CrmShell() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: prototypeShell }} />
      <Overlays />
      <Script src="/ceph-crm.js" strategy="afterInteractive" />
    </>
  );
}
