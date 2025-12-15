import { MigrationInterface, QueryRunner } from "typeorm";

export class AcountsTableUpdate1765809581438 implements MigrationInterface {
    name = 'AcountsTableUpdate1765809581438'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP INDEX \`IDX_2db43cdbf7bb862e577b5f540c\` ON \`accounts\`
        `);
        await queryRunner.query(`
            DROP INDEX \`IDX_c57d6a982eeaa1d115687b17b6\` ON \`accounts\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\` CHANGE \`accountNumber\` \`accountNumber\` varchar(20) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\` CHANGE \`bankName\` \`bankName\` text NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`accounts\` CHANGE \`bankName\` \`bankName\` text NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\` CHANGE \`accountNumber\` \`accountNumber\` varchar(20) NULL
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_c57d6a982eeaa1d115687b17b6\` ON \`accounts\` (\`accountNumber\`)
        `);
        await queryRunner.query(`
            CREATE UNIQUE INDEX \`IDX_2db43cdbf7bb862e577b5f540c\` ON \`accounts\` (\`name\`)
        `);
    }

}
