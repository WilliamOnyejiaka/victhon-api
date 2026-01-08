import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedChatParticipantTable1767783914593 implements MigrationInterface {
    name = 'UpdatedChatParticipantTable1767783914593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD \`unreadCount\` int NOT NULL DEFAULT '0'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP COLUMN \`unreadCount\`
        `);
    }

}
