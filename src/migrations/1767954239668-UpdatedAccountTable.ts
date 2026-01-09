import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdatedAccountTable1767954239668 implements MigrationInterface {
    name = 'UpdatedAccountTable1767954239668'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`accounts\`
            ADD \`bankCode\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`messages\` CHANGE \`type\` \`type\` enum ('text', 'file') NOT NULL DEFAULT 'text'
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`messages\` CHANGE \`type\` \`type\` enum ('text', 'image', 'file') NOT NULL DEFAULT 'text'
        `);
        await queryRunner.query(`
            ALTER TABLE \`accounts\` DROP COLUMN \`bankCode\`
        `);
    }

}
