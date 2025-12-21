import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPaymentTable1766327783078 implements MigrationInterface {
    name = 'UpdatedPaymentTable1766327783078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP COLUMN \`balance\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD \`balance\` decimal(12, 2) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP COLUMN \`pendingAmount\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD \`pendingAmount\` decimal(12, 2) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP COLUMN \`totalBalance\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD \`totalBalance\` decimal(12, 2) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP COLUMN \`totalBalance\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD \`totalBalance\` bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP COLUMN \`pendingAmount\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD \`pendingAmount\` bigint NOT NULL DEFAULT '0'
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP COLUMN \`balance\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD \`balance\` bigint NOT NULL DEFAULT '0'
        `);
    }

}
