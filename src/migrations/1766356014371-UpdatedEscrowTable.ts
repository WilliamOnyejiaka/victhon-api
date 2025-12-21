import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedEscrowTable1766356014371 implements MigrationInterface {
    name = 'UpdatedEscrowTable1766356014371'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` CHANGE \`type\` \`type\` enum (
                    'deposit',
                    'withdrawal',
                    'booking_deposit',
                    'escrow_release',
                    'refund'
                ) NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` CHANGE \`type\` \`type\` enum (
                    'deposit',
                    'withdrawal',
                    'booking_deposit',
                    'escrow_release'
                ) NOT NULL
        `);
    }

}
