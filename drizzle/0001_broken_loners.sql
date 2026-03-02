CREATE TABLE `communityAnswers` (
	`id` int AUTO_INCREMENT NOT NULL,
	`postId` int NOT NULL,
	`authorId` int NOT NULL,
	`content` text NOT NULL,
	`upvotes` int NOT NULL DEFAULT 0,
	`isAccepted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityAnswers_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `communityPosts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`authorId` int NOT NULL,
	`title` varchar(500) NOT NULL,
	`content` text NOT NULL,
	`tags` json,
	`upvotes` int NOT NULL DEFAULT 0,
	`isResolved` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `communityPosts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`appRole` enum('student','mentor') NOT NULL,
	`fullName` varchar(255),
	`bio` text,
	`avatarUrl` text,
	`fieldOfInterest` varchar(255),
	`skills` json,
	`careerGoals` text,
	`graduationYear` int,
	`educationStatus` varchar(100),
	`jobTitle` varchar(255),
	`company` varchar(255),
	`industry` varchar(255),
	`location` varchar(255),
	`yearsExperience` int,
	`mentoringAreas` json,
	`availabilityPreference` varchar(100),
	`openToStudents` boolean DEFAULT true,
	`isVerified` boolean DEFAULT false,
	`onboardingCompleted` boolean DEFAULT false,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `profiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`mentorId` int NOT NULL,
	`studentId` int NOT NULL,
	`title` varchar(255),
	`description` text,
	`status` enum('pending','accepted','declined','cancelled') NOT NULL DEFAULT 'pending',
	`scheduledAt` timestamp,
	`durationMinutes` int DEFAULT 60,
	`meetingLink` text,
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`)
);
