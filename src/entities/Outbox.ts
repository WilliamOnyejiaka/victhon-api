import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    Index,
} from "typeorm";

export enum OutboxStatus {
    PUBLISHED = "published",
    FAILED = "failed",
}

@Entity("outboxes")
@Index(["queueName"])
@Index(["eventType"])
@Index(["status"])
@Index(["processedAt"])
export class Outbox {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 100 })
    queueName: string;

    @Column({ type: "varchar", length: 100 })
    eventType: string;

    /**
     * JSON payload
     * - MySQL 5.7+ → JSON
     * - Postgres → JSONB
     */
    @Column({ type: "json" })
    payload: Record<string, any>;

    @Column({
        type: "enum",
        enum: OutboxStatus,
        default: OutboxStatus.FAILED,
    })
    status: OutboxStatus;

    @Column({ type: "int", default: 0 })
    retries: number;

    @Column({ type: "timestamp", nullable: true })
    processedAt?: Date;

    @CreateDateColumn({ type: "timestamp" })
    createdAt: Date;
}
