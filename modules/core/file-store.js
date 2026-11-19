// Uploaded files (for example a client's signed copy of a quotation) are kept in the browser's file
// database (IndexedDB), not in the main saved data. The main data has a limit of about 5 MB; one large
// photo used to fill it, after which nothing else could be saved (sent links then showed "Link not valid").
// The saved data keeps only the file's details: { name, type, size, at, fileKey }.

const FILE_DB = 'ceph-crm-files';
let fileDbPromise;
function fileDb() {
  if (!fileDbPromise)
    fileDbPromise = new Promise((resolve, reject) => {
      const r = indexedDB.open(FILE_DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore('files');
      r.onsuccess = () => resolve(r.result);
      r.onerror = () => reject(r.error);
    });
  return fileDbPromise;
}
function fileTx(mode, run) {
  return fileDb().then(
    (db) =>
      new Promise((resolve, reject) => {
        const tx = db.transaction('files', mode),
          req = run(tx.objectStore('files'));
        tx.oncomplete = () => resolve(req && req.result);
        tx.onerror = () => reject(tx.error);
        tx.onabort = () => reject(tx.error);
      })
  );
}
const filePut = (key, blob) => fileTx('readwrite', (st) => st.put(blob, key));
const fileGet = (key) => fileTx('readonly', (st) => st.get(key));
const fileDelete = (key) => fileTx('readwrite', (st) => st.delete(key));
const signedCopyKey = (no) => 'signed-copy:' + no;

// Open (new tab) or download a quote's signed copy.
function openSignedCopy(no, download) {
  const q = S.quotes.find((x) => x.no === no),
    sc = q && q.signedCopy;
  if (!sc) return;
  const tab = download ? null : window.open('', '_blank'); // opened now, so pop-up blockers allow it
  if (tab)
    tab.document.write('<p style="font:16px sans-serif;padding:24px">Opening the signed copy…</p>');
  const ext = (String(sc.name).match(/\.[a-z0-9]+$/i) || [''])[0];
  fileGet(sc.fileKey || signedCopyKey(no))
    .then((blob) => blob || (sc.data ? fetch(sc.data).then((r) => r.blob()) : null))
    .then((blob) => {
      if (!blob) {
        if (tab) tab.close();
        return toast('This file is not stored in this browser. Ask the client to upload it again.');
      }
      const url = URL.createObjectURL(blob);
      if (download) {
        const a = document.createElement('a');
        a.href = url;
        a.download = `${no}-signed-copy${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } else if (tab) tab.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    })
    .catch(() => {
      if (tab) tab.close();
      toast('Could not open the file');
    });
}

// One-time clean-up: copies uploaded before this change were kept inside the saved data. Move them into
// the file database, which frees the main storage again.
function moveUploadsToFileStore() {
  const old = (S.quotes || []).filter((q) => q.signedCopy && q.signedCopy.data);
  if (!old.length || typeof indexedDB === 'undefined') return;
  Promise.all(
    old.map((q) =>
      fetch(q.signedCopy.data)
        .then((r) => r.blob())
        .then((blob) => filePut(signedCopyKey(q.no), blob))
        .then(() => {
          q.signedCopy.fileKey = signedCopyKey(q.no);
          delete q.signedCopy.data;
          if (S.qd && S.qd.no === q.no && S.qd.signedCopy) {
            S.qd.signedCopy.fileKey = q.signedCopy.fileKey;
            delete S.qd.signedCopy.data;
          }
        })
        .catch((e) => console.warn('Could not move an uploaded file', e))
    )
  ).then(() => save());
}
setTimeout(moveUploadsToFileStore, 0);
