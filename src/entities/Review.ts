import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    Unique,
    OneToMany,
} from "typeorm";
import { Professional } from "./Professional";
import { User } from "./User";
import { RatingAggregate } from "./RatingAggregate";

@Entity({ name: "reviews" })
@Unique(['userId', 'professionalId'])
export class Review {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "text", nullable: false })
    text: string;

    @Column({ type: "int", nullable: false })
    rating: number;

    @Column()
    userId: string;

    @ManyToOne(
        () => User,
        (profile) => profile.reviews,
        { onDelete: "CASCADE" }
    )
    user: User;

    @Column()
    professionalId: string;

    @ManyToOne(
        () => Professional,
        (profile) => profile.reviews,
        { onDelete: "CASCADE" }
    )
    professional: Professional;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
