import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAccountTable1767955874473 implements MigrationInterface {
    name = 'UpdatedAccountTable1767955874473'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`wallets\` CHANGE \`balance\` \`balance\` decimal(24, 2) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`wallets\` CHANGE \`balance\` \`balance\` decimal(12, 2) NOT NULL
        `);
    }

}
