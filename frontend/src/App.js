import { useEffect, useMemo, useState } from "react";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { initialJobs } from "./data/jobs";
import {
  areaOptions,
  contractOptions,
  experienceOptions,
  findCityValue,
  findCountryValue,
  findOptionValue,
} from "./data/jobOptions";
import { getLanguageConfig } from "./i18n/translations";
import AuthPage from "./pages/AuthPage/AuthPage";
import CandidatePage from "./pages/CandidatePage/CandidatePage";
import JobsPage from "./pages/JobsPage/JobsPage";
import LandingPage from "./pages/LandingPage/LandingPage";
import RecruiterPage from "./pages/RecruiterPage/RecruiterPage";
import { createJob, deleteJob, getCandidateDashboard, getJobs, setUnauthorizedHandler } from "./services/api";

const legacyJobsStorageKey = "elmigrante.jobs";
const languageStorageKey = "elmigrante.language";
const authStorageKey = "elmigrante.auth";

function hasPromotedPlacement(plan) {
  return plan === "business" || plan === "enterprise";
}

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

  if (page === "planos") {
    return { name: "home", anchor: "planos" };
  }

  if (page === "recrutador") {
    return { name: "recruiter" };
  }

  if (page === "publicar") {
    return { name: "publishJob" };
  }

  if (page === "login") {
    return { name: "login", audience: searchParams.get("audience") || "recruiter" };
  }

  if (page === "cadastro") {
    return { name: "register", audience: searchParams.get("audience") || "recruiter" };
  }

  if (page === "login-candidato") {
    return { name: "login", audience: "candidate" };
  }

  if (page === "cadastro-candidato") {
    return { name: "register", audience: "candidate" };
  }

  if (page === "candidato") {
    return { name: "candidate" };
  }

  if (page === "vaga" && id) {
    return { name: "jobDetail", id };
  }

  return { name: "home" };
}

function loadFallbackJobs() {
  return initialJobs.map((job) => ({
    ...job,
    country: job.country || job.state || "",
    countryCode: job.countryCode || findCountryValue(job.country || job.state || ""),
    cityCode: job.cityCode || findCityValue(job.countryCode || findCountryValue(job.country || job.state || ""), job.city),
    latitude: job.latitude ?? null,
    longitude: job.longitude ?? null,
    areaCode: job.areaCode || findOptionValue(areaOptions, job.area),
    contractCode: job.contractCode || findOptionValue(contractOptions, job.contract),
    experienceCode: job.experienceCode || findOptionValue(experienceOptions, job.experience),
    languageItems: Array.isArray(job.languageItems) ? job.languageItems : [],
    contactMethod: job.contactMethod || "email",
    recruiterPlan: job.recruiterPlan || "free",
    isPromoted: hasPromotedPlacement(job.recruiterPlan || "free"),
    isUrgent: Boolean(job.isUrgent),
    hasAccommodation: Boolean(job.hasAccommodation),
  }));
}

