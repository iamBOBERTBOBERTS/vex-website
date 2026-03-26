import { randomUUID } from "node:crypto";
import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { RegisterInput, LoginInput, RefreshTokenInput } from "@vex/shared";
import { basePrisma } from "../lib/tenant.js";
import { sendLifecycleNotification } from "../lib/notify.js";
import { denylistJti, newRefreshToken, storeRefreshToken, consumeRefreshToken } from "../lib/tokenStore.js";

const _jwtSecret = process.env.JWT_SECRET;
if (!_jwtSecret) {
  throw new Error("JWT_SECRET environment variable is required — refusing to start without it");
}
const JWT_SECRET: string = _jwtSecret;

const accessTtlSec = () => Number(process.env.JWT_ACCESS_TTL_MINUTES || 5) * 60;
const refreshTtlSec = 60 * 60 * 24 * 7;

function toPublicUser(user: {
  id: string;
  tenantId: string;
  email: string;
  role: string;
  name: string | null;
  phone: string | null;
  tier: string | null;
  createdAt: Date;
  updatedAt: Date;
}) {
  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    role: user.role,
    name: user.name,
    phone: user.phone,
    tier: user.tier,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

function signAccessToken(payload: { userId: string; email: string; role: string; tenantId: string }) {
  const jti = randomUUID();
  const token = jwt.sign({ ...payload, jti }, JWT_SECRET, { expiresIn: accessTtlSec() });
  return { token, jti, expiresIn: accessTtlSec() };
}

async function issueSession(user: { id: string; email: string; role: string; tenantId: string }) {
  const { token, expiresIn } = signAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    tenantId: user.tenantId,
  });
  const refreshToken = newRefreshToken();
  await storeRefreshToken(
    refreshToken,
    { userId: user.id, email: user.email, role: user.role, tenantId: user.tenantId },
    refreshTtlSec
  );
  return { token, refreshToken, expiresIn };
}

export async function register(req: Request, res: Response) {
  const { email, password, name } = req.body as RegisterInput;

  const existing = await basePrisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ code: "CONFLICT", message: "Email already registered" });
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const tenant = await basePrisma.tenant.create({
    data: { name: `Tenant ${email}` },
  });
  const user = await basePrisma.user.create({
    data: { tenantId: tenant.id, email, passwordHash, name: name || null, role: "CUSTOMER" },
  });

  const session = await issueSession(user);
  void sendLifecycleNotification({
    type: "WELCOME",
    toEmail: user.email,
    smsTo: user.phone ?? undefined,
    subject: "Welcome to Vex",
    message: `Welcome to Vex, ${user.name ?? user.email}. Your dealer workspace is ready.`,
  });
  return res.status(201).json({ user: toPublicUser(user), ...session });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body as LoginInput;

  const user = await basePrisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid email or password" });
  }

  const session = await issueSession(user);
  return res.json({ user: toPublicUser(user), ...session });
}

export async function refresh(req: Request, res: Response) {
  const { refreshToken } = req.body as RefreshTokenInput;
  const payload = await consumeRefreshToken(refreshToken);
  if (!payload) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid refresh token" });
  }

  const user = await basePrisma.user.findUnique({ where: { id: payload.userId } });
  if (!user || user.email !== payload.email) {
    return res.status(401).json({ code: "UNAUTHORIZED", message: "Invalid refresh token" });
  }

  const session = await issueSession(user);
  return res.json({ user: toPublicUser(user), ...session });
}

export async function logout(req: Request, res: Response) {
  const jti = req.user?.jti;
  if (jti) {
    await denylistJti(jti, accessTtlSec() + 120);
  }
  return res.json({ data: { ok: true }, error: null });
}

export async function me(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });

  const user = await basePrisma.user.findUnique({ where: { id: req.user.userId } });
  if (!user) return res.status(404).json({ code: "NOT_FOUND", message: "User not found" });

  return res.json(toPublicUser(user));
}

/** Mark tenant onboarding wizard complete (first-login flow). */
export async function completeOnboarding(req: Request, res: Response) {
  if (!req.user) return res.status(401).json({ code: "UNAUTHORIZED", message: "Not authenticated" });

  await basePrisma.tenant.updateMany({
    where: { id: req.user.tenantId },
    data: { onboardedAt: new Date() },
  });

  const meUser = await basePrisma.user.findUnique({ where: { id: req.user.userId }, select: { email: true, phone: true } });
  if (meUser?.email) {
    void sendLifecycleNotification({
      type: "ONBOARDING_COMPLETE",
      toEmail: meUser.email,
      smsTo: meUser.phone ?? undefined,
      subject: "Onboarding complete",
      message: "Your Vex workspace onboarding is complete. You can now activate pilots and invite staff.",
    });
  }

  return res.json({ data: { ok: true }, error: null });
}
