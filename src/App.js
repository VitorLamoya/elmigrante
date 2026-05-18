import { useEffect, useMemo, useState } from "react";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { initialJobs } from "./data/jobs";
import { getLanguageConfig } from "./i18n/translations";
import JobsPage from "./pages/JobsPage/JobsPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import RecruiterPage from "./pages/RecruiterPage/RecruiterPage";

const storageKey = "elmigrante.jobs";
const languageStorageKey = "elmigrante.language";

function getRouteFromHash() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  const [path, queryString = ""] = hash.split("?");
  const searchParams = new URLSearchParams(queryString);

  if (!path) {
    return { name: "home" };
  }

  const [page, id] = path.split("/");

  if (page === "vagas") {
    return { name: "jobs", search: searchParams.get("busca") || "" };
  }

  if (page === "publicar") {
    return { name: "recruiter" };
  }

  if (page === "vaga" && id) {
    return { name: "jobDetail", id };
  }

  return { name: "home" };
}

function loadJobs() {
  try {
    const savedJobs = JSON.parse(localStorage.getItem(storageKey));

    if (Array.isArray(savedJobs)) {
      return savedJobs.map((job) => ({
        ...job,
        country: job.country || job.state || "",
        contactMethod: job.contactMethod || "email",
        isUrgent: Boolean(job.isUrgent),
        hasAccommodation: Boolean(job.hasAccommodation),
      }));
    }
  } catch (error) {
    return initialJobs;
  }

  return initialJobs;
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [jobs, setJobs] = useState(loadJobs);
  const [language, setLanguage] = useState(() => localStorage.getItem(languageStorageKey) || "pt");

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
      scrollToPageTop();
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = getLanguageConfig(language).htmlLang;
  }, [language]);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.id),
    [jobs, route.id]
  );

  function handleCreateJob(job) {
    const id = `${job.title}-${job.company}-${Date.now()}`
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const publishedJob = {
      ...job,
      id,
      publishedAt: new Date().toISOString().slice(0, 10),
    };

    setJobs((currentJobs) => [publishedJob, ...currentJobs]);
    window.location.hash = "#/vagas";
  }

  return (
    <>
      <Header language={language} onLanguageChange={setLanguage} />
      {route.name === "home" && <LandingPage jobs={jobs} language={language} />}
      {route.name === "jobs" && <JobsPage jobs={jobs} initialSearch={route.search} language={language} />}
      {route.name === "jobDetail" && (
        selectedJob ? (
          <JobsPage jobs={jobs} selectedJob={selectedJob} language={language} />
        ) : (
          <JobsPage jobs={jobs} initialSearch="" language={language} />
        )
      )}
      {route.name === "recruiter" && <RecruiterPage onCreateJob={handleCreateJob} language={language} />}
      <Footer language={language} />
    </>
  );
}

export default App;
