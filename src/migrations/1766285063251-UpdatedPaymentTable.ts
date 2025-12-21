import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPaymentTable1766285063251 implements MigrationInterface {
    name = 'UpdatedPaymentTable1766285063251'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`notifications\` CHANGE \`type\` \`type\` enum (
                    'system',
                    'booking',
                    'acceptedBooking',
                    'rejectedBooking',
                    'viewProfile',
                    'bookingPayment'
                ) NOT NULL DEFAULT 'system'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`notifications\` CHANGE \`type\` \`type\` enum (
                    'system',
                    'booking',
                    'acceptedBooking',
                    'rejectedBooking',
                    'viewProfile'
                ) NOT NULL DEFAULT 'system'
        `);
    }

}
