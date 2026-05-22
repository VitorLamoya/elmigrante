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
const TRACKABLE_EVENTS = new Set(["view", "contact_click"]);

function isMissingEventsTableError(error) {
  return error?.code === "42P01" || /job_events|visitor_id|schema cache/i.test(error?.message || "");
}

function toClientJob(row) {
  return {
    id: row.id,
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

  return response.json(attachMetricsToJobs(jobs, metricsByJobId));
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

  const jobs = data.map(toClientJob);
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
  const plan = getRecruiterPlan(request.user);
  const jobLimit = Object.prototype.hasOwnProperty.call(PLAN_LIMITS, plan) ? PLAN_LIMITS[plan] : PLAN_LIMITS.free;

  return response.json({
    plan,
    jobLimit,
    totals,
    jobs: jobsWithMetrics,
  });
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

  return response.json(toClientJob(data));
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

  return response.status(201).json(toClientJob(data));
});

router.put("/:id", requireAuth, async (request, response) => {
  const { data, error } = await supabaseAdmin
    .from("jobs")
    .update(toDatabaseJob(request.body))
    .eq("id", request.params.id)
    .eq("recruiter_id", request.user.id)
    .select()
    .single();

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  return response.json(toClientJob(data));
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
