// Dados do empreendimento. Toda a página lê daqui — altere aqui e muda em todo o lado.

export const PROJECT = {
  name: "Domaine XXV",
  tagline: "3 moradias T3 com jardim em Oliveirinha, Aveiro",
  address: "Rua Acácio Simões Vieira",
  postal: "3810-843 Oliveirinha · Aveiro",
  coords: `40°34'59.2"N 8°37'02.2"W`,
  mapEmbed:
    "https://www.google.com/maps?q=R.+Ac%C3%A1cio+Sim%C3%B5es+Vieira,+3810-843+Oliveirinha&t=m&z=13&output=embed",
  tour360: "https://visita3dmoradia-vvtu.vercel.app/",
  price: 335000,
  downPaymentPct: 0.1,
  buildMonths: 10,
} as const;

// Meta: o ID do Pixel é público (aparece no código de qualquer página). O token da API de Conversões é secreto
// e vai SÓ para a variável de ambiente META_CAPI_ACCESS_TOKEN (nunca para o código).
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "979841341182458";

/** Valor enviado com cada Lead (o mais alto do funil: o preço da moradia). Outros eventos vão sem valor. */
export const META_LEAD_VALUE = { value: 335000, currency: "EUR" } as const;

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
  // N.º do alvará (IMPIC). Quando preenchido aparece na construtora, nas características e na segurança da compra.
  licence: "",
} as const;

// Arquitetura e engenharia (projeto aprovado)
export const DESIGNERS = {
  firm: "Risco Calculado",
  legal: "Risco Calculado – Arquitectura e Engenharia, Lda.",
  where: "Mealhada · Aveiro",
  instagram: "https://www.instagram.com/riscocalculado.arq/",
  logo: "/brand/risco-calculado.webp",
  // Preencher com os nomes e percurso para aparecerem no site
  architect: "", // ex.: "Arq.ª Nome Apelido · OA n.º ..."
  engineer: "", // ex.: "Eng. Nome Apelido · OE n.º ..."
  bio: "Gabinete de arquitetura e engenharia responsável pelo projeto aprovado.",
};

// Banco parceiro. Quando preenchido aparece "Financiamento disponível com …" no resumo, simulador, características e FAQ.
export const FINANCING_BANK = "";

// Marcas previstas no caderno de encargos
export const BRANDS = [
  { name: "Cortizo", use: "Caixilharia em alumínio", logo: "/brand/cortizo.webp", w: 984, h: 264 },
  { name: "Daikin", use: "Climatização e bomba de calor", logo: "/brand/daikin.webp", w: 980, h: 222 },
  { name: "Bosch", use: "Eletrodomésticos", logo: "/brand/bosch.webp", w: 980, h: 235 },
  { name: "Teka", use: "Equipamentos de cozinha", logo: "/brand/teka.webp", w: 1056, h: 1056 },
  { name: "Margres", use: "Cerâmica e revestimentos", logo: "/brand/margres.webp", w: 980, h: 239 },
  { name: "Castro Wood Floors", use: "Pavimento em madeira", logo: "/brand/castro-wood-floors.webp", w: 408, h: 82 },
];

export type LotStatus = "disponivel" | "reservado" | "vendido";
export type Lot = { id: string; label: string; status: LotStatus };

// Estado por omissão (o André pode alterar em /leads → Lotes, sem mexer no código).
export const DEFAULT_LOTS: Lot[] = [
  { id: "25", label: "Lote 25", status: "disponivel" },
  { id: "26", label: "Lote 26", status: "disponivel" },
  { id: "27", label: "Lote 27", status: "vendido" },
];

export const LOT_SPEC = {
  typology: "T3 (opção T4)",
  t4Note: "opção T4 no rés-do-chão",
  usefulArea: "146,34 m²",
  grossPrivate: "~180 m²",
  dependentArea: "77,65 m²",
  garden: "~82 m²",
  bathrooms: 3,
  floors: "R/C + Piso 1 + Sótão",
};

