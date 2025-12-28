import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedUserTable1766952828810 implements MigrationInterface {
    name = 'UpdatedUserTable1766952828810'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`firstName\` \`firstName\` varchar(50) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`lastName\` \`lastName\` varchar(50) NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`lastName\` \`lastName\` varchar(50) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`users\` CHANGE \`firstName\` \`firstName\` varchar(50) NOT NULL
        `);
    }

}
