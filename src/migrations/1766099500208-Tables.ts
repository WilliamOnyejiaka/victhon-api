import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1766099500208 implements MigrationInterface {
    name = 'Tables1766099500208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`notes\` \`notes\` text NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`notes\` \`notes\` text NOT NULL
        `);
    }

}
