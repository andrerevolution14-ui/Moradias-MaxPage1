import Image from "next/image";
import { BUILDER, PROMOTER } from "@/lib/config";
import { IconCheck } from "../icons";

/** Credibilidade junto ao formulário: quem responde e porque pode confiar. */
export default function TrustMini({ className = "" }: { className?: string }) {
  const proofs = ["Projeto aprovado · CM Aveiro", `Construção · ${BUILDER.name.replace("Grupo ", "")}`, "Responde no próprio dia"];
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <Image src={PROMOTER.avatar} alt={PROMOTER.name} width={48} height={48} className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-white shadow" />
      <div className="min-w-0 leading-tight">
        <div className="text-[14px] font-bold">{PROMOTER.name} <span className="font-normal text-muted">· Promotor do projeto</span></div>
        <ul className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[12px] text-muted">
          {proofs.map((p) => (
            <li key={p} className="inline-flex items-center gap-1"><IconCheck size={12} className="text-[#2fa863]" /> {p}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
