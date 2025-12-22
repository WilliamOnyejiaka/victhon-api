import { MigrationInterface, QueryRunner } from "typeorm";

export class Tables1766364046194 implements MigrationInterface {
    name = 'Tables1766364046194'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`accounts\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(50) NOT NULL,
                \`accountNumber\` varchar(20) NOT NULL,
                \`bankName\` text NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`professional_schedules\` (
                \`id\` varchar(36) NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`dayOfWeek\` enum (
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday'
                ) NOT NULL,
                \`startTime\` time(3) NOT NULL,
                \`endTime\` time(3) NOT NULL,
                \`validFrom\` date NULL,
                \`validUntil\` date NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`rating_aggregates\` (
                \`id\` varchar(36) NOT NULL,
                \`total\` int NOT NULL,
                \`average\` float NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`ratingDistribution\` json NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_74119d07cd580166b2840e2a32\` (\`professionalId\`),
                UNIQUE INDEX \`REL_74119d07cd580166b2840e2a32\` (\`professionalId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`services\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(50) NOT NULL,
                \`category\` varchar(80) NOT NULL,
                \`description\` varchar(80) NOT NULL,
                \`price\` decimal(10, 2) NOT NULL,
                \`hourlyPrice\` decimal(10, 2) NULL,
                \`address\` varchar(100) NULL,
                \`remoteLocationService\` tinyint NOT NULL,
                \`onsiteLocationService\` tinyint NOT NULL,
                \`storeLocationService\` tinyint NOT NULL,
                \`images\` json NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bookings\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(255) NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`address\` varchar(100) NULL,
                \`start_datetime\` datetime(3) NOT NULL,
                \`end_datetime\` datetime(3) NOT NULL,
                \`status\` enum (
                    'pending',
                    'accepted',
                    'completed',
                    'cancelled',
                    'rejected',
                    'review'
                ) NOT NULL DEFAULT 'pending',
                \`cancelledBy\` enum ('admin', 'user', 'professional') NULL,
                \`amount\` decimal(10, 2) NOT NULL,
                \`notes\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`escrowId\` varchar(36) NULL,
                UNIQUE INDEX \`REL_7417580a12cba8c1266e6da497\` (\`escrowId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`escrows\` (
                \`id\` varchar(36) NOT NULL,
                \`amount\` decimal(12, 2) NOT NULL,
                \`status\` enum (
                    'pending',
                    'paymentInitiated',
                    'paid',
                    'released',
                    'disputed',
                    'cancelled'
                ) NOT NULL DEFAULT 'pending',
                \`refundStatus\` enum (
                    'none',
                    'pending',
                    'processing',
                    'success',
                    'failed'
                ) NOT NULL DEFAULT 'none',
                \`description\` text NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
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
                    'escrow_release',
                    'refund'
                ) NOT NULL,
                \`amount\` decimal(12, 2) NOT NULL,
                \`status\` enum ('pending', 'success', 'failed') NOT NULL DEFAULT 'pending',
                \`escrowId\` varchar(255) NULL,
                \`walletId\` varchar(255) NULL,
                \`reference\` varchar(255) NULL,
                \`accessCode\` varchar(255) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(50) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`password\` text NOT NULL,
                \`firstName\` varchar(50) NOT NULL,
                \`lastName\` varchar(50) NOT NULL,
                \`profilePicture\` json NULL,
                \`authProvider\` enum ('local', 'google') NOT NULL DEFAULT 'local',
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`isVerified\` tinyint NOT NULL DEFAULT 0,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_97672ac88f789774dd47f7c8be\` (\`email\`),
                UNIQUE INDEX \`IDX_a000cca60bcf04454e72769949\` (\`phone\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`reviews\` (
                \`id\` varchar(36) NOT NULL,
                \`text\` text NOT NULL,
                \`rating\` int NOT NULL,
                \`userId\` varchar(255) NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_35ce779138dffa8d6b6db61948\` (\`userId\`, \`professionalId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`professionals\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(50) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`password\` text NOT NULL,
                \`firstName\` varchar(50) NULL,
                \`lastName\` varchar(50) NULL,
                \`country\` varchar(50) NULL,
                \`state\` varchar(80) NULL,
                \`profilePicture\` json NULL,
                \`bio\` varchar(100) NULL,
                \`skills\` json NULL,
                \`authProvider\` enum ('local', 'google') NOT NULL DEFAULT 'local',
                \`location\` geometry NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`isVerified\` tinyint NOT NULL DEFAULT 0,
                \`availability\` tinyint NOT NULL DEFAULT 1,
                \`baseCity\` varchar(100) NULL,
                \`currentAddress\` varchar(100) NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                SPATIAL INDEX \`IDX_038bd3ddb3d48bc1712e638701\` (\`location\`),
                UNIQUE INDEX \`IDX_abe951107d83dd7866cfc4907b\` (\`email\`),
                UNIQUE INDEX \`IDX_6246417d8a589d0923d15f71cb\` (\`phone\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`wallets\` (
                \`id\` varchar(36) NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`balance\` decimal(12, 2) NOT NULL,
                \`pendingAmount\` decimal(12, 2) NOT NULL,
                \`totalBalance\` decimal(12, 2) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_6594bc25d67de3ed94c800dd02\` (\`professionalId\`),
                UNIQUE INDEX \`REL_6594bc25d67de3ed94c800dd02\` (\`professionalId\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`outboxes\` (
                \`id\` varchar(36) NOT NULL,
                \`queueName\` varchar(100) NOT NULL,
                \`eventType\` varchar(100) NOT NULL,
                \`payload\` json NOT NULL,
                \`status\` enum ('published', 'failed') NOT NULL DEFAULT 'failed',
                \`retries\` int NOT NULL DEFAULT '0',
                \`processedAt\` timestamp NULL,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                INDEX \`IDX_6d75262a11e0a5dc049aed4283\` (\`processedAt\`),
                INDEX \`IDX_168a3d370ffeb8fac000ef3cc6\` (\`status\`),
                INDEX \`IDX_f1682dcb78d8e31d5df1159310\` (\`eventType\`),
                INDEX \`IDX_c82815678114ce35409c98aa62\` (\`queueName\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`notifications\` (
                \`id\` varchar(36) NOT NULL,
                \`userId\` varchar(255) NULL,
                \`professionalId\` varchar(255) NULL,
                \`userType\` enum ('admin', 'user', 'professional') NOT NULL,
                \`type\` enum (
                    'system',
                    'booking',
                    'acceptedBooking',
                    'rejectedBooking',
                    'viewProfile',
                    'bookingPayment',
                    'escrow_release',
                    'review_booking',
                    'cancelBooking'
                ) NOT NULL DEFAULT 'system',
                \`data\` json NOT NULL,
                \`status\` enum ('pending', 'sent', 'failed') NOT NULL DEFAULT 'pending',
                \`isRead\` tinyint NOT NULL DEFAULT 0,
                \`readAt\` timestamp NULL,
                \`priority\` enum ('normal', 'high', 'urgent') NOT NULL DEFAULT 'normal',
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                INDEX \`IDX_92f5d3a7779be163cbea7916c6\` (\`status\`),
                INDEX \`IDX_8ba28344602d583583b9ea1a50\` (\`isRead\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            CREATE TABLE \`bookings_services_services\` (
                \`bookingsId\` varchar(36) NOT NULL,
                \`servicesId\` varchar(36) NOT NULL,
                INDEX \`IDX_f3ea2c118eef526a45f8943d80\` (\`bookingsId\`),
                INDEX \`IDX_7f96452baaaf9137c413016c04\` (\`servicesId\`),
                PRIMARY KEY (\`bookingsId\`, \`servicesId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\`
            ADD CONSTRAINT \`FK_4b293e2f42cac5f27f84b18c664\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`professional_schedules\`
            ADD CONSTRAINT \`FK_29ac59be03f89803950e76fdffb\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`rating_aggregates\`
            ADD CONSTRAINT \`FK_74119d07cd580166b2840e2a322\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`services\`
            ADD CONSTRAINT \`FK_02bf3a77a961fa345e848beb093\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD CONSTRAINT \`FK_38a69a58a323647f2e75eb994de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD CONSTRAINT \`FK_2b528b862fd94d290bda8d83e1c\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD CONSTRAINT \`FK_7417580a12cba8c1266e6da4978\` FOREIGN KEY (\`escrowId\`) REFERENCES \`escrows\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
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
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_a88f466d39796d3081cf96e1b66\` FOREIGN KEY (\`walletId\`) REFERENCES \`wallets\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`reviews\`
            ADD CONSTRAINT \`FK_7ed5659e7139fc8bc039198cc1f\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`reviews\`
            ADD CONSTRAINT \`FK_4f67c9296d687e0f144a961cf46\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\`
            ADD CONSTRAINT \`FK_6594bc25d67de3ed94c800dd02c\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_692a909ee0fa9383e7859f9b406\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\`
            ADD CONSTRAINT \`FK_188c1cf1fddb9a4822741de5d6d\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings_services_services\`
            ADD CONSTRAINT \`FK_f3ea2c118eef526a45f8943d808\` FOREIGN KEY (\`bookingsId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings_services_services\`
            ADD CONSTRAINT \`FK_7f96452baaaf9137c413016c044\` FOREIGN KEY (\`servicesId\`) REFERENCES \`services\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings_services_services\` DROP FOREIGN KEY \`FK_7f96452baaaf9137c413016c044\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings_services_services\` DROP FOREIGN KEY \`FK_f3ea2c118eef526a45f8943d808\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_188c1cf1fddb9a4822741de5d6d\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`notifications\` DROP FOREIGN KEY \`FK_692a909ee0fa9383e7859f9b406\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`wallets\` DROP FOREIGN KEY \`FK_6594bc25d67de3ed94c800dd02c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_4f67c9296d687e0f144a961cf46\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_7ed5659e7139fc8bc039198cc1f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_a88f466d39796d3081cf96e1b66\`
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
            ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_7417580a12cba8c1266e6da4978\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_2b528b862fd94d290bda8d83e1c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_38a69a58a323647f2e75eb994de\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`services\` DROP FOREIGN KEY \`FK_02bf3a77a961fa345e848beb093\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`rating_aggregates\` DROP FOREIGN KEY \`FK_74119d07cd580166b2840e2a322\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`professional_schedules\` DROP FOREIGN KEY \`FK_29ac59be03f89803950e76fdffb\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_4b293e2f42cac5f27f84b18c664\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_7f96452baaaf9137c413016c04\` ON \`bookings_services_services\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_f3ea2c118eef526a45f8943d80\` ON \`bookings_services_services\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookings_services_services\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_8ba28344602d583583b9ea1a50\` ON \`notifications\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_92f5d3a7779be163cbea7916c6\` ON \`notifications\`
        `);
        await queryRunner.query(`
            DROP TABLE \`notifications\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c82815678114ce35409c98aa62\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_f1682dcb78d8e31d5df1159310\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_168a3d370ffeb8fac000ef3cc6\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_6d75262a11e0a5dc049aed4283\` ON \`outboxes\`
        `);
        await queryRunner.query(`
            DROP TABLE \`outboxes\`
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
            DROP INDEX \`IDX_6246417d8a589d0923d15f71cb\` ON \`professionals\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_abe951107d83dd7866cfc4907b\` ON \`professionals\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_038bd3ddb3d48bc1712e638701\` ON \`professionals\`
        `);
        await queryRunner.query(`
            DROP TABLE \`professionals\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_35ce779138dffa8d6b6db61948\` ON \`reviews\`
        `);
        await queryRunner.query(`
            DROP TABLE \`reviews\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_a000cca60bcf04454e72769949\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_97672ac88f789774dd47f7c8be\` ON \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`users\`
        `);
        await queryRunner.query(`
            DROP TABLE \`transactions\`
        `);
        await queryRunner.query(`
            DROP TABLE \`escrows\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_7417580a12cba8c1266e6da497\` ON \`bookings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookings\`
        `);
        await queryRunner.query(`
            DROP TABLE \`services\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_74119d07cd580166b2840e2a32\` ON \`rating_aggregates\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_74119d07cd580166b2840e2a32\` ON \`rating_aggregates\`
        `);
        await queryRunner.query(`
            DROP TABLE \`rating_aggregates\`
        `);
        await queryRunner.query(`
            DROP TABLE \`professional_schedules\`
        `);
        await queryRunner.query(`
            DROP TABLE \`accounts\`
        `);
    }

}
