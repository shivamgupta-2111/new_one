'use client';
export default function ConfirmButton({ children = 'Delete', onConfirm, message = 'Are you sure?', className = '' }) {
  return <button type="button" className={className} onClick={() => { if (window.confirm(message)) onConfirm?.(); }}>{children}</button>;
}
