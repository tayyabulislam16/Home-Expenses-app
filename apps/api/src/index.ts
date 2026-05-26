import { Hono } from "hono";
import { cors } from "hono/cors";
import { z } from "zod";
import { createAuth } from "./auth";

type Variables = {
  user: { id: string; email: string };
  session: { id: string };
};

const app = new Hono<{ Bindings: Env; Variables: Variables }>();

app.use("*", async (c, next) => {
  return cors({
    origin: c.env.WEB_ORIGIN,
    credentials: true,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  })(c, next);
});

// Better Auth mounts all /api/auth/* routes (sign-in, sign-up, OAuth callbacks, sessions)
app.on(["GET", "POST"], "/api/auth/*", (c) => {
  const auth = createAuth(c.env);
  return auth.handler(c.req.raw);
});

// Require an authenticated session for everything below
app.use("/api/*", async (c, next) => {
  if (c.req.path.startsWith("/api/auth/")) return next();
  const auth = createAuth(c.env);
  const session = await auth.api.getSession({ headers: c.req.raw.headers });
  if (!session) return c.json({ error: "unauthorized" }, 401);
  c.set("user", { id: session.user.id, email: session.user.email });
  c.set("session", { id: session.session.id });
  return next();
});

app.get("/api/me", (c) => c.json({ user: c.get("user") }));

// -------- Categories --------
app.get("/api/categories", async (c) => {
  const { results } = await c.env.DB.prepare(
    "SELECT id, name, icon, color FROM category WHERE userId = ? ORDER BY name"
  )
    .bind(c.get("user").id)
    .all();
  return c.json({ categories: results });
});

app.post("/api/categories", async (c) => {
  const body = await c.req.json();
  const parsed = z
    .object({
      name: z.string().min(1).max(60),
      icon: z.string().max(40).optional(),
      color: z.string().max(20).optional(),
    })
    .parse(body);
  const id = crypto.randomUUID();
  await c.env.DB.prepare(
    "INSERT INTO category (id, userId, name, icon, color, createdAt) VALUES (?, ?, ?, ?, ?, ?)"
  )
    .bind(id, c.get("user").id, parsed.name, parsed.icon ?? null, parsed.color ?? null, Date.now())
    .run();
  return c.json({ id }, 201);
});

// -------- Expenses --------
const expenseInput = z.object({
  amountCents: z.number().int().positive(),
  currency: z.string().length(3).default("USD"),
  categoryId: z.string().nullable().optional(),
  note: z.string().max(500).optional(),
  occurredAt: z.number().int().positive(),
  receiptKey: z.string().optional(),
});

app.get("/api/expenses", async (c) => {
  const limit = Math.min(Number(c.req.query("limit") ?? 50), 200);
  const { results } = await c.env.DB.prepare(
    `SELECT e.id, e.amountCents, e.currency, e.note, e.occurredAt, e.receiptKey,
            c.id AS categoryId, c.name AS categoryName, c.icon AS categoryIcon, c.color AS categoryColor
       FROM expense e
       LEFT JOIN category c ON c.id = e.categoryId
      WHERE e.userId = ?
      ORDER BY e.occurredAt DESC
      LIMIT ?`
  )
    .bind(c.get("user").id, limit)
    .all();
  return c.json({ expenses: results });
});

app.post("/api/expenses", async (c) => {
  const body = await c.req.json();
  const parsed = expenseInput.parse(body);
  const id = crypto.randomUUID();
  const now = Date.now();
  await c.env.DB.prepare(
    `INSERT INTO expense (id, userId, categoryId, amountCents, currency, note, occurredAt, receiptKey, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  )
    .bind(
      id,
      c.get("user").id,
      parsed.categoryId ?? null,
      parsed.amountCents,
      parsed.currency,
      parsed.note ?? null,
      parsed.occurredAt,
      parsed.receiptKey ?? null,
      now,
      now,
    )
    .run();
  return c.json({ id }, 201);
});

app.patch("/api/expenses/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const parsed = expenseInput.partial().parse(body);
  const fields: string[] = [];
  const values: unknown[] = [];
  for (const [key, value] of Object.entries(parsed)) {
    fields.push(`${key} = ?`);
    values.push(value);
  }
  if (fields.length === 0) return c.json({ ok: true });
  fields.push("updatedAt = ?");
  values.push(Date.now());
  values.push(id, c.get("user").id);
  await c.env.DB.prepare(
    `UPDATE expense SET ${fields.join(", ")} WHERE id = ? AND userId = ?`
  )
    .bind(...values)
    .run();
  return c.json({ ok: true });
});

app.delete("/api/expenses/:id", async (c) => {
  await c.env.DB.prepare("DELETE FROM expense WHERE id = ? AND userId = ?")
    .bind(c.req.param("id"), c.get("user").id)
    .run();
  return c.json({ ok: true });
});

// -------- Receipts (R2) --------
app.post("/api/receipts", async (c) => {
  const contentType = c.req.header("content-type") ?? "application/octet-stream";
  const key = `${c.get("user").id}/${crypto.randomUUID()}`;
  const body = await c.req.arrayBuffer();
  await c.env.RECEIPTS.put(key, body, { httpMetadata: { contentType } });
  return c.json({ key }, 201);
});

app.get("/api/receipts/:key{.+}", async (c) => {
  const key = c.req.param("key");
  if (!key.startsWith(c.get("user").id + "/")) {
    return c.json({ error: "forbidden" }, 403);
  }
  const obj = await c.env.RECEIPTS.get(key);
  if (!obj) return c.json({ error: "not found" }, 404);
  return new Response(obj.body, {
    headers: { "content-type": obj.httpMetadata?.contentType ?? "application/octet-stream" },
  });
});

app.get("/", (c) => c.text("home-expense-api ok"));

export default app;
