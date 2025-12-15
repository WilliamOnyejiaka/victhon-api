import { MigrationInterface, QueryRunner } from "typeorm";

export class ProfesionalsTable1765800749922 implements MigrationInterface {
    name = 'ProfesionalsTable1765800749922'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`professionals\` (
                \`id\` varchar(36) NOT NULL,
                \`email\` varchar(50) NOT NULL,
                \`phone\` varchar(20) NULL,
                \`password\` text NULL,
                \`firstName\` varchar(50) NOT NULL,
                \`lastName\` varchar(50) NOT NULL,
                \`country\` varchar(50) NOT NULL,
                \`state\` varchar(80) NOT NULL,
                \`profilePicture\` json NULL,
                \`bio\` varchar(100) NULL,
                \`skills\` json NULL,
                \`authProvider\` enum ('local', 'google') NOT NULL DEFAULT 'local',
                \`location\` geometry NOT NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                \`isVerified\` tinyint NOT NULL DEFAULT 0,
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
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
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
    }

}
