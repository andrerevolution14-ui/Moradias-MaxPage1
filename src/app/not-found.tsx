import Link from "next/link";
import { PROMOTER } from "@/lib/config";

export default function NotFound() {
  return (
    <main className="mx-auto grid min-h-dvh max-w-md place-items-center px-6 text-center">
      <div>
        <div className="font-serif text-2xl font-semibold">Domaine XXV</div>
        <h1 className="mt-4 text-xl font-bold">Esta página não existe</h1>
        <p className="mt-2 text-muted">O link pode estar incompleto. Veja as moradias ou fale diretamente com o André.</p>
        <div className="mt-6 grid gap-2">
          <Link href="/" className="btn btn-primary">Ver as moradias</Link>
          <a href={`https://wa.me/${PROMOTER.whatsapp}`} className="btn btn-wa">WhatsApp</a>
        </div>
      </div>
    </main>
  );
}
