import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function buildUnsubscribeHtml(email: string): string {
  return `<h1>Successfully Unsubscribed</h1><p>The email ${email} has been removed from our marketing list.</p>`;
}

export async function listSuppression(): Promise<string[]> {
  const rows = await prisma.emailSuppression.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map((row) => row.email);
}

export async function unsubscribeEmail(
  email: string,
): Promise<string[]> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Email missing");
  }

  await prisma.emailSuppression.upsert({
    where: { email: normalizedEmail },
    update: {},
    create: { email: normalizedEmail },
  });

  return listSuppression();
}

export async function toggleSuppressionEmail(
  email: string,
): Promise<string[]> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail) {
    throw new Error("Email missing");
  }

  const existing = await prisma.emailSuppression.findUnique({
    where: { email: normalizedEmail },
  });

  if (existing) {
    await prisma.emailSuppression.delete({
      where: { email: normalizedEmail },
    });
  } else {
    await prisma.emailSuppression.create({
      data: { email: normalizedEmail },
    });
  }

  return listSuppression();
}
