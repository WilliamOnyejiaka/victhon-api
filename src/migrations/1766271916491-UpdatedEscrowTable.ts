import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedEscrowTable1766271916491 implements MigrationInterface {
    name = 'UpdatedEscrowTable1766271916491'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`escrows\` DROP FOREIGN KEY \`FK_0ebf28dc71d93c52da188f3138e\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_0ebf28dc71d93c52da188f3138\` ON \`escrows\`
        `);
        await queryRunner.query(`
            DROP INDEX \`REL_0ebf28dc71d93c52da188f3138\` ON \`escrows\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`escrows\` DROP COLUMN \`bookingId\`
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`escrows\`
            ADD \`bookingId\` varchar(36) NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`REL_0ebf28dc71d93c52da188f3138\` ON \`escrows\` (\`bookingId\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_0ebf28dc71d93c52da188f3138\` ON \`escrows\` (\`bookingId\`)
        `);
        await queryRunner.query(`
            ALTER TABLE \`escrows\`
            ADD CONSTRAINT \`FK_0ebf28dc71d93c52da188f3138e\` FOREIGN KEY (\`bookingId\`) REFERENCES \`bookings\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

}
