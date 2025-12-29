import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateDisputeTable1767011391881 implements MigrationInterface {
    name = 'UpdateDisputeTable1767011391881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`status\` \`status\` enum (
                    'pending',
                    'accepted',
                    'completed',
                    'cancelled',
                    'rejected',
                    'review',
                    'disputed'
                ) NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` CHANGE \`type\` \`type\` enum (
                    'deposit',
                    'withdrawal',
                    'booking_deposit',
                    'escrow_release',
                    'refund',
                    'dispute'
                ) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` CHANGE \`type\` \`type\` enum (
                    'system',
                    'booking',
                    'acceptedBooking',
                    'rejectedBooking',
                    'viewProfile',
                    'bookingPayment',
                    'escrow_release',
                    'review_booking',
                    'cancelBooking',
                    'refundBooking',
                    'refundFailed',
                    'disputed'
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
                    'bookingPayment',
                    'escrow_release',
                    'review_booking',
                    'cancelBooking'
                ) NOT NULL DEFAULT 'system'
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` CHANGE \`type\` \`type\` enum (
                    'deposit',
                    'withdrawal',
                    'booking_deposit',
                    'escrow_release',
                    'refund'
                ) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`status\` \`status\` enum (
                    'pending',
                    'accepted',
                    'completed',
                    'cancelled',
                    'rejected',
                    'review'
                ) NOT NULL DEFAULT 'pending'
        `);
    }

}
