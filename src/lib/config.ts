// Dados do empreendimento. Toda a página lê daqui — altere aqui e muda em todo o lado.

export const PROJECT = {
  name: "Domaine XXV",
  tagline: "3 moradias T3 com jardim em Oliveirinha, Aveiro",
  address: "Rua Acácio Simões Vieira",
  postal: "3810-843 Oliveirinha · Aveiro",
  coords: `40°34'59.2"N 8°37'02.2"W`,
  mapEmbed:
    "https://maps.google.com/maps?q=R.+Ac%C3%A1cio+Sim%C3%B5es+Vieira,+3810-843+Oliveirinha&t=m&z=15&output=embed",
  mapLink: "https://maps.google.com/?q=R.+Ac%C3%A1cio+Sim%C3%B5es+Vieira,+3810-843+Oliveirinha",
  tour360: "https://visita3dmoradia-vvtu.vercel.app/",
  price: 335000,
  downPaymentPct: 0.1,
  buildMonths: 10,
} as const;

export const PROMOTER = {
  name: "André Queirós",
  role: "Promotor do projeto",
  whatsapp: "351920601070", // formato internacional sem "+"
  phoneDisplay: "+351 920 601 070",
  phoneHref: "tel:+351920601070",
  avatar: "/andre/avatar.webp",
  portrait: "/andre/retrato.webp",
} as const;

export const BUILDER = {
  name: "Grupo Freitas Renovações",
  legal: "Freitas Renovações Lda.",
  logo: "/brand/freitas.webp",
  blurb:
    "Mais de 15 anos de construção e remodelação no distrito de Aveiro. Alvará de construção certificado.",
} as const;

export type LotStatus = "disponivel" | "reservado" | "vendido";
export type Lot = { id: string; label: string; status: LotStatus };

// Estado por omissão (o André pode alterar em /leads → Lotes, sem mexer no código).
export const DEFAULT_LOTS: Lot[] = [
  { id: "25", label: "Lote 25", status: "vendido" },
  { id: "26", label: "Lote 26", status: "disponivel" },
  { id: "27", label: "Lote 27", status: "disponivel" },
];

export const LOT_SPEC = {
  typology: "T3 (opção T4)",
  usefulArea: "146,34 m²",
  grossPrivate: "~180 m²",
  dependentArea: "77,65 m²",
  garden: "~82 m²",
  bathrooms: 3,
  floors: "R/C + Piso 1 + Sótão",
};

export const GALLERY = [
  { src: "/images/exterior-capa.webp", alt: "Fachada principal das 3 moradias Domaine XXV", w: 1600, h: 876 },
  { src: "/images/exterior-traseiro-completo.webp", alt: "Jardim e fachada traseira", w: 1600, h: 900 },
  { src: "/images/cozinha.webp", alt: "Cozinha open space equipada", w: 1600, h: 901 },
  { src: "/images/sala-de-jantar.webp", alt: "Sala de jantar e estar", w: 1600, h: 900 },
  { src: "/images/quarto-cama.webp", alt: "Quarto suite principal", w: 1600, h: 900 },
  { src: "/images/exterior-barbecue.webp", alt: "Área exterior com barbecue", w: 1375, h: 768 },
  { src: "/images/quarto-varanda.webp", alt: "Quarto com varanda", w: 1600, h: 900 },
  { src: "/images/quarto-porta.webp", alt: "Zona dos quartos", w: 1600, h: 900 },
  { src: "/images/corredor-quartos.webp", alt: "Corredor do piso 1", w: 1024, h: 1024 },
  { src: "/images/terceiro-andar.webp", alt: "Sótão amplo (~34 m² úteis)", w: 1600, h: 900 },
  { src: "/images/wc-f2.webp", alt: "Casa de banho completa", w: 1600, h: 900 },
  { src: "/images/exterior-traseiro.webp", alt: "Jardim privativo de ~82 m²", w: 1600, h: 900 },
  { src: "/images/exterior-noite.webp", alt: "Moradia à noite", w: 766, h: 1024 },
  { src: "/images/planta-tecnica.webp", alt: "Planta técnica de arquitetura", w: 1600, h: 1131 },
  { src: "/images/planta-3d.webp", alt: "Planta 3D humanizada", w: 1600, h: 1131 },
];

export const ROOMS = [
  { floor: "Piso 0", items: [
    ["Cozinha e sala open space", "~20 m²"],
    ["Sala de jantar", "~15 m²"],
    ["Casa de banho de serviço", "~2 m²"],
    ["Garagem coberta", "~30 m²"],
    ["Garagem e espaço exterior (frente)", "~30 m²"],
    ["Anexo", "~19 m²"],
    ["Jardim traseiro privativo", "~82 m²"],
  ]},
  { floor: "Piso 1", items: [
    ["Quarto suite", "~15 m²"],
    ["Casa de banho da suite", "~4,8 m²"],
    ["Quarto 1", "~14 m²"],
    ["Quarto 2", "~11 m²"],
    ["Casa de banho completa", "~7 m²"],
  ]},
  { floor: "Sótão", items: [["Sótão aproveitável (altura 1,90 m)", "~34 m²"]] },
];

export const DISTANCES = [
  ["8 min", "Centro histórico de Aveiro"],
  ["2 min", "Nó da A17 e A25"],
  ["5 min", "Hipermercados, farmácias e escolas"],
  ["10 min", "Hospital Infante D. Pedro"],
  ["17 min", "Praia da Barra e Costa Nova"],
];

