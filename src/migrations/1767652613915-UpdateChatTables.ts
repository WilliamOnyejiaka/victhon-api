import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateChatTables1767652613915 implements MigrationInterface {
    name = 'UpdateChatTables1767652613915'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_4da8fd46970fe8d74c7fbf03cd1\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_73d1fe433e58d93b2be5d37394\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\` DROP COLUMN \`userType\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\`
            ADD \`receiverType\` enum ('admin', 'user', 'professional') NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\`
            ADD \`messageId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_fa060cd058e633ceee99a61875\` ON \`inboxes\` (\`receiverType\`)
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_cda2ba168abbba06efc28e0459\` ON \`inboxes\` (\`receiverId\`, \`receiverType\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\`
            ADD CONSTRAINT \`FK_d7f66af789ed9e286e4c0e14ebd\` FOREIGN KEY (\`messageId\`) REFERENCES \`messages\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_4da8fd46970fe8d74c7fbf03cd1\` FOREIGN KEY (\`inboxId\`) REFERENCES \`inboxes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`messages\` DROP FOREIGN KEY \`FK_4da8fd46970fe8d74c7fbf03cd1\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\` DROP FOREIGN KEY \`FK_d7f66af789ed9e286e4c0e14ebd\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_cda2ba168abbba06efc28e0459\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_fa060cd058e633ceee99a61875\` ON \`inboxes\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\` DROP COLUMN \`messageId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\` DROP COLUMN \`receiverType\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`inboxes\`
            ADD \`userType\` enum ('admin', 'user', 'professional') NOT NULL
        `);
        await queryRunner.query(`
            CREATE INDEX \`IDX_73d1fe433e58d93b2be5d37394\` ON \`inboxes\` (\`userType\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\`
            ADD CONSTRAINT \`FK_4da8fd46970fe8d74c7fbf03cd1\` FOREIGN KEY (\`inboxId\`) REFERENCES \`inboxes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
