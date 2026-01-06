import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767670361129 implements MigrationInterface {
    name = 'UpdateChatTables1767670361129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` DROP COLUMN \`publicId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`publicId\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_7a3bd5b0efb4a44cc288a4dc70\` ON \`message_attachments\` (\`publicId\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_7a3bd5b0efb4a44cc288a4dc70\` ON \`message_attachments\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\` DROP COLUMN \`publicId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`publicId\` text NOT NULL
        `);
    }

}
