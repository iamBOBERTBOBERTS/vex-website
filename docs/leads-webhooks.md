# Routing leads into the CRM

Leads can reach the CRM in three ways.

---

## 1. Add lead manually (immediate)

When you receive a text or email:

1. Open **CRM → Leads**.
2. Click **Add lead**.
3. Choose **Source** (SMS / Text, Email, Phone, Website, Other).
4. Enter name, email, phone, vehicle interest, and paste the message into **Notes**.
5. Click **Create lead**.

The lead is created and assigned to you, and appears in the Leads list.

---

## 2. SMS → CRM (Twilio)

Inbound SMS can create leads automatically.

1. **Twilio**: Buy a number and open **Phone Numbers → Manage → Active Numbers → [your number]**.
2. Under **Messaging**, set **Configure with**: Webhooks.
3. **A MESSAGE COMES IN**: set to:
  - **Webhook**: `https://YOUR_API_URL/webhooks/sms`
  - **HTTP**: POST
4. If you set `WEBHOOK_SECRET` in the API `.env`, add it so Twilio sends it:
  - Either send a custom header `X-Webhook-Secret: your-secret` (requires Twilio Function or custom handler), or
  - Use the query form: `https://YOUR_API_URL/webhooks/sms?secret=YOUR_WEBHOOK_SECRET`  
   (Twilio will append to the URL when configured; you can store the full URL in Twilio.)
5. Save. When someone texts your Twilio number, the API creates a lead with **Source** = SMS, **Phone** = sender, **Notes** = message body.

---

## 3. Email → CRM (SendGrid Inbound Parse or similar)

Inbound email can create leads automatically.

1. **SendGrid**: **Settings → Inbound Parse** (or use Mailgun / another provider with inbound webhooks).
2. Add a host and set the **Destination URL** to:
  - `https://YOUR_API_URL/webhooks/email`
3. If you use `WEBHOOK_SECRET`, configure the provider to send header `X-Webhook-Secret: your-secret` or use `?secret=your-secret` in the URL if the provider supports it.
4. The API expects a JSON body with at least one of:
  - `from` (sender email)
  - `subject`
  - `text` or `body` (plain body)

SendGrid Inbound Parse sends a multipart form; you may need a small adapter (e.g. serverless function) that maps their payload to a POST to your API with `{ from, subject, text }`. Alternatively, use a provider that can POST JSON to your URL.

---

## Security

- Set **WEBHOOK_SECRET** in `apps/api/.env` so only your provider (or your adapter) can call the webhooks. Then send it as the **X-Webhook-Secret** header or as the **secret** query parameter.
- If you don’t set `WEBHOOK_SECRET`, anyone who knows the URL can create leads (fine for testing; lock it down for production).