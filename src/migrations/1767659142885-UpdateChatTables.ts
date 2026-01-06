import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767659142885 implements MigrationInterface {
    name = 'UpdateChatTables1767659142885'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`messages\` CHANGE \`status\` \`status\` enum ('failed', 'delivered', 'pending', 'read') NOT NULL DEFAULT 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`messages\` CHANGE \`status\` \`status\` enum ('failed', 'delivered', 'pending', 'read') NOT NULL DEFAULT 'delivered'
        `);
    }

}
