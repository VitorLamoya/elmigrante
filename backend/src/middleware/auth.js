import { supabase } from "../config/supabase.js";

export async function requireAuth(request, response, next) {
  const authHeader = request.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

  if (!token) {
    return response.status(401).json({ error: "Missing authorization token." });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return response.status(401).json({ error: "Invalid or expired token." });
  }

  request.user = data.user;
  return next();
}

export function requireRole(allowedRoles) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return function roleMiddleware(request, response, next) {
    const userRole = request.user?.user_metadata?.role || request.user?.app_metadata?.role || "candidate";

    if (!roles.includes(userRole)) {
      return response.status(403).json({ error: "You do not have access to this resource." });
    }

    return next();
  };
}
