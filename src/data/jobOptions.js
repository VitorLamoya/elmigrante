function normalize(value = "") {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

export const countryOptions = [
  {
    value: "portugal",
    labels: { pt: "Portugal", en: "Portugal" },
    cities: [
      { value: "lisboa", labels: { pt: "Lisboa", en: "Lisbon" }, latitude: 38.7223, longitude: -9.1393 },
      { value: "porto", labels: { pt: "Porto", en: "Porto" }, latitude: 41.1579, longitude: -8.6291 },
      { value: "cascais", labels: { pt: "Cascais", en: "Cascais" }, latitude: 38.6979, longitude: -9.4215 },
    ],
  },
  {
    value: "spain",
    labels: { pt: "Espanha", en: "Spain" },
    cities: [
      { value: "madrid", labels: { pt: "Madrid", en: "Madrid" }, latitude: 40.4168, longitude: -3.7038 },
      { value: "barcelona", labels: { pt: "Barcelona", en: "Barcelona" }, latitude: 41.3874, longitude: 2.1686 },
    ],
  },
  {
    value: "germany",
    labels: { pt: "Alemanha", en: "Germany" },
    cities: [
      { value: "berlin", labels: { pt: "Berlim", en: "Berlin" }, latitude: 52.52, longitude: 13.405 },
      { value: "munich", labels: { pt: "Munique", en: "Munich" }, latitude: 48.1351, longitude: 11.582 },
    ],
  },
  {
    value: "france",
    labels: { pt: "França", en: "France" },
    cities: [
      { value: "paris", labels: { pt: "Paris", en: "Paris" }, latitude: 48.8566, longitude: 2.3522 },
      { value: "lyon", labels: { pt: "Lyon", en: "Lyon" }, latitude: 45.764, longitude: 4.8357 },
    ],
  },
  {
    value: "netherlands",
    labels: { pt: "Holanda", en: "Netherlands" },
    cities: [
      { value: "amsterdam", labels: { pt: "Amsterdã", en: "Amsterdam" }, latitude: 52.3676, longitude: 4.9041 },
      { value: "rotterdam", labels: { pt: "Roterdã", en: "Rotterdam" }, latitude: 51.9244, longitude: 4.4777 },
    ],
  },
];

export const areaOptions = [
  { value: "operations", labels: { pt: "Operacional", en: "Operations" } },
  { value: "programming", labels: { pt: "Programação", en: "Programming" } },
  { value: "customer-service", labels: { pt: "Atendimento", en: "Customer service" } },
  { value: "logistics", labels: { pt: "Logística", en: "Logistics" } },
  { value: "services", labels: { pt: "Serviços", en: "Services" } },
  { value: "hospitality", labels: { pt: "Hotelaria", en: "Hospitality" } },
  { value: "administrative", labels: { pt: "Administrativo", en: "Administrative" } },
  { value: "bilingual", labels: { pt: "Bilíngue", en: "Bilingual" } },
];

export const contractOptions = [
  { value: "full-time", labels: { pt: "Tempo integral", en: "Full-time" } },
  { value: "part-time", labels: { pt: "Meio período", en: "Part-time" } },
  { value: "local-contract", labels: { pt: "Contrato local", en: "Local contract" } },
  { value: "temporary", labels: { pt: "Temporário", en: "Temporary" } },
  { value: "freelance", labels: { pt: "Freelancer", en: "Freelance" } },
];

export const experienceOptions = [
  { value: "none", labels: { pt: "Sem experiência", en: "No experience" } },
  { value: "1-year", labels: { pt: "+1 ano", en: "+1 year" } },
  { value: "2-years", labels: { pt: "+2 anos", en: "+2 years" } },
  { value: "3-years", labels: { pt: "+3 anos", en: "+3 years" } },
  { value: "5-years", labels: { pt: "+5 anos", en: "+5 years" } },
];

export const languageOptions = [
  { value: "portuguese", labels: { pt: "Português", en: "Portuguese" } },
  { value: "spanish", labels: { pt: "Espanhol", en: "Spanish" } },
  { value: "english", labels: { pt: "Inglês", en: "English" } },
  { value: "french", labels: { pt: "Francês", en: "French" } },
  { value: "german", labels: { pt: "Alemão", en: "German" } },
  { value: "italian", labels: { pt: "Italiano", en: "Italian" } },
];

export const languageLevelOptions = [
  { value: "basic", labels: { pt: "Básico", en: "Basic" } },
  { value: "intermediate", labels: { pt: "Intermediário", en: "Intermediate" } },
  { value: "advanced", labels: { pt: "Avançado", en: "Advanced" } },
  { value: "fluent", labels: { pt: "Fluente", en: "Fluent" } },
  { value: "native", labels: { pt: "Nativo", en: "Native" } },
];

export function getOptionLabel(options, value, language = "pt") {
  const option = options.find((item) => item.value === value);
  return option?.labels?.[language] || option?.labels?.pt || value || "";
}

export function findOptionValue(options, labelOrValue = "") {
  const normalized = normalize(labelOrValue);
  return options.find((item) => item.value === labelOrValue || Object.values(item.labels).some((label) => normalize(label) === normalized))?.value || "";
}

export function getCountryLabel(value, language = "pt") {
  return getOptionLabel(countryOptions, value, language);
}

export function getCityOptions(countryValue) {
  return countryOptions.find((country) => country.value === countryValue)?.cities || [];
}

export function getCityLabel(countryValue, cityValue, language = "pt") {
  return getOptionLabel(getCityOptions(countryValue), cityValue, language);
}

export function getCityCoordinates(countryValue, cityValue) {
  const city = getCityOptions(countryValue).find((item) => item.value === cityValue);
  return {
    latitude: city?.latitude || null,
    longitude: city?.longitude || null,
  };
}

export function findCountryValue(labelOrValue = "") {
  return findOptionValue(countryOptions, labelOrValue);
}

export function findCityValue(countryValue, labelOrValue = "") {
  return findOptionValue(getCityOptions(countryValue), labelOrValue);
}

export function getLocalizedJob(job, language = "pt") {
  const countryCode = job.countryCode || findCountryValue(job.country);
  const cityCode = job.cityCode || findCityValue(countryCode, job.city);
  const areaCode = job.areaCode || findOptionValue(areaOptions, job.area);
  const contractCode = job.contractCode || findOptionValue(contractOptions, job.contract);
  const experienceCode = job.experienceCode || findOptionValue(experienceOptions, job.experience);

  return {
    city: cityCode ? getCityLabel(countryCode, cityCode, language) : job.city,
    country: countryCode ? getCountryLabel(countryCode, language) : job.country,
    area: areaCode ? getOptionLabel(areaOptions, areaCode, language) : job.area,
    contract: contractCode ? getOptionLabel(contractOptions, contractCode, language) : job.contract,
    experience: experienceCode ? getOptionLabel(experienceOptions, experienceCode, language) : job.experience,
    languages: getLocalizedLanguages(job, language),
  };
}

export function getLocalizedLanguages(job, language = "pt") {
  if (Array.isArray(job.languageItems) && job.languageItems.length > 0) {
    return job.languageItems
      .map((item) => `${getOptionLabel(languageOptions, item.language, language)} · ${getOptionLabel(languageLevelOptions, item.level, language)}`)
      .join(", ");
  }

  return language === "en" ? translateKnownLanguageText(job.languages) : job.languages;
}

export function getSalaryLabel(value, fallback = "Não informado") {
  const salary = String(value || "").trim();
  const numericValue = Number(salary.replace(/\D/g, ""));

  return salary && numericValue > 0 ? salary : fallback;
}

function translateKnownLanguageText(value = "") {
  return value
    .replace(/Português/gi, "Portuguese")
    .replace(/Espanhol/gi, "Spanish")
    .replace(/Inglês/gi, "English")
    .replace(/Francês/gi, "French")
    .replace(/Alemão/gi, "German")
    .replace(/Italiano/gi, "Italian")
    .replace(/básico/gi, "basic")
    .replace(/intermediário/gi, "intermediate")
    .replace(/avançado/gi, "advanced")
    .replace(/fluente/gi, "fluent")
    .replace(/nativo/gi, "native");
}
