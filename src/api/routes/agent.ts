import { Hono } from "hono";
import { streamText, type CoreMessage } from "ai";
import { google, SYSTEM_PROMPT } from "../agent";

export const agentRoutes = new Hono();

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
  const { messages } = await c.req.json();
  const coreMessages = uiToCoreMessages(messages);

  const result = streamText({
    model: google("gemini-2.5-flash"),
    system: SYSTEM_PROMPT,
    messages: coreMessages,
  });

  return result.toUIMessageStreamResponse();
});
