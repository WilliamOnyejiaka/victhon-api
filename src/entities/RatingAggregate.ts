import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    JoinColumn,
    OneToOne,
} from "typeorm";
import { Review } from "./Review";
import { Professional } from "./Professional";


@Entity({ name: "rating_aggregates" })
export class RatingAggregate {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true })
    professionalId: string;

    @OneToOne(() => Professional, pro => pro.ratingAggregate, {
        onDelete: "CASCADE",
    })
    @JoinColumn({ name: "professionalId" })
    professional: Professional;

    @Column({ type: "int", default: 0 })
    total: number;

    @Column({ type: "int", default: 0 })
    ratingSum: number; // ⭐ REQUIRED

    @Column({ type: "decimal", precision: 3, scale: 2, default: 0 })
    average: number;

    @Column({
        type: "json"
    })
    ratingDistribution: {
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}