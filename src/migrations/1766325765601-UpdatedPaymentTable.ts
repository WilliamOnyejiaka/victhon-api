import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedPaymentTable1766325765601 implements MigrationInterface {
    name = 'UpdatedPaymentTable1766325765601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD \`walletId\` varchar(255) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\`
            ADD CONSTRAINT \`FK_a88f466d39796d3081cf96e1b66\` FOREIGN KEY (\`walletId\`) REFERENCES \`wallets\`(\`id\`) ON DELETE
            SET NULL ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP FOREIGN KEY \`FK_a88f466d39796d3081cf96e1b66\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`transactions\` DROP COLUMN \`walletId\`
        `);
    }

}
