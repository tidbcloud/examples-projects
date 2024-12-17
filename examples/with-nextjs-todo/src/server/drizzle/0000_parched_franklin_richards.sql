CREATE TABLE `todo` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` text NOT NULL,
	`completed` boolean NOT NULL DEFAULT false,
	`created_at` timestamp DEFAULT (now()),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `todo_id` PRIMARY KEY(`id`)
);
