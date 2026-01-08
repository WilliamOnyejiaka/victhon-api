import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedChatParticipantTable1767783547917 implements MigrationInterface {
    name = 'UpdatedChatParticipantTable1767783547917'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD \`lastReadAt\` timestamp NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_aaa42f668dfd5de2226d27ebb7d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_fb6add83b1a7acc94433d385692\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP COLUMN \`professionalId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD \`professionalId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP COLUMN \`userId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD \`userId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_fb6add83b1a7acc94433d385692\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_aaa42f668dfd5de2226d27ebb7d\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_aaa42f668dfd5de2226d27ebb7d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP FOREIGN KEY \`FK_fb6add83b1a7acc94433d385692\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP COLUMN \`userId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD \`userId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP COLUMN \`professionalId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD \`professionalId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_fb6add83b1a7acc94433d385692\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\`
            ADD CONSTRAINT \`FK_aaa42f668dfd5de2226d27ebb7d\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`chat_participants\` DROP COLUMN \`lastReadAt\`
        `);
    }

}
