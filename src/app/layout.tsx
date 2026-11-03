import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import MetaPixel from "@/components/MetaPixel";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["400", "600"] });

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Moradia T3 com jardim em Oliveirinha, Aveiro · 335.000€ | Domaine XXV",
  description:
    "3 moradias T3 em planta a 8 minutos de Aveiro. Jardim privativo de 82 m², garagem, sótão de 34 m². 335.000€ chave na mão com IMT e Imposto de Selo incluídos. Entrada de 10%.",
  openGraph: {
    title: "Moradia T3 com jardim a 8 min de Aveiro · 335.000€ chave na mão",
    description: "Venda em planta · Projeto aprovado · Entrega em 10 meses · Restam 2 de 3 moradias.",
    images: [{ url: "/images/og.jpg", width: 1200, height: 657 }],
    locale: "pt_PT",
    type: "website",
  },
  icons: { icon: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#3a3029",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="pt-PT" className={`${inter.variable} ${fraunces.variable} antialiased`}>
      <body className="min-h-dvh">
        {children}
        <MetaPixel />
      </body>
    </html>
  );
}
