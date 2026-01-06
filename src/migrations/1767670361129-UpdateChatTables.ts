import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767670361129 implements MigrationInterface {
    name = 'UpdateChatTables1767670361129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop the column only if it exists
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            DROP COLUMN IF EXISTS \`publicId\`
        `);

        // Add the column as varchar(255)
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`publicId\` varchar(255) NOT NULL
        `);

        // Create index (TypeORM/MySQL automatically avoids duplicates)
        await queryRunner.query(`
            CREATE INDEX IF NOT EXISTS \`IDX_7a3bd5b0efb4a44cc288a4dc70\`
            ON \`message_attachments\` (\`publicId\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index only if it exists
        await queryRunner.query(`
            DROP INDEX IF EXISTS \`IDX_7a3bd5b0efb4a44cc288a4dc70\` ON \`message_attachments\`
        `);

        // Drop column only if it exists
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            DROP COLUMN IF EXISTS \`publicId\`
        `);

        // Re-add old column as text
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`publicId\` text NOT NULL
        `);
    }
}
