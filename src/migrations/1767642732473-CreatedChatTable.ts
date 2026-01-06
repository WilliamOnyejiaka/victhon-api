import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedChatTable1767642732473 implements MigrationInterface {
    name = 'CreatedChatTable1767642732473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`message_attachments\` (
                \`id\` varchar(36) NOT NULL,
                \`fileUrl\` varchar(255) NOT NULL,
                \`fileType\` varchar(255) NOT NULL,
                \`fileSize\` int NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`messageId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`inboxes\` (
                \`id\` varchar(36) NOT NULL,
                \`senderId\` varchar(255) NOT NULL,
                \`userType\` enum ('admin', 'user', 'professional') NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`IDX_323bbc0f58f8ba19b77e95626e\` (\`senderId\`),
                INDEX \`IDX_73d1fe433e58d93b2be5d37394\` (\`userType\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`messages\` (
                \`id\` varchar(36) NOT NULL,
                \`chatId\` varchar(255) NOT NULL,
                \`senderId\` varchar(255) NOT NULL,
                \`userType\` enum ('admin', 'user', 'professional') NOT NULL,
                \`content\` text NOT NULL,
                \`type\` enum ('text', 'image', 'file') NOT NULL DEFAULT 'text',
                \`status\` enum ('failed', 'delivered', 'pending', 'read') NOT NULL DEFAULT 'delivered',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`inboxId\` varchar(36) NULL,
                INDEX \`IDX_36bc604c820bb9adc4c75cd411\` (\`chatId\`),
                INDEX \`IDX_2db9cf2b3ca111742793f6c37c\` (\`senderId\`),
                INDEX \`IDX_67a5e6304dd71d8c2725c7c64e\` (\`userType\`),
                INDEX \`IDX_6ce6acdb0801254590f8a78c08\` (\`createdAt\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`chats\` (
                \`id\` varchar(36) NOT NULL,
                \`title\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`chat_participants\` (
                \`id\` varchar(36) NOT NULL,
                \`joinedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`chatId\` varchar(36) NULL,
                \`userId\` varchar(36) NULL,
                \`professionalId\` varchar(36) NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD CONSTRAINT \`FK_5b4f24737fcb6b35ffdd4d16e13\` FOREIGN KEY (\`messageId\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_36bc604c820bb9adc4c75cd4115\` FOREIGN KEY (\`chatId\`) REFERENCES \`chats\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_4da8fd46970fe8d74c7fbf03cd1\` FOREIGN KEY (\`inboxId\`) REFERENCES \`inboxes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_e16675fae83bc603f30ae8fbdd5\` FOREIGN KEY (\`chatId\`) REFERENCES \`chats\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_fb6add83b1a7acc94433d385692\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_aaa42f668dfd5de2226d27ebb7d\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_aaa42f668dfd5de2226d27ebb7d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_fb6add83b1a7acc94433d385692\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_e16675fae83bc603f30ae8fbdd5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_4da8fd46970fe8d74c7fbf03cd1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_36bc604c820bb9adc4c75cd4115\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` DROP FOREIGN KEY \`FK_5b4f24737fcb6b35ffdd4d16e13\`
        `);
        await queryRunner.query(`
            DROP TABLE \`chat_participants\`
        `);
        await queryRunner.query(`
            DROP TABLE \`chats\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6ce6acdb0801254590f8a78c08\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_67a5e6304dd71d8c2725c7c64e\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2db9cf2b3ca111742793f6c37c\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_36bc604c820bb9adc4c75cd411\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP TABLE \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_73d1fe433e58d93b2be5d37394\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_323bbc0f58f8ba19b77e95626e\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`inboxes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`message_attachments\`
        `);
    }

}