function scrollToPageTop() {
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function isSessionExpired(authSession) {
  const expiresAt = authSession?.session?.expires_at;

  if (!expiresAt) {
    return true;
  }

  return Date.now() >= expiresAt * 1000;
}

function App() {
  const [route, setRoute] = useState(getRouteFromHash);
  const [jobs, setJobs] = useState(loadFallbackJobs);
  const [language, setLanguage] = useState(() => localStorage.getItem(languageStorageKey) || "pt");
  const [authSession, setAuthSession] = useState(() => {
    try {
      const savedSession = JSON.parse(localStorage.getItem(authStorageKey));
      return isSessionExpired(savedSession) ? null : savedSession;
    } catch (error) {
      return null;
    }
  });
  const [candidateDashboard, setCandidateDashboard] = useState(null);

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(getRouteFromHash());
      scrollToPageTop();
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.removeItem(legacyJobsStorageKey);
  }, []);

  useEffect(() => {
    async function loadRemoteJobs() {
      try {
        const remoteJobs = await getJobs();
        setJobs(remoteJobs.length > 0 ? remoteJobs : loadFallbackJobs());
      } catch (error) {
        setJobs(loadFallbackJobs());
      }
    }

    loadRemoteJobs();
  }, []);

  useEffect(() => {
    async function loadCandidateData() {
      const role = authSession?.user?.user_metadata?.role || authSession?.user?.app_metadata?.role;
      const token = authSession?.session?.access_token;

      if (role !== "candidate" || !token) {
        setCandidateDashboard(null);
        return;
      }

      try {
        setCandidateDashboard(await getCandidateDashboard(token));
      } catch (error) {
        setCandidateDashboard(null);
      }
    }

    loadCandidateData();
  }, [authSession]);

  useEffect(() => {
    localStorage.setItem(languageStorageKey, language);
    document.documentElement.lang = getLanguageConfig(language).htmlLang;
  }, [language]);

  useEffect(() => {
    if (authSession?.session?.access_token) {
      localStorage.setItem(authStorageKey, JSON.stringify(authSession));
    } else {
      localStorage.removeItem(authStorageKey);
    }
  }, [authSession]);

  useEffect(() => {
    if (!route.anchor) return;

    window.setTimeout(() => {
      document.getElementById(route.anchor)?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 0);
  }, [route]);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setAuthSession((currentSession) => {
        if (!currentSession) {
          return null;
        }

        if (window.location.hash === "#/recrutador" || window.location.hash === "#/publicar") {
          window.location.hash = "#/login";
        }

        return null;
      });
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const selectedJob = useMemo(
    () => jobs.find((job) => job.id === route.id),
    [jobs, route.id]
  );

  async function handleCreateJob(job) {
    const token = authSession?.session?.access_token;

    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    const publishedJob = await createJob(job, token);
    setJobs((currentJobs) => [publishedJob, ...currentJobs.filter((currentJob) => currentJob.id !== publishedJob.id)]);
    return publishedJob;
  }

  async function handleDeleteJob(jobId) {
    const token = authSession?.session?.access_token;

    if (!token) {
      window.location.hash = "#/login";
      return;
    }

    await deleteJob(jobId, token);
    setJobs((currentJobs) => currentJobs.filter((currentJob) => currentJob.id !== jobId));
  }

  function handleCandidateDashboardUpdate(nextDashboard) {
    setCandidateDashboard(nextDashboard);
  }

  function handleLogout() {
    setAuthSession(null);
    setCandidateDashboard(null);
    if (route.name === "recruiter" || route.name === "publishJob" || route.name === "candidate") {
      window.location.hash = "#/login";
    }
  }

  const authRole = authSession?.user?.user_metadata?.role || authSession?.user?.app_metadata?.role || null;

  return (
    <>
      <Header language={language} onLanguageChange={setLanguage} authSession={authSession} authRole={authRole} onLogout={handleLogout} />
      {route.name === "home" && (
        <LandingPage
          jobs={jobs}
          language={language}
          authSession={authSession}
          candidateDashboard={candidateDashboard}
          onCandidateDashboardUpdate={handleCandidateDashboardUpdate}
        />
      )}
      {route.name === "jobs" && <JobsPage jobs={jobs} initialSearch={route.search} language={language} authSession={authSession} candidateDashboard={candidateDashboard} onCandidateDashboardUpdate={handleCandidateDashboardUpdate} />}
      {route.name === "login" && <AuthPage language={language} mode="login" audience={route.audience} onAuth={setAuthSession} />}
      {route.name === "register" && <AuthPage language={language} mode="register" audience={route.audience} onAuth={setAuthSession} />}
      {route.name === "jobDetail" && (
        selectedJob ? (
          <JobsPage jobs={jobs} selectedJob={selectedJob} language={language} authSession={authSession} candidateDashboard={candidateDashboard} onCandidateDashboardUpdate={handleCandidateDashboardUpdate} />
        ) : (
          <JobsPage jobs={jobs} initialSearch="" language={language} authSession={authSession} candidateDashboard={candidateDashboard} onCandidateDashboardUpdate={handleCandidateDashboardUpdate} />
        )
      )}
      {route.name === "recruiter" && (
        authSession?.session?.access_token && authRole === "recruiter" ? (
          <RecruiterPage authSession={authSession} mode="dashboard" onCreateJob={handleCreateJob} onDeleteJob={handleDeleteJob} language={language} />
        ) : (
          <AuthPage language={language} mode="login" audience="recruiter" onAuth={setAuthSession} />
        )
      )}
      {route.name === "publishJob" && (
        authSession?.session?.access_token && authRole === "recruiter" ? (
          <RecruiterPage authSession={authSession} mode="publish" onCreateJob={handleCreateJob} onDeleteJob={handleDeleteJob} language={language} />
        ) : (
          <AuthPage language={language} mode="login" audience="recruiter" onAuth={setAuthSession} />
        )
      )}
      {route.name === "candidate" && (
        authSession?.session?.access_token && authRole === "candidate" ? (
          <CandidatePage dashboard={candidateDashboard} language={language} />
        ) : (
          <AuthPage language={language} mode="login" audience="candidate" onAuth={setAuthSession} />
        )
      )}
      <Footer language={language} />
    </>
  );
}

export default App;
