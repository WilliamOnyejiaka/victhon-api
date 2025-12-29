import { MigrationInterface, QueryRunner } from "typeorm";

export class DisputeTable1766965426744 implements MigrationInterface {
    name = 'DisputeTable1766965426744'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`dispute\` (
                \`id\` varchar(36) NOT NULL,
                \`status\` enum ('OPEN', 'WON', 'LOST') NOT NULL DEFAULT 'OPEN',
                \`reason\` text NOT NULL,
                \`transactionId\` varchar(255) NOT NULL,
                \`amount\` decimal(10, 2) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD \`disputeId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD \`disputesId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`dispute\`
            ADD CONSTRAINT \`FK_b39db61c34f120c9118eb85843b\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transactions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_b1630a0b9be02ae4be5dff17821\` FOREIGN KEY (\`disputesId\`) REFERENCES \`dispute\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_b1630a0b9be02ae4be5dff17821\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`dispute\` DROP FOREIGN KEY \`FK_b39db61c34f120c9118eb85843b\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP COLUMN \`disputesId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP COLUMN \`disputeId\`
        `);
        await queryRunner.query(`
            DROP TABLE \`dispute\`
        `);
    }

}
