import "./globals.css";
import Script from "next/script";

export const metadata = {
  title: "Sales Cloud – Pipeline",
  description: "Sales Cloud pipeline and opportunity management prototype.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.tailwindcss.com/3.4.17"
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
