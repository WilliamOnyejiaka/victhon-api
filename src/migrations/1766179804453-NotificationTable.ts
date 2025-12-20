import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationTable1766179804453 implements MigrationInterface {
    name = 'NotificationTable1766179804453'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`professionals\` CHANGE \`password\` \`password\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`password\` \`password\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`password\` \`password\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`professionals\` CHANGE \`password\` \`password\` text NULL
        `);
    }

}
