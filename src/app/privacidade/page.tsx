import type { Metadata } from "next";
import Link from "next/link";
import { PROMOTER } from "@/lib/config";

export const metadata: Metadata = { title: "Política de privacidade · Domaine XXV" };

export default function Privacidade() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-12 text-[15px] leading-relaxed">
      <Link href="/" className="text-sm text-brand underline">← Voltar ao imóvel</Link>
      <h1 className="mt-4 text-2xl font-bold">Política de privacidade</h1>
      <div className="mt-6 space-y-4">
        <p><b>Responsável pelo tratamento:</b> {PROMOTER.name}, promotor do empreendimento Domaine XXV (Oliveirinha, Aveiro). Contacto: {PROMOTER.phoneDisplay}.</p>
        <p><b>Que dados recolhemos:</b> nome, telemóvel, email (opcional) e o conteúdo das mensagens que nos envia, bem como dados técnicos de navegação (endereço IP, dispositivo, origem da visita).</p>
        <p><b>Para quê:</b> exclusivamente para responder ao seu pedido de informação sobre as moradias Domaine XXV, agendar visitas e acompanhar o processo de compra. Base legal: diligências pré-contratuais a seu pedido e consentimento.</p>
        <p><b>Partilha:</b> os seus dados não são vendidos nem cedidos a terceiros para fins comerciais. Podem ser tratados por prestadores técnicos (alojamento, base de dados, envio de email/SMS) apenas para prestar o serviço.</p>
        <p><b>Medição e publicidade:</b> este site utiliza o Meta Pixel e a API de Conversões da Meta para medir a eficácia dos anúncios. Dados de contacto enviados à Meta são previamente encriptados (hash).</p>
        <p><b>Conservação:</b> mantemos os dados enquanto existir interesse no imóvel e, no máximo, 24 meses após o último contacto.</p>
        <p><b>Os seus direitos:</b> pode pedir acesso, retificação, apagamento ou oposição ao tratamento dos seus dados a qualquer momento, através do contacto acima. Pode ainda reclamar junto da CNPD (www.cnpd.pt).</p>
      </div>
    </main>
  );
}
