import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedTransactionTable1766933589002 implements MigrationInterface {
    name = 'UpdatedTransactionTable1766933589002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_da87c55b3bbbe96c6ed88ea7ee\` ON \`transactions\` (\`status\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_e744417ceb0b530285c08f3865\` ON \`transactions\` (\`createdAt\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_e744417ceb0b530285c08f3865\` ON \`transactions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_da87c55b3bbbe96c6ed88ea7ee\` ON \`transactions\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP COLUMN \`updatedAt\`
        `);
    }

}
