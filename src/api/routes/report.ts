import { Hono } from "hono";
import { env } from "cloudflare:workers";
import { eq } from "drizzle-orm";
import { database } from "../database";
import { errorReports } from "../database/schema";

export const reportRoutes = new Hono();

interface ReportBody {
  errorMessage: string;
  userMessage?: string;
  userAgent?: string;
}

reportRoutes.post("/", async (c) => {
  try {
    const body = await c.req.json<ReportBody>();
    const timestamp = new Date().toISOString();

    // 1. Store in D1
    await database.insert(errorReports).values({
      errorMessage: body.errorMessage || "Unknown error",
      userMessage: body.userMessage || null,
      timestamp,
      userAgent: body.userAgent || null,
      emailSent: false,
    });

    // 2. Send email via Resend REST API
    let emailSent = false;
    try {
      const resendKey = env.RESEND_API_KEY;
      if (resendKey) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Alfred Bot <onboarding@resend.dev>",
            to: ["singhvikeerthan03@gmail.com"],
            subject: "[Alfred] Chat Error Report",
            html: `
              <h2>Alfred Chat Error Report</h2>
              <p><strong>Time:</strong> ${timestamp}</p>
              <p><strong>Error:</strong> ${body.errorMessage || "Unknown error"}</p>
              <p><strong>Last user message:</strong> ${body.userMessage || "N/A"}</p>
              <p><strong>User agent:</strong> ${body.userAgent || "N/A"}</p>
            `,
          }),
        });
        emailSent = res.ok;
      }
    } catch (emailErr) {
      console.error("[Alfred] Failed to send error report email:", emailErr);
    }

    // 3. Update D1 record with email status
    if (emailSent) {
      await database
        .update(errorReports)
        .set({ emailSent: true })
        .where(eq(errorReports.timestamp, timestamp));
    }

    return c.json({ success: true, emailSent });
  } catch (err) {
    console.error("[Alfred] Report submission error:", err);
    return c.json({ error: "Failed to submit report" }, 500);
  }
});
