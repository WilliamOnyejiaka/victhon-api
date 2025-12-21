import { MigrationInterface, QueryRunner } from "typeorm";

export class PaymentTables1766265514093 implements MigrationInterface {
    name = 'PaymentTables1766265514093'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`escrows\` (
                \`id\` varchar(36) NOT NULL,
                \`bookingId\` varchar(255) NOT NULL,
                \`amount\` decimal(12, 2) NOT NULL,
                \`status\` enum (
                    'pending',
                    'paid',
                    'released',
                    'disputed',
                    'cancelled'
                ) NOT NULL DEFAULT 'pending',
                \`description\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_0ebf28dc71d93c52da188f3138\` (\`bookingId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`transactions\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(255) NULL,
                \`professionalId\` varchar(255) NULL,
                \`type\` enum (
                    'deposit',
                    'withdrawal',
                    'booking_deposit',
                    'escrow_release'
                ) NOT NULL,
                \`amount\` decimal(12, 2) NOT NULL,
                \`status\` enum ('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
                \`escrowId\` varchar(255) NULL,
                \`reference\` varchar(255) NULL,
                \`accessCode\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`wallets\` (
                \`id\` varchar(36) NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`balance\` bigint NOT NULL DEFAULT '0',
                \`pendingAmount\` bigint NOT NULL DEFAULT '0',
                \`totalBalance\` bigint NOT NULL DEFAULT '0',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_6594bc25d67de3ed94c800dd02\` (\`professionalId\`),
                UNIQUE INDEX \`REL_6594bc25d67de3ed94c800dd02\` (\`professionalId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`escrows\`
            ADD CONSTRAINT \`FK_0ebf28dc71d93c52da188f3138e\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_6bb58f2b6e30cb51a6504599f41\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_2d61a57bcd6351e2325961f83d5\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_4288118d2b3d200a1a76ff483d9\` FOREIGN KEY (\`escrowId\`) REFERENCES \`escrows\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD CONSTRAINT \`FK_6594bc25d67de3ed94c800dd02c\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_6594bc25d67de3ed94c800dd02c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_4288118d2b3d200a1a76ff483d9\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_2d61a57bcd6351e2325961f83d5\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_6bb58f2b6e30cb51a6504599f41\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`escrows\` DROP FOREIGN KEY \`FK_0ebf28dc71d93c52da188f3138e\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_6594bc25d67de3ed94c800dd02\` ON \`wallets\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6594bc25d67de3ed94c800dd02\` ON \`wallets\`
        `);
        await queryRunner.query(`
            DROP TABLE \`wallets\`
        `);
        await queryRunner.query(`
            DROP TABLE \`transactions\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0ebf28dc71d93c52da188f3138\` ON \`escrows\`
        `);
        await queryRunner.query(`
            DROP TABLE \`escrows\`
        `);
    }

}
