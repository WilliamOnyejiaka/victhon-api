import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedEscrowTable1766268556557 implements MigrationInterface {
    name = 'UpdatedEscrowTable1766268556557'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_7417580a12cba8c1266e6da497\` ON \`bookings\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`escrows\` CHANGE \`status\` \`status\` enum (
                    'pending',
                    'paymentInitiated',
                    'paid',
                    'released',
                    'disputed',
                    'cancelled'
                ) NOT NULL DEFAULT 'pending'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`escrows\` CHANGE \`status\` \`status\` enum (
                    'pending',
                    'paid',
                    'released',
                    'disputed',
                    'cancelled'
                ) NOT NULL DEFAULT 'pending'
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_7417580a12cba8c1266e6da497\` ON \`bookings\` (\`escrowId\`)
        `);
    }

}
