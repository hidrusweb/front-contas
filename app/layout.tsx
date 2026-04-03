import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

/**
 * Favicon: use `app/favicon.ico` com o PNG da marca (Next 16 gera o primeiro `<link rel="icon">` a partir dele).
 * Não usar `app/icon.png` em paralelo — o build gerava um segundo `.ico` pequeno e o browser ficava com o ícone antigo.
 *
 * Com deploy em subpasta (ex.: /contas), `NEXT_PUBLIC_BASE_PATH` deve coincidir com o `basePath` do `next.config.ts`.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "HIDRUS — Área do Condômino",
  description: "HIDRUS Serviços Gerais — portal de segunda via de conta e consumo.",
  icons: {
    icon: [
      { url: `${basePath}/favicon.ico`, sizes: "any" },
      { url: `${basePath}/favicon.png`, type: "image/png", sizes: "any" },
    ],
    apple: { url: `${basePath}/apple-icon.png`, type: "image/png" },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" />
      </body>
    </html>
  );
}
