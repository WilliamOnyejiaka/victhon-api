import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPaymentTable1766287084411 implements MigrationInterface {
    name = 'UpdatedPaymentTable1766287084411'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`escrows\`
            ADD \`refundStatus\` enum (
                    'none',
                    'pending',
                    'processing',
                    'success',
                    'failed'
                ) NOT NULL DEFAULT 'none'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`escrows\` DROP COLUMN \`refundStatus\`
        `);
    }

}
