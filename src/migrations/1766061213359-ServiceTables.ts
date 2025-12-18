import { MigrationInterface, QueryRunner } from "typeorm";

export class ServiceTables1766061213359 implements MigrationInterface {
    name = 'ServiceTables1766061213359'

    public async up(queryRunner: QueryRunner): Promise<void> {
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
                    'rejected',
                    'completed',
                    'cancelled'
                ) NOT NULL DEFAULT 'pending',
                \`paymentStatus\` enum ('pending', 'paid') NOT NULL DEFAULT 'pending',
                \`cancelledBy\` enum ('admin', 'user', 'professional') NOT NULL,
                \`amount\` decimal(10, 2) NOT NULL,
                \`notes\` text NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
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
            CREATE TABLE \`bookings_services_services\` (
                \`bookingsId\` varchar(36) NOT NULL,
                \`servicesId\` varchar(36) NOT NULL,
                INDEX \`IDX_f3ea2c118eef526a45f8943d80\` (\`bookingsId\`),
                INDEX \`IDX_7f96452baaaf9137c413016c04\` (\`servicesId\`),
                PRIMARY KEY (\`bookingsId\`, \`servicesId\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`rating_aggregates\`
            ADD CONSTRAINT \`FK_74119d07cd580166b2840e2a322\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE \`bookings\`
            ADD CONSTRAINT \`FK_38a69a58a323647f2e75eb994de\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD CONSTRAINT \`FK_2b528b862fd94d290bda8d83e1c\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
        await queryRunner.query(`
            ALTER TABLE \`services\`
            ADD CONSTRAINT \`FK_02bf3a77a961fa345e848beb093\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
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
            ALTER TABLE \`services\` DROP FOREIGN KEY \`FK_02bf3a77a961fa345e848beb093\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_2b528b862fd94d290bda8d83e1c\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_38a69a58a323647f2e75eb994de\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_4f67c9296d687e0f144a961cf46\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`reviews\` DROP FOREIGN KEY \`FK_7ed5659e7139fc8bc039198cc1f\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`rating_aggregates\` DROP FOREIGN KEY \`FK_74119d07cd580166b2840e2a322\`
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
            DROP TABLE \`services\`
        `);
        await queryRunner.query(`
            DROP TABLE \`bookings\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_35ce779138dffa8d6b6db61948\` ON \`reviews\`
        `);
        await queryRunner.query(`
            DROP TABLE \`reviews\`
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
    }

}
