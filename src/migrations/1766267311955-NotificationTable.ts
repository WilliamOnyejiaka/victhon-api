import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationTable1766267311955 implements MigrationInterface {
    name = 'NotificationTable1766267311955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`escrows\` DROP FOREIGN KEY \`FK_0ebf28dc71d93c52da188f3138e\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`paymentStatus\` \`escrowId\` enum ('pending', 'paid') NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP COLUMN \`escrowId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD \`escrowId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD UNIQUE INDEX \`IDX_7417580a12cba8c1266e6da497\` (\`escrowId\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_7417580a12cba8c1266e6da497\` ON \`bookings\` (\`escrowId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD CONSTRAINT \`FK_7417580a12cba8c1266e6da4978\` FOREIGN KEY (\`escrowId\`) REFERENCES \`escrows\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP FOREIGN KEY \`FK_7417580a12cba8c1266e6da4978\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_7417580a12cba8c1266e6da497\` ON \`bookings\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP INDEX \`IDX_7417580a12cba8c1266e6da497\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` DROP COLUMN \`escrowId\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\`
            ADD \`escrowId\` enum ('pending', 'paid') NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE \`bookings\` CHANGE \`escrowId\` \`paymentStatus\` enum ('pending', 'paid') NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            ALTER TABLE \`escrows\`
            ADD CONSTRAINT \`FK_0ebf28dc71d93c52da188f3138e\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION
        `);
    }

}
