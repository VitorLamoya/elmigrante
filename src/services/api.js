const API_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";
const VISITOR_ID_KEY = "elmigrante.visitorId";

function createVisitorId() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getVisitorId() {
  const currentVisitorId = window.localStorage.getItem(VISITOR_ID_KEY);

  if (currentVisitorId) {
    return currentVisitorId;
  }

  const nextVisitorId = createVisitorId();
  window.localStorage.setItem(VISITOR_ID_KEY, nextVisitorId);
  return nextVisitorId;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const text = await response.text();
  const data = text ? JSON.parse(text) : null;

  if (!response.ok) {
    throw new Error(data?.error || "Request failed.");
  }

  return data;
}

export function registerRecruiter({ name, email, password, companyName, companySize }) {
  return request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password, companyName, companySize, role: "recruiter" }),
  });
}

export function loginRecruiter({ email, password }) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function getJobs() {
  return request("/jobs");
}

export function getRecruiterJobs(token) {
  return request("/jobs/mine", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function trackJobEvent(jobId, type) {
  const visitorId = getVisitorId();

  return request(`/jobs/${jobId}/events`, {
    method: "POST",
    headers: {
      "X-Visitor-Id": visitorId,
    },
    body: JSON.stringify({ type, source: "web", visitorId }),
  });
}

export function createJob(job, token) {
  return request("/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(job),
  });
}
