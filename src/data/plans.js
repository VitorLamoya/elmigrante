export const whatsappSalesNumber = "351910207262";

export const planOptions = [
  {
    value: "free",
    price: "€0",
    limit: 5,
    labels: { pt: "Free", en: "Free" },
    descriptions: {
      pt: "Para começar a publicar vagas e acompanhar o interesse dos candidatos.",
      en: "For starting to post jobs and track candidate interest.",
    },
    features: {
      pt: ["Até 5 vagas ativas", "Analytics do painel", "Publicação de vagas"],
      en: ["Up to 5 active jobs", "Dashboard analytics", "Job posting"],
    },
  },
  {
    value: "pro",
    price: "€29/mês",
    limit: 15,
    labels: { pt: "Pro", en: "Pro" },
    descriptions: {
      pt: "Para recrutadores com publicação recorrente e necessidade de exportação.",
      en: "For recruiters with recurring posts and export needs.",
    },
    features: {
      pt: ["Até 15 vagas ativas", "Exportação CSV", "Analytics", "Suporte em horário comercial"],
      en: ["Up to 15 active jobs", "CSV export", "Analytics", "Business-hours support"],
    },
  },
  {
    value: "business",
    price: "€79/mês",
    limit: 50,
    labels: { pt: "Business", en: "Business" },
    descriptions: {
      pt: "Para empresas com maior volume de vagas em diferentes cidades.",
      en: "For companies with higher job volume across different cities.",
    },
    features: {
      pt: ["Até 50 vagas ativas", "Exportação CSV", "Analytics", "Suporte 24 horas dedicado"],
      en: ["Up to 50 active jobs", "CSV export", "Analytics", "Dedicated 24-hour support"],
    },
  },
  {
    value: "enterprise",
    price: "€199/mês",
    limit: null,
    labels: { pt: "Enterprise", en: "Enterprise" },
    descriptions: {
      pt: "Para operações que precisam de escala, suporte dedicado e customizações.",
      en: "For operations that need scale, dedicated support and customizations.",
    },
    features: {
      pt: ["Vagas ilimitadas", "Exportação CSV", "Analytics", "Desenvolvedor 100% dedicado", "Customizações", "Suporte 24 horas dedicado"],
      en: ["Unlimited jobs", "CSV export", "Analytics", "100% dedicated developer", "Customizations", "Dedicated 24-hour support"],
    },
  },
];

export function getPlanByValue(value = "free") {
  return planOptions.find((plan) => plan.value === value) || planOptions[0];
}

export function getPlanWhatsAppUrl(plan, language = "pt") {
  const label = plan.labels?.[language] || plan.labels?.pt || plan.value;
  const text = language === "en"
    ? `Hello, I want to subscribe to the ${label} plan on ElMigrante.`
    : `Olá, quero aderir ao Plano ${label} no ElMigrante.`;

  return `https://wa.me/${whatsappSalesNumber}?text=${encodeURIComponent(text)}`;
}
