import { MigrationInterface, QueryRunner } from "typeorm";

export class SchedulesTable1765815109851 implements MigrationInterface {
    name = 'SchedulesTable1765815109851'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE \`professional_schedules\` (
                \`id\` varchar(36) NOT NULL,
                \`professionalId\` varchar(255) NOT NULL,
                \`dayOfWeek\` enum (
                    'monday',
                    'tuesday',
                    'wednesday',
                    'thursday',
                    'friday',
                    'saturday',
                    'sunday'
                ) NOT NULL,
                \`startTime\` time(3) NOT NULL,
                \`endTime\` time(3) NOT NULL,
                \`validFrom\` date NULL,
                \`validUntil\` date NULL,
                \`isActive\` tinyint NOT NULL DEFAULT 1,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`professional_schedules\`
            ADD CONSTRAINT \`FK_29ac59be03f89803950e76fdffb\` FOREIGN KEY (\`professionalId\`) REFERENCES \`professionals\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            ALTER TABLE \`professional_schedules\` DROP FOREIGN KEY \`FK_29ac59be03f89803950e76fdffb\`
        `);
        await queryRunner.query(`
            DROP TABLE \`professional_schedules\`
        `);
    }

}
