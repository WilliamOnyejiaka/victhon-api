import { MigrationInterface, QueryRunner } from "typeorm";

export class DisputeTable1766965771970 implements MigrationInterface {
    name = 'DisputeTable1766965771970'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_b1630a0b9be02ae4be5dff17821\`
        `);
        await queryRunner.query(`
            CREATE TABLE \`disputes\` (
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
            ALTER TABLE \`disputes\`
            ADD CONSTRAINT \`FK_9661150a3f25a5c44c891af56fe\` FOREIGN KEY (\`transactionId\`) REFERENCES \`transactions\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_b1630a0b9be02ae4be5dff17821\` FOREIGN KEY (\`disputesId\`) REFERENCES \`disputes\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_b1630a0b9be02ae4be5dff17821\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`disputes\` DROP FOREIGN KEY \`FK_9661150a3f25a5c44c891af56fe\`
        `);
        await queryRunner.query(`
            DROP TABLE \`disputes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_b1630a0b9be02ae4be5dff17821\` FOREIGN KEY (\`disputesId\`) REFERENCES \`dispute\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

}
