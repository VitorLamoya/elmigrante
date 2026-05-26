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
      { value: "braga", labels: { pt: "Braga", en: "Braga" }, latitude: 41.5454, longitude: -8.4265 },
      { value: "coimbra", labels: { pt: "Coimbra", en: "Coimbra" }, latitude: 40.2033, longitude: -8.4103 },
      { value: "faro", labels: { pt: "Faro", en: "Faro" }, latitude: 37.0194, longitude: -7.9304 },
      { value: "cascais", labels: { pt: "Cascais", en: "Cascais" }, latitude: 38.6979, longitude: -9.4215 },
    ],
  },
  {
    value: "spain",
    labels: { pt: "Espanha", en: "Spain" },
    cities: [
      { value: "madrid", labels: { pt: "Madrid", en: "Madrid" }, latitude: 40.4168, longitude: -3.7038 },
      { value: "barcelona", labels: { pt: "Barcelona", en: "Barcelona" }, latitude: 41.3874, longitude: 2.1686 },
      { value: "valencia", labels: { pt: "Valencia", en: "Valencia" }, latitude: 39.4699, longitude: -0.3763 },
      { value: "seville", labels: { pt: "Sevilha", en: "Seville" }, latitude: 37.3891, longitude: -5.9845 },
      { value: "malaga", labels: { pt: "Malaga", en: "Malaga" }, latitude: 36.7213, longitude: -4.4214 },
      { value: "bilbao", labels: { pt: "Bilbau", en: "Bilbao" }, latitude: 43.263, longitude: -2.935 },
    ],
  },
  {
    value: "germany",
    labels: { pt: "Alemanha", en: "Germany" },
    cities: [
      { value: "berlin", labels: { pt: "Berlim", en: "Berlin" }, latitude: 52.52, longitude: 13.405 },
      { value: "munich", labels: { pt: "Munique", en: "Munich" }, latitude: 48.1351, longitude: 11.582 },
      { value: "hamburg", labels: { pt: "Hamburgo", en: "Hamburg" }, latitude: 53.5511, longitude: 9.9937 },
      { value: "frankfurt", labels: { pt: "Frankfurt", en: "Frankfurt" }, latitude: 50.1109, longitude: 8.6821 },
      { value: "cologne", labels: { pt: "Colonia", en: "Cologne" }, latitude: 50.9375, longitude: 6.9603 },
      { value: "stuttgart", labels: { pt: "Stuttgart", en: "Stuttgart" }, latitude: 48.7758, longitude: 9.1829 },
    ],
  },
  {
    value: "france",
    labels: { pt: "Franca", en: "France" },
    cities: [
      { value: "paris", labels: { pt: "Paris", en: "Paris" }, latitude: 48.8566, longitude: 2.3522 },
      { value: "lyon", labels: { pt: "Lyon", en: "Lyon" }, latitude: 45.764, longitude: 4.8357 },
      { value: "marseille", labels: { pt: "Marselha", en: "Marseille" }, latitude: 43.2965, longitude: 5.3698 },
      { value: "toulouse", labels: { pt: "Toulouse", en: "Toulouse" }, latitude: 43.6047, longitude: 1.4442 },
      { value: "nice", labels: { pt: "Nice", en: "Nice" }, latitude: 43.7102, longitude: 7.262 },
      { value: "lille", labels: { pt: "Lille", en: "Lille" }, latitude: 50.6292, longitude: 3.0573 },
    ],
  },
  {
    value: "netherlands",
    labels: { pt: "Holanda", en: "Netherlands" },
    cities: [
      { value: "amsterdam", labels: { pt: "Amsterda", en: "Amsterdam" }, latitude: 52.3676, longitude: 4.9041 },
      { value: "rotterdam", labels: { pt: "Roterda", en: "Rotterdam" }, latitude: 51.9244, longitude: 4.4777 },
      { value: "the-hague", labels: { pt: "Haia", en: "The Hague" }, latitude: 52.0705, longitude: 4.3007 },
      { value: "utrecht", labels: { pt: "Utrecht", en: "Utrecht" }, latitude: 52.0907, longitude: 5.1214 },
      { value: "eindhoven", labels: { pt: "Eindhoven", en: "Eindhoven" }, latitude: 51.4416, longitude: 5.4697 },
    ],
  },
  {
    value: "italy",
    labels: { pt: "Italia", en: "Italy" },
    cities: [
      { value: "rome", labels: { pt: "Roma", en: "Rome" }, latitude: 41.9028, longitude: 12.4964 },
      { value: "milan", labels: { pt: "Milao", en: "Milan" }, latitude: 45.4642, longitude: 9.19 },
      { value: "turin", labels: { pt: "Turim", en: "Turin" }, latitude: 45.0703, longitude: 7.6869 },
      { value: "naples", labels: { pt: "Napoles", en: "Naples" }, latitude: 40.8518, longitude: 14.2681 },
      { value: "bologna", labels: { pt: "Bolonha", en: "Bologna" }, latitude: 44.4949, longitude: 11.3426 },
      { value: "florence", labels: { pt: "Florença", en: "Florence" }, latitude: 43.7696, longitude: 11.2558 },
    ],
  },
  {
    value: "belgium",
    labels: { pt: "Belgica", en: "Belgium" },
    cities: [
      { value: "brussels", labels: { pt: "Bruxelas", en: "Brussels" }, latitude: 50.8503, longitude: 4.3517 },
      { value: "antwerp", labels: { pt: "Antuerpia", en: "Antwerp" }, latitude: 51.2194, longitude: 4.4025 },
      { value: "ghent", labels: { pt: "Ghent", en: "Ghent" }, latitude: 51.0543, longitude: 3.7174 },
      { value: "bruges", labels: { pt: "Bruges", en: "Bruges" }, latitude: 51.2093, longitude: 3.2247 },
    ],
  },
  {
    value: "switzerland",
    labels: { pt: "Suica", en: "Switzerland" },
    cities: [
      { value: "zurich", labels: { pt: "Zurique", en: "Zurich" }, latitude: 47.3769, longitude: 8.5417 },
      { value: "geneva", labels: { pt: "Genebra", en: "Geneva" }, latitude: 46.2044, longitude: 6.1432 },
      { value: "basel", labels: { pt: "Basileia", en: "Basel" }, latitude: 47.5596, longitude: 7.5886 },
      { value: "bern", labels: { pt: "Berna", en: "Bern" }, latitude: 46.948, longitude: 7.4474 },
    ],
  },
  {
    value: "austria",
    labels: { pt: "Austria", en: "Austria" },
    cities: [
      { value: "vienna", labels: { pt: "Viena", en: "Vienna" }, latitude: 48.2082, longitude: 16.3738 },
      { value: "salzburg", labels: { pt: "Salzburgo", en: "Salzburg" }, latitude: 47.8095, longitude: 13.055 },
      { value: "graz", labels: { pt: "Graz", en: "Graz" }, latitude: 47.0707, longitude: 15.4395 },
      { value: "linz", labels: { pt: "Linz", en: "Linz" }, latitude: 48.3069, longitude: 14.2858 },
    ],
  },
  {
    value: "ireland",
    labels: { pt: "Irlanda", en: "Ireland" },
    cities: [
      { value: "dublin", labels: { pt: "Dublin", en: "Dublin" }, latitude: 53.3498, longitude: -6.2603 },
      { value: "cork", labels: { pt: "Cork", en: "Cork" }, latitude: 51.8985, longitude: -8.4756 },
      { value: "galway", labels: { pt: "Galway", en: "Galway" }, latitude: 53.2707, longitude: -9.0568 },
      { value: "limerick", labels: { pt: "Limerick", en: "Limerick" }, latitude: 52.6638, longitude: -8.6267 },
    ],
  },
  {
    value: "united-kingdom",
    labels: { pt: "Reino Unido", en: "United Kingdom" },
    cities: [
      { value: "london", labels: { pt: "Londres", en: "London" }, latitude: 51.5072, longitude: -0.1276 },
      { value: "manchester", labels: { pt: "Manchester", en: "Manchester" }, latitude: 53.4808, longitude: -2.2426 },
      { value: "birmingham", labels: { pt: "Birmingham", en: "Birmingham" }, latitude: 52.4862, longitude: -1.8904 },
      { value: "edinburgh", labels: { pt: "Edimburgo", en: "Edinburgh" }, latitude: 55.9533, longitude: -3.1883 },
      { value: "glasgow", labels: { pt: "Glasgow", en: "Glasgow" }, latitude: 55.8642, longitude: -4.2518 },
      { value: "liverpool", labels: { pt: "Liverpool", en: "Liverpool" }, latitude: 53.4084, longitude: -2.9916 },
    ],
  },
  {
    value: "luxembourg",
    labels: { pt: "Luxemburgo", en: "Luxembourg" },
    cities: [
      { value: "luxembourg-city", labels: { pt: "Luxemburgo", en: "Luxembourg City" }, latitude: 49.6116, longitude: 6.1319 },
      { value: "esch-sur-alzette", labels: { pt: "Esch-sur-Alzette", en: "Esch-sur-Alzette" }, latitude: 49.4958, longitude: 5.9806 },
    ],
  },
  {
    value: "sweden",
    labels: { pt: "Suecia", en: "Sweden" },
    cities: [
      { value: "stockholm", labels: { pt: "Estocolmo", en: "Stockholm" }, latitude: 59.3293, longitude: 18.0686 },
      { value: "gothenburg", labels: { pt: "Gotemburgo", en: "Gothenburg" }, latitude: 57.7089, longitude: 11.9746 },
      { value: "malmo", labels: { pt: "Malmo", en: "Malmo" }, latitude: 55.605, longitude: 13.0038 },
    ],
  },
  {
    value: "norway",
    labels: { pt: "Noruega", en: "Norway" },
    cities: [
      { value: "oslo", labels: { pt: "Oslo", en: "Oslo" }, latitude: 59.9139, longitude: 10.7522 },
      { value: "bergen", labels: { pt: "Bergen", en: "Bergen" }, latitude: 60.3913, longitude: 5.3221 },
      { value: "stavanger", labels: { pt: "Stavanger", en: "Stavanger" }, latitude: 58.97, longitude: 5.7331 },
    ],
  },
  {
    value: "denmark",
    labels: { pt: "Dinamarca", en: "Denmark" },
    cities: [
      { value: "copenhagen", labels: { pt: "Copenhaga", en: "Copenhagen" }, latitude: 55.6761, longitude: 12.5683 },
      { value: "aarhus", labels: { pt: "Aarhus", en: "Aarhus" }, latitude: 56.1629, longitude: 10.2039 },
      { value: "odense", labels: { pt: "Odense", en: "Odense" }, latitude: 55.4038, longitude: 10.4024 },
    ],
  },
  {
    value: "finland",
    labels: { pt: "Finlandia", en: "Finland" },
    cities: [
      { value: "helsinki", labels: { pt: "Helsinquia", en: "Helsinki" }, latitude: 60.1699, longitude: 24.9384 },
      { value: "tampere", labels: { pt: "Tampere", en: "Tampere" }, latitude: 61.4978, longitude: 23.761 },
      { value: "turku", labels: { pt: "Turku", en: "Turku" }, latitude: 60.4518, longitude: 22.2666 },
    ],
  },
  {
    value: "poland",
    labels: { pt: "Polonia", en: "Poland" },
    cities: [
      { value: "warsaw", labels: { pt: "Varsovia", en: "Warsaw" }, latitude: 52.2297, longitude: 21.0122 },
      { value: "krakow", labels: { pt: "Cracovia", en: "Krakow" }, latitude: 50.0647, longitude: 19.945 },
      { value: "wroclaw", labels: { pt: "Wroclaw", en: "Wroclaw" }, latitude: 51.1079, longitude: 17.0385 },
      { value: "gdansk", labels: { pt: "Gdansk", en: "Gdansk" }, latitude: 54.352, longitude: 18.6466 },
    ],
  },
  {
    value: "czechia",
    labels: { pt: "Republica Tcheca", en: "Czechia" },
    cities: [
      { value: "prague", labels: { pt: "Praga", en: "Prague" }, latitude: 50.0755, longitude: 14.4378 },
      { value: "brno", labels: { pt: "Brno", en: "Brno" }, latitude: 49.1951, longitude: 16.6068 },
      { value: "ostrava", labels: { pt: "Ostrava", en: "Ostrava" }, latitude: 49.8209, longitude: 18.2625 },
    ],
  },
  {
    value: "romania",
    labels: { pt: "Romania", en: "Romania" },
    cities: [
      { value: "bucharest", labels: { pt: "Bucareste", en: "Bucharest" }, latitude: 44.4268, longitude: 26.1025 },
      { value: "cluj-napoca", labels: { pt: "Cluj-Napoca", en: "Cluj-Napoca" }, latitude: 46.7712, longitude: 23.6236 },
      { value: "timisoara", labels: { pt: "Timisoara", en: "Timisoara" }, latitude: 45.7489, longitude: 21.2087 },
    ],
  },
  {
    value: "greece",
    labels: { pt: "Grecia", en: "Greece" },
    cities: [
      { value: "athens", labels: { pt: "Atenas", en: "Athens" }, latitude: 37.9838, longitude: 23.7275 },
      { value: "thessaloniki", labels: { pt: "Salonica", en: "Thessaloniki" }, latitude: 40.6401, longitude: 22.9444 },
      { value: "patras", labels: { pt: "Patras", en: "Patras" }, latitude: 38.2466, longitude: 21.7346 },
    ],
  },
  {
    value: "croatia",
    labels: { pt: "Croacia", en: "Croatia" },
    cities: [
      { value: "zagreb", labels: { pt: "Zagreb", en: "Zagreb" }, latitude: 45.815, longitude: 15.9819 },
      { value: "split", labels: { pt: "Split", en: "Split" }, latitude: 43.5081, longitude: 16.4402 },
      { value: "rijeka", labels: { pt: "Rijeka", en: "Rijeka" }, latitude: 45.3271, longitude: 14.4422 },
    ],
  },
  {
    value: "hungary",
    labels: { pt: "Hungria", en: "Hungary" },
    cities: [
      { value: "budapest", labels: { pt: "Budapeste", en: "Budapest" }, latitude: 47.4979, longitude: 19.0402 },
      { value: "debrecen", labels: { pt: "Debrecen", en: "Debrecen" }, latitude: 47.5316, longitude: 21.6273 },
      { value: "szeged", labels: { pt: "Szeged", en: "Szeged" }, latitude: 46.253, longitude: 20.1414 },
    ],
  },
  {
    value: "slovakia",
    labels: { pt: "Eslovaquia", en: "Slovakia" },
    cities: [
      { value: "bratislava", labels: { pt: "Bratislava", en: "Bratislava" }, latitude: 48.1486, longitude: 17.1077 },
      { value: "kosice", labels: { pt: "Kosice", en: "Kosice" }, latitude: 48.7164, longitude: 21.2611 },
    ],
  },
  {
    value: "slovenia",
    labels: { pt: "Eslovenia", en: "Slovenia" },
    cities: [
      { value: "ljubljana", labels: { pt: "Liubliana", en: "Ljubljana" }, latitude: 46.0569, longitude: 14.5058 },
      { value: "maribor", labels: { pt: "Maribor", en: "Maribor" }, latitude: 46.5547, longitude: 15.6459 },
    ],
  },
  {
    value: "estonia",
    labels: { pt: "Estonia", en: "Estonia" },
    cities: [
      { value: "tallinn", labels: { pt: "Tallinn", en: "Tallinn" }, latitude: 59.437, longitude: 24.7536 },
      { value: "tartu", labels: { pt: "Tartu", en: "Tartu" }, latitude: 58.378, longitude: 26.729 },
    ],
  },
  {
    value: "latvia",
    labels: { pt: "Letonia", en: "Latvia" },
    cities: [
      { value: "riga", labels: { pt: "Riga", en: "Riga" }, latitude: 56.9496, longitude: 24.1052 },
      { value: "daugavpils", labels: { pt: "Daugavpils", en: "Daugavpils" }, latitude: 55.8747, longitude: 26.5362 },
    ],
  },
  {
    value: "lithuania",
    labels: { pt: "Lituania", en: "Lithuania" },
    cities: [
      { value: "vilnius", labels: { pt: "Vilnius", en: "Vilnius" }, latitude: 54.6872, longitude: 25.2797 },
      { value: "kaunas", labels: { pt: "Kaunas", en: "Kaunas" }, latitude: 54.8985, longitude: 23.9036 },
    ],
  },
  {
    value: "bulgaria",
    labels: { pt: "Bulgaria", en: "Bulgaria" },
    cities: [
      { value: "sofia", labels: { pt: "Sofia", en: "Sofia" }, latitude: 42.6977, longitude: 23.3219 },
      { value: "plovdiv", labels: { pt: "Plovdiv", en: "Plovdiv" }, latitude: 42.1354, longitude: 24.7453 },
      { value: "varna", labels: { pt: "Varna", en: "Varna" }, latitude: 43.2141, longitude: 27.9147 },
    ],
  },
  {
    value: "serbia",
    labels: { pt: "Servia", en: "Serbia" },
    cities: [
      { value: "belgrade", labels: { pt: "Belgrado", en: "Belgrade" }, latitude: 44.7866, longitude: 20.4489 },
      { value: "novi-sad", labels: { pt: "Novi Sad", en: "Novi Sad" }, latitude: 45.2671, longitude: 19.8335 },
    ],
  },
  {
    value: "malta",
    labels: { pt: "Malta", en: "Malta" },
    cities: [
      { value: "valletta", labels: { pt: "Valeta", en: "Valletta" }, latitude: 35.8989, longitude: 14.5146 },
      { value: "sliema", labels: { pt: "Sliema", en: "Sliema" }, latitude: 35.9125, longitude: 14.5019 },
    ],
  },
  {
    value: "cyprus",
    labels: { pt: "Chipre", en: "Cyprus" },
    cities: [
      { value: "nicosia", labels: { pt: "Nicosia", en: "Nicosia" }, latitude: 35.1856, longitude: 33.3823 },
      { value: "limassol", labels: { pt: "Limassol", en: "Limassol" }, latitude: 34.7071, longitude: 33.0226 },
    ],
  },
  {
    value: "iceland",
    labels: { pt: "Islandia", en: "Iceland" },
    cities: [
      { value: "reykjavik", labels: { pt: "Reykjavik", en: "Reykjavik" }, latitude: 64.1466, longitude: -21.9426 },
      { value: "akureyri", labels: { pt: "Akureyri", en: "Akureyri" }, latitude: 65.6885, longitude: -18.1262 },
    ],
  },
];

