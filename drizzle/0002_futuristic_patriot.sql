CREATE TABLE `itens_avaliacao_padrao` (
	`id` int AUTO_INCREMENT NOT NULL,
	`anexoC` varchar(255) NOT NULL,
	`oi` varchar(255) NOT NULL,
	`referencia` varchar(100),
	`distribuicao` text,
	`ativo` int DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `itens_avaliacao_padrao_id` PRIMARY KEY(`id`)
);