export const TESTIMONIALS = [
  {
    quote:
      "A obra foi entregue antes do prazo contratado, sem interrupções nem derrapes. O nível de acabamentos nas casas de banho, carpintarias e o isolamento térmico superaram as expectativas. Comunicação transparente com o André e a equipa técnica em todos os autos de medição.",
    name: "Eng. Ricardo Neves & Marta Simões",
    meta: "Proprietários · Moradia T3 em Aveiro",
    tag: "Entregue antes do prazo",
  },
  {
    quote:
      "Tínhamos receio dos habituais derrapes de orçamento, mas o valor fechado inicial foi rigorosamente cumprido até ao fim da empreitada. A disponibilidade para aconselhar sobre materiais deu-nos total tranquilidade. Recomendo sem reservas.",
    name: "Dr. Carlos Moreira & Filipa Pinho",
    meta: "Proprietários · Moradia em Oliveirinha / Aveiro",
    tag: "Orçamento cumprido a 100%",
  },
];

export const FAQ = [
  ["O que significa comprar em planta?",
    "Significa que reserva a moradia antes de estar construída, ao preço de hoje. O projeto já está aprovado pela Câmara Municipal de Aveiro, o terreno fica escriturado em seu nome logo no início e a construção arranca de imediato, com entrega prevista em 10 meses."],
  ["E se a obra demorar anos a arrancar?",
    "O projeto já está aprovado na Câmara Municipal. Não há espera por licenças nem burocracias pendentes. A construção arranca imediatamente após a escritura do terreno."],
  ["O valor pode sofrer alterações durante a construção?",
    "Não. O preço chave na mão fica fixado em contrato de empreitada com o Grupo Freitas Renovações. Caderno de encargos, acabamentos e impostos estão acautelados — sem custos surpresa nem revisões de orçamento."],
  ["Como funciona a compra e o crédito à construção?",
    "Adquire o lote de terreno em seu nome por escritura notarial no início. De seguida contrata a construção a preço fechado. Como é um crédito à construção, o banco liberta o financiamento por fases (tranches), apenas depois de o perito bancário confirmar cada etapa da obra."],
  ["Quanto tenho de dar de entrada?",
    "10% do valor final: 33.500€. Fica salvaguardado no CPCV com devolução a 100% caso o financiamento bancário não se concretize."],
  ["Os 335.000€ já incluem impostos?",
    "Sim. O valor de 335.000€ já inclui o IMT e o Imposto de Selo. É o valor final chave na mão: terreno, projeto aprovado, construção e impostos de transmissão."],
  ["Preciso de pagar comissões ao intermediário de crédito?",
    "Não. A consultoria financeira é gratuita para o comprador. Os intermediários de crédito são registados no Banco de Portugal e remunerados pelo banco que concede o crédito."],
  ["Posso visitar o terreno antes de decidir?",
    "Sim. A visita ao lote em Oliveirinha é gratuita e sem compromisso. Envie uma mensagem com o melhor horário e o André liga-lhe para combinar o dia."],
  ["Posso personalizar a moradia?",
    "Sim. Cozinha, acabamentos e climatização podem ser ajustados ao seu gosto, e existe a opção de converter a moradia em T4 sem alteração de preço."],
];

export const QUICK_INTENTS = [
  { id: "visita", label: "Quero visitar o terreno", text: "Olá André, gostava de visitar o terreno das moradias Domaine XXV. Qual é a sua disponibilidade esta semana?" },
  { id: "disponibilidade", label: "Que lotes estão livres?", text: "Olá André, tenho interesse nas moradias Domaine XXV em Oliveirinha. Que lotes ainda estão disponíveis?" },
  { id: "credito", label: "Ajuda com o crédito", text: "Olá André, gostava de perceber se consigo financiamento para uma das moradias Domaine XXV e quanto ficaria a prestação." },
  { id: "plantas", label: "Receber plantas e detalhes", text: "Olá André, pode enviar-me as plantas e o caderno de acabamentos das moradias Domaine XXV?" },
] as const;

export const DEFAULT_MESSAGE =
  "Olá André, tenho interesse nas moradias T3 Domaine XXV em Oliveirinha e gostava de receber mais informação.";

export const LEAD_STATUSES = [
  { id: "nova", label: "Nova", color: "#2563eb" },
  { id: "contactada", label: "Contactada", color: "#7c3aed" },
  { id: "visita", label: "Visita marcada", color: "#d97706" },
  { id: "negociacao", label: "Em negociação", color: "#0891b2" },
  { id: "reservou", label: "Reservou", color: "#16a34a" },
  { id: "perdida", label: "Sem interesse", color: "#6b7280" },
] as const;
export type LeadStatusId = (typeof LEAD_STATUSES)[number]["id"];

/** 335000 → "335.000 €" (formato habitual no imobiliário português) */
export function formatEUR(n: number) {
  const s = Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  return `${s} €`;
}

/** Prestação mensal (sistema francês). taxa anual em %, prazo em anos */
export function monthlyPayment(principal: number, annualRatePct: number, years: number) {
  const r = annualRatePct / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

// Pressupostos do simulador (indicativos)
export const SIM_DEFAULTS = { rate: 3.2, years: 40, minRate: 1.5, maxRate: 6, minYears: 15, maxYears: 40 };
