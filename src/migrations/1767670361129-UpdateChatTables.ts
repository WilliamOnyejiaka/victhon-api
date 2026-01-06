import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767670361129 implements MigrationInterface {
    name = 'UpdateChatTables1767670361129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Drop `publicId` column if it exists
        const columnExists = await queryRunner.hasColumn('message_attachments', 'publicId');
        if (columnExists) {
            await queryRunner.query(`
                ALTER TABLE \`message_attachments\` DROP COLUMN \`publicId\`
            `);
        }

        // Add new `publicId` column as varchar(255)
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`publicId\` varchar(255) NOT NULL
        `);

        // Create index only if it does not exist
        const indexResult = await queryRunner.query(`
            SHOW INDEX FROM \`message_attachments\` WHERE Key_name = 'IDX_7a3bd5b0efb4a44cc288a4dc70'
        `);

        if (indexResult.length === 0) {
            await queryRunner.query(`
                CREATE INDEX \`IDX_7a3bd5b0efb4a44cc288a4dc70\` 
                ON \`message_attachments\` (\`publicId\`)
            `);
        }
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop index if it exists
        const indexResult = await queryRunner.query(`
            SHOW INDEX FROM \`message_attachments\` WHERE Key_name = 'IDX_7a3bd5b0efb4a44cc288a4dc70'
        `);

        if (indexResult.length > 0) {
            await queryRunner.query(`
                DROP INDEX \`IDX_7a3bd5b0efb4a44cc288a4dc70\` ON \`message_attachments\`
            `);
        }

        // Drop `publicId` column if it exists
        const columnExists = await queryRunner.hasColumn('message_attachments', 'publicId');
        if (columnExists) {
            await queryRunner.query(`
                ALTER TABLE \`message_attachments\` DROP COLUMN \`publicId\`
            `);
        }

        // Re-add old `publicId` column as text
        await queryRunner.query(`
            ALTER TABLE \`message_attachments\`
            ADD \`publicId\` text NOT NULL
        `);
    }
}
