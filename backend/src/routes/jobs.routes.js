import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const PLAN_LIMITS = {
  free: 5,
  pro: 15,
  business: 50,
  enterprise: null,
};
const CSV_EXPORT_ENABLED_PLANS = new Set(["pro", "business", "enterprise"]);
const TRACKABLE_EVENTS = new Set(["view", "contact_click"]);

function hasPromotedPlacement(plan) {
  return plan === "business" || plan === "enterprise";
}

function isMissingEventsTableError(error) {
  return error?.code === "42P01" || /job_events|visitor_id|schema cache/i.test(error?.message || "");
}

function toClientJob(row) {
  return {
    id: row.id,
    recruiterId: row.recruiter_id,
    title: row.title,
    company: row.company,
    city: row.city,
    cityCode: row.city_code,
    country: row.country,
    countryCode: row.country_code,
    latitude: row.latitude,
    longitude: row.longitude,
    area: row.area,
    areaCode: row.area_code,
    contract: row.contract,
    contractCode: row.contract_code,
    salary: row.salary,
    description: row.description,
    requirements: row.requirements || "",
    benefits: row.benefits || "",
    languages: row.languages || "",
    languageItems: row.language_items || [],
    experience: row.experience || "",
    experienceCode: row.experience_code || "",
    contactMethod: row.contact_method,
    contact: row.contact,
    isUrgent: row.is_urgent,
    hasAccommodation: row.has_accommodation,
    recruiterPlan: row.recruiter_plan || "free",
    isPromoted: hasPromotedPlacement(row.recruiter_plan || "free"),
    publishedAt: row.published_at?.slice(0, 10),
    views: row.views || 0,
    contactClicks: row.contactClicks || 0,
    lastAccessedAt: row.lastAccessedAt || null,
  };
}

function toDatabaseJob(body) {
  return {
    title: body.title,
    company: body.company,
    city: body.city,
    city_code: body.cityCode,
    country: body.country,
    country_code: body.countryCode,
    latitude: body.latitude,
    longitude: body.longitude,
    area: body.area,
    area_code: body.areaCode,
    contract: body.contract,
    contract_code: body.contractCode,
    salary: body.salary || "",
    description: body.description,
    requirements: body.requirements || "",
    benefits: body.benefits || "",
    languages: body.languages || "",
    language_items: body.languageItems || [],
    experience: body.experience || "",
    experience_code: body.experienceCode || "",
    contact_method: body.contactMethod || "email",
    contact: body.contact,
    is_urgent: Boolean(body.isUrgent),
    has_accommodation: Boolean(body.hasAccommodation),
  };
}

function getRecruiterPlan(user) {
  return user?.user_metadata?.plan || user?.app_metadata?.plan || "free";
}

async function buildRecruiterPlanMap(recruiterIds = []) {
  const uniqueRecruiterIds = [...new Set(recruiterIds.filter(Boolean))];

  if (uniqueRecruiterIds.length === 0) {
    return {};
  }

  const entries = await Promise.all(
    uniqueRecruiterIds.map(async (recruiterId) => {
      const { data, error } = await supabaseAdmin.auth.admin.getUserById(recruiterId);

      if (error) {
        return [recruiterId, "free"];
      }

      return [recruiterId, getRecruiterPlan(data.user)];
    })
  );

  return Object.fromEntries(entries);
}

function attachRecruiterPlanToJobs(jobs, recruiterPlanById = {}) {
  return jobs.map((job) => {
    const recruiterPlan = recruiterPlanById[job.recruiterId] || job.recruiterPlan || "free";

    return {
      ...job,
      recruiterPlan,
      isPromoted: hasPromotedPlacement(recruiterPlan),
    };
  });
}

async function countRecruiterPublishedJobs(recruiterId) {
  const { count, error } = await supabaseAdmin
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .eq("recruiter_id", recruiterId)
    .eq("status", "published");

  if (error) {
    throw error;
  }

  return count || 0;
}

function buildJobMetrics(events = []) {
  return events.reduce((metrics, event) => {
    const jobMetrics = metrics[event.job_id] || {
      views: 0,
      contactClicks: 0,
      lastAccessedAt: null,
      recentViews: 0,
      recentContactClicks: 0,
    };
    const occurredAt = event.occurred_at;
    const isRecent = new Date(occurredAt) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (event.event_type === "view") {
      jobMetrics.views += 1;
      if (isRecent) jobMetrics.recentViews += 1;
    }

    if (event.event_type === "contact_click") {
      jobMetrics.contactClicks += 1;
      if (isRecent) jobMetrics.recentContactClicks += 1;
    }

    if (!jobMetrics.lastAccessedAt || new Date(occurredAt) > new Date(jobMetrics.lastAccessedAt)) {
      jobMetrics.lastAccessedAt = occurredAt;
    }

    metrics[event.job_id] = jobMetrics;
    return metrics;
  }, {});
}

