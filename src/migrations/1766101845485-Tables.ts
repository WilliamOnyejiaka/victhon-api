import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1766101845485 implements MigrationInterface {
    name = 'Tables1766101845485'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`status\` \`status\` enum (
                    'pending',
                    'accepted',
                    'completed',
                    'cancelled',
                    'rejected'
                ) NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`cancelledBy\` \`cancelledBy\` enum ('admin', 'user', 'professional') NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`cancelledBy\` \`cancelledBy\` enum ('admin', 'user', 'professional') NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`status\` \`status\` enum ('pending', 'accepted', 'completed', 'cancelled') NOT NULL DEFAULT 'pending'
        `);
    }

}
