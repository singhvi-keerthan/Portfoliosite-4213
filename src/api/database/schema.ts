import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const errorReports = sqliteTable("error_reports", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  errorMessage: text("error_message").notNull(),
  userMessage: text("user_message"),
  timestamp: text("timestamp").notNull(),
  userAgent: text("user_agent"),
  emailSent: integer("email_sent", { mode: "boolean" }).notNull().default(false),
});

export const chatLogs = sqliteTable("chat_logs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  question: text("question").notNull(),
  timestamp: text("timestamp").notNull(),
  sessionId: text("session_id"),
});
