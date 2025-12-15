import { MigrationInterface, QueryRunner } from "typeorm";

export class AcountsTableUpdate1765812956443 implements MigrationInterface {
    name = 'AcountsTableUpdate1765812956443'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`professionals\` CHANGE \`firstName\` \`firstName\` varchar(50) NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE \`professionals\` CHANGE \`lastName\` \`lastName\` varchar(50) NULL DEFAULT ''
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`professionals\` CHANGE \`lastName\` \`lastName\` varchar(50) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`professionals\` CHANGE \`firstName\` \`firstName\` varchar(50) NULL
        `);
    }

}
