import { Router } from "express";
import { supabaseAdmin } from "../config/supabase.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();
const LIST_TYPES = new Set(["favorite", "apply_later"]);

function hasPromotedPlacement(plan) {
  return plan === "business" || plan === "enterprise";
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
    status: row.status,
  };
}

async function loadCandidateSavedJobs(userId) {
  const { data, error } = await supabaseAdmin
    .from("user_job_lists")
    .select("list_type, created_at, jobs(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const favorites = [];
  const applyLater = [];

  (data || []).forEach((row) => {
    if (!row.jobs) {
      return;
    }

    const item = {
      ...toClientJob(row.jobs),
      savedAt: row.created_at,
    };

    if (row.list_type === "favorite") {
      favorites.push(item);
    }

    if (row.list_type === "apply_later") {
      applyLater.push(item);
    }
  });

  return { favorites, applyLater };
}

router.get("/dashboard", requireAuth, requireRole("candidate"), async (request, response) => {
  try {
    const savedJobs = await loadCandidateSavedJobs(request.user.id);

    return response.json({
      user: {
        id: request.user.id,
        name: request.user.user_metadata?.name || "",
        email: request.user.email || "",
      },
      ...savedJobs,
    });
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
});

router.get("/saved-jobs", requireAuth, requireRole("candidate"), async (request, response) => {
  try {
    return response.json(await loadCandidateSavedJobs(request.user.id));
  } catch (error) {
    return response.status(500).json({ error: error.message });
  }
});

router.get("/saved-jobs/status", requireAuth, requireRole("candidate"), async (request, response) => {
  const jobIds = String(request.query.jobIds || "")
    .split(",")
    .map((jobId) => jobId.trim())
    .filter(Boolean);

  if (jobIds.length === 0) {
    return response.json({});
  }

  const { data, error } = await supabaseAdmin
    .from("user_job_lists")
    .select("job_id, list_type")
    .eq("user_id", request.user.id)
    .in("job_id", jobIds);

  if (error) {
    return response.status(500).json({ error: error.message });
  }

  const statusByJobId = {};

  jobIds.forEach((jobId) => {
    statusByJobId[jobId] = { favorite: false, applyLater: false };
  });

  (data || []).forEach((row) => {
    if (!statusByJobId[row.job_id]) {
      statusByJobId[row.job_id] = { favorite: false, applyLater: false };
    }

    if (row.list_type === "favorite") {
      statusByJobId[row.job_id].favorite = true;
    }

    if (row.list_type === "apply_later") {
      statusByJobId[row.job_id].applyLater = true;
    }
  });

  return response.json(statusByJobId);
});

router.post("/saved-jobs/:jobId", requireAuth, requireRole("candidate"), async (request, response) => {
  const listType = request.body.listType;

  if (!LIST_TYPES.has(listType)) {
    return response.status(400).json({ error: "Invalid saved job list type." });
  }

  const { data: job, error: jobError } = await supabaseAdmin
    .from("jobs")
    .select("id")
    .eq("id", request.params.jobId)
    .eq("status", "published")
    .maybeSingle();

  if (jobError) {
    return response.status(500).json({ error: jobError.message });
  }

  if (!job) {
    return response.status(404).json({ error: "Job not found." });
  }

  const { error } = await supabaseAdmin
    .from("user_job_lists")
    .upsert({
      user_id: request.user.id,
      job_id: request.params.jobId,
      list_type: listType,
    }, { onConflict: "user_id,job_id,list_type" });

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  return response.status(201).json({ success: true });
});

router.delete("/saved-jobs/:jobId", requireAuth, requireRole("candidate"), async (request, response) => {
  const listType = request.query.listType;

  if (!LIST_TYPES.has(listType)) {
    return response.status(400).json({ error: "Invalid saved job list type." });
  }

  const { error } = await supabaseAdmin
    .from("user_job_lists")
    .delete()
    .eq("user_id", request.user.id)
    .eq("job_id", request.params.jobId)
    .eq("list_type", listType);

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  return response.status(204).send();
});

export default router;
