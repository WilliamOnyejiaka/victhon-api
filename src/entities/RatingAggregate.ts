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

    @Column({ type: "int", nullable: false })
    total: number;

    @Column({ type: "float", nullable: false })
    average: number;

    @Column({ unique: true })
    professionalId: string;

    @OneToOne(() => Professional, pro => pro.ratingAggregate, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'professionalId' })
    professional: Professional;

    @Column({ type: "json" })
    ratingDistribution: any

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
