import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfesionalsTableUpdate1765801799577 implements MigrationInterface {
    name = 'ProfesionalsTableUpdate1765801799577'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`professionals\`
            ADD \`availability\` tinyint NOT NULL DEFAULT 1
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`professionals\` DROP COLUMN \`availability\`
        `);
    }

}
