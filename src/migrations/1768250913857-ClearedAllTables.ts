import { MigrationInterface, QueryRunner } from "typeorm";

export class ClearedAllTables1768250913857 implements MigrationInterface {
    name = 'ClearedAllTables1768250913857'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`services\` DROP COLUMN \`description\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`services\`
            ADD \`description\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`services\` DROP COLUMN \`description\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`services\`
            ADD \`description\` varchar(80) NOT NULL
        `);
    }

}
