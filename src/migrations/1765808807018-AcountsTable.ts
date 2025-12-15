import { MigrationInterface, QueryRunner } from "typeorm";

export class AcountsTable1765808807018 implements MigrationInterface {
    name = 'AcountsTable1765808807018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`accounts\` (
                \`id\` varchar(36) NOT NULL,
                \`name\` varchar(50) NOT NULL,
                \`accountNumber\` varchar(20) NULL,
                \`bankName\` text NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                UNIQUE INDEX \`IDX_2db43cdbf7bb862e577b5f540c\` (\`name\`),
                UNIQUE INDEX \`IDX_c57d6a982eeaa1d115687b17b6\` (\`accountNumber\`),
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\`
            ADD CONSTRAINT \`FK_4b293e2f42cac5f27f84b18c664\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_4b293e2f42cac5f27f84b18c664\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c57d6a982eeaa1d115687b17b6\` ON \`accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_2db43cdbf7bb862e577b5f540c\` ON \`accounts\`
        `);
        await queryRunner.query(`
            DROP TABLE \`accounts\`
        `);
    }

}
