CREATE TABLE `error_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`error_message` text NOT NULL,
	`user_message` text,
	`timestamp` text NOT NULL,
	`user_agent` text,
	`email_sent` integer DEFAULT false NOT NULL
);
