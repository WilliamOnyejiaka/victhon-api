import { MigrationInterface, QueryRunner } from "typeorm";

export class CreatedSettingsTable1768827842648 implements MigrationInterface {
    name = 'CreatedSettingsTable1768827842648'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`settings\` (
                \`id\` varchar(36) NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`bookingRequestsEnabled\` tinyint NOT NULL DEFAULT 1,
                \`newMessagesEnabled\` tinyint NOT NULL DEFAULT 1,
                \`paymentReceivedEnabled\` tinyint NOT NULL DEFAULT 1,
                \`customerReviewsEnabled\` tinyint NOT NULL DEFAULT 1,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_16862a22c10bbe05d3064582e5\` (\`professionalId\`),
                UNIQUE INDEX \`REL_16862a22c10bbe05d3064582e5\` (\`professionalId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
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
                    'disputed',
                    'new_review'
                ) NOT NULL DEFAULT 'system'
        `);
        await queryRunner.query(`
            ALTER TABLE \`settings\`
            ADD CONSTRAINT \`FK_16862a22c10bbe05d3064582e5e\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`settings\` DROP FOREIGN KEY \`FK_16862a22c10bbe05d3064582e5e\`
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
        await queryRunner.query(`
            DROP INDEX \`REL_16862a22c10bbe05d3064582e5\` ON \`settings\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_16862a22c10bbe05d3064582e5\` ON \`settings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`settings\`
        `);
    }

}
