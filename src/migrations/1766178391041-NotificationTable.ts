import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationTable1766178391041 implements MigrationInterface {
    name = 'NotificationTable1766178391041'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD \`userType\` enum ('admin', 'user', 'professional') NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP COLUMN \`userType\`
        `);
    }

}