function attachMetricsToJobs(jobs, metricsByJobId) {
  return jobs.map((job) => ({
    ...job,
    ...(metricsByJobId[job.id] || {
      views: 0,
      contactClicks: 0,
      lastAccessedAt: null,
      recentViews: 0,
      recentContactClicks: 0,
    }),
  }));
}

function escapeCsvValue(value) {
  const normalized = value === null || value === undefined ? "" : String(value);
  const escaped = normalized.replace(/"/g, "\"\"");
  return /[",\n]/.test(escaped) ? `"${escaped}"` : escaped;
}

function buildRecruiterExportCsv({ user, plan, totals, jobs }) {
  const rows = [
    ["recruiter_name", user?.user_metadata?.name || ""],
    ["recruiter_email", user?.email || ""],
    ["company_name", user?.user_metadata?.companyName || ""],
    ["plan", plan],
    ["active_jobs", jobs.length],
    ["total_views", totals.views || 0],
    ["total_contact_clicks", totals.contactClicks || 0],
    ["recent_views_7d", totals.recentViews || 0],
    ["recent_contact_clicks_7d", totals.recentContactClicks || 0],
    [],
    [
      "job_id",
      "title",
      "company",
      "status",
      "published_at",
      "city",
      "country",
      "area",
      "contract",
      "salary",
      "contact_method",
      "contact",
      "is_urgent",
      "has_accommodation",
      "languages",
      "experience",
      "views",
      "contact_clicks",
      "recent_views_7d",
      "recent_contact_clicks_7d",
      "conversion_rate",
      "last_accessed_at",
      "description",
      "requirements",
      "benefits",
    ],
  ];

  jobs.forEach((job) => {
    const conversionRate = job.views > 0 ? `${Math.round((job.contactClicks / job.views) * 100)}%` : "0%";

    rows.push([
      job.id,
      job.title,
      job.company,
      "published",
      job.publishedAt || "",
      job.city,
      job.country,
      job.area,
      job.contract,
      job.salary,
      job.contactMethod,
      job.contact,
      job.isUrgent ? "yes" : "no",
      job.hasAccommodation ? "yes" : "no",
      job.languages,
      job.experience,
      job.views || 0,
      job.contactClicks || 0,
      job.recentViews || 0,
      job.recentContactClicks || 0,
      conversionRate,
      job.lastAccessedAt || "",
      job.description || "",
      job.requirements || "",
      job.benefits || "",
    ]);
  });

  return rows.map((row) => row.map(escapeCsvValue).join(",")).join("\n");
}

router.get("/", async (_request, response) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("status", "published")
    .order("published_at", { ascending: false });

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  const jobs = data.map(toClientJob);
  const recruiterPlanById = await buildRecruiterPlanMap(jobs.map((job) => job.recruiterId));
  const jobIds = jobs.map((job) => job.id);
  let metricsByJobId = {};

  if (jobIds.length > 0) {
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("job_events")
      .select("job_id,event_type,occurred_at")
      .in("job_id", jobIds);

    if (eventsError && !isMissingEventsTableError(eventsError)) {
      return response.status(500).json({ error: eventsError.message });
    }

    metricsByJobId = buildJobMetrics(events || []);
  }

  return response.json(attachRecruiterPlanToJobs(attachMetricsToJobs(jobs, metricsByJobId), recruiterPlanById));
});

router.get("/mine", requireAuth, async (request, response) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("recruiter_id", request.user.id)
    .neq("status", "archived")
    .order("published_at", { ascending: false });

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  const plan = getRecruiterPlan(request.user);
  const jobs = attachRecruiterPlanToJobs(data.map(toClientJob), { [request.user.id]: plan });
  const jobIds = jobs.map((job) => job.id);
  let metricsByJobId = {};

  if (jobIds.length > 0) {
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("job_events")
      .select("job_id,event_type,occurred_at")
      .in("job_id", jobIds);

    if (eventsError && !isMissingEventsTableError(eventsError)) {
      return response.status(500).json({ error: eventsError.message });
    }

    metricsByJobId = buildJobMetrics(events || []);
  }

  const jobsWithMetrics = attachMetricsToJobs(jobs, metricsByJobId);
  const totals = jobsWithMetrics.reduce(
    (summary, job) => ({
      views: summary.views + job.views,
      contactClicks: summary.contactClicks + job.contactClicks,
      recentViews: summary.recentViews + job.recentViews,
      recentContactClicks: summary.recentContactClicks + job.recentContactClicks,
    }),
    { views: 0, contactClicks: 0, recentViews: 0, recentContactClicks: 0 }
  );
  const jobLimit = Object.prototype.hasOwnProperty.call(PLAN_LIMITS, plan) ? PLAN_LIMITS[plan] : PLAN_LIMITS.free;

  return response.json({
    plan,
    jobLimit,
    totals,
    jobs: jobsWithMetrics,
  });
});

