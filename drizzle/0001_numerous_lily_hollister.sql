CREATE TABLE `fichas_avaliacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`avaliadoId` int NOT NULL,
	`avaliadoNome` varchar(255) NOT NULL,
	`avaliadorId` int NOT NULL,
	`avaliadorNome` varchar(255) NOT NULL,
	`orgaoAtc` varchar(255) NOT NULL,
	`localAvaliacao` varchar(255) NOT NULL,
	`dataAvaliacao` timestamp NOT NULL,
	`finalidade` enum('Final','Estágio') NOT NULL,
	`licenca` varchar(100),
	`condicoesCenario` text,
	`tempoPosicaoControle` int DEFAULT 0,
	`tempoPosicaoAssistente` int DEFAULT 0,
	`rendimento` varchar(20),
	`comentarios` text,
	`status` enum('rascunho','finalizada','aprovada','reprovada') NOT NULL DEFAULT 'rascunho',
	`assinadoPorAvaliado` int DEFAULT 0,
	`assinadoPorAvaliador` int DEFAULT 0,
	`assinadoPorChefe` int DEFAULT 0,
	`chefeOrgaoId` int,
	`chefeOrgaoNome` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `fichas_avaliacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `historico_alteracoes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fichaId` int NOT NULL,
	`usuarioId` int NOT NULL,
	`usuarioNome` varchar(255) NOT NULL,
	`acao` varchar(50) NOT NULL,
	`descricao` text,
	`dataHora` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historico_alteracoes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `itens_avaliacao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`fichaId` int NOT NULL,
	`area` varchar(1) NOT NULL,
	`areaNome` varchar(255) NOT NULL,
	`subitem` varchar(255) NOT NULL,
	`conceito` enum('O','B','R','NS','NA'),
	`observacoes` text,
	`ordem` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `itens_avaliacao_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `relatorios` (
	`id` int AUTO_INCREMENT NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`tipo` varchar(100) NOT NULL,
	`criadoPorId` int NOT NULL,
	`criadoPorNome` varchar(255) NOT NULL,
	`parametros` text,
	`resultado` text,
	`dataGeracao` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `relatorios_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('aluno','instrutor','coordenador','gerente','administrador') NOT NULL DEFAULT 'aluno';--> statement-breakpoint
ALTER TABLE `users` ADD `unidade` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `orgaoAtc` varchar(255);--> statement-breakpoint
ALTER TABLE `fichas_avaliacao` ADD CONSTRAINT `fichas_avaliacao_avaliadoId_users_id_fk` FOREIGN KEY (`avaliadoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fichas_avaliacao` ADD CONSTRAINT `fichas_avaliacao_avaliadorId_users_id_fk` FOREIGN KEY (`avaliadorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `fichas_avaliacao` ADD CONSTRAINT `fichas_avaliacao_chefeOrgaoId_users_id_fk` FOREIGN KEY (`chefeOrgaoId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_alteracoes` ADD CONSTRAINT `historico_alteracoes_fichaId_fichas_avaliacao_id_fk` FOREIGN KEY (`fichaId`) REFERENCES `fichas_avaliacao`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `historico_alteracoes` ADD CONSTRAINT `historico_alteracoes_usuarioId_users_id_fk` FOREIGN KEY (`usuarioId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `itens_avaliacao` ADD CONSTRAINT `itens_avaliacao_fichaId_fichas_avaliacao_id_fk` FOREIGN KEY (`fichaId`) REFERENCES `fichas_avaliacao`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `relatorios` ADD CONSTRAINT `relatorios_criadoPorId_users_id_fk` FOREIGN KEY (`criadoPorId`) REFERENCES `users`(`id`) ON DELETE no action ON UPDATE no action;