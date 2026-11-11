import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BASES: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  mistral: "https://api.mistral.ai/v1",
  zai: "https://api.z.ai/api/paas/v4",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });
}

function firstKey(name: string): string | undefined {
  const raw = Deno.env.get(name);
  if (!raw) return undefined;
  try {
    const o = JSON.parse(raw);
    if (typeof o === "string") return o;
    const v = o.default ?? Object.values(o)[0];
    return typeof v === "string" ? v : undefined;
  } catch {
    return raw.startsWith("sb_") ? raw : undefined;
  }
}

type Payload = { model: string; max_tokens: number; system: string; messages: { role: string; content: unknown }[]; tools?: { name: string; description?: string; input_schema: unknown }[] };
type Result = { ok: boolean; data?: unknown; error?: string; usage?: { input_tokens?: number; output_tokens?: number } };

async function callAnthropic(key: string, p: Payload): Promise<Result> {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify(p),
  });
  const out = await r.json();
  if (!r.ok) return { ok: false, error: out?.error?.message ?? "anthropic" };
  return { ok: true, data: out, usage: out?.usage };
}

async function callOpenAICompatible(provider: string, base: string, key: string, p: Payload): Promise<Result> {
  const tool = p.tools?.[0];
  const messages = [
    { role: "system", content: p.system },
    ...p.messages.map((m) => ({ role: m.role === "assistant" ? "assistant" : "user", content: typeof m.content === "string" ? m.content : JSON.stringify(m.content) })),
  ];
  const body: Record<string, unknown> = { model: p.model, messages };
  if (provider === "openai") body.max_completion_tokens = p.max_tokens;
  else body.max_tokens = p.max_tokens;
  if (tool) {
    body.tools = [{ type: "function", function: { name: tool.name, description: tool.description ?? "", parameters: tool.input_schema } }];
    body.tool_choice = Deno.env.get("NIA_TOOL_CHOICE") === "auto" || provider === "zai" ? "auto" : { type: "function", function: { name: tool.name } };
  }
  const send = () => fetch(base.replace(/\/$/, "") + "/chat/completions", {
    method: "POST",
    headers: { Authorization: "Bearer " + key, "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  let r = await send();
  if (r.status === 400 && body.tool_choice && typeof body.tool_choice === "object") {
    await r.body?.cancel();
    body.tool_choice = "auto";
    r = await send();
  }
  const out = await r.json();
  if (!r.ok) return { ok: false, error: out?.error?.message ?? out?.message ?? provider };
  const msg = out?.choices?.[0]?.message ?? {};
  const content: unknown[] = [];
  const call = msg.tool_calls?.[0];
  if (call) {
    let input: unknown = {};
    try { input = typeof call.function.arguments === "string" ? JSON.parse(call.function.arguments) : call.function.arguments; } catch { input = {}; }
    content.push({ type: "tool_use", name: call.function.name, input });
  }
  if (typeof msg.content === "string" && msg.content) content.push({ type: "text", text: msg.content });
  const usage = { input_tokens: out?.usage?.prompt_tokens, output_tokens: out?.usage?.completion_tokens };
  return { ok: true, data: { content, usage }, usage };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return json({ error: "method" }, 405);
  try {
    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = firstKey("SUPABASE_PUBLISHABLE_KEYS") ?? Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = firstKey("SUPABASE_SECRET_KEYS") ?? Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const provider = (Deno.env.get("NIA_PROVIDER") ?? "anthropic").toLowerCase();
    const key = Deno.env.get("NIA_API_KEY") ??
      (provider === "anthropic" ? Deno.env.get("ANTHROPIC_API_KEY") : provider === "openai" ? Deno.env.get("OPENAI_API_KEY") : provider === "mistral" ? Deno.env.get("MISTRAL_API_KEY") : provider === "zai" ? Deno.env.get("ZAI_API_KEY") : undefined);
    if (!key) return json({ error: "server key missing" }, 500);
    const model = Deno.env.get("NIA_MODEL") ?? (provider === "anthropic" ? "claude-sonnet-5-5" : "");
    if (!model) return json({ error: "NIA_MODEL missing" }, 500);

    const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "");
    if (!token) return json({ error: "auth" }, 401);
    const userClient = createClient(url, anon, { auth: { persistSession: false } });
    const { data: { user } } = await userClient.auth.getUser(token);
    if (!user) return json({ error: "auth" }, 401);

    const admin = createClient(url, service, { auth: { persistSession: false } });
    const { data: row } = await admin.from("anza_state").select("plan").eq("user_id", user.id).maybeSingle();
    const allowed = (Deno.env.get("NIA_PLANS") ?? "magasin").split(",").map((s) => s.trim());
    if (!row || !allowed.includes(row.plan)) return json({ error: "plan" }, 403);

    const limit = Number(Deno.env.get("NIA_DAILY_LIMIT") ?? "150");
    const since = new Date(Date.now() - 86400000).toISOString();
    const { count } = await admin.from("ai_usage").select("id", { count: "exact", head: true }).eq("user_id", user.id).gte("created_at", since);
    if ((count ?? 0) >= limit) return json({ error: "limit" }, 429);

    const body = await req.json();
    const messages = Array.isArray(body.messages) ? body.messages.slice(-40) : [];
    if (!messages.length) return json({ error: "messages" }, 400);
    const payload: Payload = {
      model,
      max_tokens: Math.min(Number(body.max_tokens) || 3000, 8000),
      system: String(body.system ?? "").slice(0, 60000),
      messages,
    };
    if (Array.isArray(body.tools)) payload.tools = body.tools.slice(0, 4);

    const res = provider === "anthropic"
      ? await callAnthropic(key, payload)
      : await callOpenAICompatible(provider, Deno.env.get("NIA_BASE_URL") ?? BASES[provider] ?? "", key, payload);

    await admin.from("ai_usage").insert({
      user_id: user.id,
      task: String(body.task ?? "").slice(0, 40),
      input_tokens: res.usage?.input_tokens ?? null,
      output_tokens: res.usage?.output_tokens ?? null,
      ok: res.ok,
    });
    if (!res.ok) return json({ error: res.error ?? "provider" }, 502);
    return json(res.data);
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});