// A primeira imagem é a capa (carrega com prioridade). As restantes carregam à medida que se desliza.
// Ordem pensada para impacto. O mosaico enche coluna a coluna (cima, baixo), por isso as pequenas vão aos PARES:
// cada divisão fica em cima e o seu detalhe logo por baixo, na mesma coluna.
// Só renders novos. Grandes (big) ocupam a coluna inteira; entre duas grandes tem de haver um número PAR de pequenas
// (contando o mosaico da visita 360°, que entra logo a seguir à capa — ver Gallery.tsx).
export const GALLERY: { src: string; w: number; h: number; alt: string; big?: boolean; plan?: boolean; real?: boolean; pos?: string }[] = [
  // Capa
  { src: "/images/fachada-principal.webp", w: 1254, h: 1254, alt: "As 3 moradias Domaine XXV vistas da rua", big: true },
  // [Visita 360° entra aqui, em cima] + sala de estar por baixo
  { src: "/images/sala-de-estar.webp", w: 1254, h: 1254, alt: "Sala de estar aberta para a cozinha" },
  // Cozinha + detalhe
  { src: "/images/cozinha-open-space.webp", w: 1254, h: 1254, alt: "Cozinha open space com zona de refeições" },
  { src: "/images/cozinha-detalhe.webp", w: 1254, h: 1254, alt: "Detalhe da cozinha equipada" },
  // Sala de jantar + jardim
  { src: "/images/sala-de-jantar.webp", w: 1254, h: 1254, alt: "Sala de jantar" },
  { src: "/images/jardim-privativo.webp", w: 1254, h: 1254, alt: "Jardim privativo de ~82 m²" },
  // Piso 1: hall + quarto
  { src: "/images/hall-piso-1.webp", w: 1254, h: 1254, alt: "Hall do 1.º piso com acesso aos quartos" },
  { src: "/images/quarto-com-roupeiro.webp", w: 1254, h: 1254, alt: "Quarto com roupeiro e varanda" },
  // Suite + detalhe
  { src: "/images/quarto-suite-varanda.webp", w: 1254, h: 1254, alt: "Quarto suite com varanda" },
  { src: "/images/quarto-suite-detalhe.webp", w: 1254, h: 1254, alt: "Detalhe da suite" },
  // Quarto com escritório + detalhe
  { src: "/images/quarto-escritorio.webp", w: 1254, h: 1254, alt: "Quarto com zona de escritório" },
  { src: "/images/quarto-escritorio-detalhe.webp", w: 1254, h: 1254, alt: "Detalhe da zona de escritório" },
  // Casa de banho completa + detalhe do duche
  { src: "/images/casa-de-banho-completa.webp", w: 1254, h: 1254, alt: "Casa de banho completa" },
  { src: "/images/casa-de-banho-detalhe-duche.webp", w: 1254, h: 1254, alt: "Detalhe do duche com nicho iluminado" },
  // Casa de banho da suite + de serviço
  { src: "/images/casa-de-banho-suite.webp", w: 1254, h: 1254, alt: "Casa de banho da suite" },
  { src: "/images/casa-de-banho-servico.webp", w: 1254, h: 1254, alt: "Casa de banho de serviço (rés-do-chão)" },
  // Sótão + traseiras
  { src: "/images/sotao.webp", w: 1254, h: 1254, alt: "Sótão de ~34 m² (sala de jogos, escritório ou arrumação)" },
  { src: "/images/exterior-traseiro-jardim.webp", w: 1254, h: 1254, alt: "Traseiras com jardim privativo ao fim do dia" },
  // O terreno hoje (fotografias reais; contorno dos lotes indicativo)
  { src: "/images/terreno-vista-aerea.webp", w: 2000, h: 851, alt: "O terreno hoje: vista aérea dos 3 lotes (contorno indicativo)", big: true, real: true, pos: "62% 50%" },
  { src: "/images/terreno-rua.webp", w: 1280, h: 958, alt: "O terreno hoje, visto da rua (contorno indicativo)", real: true },
  { src: "/images/terreno-lote.webp", w: 2000, h: 1497, alt: "O terreno hoje: um dos lotes (contorno indicativo)", real: true },
  // Plantas
  { src: "/images/planta-tecnica.webp", w: 1600, h: 1131, alt: "Planta técnica · R/C, piso 1 e sótão", big: true, plan: true },
  { src: "/images/planta-3d.webp", w: 1600, h: 1131, alt: "Planta 3D", big: true, plan: true },
];

