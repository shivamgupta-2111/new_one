// Mount points the CRM runtime writes into: modal dialogs and toast messages.
export default function Overlays() {
  return (
    <>
      <div id="modal" />
      <div id="toast" className="fixed left-1/2 -translate-x-1/2 bottom-6 z-50" />
    </>
  );
}
