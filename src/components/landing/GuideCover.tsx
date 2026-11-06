/** "Capa" do guia gratuito, como um produto digital (e-book). Só CSS: leve e nítida. */
const SIZES = {
  sm: { w: "w-[84px]", badge: "text-[7px]", num: "text-[30px]", title: "text-[8.5px]", foot: "text-[6px]" },
  md: { w: "w-[112px]", badge: "text-[8px]", num: "text-[40px]", title: "text-[11px]", foot: "text-[7px]" },
  lg: { w: "w-[168px]", badge: "text-[10px]", num: "text-[60px]", title: "text-[16px]", foot: "text-[9.5px]" },
};

export default function GuideCover({ size = "md" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];
  return (
    <div className={`${s.w} shrink-0`} aria-hidden>
      <div className="relative aspect-[3/4] rotate-[-4deg] overflow-hidden rounded-[6px] bg-[linear-gradient(150deg,#24476b_0%,#1b3048_55%,#111f30_100%)] px-[11%] py-[12%] text-white shadow-[0_14px_30px_rgba(17,31,48,0.35)] ring-1 ring-white/10">
        <div className="absolute inset-y-0 left-0 w-[6%] bg-black/25" />
        <div className="absolute -right-[30%] -top-[20%] h-[70%] w-[90%] rounded-full bg-white/[0.06]" />
        <div className="relative flex h-full flex-col">
          <span className={`w-fit rounded-[3px] bg-[#c49a3c] px-[0.6em] py-[0.25em] font-bold uppercase tracking-[0.08em] text-[#111f30] ${s.badge}`}>Grátis</span>
          <div className={`mt-auto font-serif font-semibold leading-none text-[#d9b56a] ${s.num}`}>12</div>
          <div className={`mt-[4%] font-serif font-semibold leading-[1.1] ${s.title}`}>ferramentas para comprar em planta com segurança</div>
          <div className="mt-[9%] h-px w-1/2 bg-white/40" />
          <div className={`mt-[7%] uppercase tracking-[0.08em] text-white/70 ${s.foot}`}>Guia prático · 2026</div>
        </div>
      </div>
    </div>
  );
}
