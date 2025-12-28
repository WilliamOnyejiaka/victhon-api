import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedTransactionTable1766933510498 implements MigrationInterface {
    name = 'UpdatedTransactionTable1766933510498'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` CHANGE \`status\` \`status\` enum ('pending', 'success', 'failed', 'processing') NOT NULL DEFAULT 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` CHANGE \`status\` \`status\` enum ('pending', 'success', 'failed') NOT NULL DEFAULT 'pending'
        `);
    }

}
