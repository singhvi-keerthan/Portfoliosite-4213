import { Hono } from "hono";
import { streamText, type CoreMessage } from "ai";
import { getGoogle, SYSTEM_PROMPT } from "../agent";
import { database } from "../database";
import { chatLogs } from "../database/schema";

export const agentRoutes = new Hono();

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT;
}

interface UIMessagePart {
  type: string;
  text?: string;
}

interface UIMsg {
  id: string;
  role: "user" | "assistant" | "system";
  parts: UIMessagePart[];
  content?: string;
}

function uiToCoreMessages(uiMessages: UIMsg[]): CoreMessage[] {
  return uiMessages.map((msg) => {
    const textContent = msg.parts
      ?.filter((p) => p.type === "text" && p.text)
      .map((p) => p.text)
      .join("") || msg.content || "";

    return {
      role: msg.role as "user" | "assistant",
      content: textContent,
    };
  });
}

agentRoutes.post("/messages", async (c) => {
  try {
    const ip = c.req.header("cf-connecting-ip") || c.req.header("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return c.json({ error: "Too many requests. Please wait a moment." }, 429);
    }

    const { messages } = await c.req.json();
    const coreMessages = uiToCoreMessages(messages);

    // Log the latest user question (non-blocking)
    const lastUserMessage = coreMessages.filter((m) => m.role === "user").pop();
    if (lastUserMessage && typeof lastUserMessage.content === "string") {
      const sessionId = c.req.header("x-session-id") || "anonymous";
      c.executionCtx.waitUntil(
        database.insert(chatLogs).values({
          question: lastUserMessage.content.slice(0, 500),
          timestamp: new Date().toISOString(),
          sessionId,
        }).catch((err) => console.error("[Alfred] Failed to log chat:", err))
      );
    }

    // Keep only the last 10 messages to prevent context window overflow
    const trimmedMessages = coreMessages.slice(-10);

    const google = await getGoogle();

    const result = streamText({
      model: google("gemini-2.5-flash"),
      system: SYSTEM_PROMPT,
      messages: trimmedMessages,
    });

    return result.toUIMessageStreamResponse();
  } catch (err) {
    console.error("[Alfred] Agent error:", err);
    const message =
      err instanceof Error ? err.message : "An unexpected error occurred";
    return c.json({ error: message }, 500);
  }
});
