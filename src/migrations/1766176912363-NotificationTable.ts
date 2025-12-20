import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationTable1766176912363 implements MigrationInterface {
    name = 'NotificationTable1766176912363'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`outboxes\` (
                \`id\` varchar(36) NOT NULL,
                \`queueName\` varchar(100) NOT NULL,
                \`eventType\` varchar(100) NOT NULL,
                \`payload\` json NOT NULL,
                \`status\` enum ('published', 'failed') NOT NULL DEFAULT 'failed',
                \`retries\` int NOT NULL DEFAULT '0',
                \`processedAt\` timestamp NULL,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`IDX_6d75262a11e0a5dc049aed4283\` (\`processedAt\`),
                INDEX \`IDX_168a3d370ffeb8fac000ef3cc6\` (\`status\`),
                INDEX \`IDX_f1682dcb78d8e31d5df1159310\` (\`eventType\`),
                INDEX \`IDX_c82815678114ce35409c98aa62\` (\`queueName\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`notifications\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(255) NULL,
                \`professionalId\` varchar(255) NULL,
                \`type\` enum (
                    'system',
                    'booking',
                    'acceptedBooking',
                    'rejectedBooking',
                    'viewProfile'
                ) NOT NULL DEFAULT 'system',
                \`data\` json NOT NULL,
                \`status\` enum ('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
                \`isRead\` tinyint NOT NULL DEFAULT 0,
                \`readAt\` timestamp NULL,
                \`priority\` enum ('normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_92f5d3a7779be163cbea7916c6\` (\`status\`),
                INDEX \`IDX_8ba28344602d583583b9ea1a50\` (\`isRead\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_188c1cf1fddb9a4822741de5d6d\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_188c1cf1fddb9a4822741de5d6d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8ba28344602d583583b9ea1a50\` ON \`notifications\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_92f5d3a7779be163cbea7916c6\` ON \`notifications\`
        `);
        await queryRunner.query(`
            DROP TABLE \`notifications\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c82815678114ce35409c98aa62\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_f1682dcb78d8e31d5df1159310\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_168a3d370ffeb8fac000ef3cc6\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6d75262a11e0a5dc049aed4283\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`outboxes\`
        `);
    }

}