router.get("/mine/export.csv", requireAuth, async (request, response) => {
  const plan = getRecruiterPlan(request.user);

  if (!CSV_EXPORT_ENABLED_PLANS.has(plan)) {
    return response.status(403).json({ error: "Your current plan does not include CSV export." });
  }

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("recruiter_id", request.user.id)
    .neq("status", "archived")
    .order("published_at", { ascending: false });

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  const jobs = attachRecruiterPlanToJobs(data.map(toClientJob), { [request.user.id]: plan });

  if (jobs.length === 0) {
    return response.status(409).json({ error: "There are no jobs available to export." });
  }

  const jobIds = jobs.map((job) => job.id);
  let metricsByJobId = {};

  if (jobIds.length > 0) {
    const { data: events, error: eventsError } = await supabaseAdmin
      .from("job_events")
      .select("job_id,event_type,occurred_at")
      .in("job_id", jobIds);

    if (eventsError && !isMissingEventsTableError(eventsError)) {
      return response.status(500).json({ error: eventsError.message });
    }

    metricsByJobId = buildJobMetrics(events || []);
  }

  const jobsWithMetrics = attachMetricsToJobs(jobs, metricsByJobId);
  const totals = jobsWithMetrics.reduce(
    (summary, job) => ({
      views: summary.views + job.views,
      contactClicks: summary.contactClicks + job.contactClicks,
      recentViews: summary.recentViews + job.recentViews,
      recentContactClicks: summary.recentContactClicks + job.recentContactClicks,
    }),
    { views: 0, contactClicks: 0, recentViews: 0, recentContactClicks: 0 }
  );
  const csv = buildRecruiterExportCsv({ user: request.user, plan, totals, jobs: jobsWithMetrics });

  response.setHeader("Content-Type", "text/csv; charset=utf-8");
  response.setHeader("Content-Disposition", `attachment; filename="elmigrante-jobs-${request.user.id}.csv"`);
  return response.status(200).send(`\uFEFF${csv}`);
});

router.post("/:id/events", async (request, response) => {
  const { type } = request.body;
  const visitorId = String(request.body.visitorId || request.headers["x-visitor-id"] || "").trim();

  if (!TRACKABLE_EVENTS.has(type)) {
    return response.status(400).json({ error: "Invalid event type." });
  }

  const eventPayload = {
    job_id: request.params.id,
    event_type: type,
    visitor_id: visitorId || null,
    metadata: {
      source: request.body.source || "web",
    },
  };

  const query = supabaseAdmin
    .from("job_events")
    .insert(eventPayload);

  const { error } = visitorId
    ? await query.select("id").single()
    : await query.select("id").single();

  if (error) {
    if (error.code === "23505") {
      return response.status(204).send();
    }

    if (isMissingEventsTableError(error)) {
      return response.status(204).send();
    }

    return response.status(400).json({ error: error.message });
  }

  return response.status(204).send();
});

router.get("/:id", async (request, response) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .select("*")
    .eq("id", request.params.id)
    .single();

  if (error) {
    return response.status(404).json({ error: "Job not found." });
  }

  const recruiterPlanById = await buildRecruiterPlanMap([data.recruiter_id]);
  return response.json(attachRecruiterPlanToJobs([toClientJob(data)], recruiterPlanById)[0]);
});

router.post("/", requireAuth, async (request, response) => {
  const plan = getRecruiterPlan(request.user);

  const jobLimit = Object.prototype.hasOwnProperty.call(PLAN_LIMITS, plan) ? PLAN_LIMITS[plan] : PLAN_LIMITS.free;

  if (jobLimit !== null) {
    try {
      const publishedJobsCount = await countRecruiterPublishedJobs(request.user.id);

      if (publishedJobsCount >= jobLimit) {
        return response.status(403).json({
          error: `Your current plan can publish up to ${jobLimit} active jobs.`,
        });
      }
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }

  const payload = {
    ...toDatabaseJob(request.body),
    recruiter_id: request.user.id,
    recruiter_plan: plan,
    status: "published",
    published_at: new Date().toISOString(),
  };

  const { data, error } = await supabaseAdmin
    .from("jobs")
    .insert(payload)
    .select()
    .single();

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  return response.status(201).json(attachRecruiterPlanToJobs([toClientJob(data)], { [request.user.id]: plan })[0]);
});

router.put("/:id", requireAuth, async (request, response) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update({ ...toDatabaseJob(request.body), recruiter_plan: getRecruiterPlan(request.user) })
    .eq("id", request.params.id)
    .eq("recruiter_id", request.user.id)
    .select()
    .single();

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  return response.json(attachRecruiterPlanToJobs([toClientJob(data)], { [request.user.id]: getRecruiterPlan(request.user) })[0]);
});

router.delete("/:id", requireAuth, async (request, response) => {
  const { error } = await supabaseAdmin
    .from("jobs")
    .update({ status: "archived" })
    .eq("id", request.params.id)
    .eq("recruiter_id", request.user.id);

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  return response.status(204).send();
});

export default router;
