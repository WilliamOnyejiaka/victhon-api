import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPaymentTable1766330365022 implements MigrationInterface {
    name = 'UpdatedPaymentTable1766330365022'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`notifications\` CHANGE \`type\` \`type\` enum (
                    'system',
                    'booking',
                    'acceptedBooking',
                    'rejectedBooking',
                    'viewProfile',
                    'bookingPayment',
                    'escrow_release'
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
                    'viewProfile',
                    'bookingPayment'
                ) NOT NULL DEFAULT 'system'
        `);
    }

}
