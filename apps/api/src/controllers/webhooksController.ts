import { Request, Response } from "express";
import { systemPrisma } from "../lib/tenant.js";

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;
const WEBHOOK_TENANT_ID = process.env.WEBHOOK_TENANT_ID;

async function resolveWebhookTenantId(): Promise<string | null> {
  if (WEBHOOK_TENANT_ID) return WEBHOOK_TENANT_ID;
  const first = await systemPrisma.tenant.findFirst({ select: { id: true } });
  return first?.id ?? null;
}

function checkSecret(req: Request, res: Response): boolean {
  if (!WEBHOOK_SECRET) {
    res.status(503).json({ code: "NOT_CONFIGURED", message: "WEBHOOK_SECRET is not set — webhooks are disabled" });
    return false;
  }
  const secret = req.headers["x-webhook-secret"] || req.query.secret;
  if (secret !== WEBHOOK_SECRET) {
    res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid webhook secret" });
    return false;
  }
  return true;
}

/**
 * Twilio inbound SMS: form body with From, To, Body.
 * SendGrid Inbound Parse / Mailgun: often JSON with from, subject, text/html.
 */
export async function sms(req: Request, res: Response) {
  if (!checkSecret(req, res)) return;

  const body = req.body as Record<string, string>;
  const from = body.From ?? body.from ?? "";
  const messageBody = body.Body ?? body.body ?? body.Message ?? "";

  if (!from && !messageBody) {
    return res.status(400).json({ code: "BAD_REQUEST", message: "Missing From and Body" });
  }

  const tenantId = await resolveWebhookTenantId();
  if (!tenantId) return res.status(503).json({ code: "NOT_CONFIGURED", message: "No tenant available for webhook leads" });

  const lead = await systemPrisma.lead.create({
    data: {
      tenantId,
      source: "SMS",
      phone: from || null,
      notes: messageBody || null,
    },
  });

  return res.status(201).json({ ok: true, leadId: lead.id });
}

/**
 * Inbound email webhook. Expects JSON: { from, subject, text } or form equivalents.
 */
export async function email(req: Request, res: Response) {
  if (!checkSecret(req, res)) return;

  const body = req.body as Record<string, string>;
  const from = body.from ?? body.From ?? body.sender ?? "";
  const subject = body.subject ?? body.Subject ?? "";
  const text = body.text ?? body.body ?? body["body-plain"] ?? body.Text ?? "";

  if (!from && !text) {
    return res.status(400).json({ code: "BAD_REQUEST", message: "Missing from and body" });
  }

  const notes = [subject, text].filter(Boolean).join("\n\n");

  const tenantId = await resolveWebhookTenantId();
  if (!tenantId) return res.status(503).json({ code: "NOT_CONFIGURED", message: "No tenant available for webhook leads" });

  const lead = await systemPrisma.lead.create({
    data: {
      tenantId,
      source: "EMAIL",
      email: from || null,
      notes: notes || null,
    },
  });

  return res.status(201).json({ ok: true, leadId: lead.id });
}
