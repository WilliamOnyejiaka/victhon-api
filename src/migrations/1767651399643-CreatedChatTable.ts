import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedChatTable1767651399643 implements MigrationInterface {
    name = 'CreatedChatTable1767651399643'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_323bbc0f58f8ba19b77e95626e\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\` CHANGE \`senderId\` \`receiverId\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`chats\` DROP COLUMN \`title\`
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_e826d87cbe4a059e92bd67dc40\` ON \`inboxes\` (\`receiverId\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_e826d87cbe4a059e92bd67dc40\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chats\`
            ADD \`title\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\` CHANGE \`receiverId\` \`senderId\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_323bbc0f58f8ba19b77e95626e\` ON \`inboxes\` (\`senderId\`)
        `);
    }

}
