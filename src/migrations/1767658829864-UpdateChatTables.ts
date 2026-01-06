import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767658829864 implements MigrationInterface {
    name = 'UpdateChatTables1767658829864'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_67a5e6304dd71d8c2725c7c64e\` ON \`messages\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP COLUMN \`userType\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD \`senderType\` enum ('admin', 'user', 'professional') NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD \`receiverId\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD \`receiverType\` enum ('admin', 'user', 'professional') NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_33c3c7eac434c7430b391e9278\` ON \`messages\` (\`senderType\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_acf951a58e3b9611dd96ce8904\` ON \`messages\` (\`receiverId\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_5d4a65355782093d1f726d335c\` ON \`messages\` (\`receiverType\`)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_5d4a65355782093d1f726d335c\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_acf951a58e3b9611dd96ce8904\` ON \`messages\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_33c3c7eac434c7430b391e9278\` ON \`messages\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP COLUMN \`receiverType\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP COLUMN \`receiverId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP COLUMN \`senderType\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD \`userType\` enum ('admin', 'user', 'professional') NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_67a5e6304dd71d8c2725c7c64e\` ON \`messages\` (\`userType\`)
        `);
    }

}
