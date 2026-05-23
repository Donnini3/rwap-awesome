import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SHARED_EMAIL = "staff@keepitreet.local";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { passcode } = await req.json().catch(() => ({}));
    const expected = Deno.env.get("STAFF_PASSCODE");

    if (!expected) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (typeof passcode !== "string" || passcode.length === 0 || passcode.length > 200) {
      return new Response(JSON.stringify({ error: "Invalid passcode" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (passcode !== expected) {
      // Small delay to slow brute force
      await new Promise((r) => setTimeout(r, 400));
      return new Response(JSON.stringify({ error: "Incorrect passcode" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } },
    );

    // Ensure shared user exists with current passcode as password
    const { data: list, error: listErr } = await admin.auth.admin.listUsers();
    if (listErr) throw listErr;
    const existing = list.users.find((u) => u.email === SHARED_EMAIL);

    if (!existing) {
      const { error: createErr } = await admin.auth.admin.createUser({
        email: SHARED_EMAIL,
        password: passcode,
        email_confirm: true,
      });
      if (createErr) throw createErr;
    } else {
      // Keep password in sync with the current secret (rotations)
      await admin.auth.admin.updateUserById(existing.id, { password: passcode });
    }

    return new Response(JSON.stringify({ email: SHARED_EMAIL, password: passcode }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("staff-login error", e);
    return new Response(JSON.stringify({ error: "Login failed" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