export const PLANS = [
  { src: "/images/planta-tecnica.webp", alt: "Planta técnica", note: "Piso 0 + Piso 1 + Sótão" },
  { src: "/images/planta-3d.webp", alt: "Planta 3D", note: "Distribuição e enquadramento exterior" },
];

export const WORKS = [
  { src: "/obras/wc.webp", alt: "Casas de banho", tag: "Obra concluída" },
  { src: "/obras/quarto.webp", alt: "Quartos e pavimentos", tag: "Obra concluída" },
  { src: "/obras/alvenaria.webp", alt: "Estrutura e alvenarias", tag: "Em execução" },
  { src: "/obras/redes.webp", alt: "Instalações técnicas", tag: "Em execução" },
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
  ["Posso comprar com crédito habitação?",
    "Sim. Apesar de ser uma venda em planta, pode financiar até 90% com crédito habitação, na modalidade de construção: o banco liberta o dinheiro por fases, à medida que a obra avança. O estudo de viabilidade bancária é gratuito."],
  ["E se a obra demorar anos a arrancar?",
    "O projeto já está aprovado na Câmara Municipal. Não há espera por licenças nem burocracias pendentes. A construção arranca imediatamente após a escritura do terreno."],
  ["O valor pode sofrer alterações durante a construção?",
    "Não. O preço chave na mão fica fixado em contrato de empreitada com o Grupo Freitas Renovações. Caderno de encargos, acabamentos e impostos estão acautelados — sem custos surpresa nem revisões de orçamento."],
  ["Como funciona a compra e o crédito à construção?",
    "Adquire o lote de terreno em seu nome por escritura notarial no início. De seguida contrata a construção a preço fechado. Como é um crédito à construção, o banco liberta o financiamento por fases (tranches), apenas depois de o perito bancário confirmar cada etapa da obra."],
  ["Quanto tenho de dar de entrada?",
    "10% do preço: 33.500 €, imputados ao valor total de 335.000 €. O contrato define as condições de devolução, incluindo se o financiamento não for aprovado."],
  ["Se o banco atrasar uma tranche, a obra para?",
    "Não depende só das datas do banco. O Grupo Freitas Renovações tem capacidade financeira própria para manter a obra perante atrasos pontuais nos desembolsos, nos termos do contrato de empreitada."],
  ["O que é a retenção de boa execução?",
    "Uma parte do preço, cerca de 33.500 €, que só é paga na fase final prevista no contrato. Não é um valor adicional aos 335.000 €."],
  ["Posso levar um engenheiro para fiscalizar a obra?",
    "Sim. Pode nomear profissionais independentes para analisar a documentação e acompanhar a execução, com agendamento e cumprimento das regras de segurança em obra."],
  ["Posso consultar o contrato antes de reservar?",
    "Sim. O dossier técnico, as condições de aquisição e as minutas dos contratos estão disponíveis para análise antes de assinar."],
  ["Os 335.000€ já incluem impostos?",
    "Sim. O valor de 335.000€ já inclui o IMT e o Imposto de Selo. É o valor final chave na mão: terreno, projeto aprovado, construção e impostos de transmissão."],
  ["Preciso de pagar comissões ao intermediário de crédito?",
    "Não. A consultoria financeira é gratuita para o comprador. Os intermediários de crédito são registados no Banco de Portugal e remunerados pelo banco que concede o crédito."],
  ["Posso visitar o terreno antes de decidir?",
    "Sim. A visita ao lote em Oliveirinha é gratuita e sem compromisso. Envie uma mensagem com o melhor horário e o André liga-lhe para combinar o dia."],
  ["Posso personalizar a moradia?",
    "Sim. Cozinha, acabamentos e climatização podem ser ajustados ao seu gosto, e existe a opção de T4 no rés-do-chão sem alteração de preço."],
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
