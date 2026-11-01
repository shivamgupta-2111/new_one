// Opportunity file attachments (IndexedDB): upload, download, remove.

// Opportunity attachments are stored in IndexedDB so file contents do not
// consume localStorage space. Metadata remains attached to the opportunity.
const ATTACHMENT_DB = 'sales-cloud-attachments';
function attachmentStore() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(ATTACHMENT_DB, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('files')) {
        request.result.createObjectStore('files', { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open file storage'));
  });
}
function attachmentIcon(name) {
  const ext = String(name || '')
    .split('.')
    .pop()
    .toLowerCase();
  if (['pdf'].includes(ext)) return 'picture_as_pdf';
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) return 'image';
  if (['doc', 'docx', 'txt', 'rtf'].includes(ext)) return 'description';
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'table_chart';
  if (['zip', 'rar', '7z'].includes(ext)) return 'folder_zip';
  return 'attach_file';
}
function formatFileSize(bytes) {
  const n = Number(bytes) || 0;
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / (1024 * 1024)).toFixed(1) + ' MB';
  return (n / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
}
async function uploadOppFiles(fileList) {
  const files = Array.from(fileList || []);
  if (!files.length) return;
  const opportunity = cur();
  if (!opportunity) return;
  opportunity.attachments = opportunity.attachments || [];
  try {
    const db = await attachmentStore();
    for (const file of files) {
      const id =
        globalThis.crypto?.randomUUID?.() ||
        'file-' + Date.now() + '-' + Math.random().toString(36).slice(2);
      await new Promise((resolve, reject) => {
        const tx = db.transaction('files', 'readwrite');
        tx.objectStore('files').put({ id, blob: file });
        tx.oncomplete = resolve;
        tx.onerror = () => reject(tx.error || new Error('File upload failed'));
        tx.onabort = () => reject(tx.error || new Error('File upload was cancelled'));
      });
      opportunity.attachments.push({
        id,
        name: file.name,
        size: file.size,
        type: file.type,
        addedAt: Date.now(),
      });
    }
    db.close();
    save();
    toast(files.length + (files.length === 1 ? ' file uploaded' : ' files uploaded'));
    render();
  } catch (error) {
    console.error(error);
    toast('Could not upload files. Check available browser storage and try again.');
  }
}
async function downloadOppFile(id) {
  try {
    const db = await attachmentStore();
    const record = await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readonly');
      const request = tx.objectStore('files').get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    db.close();
    const metadata = (cur()?.attachments || []).find((file) => file.id === id);
    if (!record?.blob || !metadata) throw new Error('File not found');
    const url = URL.createObjectURL(record.blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = metadata.name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (error) {
    console.error(error);
    toast('Could not download this file.');
  }
}
async function removeOppFile(id) {
  const opportunity = cur();
  if (!opportunity || !confirm('Remove this attachment?')) return;
  try {
    const db = await attachmentStore();
    await new Promise((resolve, reject) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').delete(id);
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    });
    db.close();
    opportunity.attachments = (opportunity.attachments || []).filter((file) => file.id !== id);
    save();
    toast('Attachment removed');
    render();
  } catch (error) {
    console.error(error);
    toast('Could not remove this file.');
  }
}
