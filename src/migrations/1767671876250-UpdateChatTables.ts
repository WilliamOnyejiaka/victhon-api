import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767671876250 implements MigrationInterface {
    name = 'UpdateChatTables1767671876250'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` CHANGE \`thumbnail\` \`thumbnail\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` CHANGE \`duration\` \`duration\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` CHANGE \`duration\` \`duration\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` CHANGE \`thumbnail\` \`thumbnail\` text NOT NULL
        `);
    }

}