export const areaOptions = [
  { value: "operations", labels: { pt: "Operacional", en: "Operations" } },
  { value: "programming", labels: { pt: "Programacao", en: "Programming" } },
  { value: "customer-service", labels: { pt: "Atendimento", en: "Customer service" } },
  { value: "logistics", labels: { pt: "Logistica", en: "Logistics" } },
  { value: "services", labels: { pt: "Servicos", en: "Services" } },
  { value: "hospitality", labels: { pt: "Hotelaria", en: "Hospitality" } },
  { value: "administrative", labels: { pt: "Administrativo", en: "Administrative" } },
  { value: "bilingual", labels: { pt: "Bilingue", en: "Bilingual" } },
];

export const contractOptions = [
  { value: "full-time", labels: { pt: "Tempo integral", en: "Full-time" } },
  { value: "part-time", labels: { pt: "Meio periodo", en: "Part-time" } },
  { value: "local-contract", labels: { pt: "Contrato local", en: "Local contract" } },
  { value: "temporary", labels: { pt: "Temporario", en: "Temporary" } },
  { value: "freelance", labels: { pt: "Freelancer", en: "Freelance" } },
];

export const experienceOptions = [
  { value: "none", labels: { pt: "Sem experiencia", en: "No experience" } },
  { value: "1-year", labels: { pt: "+1 ano", en: "+1 year" } },
  { value: "2-years", labels: { pt: "+2 anos", en: "+2 years" } },
  { value: "3-years", labels: { pt: "+3 anos", en: "+3 years" } },
  { value: "5-years", labels: { pt: "+5 anos", en: "+5 years" } },
];

