import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

/**
 * Mesmo critério do `next.config.ts`: em produção (ex.: /contas) o favicon precisa do prefixo,
 * senão o browser pede `/icon.png` na raiz do domínio e não encontra o arquivo.
 */
const basePath = (process.env.NEXT_PUBLIC_BASE_PATH || "").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "HIDRUS — Área do Condômino",
  description: "HIDRUS Serviços Gerais — portal de segunda via de conta e consumo.",
  icons: {
    icon: [
      { url: `${basePath}/icon.png`, type: "image/png", sizes: "any" },
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
