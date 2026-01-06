import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767671065853 implements MigrationInterface {
    name = 'UpdateChatTables1767671065853'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`thumbnail\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`duration\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` DROP COLUMN \`duration\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` DROP COLUMN \`thumbnail\`
        `);
    }

}
