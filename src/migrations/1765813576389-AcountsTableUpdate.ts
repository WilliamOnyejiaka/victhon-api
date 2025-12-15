import { MigrationInterface, QueryRunner } from "typeorm";

export class AcountsTableUpdate1765813576389 implements MigrationInterface {
    name = 'AcountsTableUpdate1765813576389'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`users\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(50) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`password\` text NULL,
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
            CREATE TABLE \`professionals\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(50) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`password\` text NULL,
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
            ALTER TABLE \`accounts\`
            ADD CONSTRAINT \`FK_4b293e2f42cac5f27f84b18c664\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`accounts\` DROP FOREIGN KEY \`FK_4b293e2f42cac5f27f84b18c664\`
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
            DROP TABLE \`accounts\`
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
    }

}