export const languageOptions = [
  { value: "portuguese", labels: { pt: "Portugues", en: "Portuguese" } },
  { value: "spanish", labels: { pt: "Espanhol", en: "Spanish" } },
  { value: "english", labels: { pt: "Ingles", en: "English" } },
  { value: "french", labels: { pt: "Frances", en: "French" } },
  { value: "german", labels: { pt: "Alemao", en: "German" } },
  { value: "italian", labels: { pt: "Italiano", en: "Italian" } },
];

export const languageLevelOptions = [
  { value: "basic", labels: { pt: "Basico", en: "Basic" } },
  { value: "intermediate", labels: { pt: "Intermediario", en: "Intermediate" } },
  { value: "advanced", labels: { pt: "Avancado", en: "Advanced" } },
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

export function getSalaryLabel(value, fallback = "Nao informado") {
  const salary = String(value || "").trim();
  const numericValue = Number(salary.replace(/\D/g, ""));

  return salary && numericValue > 0 ? salary : fallback;
}

function translateKnownLanguageText(value = "") {
  return value
    .replace(/Portugues/gi, "Portuguese")
    .replace(/Espanhol/gi, "Spanish")
    .replace(/Ingles/gi, "English")
    .replace(/Frances/gi, "French")
    .replace(/Alemao/gi, "German")
    .replace(/Italiano/gi, "Italian")
    .replace(/basico/gi, "basic")
    .replace(/intermediario/gi, "intermediate")
    .replace(/avancado/gi, "advanced")
    .replace(/fluente/gi, "fluent")
    .replace(/nativo/gi, "native");
}
