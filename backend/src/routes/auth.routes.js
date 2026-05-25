import { Router } from "express";
import { supabase, supabaseAdmin } from "../config/supabase.js";

const router = Router();

router.post("/register", async (request, response) => {
  const { email, password, role = "candidate", name = "", companyName = "", companySize = "" } = request.body;

  if (!email || !password || !name || !companyName || !companySize) {
    return response.status(400).json({ error: "Name, company, company size, email and password are required." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const { data: existingUsers, error: existingUsersError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  });

  if (existingUsersError) {
    return response.status(500).json({ error: existingUsersError.message });
  }

  const emailExists = existingUsers.users.some((user) => user.email?.toLowerCase() === normalizedEmail);

  if (emailExists) {
    return response.status(409).json({ error: "This email is already registered." });
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password,
    options: {
      data: { role, name, companyName, companySize, plan: "free" },
    },
  });

  if (error) {
    return response.status(400).json({ error: error.message });
  }

  if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) {
    return response.status(409).json({ error: "This email is already registered." });
  }

  return response.status(201).json(data);
});

router.post("/login", async (request, response) => {
  const { email, password } = request.body;

  if (!email || !password) {
    return response.status(400).json({ error: "Email and password are required." });
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return response.status(401).json({ error: error.message });
  }

  return response.json(data);
});

export default router;
