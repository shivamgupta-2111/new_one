// Fonts are bundled with the app (no Google Fonts request), so icons always load.
import '@fontsource-variable/material-symbols-outlined';
import '@fontsource-variable/roboto-flex';
import './globals.css';
import Script from 'next/script';

export const metadata = {
  title: 'Ceph CRM – Pipeline',
  description: 'Ceph CRM pipeline and opportunity management prototype.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script src="https://cdn.tailwindcss.com/3.4.17" strategy="beforeInteractive" />
      </head>
      <body>{children}</body>
    </html>
  );
}
