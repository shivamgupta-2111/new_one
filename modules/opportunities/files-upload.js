// Files card: several ways to add a file (choose files, take a photo / scan, drag and drop, add a link),
// a category for each file, and a list that can be filtered and downloaded.

const FILE_CATS = [
  'General',
  'Proposal',
  'Contract',
  'Customer PO',
  'Payment proof',
  'Photo',
  'Other',
];
const MAX_FILE_BYTES = 100 * 1024 * 1024;

const uploadOppFilesBeforeCats = uploadOppFiles;
uploadOppFiles = async function (fileList) {
  const o = cur();
  if (!o) return;
  const files = Array.from(fileList || []),
    big = files.filter((f) => f.size > MAX_FILE_BYTES),
    ok = files.filter((f) => f.size <= MAX_FILE_BYTES);
  if (big.length) toast(`${big.map((f) => f.name).join(', ')} is over 100 MB and was skipped`);
  if (!ok.length) return;
  const before = (o.attachments || []).length,
    cat = FILE_CATS.includes(S.fileCat) ? S.fileCat : 'General';
  await uploadOppFilesBeforeCats.call(this, ok);
  (o.attachments || []).slice(before).forEach((f) => {
    f.cat = cat;
    f.by = roleNow().name;
  });
  if ((o.attachments || []).length > before) {
    logOpp(
      o.id,
      'sync',
      `${ok.length} file${ok.length === 1 ? '' : 's'} uploaded (${cat}) by ${roleNow().name}`
    );
    save();
    render();
  }
};

const downloadOppFileBeforeLinks = downloadOppFile;
downloadOppFile = function (id) {
  const f = ((cur() || {}).attachments || []).find((x) => x.id === id);
  if (f && f.link) return window.open(f.link, '_blank', 'noopener');
  return downloadOppFileBeforeLinks.apply(this, arguments);
};

function openFileLinkForm() {
  $('#modal').innerHTML =
    `<div class="fixed inset-0 z-40 grid place-items-center p-4" style="background:rgba(0,0,0,.5)"><form class="card p-5 w-full max-w-md space-y-3" onsubmit="saveFileLink(event)"><h2 class="text-lg font-bold">Add a link</h2><p class="mut text-xs">For a file kept in Google Drive, OneDrive, Dropbox or anywhere else.</p>` +
    `<label class="block">Link *<input class="inp" name="url" type="url" required placeholder="https://"></label><label class="block">Name *<input class="inp" name="name" required></label>` +
    `<label class="block">Category<select class="inp" name="cat">${FILE_CATS.map((c) => `<option ${c === S.fileCat ? 'selected' : ''}>${c}</option>`).join('')}</select></label>` +
    `<div class="flex justify-end gap-2"><button type="button" class="btn" onclick="$('#modal').innerHTML=''">Cancel</button><button class="btn btn-p">Add link</button></div></form></div>`;
  $('#modal [name=url]').focus();
}
function saveFileLink(e) {
  e.preventDefault();
  const o = cur(),
    v = Object.fromEntries(new FormData(e.target)),
    url = (v.url || '').trim();
  if (!o) return;
  if (!/^https?:\/\//i.test(url)) return toast('Links must start with http:// or https://');
  (o.attachments = o.attachments || []).push({
    id: 'link-' + Date.now() + Math.random().toString(36).slice(2, 6),
    name: (v.name || '').trim() || url,
    link: url,
    size: 0,
    type: 'Link',
    cat: FILE_CATS.includes(v.cat) ? v.cat : 'General',
    addedAt: Date.now(),
    by: roleNow().name,
  });
  logOpp(o.id, 'sync', `Link “${(v.name || url).trim()}” added by ${roleNow().name}`);
  $('#modal').innerHTML = '';
  save();
  toast('Link added');
  render();
}
function setFileCat(c) {
  S.fileCat = c;
  const sel = document.querySelectorAll('select.file-cat');
  sel.forEach((s) => (s.value = c));
}
function setFileFilter(c) {
  S.fileFilter = c;
  render();
}
function fileRow(f) {
  return `<div class="sf-rec flex items-center gap-2"><span class="ms mut">${f.link ? 'link' : attachmentIcon(f.name)}</span><div class="min-w-0 flex-1"><a class="rep-link break-words" onclick="downloadOppFile('${E(f.id)}')">${E(f.name)}</a><div class="mut text-xs">${f.cat ? `<span class="chip">${E(f.cat)}</span> ` : ''}${f.addedAt ? whenText(f.addedAt) + ' · ' : ''}${f.link ? 'Link' : formatFileSize(f.size)}${f.by ? ' · ' + E(f.by) : ''}</div></div><button class="hdr-ic" style="width:28px;height:28px" title="${f.link ? 'Open link' : 'Download'}" aria-label="Download ${E(f.name)}" onclick="downloadOppFile('${E(f.id)}')"><span class="ms" style="font-size:18px">${f.link ? 'open_in_new' : 'download'}</span></button><button class="hdr-ic" style="width:28px;height:28px" title="Remove" aria-label="Remove ${E(f.name)}" onclick="removeOppFile('${E(f.id)}')"><span class="ms" style="font-size:18px">delete</span></button></div>`;
}
function filesCardBody(files) {
  const flt = S.fileFilter || 'All',
    cats = [...new Set(files.map((f) => f.cat).filter(Boolean))],
    shown = files.filter((f) => flt === 'All' || f.cat === flt);
  return (
    `<div class="file-drop" ondragover="event.preventDefault();this.classList.add('over')" ondragleave="this.classList.remove('over')" ondrop="event.preventDefault();this.classList.remove('over');uploadOppFiles(event.dataTransfer.files)">` +
    `<div class="flex gap-2 flex-wrap justify-center"><label class="btn btn-p cursor-pointer"><span class="ms">upload_file</span>Upload files<input type="file" multiple class="hidden" onchange="uploadOppFiles(this.files);this.value=''"></label>` +
    `<label class="btn cursor-pointer"><span class="ms">photo_camera</span>Take photo<input type="file" accept="image/*" capture="environment" class="hidden" onchange="uploadOppFiles(this.files);this.value=''"></label>` +
    `<button type="button" class="btn" onclick="openFileLinkForm()"><span class="ms">link</span>Add link</button></div>` +
    `<div class="mut text-xs mt-2 text-center">or drop files here · up to 100 MB each</div>` +
    `<label class="block mt-2 text-xs"><span class="mut">Category for new files</span><select class="inp file-cat" onchange="setFileCat(this.value)">${FILE_CATS.map((c) => `<option ${c === (S.fileCat || 'General') ? 'selected' : ''}>${c}</option>`).join('')}</select></label></div>` +
    (cats.length > 1
      ? `<div class="flex gap-1 flex-wrap my-2">${['All', ...cats].map((c) => `<button type="button" class="btn ${c === flt ? 'btn-p' : ''}" style="padding:2px 10px;font-size:12px" onclick="setFileFilter('${E(c)}')">${E(c)}</button>`).join('')}</div>`
      : '') +
    shown.slice(0, 8).map(fileRow).join('') +
    (shown.length > 8
      ? `<div class="mut text-xs mt-1">and ${shown.length - 8} more · View All</div>`
      : '')
  );
}
