CREATE TABLE `chat_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`timestamp` text NOT NULL,
	`session_id` text
);
